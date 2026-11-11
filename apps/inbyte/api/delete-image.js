import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token.' });
    }

    try {
        const { urls = [] } = req.body || {};
        const urlList = Array.isArray(urls) ? urls : [urls];
        const s3Client = getR2Client();
        const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'innbite-images';
        const publicUrlBase = (process.env.CLOUDFLARE_R2_PUBLIC_URL || process.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/+$/, '');

        if (!s3Client || urlList.length === 0) {
            return res.status(200).json({ success: true, deleted: 0 });
        }

        const deletePromises = [];
        for (const url of urlList) {
            if (typeof url === 'string' && publicUrlBase && url.startsWith(publicUrlBase)) {
                const key = url.replace(`${publicUrlBase}/`, '');
                if (key) {
                    deletePromises.push(
                        s3Client.send(new DeleteObjectCommand({
                            Bucket: bucketName,
                            Key: key
                        })).catch(e => console.warn('Could not delete R2 key:', key, e))
                    );
                }
            }
        }

        await Promise.all(deletePromises);
        return res.status(200).json({ success: true, deleted: deletePromises.length });
    } catch (err) {
        console.error('[Cloudflare R2 Delete Error]:', err);
        return res.status(500).json({ error: 'Failed to delete image from Cloudflare R2' });
    }
}
