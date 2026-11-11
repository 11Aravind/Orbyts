import { playCustomBellSound, stopReadyAlarm, stopOrderRingingAlarm } from './sound';

let swRegistration = null;

export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BCUAacMoWG7Vz-3bSmiI5VYCUgjEnKyOEkytCBJhixIkuCcvYNMTNXNKbIhZhMY1fs5SvzCwE_CfjEldKObVWoc';

// Standard utility to convert Base64 URL to Uint8Array for PushManager
export function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Global push event dispatcher to decouple from SW controller readiness
const handleIncomingPushPayload = (eventData) => {
    if (!eventData) return;
    if (eventData.type === 'STOP_ALARM') {
        stopReadyAlarm();
        stopOrderRingingAlarm();
    }
    if (eventData.type === 'PLAY_ORDER_CHIME' || eventData.type === 'PLAY_CUSTOM_BELL') {
        playCustomBellSound();
    }
    if (eventData.type === 'NEW_ORDER_PUSH' && eventData.order) {
        playCustomBellSound();
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('innbite:new-order', { detail: eventData.order }));
        }
    }
};

// 1. Listen on BroadcastChannel for instant zero-latency cross-context messaging
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
        const orderChannel = new BroadcastChannel('innbite_orders_channel');
        orderChannel.onmessage = (event) => {
            handleIncomingPushPayload(event.data);
        };
    } catch {
        // BroadcastChannel fallback
    }
}

// 2. Global navigator.serviceWorker listener
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        handleIncomingPushPayload(event.data);
    });
}

// Register Service Worker for Background & Lock Screen Notifications
export const registerServiceWorker = async () => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            swRegistration = reg;
            console.log('[SW] Service worker registered successfully with scope:', reg.scope);

            navigator.serviceWorker.addEventListener('message', (event) => {
                handleIncomingPushPayload(event.data);
            });

            return reg;
        } catch (err) {
            console.warn('[SW] Service worker registration failed:', err);
        }
    }
    return null;
};

export const isLocalEnvironment = () => {
    if (typeof window === 'undefined') return false;
    return window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local');
};

// Automatically clean up any legacy push subscriptions on localhost to prevent dual notifications
if (typeof window !== 'undefined' && isLocalEnvironment()) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(async (reg) => {
            try {
                const sub = await reg.pushManager.getSubscription();
                if (sub) {
                    console.log('[Web Push] Purging legacy localhost push subscription to prevent duplicate alerts:', sub.endpoint);
                    const endpoint = sub.endpoint;
                    await sub.unsubscribe();
                    await fetch('/api/subscribe-waiter-push', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ endpoint })
                    }).catch(() => {});
                }
            } catch {
                // Ignore cleanup error
            }
        }).catch(() => {});
    }
}

// Request Notification Permission from User
export const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('System notifications are not supported in this browser.');
        return 'unsupported';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission !== 'denied') {
        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch {
            return Notification.permission;
        }
    }

    return Notification.permission;
};

// Get current permission status
export const getNotificationPermissionStatus = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
};

// Subscribe current device to Web Push notifications (works when app is closed / locked)
export const subscribeToPushNotifications = async (waiterId = 'waiter') => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('[Web Push] Push messaging is not supported in this browser.');
        return { success: false, error: 'Push messaging not supported' };
    }

    if (isLocalEnvironment()) {
        console.log('[Web Push] Running in localhost development mode. Skipping remote push registration to prevent duplicate alerts.');
        try {
            await unsubscribeFromPushNotifications();
        } catch {
            // Ignore
        }
        return { success: true, isLocalhost: true, message: 'Localhost mode: push registration skipped.' };
    }

    try {
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
            return { success: false, error: 'Permission not granted', permission };
        }

        // Ensure service worker is registered
        let registration = null;
        if ('serviceWorker' in navigator) {
            try {
                registration = await navigator.serviceWorker.getRegistration();
                if (!registration) {
                    registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
                }
            } catch (swErr) {
                console.warn('[Web Push] SW register error:', swErr);
            }
        }

        if (!registration || !registration.active) {
            registration = await Promise.race([
                navigator.serviceWorker.ready,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Service Worker registration timeout. Please reload the page.')), 4000)
                )
            ]);
        }

        if (!registration || !registration.pushManager) {
            return { success: false, error: 'PushManager not available on this device' };
        }

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });
            console.log('[Web Push] Subscribed to push service:', subscription.endpoint);
        }

        const subJson = subscription.toJSON();

        // Register subscription with serverless backend
        const res = await fetch('/api/subscribe-waiter-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subscription: subJson,
                waiterId: waiterId,
                userAgent: navigator.userAgent
            })
        });

        const data = await res.json().catch(() => ({}));
        console.log('[Web Push] Subscription registered on server:', data);

        if (!res.ok) {
            return { success: false, error: data.error || 'Server registration failed with HTTP ' + res.status };
        }

        return { success: true, subscription: subJson };
    } catch (err) {
        console.error('[Web Push] Failed to subscribe to push notifications:', err);
        return { success: false, error: err.message };
    }
};

