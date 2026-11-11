import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@supabase/supabase-js';

const R2_CACHE_KEY = 'cache/store-data.json';
const REFRESH_COOLDOWN_MS = 2500;
const L1_FALLBACK_TTL_MS = 60000;
const REALTIME_CHANNEL_NAME = 'store_cache_sync';

const globalState = globalThis.__INNBITE_STORE_CACHE__ || (globalThis.__INNBITE_STORE_CACHE__ = {
    snapshot: null,
    etag: null,
    updatedAtMs: 0,
    inflightReadPromise: null,
    inflightReadVersion: null,
    inflightReadEpoch: 0,
    inflightRefreshPromise: null,
    epoch: 0,
});

function getCategoryPriority(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('main')) return 1;
    if (n.includes('beverage') || n.includes('drink')) return 2;
    if (n.includes('starter') || n.includes('appetizer')) return 3;
    if (n.includes('chinese') || n.includes('chineese')) return 4;
    if (n.includes('dessert') || n.includes('desert')) return 5;
    if (n.includes('combo') || n.includes('commbo')) return 6;
    return 99;
}

export function sortCategoriesByPriority(cats) {
    if (!Array.isArray(cats)) return [];
    return [...cats].sort((a, b) => {
        const orderA = typeof a.display_order === 'number' && a.display_order > 0 ? a.display_order : getCategoryPriority(a.name);
        const orderB = typeof b.display_order === 'number' && b.display_order > 0 ? b.display_order : getCategoryPriority(b.name);
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '');
    });
}

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

function getR2BucketName() {
    return process.env.CLOUDFLARE_R2_BUCKET_NAME || 'innbite-images';
}

export function getServerSupabase() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase server credentials are not configured.');
    }

    return createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false }
    });
}

