import CryptoJS from 'crypto-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { APP_CONFIG } from '../config';
import { secureStorage } from './secureStorage';
import { convertToWebP, autoCropAndCompressToWebP } from './cropImage';
import { sendPushNotificationToWaiters } from './notifications';

const envServiceMode = import.meta.env.VITE_SERVICE_MODE || 'TABLE_SERVICE';

// Client-Side Memory Cache + Real-Time Sync State (Backed by Server Cache /api/store-data)
const CACHE_TTL_MS = 60000; // 60s memory cache between real-time invalidations
const REALTIME_CHANNEL_NAME = 'store_cache_sync';
const TAB_SYNC_CHANNEL_NAME = 'innbite_store_sync';

const menuCache = {
    storeVersion: null,
    storeTime: 0,
    inflightStorePromise: null,
    inflightStoreForce: false,
    inflightStoreVersion: null,
    homeData: null,
    homeDataTime: 0,
    categories: null,
    categoriesTime: 0,
    dishes: null,
    dishesTime: 0,
    settings: null,
    settingsTime: 0,
    tables: null,
    tablesTime: 0,
    dishMap: new Map() // id -> { data, timestamp }
};

const syncState = {
    listeners: new Set(),
    realtimeChannel: null,
    tabChannel: null,
    fallbackTimer: null,
    trailingFallbackTimer: null,
    pendingInvalidation: null,
    lastAppliedVersion: null,
    lastServerSyncAt: 0,
    lastDbEventAt: 0,
    lastFetchCacheStatus: null,
};

export const invalidateMenuCache = () => {
    menuCache.storeVersion = null;
    menuCache.storeTime = 0;
    menuCache.homeData = null;
    menuCache.homeDataTime = 0;
    menuCache.categories = null;
    menuCache.categoriesTime = 0;
    menuCache.dishes = null;
    menuCache.dishesTime = 0;
    menuCache.settings = null;
    menuCache.settingsTime = 0;
    menuCache.tables = null;
    menuCache.tablesTime = 0;
    menuCache.dishMap.clear();
};

export const getCategoryPriority = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('main')) return 1;
    if (n.includes('beverage') || n.includes('drink')) return 2;
    if (n.includes('starter') || n.includes('appetizer')) return 3;
    if (n.includes('chinese') || n.includes('chineese')) return 4;
    if (n.includes('dessert') || n.includes('desert')) return 5;
    if (n.includes('combo') || n.includes('commbo')) return 6;
    return 99;
};

export const sortCategoriesByPriority = (cats) => {
    if (!Array.isArray(cats)) return [];
    return [...cats].sort((a, b) => {
        const orderA = typeof a.display_order === 'number' && a.display_order > 0 ? a.display_order : getCategoryPriority(a.name);
        const orderB = typeof b.display_order === 'number' && b.display_order > 0 ? b.display_order : getCategoryPriority(b.name);
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '');
    });
};

function readLocalSettingsFallback() {
    try {
        const stored = secureStorage.getItem('innbite_custom_settings');
        if (stored) return typeof stored === 'string' ? JSON.parse(stored) : stored;
    } catch {
        // Ignore storage fallback error
    }
    return null;
}

function normalizeSettings(serverData, localFallback = null) {
    const base = {
        restaurant_id: 'R001',
        restaurant_name: `${APP_CONFIG.APP_NAME} Restaurant`,
        app_name: APP_CONFIG.APP_NAME,
        service_mode: envServiceMode,
        payment_mode: 'BOTH',
        theme_color: 'emerald',
        logo_url: '/logo.svg',
        is_closed: false,
    };

    if (!serverData) {
        return { ...base, ...localFallback };
    }

    return {
        ...base,
        ...serverData,
        service_mode: serverData.service_mode || envServiceMode,
        payment_mode: serverData.payment_mode || 'BOTH',
        app_name: serverData.app_name || serverData.restaurant_name || APP_CONFIG.APP_NAME,
        theme_color: serverData.theme_color || 'emerald',
        logo_url: serverData.logo_url || '/logo.svg',
        is_closed: typeof serverData.is_closed === 'boolean' ? serverData.is_closed : Boolean(serverData.is_closed),
    };
}

function applyStoreSnapshotToCache(rawData, version = null) {
    const now = Date.now();
    const localFallback = readLocalSettingsFallback();
    const banners = rawData?.banners || [];
    const allDishes = rawData?.dishes || [];
    const categories = sortCategoriesByPriority(rawData?.categories || []);
    const tables = rawData?.tables || [];
    const settings = normalizeSettings(rawData?.settings || null, localFallback);

    if (rawData?.settings) {
        try {
            secureStorage.setItem('innbite_custom_settings', settings);
        } catch {
            // Ignore storage write error
        }
    }

    menuCache.dishes = allDishes;
    menuCache.dishesTime = now;
    menuCache.dishMap.clear();
    allDishes.forEach(d => menuCache.dishMap.set(d.id, { data: d, timestamp: now }));

    menuCache.categories = categories;
    menuCache.categoriesTime = now;

    menuCache.settings = settings;
    menuCache.settingsTime = now;

    menuCache.tables = tables;
    menuCache.tablesTime = now;

    const homeData = {
        banners,
        all_dishes: allDishes,
        popular_dishes: allDishes.filter(d => (d.is_popular || d.isPopular) && d.is_available !== false),
        todays_specials: allDishes.filter(d => (d.is_special || d.isSpecial) && d.is_available !== false),
        categories,
        settings,
    };

    menuCache.homeData = homeData;
    menuCache.homeDataTime = now;
    menuCache.storeTime = now;
    const isServerVersion = Boolean(version && !String(version).startsWith('local-'));
    const resolvedVersion = version || `local-${now}-${Math.random().toString(36).slice(2, 7)}`;
    menuCache.storeVersion = isServerVersion ? version : null;
    syncState.lastAppliedVersion = resolvedVersion;

    return {
        banners,
        categories,
        dishes: allDishes,
        settings,
        tables,
        homeData,
        version: resolvedVersion,
    };
}

function notifyStoreListeners(detail = {}) {
    for (const listener of syncState.listeners) {
        try {
            listener(detail);
        } catch (err) {
            console.warn('[StoreSync] Listener callback error:', err);
        }
    }
}

function broadcastToLocalTabs(payload) {
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            const ch = new BroadcastChannel(TAB_SYNC_CHANNEL_NAME);
            ch.postMessage(payload);
            ch.close();
        }
    } catch {
        // Ignore BroadcastChannel errors on unsupported environments
    }
}

function toServerVersion(version) {
    return (version && !String(version).startsWith('local-')) ? version : null;
}

async function sendClientRealtimeBroadcastFallback({ version, entity = 'all', action = 'update', updatedAt = new Date().toISOString() } = {}) {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
        const ch = supabase.channel(REALTIME_CHANNEL_NAME);
        try {
            const res = await ch.httpSend('cache_updated', {
                version,
                entity,
                action,
                updatedAt,
            });
            return Boolean(res?.success);
        } finally {
            supabase.removeChannel(ch).catch(() => {});
        }
    } catch {
        return false;
    }
}

