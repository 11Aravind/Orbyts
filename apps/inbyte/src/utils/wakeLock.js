// Screen Wake Lock API utility to keep waiter tablet/phone screen awake

let wakeLockSentinel = null;
let isRequestedByUser = false;

export const isScreenWakeLockSupported = () => {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
};

export const requestScreenWakeLock = async () => {
    isRequestedByUser = true;
    if (!isScreenWakeLockSupported()) {
        console.warn('[WakeLock] Screen Wake Lock API is not supported on this browser.');
        return false;
    }

    try {
        if (wakeLockSentinel && !wakeLockSentinel.released) {
            return true;
        }

        wakeLockSentinel = await navigator.wakeLock.request('screen');
        console.log('[WakeLock] Screen Wake Lock acquired successfully.');

        wakeLockSentinel.addEventListener('release', () => {
            console.log('[WakeLock] Screen Wake Lock was released.');
            wakeLockSentinel = null;
        });

        return true;
    } catch (err) {
        console.warn('[WakeLock] Failed to acquire Screen Wake Lock:', err.message);
        return false;
    }
};

export const releaseScreenWakeLock = async () => {
    isRequestedByUser = false;
    if (wakeLockSentinel) {
        try {
            await wakeLockSentinel.release();
        } catch {
            // Ignore release errors
        }
        wakeLockSentinel = null;
    }
};

export const isWakeLockActive = () => {
    return !!(wakeLockSentinel && !wakeLockSentinel.released);
};

// Auto re-acquire wake lock if tab is restored and was requested
if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible' && isRequestedByUser) {
            await requestScreenWakeLock();
        }
    });
}