export async function getLiveShopSettings(restaurantId = 'R001') {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to read live shop settings: ${error.message || error}`);
    }

    if (data && globalState.snapshot?.data) {
        globalState.snapshot.data.settings = data;
    }

    return data || null;
}

async function readBodyAsString(body) {
    if (!body) return '';
    if (typeof body.transformToString === 'function') {
        return body.transformToString();
    }
    const chunks = [];
    for await (const chunk of body) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

async function readFromR2(ifNoneMatchEtag = null) {
    const r2 = getR2Client();
    if (!r2) {
        return { status: 'UNAVAILABLE' };
    }

    try {
        const params = {
            Bucket: getR2BucketName(),
            Key: R2_CACHE_KEY,
        };
        if (ifNoneMatchEtag) {
            params.IfNoneMatch = ifNoneMatchEtag;
        }

        const response = await r2.send(new GetObjectCommand(params));
        const raw = await readBodyAsString(response.Body);
        const parsed = JSON.parse(raw);

        if (!parsed || !parsed.data || !Array.isArray(parsed.data.dishes)) {
            return { status: 'MISS' };
        }

        return {
            status: 'HIT',
            snapshot: parsed,
            etag: response.ETag || null,
        };
    } catch (err) {
        const httpCode = err?.$metadata?.httpStatusCode;
        if (httpCode === 304 || err?.name === 'NotModified') {
            return { status: 'NOT_MODIFIED' };
        }
        if (httpCode === 404 || err?.name === 'NoSuchKey') {
            return { status: 'MISS' };
        }
        console.warn('[StoreCache] R2 read warning:', err?.message || err);
        return { status: 'ERROR', error: err };
    }
}

async function writeToR2(snapshot) {
    const r2 = getR2Client();
    if (!r2) {
        return null;
    }

    try {
        const putRes = await r2.send(new PutObjectCommand({
            Bucket: getR2BucketName(),
            Key: R2_CACHE_KEY,
            Body: JSON.stringify(snapshot),
            ContentType: 'application/json',
            CacheControl: 'no-store',
        }));
        return putRes?.ETag || null;
    } catch (err) {
        console.warn('[StoreCache] R2 write warning:', err?.message || err);
        return null;
    }
}

async function deleteFromR2() {
    const r2 = getR2Client();
    if (!r2) {
        return false;
    }

    try {
        await r2.send(new DeleteObjectCommand({
            Bucket: getR2BucketName(),
            Key: R2_CACHE_KEY,
        }));
        return true;
    } catch (err) {
        const httpCode = err?.$metadata?.httpStatusCode;
        if (httpCode === 404 || err?.name === 'NoSuchKey') {
            return true;
        }
        console.warn('[StoreCache] R2 delete warning:', err?.message || err);
        return false;
    }
}

function setL1Cache(snapshot, etag = null) {
    globalState.snapshot = snapshot;
    globalState.etag = etag;
    globalState.updatedAtMs = snapshot?.updatedAt ? (Date.parse(snapshot.updatedAt) || Date.now()) : Date.now();
}

function clearL1Cache() {
    globalState.snapshot = null;
    globalState.etag = null;
    globalState.updatedAtMs = 0;
    globalState.inflightReadPromise = null;
    globalState.inflightReadVersion = null;
    globalState.inflightReadEpoch = 0;
}

async function fetchFromSupabase() {
    const supabase = getServerSupabase();

    const [bannersRes, dishesRes, categoriesRes, settingsRes, tablesRes] = await Promise.all([
        supabase.from('banners').select('*'),
        supabase.from('dishes').select('*'),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('restaurant_settings').select('*').eq('restaurant_id', 'R001').maybeSingle(),
        supabase.from('tables').select('*').order('table_number', { ascending: true })
    ]);

    const firstError = bannersRes.error || dishesRes.error || categoriesRes.error || settingsRes.error || tablesRes.error;
    if (firstError) {
        throw new Error(`Supabase query failed: ${firstError.message || firstError}`);
    }

    const categories = sortCategoriesByPriority(categoriesRes.data || []);
    const nowIso = new Date().toISOString();
    const version = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    return {
        version,
        updatedAt: nowIso,
        source: 'supabase',
        data: {
            banners: bannersRes.data || [],
            categories,
            dishes: dishesRes.data || [],
            settings: settingsRes.data || null,
            tables: tablesRes.data || [],
        }
    };
}

export async function broadcastStoreUpdate({ version, entity = 'all', action = 'update', updatedAt = new Date().toISOString(), event = 'cache_updated' } = {}) {
    try {
        const supabase = getServerSupabase();
        const channel = supabase.channel(REALTIME_CHANNEL_NAME);
        try {
            const result = await channel.httpSend(event, {
                version,
                entity,
                action,
                updatedAt,
            });
            if (!result?.success) {
                console.warn('[StoreCache] Broadcast warning:', result?.error || result?.status);
            }
            return Boolean(result?.success);
        } finally {
            supabase.removeChannel(channel).catch(() => {});
        }
    } catch (err) {
        console.warn('[StoreCache] Broadcast exception:', err?.message || err);
        return false;
    }
}

async function rebuildCacheFromDB(requestEpoch) {
    const snapshot = await fetchFromSupabase();

    // Prevent an older DB read from overwriting a newer invalidation epoch
    if (requestEpoch !== globalState.epoch) {
        return { snapshot, etag: null };
    }

    const etag = await writeToR2(snapshot);

    if (requestEpoch === globalState.epoch) {
        setL1Cache(snapshot, etag);
    }

    return { snapshot, etag };
}

export async function getStoreSnapshot({ forceRefresh = false, expectedVersion = null, allowCooldownSkip = false } = {}) {
    // 1. Forced DB refresh path (e.g., fallback after external DB change or explicit manual refresh)
    if (forceRefresh) {
        const reqEpoch = globalState.epoch;
        if (allowCooldownSkip) {
            // Check L1 or L2 first so thundering herds of fallback postgres_changes don't hammer DB
            let recentSnapshot = globalState.snapshot;
            if (!recentSnapshot) {
                const r2Probe = await readFromR2(null);
                if (r2Probe.status === 'HIT') {
                    if (reqEpoch === globalState.epoch) {
                        setL1Cache(r2Probe.snapshot, r2Probe.etag);
                    }
                    recentSnapshot = r2Probe.snapshot;
                }
            }
            if (recentSnapshot?.updatedAt) {
                const ageMs = Date.now() - Date.parse(recentSnapshot.updatedAt);
                if (!Number.isNaN(ageMs) && ageMs >= 0 && ageMs < REFRESH_COOLDOWN_MS) {
                    return { snapshot: recentSnapshot, cacheStatus: 'HIT-COALESCED' };
                }
            }
        }

        if (globalState.inflightRefreshPromise) {
            return globalState.inflightRefreshPromise;
        }

        const p = (async () => {
            const { snapshot } = await rebuildCacheFromDB(reqEpoch);
            if (reqEpoch !== globalState.epoch) {
                if (globalState.inflightRefreshPromise && globalState.inflightRefreshPromise !== p) {
                    return globalState.inflightRefreshPromise;
                }
                if (globalState.inflightRefreshPromise === p) {
                    globalState.inflightRefreshPromise = null;
                }
                return getStoreSnapshot();
            }
            return { snapshot, cacheStatus: 'REFRESHED' };
        })().finally(() => {
            if (globalState.inflightRefreshPromise === p) {
                globalState.inflightRefreshPromise = null;
            }
        });
        globalState.inflightRefreshPromise = p;
        return p;
    }

    // Wait on any active invalidation/refresh rebuild before touching L1/L2
    if (globalState.inflightRefreshPromise) {
        return globalState.inflightRefreshPromise;
    }

    // 2. Fast L1 hit when client specifies the exact already-loaded broadcast version
    if (expectedVersion && globalState.snapshot?.version === expectedVersion) {
        return { snapshot: globalState.snapshot, cacheStatus: 'HIT-L1' };
    }

    // 3. Coalesce concurrent cache-aside reads on the same epoch & version
    if (
        globalState.inflightReadPromise &&
        globalState.inflightReadEpoch === globalState.epoch &&
        (!expectedVersion || globalState.inflightReadVersion === expectedVersion)
    ) {
        return globalState.inflightReadPromise;
    }

    const readEpoch = globalState.epoch;
    const readWork = (async () => {
        if (globalState.inflightRefreshPromise) {
            return globalState.inflightRefreshPromise;
        }

        // Check L1 Memory first, validated via conditional ETag check against L2 R2
        if (globalState.snapshot) {
            const r2Check = await readFromR2(globalState.etag);

            if (r2Check.status === 'NOT_MODIFIED') {
                if (readEpoch === globalState.epoch && globalState.snapshot) {
                    globalState.updatedAtMs = Date.now();
                    return { snapshot: globalState.snapshot, cacheStatus: 'HIT-L1' };
                }
            } else if (r2Check.status === 'UNAVAILABLE' || r2Check.status === 'ERROR') {
                const isL1Fresh = globalState.updatedAtMs > 0 && (Date.now() - globalState.updatedAtMs) < L1_FALLBACK_TTL_MS;
                if (isL1Fresh && readEpoch === globalState.epoch && globalState.snapshot) {
                    return { snapshot: globalState.snapshot, cacheStatus: 'HIT-L1' };
                }
                if (readEpoch === globalState.epoch) {
                    clearL1Cache();
                }
            } else if (r2Check.status === 'HIT') {
                if (readEpoch === globalState.epoch) {
                    setL1Cache(r2Check.snapshot, r2Check.etag);
                }
                return { snapshot: r2Check.snapshot, cacheStatus: 'HIT-L2' };
            } else {
                // R2 returned MISS (object was deleted/invalidated by another worker)
                if (readEpoch === globalState.epoch) {
                    clearL1Cache();
                }
            }
        } else {
            // Cold container: check L2 Cloudflare R2
            const r2Res = await readFromR2(null);
            if (r2Res.status === 'HIT') {
                if (readEpoch === globalState.epoch) {
                    setL1Cache(r2Res.snapshot, r2Res.etag);
                }
                return { snapshot: r2Res.snapshot, cacheStatus: 'HIT-L2' };
            }
        }

        // If an invalidation started while reading R2, wait for its rebuild instead of overlapping
        if (globalState.inflightRefreshPromise) {
            return globalState.inflightRefreshPromise;
        }

        const reqEpoch = globalState.epoch;
        const refreshPromise = rebuildCacheFromDB(reqEpoch)
            .then(({ snapshot }) => ({ snapshot, cacheStatus: 'MISS' }))
            .finally(() => {
                if (globalState.inflightRefreshPromise === refreshPromise) {
                    globalState.inflightRefreshPromise = null;
                }
            });
        globalState.inflightRefreshPromise = refreshPromise;
        return refreshPromise;
    })().finally(() => {
        if (globalState.inflightReadPromise === readWork) {
            globalState.inflightReadPromise = null;
            globalState.inflightReadVersion = null;
            globalState.inflightReadEpoch = 0;
        }
    });

    globalState.inflightReadPromise = readWork;
    globalState.inflightReadVersion = expectedVersion || null;
    globalState.inflightReadEpoch = readEpoch;

    return readWork;
}

export async function invalidateAndRefreshStoreCache({ entity = 'all', action = 'update', mode = 'refresh' } = {}) {
    globalState.epoch += 1;
    const reqEpoch = globalState.epoch;
    clearL1Cache();

    if (mode === 'invalidate-only') {
        globalState.inflightRefreshPromise = null;
        await deleteFromR2();

        const invalidatedVersion = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const nowIso = new Date().toISOString();
        const broadcastSent = await broadcastStoreUpdate({
            version: invalidatedVersion,
            entity,
            action,
            updatedAt: nowIso,
            event: 'cache_invalidated'
        });

        return {
            success: true,
            cacheStatus: 'INVALIDATED',
            version: invalidatedVersion,
            updatedAt: nowIso,
            broadcastSent,
            snapshot: null,
        };
    }

    // Serialize delete + DB rebuild inside inflightRefreshPromise so concurrent readers never see pre-delete R2
    const refreshRun = (async () => {
        await deleteFromR2();
        if (reqEpoch !== globalState.epoch) {
            if (globalState.inflightRefreshPromise && globalState.inflightRefreshPromise !== refreshRun) {
                return globalState.inflightRefreshPromise;
            }
            if (globalState.inflightRefreshPromise === refreshRun) {
                globalState.inflightRefreshPromise = null;
            }
            const latest = await getStoreSnapshot();
            return {
                success: true,
                cacheStatus: 'SUPERSEDED',
                version: latest.snapshot.version,
                updatedAt: latest.snapshot.updatedAt,
                broadcastSent: false,
                snapshot: latest.snapshot,
            };
        }

        const { snapshot } = await rebuildCacheFromDB(reqEpoch);

        // If a newer invalidation superseded this one during the DB read, never broadcast the stale version
        if (reqEpoch !== globalState.epoch) {
            if (globalState.inflightRefreshPromise && globalState.inflightRefreshPromise !== refreshRun) {
                return globalState.inflightRefreshPromise;
            }
            if (globalState.inflightRefreshPromise === refreshRun) {
                globalState.inflightRefreshPromise = null;
            }
            const latest = await getStoreSnapshot();
            return {
                success: true,
                cacheStatus: 'SUPERSEDED',
                version: latest.snapshot.version,
                updatedAt: latest.snapshot.updatedAt,
                broadcastSent: false,
                snapshot: latest.snapshot,
            };
        }

        // Push real-time update to all connected clients via Supabase Broadcast
        const broadcastSent = await broadcastStoreUpdate({
            version: snapshot.version,
            entity,
            action,
            updatedAt: snapshot.updatedAt,
            event: 'cache_updated'
        });

        return {
            success: true,
            cacheStatus: 'REFRESHED',
            version: snapshot.version,
            updatedAt: snapshot.updatedAt,
            broadcastSent,
            snapshot,
        };
    })().finally(() => {
        if (globalState.inflightRefreshPromise === refreshRun) {
            globalState.inflightRefreshPromise = null;
        }
    });

    globalState.inflightRefreshPromise = refreshRun;
    return refreshRun;
}