// Get active push subscription status
export const getPushSubscriptionStatus = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { supported: false, subscribed: false };
    }
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return {
            supported: true,
            permission: Notification.permission,
            subscribed: Boolean(subscription),
            subscription: subscription ? subscription.toJSON() : null
        };
    } catch {
        return { supported: true, subscribed: false };
    }
};

// Unsubscribe current device from push notifications
export const unsubscribeFromPushNotifications = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { success: false };
    }
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            const endpoint = subscription.endpoint;
            await subscription.unsubscribe();
            await fetch('/api/subscribe-waiter-push', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint })
            });
        }
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

// Dispatch Web Push notification to all active waiter devices via serverless API
export const sendPushNotificationToWaiters = async ({
    title,
    body,
    url = '/bite-waiter',
    tag,
    orderId,
    orderNumber,
    tableNumber,
    totalAmount,
    customerName,
    serviceMode
}) => {
    try {
        const res = await fetch('/api/send-waiter-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                body,
                url,
                tag: tag || `order-${orderId || orderNumber || Date.now()}`,
                orderId,
                orderNumber,
                tableNumber,
                totalAmount,
                customerName,
                serviceMode
            }),
            keepalive: true
        });

        const data = await res.json().catch(() => ({}));
        console.log('[Web Push Dispatch Result]:', data);
        return data;
    } catch (err) {
        console.warn('[Web Push Dispatch Warning]:', err);
        return { success: false, error: err.message };
    }
};

// Send System Native Lock Screen & Pop-up Notification (Local client fallback)
export const sendSystemNotification = async ({
    title,
    body,
    tag,
    orderId,
    url = '/bite-waiter',
    playSound = true
}) => {
    // 1. Play custom order bell audio alert if enabled
    if (playSound) {
        try {
            playCustomBellSound();
        } catch (e) {
            console.warn('Audio playback error:', e);
        }
    }

    // 2. Trigger vibration on mobile device
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate([500, 250, 500, 250, 500]);
        } catch {
            // Ignore vibration error on unsupported platforms
        }
    }

    // 3. Show native system notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const finalTag = tag || (orderId ? `order-${orderId}` : 'new-order');
        const options = {
            body: body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            sound: '/order-bell.wav',
            tag: finalTag,
            renotify: true,
            requireInteraction: true, // Keeps alert visible on lock screen until user interacts
            silent: false,
            data: { url: url },
            vibrate: [1000, 300, 1000, 300, 1000, 300, 1000]
        };

        try {
            // Try Service Worker registration notification first (best for lock screen & background)
            if (!swRegistration && 'serviceWorker' in navigator) {
                swRegistration = await navigator.serviceWorker.ready.catch(() => null);
            }

            if (swRegistration && 'showNotification' in swRegistration) {
                await swRegistration.showNotification(title, options);
            } else {
                const notif = new Notification(title, options);
                notif.onclick = () => {
                    stopReadyAlarm();
                    stopOrderRingingAlarm();
                    window.focus();
                    if (url) window.location.href = url;
                    notif.close();
                };
            }
        } catch (err) {
            console.warn('Failed to display system notification:', err);
        }
    }
};
