import crypto from 'crypto';
import { getServerSupabase } from './_storeCache.js';

const inflightOrderLocks = globalThis.__INNBITE_INFLIGHT_ORDERS__ || (globalThis.__INNBITE_INFLIGHT_ORDERS__ = new Map());
const recentRefundCache = globalThis.__INNBITE_REFUNDS__ || (globalThis.__INNBITE_REFUNDS__ = new Map());

export async function attemptRazorpayRefund({ paymentId, reason = 'Shop closed before order confirmation' } = {}) {
    if (!paymentId || typeof paymentId !== 'string') {
        return { attempted: false, refunded: false, reason: 'Missing Razorpay payment ID.' };
    }

    if (recentRefundCache.has(paymentId)) {
        return recentRefundCache.get(paymentId);
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return {
            attempted: false,
            refunded: false,
            reason: 'Server Razorpay secret credentials are not configured for automatic refund.',
        };
    }

    try {
        const authToken = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const resp = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/refund`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                speed: 'normal',
                notes: { reason },
            }),
        });

        const data = await resp.json().catch(() => ({}));
        if (resp.ok && data?.id) {
            const refundResult = {
                attempted: true,
                refunded: true,
                refundId: data.id,
                status: data.status || 'processed',
            };
            if (recentRefundCache.size > 500) recentRefundCache.clear();
            recentRefundCache.set(paymentId, refundResult);
            return refundResult;
        }

        return {
            attempted: true,
            refunded: false,
            reason: data?.error?.description || `Razorpay refund HTTP ${resp.status}`,
        };
    } catch (err) {
        return {
            attempted: true,
            refunded: false,
            reason: err?.message || 'Automatic refund request failed.',
        };
    }
}

async function findExistingOrder(supabase, { idempotencyKey, razorpayPaymentId }) {
    if (idempotencyKey) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('idempotency_key', idempotencyKey)
                .maybeSingle();
            if (!error && data) return data;
        } catch {
            // Column may not exist if migration 013 is not applied yet
        }
    }

    if (razorpayPaymentId) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('razorpay_payment_id', razorpayPaymentId)
                .maybeSingle();
            if (!error && data) return data;
        } catch {
            // Ignore lookup error
        }
    }

    return null;
}

async function verifyPosStaffAuthorization(supabase, req, orderPayload) {
    const authHeader = req.headers?.['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const staffId = orderPayload?.staff_user_id || req.headers?.['x-staff-id'];
    if (!token || !staffId) {
        return { authorized: false, status: 401, error: 'Unauthorized: POS order requires valid staff authentication.' };
    }

    const [{ data: adminRow }, { data: waiterRow }] = await Promise.all([
        supabase.from('admins').select('id, status').eq('id', staffId).maybeSingle(),
        supabase.from('waiters').select('id, status').eq('id', staffId).maybeSingle(),
    ]);
    const staffRow = adminRow || waiterRow;
    if (!staffRow || staffRow.status === 'DISABLED') {
        return { authorized: false, status: 403, error: 'Forbidden: Staff account is invalid or disabled.' };
    }

    return { authorized: true };
}

function stripOptionalOrderColumns(orderRow) {
    const fallback = { ...orderRow };
    delete fallback.idempotency_key;
    delete fallback.is_pos;
    delete fallback.subtotal;
    delete fallback.discount;
    delete fallback.tax_amount;
    delete fallback.waiter_name;
    return fallback;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Staff-Id');
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    }

    try {
        const orderPayload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
        const isPos = Boolean(orderPayload?.is_pos);
        const idempotencyKey = typeof orderPayload?.idempotency_key === 'string' && orderPayload.idempotency_key.trim()
            ? orderPayload.idempotency_key.trim()
            : null;
        const razorpayPaymentId = typeof orderPayload?.razorpay_payment_id === 'string' && orderPayload.razorpay_payment_id.trim()
            ? orderPayload.razorpay_payment_id.trim()
            : null;

        const trimmedCustomerName = (orderPayload?.customer_name || '').trim();
        if (!trimmedCustomerName && !isPos) {
            return res.status(400).json({ success: false, error: 'Please enter your name before placing the order.' });
        }

        if (!Array.isArray(orderPayload?.items) || orderPayload.items.length === 0) {
            return res.status(400).json({ success: false, error: 'Your cart is empty.' });
        }

        // Verify Razorpay HMAC signature if secret and order signature are present
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (
            keySecret &&
            orderPayload?.razorpay_order_id &&
            orderPayload?.razorpay_signature &&
            razorpayPaymentId
        ) {
            const hmac = crypto.createHmac('sha256', keySecret);
            hmac.update(`${orderPayload.razorpay_order_id}|${razorpayPaymentId}`);
            const expectedSig = hmac.digest('hex');
            if (expectedSig !== orderPayload.razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    code: 'INVALID_PAYMENT_SIGNATURE',
                    error: 'Payment verification failed due to an invalid signature.',
                });
            }
        }

        const lockKey = idempotencyKey
            ? `idem:${idempotencyKey}`
            : (razorpayPaymentId ? `pay:${razorpayPaymentId}` : null);

        if (lockKey && inflightOrderLocks.has(lockKey)) {
            const coalescedResult = await inflightOrderLocks.get(lockKey);
            return res.status(coalescedResult.httpStatus).json(coalescedResult.body);
        }

        const executeCreateOrder = async () => {
            const supabase = getServerSupabase();

            if (isPos) {
                const posAuth = await verifyPosStaffAuthorization(supabase, req, orderPayload);
                if (!posAuth.authorized) {
                    return {
                        httpStatus: posAuth.status,
                        body: { success: false, error: posAuth.error },
                    };
                }
            }

            // 1. Idempotency / duplicate payment check first
            const existingOrder = await findExistingOrder(supabase, {
                idempotencyKey,
                razorpayPaymentId,
            });
            if (existingOrder) {
                return {
                    httpStatus: 200,
                    body: { success: true, deduplicated: true, order: existingOrder },
                };
            }

            // 2. Authoritative live DB check of shop open/closed status & menu dishes
            const [{ data: liveSettings, error: settingsErr }, { data: allDishes, error: dishesErr }] = await Promise.all([
                supabase.from('restaurant_settings').select('*').eq('restaurant_id', 'R001').maybeSingle(),
                supabase.from('dishes').select('*'),
            ]);

            if (settingsErr) {
                throw new Error(`Failed to verify store status: ${settingsErr.message || settingsErr}`);
            }
            if (dishesErr) {
                throw new Error(`Failed to verify menu availability: ${dishesErr.message || dishesErr}`);
            }

            const isShopClosed = Boolean(liveSettings?.is_closed);
            if (!isPos && isShopClosed) {
                const refund = (orderPayload?.payment_method === 'razorpay' && razorpayPaymentId)
                    ? await attemptRazorpayRefund({
                        paymentId: razorpayPaymentId,
                        reason: 'Shop closed before order could be accepted',
                    })
                    : null;

                return {
                    httpStatus: 409,
                    body: {
                        success: false,
                        code: 'SHOP_CLOSED',
                        error: 'The shop is currently closed and is not accepting online orders.',
                        paymentId: razorpayPaymentId,
                        refund,
                    },
                };
            }

            // 3. Validate dishes, availability, quantities, and authoritative pricing
            const dishMap = new Map((allDishes || []).map((d) => [String(d.id), d]));
            let calculatedSubtotal = 0;
            const validatedOrderItems = [];

            for (const item of orderPayload.items) {
                const qty = Number(item?.quantity);
                if (!Number.isInteger(qty) || qty <= 0 || qty > 50) {
                    return {
                        httpStatus: 400,
                        body: {
                            success: false,
                            code: 'INVALID_QUANTITY',
                            error: `Invalid quantity for item ${item?.name || 'product'}.`,
                        },
                    };
                }

                const rawDishId = item.dish_id || item.id;
                const dbDish = dishMap.get(String(rawDishId));

                if (!isPos && (!dbDish || dbDish.is_available === false)) {
                    const refund = (orderPayload?.payment_method === 'razorpay' && razorpayPaymentId)
                        ? await attemptRazorpayRefund({
                            paymentId: razorpayPaymentId,
                            reason: `Dish "${item?.name || dbDish?.name || 'Item'}" became unavailable`,
                        })
                        : null;

                    return {
                        httpStatus: 409,
                        body: {
                            success: false,
                            code: 'ITEM_UNAVAILABLE',
                            error: `"${item?.name || dbDish?.name || 'Dish'}" is currently unavailable.`,
                            paymentId: razorpayPaymentId,
                            refund,
                        },
                    };
                }

                let unitPrice = Number(item.price || item.unit_price_snapshot || item.unit_price || 0);
                if (dbDish) {
                    const portionLabel = (item.portion || item.portion_label || '').toLowerCase();
                    const matchedPortion = Array.isArray(dbDish.portions)
                        ? dbDish.portions.find((p) => (p.label || '').toLowerCase() === portionLabel || (p.value || '').toLowerCase() === portionLabel)
                        : null;
                    if (matchedPortion && matchedPortion.price !== undefined) {
                        unitPrice = Number(matchedPortion.price);
                    } else {
                        const basePrice = Number(dbDish.basePrice || dbDish.base_price || 0);
                        if (basePrice > 0) unitPrice = basePrice;
                    }
                }

                const itemSubtotal = unitPrice * qty;
                calculatedSubtotal += itemSubtotal;

                validatedOrderItems.push({
                    dish_id: rawDishId,
                    dish_name: item.name || item.dish_name || dbDish?.name || 'Dish',
                    unit_price: unitPrice,
                    quantity: qty,
                    portion_label: item.portion || 'Regular',
                    customizations: item.customizations || {},
                    special_instruction: item.special_instruction || item.specialInstruction || '',
                    subtotal: itemSubtotal,
                });
            }

            const effectiveSettings = liveSettings || {};
            const isSelfService = (orderPayload.service_mode || effectiveSettings.service_mode) === 'SELF_SERVICE';
            const serviceMode = isSelfService ? 'SELF_SERVICE' : 'TABLE_SERVICE';
            const tableId = isSelfService ? null : (orderPayload.table_id || (orderPayload.table_number ? `tbl-${orderPayload.table_number}` : null));
            const tableNumber = isSelfService ? null : (Number(orderPayload.table_number) || 1);

            const { data: latestOrder } = await supabase
                .from('orders')
                .select('order_number')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            let nextOrderNum = latestOrder?.order_number ? (parseInt(latestOrder.order_number, 10) + 1) : 1045;
            if (isNaN(nextOrderNum) || nextOrderNum < 1000) nextOrderNum = 1045;

            const finalTotalAmount = isPos && orderPayload.total_amount !== undefined && orderPayload.total_amount !== null && !isNaN(Number(orderPayload.total_amount))
                ? Number(orderPayload.total_amount)
                : Number(calculatedSubtotal.toFixed(2));

            const newOrder = {
                order_number: String(nextOrderNum),
                restaurant_id: effectiveSettings.restaurant_id || 'R001',
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
                razorpay_payment_id: razorpayPaymentId,
                idempotency_key: idempotencyKey,
                is_pos: isPos,
                waiter_name: orderPayload.waiter_name || null,
            };

            let insertedOrder = null;
            let insertResult = await supabase.from('orders').insert([newOrder]).select().single();

            // Fallback gracefully if migration 013 optional columns haven't been applied on live DB yet
            if (insertResult.error && (insertResult.error.code === 'PGRST204' || insertResult.error.message?.includes('schema cache'))) {
                console.warn('[create-order API] Optional columns missing in orders table, falling back to core columns:', insertResult.error.message);
                insertResult = await supabase.from('orders').insert([stripOptionalOrderColumns(newOrder)]).select().single();
            }

            if (insertResult.error) {
                const errMsg = insertResult.error.message || '';
                if (insertResult.error.code === 'P0001' || errMsg.includes('SHOP_CLOSED')) {
                    const refund = (orderPayload?.payment_method === 'razorpay' && razorpayPaymentId)
                        ? await attemptRazorpayRefund({
                            paymentId: razorpayPaymentId,
                            reason: 'Shop closed before order insert committed',
                        })
                        : null;
                    return {
                        httpStatus: 409,
                        body: {
                            success: false,
                            code: 'SHOP_CLOSED',
                            error: 'The shop is currently closed and is not accepting online orders.',
                            paymentId: razorpayPaymentId,
                            refund,
                        },
                    };
                }

                if (insertResult.error.code === '23505') {
                    const winner = await findExistingOrder(supabase, { idempotencyKey, razorpayPaymentId });
                    if (winner) {
                        return {
                            httpStatus: 200,
                            body: { success: true, deduplicated: true, order: winner },
                        };
                    }
                }

                throw insertResult.error;
            }

            insertedOrder = insertResult.data;

            const itemsToInsert = validatedOrderItems.map((item) => ({ ...item, order_id: insertedOrder.id }));
            const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
            if (itemsError) {
                console.error('[create-order API] Rolling back order due to items insert error:', itemsError);
                await supabase.from('orders').delete().eq('id', insertedOrder.id);

                const refund = (orderPayload?.payment_method === 'razorpay' && razorpayPaymentId)
                    ? await attemptRazorpayRefund({
                        paymentId: razorpayPaymentId,
                        reason: 'Order items insert failed; order rolled back',
                    })
                    : null;

                return {
                    httpStatus: 500,
                    body: {
                        success: false,
                        error: 'Failed to save order items. Please try again.',
                        paymentId: razorpayPaymentId,
                        refund,
                    },
                };
            }

            return {
                httpStatus: 201,
                body: {
                    success: true,
                    deduplicated: false,
                    order: { ...insertedOrder, order_items: validatedOrderItems },
                },
            };
        };

        const workPromise = executeCreateOrder().finally(() => {
            if (lockKey && inflightOrderLocks.get(lockKey) === workPromise) {
                inflightOrderLocks.delete(lockKey);
            }
        });

        if (lockKey) {
            inflightOrderLocks.set(lockKey, workPromise);
        }

        const result = await workPromise;
        return res.status(result.httpStatus).json(result.body);
    } catch (err) {
        console.error('[Create Order API Error]:', err);
        return res.status(500).json({
            success: false,
            error: err?.message || 'Internal error creating order.',
        });
    }
}
