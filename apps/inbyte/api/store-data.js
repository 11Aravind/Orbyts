import { getStoreSnapshot, getLiveShopSettings } from './_storeCache.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed. Use GET.' });
    }

    try {
        const parsedUrl = new URL(req.url || '/api/store-data', 'http://localhost');
        const statusOnlyParam = parsedUrl.searchParams.get('statusOnly') ?? req.query?.statusOnly;
        if (statusOnlyParam === '1' || statusOnlyParam === 'true') {
            const liveSettings = await getLiveShopSettings('R001');
            res.setHeader('Cache-Control', 'no-store, max-age=0');
            res.setHeader('X-Cache', 'LIVE-DB');
            return res.status(200).json({
                success: true,
                source: 'live-db',
                is_closed: Boolean(liveSettings?.is_closed),
                payment_mode: liveSettings?.payment_mode || 'BOTH',
                service_mode: liveSettings?.service_mode || 'TABLE_SERVICE',
                settings: liveSettings,
            });
        }

        const refreshParam = parsedUrl.searchParams.get('refresh') ?? req.query?.refresh;
        const versionParam = parsedUrl.searchParams.get('v') ?? req.query?.v ?? null;

        const forceRefresh = refreshParam === '1' || refreshParam === 'true';
        const coalesceParam = parsedUrl.searchParams.get('coalesce') ?? req.query?.coalesce;
        const allowCooldownSkip = coalesceParam === '1' || coalesceParam === 'true';

        const { snapshot, cacheStatus } = await getStoreSnapshot({
            forceRefresh,
            expectedVersion: versionParam || null,
            allowCooldownSkip,
        });

        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.setHeader('X-Cache', cacheStatus);
        if (snapshot?.version) {
            res.setHeader('X-Cache-Version', snapshot.version);
        }

        return res.status(200).json({
            success: true,
            cacheStatus,
            version: snapshot.version,
            updatedAt: snapshot.updatedAt,
            data: snapshot.data,
        });
    } catch (err) {
        console.error('[Store Data API Error]:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve store data.',
            details: err?.message || String(err),
        });
    }
}

