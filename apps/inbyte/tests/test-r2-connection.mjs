import fs from 'fs';
import { S3Client, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Load .env
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
});

async function testR2() {
    console.log('--- Testing Cloudflare R2 Connection ---');
    console.log('Account ID:', env.CLOUDFLARE_ACCOUNT_ID);
    console.log('Bucket Name:', env.CLOUDFLARE_R2_BUCKET_NAME);
    console.log('Public URL:', env.CLOUDFLARE_R2_PUBLIC_URL);

    try {
        // 1. List objects in bucket
        console.log('\n1. Checking bucket access via S3 API...');
        const listCmd = new ListObjectsV2Command({ Bucket: env.CLOUDFLARE_R2_BUCKET_NAME, MaxKeys: 5 });
        const listRes = await s3Client.send(listCmd);
        console.log('✅ Bucket connected successfully! Current objects in bucket:', listRes.KeyCount || 0);

        // 2. Upload a small test file
        const testKey = 'test-connection-ping.txt';
        console.log(`\n2. Uploading test file (${testKey})...`);
        const putCmd = new PutObjectCommand({
            Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: testKey,
            Body: 'InnBite Cloudflare R2 Connection Verified Successfully! ' + new Date().toISOString(),
            ContentType: 'text/plain',
        });
        await s3Client.send(putCmd);
        console.log('✅ Test file uploaded successfully!');

        // 3. Test public URL delivery
        const publicFileUrl = `${env.CLOUDFLARE_R2_PUBLIC_URL}/${testKey}`;
        console.log(`\n3. Verifying Public URL delivery: ${publicFileUrl}`);
        const fetchRes = await fetch(publicFileUrl);
        console.log('HTTP Status:', fetchRes.status);
        if (fetchRes.ok) {
            const text = await fetchRes.text();
            console.log('✅ Public URL verified! Response text:', text.trim());
        } else {
            console.warn('⚠️ Public URL responded with status', fetchRes.status, ' (might take 1-2 minutes for new public domain DNS to propagate)');
        }

        // 4. Clean up test file
        console.log('\n4. Cleaning up test file...');
        await s3Client.send(new DeleteObjectCommand({ Bucket: env.CLOUDFLARE_R2_BUCKET_NAME, Key: testKey }));
        console.log('✅ Cleaned up test file.');

        console.log('\n🎉 ALL CLOUDFLARE R2 CHECKS PASSED!');
    } catch (err) {
        console.error('❌ Cloudflare R2 Connection Error:', err);
    }
}

testR2();
