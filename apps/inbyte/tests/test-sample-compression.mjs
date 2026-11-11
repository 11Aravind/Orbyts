import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Load .env
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

async function testSingleImage() {
    console.log('Testing image download, WebP conversion to <= 5KB, and R2 upload on 1 sample image...');

    // 1. Fetch 1 dish image
    const { data: dishes, error } = await supabase.from('dishes').select('id, name, images').limit(1);
    if (error || !dishes || dishes.length === 0 || !dishes[0].images?.[0]) {
        console.error('No sample dish found:', error);
        return;
    }

    const dish = dishes[0];
    const sourceUrl = dish.images[0];
    console.log(`Original image: "${dish.name}"`);
    console.log(`Source URL: ${sourceUrl}`);

    // 2. Download from Supabase
    const res = await fetch(sourceUrl);
    if (!res.ok) {
        console.error('Failed to download source image:', res.status);
        return;
    }
    const inputBuffer = Buffer.from(await res.arrayBuffer());
    console.log(`Original downloaded size: ${(inputBuffer.length / 1024).toFixed(1)} KB (${inputBuffer.length} bytes)`);

    // 3. Auto-crop to 1:1, resize to 220x220, convert to WebP with target <= 5KB - 8KB
    let quality = 70;
    let targetSize = 220;
    let webpBuffer = await sharp(inputBuffer)
        .resize(targetSize, targetSize, { fit: 'cover', position: 'center' })
        .webp({ quality, effort: 6 })
        .toBuffer();

    // If greater than 6KB, step down quality slightly
    while (webpBuffer.length > 6 * 1024 && quality > 35) {
        quality -= 10;
        webpBuffer = await sharp(inputBuffer)
            .resize(targetSize, targetSize, { fit: 'cover', position: 'center' })
            .webp({ quality, effort: 6 })
            .toBuffer();
    }

    // If still > 6KB, reduce dimensions to 180x180
    if (webpBuffer.length > 6 * 1024) {
        targetSize = 180;
        webpBuffer = await sharp(inputBuffer)
            .resize(targetSize, targetSize, { fit: 'cover', position: 'center' })
            .webp({ quality: 50, effort: 6 })
            .toBuffer();
    }

    console.log(`Optimized WebP size: ${(webpBuffer.length / 1024).toFixed(2)} KB (${webpBuffer.length} bytes)`);
    console.log(`Bandwidth reduction: ${((1 - webpBuffer.length / inputBuffer.length) * 100).toFixed(1)}%!`);

    // 4. Upload to Cloudflare R2
    const r2Key = `dishes/test-sample-${Date.now()}.webp`;
    await s3Client.send(new PutObjectCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: r2Key,
        Body: webpBuffer,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
    }));

    const cloudflareUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${r2Key}`;
    console.log(`Uploaded to Cloudflare R2: ${cloudflareUrl}`);

    // 5. Verify HTTP GET from Cloudflare public CDN
    const verifyRes = await fetch(cloudflareUrl);
    console.log(`Cloudflare CDN Status: ${verifyRes.status}`);
    console.log(`Cloudflare CDN Content-Type: ${verifyRes.headers.get('content-type')}`);
    console.log(`Cloudflare CDN Content-Length: ${verifyRes.headers.get('content-length')} bytes`);

    if (verifyRes.ok) {
        console.log('✅ TEST PASSED! Cloudflare R2 serves the optimized WebP image with 200 OK!');
    } else {
        console.error('❌ Verification failed on Cloudflare URL');
    }
}

testSingleImage();