function ensureStoreSyncStarted() {
    if (typeof window === 'undefined') return;

    if (!syncState.tabChannel && typeof BroadcastChannel !== 'undefined') {
        try {
            syncState.tabChannel = new BroadcastChannel(TAB_SYNC_CHANNEL_NAME);
            syncState.tabChannel.onmessage = async (event) => {
                const msg = event?.data;
                if (!msg || msg.type !== 'CACHE_UPDATED') return;
                if (msg.version && msg.version === syncState.lastAppliedVersion) return;

                syncState.lastServerSyncAt = Date.now();
                if (msg.data && Array.isArray(msg.data.dishes)) {
                    applyStoreSnapshotToCache(msg.data, msg.version);
                    notifyStoreListeners({ ...msg, source: 'tab-broadcast' });
                } else {
                    invalidateMenuCache();
                    await apiService.getStoreData({ version: toServerVersion(msg.version) });
                    notifyStoreListeners({ ...msg, source: 'tab-broadcast' });
                }
            };
        } catch {
            // Ignore BroadcastChannel setup error
        }
    }

    if (!syncState.realtimeChannel && isSupabaseConfigured && supabase) {
        const handleBroadcastSync = async ({ payload }) => {
            if (syncState.pendingInvalidation) {
                try {
                    await syncState.pendingInvalidation;
                } catch {
                    // Proceed with normal broadcast sync if local invalidation failed
                }
            }

            const { version, entity = 'all', action = 'update' } = payload || {};
            if (version && version === syncState.lastAppliedVersion) {
                return;
            }
            syncState.lastServerSyncAt = Date.now();
            invalidateMenuCache();
            try {
                await apiService.getStoreData({ version: toServerVersion(version) });
                notifyStoreListeners({ entity, action, version, source: 'realtime-broadcast' });
            } catch (err) {
                console.warn('[StoreSync] Broadcast refresh warning:', err);
            }
        };

        const handleFallbackDbChange = (table) => {
            syncState.lastDbEventAt = Date.now();
            if (syncState.fallbackTimer) {
                clearTimeout(syncState.fallbackTimer);
            }

            const runFallbackSync = async () => {
                const elapsed = Date.now() - syncState.lastServerSyncAt;
                if (elapsed < 4000) {
                    // If broadcast/local invalidation synced at or after this DB event, skip extra refresh
                    if (syncState.lastDbEventAt <= syncState.lastServerSyncAt) {
                        return;
                    }
                    // Otherwise schedule one trailing check right after the 4s cooldown
                    const waitMs = Math.max(250, 4000 - elapsed + 100);
                    if (!syncState.trailingFallbackTimer) {
                        syncState.trailingFallbackTimer = setTimeout(() => {
                            syncState.trailingFallbackTimer = null;
                            runFallbackSync();
                        }, waitMs);
                    }
                    return;
                }

                syncState.lastServerSyncAt = Date.now();
                invalidateMenuCache();
                try {
                    const refreshed = await apiService.getStoreData({ forceRefresh: true, coalesce: true });
                    notifyStoreListeners({
                        entity: table,
                        action: 'postgres_changes',
                        version: refreshed?.version || null,
                        source: 'postgres_changes'
                    });

                    // If server returned HIT-COALESCED from an earlier cold/build window, schedule one trailing recheck
                    if (syncState.lastFetchCacheStatus === 'HIT-COALESCED' && !syncState.trailingFallbackTimer) {
                        syncState.trailingFallbackTimer = setTimeout(async () => {
                            syncState.trailingFallbackTimer = null;
                            invalidateMenuCache();
                            syncState.lastServerSyncAt = Date.now();
                            try {
                                const updated = await apiService.getStoreData({ forceRefresh: true, coalesce: true });
                                notifyStoreListeners({
                                    entity: table,
                                    action: 'postgres_changes',
                                    version: updated?.version || null,
                                    source: 'postgres_changes'
                                });
                            } catch (retryErr) {
                                console.warn('[StoreSync] Trailing DB sync warning:', retryErr);
                            }
                        }, 2650);
                    }
                } catch (err) {
                    console.warn('[StoreSync] Fallback DB sync warning:', err);
                }
            };

            // Wait briefly so /api/cache-invalidate broadcast handles normal UI edits first
            syncState.fallbackTimer = setTimeout(() => {
                syncState.fallbackTimer = null;
                runFallbackSync();
            }, 1500);
        };

        syncState.realtimeChannel = supabase
            .channel(REALTIME_CHANNEL_NAME)
            .on('broadcast', { event: 'cache_updated' }, handleBroadcastSync)
            .on('broadcast', { event: 'cache_invalidated' }, handleBroadcastSync)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'dishes' }, () => handleFallbackDbChange('dishes'))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => handleFallbackDbChange('categories'))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => handleFallbackDbChange('banners'))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_settings' }, () => handleFallbackDbChange('restaurant_settings'))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => handleFallbackDbChange('tables'))
            .subscribe();
    }
}

function stopStoreSyncIfIdle() {
    if (syncState.listeners.size > 0) return;

    if (syncState.fallbackTimer) {
        clearTimeout(syncState.fallbackTimer);
        syncState.fallbackTimer = null;
    }
    if (syncState.trailingFallbackTimer) {
        clearTimeout(syncState.trailingFallbackTimer);
        syncState.trailingFallbackTimer = null;
    }
    if (syncState.tabChannel) {
        try {
            syncState.tabChannel.close();
        } catch {
            // Ignore close error
        }
        syncState.tabChannel = null;
    }
    if (syncState.realtimeChannel && supabase) {
        supabase.removeChannel(syncState.realtimeChannel).catch(() => {});
        syncState.realtimeChannel = null;
    }
}

async function fetchStoreDirectlyFromSupabase() {
    if (!isSupabaseConfigured || !supabase) {
        throw new Error('Supabase is not configured.');
    }

    const [bannersRes, dishesRes, categoriesRes, settingsRes, tablesRes] = await Promise.all([
        supabase.from('banners').select('*'),
        supabase.from('dishes').select('*'),
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('restaurant_settings').select('*').eq('restaurant_id', 'R001').maybeSingle(),
        supabase.from('tables').select('*').order('table_number', { ascending: true })
    ]);

    const firstError = bannersRes.error || dishesRes.error || categoriesRes.error || settingsRes.error || tablesRes.error;
    if (firstError) {
        throw firstError;
    }

    return applyStoreSnapshotToCache({
        banners: bannersRes.data || [],
        dishes: dishesRes.data || [],
        categories: categoriesRes.data || [],
        settings: settingsRes.data || null,
        tables: tablesRes.data || [],
    });
}


