import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// 1. Read .env
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const isConfirm = process.argv.includes('--confirm');
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

async function cleanupStorage() {
    console.log('================================================================');
    console.log('🧹 SUPABASE STORAGE CLEANUP');
    console.log('================================================================');
    console.log('Mode:', isConfirm ? '🚨 LIVE DELETION (--confirm)' : '🔍 DRY RUN (Preview only, no files will be deleted)');

    const folders = ['dishes', 'categories', 'banners', 'logos'];
    let allPathsToDelete = [];

    for (const folder of folders) {
        try {
            const { data: files, error } = await supabase.storage.from('menu-images').list(folder, { limit: 1000 });
            if (error) {
                console.warn(`Could not list folder "${folder}":`, error.message);
                continue;
            }

            if (files && files.length > 0) {
                const paths = files
                    .filter(f => f.name && f.name !== '.emptyFolderPlaceholder')
                    .map(f => `${folder}/${f.name}`);
                allPathsToDelete.push(...paths);
                console.log(`Found ${paths.length} files in "${folder}/"`);
            } else {
                console.log(`Found 0 files in "${folder}/"`);
            }
        } catch (err) {
            console.error(`Error inspecting folder "${folder}":`, err.message);
        }
    }

    console.log(`\nTotal Supabase Storage files found: ${allPathsToDelete.length}`);

    if (allPathsToDelete.length === 0) {
        console.log('Bucket "menu-images" is already clean/empty.');
        return;
    }

    if (!isConfirm) {
        console.log('\nPreview of first 5 files to be removed:');
        console.log(allPathsToDelete.slice(0, 5));
        console.log('\nTo permanently delete these files, run:');
        console.log('👉 node scripts/cleanup-supabase-storage.mjs --confirm');
        return;
    }

    // Live Deletion in chunks of 50
    console.log(`\nDeleting ${allPathsToDelete.length} files from Supabase Storage...`);
    const chunkSize = 50;
    let deletedCount = 0;

    for (let i = 0; i < allPathsToDelete.length; i += chunkSize) {
        const chunk = allPathsToDelete.slice(i, i + chunkSize);
        const { error } = await supabase.storage.from('menu-images').remove(chunk);
        if (error) {
            console.error(`Error deleting chunk [${i} - ${i + chunk.length}]:`, error.message);
        } else {
            deletedCount += chunk.length;
            console.log(`✅ Deleted ${deletedCount}/${allPathsToDelete.length} files...`);
        }
    }

    console.log('\n================================================================');
    console.log(`🎉 Cleanup Complete! Successfully deleted ${deletedCount} files from Supabase Storage.`);
    console.log('All image links in your application are now served 100% from Cloudflare R2.');
    console.log('================================================================');
}

cleanupStorage().catch(err => {
    console.error('Fatal Cleanup Error:', err);
});
