import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Helper to get R2 S3 Client
function getR2Client() {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        return null;
    }

    return new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
}

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token.' });
    }

    try {
        const { imageInput, folder = 'dishes', filename = null } = req.body || {};

        if (!imageInput || typeof imageInput !== 'string') {
            return res.status(400).json({ error: 'Missing or invalid imageInput string.' });
        }

        const s3Client = getR2Client();
        const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'innbite-images';
        const publicUrlBase = (process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/+$/, '');

        if (!s3Client || !publicUrlBase) {
            return res.status(500).json({
                error: 'Cloudflare R2 is not fully configured on the server environment.'
            });
        }

        // Extract base64 payload and MIME type
        let buffer;
        let contentType = 'image/webp';

        if (imageInput.startsWith('data:')) {
            const parts = imageInput.split(',');
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (mimeMatch) contentType = mimeMatch[1];
            buffer = Buffer.from(parts[1], 'base64');
        } else {
            buffer = Buffer.from(imageInput, 'base64');
        }

        const safeFilename = filename || `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;
        const key = `${folder}/${safeFilename}`;

        // Upload directly to Cloudflare R2
        await s3Client.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: 'public, max-age=31536000, immutable',
        }));

        const publicUrl = `${publicUrlBase}/${key}`;

        return res.status(200).json({
            success: true,
            url: publicUrl,
            key,
            sizeBytes: buffer.length
        });
    } catch (err) {
        console.error('[Cloudflare R2 Upload Error]:', err);
        return res.status(500).json({
            error: 'Failed to upload image to Cloudflare R2',
            details: err.message
        });
    }
}
