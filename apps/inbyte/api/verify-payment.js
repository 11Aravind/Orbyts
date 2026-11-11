import crypto from 'crypto';

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

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!razorpay_payment_id) {
            return res.status(400).json({ success: false, error: 'Missing razorpay_payment_id' });
        }

        // If keySecret is configured and order_id was generated on server, verify HMAC SHA256 signature
        if (keySecret && razorpay_order_id && razorpay_signature) {
            const hmac = crypto.createHmac('sha256', keySecret);
            hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
            const generatedSignature = hmac.digest('hex');

            if (generatedSignature !== razorpay_signature) {
                return res.status(400).json({ success: false, error: 'Invalid payment signature.' });
            }
        }

        return res.status(200).json({ success: true, verified: true, paymentId: razorpay_payment_id });
    } catch (e) {
        console.error('[Razorpay Verify Error]:', e);
        return res.status(500).json({ success: false, error: 'Failed to verify payment.' });
    }
}