export const apiService = {
    // ----------------------------------------------------
    // UNIFIED SERVER CACHE & REAL-TIME SYNC
    // ----------------------------------------------------
    async getStoreData({ forceRefresh = false, version = null, coalesce = false } = {}) {
        const now = Date.now();
        const versionMatches = !version || (menuCache.storeVersion && menuCache.storeVersion === version);

        if (
            !forceRefresh &&
            versionMatches &&
            menuCache.homeData &&
            menuCache.tables !== null &&
            (now - menuCache.storeTime < CACHE_TTL_MS)
        ) {
            return {
                banners: menuCache.homeData.banners,
                categories: menuCache.categories,
                dishes: menuCache.dishes,
                settings: menuCache.settings,
                tables: menuCache.tables,
                homeData: menuCache.homeData,
                version: menuCache.storeVersion,
            };
        }

        if (
            menuCache.inflightStorePromise &&
            (!forceRefresh || menuCache.inflightStoreForce) &&
            (!version || menuCache.inflightStoreVersion === version)
        ) {
            return menuCache.inflightStorePromise;
        }

        const work = (async () => {
            try {
                const params = new URLSearchParams();
                if (version) {
                    params.set('v', version);
                } else if (forceRefresh) {
                    params.set('refresh', '1');
                    if (coalesce) params.set('coalesce', '1');
                }
                const query = params.toString() ? `?${params.toString()}` : '';

                const res = await fetch(`/api/store-data${query}`, { cache: 'no-store' });
                const contentType = res.headers.get('content-type') || '';
                if (res.ok && contentType.includes('application/json')) {
                    const payload = await res.json();
                    if (payload?.success && payload?.data) {
                        syncState.lastFetchCacheStatus = payload.cacheStatus || res.headers.get('X-Cache') || null;
                        return applyStoreSnapshotToCache(payload.data, payload.version || null);
                    }
                }
            } catch (apiErr) {
                console.warn('[Server Cache] /api/store-data unavailable, falling back to direct Supabase:', apiErr?.message || apiErr);
            }

            syncState.lastFetchCacheStatus = null;
            return fetchStoreDirectlyFromSupabase();
        })().finally(() => {
            if (menuCache.inflightStorePromise === work) {
                menuCache.inflightStorePromise = null;
                menuCache.inflightStoreForce = false;
                menuCache.inflightStoreVersion = null;
            }
        });

        menuCache.inflightStorePromise = work;
        menuCache.inflightStoreForce = forceRefresh;
        menuCache.inflightStoreVersion = version || null;
        return work;
    },

    async invalidateAndRefreshCache(entity = 'all', action = 'update') {
        invalidateMenuCache();
        syncState.lastServerSyncAt = Date.now();

        const runInvalidation = (async () => {
            try {
                const authSession = secureStorage.getItem('orderly_auth_session');
                if (authSession?.token) {
                    const res = await fetch('/api/cache-invalidate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authSession.token}`,
                        },
                        body: JSON.stringify({ entity, action, mode: 'refresh' }),
                    });

                    const contentType = res.headers.get('content-type') || '';
                    if (res.ok && contentType.includes('application/json')) {
                        const payload = await res.json();
                        if (payload?.success) {
                            let fresh;
                            if (payload.data) {
                                fresh = applyStoreSnapshotToCache(payload.data, payload.version || null);
                            } else {
                                invalidateMenuCache();
                                fresh = await this.getStoreData({ version: toServerVersion(payload.version) });
                            }

                            const appliedVersion = fresh?.version || payload.version || null;
                            if (!payload.broadcastSent) {
                                sendClientRealtimeBroadcastFallback({
                                    version: appliedVersion,
                                    entity,
                                    action,
                                    updatedAt: payload.updatedAt || new Date().toISOString(),
                                });
                            }
                            const syncData = {
                                banners: fresh?.banners || [],
                                categories: fresh?.categories || [],
                                dishes: fresh?.dishes || [],
                                settings: fresh?.settings || null,
                                tables: fresh?.tables || [],
                            };
                            broadcastToLocalTabs({
                                type: 'CACHE_UPDATED',
                                entity,
                                action,
                                version: appliedVersion,
                                data: syncData,
                            });
                            notifyStoreListeners({
                                entity,
                                action,
                                version: appliedVersion,
                                source: 'local-mutation',
                            });
                            return payload;
                        }
                    }
                }
            } catch (err) {
                console.warn('[Server Cache] /api/cache-invalidate warning:', err?.message || err);
            }

            // Fallback when API middleware is unavailable (e.g. vite preview): refresh locally & notify tabs
            try {
                invalidateMenuCache();
                const fresh = await this.getStoreData({ forceRefresh: true });
                sendClientRealtimeBroadcastFallback({
                    version: fresh?.version || null,
                    entity,
                    action,
                    updatedAt: new Date().toISOString(),
                });
                broadcastToLocalTabs({
                    type: 'CACHE_UPDATED',
                    entity,
                    action,
                    version: fresh?.version || null,
                    data: {
                        banners: fresh.banners,
                        categories: fresh.categories,
                        dishes: fresh.dishes,
                        settings: fresh.settings,
                        tables: fresh.tables,
                    },
                });
                notifyStoreListeners({ entity, action, version: fresh?.version || null, source: 'local-fallback' });
            } catch {
                notifyStoreListeners({ entity, action, source: 'local-fallback' });
            }
            return null;
        })();

        syncState.pendingInvalidation = runInvalidation;
        try {
            return await runInvalidation;
        } finally {
            if (syncState.pendingInvalidation === runInvalidation) {
                syncState.pendingInvalidation = null;
            }
        }
    },

    subscribeStoreUpdates(callback) {
        if (typeof callback !== 'function') return () => {};
        syncState.listeners.add(callback);
        ensureStoreSyncStarted();
        return () => {
            syncState.listeners.delete(callback);
            stopStoreSyncIfIdle();
        };
    },

    // ----------------------------------------------------
    // RESTAURANT SETTINGS & SERVICE MODE
    // ----------------------------------------------------
    async getRestaurantSettings(forceRefresh = false) {
        try {
            const store = await this.getStoreData({ forceRefresh });
            return store.settings;
        } catch (err) {
            console.warn('Settings fetch error (using fallback settings):', err?.message || err);
            return normalizeSettings(null, readLocalSettingsFallback());
        }
    },

    async getLiveShopStatus() {
        const applyLiveSettings = (rawSettings) => {
            const normalized = normalizeSettings(rawSettings, readLocalSettingsFallback());
            menuCache.settings = normalized;
            menuCache.settingsTime = Date.now();
            if (menuCache.homeData) {
                menuCache.homeData = { ...menuCache.homeData, settings: normalized };
            }
            if (rawSettings) {
                try {
                    secureStorage.setItem('innbite_custom_settings', normalized);
                } catch {
                    // Ignore storage error
                }
            }
            return {
                is_closed: Boolean(normalized.is_closed),
                settings: normalized,
            };
        };

        try {
            const res = await fetch('/api/store-data?statusOnly=1', { cache: 'no-store' });
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
                const payload = await res.json();
                if (payload?.success) {
                    return { ...applyLiveSettings(payload.settings), source: 'api' };
                }
            }
        } catch (apiErr) {
            console.warn('[ShopStatus] /api/store-data?statusOnly=1 unavailable, falling back to direct DB:', apiErr?.message || apiErr);
        }

        if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase
                .from('restaurant_settings')
                .select('*')
                .eq('restaurant_id', 'R001')
                .maybeSingle();
            if (!error && data) {
                return { ...applyLiveSettings(data), source: 'supabase' };
            }
        }

        const fallback = normalizeSettings(menuCache.settings, readLocalSettingsFallback());
        return {
            is_closed: Boolean(fallback.is_closed),
            settings: fallback,
            source: 'local-fallback',
        };
    },

    async updateRestaurantSettings(newSettings) {
        const payload = {
            restaurant_id: 'R001',
            ...newSettings
        };

        // Attempt Supabase upsert before persisting local fallback
        const { error } = await supabase.from('restaurant_settings').upsert([payload]);

        if (error) {
            console.warn('Supabase upsert warning on restaurant_settings:', error);
            // Handle missing columns gracefully if migration hasn't been run yet on database
            if (error.code === 'PGRST204' || error.message?.includes('schema cache')) {
                if (error.message?.includes('is_closed') && payload.is_closed !== undefined) {
                    throw new Error('Database column "is_closed" is missing. Please apply the settings migration in Supabase.');
                }
                const basePayload = {
                    restaurant_id: 'R001',
                    restaurant_name: payload.app_name || payload.restaurant_name || 'InnBite Restaurant',
                    service_mode: payload.service_mode || 'TABLE_SERVICE',
                    ...(payload.is_closed !== undefined ? { is_closed: Boolean(payload.is_closed) } : {})
                };
                const { error: fallbackError } = await supabase.from('restaurant_settings').upsert([basePayload]);
                if (fallbackError) {
                    throw fallbackError;
                }
            } else {
                throw error;
            }
        }

        const normalizedPayload = normalizeSettings(payload, readLocalSettingsFallback());
        menuCache.settings = normalizedPayload;
        menuCache.settingsTime = Date.now();
        if (menuCache.homeData) {
            menuCache.homeData = { ...menuCache.homeData, settings: normalizedPayload };
        }

        try {
            secureStorage.setItem('innbite_custom_settings', normalizedPayload);
        } catch {
            // Ignore storage write error
        }

        await this.invalidateAndRefreshCache('restaurant_settings', 'update');
        return normalizedPayload;
    },

    // ----------------------------------------------------
    // QR CODE VALIDATION & REVOCATION
    // ----------------------------------------------------
    async validateQRCode(qrCode) {
        const store = await this.getStoreData();
        const settings = store.settings;
        if (qrCode === 'common' || qrCode === settings.common_qr_code) {
            if (settings.common_qr_status === 'disabled' || settings.common_qr_status === 'revoked') {
                return { valid: false, reason: 'This QR code is no longer available. Please contact staff.' };
            }
            return { valid: true, type: 'SELF_SERVICE', restaurant_id: settings.restaurant_id, table_id: null, table_number: null };
        }
        
        const tables = store.tables || [];
        const matchedTable = tables.find(t => t.qr_code === qrCode || t.id === qrCode || `tbl-${t.table_number}` === qrCode || `T${t.table_number}` === qrCode || String(t.table_number) === qrCode);
        
        if (!matchedTable) return { valid: false, reason: 'This QR code is invalid or no longer exists.' };
        if (matchedTable.status !== 'active' || matchedTable.revoked) return { valid: false, reason: 'This table QR code is currently unavailable or revoked. Please contact staff.' };
        
        return { valid: true, type: 'TABLE_SERVICE', restaurant_id: settings.restaurant_id, table_id: matchedTable.id, table_number: matchedTable.table_number };
    },

    // ----------------------------------------------------
    // STAFF & AUTHENTICATION (ADMIN / WAITER)
    // ----------------------------------------------------
    async authenticateStaff({ usernameOrEmail, password, authProvider = 'PASSWORD', googleEmail = null, targetRole = null }) {
        const [{ data: waiters = [] }, { data: admins = [] }] = await Promise.all([
            supabase.from('waiters').select('*'),
            supabase.from('admins').select('*')
        ]);
        
        const allUsers = [...(admins || []), ...(waiters || [])];
        let matchedUser = null;
        
        if (authProvider === 'GOOGLE') {
            matchedUser = allUsers.find(u => u.google_email?.toLowerCase() === googleEmail?.toLowerCase() || u.email?.toLowerCase() === googleEmail?.toLowerCase());
            if (!matchedUser) return { success: false, error: `Access denied. The Google account (${googleEmail}) is not authorized.` };
        } else {
            const identifier = usernameOrEmail?.toLowerCase()?.trim();
            const hashedInput = CryptoJS.SHA256(password || '').toString();
            matchedUser = allUsers.find(u => (u.username?.toLowerCase() === identifier || u.email?.toLowerCase() === identifier) && (u.password === password || u.password === hashedInput));
            if (!matchedUser) return { success: false, error: 'Invalid username/email or password.' };
        }
        
        if (targetRole) {
            const isAllowed = matchedUser.role === targetRole || (targetRole === 'ADMIN' && matchedUser.role === 'SUPER_ADMIN');
            if (!isAllowed) return { success: false, error: `Access denied. You do not have ${targetRole} permissions.` };
        }
        if (matchedUser.status === 'DISABLED') return { success: false, error: 'Your account has been disabled. Please contact the administrator.' };
        
        return {
            success: true,
            session: {
                token: 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
                user_id: matchedUser.id,
                name: matchedUser.name,
                email: matchedUser.email,
                role: matchedUser.role,
                restaurant_id: matchedUser.restaurant_id || 'R001',
                authenticated_at: new Date().toISOString()
            }
        };
    },

    async getWaiters() {
        const { data, error } = await supabase.from('waiters').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return (data || []).filter(w => w.role !== 'SYSTEM' && w.id !== 'push_subscriptions_store');
    },

    async saveWaiter(waiterPayload) {
        const newWaiter = {
            id: waiterPayload.id || 'wtr-' + Date.now(),
            name: waiterPayload.name,
            email: waiterPayload.email,
            username: waiterPayload.username || waiterPayload.email.split('@')[0],
            password: waiterPayload.password ? (waiterPayload.password.length === 64 ? waiterPayload.password : CryptoJS.SHA256(waiterPayload.password).toString()) : CryptoJS.SHA256('password123').toString(),
            role: 'WAITER',
            restaurant_id: 'R001',
            status: waiterPayload.status || 'ACTIVE',
            google_email: waiterPayload.google_email || waiterPayload.email
        };
        const { error } = await supabase.from('waiters').upsert([newWaiter]);
        if (error) throw error;
        return newWaiter;
    },

    async toggleWaiterStatus(waiterId) {
        const { data: waiter } = await supabase.from('waiters').select('status').eq('id', waiterId).single();
        if (waiter) {
            const newStatus = waiter.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
            await supabase.from('waiters').update({ status: newStatus }).eq('id', waiterId);
        }
        return true;
    },

    async changePassword({ userId, role, currentPassword, newPassword }) {
        if (!newPassword || newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters long.' };
        }

        let table = (role === 'ADMIN' || role === 'SUPER_ADMIN') ? 'admins' : 'waiters';
        let { data: user } = await supabase.from(table).select('*').eq('id', userId).maybeSingle();

        if (!user) {
            const fallbackTable = table === 'admins' ? 'waiters' : 'admins';
            const { data: fallbackUser } = await supabase.from(fallbackTable).select('*').eq('id', userId).maybeSingle();
            if (fallbackUser) {
                user = fallbackUser;
                table = fallbackTable;
            }
        }

        if (!user) {
            return { success: false, error: 'User account not found.' };
        }

        const hashedCurrent = CryptoJS.SHA256(currentPassword || '').toString();
        if (user.password !== currentPassword && user.password !== hashedCurrent) {
            return { success: false, error: 'Current password is incorrect.' };
        }

        const hashedNew = CryptoJS.SHA256(newPassword).toString();
        const { error: updateError } = await supabase
            .from(table)
            .update({ password: hashedNew })
            .eq('id', user.id);

        if (updateError) {
            return { success: false, error: updateError.message || 'Failed to update password.' };
        }

        return { success: true };
    },

    async adminResetWaiterPassword({ waiterId, newPassword }) {
        if (!newPassword || newPassword.length < 6) {
            return { success: false, error: 'New password must be at least 6 characters long.' };
        }

        const hashedNew = CryptoJS.SHA256(newPassword).toString();
        const { error } = await supabase
            .from('waiters')
            .update({ password: hashedNew })
            .eq('id', waiterId);

        if (error) {
            return { success: false, error: error.message || 'Failed to reset waiter password.' };
        }

        return { success: true };
    },

    // ----------------------------------------------------
    // READ MENU DATA (High Speed Cached)
    // ----------------------------------------------------
    async getHomePageData(forceRefresh = false) {
        const store = await this.getStoreData({ forceRefresh });
        return store.homeData;
    },

    getCategoriesSync() {
        if (menuCache.categories) {
            return menuCache.categories;
        }
        return null;
    },

    getDishesSync(categoryId = null) {
        if (menuCache.dishes) {
            if (!categoryId) return menuCache.dishes;
            if (categoryId === 'popular') {
                return menuCache.dishes.filter(d => (d.is_popular || d.isPopular) && d.is_available !== false);
            }
            if (categoryId === 'special') {
                return menuCache.dishes.filter(d => (d.is_special || d.isSpecial) && d.is_available !== false);
            }
            const targetId = String(categoryId).toLowerCase();
            const categories = menuCache.categories || [];
            const targetCat = categories.find(c => String(c.id).toLowerCase() === targetId || String(c.name).toLowerCase() === targetId);
            const catIdToMatch = targetCat ? String(targetCat.id).toLowerCase() : targetId;
            const catNameToMatch = targetCat ? String(targetCat.name).toLowerCase() : targetId;

            return menuCache.dishes.filter(d => {
                const dCatId = String(d.category_id || d.categoryId || d.category || '').toLowerCase();
                const dCatName = String(d.category_name || '').toLowerCase();
                return dCatId === catIdToMatch || (dCatName && dCatName === catNameToMatch) || dCatId === targetId;
            });
        }
        return null;
    },

    getDishByIdSync(id) {
        if (!id) return null;
        const cached = menuCache.dishMap.get(id);
        if (cached) {
            return cached.data;
        }
        if (menuCache.dishes) {
            const found = menuCache.dishes.find(d => String(d.id) === String(id));
            if (found) {
                menuCache.dishMap.set(id, { data: found, timestamp: Date.now() });
                return found;
            }
        }
        if (menuCache.homeData?.all_dishes) {
            const found = menuCache.homeData.all_dishes.find(d => String(d.id) === String(id));
            if (found) {
                menuCache.dishMap.set(id, { data: found, timestamp: Date.now() });
                return found;
            }
        }
        return null;
    },

    async getCategories(forceRefresh = false) {
        const store = await this.getStoreData({ forceRefresh });
        return store.categories || [];
    },

    async getDishes(categoryId = null, forceRefresh = false) {
        const store = await this.getStoreData({ forceRefresh });
        const dishes = store.dishes || [];

        if (!categoryId) return dishes;

        if (categoryId === 'popular') {
            return dishes.filter(d => (d.is_popular || d.isPopular) && d.is_available !== false);
        }
        if (categoryId === 'special') {
            return dishes.filter(d => (d.is_special || d.isSpecial) && d.is_available !== false);
        }

        const targetId = String(categoryId).toLowerCase();
        const categories = store.categories || [];
        const targetCat = categories.find(c => String(c.id).toLowerCase() === targetId || String(c.name).toLowerCase() === targetId);

        const catIdToMatch = targetCat ? String(targetCat.id).toLowerCase() : targetId;
        const catNameToMatch = targetCat ? String(targetCat.name).toLowerCase() : targetId;

        return dishes.filter(d => {
            const dCatId = String(d.category_id || d.categoryId || d.category || '').toLowerCase();
            const dCatName = String(d.category_name || '').toLowerCase();
            return dCatId === catIdToMatch || (dCatName && dCatName === catNameToMatch) || dCatId === targetId;
        });
    },

    async getDishById(id) {
        if (!id) return null;
        const cached = this.getDishByIdSync(id);
        if (cached && menuCache.dishMap.get(id)?.timestamp && (Date.now() - menuCache.dishMap.get(id).timestamp < CACHE_TTL_MS)) {
            return cached;
        }
        await this.getStoreData();
        const fromStore = this.getDishByIdSync(id);
        if (fromStore) return fromStore;

        const { data, error } = await supabase.from('dishes').select('*').eq('id', id).maybeSingle();
        if (error) throw error;
        if (data) {
            menuCache.dishMap.set(id, { data, timestamp: Date.now() });
        }
        return data || cached;
    },

    // ----------------------------------------------------
    // ORDER CREATION
    // ----------------------------------------------------
    async createOrder(orderPayload) {
        const trimmedCustomerName = (orderPayload.customer_name || '').trim();
        if (!trimmedCustomerName && !orderPayload.is_pos) {
            return { success: false, error: 'Please enter your name before placing the order.' };
        }

        if (!orderPayload.items || orderPayload.items.length === 0) {
            return { success: false, error: 'Your cart is empty.' };
        }

        const isPos = Boolean(orderPayload.is_pos);
        const dispatchWaiterPush = async (insertedOrder) => {
            if (!insertedOrder) return;
            try {
                const isSelf = insertedOrder.service_mode === 'SELF_SERVICE';
                const title = isSelf
                    ? `🆕 Takeaway Order #${insertedOrder.order_number || insertedOrder.id}`
                    : `🔔 New Order - Table #${insertedOrder.table_number}`;
                const body = `Order #${insertedOrder.order_number || insertedOrder.id} · Total: ₹${Number(insertedOrder.total_amount || 0).toFixed(2)} · ${insertedOrder.customer_name || 'Guest'}`;

                await sendPushNotificationToWaiters({
                    title,
                    body,
                    url: '/bite-waiter',
                    tag: `order-${insertedOrder.id}`,
                    orderId: insertedOrder.id,
                    orderNumber: insertedOrder.order_number,
                    tableNumber: insertedOrder.table_number,
                    totalAmount: insertedOrder.total_amount,
                    customerName: insertedOrder.customer_name,
                    serviceMode: insertedOrder.service_mode
                });
            } catch (pushErr) {
                console.warn('[Web Push Dispatch Error]:', pushErr);
            }
        };

        // 1. Authoritative backend API order creation & validation first
        try {
            const headers = { 'Content-Type': 'application/json' };
            const bodyPayload = { ...orderPayload };

            if (isPos) {
                const authSession = secureStorage.getItem('orderly_auth_session');
                if (authSession?.token) {
                    headers['Authorization'] = `Bearer ${authSession.token}`;
                }
                if (authSession?.user_id) {
                    headers['X-Staff-Id'] = String(authSession.user_id);
                    bodyPayload.staff_user_id = authSession.user_id;
                }
            }

            const apiRes = await fetch('/api/create-order', {
                method: 'POST',
                headers,
                body: JSON.stringify(bodyPayload),
            });

            const contentType = apiRes.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const payload = await apiRes.json();

                if (apiRes.ok && payload?.success && payload?.order) {
                    if (!payload.deduplicated) {
                        await dispatchWaiterPush(payload.order);
                    }
                    return {
                        success: true,
                        deduplicated: Boolean(payload.deduplicated),
                        order: payload.order,
                    };
                }

                // Authoritative backend rejection (e.g. SHOP_CLOSED, ITEM_UNAVAILABLE, INVALID_SIGNATURE)
                if (payload?.code === 'SHOP_CLOSED') {
                    if (menuCache.settings) {
                        menuCache.settings = { ...menuCache.settings, is_closed: true };
                    }
                    if (menuCache.homeData?.settings) {
                        menuCache.homeData = {
                            ...menuCache.homeData,
                            settings: { ...menuCache.homeData.settings, is_closed: true },
                        };
                    }
                    notifyStoreListeners({ entity: 'restaurant_settings', action: 'update', source: 'order-rejected' });
                }

                if (apiRes.status < 500 || payload?.code || payload?.error) {
                    return {
                        success: false,
                        code: payload?.code || 'ORDER_REJECTED',
                        error: payload?.error || 'Failed to place order.',
                        paymentId: payload?.paymentId || orderPayload.razorpay_payment_id || null,
                        refund: payload?.refund || null,
                    };
                }
            }
        } catch (apiErr) {
            console.warn('[createOrder] /api/create-order unavailable, using live Supabase fallback:', apiErr?.message || apiErr);
        }

        // 2. Live Supabase fallback when /api/create-order endpoint is unmounted (e.g. static vite preview)
        const liveStatus = await this.getLiveShopStatus();
        const settings = liveStatus.settings || {};
        if (!isPos && liveStatus.is_closed) {
            return {
                success: false,
                code: 'SHOP_CLOSED',
                error: 'The shop is currently closed and is not accepting online orders.',
                paymentId: orderPayload.razorpay_payment_id || null,
            };
        }

        const allDishes = await this.getDishes(null, true);
        const dishMap = new Map((allDishes || []).map(d => [String(d.id), d]));

        let calculatedSubtotal = 0;
        const validatedOrderItems = [];

        for (const item of orderPayload.items) {
            if (!item.quantity || item.quantity <= 0 || item.quantity > 50) {
                return { success: false, error: `Invalid quantity for item ${item.name || 'product'}.` };
            }

            const rawDishId = item.dish_id || item.id;
            const dbDish = dishMap.get(String(rawDishId));

            if (!isPos && (!dbDish || dbDish.is_available === false)) {
                return {
                    success: false,
                    code: 'ITEM_UNAVAILABLE',
                    error: `"${item.name || dbDish?.name || 'Dish'}" is currently unavailable.`
                };
            }

            let unitPrice = Number(item.price || item.unit_price_snapshot || item.unit_price || 0);
            if (dbDish) {
                const portionLabel = (item.portion || item.portion_label || '').toLowerCase();
                const matchedPortion = Array.isArray(dbDish.portions)
                    ? dbDish.portions.find(p => (p.label || '').toLowerCase() === portionLabel || (p.value || '').toLowerCase() === portionLabel)
                    : null;
                if (matchedPortion && matchedPortion.price !== undefined) {
                    unitPrice = Number(matchedPortion.price);
                } else {
                    const basePrice = Number(dbDish.basePrice || dbDish.base_price || 0);
                    if (basePrice > 0) unitPrice = basePrice;
                }
            }

            const itemSubtotal = unitPrice * item.quantity;
            calculatedSubtotal += itemSubtotal;

            validatedOrderItems.push({
                dish_id: rawDishId,
                dish_name: item.name || item.dish_name || dbDish?.name || 'Dish',
                unit_price: unitPrice,
                quantity: item.quantity,
                portion_label: item.portion || 'Regular',
                customizations: item.customizations || {},
                special_instruction: item.special_instruction || item.specialInstruction || '',
                subtotal: itemSubtotal
            });
        }

        const isSelfService = (orderPayload.service_mode || settings.service_mode) === 'SELF_SERVICE';
        const serviceMode = isSelfService ? 'SELF_SERVICE' : 'TABLE_SERVICE';
        const tableId = isSelfService ? null : (orderPayload.table_id || (orderPayload.table_number ? `tbl-${orderPayload.table_number}` : null));
        const tableNumber = isSelfService ? null : (Number(orderPayload.table_number) || 1);

        const { data: latestOrder } = await supabase.from('orders').select('order_number').order('created_at', { ascending: false }).limit(1).maybeSingle();
        let nextOrderNum = latestOrder?.order_number ? (parseInt(latestOrder.order_number, 10) + 1) : 1045;
        if (isNaN(nextOrderNum) || nextOrderNum < 1000) nextOrderNum = 1045;

        const finalTotalAmount = (isPos && orderPayload.total_amount !== undefined && orderPayload.total_amount !== null && !isNaN(Number(orderPayload.total_amount)))
            ? Number(orderPayload.total_amount)
            : Number(calculatedSubtotal.toFixed(2));

        const newOrder = {
            order_number: String(nextOrderNum),
            restaurant_id: settings.restaurant_id || 'R001',
            service_mode: serviceMode,
            table_id: tableId,
            table_number: tableNumber,
            session_id: orderPayload.session_id || 'sess_guest',
            customer_name: trimmedCustomerName || (isPos ? (orderPayload.table_number ? `Table #${orderPayload.table_number}` : 'Counter Customer') : 'Guest'),
            customer_phone: orderPayload.customer_phone || '',
            subtotal: isPos && orderPayload.subtotal !== undefined ? Number(orderPayload.subtotal) : Number(calculatedSubtotal.toFixed(2)),
            discount: isPos && orderPayload.discount !== undefined ? Number(orderPayload.discount) : 0,
            tax_amount: isPos && orderPayload.tax_amount !== undefined ? Number(orderPayload.tax_amount) : 0,
            total_amount: finalTotalAmount,
            status: 'CONFIRMED',
            payment_method: orderPayload.payment_method || 'razorpay',
            payment_status: orderPayload.payment_status || 'SUCCESS',
            razorpay_payment_id: orderPayload.razorpay_payment_id || null,
            idempotency_key: orderPayload.idempotency_key || null,
            is_pos: isPos,
            waiter_name: orderPayload.waiter_name || null,
        };

        let insertResult = await supabase.from('orders').insert([newOrder]).select().single();
        if (insertResult.error && (insertResult.error.code === 'PGRST204' || insertResult.error.message?.includes('schema cache'))) {
            const coreOrder = { ...newOrder };
            delete coreOrder.idempotency_key;
            delete coreOrder.is_pos;
            delete coreOrder.subtotal;
            delete coreOrder.discount;
            delete coreOrder.tax_amount;
            delete coreOrder.waiter_name;
            insertResult = await supabase.from('orders').insert([coreOrder]).select().single();
        }

        if (insertResult.error) {
            if (insertResult.error.code === 'P0001' || insertResult.error.message?.includes('SHOP_CLOSED')) {
                return {
                    success: false,
                    code: 'SHOP_CLOSED',
                    error: 'The shop is currently closed and is not accepting online orders.',
                    paymentId: orderPayload.razorpay_payment_id || null,
                };
            }
            if (insertResult.error.code === '23505' && orderPayload.idempotency_key) {
                const { data: existing } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('idempotency_key', orderPayload.idempotency_key)
                    .maybeSingle();
                if (existing) {
                    return { success: true, deduplicated: true, order: existing };
                }
            }
            throw insertResult.error;
        }

        const insertedOrder = insertResult.data;
        if (insertedOrder) {
            const itemsToInsert = validatedOrderItems.map(item => ({ ...item, order_id: insertedOrder.id }));
            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
            if (itemsError) {
                console.error('[createOrder] Rolling back order due to items insert error:', itemsError);
                await supabase.from('orders').delete().eq('id', insertedOrder.id);
                throw new Error('Failed to save order items. Please try again.');
            }

            await dispatchWaiterPush(insertedOrder);
        }

        return { success: true, deduplicated: false, order: { ...insertedOrder, order_items: validatedOrderItems } };
    },

    async saveOrder(orderPayload) {
        const res = await this.createOrder(orderPayload);
        if (!res.success) throw new Error(res.error || 'Failed to save order.');
        return res.order;
    },

    async getOrders() {
        const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async updateOrderStatus(orderId, status) {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (error) throw error;
        return true;
    },

    async updatePaymentStatus(orderId, payment_status, razorpay_payment_id = null) {
        const payload = { payment_status };
        if (razorpay_payment_id) payload.razorpay_payment_id = razorpay_payment_id;
        const { error } = await supabase.from('orders').update(payload).eq('id', orderId);
        if (error) throw error;
        return true;
    },

    // ----------------------------------------------------
    // TABLES MANAGEMENT
    // ----------------------------------------------------
    async getTables(forceRefresh = false) {
        const store = await this.getStoreData({ forceRefresh });
        return store.tables || [];
    },

    async createTable(tableNumber) {
        const num = Number(tableNumber);
        const newTable = { table_number: num, status: 'active', qr_code: `QR-TBL-${num}`, revoked: false };
        const { data, error } = await supabase.from('tables').insert([newTable]).select().single();
        if (error) throw error;
        await this.invalidateAndRefreshCache('tables', 'create');
        return data;
    },

    async toggleTableRevoked(tableId) {
        const { data: table, error: fetchError } = await supabase
            .from('tables')
            .select('revoked')
            .eq('id', tableId)
            .single();
        if (fetchError) throw fetchError;
        if (!table) throw new Error('Table not found.');

        const { error: updateError } = await supabase
            .from('tables')
            .update({ revoked: !table.revoked })
            .eq('id', tableId);
        if (updateError) throw updateError;

        await this.invalidateAndRefreshCache('tables', 'update');
        return true;
    },

    async deleteTable(tableId) {
        const { error } = await supabase.from('tables').delete().eq('id', tableId);
        if (error) throw error;
        await this.invalidateAndRefreshCache('tables', 'delete');
        return true;
    },

    // ----------------------------------------------------
    // DISH & CATEGORY & BANNER CRUD
    // ----------------------------------------------------
    async saveDish(dishPayload) {
        invalidateMenuCache();

        let oldImages = [];
        if (dishPayload.id) {
            try {
                const { data: oldDish } = await supabase.from('dishes').select('images').eq('id', dishPayload.id).maybeSingle();
                if (oldDish && Array.isArray(oldDish.images)) {
                    oldImages = oldDish.images;
                }
            } catch (e) {
                console.warn('Could not fetch existing dish for image comparison:', e);
            }
        }

        const rawImages = Array.isArray(dishPayload.images) ? dishPayload.images : [dishPayload.imageUrl].filter(Boolean);
        const processedImages = await Promise.all(rawImages.map(img => processAndUploadImage(img, 'dishes')));

        const base_price = Number(dishPayload.basePrice || dishPayload.base_price || 0);
        const supabasePayload = {
            id: dishPayload.id || dishPayload.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4),
            name: dishPayload.name,
            description: dishPayload.description || '',
            preparation: dishPayload.preparation || dishPayload.preparation_details || '',
            base_price: base_price,
            category_id: dishPayload.category_id || dishPayload.category || null,
            images: processedImages,
            portions: dishPayload.portions || [],
            ingredients: dishPayload.ingredients || [],
            ingredients_list: dishPayload.ingredients_list || [],
            allergens: dishPayload.allergens || [],
            taste_profile: dishPayload.tasteProfile || dishPayload.taste_profile || [],
            is_popular: Boolean(dishPayload.is_popular || dishPayload.isPopular),
            is_special: Boolean(dishPayload.is_special || dishPayload.isSpecial),
            is_available: dishPayload.is_available !== false,
            is_veg: dishPayload.is_veg !== undefined ? Boolean(dishPayload.is_veg) : dishPayload.isVeg !== undefined ? Boolean(dishPayload.isVeg) : true
        };
        const { data, error } = await supabase.from('dishes').upsert([supabasePayload]).select().single();
        if (error) throw error;

        // ONLY AFTER successful DB save, delete replaced images from storage
        const removedImages = oldImages.filter(oldUrl => oldUrl && !processedImages.includes(oldUrl));
        if (removedImages.length > 0) {
            await deleteStorageImages(removedImages);
        }

        await this.invalidateAndRefreshCache('dishes', dishPayload.id ? 'update' : 'create');
        return data;
    },

    async deleteDish(dishId) {
        invalidateMenuCache();

        let oldImages = [];
        try {
            const { data: existingDish } = await supabase.from('dishes').select('images').eq('id', dishId).maybeSingle();
            if (existingDish && Array.isArray(existingDish.images)) {
                oldImages = existingDish.images;
            }
        } catch (e) {
            console.warn('Could not fetch dish images prior to delete:', e);
        }

        const { error } = await supabase.from('dishes').delete().eq('id', dishId);
        if (error) throw error;

        // ONLY AFTER successful DB deletion, delete related storage images
        if (oldImages.length > 0) {
            await deleteStorageImages(oldImages);
        }

        await this.invalidateAndRefreshCache('dishes', 'delete');
        return true;
    },

    async toggleDishAvailability(dishId, isAvailable) {
        invalidateMenuCache();
        const { data, error } = await supabase
            .from('dishes')
            .update({ is_available: isAvailable })
            .eq('id', dishId)
            .select()
            .single();
        if (error) {
            console.error('Error updating stock status in Supabase:', error);
            throw error;
        }
        await this.invalidateAndRefreshCache('dishes', 'availability');
        return data;
    },

    async saveCategory(categoryPayload) {
        invalidateMenuCache();

        let oldCategory = null;
        let oldImage = null;
        if (categoryPayload.id) {
            try {
                const { data: oldCat } = await supabase.from('categories').select('*').eq('id', categoryPayload.id).maybeSingle();
                oldCategory = oldCat;
                oldImage = oldCat?.image_url || null;
            } catch (e) {
                console.warn('Could not fetch existing category for comparison:', e);
            }
        }

        const rawImg = categoryPayload.image_url || categoryPayload.image || '';
        const processedImage = await processAndUploadImage(rawImg, 'categories');

        const displayOrder = categoryPayload.display_order ?? oldCategory?.display_order ?? getCategoryPriority(categoryPayload.name);

        const supabasePayload = {
            id: categoryPayload.id || categoryPayload.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-4),
            name: categoryPayload.name,
            description: categoryPayload.description || '',
            image_url: processedImage,
            display_order: displayOrder
        };
        const { data, error } = await supabase.from('categories').upsert([supabasePayload]).select().single();
        if (error) throw error;

        // ONLY AFTER successful DB save, delete replaced image from storage
        if (oldImage && oldImage !== processedImage) {
            await deleteStorageImages([oldImage]);
        }

        await this.invalidateAndRefreshCache('categories', categoryPayload.id ? 'update' : 'create');
        return data;
    },

    async deleteCategory(categoryId) {
        invalidateMenuCache();

        let oldImage = null;
        try {
            const { data: oldCat } = await supabase.from('categories').select('image_url').eq('id', categoryId).maybeSingle();
            oldImage = oldCat?.image_url || null;
        } catch (e) {
            console.warn('Could not fetch category image prior to delete:', e);
        }

        const { error } = await supabase.from('categories').delete().eq('id', categoryId);
        if (error) throw error;

        // ONLY AFTER successful DB deletion, delete related storage image
        if (oldImage) {
            await deleteStorageImages([oldImage]);
        }

        await this.invalidateAndRefreshCache('categories', 'delete');
        return true;
    },

    async saveBanner(bannerPayload) {
        invalidateMenuCache();

        let oldImage = null;
        if (bannerPayload.id) {
            try {
                const { data: oldBanner } = await supabase.from('banners').select('image_url').eq('id', bannerPayload.id).maybeSingle();
                oldImage = oldBanner?.image_url || null;
            } catch (e) {
                console.warn('Could not fetch existing banner for image comparison:', e);
            }
        }

        const rawImg = bannerPayload.image_url || bannerPayload.image || '';
        const processedImage = await processAndUploadImage(rawImg, 'banners');

        const supabasePayload = {
            id: bannerPayload.id || 'banner-' + Date.now(),
            title: bannerPayload.title,
            image_url: processedImage,
            dish_id: bannerPayload.dish_id || null
        };
        const { data, error } = await supabase.from('banners').upsert([supabasePayload]).select().single();
        if (error) throw error;

        // ONLY AFTER successful DB save, delete replaced image from storage
        if (oldImage && oldImage !== processedImage) {
            await deleteStorageImages([oldImage]);
        }

        await this.invalidateAndRefreshCache('banners', bannerPayload.id ? 'update' : 'create');
        return data;
    },

    async deleteBanner(bannerId) {
        invalidateMenuCache();

        let oldImage = null;
        try {
            const { data: oldBanner } = await supabase.from('banners').select('image_url').eq('id', bannerId).maybeSingle();
            oldImage = oldBanner?.image_url || null;
        } catch (e) {
            console.warn('Could not fetch banner image prior to delete:', e);
        }

        const { error } = await supabase.from('banners').delete().eq('id', bannerId);
        if (error) throw error;

        // ONLY AFTER successful DB deletion, delete related storage image
        if (oldImage) {
            await deleteStorageImages([oldImage]);
        }

        await this.invalidateAndRefreshCache('banners', 'delete');
        return true;
    }
};

