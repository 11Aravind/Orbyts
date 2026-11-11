// Service Worker for InnBite Background & Lock Screen Notifications

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Handle Background & Lock Screen Web Push Events
self.addEventListener('push', (event) => {
    let data = {
        title: '🚨 New Food Order Received!',
        body: 'Check waiter dashboard for live order details.',
        url: '/bite-waiter',
        tag: 'new-order-notification'
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        sound: '/order-bell.wav',
        vibrate: [1000, 250, 1000, 250, 1000, 250, 1000, 250, 1000],
        tag: data.tag || `order-${data.orderId || data.orderNumber || 'alert'}`,
        renotify: true,
        requireInteraction: true,
        silent: false,
        data: {
            url: data.url || '/bite-waiter',
            orderId: data.orderId,
            orderNumber: data.orderNumber
        }
    };

    // Broadcast immediately via BroadcastChannel to all active foreground/background tabs
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            const channel = new BroadcastChannel('innbite_orders_channel');
            channel.postMessage({ type: 'NEW_ORDER_PUSH', order: data });
            channel.close();
        }
    } catch {
        // Fallback gracefully
    }

    // Wake up any existing client windows via client.postMessage for dual redundancy
    const broadcastToClients = self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
            clientList.forEach((client) => {
                client.postMessage({ type: 'NEW_ORDER_PUSH', order: data });
            });
        })
        .catch(() => {});

    event.waitUntil(
        Promise.all([
            self.registration.showNotification(data.title, options),
            broadcastToClients
        ])
    );
});

// Handle Notification Clicks (Focus/Open Waiter window & dismiss alarm)
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/bite-waiter';

    // Broadcast STOP_ALARM to active clients regardless of clicked action
    const notifyStopAlarm = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
            client.postMessage({ type: 'STOP_ALARM' });
            client.postMessage({ type: 'PLAY_ORDER_CHIME' });
        });
    });

    if (event.action === 'stop_alarm') {
        event.waitUntil(notifyStopAlarm);
        return;
    }

    event.waitUntil(
        Promise.all([
            notifyStopAlarm,
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url && 'focus' in client) {
                        client.focus();
                        return client.navigate(targetUrl);
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow(targetUrl);
                }
            })
        ])
    );
});
