import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || 'BCUAacMoWG7Vz-3bSmiI5VYCUgjEnKyOEkytCBJhixIkuCcvYNMTNXNKbIhZhMY1fs5SvzCwE_CfjEldKObVWoc';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@innbite.com';

if (vapidPrivateKey) {
    try {
        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    } catch (e) {
        console.error('[Web Push API] VAPID initialization error:', e);
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bqbztmvvvseolziehhxs.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxYnp0bXZ2dnNlb2x6aWVoaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5ODE0NjgsImV4cCI6MjEwNTU1NzQ2OH0.ZQgF_rf0N8Owwl9375q5PywoaqABfOv22mRfg2Fcdu8';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const {
            title = '🚨 New Food Order Received!',
            body: messageBody = 'Check waiter orders for live details.',
            url = '/bite-waiter',
            tag = 'new-order',
            orderId,
            orderNumber,
            totalAmount,
            tableNumber,
            customerName,
            customer_name,
            serviceMode,
            service_mode
        } = body || {};

        const finalOrderNumber = orderNumber || body?.order_number || '';
        const finalOrderId = orderId || body?.id || '';
        const finalTotalAmount = totalAmount ?? body?.total_amount ?? 0;
        const finalTableNumber = tableNumber ?? body?.table_number ?? null;
        const finalCustomerName = customerName || customer_name || body?.customer_name || 'Guest Customer';
        const finalServiceMode = serviceMode || service_mode || body?.service_mode || (finalTableNumber ? 'TABLE_SERVICE' : 'SELF_SERVICE');

        const resolvedTitle = title !== '🚨 New Food Order Received!'
            ? title
            : (finalTableNumber ? `🔔 New Order - Table #${finalTableNumber}` : `🆕 Takeaway Order #${finalOrderNumber || finalOrderId}`);

        // Gather active subscriptions strictly from database table
        const subscriptionMap = new Map();
        try {
            const { data: dbSubscriptions, error } = await supabase
                .from('waiter_push_subscriptions')
                .select('*');

            if (!error && Array.isArray(dbSubscriptions)) {
                dbSubscriptions.forEach(s => {
                    if (s.endpoint && s.p256dh && s.auth) {
                        subscriptionMap.set(s.endpoint, s);
                    }
                });
            }
        } catch (err) {
            console.warn('[Push API] Could not fetch subscriptions from table:', err.message);
        }

        const subscriptions = Array.from(subscriptionMap.values()).filter(s => {
            if (s.is_local) return false;
            if (s.origin && (s.origin.includes('localhost') || s.origin.includes('127.0.0.1'))) return false;
            return true;
        });

        if (subscriptions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No waiter devices currently registered for push notifications.',
                sentCount: 0
            });
        }

        if (!vapidPrivateKey) {
            console.warn('[Push API] VAPID_PRIVATE_KEY not configured on server.');
            return res.status(200).json({
                success: true,
                message: 'Push skipped: VAPID_PRIVATE_KEY is not configured.',
                sentCount: 0
            });
        }

        const payloadString = JSON.stringify({
            title: resolvedTitle,
            body: messageBody,
            url,
            tag: tag || `order-${finalOrderId || Date.now()}`,
            id: finalOrderId,
            orderId: finalOrderId,
            order_number: finalOrderNumber,
            orderNumber: finalOrderNumber,
            table_number: finalTableNumber,
            tableNumber: finalTableNumber,
            total_amount: finalTotalAmount,
            totalAmount: finalTotalAmount,
            customer_name: finalCustomerName,
            customerName: finalCustomerName,
            service_mode: finalServiceMode,
            serviceMode: finalServiceMode,
            timestamp: Date.now()
        });

        const pushOptions = {
            TTL: 3600,
            urgency: 'high'
        };

        const expiredEndpoints = [];
        let successCount = 0;

        await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth
                    }
                };

                try {
                    await webpush.sendNotification(pushSubscription, payloadString, pushOptions);
                    successCount++;
                } catch (pushErr) {
                    if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
                        expiredEndpoints.push(sub.endpoint);
                    } else {
                        console.warn('[Push API] Error delivering push to endpoint:', sub.endpoint.substring(0, 40), pushErr.message);
                    }
                }
            })
        );

        if (expiredEndpoints.length > 0) {
            try {
                await supabase
                    .from('waiter_push_subscriptions')
                    .delete()
                    .in('endpoint', expiredEndpoints);
            } catch {
                // Ignore cleanup error
            }
        }

        return res.status(200).json({
            success: true,
            message: `Web Push delivered to ${successCount} waiter device(s).`,
            sentCount: successCount,
            totalTargets: subscriptions.length,
            expiredCleaned: expiredEndpoints.length
        });
    } catch (err) {
        console.error('[Push API] Error sending push notification:', err);
        return res.status(500).json({ error: err.message || 'Push dispatch failed.' });
    }
}