// Helper to convert dataURL to Blob
const dataURLtoBlob = (dataurl) => {
    if (!dataurl || typeof dataurl !== 'string' || !dataurl.startsWith('data:')) return null;
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/webp';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

// Helper to convert & upload an image to Cloudflare R2 (with Supabase fallback)
export async function processAndUploadImage(imageInput, folder = 'dishes') {
    if (!imageInput) return '';

    // If it's already an existing HTTP(S) URL, keep it
    if (typeof imageInput === 'string' && (imageInput.startsWith('http://') || imageInput.startsWith('https://'))) {
        return imageInput;
    }

    // 1. Auto-crop, convert to WebP, and compress to target budget
    let webpDataUrl = imageInput;
    try {
        const isBanner = folder === 'banners';
        const compressionResult = await autoCropAndCompressToWebP(imageInput, {
            aspect: isBanner ? (16 / 9) : 1,
            maxBytes: isBanner ? (25 * 1024) : (6 * 1024), // 25KB for banners, ~6KB for dishes/categories/logos
            maxDimension: isBanner ? 640 : 240
        });

        if (compressionResult?.dataUrl) {
            webpDataUrl = compressionResult.dataUrl;
        } else if (typeof imageInput === 'string' && (imageInput.startsWith('data:image') || imageInput.startsWith('blob:'))) {
            webpDataUrl = await convertToWebP(imageInput, 0.70);
        }
    } catch (compressErr) {
        console.warn('[Image Compressor] Optimization warning, falling back to basic conversion:', compressErr);
        if (typeof imageInput === 'string' && (imageInput.startsWith('data:image') || imageInput.startsWith('blob:'))) {
            webpDataUrl = await convertToWebP(imageInput, 0.70);
        }
    }

    // 2. Primary: Upload to Cloudflare R2 via serverless endpoint
    try {
        const authSession = secureStorage.getItem('orderly_auth_session');
        const authHeaders = {
            'Content-Type': 'application/json',
            ...(authSession?.token ? { 'Authorization': `Bearer ${authSession.token}` } : {})
        };
        const r2Response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                imageInput: webpDataUrl,
                folder
            })
        });

        if (r2Response.ok) {
            const data = await r2Response.json();
            if (data?.url) {
                return data.url;
            }
        }
    } catch (r2Err) {
        console.warn('[Cloudflare R2 Upload]: Endpoint call failed, attempting Supabase Storage fallback:', r2Err);
    }

    // 3. Fallback: Upload to Supabase Storage if R2 endpoint is unavailable
    if (isSupabaseConfigured && typeof webpDataUrl === 'string' && webpDataUrl.startsWith('data:image')) {
        try {
            const blob = dataURLtoBlob(webpDataUrl);
            if (blob) {
                const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;
                const { data, error } = await supabase.storage
                    .from('menu-images')
                    .upload(fileName, blob, { contentType: 'image/webp', upsert: true });

                if (error) {
                    console.warn('[Supabase Storage Fallback] Upload error:', error.message || error);
                    return webpDataUrl;
                }

                if (data) {
                    const { data: publicUrlData } = supabase.storage
                        .from('menu-images')
                        .getPublicUrl(fileName);
                    return publicUrlData.publicUrl;
                }
            }
        } catch (err) {
            console.warn('[Supabase Storage Fallback] Exception, falling back to data URL:', err);
        }
    }

    return webpDataUrl;
}

