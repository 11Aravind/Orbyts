import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from 'react-use-cart';
import CartItem from '../components/CartItem';
import ShopClosedBanner from '../components/ShopClosedBanner';
import { apiService } from '../utils/apiService';
import { getOrCreateCustomerSession } from '../utils/session';
import { openRazorpayCheckout } from '../utils/razorpay';
import CustomerOrderDetailsModal from '../components/CustomerOrderDetailsModal';
import { CreditCard, AlertCircle, Store, CheckCircle2, ChefHat, ShieldCheck, RefreshCw } from 'lucide-react';
import { secureStorage } from '../utils/secureStorage';
import { addActiveOrderToStorage } from '../utils/orderUtils';
import { useSettings } from '../context/SettingsContext';
import { toast } from 'react-hot-toast';
import { unlockAudio } from '../utils/sound';
import { requestNotificationPermission } from '../utils/notifications';
import { useLanguage } from '../context/LanguageContext';

const CHECKOUT_LOCK_KEY = 'innbite_checkout_lock';
const CHECKOUT_CHANNEL_NAME = 'innbite_checkout_sync';
const CHECKOUT_LOCK_TTL_MS = 120000;

export default function Cart() {
    const navigate = useNavigate();
    const { settings, appName, refreshShopStatus } = useSettings();
    const { t } = useLanguage();
    const {
        items,
        updateItemQuantity,
        updateItem,
        removeItem,
        cartTotal,
        emptyCart,
        isEmpty
    } = useCart();

    const isShopClosed = Boolean(settings?.is_closed);
    const tabIdRef = useRef(`tab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

    const readForeignCheckoutLock = useCallback(() => {
        try {
            const raw = window.localStorage.getItem(CHECKOUT_LOCK_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed?.expiresAt || parsed.expiresAt <= Date.now()) {
                window.localStorage.removeItem(CHECKOUT_LOCK_KEY);
                return null;
            }
            if (parsed.tabId === tabIdRef.current) return null;
            return parsed;
        } catch {
            return null;
        }
    }, []);

    const session = getOrCreateCustomerSession();

    const tableNumber = session.table_number || secureStorage.getItem('orderly_table_number') || '1';

    const [customerName, setCustomerName] = useState(() => {
        return secureStorage.getItem('orderly_customer_name') || '';
    });
    const [customerPhone, setCustomerPhone] = useState(() => {
        return secureStorage.getItem('orderly_customer_phone') || '';
    });

    const handleCustomerNameChange = (e) => {
        const val = e.target.value;
        setCustomerName(val);
        secureStorage.setItem('orderly_customer_name', val);
    };

    const handleCustomerPhoneChange = (e) => {
        const val = e.target.value;
        setCustomerPhone(val);
        secureStorage.setItem('orderly_customer_phone', val);
    };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingMessage, setSubmittingMessage] = useState('Processing...');
    const [orderPlaced, setOrderPlaced] = useState(null);
    const [checkoutError, setCheckoutError] = useState('');
    const [rejectedPaymentNotice, setRejectedPaymentNotice] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [foreignCheckoutLock, setForeignCheckoutLock] = useState(() => readForeignCheckoutLock());

    const isSubmittingRef = useRef(false);
    const isPaymentModalOpenRef = useRef(false);
    const activeRazorpayRef = useRef(null);
    const cancelledDueToCloseRef = useRef(false);
    const prevClosedRef = useRef(isShopClosed);
    const checkoutAttemptRef = useRef({ key: '', cartSignature: '' });

    const cartSignature = `${items.map(i => `${i.id}:${i.quantity}:${i.price}`).join('|')}__${paymentMethod}`;
    if (!isSubmittingRef.current && checkoutAttemptRef.current.cartSignature !== cartSignature) {
        checkoutAttemptRef.current = {
            key: `chk_${session.session_id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            cartSignature,
        };
    }

    const broadcastCheckoutEvent = useCallback((payload) => {
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                const ch = new BroadcastChannel(CHECKOUT_CHANNEL_NAME);
                ch.postMessage(payload);
                ch.close();
            }
        } catch {
            // Ignore BroadcastChannel error
        }
    }, []);

    const acquireTabCheckoutLock = useCallback((attemptId) => {
        const lockObj = {
            tabId: tabIdRef.current,
            attemptId,
            expiresAt: Date.now() + CHECKOUT_LOCK_TTL_MS,
        };
        try {
            window.localStorage.setItem(CHECKOUT_LOCK_KEY, JSON.stringify(lockObj));
        } catch {
            // Ignore storage quota error
        }
        broadcastCheckoutEvent({ type: 'CHECKOUT_STARTED', ...lockObj });
    }, [broadcastCheckoutEvent]);

    const releaseTabCheckoutLock = useCallback(() => {
        try {
            const raw = window.localStorage.getItem(CHECKOUT_LOCK_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.tabId === tabIdRef.current || !parsed?.expiresAt || parsed.expiresAt <= Date.now()) {
                    window.localStorage.removeItem(CHECKOUT_LOCK_KEY);
                }
            }
        } catch {
            // Ignore storage cleanup error
        }
        broadcastCheckoutEvent({ type: 'CHECKOUT_RELEASED', tabId: tabIdRef.current });
    }, [broadcastCheckoutEvent]);

    const broadcastCheckoutCompleted = useCallback((order) => {
        try {
            window.localStorage.setItem(
                'innbite_last_order_sync',
                JSON.stringify({
                    tabId: tabIdRef.current,
                    order,
                    ts: Date.now(),
                })
            );
        } catch {
            // Ignore storage error
        }
        broadcastCheckoutEvent({
            type: 'ORDER_COMPLETED',
            tabId: tabIdRef.current,
            order,
        });
    }, [broadcastCheckoutEvent]);

    // Live Stock Availability State for items in Cart
    const [unavailableItemIds, setUnavailableItemIds] = useState(new Set());

    const checkCartStockAvailability = async () => {
        if (isEmpty) {
            setUnavailableItemIds(new Set());
            return;
        }
        try {
            const dishes = await apiService.getDishes();
            if (!Array.isArray(dishes) || dishes.length === 0) return;
            const dishMap = new Map(dishes.map(d => [String(d.id), d]));
            const unavailSet = new Set();
            for (const item of items) {
                const rawId = item.dish_id || item.id;
                const dbDish = dishMap.get(String(rawId));
                if (!dbDish || dbDish.is_available === false) {
                    unavailSet.add(String(rawId));
                }
            }
            setUnavailableItemIds(unavailSet);
        } catch (e) {
            console.error('Stock check error:', e);
        }
    };

    const checkStockRef = useRef(checkCartStockAvailability);
    checkStockRef.current = checkCartStockAvailability;

    useEffect(() => {
        checkStockRef.current();
    }, [items]);

    useEffect(() => {
        refreshShopStatus();
        const unsubscribe = apiService.subscribeStoreUpdates(() => {
            checkStockRef.current();
        });
        return () => unsubscribe();
    }, [refreshShopStatus]);

    // Track real-time shop open/close transitions without requiring page refresh
    useEffect(() => {
        const wasClosed = prevClosedRef.current;
        if (wasClosed === isShopClosed) return;
        prevClosedRef.current = isShopClosed;

        if (isShopClosed) {
            toast.error(t('shop_closed_title'), { id: 'cart-shop-closed-toast' });
            if (isPaymentModalOpenRef.current) {
                cancelledDueToCloseRef.current = true;
                isPaymentModalOpenRef.current = false;
                setIsPaymentModalOpen(false);
                if (activeRazorpayRef.current && typeof activeRazorpayRef.current.close === 'function') {
                    try {
                        activeRazorpayRef.current.close();
                    } catch {
                        // Ignore third-party modal close restrictions
                    }
                }
                activeRazorpayRef.current = null;
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                releaseTabCheckoutLock();
                const midMsg = t('shop_closed_mid_checkout');
                setCheckoutError(midMsg);
                toast.error(midMsg, { id: 'cart-mid-checkout-closed', duration: 5000 });
            } else {
                setCheckoutError(t('shop_closed_cart_desc'));
            }
        } else {
            cancelledDueToCloseRef.current = false;
            setCheckoutError((prev) => {
                if (!prev) return '';
                const closedTexts = [
                    t('shop_closed_cart_desc'),
                    t('shop_closed_mid_checkout'),
                    t('shop_closed_title'),
                    'The shop is currently closed and is not accepting online orders.'
                ];
                return closedTexts.includes(prev) ? '' : prev;
            });
            toast.success(t('shop_reopened_toast'), { id: 'cart-shop-reopened-toast' });
        }
    }, [isShopClosed, t, releaseTabCheckoutLock]);

    // Safety poll while sitting on checkout page (10s) or while Razorpay modal is active (4s)
    useEffect(() => {
        if (orderPlaced || isEmpty) return;
        const pollIntervalMs = isPaymentModalOpen ? 4000 : 10000;
        const interval = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
            refreshShopStatus();
        }, pollIntervalMs);
        return () => clearInterval(interval);
    }, [isPaymentModalOpen, orderPlaced, isEmpty, refreshShopStatus]);

    // Cross-tab checkout lock, sibling order sync, and back/forward bfcache recovery
    useEffect(() => {
        const handleSiblingOrderCompleted = (completedOrder) => {
            setForeignCheckoutLock(null);
            setCheckoutError('');
            setRejectedPaymentNotice(null);
            emptyCart();
            if (completedOrder) {
                setOrderPlaced(completedOrder);
                try {
                    addActiveOrderToStorage(completedOrder);
                } catch {
                    // Ignore storage error
                }
            }
        };

        let ch = null;
        if (typeof BroadcastChannel !== 'undefined') {
            try {
                ch = new BroadcastChannel(CHECKOUT_CHANNEL_NAME);
                ch.onmessage = (event) => {
                    const msg = event?.data;
                    if (!msg || msg.tabId === tabIdRef.current) return;
                    if (msg.type === 'CHECKOUT_STARTED') {
                        setForeignCheckoutLock(msg);
                    } else if (msg.type === 'CHECKOUT_RELEASED') {
                        setForeignCheckoutLock(readForeignCheckoutLock());
                    } else if (msg.type === 'ORDER_COMPLETED') {
                        handleSiblingOrderCompleted(msg.order);
                    }
                };
            } catch {
                // Ignore BroadcastChannel error
            }
        }

        const handleStorage = (event) => {
            if (event.key === CHECKOUT_LOCK_KEY) {
                setForeignCheckoutLock(readForeignCheckoutLock());
            } else if (event.key === 'innbite_last_order_sync' && event.newValue) {
                try {
                    const parsed = JSON.parse(event.newValue);
                    if (parsed?.tabId !== tabIdRef.current && parsed?.order) {
                        handleSiblingOrderCompleted(parsed.order);
                    }
                } catch {
                    // Ignore malformed sync entry
                }
            }
        };

        const handlePageShow = (event) => {
            setForeignCheckoutLock(readForeignCheckoutLock());
            if (event?.persisted) {
                if (activeRazorpayRef.current && typeof activeRazorpayRef.current.close === 'function') {
                    try {
                        activeRazorpayRef.current.close();
                    } catch {
                        // Ignore close failure
                    }
                }
                activeRazorpayRef.current = null;
                isPaymentModalOpenRef.current = false;
                setIsPaymentModalOpen(false);
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                cancelledDueToCloseRef.current = false;
                releaseTabCheckoutLock();
                refreshShopStatus();
                checkStockRef.current();
            }
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            if (ch) ch.close();
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('pageshow', handlePageShow);
            releaseTabCheckoutLock();
            if (activeRazorpayRef.current && typeof activeRazorpayRef.current.close === 'function') {
                try {
                    activeRazorpayRef.current.close();
                } catch {
                    // Ignore close error on unmount
                }
                activeRazorpayRef.current = null;
            }
        };
    }, [emptyCart, readForeignCheckoutLock, releaseTabCheckoutLock, refreshShopStatus]);

    const paymentModeSetting = settings?.payment_mode || 'BOTH';

    useEffect(() => {
        if (paymentModeSetting === 'PAY_AT_COUNTER') {
            setPaymentMethod('cash_at_counter');
        } else if (paymentModeSetting === 'ONLINE_ONLY') {
            setPaymentMethod('online');
        }
    }, [paymentModeSetting]);

    const isSelfService = (settings?.service_mode || session.service_mode) === 'SELF_SERVICE';
    const hasUnavailableItems = items.some(item => unavailableItemIds.has(String(item.dish_id || item.id)));

    const handleClose = () => {
        navigate(-1);
    };

    const handleSaveOrderState = (orderData) => {
        setOrderPlaced(orderData);
        try {
            addActiveOrderToStorage(orderData);
        } catch (e) {
            console.error('Error saving active order:', e);
        }
    };

    const handlePlaceOrder = async () => {
        if (isEmpty || isSubmittingRef.current) return;

        const existingSiblingLock = readForeignCheckoutLock();
        if (existingSiblingLock) {
            setForeignCheckoutLock(existingSiblingLock);
            const siblingMsg = 'Checkout is already in progress in another tab. Please complete or cancel it there first.';
            setCheckoutError(siblingMsg);
            toast.error(siblingMsg, { duration: 4000 });
            return;
        }

        if (isShopClosed) {
            const closedMsg = t('shop_closed_cart_desc');
            setCheckoutError(closedMsg);
            toast.error(closedMsg, { duration: 4000 });
            return;
        }

        setCheckoutError('');
        setRejectedPaymentNotice(null);

        // 1. Mandatory Customer Name Validation
        const trimmedName = (customerName || '').trim();
        if (!trimmedName) {
            const errorMsg = 'Please enter your name before placing the order.';
            setCheckoutError(errorMsg);
            toast.error(errorMsg, { duration: 4000 });
            const input = document.getElementById('customer-name-input');
            if (input) {
                input.focus();
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        isSubmittingRef.current = true;
        setIsSubmitting(true);
        setSubmittingMessage(t('submitting_menu_check') || 'Checking store status & menu availability...');
        unlockAudio();
        requestNotificationPermission().catch(() => { });

        // 2. Authoritative live store open/close check BEFORE payment or order submission
        try {
            const liveSettings = await refreshShopStatus();
            if (liveSettings?.is_closed) {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                const closedMsg = t('shop_closed_cart_desc');
                setCheckoutError(closedMsg);
                toast.error(closedMsg, { duration: 4500 });
                return;
            }
        } catch (statusErr) {
            console.warn('Pre-checkout store status check error:', statusErr);
        }

        // 3. Pre-checkout Live Database Availability Guard (force fresh check)
        try {
            const freshDishes = await apiService.getDishes(null, true);
            const dishMap = new Map((freshDishes || []).map(d => [String(d.id), d]));
            const unavailableNames = [];
            const unavailSet = new Set();

            if (Array.isArray(freshDishes) && freshDishes.length > 0) {
                for (const item of items) {
                    const rawId = item.dish_id || item.id;
                    const dbDish = dishMap.get(String(rawId));
                    if (!dbDish || dbDish.is_available === false) {
                        unavailableNames.push(item.name || dbDish?.name || 'Dish');
                        unavailSet.add(String(rawId));
                    }
                }
            }

            if (unavailableNames.length > 0) {
                setUnavailableItemIds(unavailSet);
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                const alertMsg = `⚠️ Stock Alert: "${unavailableNames.join(', ')}" is currently out of stock. Please remove unavailable items to checkout.`;
                setCheckoutError(alertMsg);
                toast.error(alertMsg, { duration: 4000 });
                return;
            }
        } catch (e) {
            console.warn('Pre-checkout stock guard check error:', e);
        }

        const checkoutAttemptId = checkoutAttemptRef.current.key || ('chk_' + session.session_id + '_' + Date.now());
        checkoutAttemptRef.current = { key: checkoutAttemptId, cartSignature };
        acquireTabCheckoutLock(checkoutAttemptId);

        const regenerateNextAttemptId = () => {
            checkoutAttemptRef.current = {
                key: `chk_${session.session_id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                cartSignature,
            };
        };

        const orderPayload = {
            idempotency_key: checkoutAttemptId,
            session_id: session.session_id,
            service_mode: isSelfService ? 'SELF_SERVICE' : 'TABLE_SERVICE',
            table_number: isSelfService ? null : tableNumber,
            table_id: isSelfService ? null : `tbl-${tableNumber}`,
            customer_name: trimmedName,
            customer_phone: (customerPhone || '').trim(),
            total_amount: cartTotal,
            items: items.map(item => ({
                id: item.id,
                dish_id: item.dish_id || item.id,
                name: item.name,
                price: item.price,
                portion: item.portion || 'Regular',
                quantity: item.quantity,
                customizations: item.customizations || {},
                special_instruction: item.special_instruction || item.specialInstruction || ''
            }))
        };

        // If paying at counter / cash on shop
        if (paymentMethod === 'cash_at_counter' || paymentModeSetting === 'PAY_AT_COUNTER') {
            try {
                setSubmittingMessage(t('submitting_kitchen_order') || 'Placing order with the kitchen...');
                const counterPayload = {
                    ...orderPayload,
                    payment_method: 'cash_at_counter',
                    payment_status: 'PENDING'
                };
                const res = await apiService.createOrder(counterPayload);
                if (res.success) {
                    handleSaveOrderState(res.order);
                    emptyCart();
                    broadcastCheckoutCompleted(res.order);
                } else {
                    if (res.code === 'SHOP_CLOSED') {
                        await refreshShopStatus();
                    } else if (res.code === 'ITEM_UNAVAILABLE') {
                        checkStockRef.current();
                    }
                    regenerateNextAttemptId();
                    setCheckoutError(res.error || 'Failed to place order.');
                }
            } catch (err) {
                setCheckoutError('Order Error: ' + (err.message || 'Unknown error'));
            } finally {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                releaseTabCheckoutLock();
            }
            return;
        }

        // Online Razorpay Payment
        cancelledDueToCloseRef.current = false;
        try {
            setSubmittingMessage(t('submitting_payment') || 'Opening secure payment gateway...');
            const rzpInstance = await openRazorpayCheckout({
                amount: cartTotal,
                customerName: trimmedName,
                customerPhone: (customerPhone || '').trim() || '9999999999',
                onInstanceReady: (instance) => {
                    activeRazorpayRef.current = instance;
                    isPaymentModalOpenRef.current = true;
                    setIsPaymentModalOpen(true);
                },
                onSuccess: async (razorpayResponse) => {
                    activeRazorpayRef.current = null;
                    isPaymentModalOpenRef.current = false;
                    setIsPaymentModalOpen(false);
                    isSubmittingRef.current = true;
                    setIsSubmitting(true);
                    setSubmittingMessage('Payment received! Verifying transaction...');

                    let verifyHttpOk = true;
                    let verifyJson = null;
                    try {
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(razorpayResponse)
                        });
                        const contentType = verifyRes.headers.get('content-type') || '';
                        if (contentType.includes('application/json')) {
                            verifyJson = await verifyRes.json();
                            verifyHttpOk = verifyRes.ok;
                        }
                    } catch (vErr) {
                        console.warn('[Payment Verify Warning]:', vErr?.message || vErr);
                    }

                    if (verifyJson && (!verifyHttpOk || !verifyJson.success)) {
                        isSubmittingRef.current = false;
                        setIsSubmitting(false);
                        releaseTabCheckoutLock();
                        const verifyErrMsg = verifyJson.error || 'Payment signature verification failed.';
                        setRejectedPaymentNotice({
                            title: 'Payment Verification Failed',
                            message: verifyErrMsg,
                            paymentId: razorpayResponse.razorpay_payment_id || null,
                            refund: null,
                        });
                        setCheckoutError(verifyErrMsg);
                        return;
                    }

                    setSubmittingMessage('Confirming your order with the kitchen...');
                    const finalPayload = {
                        ...orderPayload,
                        payment_method: 'razorpay',
                        payment_status: 'SUCCESS',
                        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                        razorpay_order_id: razorpayResponse.razorpay_order_id,
                        razorpay_signature: razorpayResponse.razorpay_signature
                    };

                    try {
                        const res = await apiService.createOrder(finalPayload);
                        if (res.success) {
                            handleSaveOrderState(res.order);
                            emptyCart();
                            broadcastCheckoutCompleted(res.order);
                        } else {
                            if (res.code === 'SHOP_CLOSED') {
                                await refreshShopStatus();
                            } else if (res.code === 'ITEM_UNAVAILABLE') {
                                checkStockRef.current();
                            }
                            regenerateNextAttemptId();
                            const errMsg = res.error || 'Failed to place order.';
                            setRejectedPaymentNotice({
                                title: res.code === 'SHOP_CLOSED' ? t('shop_closed_payment_title') : 'Order Could Not Be Placed',
                                message: errMsg,
                                paymentId: res.paymentId || razorpayResponse.razorpay_payment_id || null,
                                refund: res.refund || null,
                            });
                            setCheckoutError(errMsg);
                        }
                    } catch (createErr) {
                        setRejectedPaymentNotice({
                            title: 'Order Confirmation Delayed or Failed',
                            message: createErr?.message || 'Unable to confirm order cleanly after payment.',
                            paymentId: razorpayResponse.razorpay_payment_id || null,
                            refund: null,
                        });
                        setCheckoutError('Order Error: ' + (createErr?.message || 'Unknown error'));
                    } finally {
                        isSubmittingRef.current = false;
                        setIsSubmitting(false);
                        releaseTabCheckoutLock();
                    }
                },
                onFailure: async (err) => {
                    activeRazorpayRef.current = null;
                    isPaymentModalOpenRef.current = false;
                    setIsPaymentModalOpen(false);
                    isSubmittingRef.current = false;
                    setIsSubmitting(false);
                    releaseTabCheckoutLock();
                    regenerateNextAttemptId();

                    if (cancelledDueToCloseRef.current) {
                        setCheckoutError(t('shop_closed_mid_checkout'));
                        return;
                    }
                    if (err?.message?.includes('cancelled')) {
                        return;
                    }
                    setCheckoutError('Payment failed: ' + (err?.message || 'Unable to process payment. Please try again.'));
                }
            });

            if (!rzpInstance) {
                activeRazorpayRef.current = null;
                isPaymentModalOpenRef.current = false;
                setIsPaymentModalOpen(false);
                isSubmittingRef.current = false;
                setIsSubmitting(false);
                releaseTabCheckoutLock();
            }
        } catch (err) {
            activeRazorpayRef.current = null;
            isPaymentModalOpenRef.current = false;
            setIsPaymentModalOpen(false);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            releaseTabCheckoutLock();
            setCheckoutError('Checkout Error: ' + (err.message || 'Unknown error'));
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-[#f8fafc] py-8 px-4 font-sans flex items-center justify-center">
                <CustomerOrderDetailsModal
                    order={orderPlaced}
                    onClose={() => navigate('/')}
                    onOrderMore={() => navigate('/')}
                />
            </div>
        );
    }

    return (
        <div className="container relative flex size-full min-h-screen flex-col bg-white justify-between max-w-lg mx-auto font-sans">
            {/* Full-Screen Common Processing Loader Overlay */}
            {isSubmitting && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center font-sans animate-fade-in">
                    {/* Animated Brand Emblem */}
                    <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-full bg-emerald-100 border-2 border-emerald-300 animate-ping absolute inset-0 opacity-30" />
                        <div className="w-24 h-24 rounded-3xl bg-[#114536] text-white flex items-center justify-center shadow-xl shadow-emerald-950/20 relative z-10">
                            <ChefHat className="w-11 h-11 text-emerald-300 stroke-[2.2]" />
                        </div>
                    </div>

                    {/* Status Headings */}
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
                        {'Processing Your Order...'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xs leading-relaxed mb-6">
                        Do not close or refresh this page.
                    </p>

                    {/* Loading Progress Indicator */}
                    <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
                        <div className="h-full bg-[#114536] rounded-full w-2/3 animate-pulse" />
                    </div>

                    {/* Security Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full text-[11px] font-semibold text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Secure Checkout with {appName || 'InnBite'}</span>
                    </div>
                </div>
            )}

            <div>
                {/* Header */}
                <div className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-20">
                    <div
                        className="text-[#171312] flex size-12 shrink-0 items-center cursor-pointer"
                        onClick={handleClose}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                        </svg>
                    </div>
                    <h2 className="text-[#171312] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
                        {t('your_order') || 'Your Order'}
                    </h2>
                </div>

                {/* Service Mode & Table Banner */}
                <div className="p-4">
                    {isSelfService ? (
                        <div className="bg-[#f4f1f1] p-4 rounded-2xl flex items-center gap-3">
                            <div>
                                <span className="text-sm font-bold text-[#171312] uppercase tracking-wider block">
                                    Self-Service Hotel Mode
                                </span>
                                <span className="text-xs text-[#836c67] font-semibold mt-1 block">
                                    No table number required. You will collect your food using your unique Order Number.
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#f4f1f1] p-4 rounded-2xl flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold text-[#836c67] uppercase tracking-wider block">
                                    Table Assignment
                                </span>
                                <span className="text-sm font-black text-[#171312]">
                                    Table #{tableNumber}
                                </span>
                            </div>
                            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                QR Verified
                            </span>










                        </div>
                    )}
                </div>

                {/* Shop Closed Banner */}
                {isShopClosed && (
                    <div className="px-4 pb-3">
                        <ShopClosedBanner variant="cart" />
                    </div>
                )}

                {/* Cross-Tab Checkout Lock Notice */}
                {foreignCheckoutLock && (
                    <div className="mx-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs font-semibold leading-relaxed">
                        <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                        <div>Checkout is currently active in another tab. Please finish or wait before retrying.</div>
                    </div>
                )}

                {/* Payment Reversal / Rejected Online Payment Notice */}
                {rejectedPaymentNotice && (
                    <div
                        role="alert"
                        data-testid="payment-rejected-alert"
                        className="mx-4 mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2 text-amber-950 text-xs leading-relaxed shadow-sm"
                    >
                        <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-sm font-black text-amber-950">{rejectedPaymentNotice.title}</p>
                                <p className="font-semibold text-amber-900">{rejectedPaymentNotice.message}</p>
                                {rejectedPaymentNotice.paymentId && (
                                    <p className="font-mono text-[11px] bg-white/80 border border-amber-200 rounded-lg px-2.5 py-1.5 text-slate-800 break-all">
                                        Payment ID: <strong>{rejectedPaymentNotice.paymentId}</strong>
                                    </p>
                                )}
                                {rejectedPaymentNotice.refund?.refunded ? (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg px-2.5 py-2 font-semibold space-y-0.5">
                                        <p>{t('shop_closed_refund_auto')}</p>
                                        {rejectedPaymentNotice.refund.refundId && (
                                            <p className="font-mono text-[11px]">
                                                Refund ID: <strong>{rejectedPaymentNotice.refund.refundId}</strong>
                                            </p>
                                        )}
                                    </div>
                                ) : rejectedPaymentNotice.paymentId ? (
                                    <p className="text-[11px] font-semibold text-amber-900 bg-white/70 border border-amber-200 rounded-lg px-2.5 py-1.5">
                                        {t('shop_closed_refund_manual')}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Notice */}
                {checkoutError && !rejectedPaymentNotice && (
                    <div className="mx-4 mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-semibold leading-relaxed">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>{checkoutError}</div>
                    </div>
                )}

                {/* Items List */}
                <h3 className="text-[#171312] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-2">
                    Items
                </h3>

                {isEmpty ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-sm font-bold text-[#171312]">{t('cart_empty_title') || 'Your cart is currently empty.'}</p>
                        <p className="text-xs text-[#836c67] mt-1">{t('cart_empty_desc') || 'Scan menu items to add them to your session.'}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 px-6 py-3 bg-[#f4f1f1] text-[#171312] rounded-full text-sm font-bold hover:bg-slate-200 transition-all"
                        >
                            {t('browse_menu') || 'Browse Menu'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {items.map(item => {
                            const rawId = item.dish_id || item.id;
                            const isAvail = !unavailableItemIds.has(String(rawId));
                            return (
                                <CartItem
                                    key={item.id}
                                    {...item}
                                    isAvailable={isAvail}
                                    disableIncrease={isShopClosed}
                                    onIncrease={() => updateItemQuantity(item.id, item.quantity + 1)}
                                    onDecrease={() => updateItemQuantity(item.id, item.quantity - 1)}
                                    onRemove={() => removeItem(item.id)}
                                    onUpdateNotes={(newNote) => updateItem(item.id, { ...item, special_instruction: newNote, specialInstruction: newNote })}
                                />
                            );
                        })}
                    </div>
                )}

                {!isEmpty && (
                    <>
                        {/* Customer Details Form (Required Name) */}
                        <div className="px-4 py-4 space-y-3 border-t border-[#f4f1f1] mt-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[#171312] text-lg font-bold leading-tight tracking-[-0.015em]">
                                    {t('guest_details') || 'Guest Details'}
                                </h3>
                            </div>
                            <div>
                                <input
                                    id="customer-name-input"
                                    type="text"
                                    required
                                    placeholder={t('your_name_placeholder') || 'Your Name (Required) *'}
                                    value={customerName}
                                    onChange={handleCustomerNameChange}
                                    className={`w-full px-4 py-3 bg-[#f4f1f1] rounded-xl text-sm font-medium text-[#171312] outline-none transition-all placeholder:text-[#836c67] ${checkoutError && !customerName.trim()
                                        ? 'border-2 border-rose-400 ring-2 ring-rose-100'
                                        : 'border-none focus:ring-2 focus:ring-slate-300'
                                        }`}
                                />
                                {/* <p className="mt-1.5 text-[11.5px] text-amber-800 bg-amber-50/80 border border-amber-200/70 rounded-lg px-2.5 py-1.5 leading-snug">
                                    ⚠️ <strong>Please enter your correct name:</strong> If there is any issue with your order, staff will call you by this name.
                                </p> */}
                            </div>
                            <input
                                type="tel"
                                placeholder={t('phone_optional_placeholder') || 'Phone Number (Optional)'}
                                value={customerPhone}
                                onChange={handleCustomerPhoneChange}
                                className="w-full px-4 py-3 bg-[#f4f1f1] border-none rounded-xl text-sm font-medium text-[#171312] outline-none focus:ring-2 focus:ring-slate-300 transition-all placeholder:text-[#836c67]"
                            />
                        </div>

                        {/* Payment Method Selector based on App Settings */}
                        <div className="px-4 py-4 space-y-3 border-t border-[#f4f1f1]">
                            <h3 className="text-[#171312] text-lg font-bold leading-tight tracking-[-0.015em]">
                                {t('payment_option') || 'Payment Option'}
                            </h3>

                            {paymentModeSetting === 'ONLINE_ONLY' && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900">
                                    <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold">Online Payment Only (Razorpay / UPI)</p>
                                        <p className="text-[11px] text-emerald-700">Pre-payment required by hotel policy.</p>
                                    </div>
                                </div>
                            )}

                            {paymentModeSetting === 'PAY_AT_COUNTER' && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900">
                                    <Store className="w-5 h-5 text-amber-600 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold">Pay at Cash Counter / Shop</p>
                                        <p className="text-[11px] text-amber-700">Pay cash or card directly when receiving order.</p>
                                    </div>
                                </div>
                            )}

                            {paymentModeSetting === 'BOTH' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => setPaymentMethod('online')}
                                        className={`cursor-pointer p-3 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 ${paymentMethod === 'online'
                                            ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <CreditCard className="w-4 h-4 text-emerald-600" />
                                            {paymentMethod === 'online' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">Pay Online</p>
                                            <p className="text-[10px] text-slate-500">Razorpay / UPI / Cards</p>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setPaymentMethod('cash_at_counter')}
                                        className={`cursor-pointer p-3 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-2 ${paymentMethod === 'cash_at_counter'
                                            ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <Store className="w-4 h-4 text-amber-600" />
                                            {paymentMethod === 'cash_at_counter' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">Pay at Counter</p>
                                            <p className="text-[10px] text-slate-500">Cash / Card at Shop</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <h3 className="text-[#171312] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                            {t('bill_details') || 'Order Summary'}
                        </h3>
                        <div className="p-4">
                            <div className="flex justify-between gap-x-6 py-2">
                                <p className="text-[#836c67] text-sm font-normal leading-normal">{t('item_total') || 'Subtotal'}</p>
                                <p className="text-[#171312] text-sm font-normal leading-normal text-right">₹{cartTotal.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between gap-x-6 py-2">
                                <p className="text-[#836c67] text-sm font-normal leading-normal">{t('taxes_and_charges') || 'Taxes & Fees'}</p>
                                <p className="text-[#171312] text-sm font-normal leading-normal text-right text-emerald-600">Included</p>
                            </div>
                        </div>
                        <div className="p-4 border-t border-[#f4f1f1]">
                            <div className="flex justify-between gap-x-6 py-2">
                                <p className="text-[#836c67] text-sm font-normal leading-normal">{t('grand_total') || 'Total'}</p>
                                <p className="text-[#171312] text-sm font-bold leading-normal text-right">₹{cartTotal.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="h-5 bg-white pb-24"></div>
                    </>
                )}
            </div>

            {/* Sticky Checkout Button */}
            {!isEmpty && (
                <div className="fixed bottom-0 left-0 right-0 bg-white sm:relative z-30">
                    <div className="flex px-4 py-3 max-w-lg mx-auto w-full">
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting || isShopClosed || hasUnavailableItems || Boolean(foreignCheckoutLock)}
                            className={`flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 text-base font-bold leading-normal tracking-[0.015em] transition-transform ${isShopClosed || hasUnavailableItems || foreignCheckoutLock ? 'bg-slate-300 text-slate-600 cursor-not-allowed' : 'bg-[#114536] text-white active:scale-[0.99] hover:bg-[#0c3328] shadow-md shadow-emerald-950/20'} disabled:opacity-60`}
                        >
                            <span className="truncate">
                                {isShopClosed
                                    ? t('shop_closed_btn')
                                    : foreignCheckoutLock
                                        ? 'Checkout Active in Another Tab...'
                                        : hasUnavailableItems
                                            ? 'Remove Out-of-Stock Items to Checkout'
                                            : isSubmitting
                                                ? submittingMessage
                                                : (t('place_order') || 'Checkout')}
                            </span>
                        </button>
                    </div>
                    <div className="h-5 bg-white sm:hidden"></div>
                </div>
            )}
        </div>
    );
}
