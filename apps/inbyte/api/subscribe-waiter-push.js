import { createClient } from '@supabase/supabase-js';

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

    if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { subscription, waiterId, userAgent } = body || {};

            if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
                return res.status(400).json({ error: 'Invalid push subscription payload.' });
            }

            const origin = (req.headers && (req.headers.origin || req.headers.referer)) || '';
            const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1') || Boolean(body?.isLocal);

            if (isLocal) {
                return res.status(200).json({
                    success: true,
                    message: 'Localhost development subscription acknowledged (skipped cloud registration to prevent duplicate alerts).',
                    skippedCloud: true
                });
            }

            const record = {
                waiter_id: waiterId || 'waiter',
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                origin: origin,
                user_agent: userAgent || (req.headers && req.headers['user-agent']) || '',
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('waiter_push_subscriptions')
                .upsert([record], { onConflict: 'endpoint' });

            if (error) {
                console.warn('[Push API] Upsert warning on waiter_push_subscriptions:', error.message);
            }

            return res.status(200).json({
                success: true,
                message: 'Waiter push subscription registered successfully.'
            });
        } catch (err) {
            console.error('[Push API] Error saving subscription:', err);
            return res.status(500).json({ error: err.message || 'Internal server error.' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { endpoint } = body || {};

            if (endpoint) {
                await supabase.from('waiter_push_subscriptions').delete().eq('endpoint', endpoint);
            }

            return res.status(200).json({ success: true, message: 'Unsubscribed successfully.' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === 'GET') {
        try {
            const { count } = await supabase
                .from('waiter_push_subscriptions')
                .select('*', { count: 'exact', head: true });
            return res.status(200).json({ count: count || 0 });
        } catch {
            return res.status(200).json({ count: 0 });
        }
    }

    return res.status(405).json({ error: 'Method not allowed.' });
}
