import { invalidateAndRefreshStoreCache } from './_storeCache.js';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const rateLimitBuckets = globalThis.__INNBITE_CACHE_INVALIDATE_RL__ || (globalThis.__INNBITE_CACHE_INVALIDATE_RL__ = new Map());

function getClientIp(req) {
    const forwarded = req.headers?.['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers?.['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) {
        return realIp.trim();
    }
    return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(clientKey) {
    const now = Date.now();
    // Prune stale buckets periodically to keep memory bounded
    if (rateLimitBuckets.size > 500) {
        for (const [k, timestamps] of rateLimitBuckets.entries()) {
            const recent = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
            if (recent.length === 0) {
                rateLimitBuckets.delete(k);
            } else {
                rateLimitBuckets.set(k, recent);
            }
        }
    }

    const recent = (rateLimitBuckets.get(clientKey) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
        const oldest = recent[0] || now;
        const retryAfterSec = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000));
        return { allowed: false, retryAfterSec };
    }

    recent.push(now);
    rateLimitBuckets.set(clientKey, recent);
    return { allowed: true, retryAfterSec: 0 };
}

export default async function handler(req, res) {
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
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token.' });
    }

    const clientIp = getClientIp(req);
    const { allowed, retryAfterSec } = checkRateLimit(clientIp);
    if (!allowed) {
        res.setHeader('Retry-After', String(retryAfterSec));
        return res.status(429).json({
            success: false,
            error: 'Too many cache invalidation requests. Please try again shortly.',
            retryAfter: retryAfterSec,
        });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const entity = typeof body.entity === 'string' ? body.entity : 'all';
        const action = typeof body.action === 'string' ? body.action : 'update';
        const mode = body.mode === 'invalidate-only' ? 'invalidate-only' : 'refresh';

        const result = await invalidateAndRefreshStoreCache({ entity, action, mode });

        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.setHeader('X-Cache', result.cacheStatus);
        if (result.version) {
            res.setHeader('X-Cache-Version', result.version);
        }

        return res.status(200).json({
            success: true,
            cacheStatus: result.cacheStatus,
            version: result.version,
            updatedAt: result.updatedAt,
            broadcastSent: result.broadcastSent,
        });
    } catch (err) {
        console.error('[Cache Invalidate API Error]:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to invalidate/refresh server cache.',
            details: err?.message || String(err),
        });
    }
}

