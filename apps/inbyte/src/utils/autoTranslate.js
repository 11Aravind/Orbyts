// Automatic live translation service for InnBite
const CACHE_STORAGE_KEY = 'innbite_auto_translations_ml';

// In-Memory cache for 0ms lookups during user session
const memoryCache = new Map();
let cacheLoaded = false;

// Pending requests tracker to prevent duplicate in-flight API calls
const pendingPromises = new Map();

// Listeners subscribed to newly translated keys (used by LanguageContext to trigger re-renders)
const subscribers = new Set();

/**
 * Initializes cache from localStorage
 */
function loadCache() {
    if (cacheLoaded) return;
    cacheLoaded = true;
    try {
        const raw = localStorage.getItem(CACHE_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            Object.entries(parsed).forEach(([key, val]) => {
                if (key && val) memoryCache.set(key, val);
            });
        }
    } catch (e) {
        console.warn('[AutoTranslate] Cache load warning:', e);
    }
}

/**
 * Persists cache to localStorage
 */
function persistCache() {
    try {
        const obj = {};
        memoryCache.forEach((val, key) => {
            obj[key] = val;
        });
        localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
        console.warn('[AutoTranslate] Cache save warning:', e);
    }
}

/**
 * Normalizes string keys for consistent caching
 */
export function normalizeTranslationKey(str) {
    if (!str) return '';
    return String(str)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

/**
 * Checks if a string contains Malayalam characters
 */
export function isMalayalamText(str) {
    return /[\u0D00-\u0D7F]/.test(str || '');
}

/**
 * Synchronously checks if a translation already exists in the cache
 */
export function getCachedTranslation(text) {
    if (!text || isMalayalamText(text)) return text;
    loadCache();
    const key = normalizeTranslationKey(text);
    return memoryCache.get(key) || null;
}

/**
 * Saves a translation to both in-memory cache and localStorage, and notifies subscribers
 */
export function setCachedTranslation(text, translation) {
    if (!text || !translation) return;
    loadCache();
    const key = normalizeTranslationKey(text);
    if (memoryCache.get(key) !== translation) {
        memoryCache.set(key, translation);
        persistCache();
        // Notify all subscribers (LanguageContext) that a new translation arrived
        subscribers.forEach(cb => {
            try {
                cb(key, translation);
            } catch (err) {
                console.error('[AutoTranslate] Subscriber error:', err);
            }
        });
    }
}

/**
 * Subscribes to translation updates
 */
export function subscribeToTranslations(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

/**
 * Fetches automatic translation from `/api/translate` or direct Google Translate
 */
export async function fetchLiveTranslation(text, from = 'en', to = 'ml') {
    if (!text || typeof text !== 'string' || text.trim() === '' || isMalayalamText(text)) {
        return text;
    }

    const trimmed = text.trim();
    const key = normalizeTranslationKey(trimmed);

    // Check cache
    const cached = getCachedTranslation(trimmed);
    if (cached) return cached;

    // Check in-flight duplicate promise
    if (pendingPromises.has(key)) {
        return pendingPromises.get(key);
    }

    const promise = (async () => {
        try {
            // 1. Try local serverless endpoint /api/translate
            try {
                const res = await fetch(`/api/translate?text=${encodeURIComponent(trimmed)}&from=${from}&to=${to}`, {
                    headers: { 'Accept': 'application/json' }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data?.success && data.translation) {
                        setCachedTranslation(trimmed, data.translation);
                        return data.translation;
                    }
                }
            } catch {
                // Ignore and try direct fallback
            }

            // 2. Direct client-side Google GTX fallback
            try {
                const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(trimmed)}`;
                const response = await fetch(gtxUrl);
                if (response.ok) {
                    const gData = await response.json();
                    if (Array.isArray(gData) && Array.isArray(gData[0])) {
                        const translated = gData[0].map(item => item[0]).filter(Boolean).join('');
                        if (translated) {
                            setCachedTranslation(trimmed, translated);
                            return translated;
                        }
                    }
                }
            } catch {
                // Ignore
            }

            // 3. Direct client-side MyMemory fallback
            try {
                const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${from}|${to}`;
                const mmRes = await fetch(mmUrl);
                if (mmRes.ok) {
                    const mmData = await mmRes.json();
                    const trans = mmData?.responseData?.translatedText;
                    if (trans && trans !== trimmed) {
                        setCachedTranslation(trimmed, trans);
                        return trans;
                    }
                }
            } catch {
                // Ignore
            }

            return trimmed;
        } finally {
            pendingPromises.delete(key);
        }
    })();

    pendingPromises.set(key, promise);
    return promise;
}