// Helper to delete images from Cloudflare R2 and Supabase storage AFTER DB operations succeed
export async function deleteStorageImages(imageUrls) {
    const urls = (Array.isArray(imageUrls) ? imageUrls : [imageUrls]).filter(Boolean);
    if (urls.length === 0) return;

    const r2PublicUrl = (import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/+$/, '');
    const r2UrlsToDelete = [];
    const supabasePathsToDelete = [];

    for (const url of urls) {
        if (typeof url !== 'string') continue;

        if (r2PublicUrl && url.startsWith(r2PublicUrl)) {
            r2UrlsToDelete.push(url);
        } else if (url.includes('/storage/v1/object/public/menu-images/')) {
            const path = url.split('/storage/v1/object/public/menu-images/')[1];
            if (path) supabasePathsToDelete.push(decodeURIComponent(path));
        }
    }

    // Delete from Cloudflare R2
    if (r2UrlsToDelete.length > 0) {
        try {
            const authSession = secureStorage.getItem('orderly_auth_session');
            const authHeaders = {
                'Content-Type': 'application/json',
                ...(authSession?.token ? { 'Authorization': `Bearer ${authSession.token}` } : {})
            };
            await fetch('/api/delete-image', {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ urls: r2UrlsToDelete })
            });
        } catch (r2Err) {
            console.warn('[Cloudflare R2 Delete Warning]:', r2Err);
        }
    }

    // Delete from Supabase Storage
    if (isSupabaseConfigured && supabasePathsToDelete.length > 0) {
        try {
            await supabase.storage.from('menu-images').remove(supabasePathsToDelete);
        } catch (err) {
            console.warn('[Supabase Storage Delete Warning]:', err);
        }
    }
}

