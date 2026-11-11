import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function inspect() {
    try {
        const { data: dishes, error: dishesErr } = await supabase.from('dishes').select('id, name, images');
        const { data: categories, error: catsErr } = await supabase.from('categories').select('*');
        const { data: banners, error: bannersErr } = await supabase.from('banners').select('*');
        const { data: settings, error: settingsErr } = await supabase.from('restaurant_settings').select('*');

        if (dishesErr) console.error('dishesErr:', dishesErr);
        if (catsErr) console.error('catsErr:', catsErr);
        if (bannersErr) console.error('bannersErr:', bannersErr);
        if (settingsErr) console.error('settingsErr:', settingsErr);

        console.log('--- Current Image Summary ---');
        console.log('Dishes count:', dishes?.length || 0);
        const dishImages = dishes?.flatMap(d => (d.images || []).concat(d.image_url ? [d.image_url] : [])).filter(Boolean) || [];
        console.log('Total dish image URLs:', dishImages.length);
        console.log('Categories count:', categories?.length || 0);
        const catImages = categories?.map(c => c.image_url).filter(Boolean) || [];
        console.log('Categories image URLs:', catImages.length);
        console.log('Banners count:', banners?.length || 0);
        const bannerImages = banners?.map(b => b.image_url).filter(Boolean) || [];
        console.log('Banners image URLs:', bannerImages.length);
        console.log('Settings logo:', settings?.[0]?.logo_url ? 1 : 0);

        const allUrls = [...dishImages, ...catImages, ...bannerImages, settings?.[0]?.logo_url].filter(Boolean);
        const supabaseStorageUrls = allUrls.filter(u => typeof u === 'string' && u.includes('supabase.co/storage'));
        const externalUrls = allUrls.filter(u => typeof u === 'string' && !u.includes('supabase.co/storage') && !u.startsWith('data:'));
        const dataUrls = allUrls.filter(u => typeof u === 'string' && u.startsWith('data:'));

        console.log('\n--- URL Distribution ---');
        console.log('Total URLs found in DB:', allUrls.length);
        console.log('Supabase Storage URLs:', supabaseStorageUrls.length);
        console.log('External URLs (Unsplash/CDN):', externalUrls.length);
        console.log('Inline Data URLs (base64):', dataUrls.length);

        if (supabaseStorageUrls.length > 0) {
            console.log('Sample Supabase Storage URL:', supabaseStorageUrls[0]);
        }
        if (externalUrls.length > 0) {
            console.log('Sample External URL:', externalUrls[0]);
        }

        // Check storage bucket
        const { data: storageList, error: storageErr } = await supabase.storage.from('menu-images').list('dishes');
        console.log('\n--- Supabase Storage menu-images/dishes ---');
        console.log('Files count:', storageList?.length || 0, storageErr ? storageErr.message : '');
        if (storageList && storageList.length > 0) {
            console.log('First 3 files:', storageList.slice(0, 3).map(f => f.name));
        }
    } catch (e) {
        console.error('Inspection error:', e);
    }
}

inspect();
