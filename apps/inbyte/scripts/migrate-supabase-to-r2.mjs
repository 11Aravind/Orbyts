import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// 1. Read .env configuration
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
});

const R2_BUCKET = env.CLOUDFLARE_R2_BUCKET_NAME || 'innbite-images';
const R2_PUBLIC_URL = (env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/+$/, '');

// Ensure backups directory exists
const BACKUPS_DIR = path.resolve('backups');
if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

async function fetchWithRetry(url, retries = 3, delayMs = 1200) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url);
            if (res.ok) return res;
            if (attempt === retries) return res;
        } catch (err) {
            if (attempt === retries) throw err;
            await new Promise(r => setTimeout(r, delayMs * attempt));
        }
    }
}

async function uploadWithRetry(cmd, retries = 3, delayMs = 1200) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await s3Client.send(cmd);
        } catch (err) {
            if (attempt === retries) throw err;
            await new Promise(r => setTimeout(r, delayMs * attempt));
        }
    }
}

async function optimizeImageBuffer(inputBuffer, type = 'dish') {
    const isBanner = type === 'banner';
    const targetDim = isBanner ? 640 : 220;
    const maxBytes = isBanner ? (25 * 1024) : (6 * 1024); // 25KB for banner, ~6KB for dish/category/logo

    let quality = isBanner ? 75 : 70;
    let width = targetDim;
    let height = isBanner ? Math.round(targetDim * (9 / 16)) : targetDim;

    let webpBuffer = await sharp(inputBuffer)
        .resize(width, height, { fit: 'cover', position: 'center' })
        .webp({ quality, effort: 6 })
        .toBuffer();

    // Step down quality if exceeding budget
    while (webpBuffer.length > maxBytes && quality > 35) {
        quality -= 8;
        webpBuffer = await sharp(inputBuffer)
            .resize(width, height, { fit: 'cover', position: 'center' })
            .webp({ quality, effort: 6 })
            .toBuffer();
    }

    // Step down dimensions slightly if still exceeding budget
    if (webpBuffer.length > maxBytes && width > 160) {
        width = Math.round(width * 0.85);
        height = Math.round(height * 0.85);
        webpBuffer = await sharp(inputBuffer)
            .resize(width, height, { fit: 'cover', position: 'center' })
            .webp({ quality: Math.max(quality, 45), effort: 6 })
            .toBuffer();
    }

    return webpBuffer;
}

async function runMigration() {
    console.log('================================================================');
    console.log('🚀 SUPABASE TO CLOUDFLARE R2 RESUME-CAPABLE IMAGE MIGRATION');
    console.log('================================================================');
    console.log('Target R2 Bucket:', R2_BUCKET);
    console.log('Public CDN Base:', R2_PUBLIC_URL);

    // Step 0: Scan existing R2 objects to skip re-uploading
    console.log('\n[0/5] Scanning Cloudflare R2 bucket for existing images...');
    const existingR2Keys = new Set();
    try {
        let isTruncated = true;
        let continuationToken = undefined;
        while (isTruncated) {
            const listRes = await s3Client.send(new ListObjectsV2Command({
                Bucket: R2_BUCKET,
                ContinuationToken: continuationToken
            }));
            if (listRes.Contents) {
                listRes.Contents.forEach(obj => existingR2Keys.add(obj.Key));
            }
            isTruncated = listRes.IsTruncated || false;
            continuationToken = listRes.NextContinuationToken;
        }
        console.log(`✅ Discovered ${existingR2Keys.size} images already in Cloudflare R2 (will skip re-uploading).`);
    } catch (listErr) {
        console.warn('⚠️ Could not list existing objects:', listErr.message);
    }

    // Step 1: Read all current data from Supabase
    console.log('\n[1/5] Fetching current database records...');
    const [dishesRes, categoriesRes, bannersRes, settingsRes] = await Promise.all([
        supabase.from('dishes').select('id, name, images'),
        supabase.from('categories').select('id, name, image_url'),
        supabase.from('banners').select('id, title, image_url'),
        supabase.from('restaurant_settings').select('*')
    ]);

    const dishes = dishesRes.data || [];
    const categories = categoriesRes.data || [];
    const banners = bannersRes.data || [];
    const settings = settingsRes.data?.[0] || null;

    console.log(`Found: ${dishes.length} dishes, ${categories.length} categories, ${banners.length} banners, ${settings ? 1 : 0} settings.`);

    // Step 2: Save pre-migration backup snapshot
    const backupSnapshot = {
        timestamp: new Date().toISOString(),
        dishes,
        categories,
        banners,
        settings
    };
    const backupPath = path.join(BACKUPS_DIR, `images-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupSnapshot, null, 2), 'utf8');
    console.log(`\n[2/5] ✅ Created Pre-Migration Backup Snapshot at:`);
    console.log(`      ${backupPath}`);

    // Step 3: Identify unique Supabase Storage images to migrate
    const migrationQueue = []; // { sourceUrl, type, folder, id, name }

    // Dishes
    for (const d of dishes) {
        if (Array.isArray(d.images)) {
            for (let i = 0; i < d.images.length; i++) {
                const img = d.images[i];
                if (typeof img === 'string' && img.includes('/storage/v1/object/public/menu-images/')) {
                    migrationQueue.push({
                        sourceUrl: img,
                        type: 'dish',
                        folder: 'dishes',
                        entity: 'dish',
                        id: d.id,
                        index: i,
                        title: d.name
                    });
                }
            }
        }
    }

    // Categories
    for (const c of categories) {
        if (typeof c.image_url === 'string' && c.image_url.includes('/storage/v1/object/public/menu-images/')) {
            migrationQueue.push({
                sourceUrl: c.image_url,
                type: 'category',
                folder: 'categories',
                entity: 'category',
                id: c.id,
                title: c.name
            });
        }
    }

    // Banners
    for (const b of banners) {
        if (typeof b.image_url === 'string' && b.image_url.includes('/storage/v1/object/public/menu-images/')) {
            migrationQueue.push({
                sourceUrl: b.image_url,
                type: 'banner',
                folder: 'banners',
                entity: 'banner',
                id: b.id,
                title: b.title
            });
        }
    }

    // Settings Logo
    if (settings?.logo_url && typeof settings.logo_url === 'string' && settings.logo_url.includes('/storage/v1/object/public/menu-images/')) {
        migrationQueue.push({
            sourceUrl: settings.logo_url,
            type: 'logo',
            folder: 'logos',
            entity: 'setting',
            id: settings.restaurant_id || 'R001',
            title: 'Restaurant Logo'
        });
    }

    console.log(`\n[3/5] Identified ${migrationQueue.length} Supabase Storage images queued for migration.`);

    // Step 4: Process & Upload each image
    console.log('\n[4/5] Downloading, optimizing WebP (≤ 5KB-8KB), and uploading to Cloudflare R2...');

    const urlMapping = new Map(); // oldUrl -> newR2Url
    let totalOriginalBytes = 0;
    let totalOptimizedBytes = 0;
    let successCount = 0;
    let skippedCount = 0;
    let failCount = 0;

    for (let i = 0; i < migrationQueue.length; i++) {
        const item = migrationQueue[i];
        const progress = `[${i + 1}/${migrationQueue.length}]`;

        try {
            const baseName = path.basename(item.sourceUrl).replace(/\.[^.]+$/, '') || `${Date.now()}-${i}`;
            const r2Key = `${item.folder}/${baseName}.webp`;
            const newPublicUrl = `${R2_PUBLIC_URL}/${r2Key}`;

            // Check if already in map
            if (urlMapping.has(item.sourceUrl)) {
                continue;
            }

            // Check if already in Cloudflare R2
            if (existingR2Keys.has(r2Key)) {
                urlMapping.set(item.sourceUrl, newPublicUrl);
                skippedCount++;
                successCount++;
                console.log(`${progress} ⏩ Already in R2: ${item.title} -> ${r2Key}`);
                continue;
            }

            // Download from Supabase with retry
            const res = await fetchWithRetry(item.sourceUrl);
            if (!res || !res.ok) {
                console.warn(`${progress} ⚠️ Could not download: ${item.sourceUrl}`);
                failCount++;
                continue;
            }

            const rawBuf = Buffer.from(await res.arrayBuffer());
            totalOriginalBytes += rawBuf.length;

            // Optimize to WebP
            const webpBuf = await optimizeImageBuffer(rawBuf, item.type);
            totalOptimizedBytes += webpBuf.length;

            // Upload to Cloudflare R2 with retry
            await uploadWithRetry(new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: r2Key,
                Body: webpBuf,
                ContentType: 'image/webp',
                CacheControl: 'public, max-age=31536000, immutable',
            }));

            existingR2Keys.add(r2Key);
            urlMapping.set(item.sourceUrl, newPublicUrl);
            successCount++;

            const origKb = (rawBuf.length / 1024).toFixed(1);
            const optKb = (webpBuf.length / 1024).toFixed(1);
            const savedPct = ((1 - webpBuf.length / rawBuf.length) * 100).toFixed(0);

            console.log(`${progress} ✅ ${item.title}: ${origKb}KB -> ${optKb}KB (-${savedPct}%) -> ${r2Key}`);

            // Small 50ms pause between new uploads to prevent network throttling
            await new Promise(r => setTimeout(r, 50));
        } catch (err) {
            console.error(`${progress} ❌ Error migrating ${item.title}:`, err.message);
            failCount++;
        }
    }

    // Step 5: Generate Migration SQL Script & Rollback Script
    console.log('\n[5/5] Generating SQL Migration & Rollback scripts...');

    const migrationSqlStatements = [];
    const rollbackSqlStatements = [];

    migrationSqlStatements.push(`-- ====================================================================`);
    migrationSqlStatements.push(`-- Migration 010: Update Image URLs to Cloudflare R2 with WebP Optimization`);
    migrationSqlStatements.push(`-- Generated: ${new Date().toISOString()}`);
    migrationSqlStatements.push(`-- Total Images Mapped: ${urlMapping.size}`);
    migrationSqlStatements.push(`-- ====================================================================\n`);

    rollbackSqlStatements.push(`-- ====================================================================`);
    rollbackSqlStatements.push(`-- Rollback 010: Restore Original Supabase Storage Image URLs`);
    rollbackSqlStatements.push(`-- Generated: ${new Date().toISOString()}`);
    rollbackSqlStatements.push(`-- ====================================================================\n`);

    // Update Dishes
    for (const d of dishes) {
        if (Array.isArray(d.images) && d.images.length > 0) {
            let changed = false;
            const updatedImages = d.images.map(img => {
                if (urlMapping.has(img)) {
                    changed = true;
                    return urlMapping.get(img);
                }
                return img;
            });

            if (changed) {
                const escapedJson = JSON.stringify(updatedImages).replace(/'/g, "''");
                const origJson = JSON.stringify(d.images).replace(/'/g, "''");
                migrationSqlStatements.push(`UPDATE dishes SET images = '${escapedJson}'::jsonb WHERE id = '${d.id}';`);
                rollbackSqlStatements.push(`UPDATE dishes SET images = '${origJson}'::jsonb WHERE id = '${d.id}';`);
            }
        }
    }

    // Update Categories
    for (const c of categories) {
        if (urlMapping.has(c.image_url)) {
            const newUrl = urlMapping.get(c.image_url);
            migrationSqlStatements.push(`UPDATE categories SET image_url = '${newUrl.replace(/'/g, "''")}' WHERE id = '${c.id}';`);
            rollbackSqlStatements.push(`UPDATE categories SET image_url = '${c.image_url.replace(/'/g, "''")}' WHERE id = '${c.id}';`);
        }
    }

    // Update Banners
    for (const b of banners) {
        if (urlMapping.has(b.image_url)) {
            const newUrl = urlMapping.get(b.image_url);
            migrationSqlStatements.push(`UPDATE banners SET image_url = '${newUrl.replace(/'/g, "''")}' WHERE id = '${b.id}';`);
            rollbackSqlStatements.push(`UPDATE banners SET image_url = '${b.image_url.replace(/'/g, "''")}' WHERE id = '${b.id}';`);
        }
    }

    // Update Settings Logo
    if (settings && urlMapping.has(settings.logo_url)) {
        const newUrl = urlMapping.get(settings.logo_url);
        const restId = settings.restaurant_id || 'R001';
        migrationSqlStatements.push(`UPDATE restaurant_settings SET logo_url = '${newUrl.replace(/'/g, "''")}' WHERE restaurant_id = '${restId}';`);
        rollbackSqlStatements.push(`UPDATE restaurant_settings SET logo_url = '${settings.logo_url.replace(/'/g, "''")}' WHERE restaurant_id = '${restId}';`);
    }

    const migrationSqlPath = path.resolve('migrations', '010_migrate_images_to_cloudflare_r2.sql');
    const rollbackSqlPath = path.resolve('migrations', '010_rollback_images_to_supabase.sql');

    fs.writeFileSync(migrationSqlPath, migrationSqlStatements.join('\n') + '\n', 'utf8');
    fs.writeFileSync(rollbackSqlPath, rollbackSqlStatements.join('\n') + '\n', 'utf8');

    console.log(`\n================================================================`);
    console.log(`🎉 MIGRATION COMPLETE SUMMARY:`);
    console.log(`================================================================`);
    console.log(`✅ Total Mapped in R2:    ${urlMapping.size} images`);
    console.log(`⏩ Reused existing R2:    ${skippedCount} images`);
    console.log(`🆕 Newly Uploaded to R2:  ${successCount - skippedCount} images`);
    console.log(`⚠️ Failures:               ${failCount}`);
    console.log(`📄 Migration SQL generated: ${migrationSqlPath}`);
    console.log(`⏪ Rollback SQL generated:  ${rollbackSqlPath}`);
    console.log(`================================================================`);
}

runMigration().catch(err => {
    console.error('Fatal Migration Error:', err);
});
