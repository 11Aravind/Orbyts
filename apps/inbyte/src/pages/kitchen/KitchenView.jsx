import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../utils/apiService';
import { useAuth } from '../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../utils/supabase';
import {
    unlockAudio,
    playCustomBellSound,
    startOrderRingingAlarm,
    stopOrderRingingAlarm,
    subscribeOrderRingingState,
    startBackgroundAudioKeepAlive,
    stopBackgroundAudioKeepAlive
} from '../../utils/sound';
import {
    sendSystemNotification,
    requestNotificationPermission,
    getNotificationPermissionStatus,
    subscribeToPushNotifications,
    getPushSubscriptionStatus
} from '../../utils/notifications';
import { BackgroundTimer } from '../../utils/backgroundTimer';
import { requestScreenWakeLock, releaseScreenWakeLock } from '../../utils/wakeLock';
import { toast } from 'react-hot-toast';
import NotificationBlockedModal from '../../components/NotificationBlockedModal';
import NotificationSetupModal from '../../components/NotificationSetupModal';
import {
    ChefHat,
    Plus,
    RefreshCw,
    LayoutGrid,
    User,
    Check,
    CreditCard,
    Clock,
    Bell,
    BellOff,
    X,
    Sparkles,
    CheckCircle2,
    UtensilsCrossed,
    FileText,
    LogOut,
    MessageSquare,
    KeyRound,
    Lock,
    Volume2,
    VolumeX,
    Flame,
    Smartphone
} from 'lucide-react';

const formatOrderDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const timeStr = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    return `${day}/${month}/${year}, ${timeStr}`;
};

const isIncomingOrder = (status) => {
    if (!status) return true;
    const s = String(status || '').toUpperCase();
    return ['CONFIRMED', 'PENDING', 'PLACED', 'NEW', 'ACCEPTED'].includes(s);
};

export default function KitchenView() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const soundEnabled = true;
    const [activeNotifications, setActiveNotifications] = useState([]);
    const [notifPermission, setNotifPermission] = useState(getNotificationPermissionStatus());
    const [showBlockedModal, setShowBlockedModal] = useState(() => getNotificationPermissionStatus() === 'denied');
    const pushSubscribedRef = useRef(false);
    const [isOrderRinging, setIsOrderRinging] = useState(false);

    const previousOrderIdsRef = useRef(new Set());
    const isFirstLoadRef = useRef(true);
    const alertedOrderIdsRef = useRef(new Set());

    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [waiterCurrentPassword, setWaiterCurrentPassword] = useState('');
    const [waiterNewPassword, setWaiterNewPassword] = useState('');
    const [waiterConfirmPassword, setWaiterConfirmPassword] = useState('');
    const [waiterPasswordError, setWaiterPasswordError] = useState('');
    const [isUpdatingWaiterPassword, setIsUpdatingWaiterPassword] = useState(false);

    const addActiveNotification = (newOrder) => {
        if (!newOrder) return;
        if (newOrder.status && !isIncomingOrder(newOrder.status)) return;

        const newId = String(newOrder.id || newOrder.orderId || '');
        const newNum = String(newOrder.order_number || newOrder.orderNumber || '');
        if (!newId && !newNum) return;

        setActiveNotifications(prev => {
            const index = prev.findIndex(o => {
                const oId = String(o.id || o.orderId || '');
                const oNum = String(o.order_number || o.orderNumber || '');
                return (newId && oId && newId === oId) || (newNum && oNum && newNum === oNum);
            });
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = { ...updated[index], ...newOrder };
                return updated;
            }
            return [...prev, newOrder];
        });
    };

    const dismissNotification = (target) => {
        if (!target) return;
        const targetKey = String(typeof target === 'object' ? (target.id || target.orderId || target.order_number || target.orderNumber || '') : target);
        if (!targetKey) return;

        setActiveNotifications(prev => {
            const remaining = prev.filter(o => {
                const oId = String(o.id || o.orderId || '');
                const oNum = String(o.order_number || o.orderNumber || '');
                const isMatch = (oId && oId === targetKey) || (oNum && oNum === targetKey);
                return !isMatch;
            });
            if (remaining.length === 0) {
                stopOrderRingingAlarm();
            }
            return remaining;
        });
    };

    const handleAcceptNotification = (target) => {
        if (!target) return;
        let realId = typeof target === 'object' ? (target.id || target.orderId) : target;
        const targetKey = typeof target === 'object' ? String(target.id || target.orderId || target.order_number || target.orderNumber || '') : String(target);

        const found = activeNotifications.find(o => {
            const oId = String(o.id || o.orderId || '');
            const oNum = String(o.order_number || o.orderNumber || '');
            return (oId && oId === targetKey) || (oNum && oNum === targetKey);
        }) || orders.find(o => {
            const oId = String(o.id || '');
            const oNum = String(o.order_number || '');
            return (oId && oId === targetKey) || (oNum && oNum === targetKey);
        });

        if (found && found.id) {
            realId = found.id;
        }

        if (realId) {
            handleStatusUpdate(realId, 'PREPARING');
        }
        dismissNotification(target);
    };

    const loadOrders = async () => {
        setLoading(true);
        const data = await apiService.getOrders();
        const freshOrders = data || [];

        // Identify newly arrived orders
        const newOrders = freshOrders.filter(o =>
            !previousOrderIdsRef.current.has(o.id) && isIncomingOrder(o.status)
        );

        if (!isFirstLoadRef.current && newOrders.length > 0) {
            newOrders.forEach(order => {
                const orderKey = String(order.id || order.order_number || '');
                const alreadyAlerted = orderKey ? alertedOrderIdsRef.current.has(orderKey) : false;

                if (!alreadyAlerted) {
                    if (orderKey) alertedOrderIdsRef.current.add(orderKey);
                    addActiveNotification(order);
                    if (soundEnabled) {
                        startOrderRingingAlarm(order);
                    }
                    // Dispatch native OS system notification popup with sound whenever an order is detected
                    const orderNum = order.order_number || order.id || '';
                    const isTakeaway = order.service_mode === 'SELF_SERVICE' || (!order.table_number && !order.table_id);
                    sendSystemNotification({
                        title: isTakeaway
                            ? `🆕 Takeaway Order #${orderNum}`
                            : `🔔 New Order - Table #${order.table_number}`,
                        body: `Order #${orderNum} · Total: ₹${Number(order.total_amount || 0).toFixed(2)} · ${order.customer_name || 'Guest'}`,
                        tag: `order-${order.id}`,
                        orderId: order.id,
                        url: '/bite-waiter',
                        playSound: soundEnabled
                    });
                }
            });
        }

        freshOrders.forEach(o => previousOrderIdsRef.current.add(o.id));
        isFirstLoadRef.current = false;

        setOrders(freshOrders);
        setLoading(false);

        // Enrich any active notifications with fresh DB order data, and auto-dismiss any already accepted/preparing
        setActiveNotifications(currentList => {
            if (!currentList || currentList.length === 0) return [];
            return currentList
                .map(current => {
                    const currentId = current.id || current.orderId;
                    const currentNum = current.order_number || current.orderNumber;
                    const matched = freshOrders.find(o => 
                        (currentId && o.id === currentId) || 
                        (currentNum && (String(o.order_number) === String(currentNum) || String(o.id) === String(currentNum)))
                    );
                    if (matched) {
                        return {
                            ...matched,
                            ...current,
                            status: matched.status,
                            id: matched.id,
                            order_number: matched.order_number,
                            total_amount: matched.total_amount,
                            customer_name: matched.customer_name || current.customer_name,
                            table_number: matched.table_number ?? current.table_number,
                            service_mode: matched.service_mode || current.service_mode,
                            order_items: matched.order_items || current.order_items
                        };
                    }
                    return current;
                })
                .filter(o => isIncomingOrder(o.status));
        });
    };

    useEffect(() => {
        loadOrders();
        unlockAudio();
        if (soundEnabled) {
            startBackgroundAudioKeepAlive();
        } else {
            stopBackgroundAudioKeepAlive();
        }

        // Screen Wake Lock keeps tablet/phone screen awake during shifts
        requestScreenWakeLock();

        // Listen for continuous order ringing state (Swiggy / Zomato style)
        const unsubOrderRinging = subscribeOrderRingingState((ringing, data) => {
            setIsOrderRinging(ringing);
            if (ringing && data) {
                addActiveNotification(data);
            }
        });

        // Sync push subscription state
        getPushSubscriptionStatus().then((status) => {
            const isSub = Boolean(status.subscribed);
            pushSubscribedRef.current = isSub;
            if (status.permission === 'granted') {
                subscribeToPushNotifications(user?.id || user?.username || 'waiter').then((res) => {
                    if (res.success) {
                        pushSubscribedRef.current = true;
                    }
                });
            }
        });

        // Listen for Web Push events broadcast from Service Worker or BroadcastChannel
        const handleNewOrderPushEvent = (e) => {
            console.log('[KitchenView] Received order push event:', e.detail);
            const raw = e.detail || {};
            const normalizedOrder = {
                ...raw,
                id: raw.id || raw.orderId,
                orderId: raw.orderId || raw.id,
                order_number: raw.order_number || raw.orderNumber,
                orderNumber: raw.orderNumber || raw.order_number,
                total_amount: raw.total_amount ?? raw.totalAmount ?? 0,
                totalAmount: raw.totalAmount ?? raw.total_amount ?? 0,
                table_number: raw.table_number ?? raw.tableNumber ?? null,
                tableNumber: raw.tableNumber ?? raw.table_number ?? null,
                customer_name: raw.customer_name || raw.customerName || 'Guest Customer',
                customerName: raw.customerName || raw.customer_name || 'Guest Customer',
                service_mode: raw.service_mode || raw.serviceMode || (raw.tableNumber || raw.table_number ? 'TABLE_SERVICE' : 'SELF_SERVICE')
            };

            const orderKey = String(normalizedOrder.id || normalizedOrder.order_number || '');
            if (orderKey) {
                alertedOrderIdsRef.current.add(orderKey);
            }
            // 1. Immediately add to active notifications queue (stacks with any existing toast)
            addActiveNotification(normalizedOrder);
            // 2. Start continuous ringing
            if (soundEnabled) {
                startOrderRingingAlarm(normalizedOrder);
            }
            // 3. Dispatch native system notification popup with sound & vibration
            const orderNum = normalizedOrder.order_number || normalizedOrder.orderNumber || normalizedOrder.id || '';
            const isTakeaway = normalizedOrder.service_mode === 'SELF_SERVICE' || (!normalizedOrder.table_number && !normalizedOrder.tableNumber);
            const tableNum = normalizedOrder.table_number ?? normalizedOrder.tableNumber;
            sendSystemNotification({
                title: isTakeaway
                    ? `🆕 Takeaway Order #${orderNum}`
                    : `🔔 New Order - Table #${tableNum}`,
                body: `Order #${orderNum} · Total: ₹${Number(normalizedOrder.total_amount || normalizedOrder.totalAmount || 0).toFixed(2)} · ${normalizedOrder.customer_name || 'Guest'}`,
                tag: `order-${normalizedOrder.id || orderKey || Date.now()}`,
                orderId: normalizedOrder.id,
                url: '/bite-waiter',
                playSound: soundEnabled
            });
            // 4. Refresh orders list
            loadOrders();
        };
        window.addEventListener('innbite:new-order', handleNewOrderPushEvent);

        // Direct BroadcastChannel listener for zero-delay cross-tab push delivery
        let directBc = null;
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            try {
                directBc = new BroadcastChannel('innbite_orders_channel');
                directBc.onmessage = (event) => {
                    if (event.data?.type === 'NEW_ORDER_PUSH' && event.data.order) {
                        handleNewOrderPushEvent({ detail: event.data.order });
                    }
                };
            } catch {
                // Ignore
            }
        }

        // Web Worker background timer continues regular polling even when tab is minimized
        const bgTimer = new BackgroundTimer(() => {
            loadOrders();
        }, 4000);
        bgTimer.start();

        // Refresh immediately when returning from background or unlocking device
        const handleVisibilityOrFocus = () => {
            if (document.visibilityState === 'visible') {
                loadOrders();
                requestScreenWakeLock();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityOrFocus);
        window.addEventListener('focus', handleVisibilityOrFocus);

        let subscription;
        if (isSupabaseConfigured && supabase) {
            subscription = supabase
                .channel('kitchen_orders')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                    if (payload.new) {
                        const newOrder = payload.new;
                        const orderKey = String(newOrder.id || newOrder.order_number || '');
                        const alreadyAlerted = orderKey ? alertedOrderIdsRef.current.has(orderKey) : false;

                        if (!alreadyAlerted) {
                            if (orderKey) alertedOrderIdsRef.current.add(orderKey);
                            addActiveNotification(newOrder);
                            if (soundEnabled) {
                                startOrderRingingAlarm(newOrder);
                            }
                            // Dispatch local OS notification popup with sound whenever new order arrives
                            const orderNum = newOrder.order_number || newOrder.id || '';
                            const isTakeaway = newOrder.service_mode === 'SELF_SERVICE' || (!newOrder.table_number && !newOrder.table_id);
                            sendSystemNotification({
                                title: isTakeaway
                                    ? `🆕 Takeaway Order #${orderNum}`
                                    : `🔔 New Order - Table #${newOrder.table_number}`,
                                body: `Order #${orderNum} · Total: ₹${Number(newOrder.total_amount || 0).toFixed(2)} · ${newOrder.customer_name || 'Guest'}`,
                                tag: `order-${newOrder.id}`,
                                orderId: newOrder.id,
                                url: '/bite-waiter',
                                playSound: soundEnabled
                            });
                        }
                    }
                    loadOrders();
                })
                .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                    loadOrders();
                })
                .subscribe();
        }

        return () => {
            bgTimer.stop();
            releaseScreenWakeLock();
            unsubOrderRinging();
            stopOrderRingingAlarm();
            stopBackgroundAudioKeepAlive();
            window.removeEventListener('innbite:new-order', handleNewOrderPushEvent);
            if (directBc) {
                try {
                    directBc.close();
                } catch {
                    // Ignore
                }
            }
            document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
            window.removeEventListener('focus', handleVisibilityOrFocus);
            if (subscription) supabase.removeChannel(subscription);
        };
    }, [soundEnabled, user]);

    const [isEnablingAlerts, setIsEnablingAlerts] = useState(false);

    const handleToggleNotifPermission = async () => {
        if (isEnablingAlerts) return;
        setIsEnablingAlerts(true);
        const toastId = toast.loading('Checking permissions & registering lock-screen alerts...');

        try {
            unlockAudio();
            const status = await requestNotificationPermission();
            setNotifPermission(status);

            if (status === 'denied') {
                setShowBlockedModal(true);
                toast.error(
                    '⚠️ Notifications are BLOCKED in your browser! See the step-by-step instructions on screen to Allow alerts.',
                    { id: toastId, duration: 6000 }
                );
                return;
            }

            if (status === 'unsupported') {
                toast.error(
                    'Push notifications are not supported on this browser. On iPhone Safari, tap Share ➔ "Add to Home Screen" first.',
                    { id: toastId, duration: 7000 }
                );
                return;
            }

            if (status === 'granted') {
                const pushRes = await subscribeToPushNotifications(user?.id || user?.username || 'waiter');
                if (pushRes.success) {
                    toast.success('🎉 Lock-Screen & Background Push Alerts Activated!', { id: toastId, duration: 4000 });
                } else {
                    toast.error(
                        'Permission granted, but push registration reported: ' + (pushRes.error || 'Server sync error'),
                        { id: toastId, duration: 6000 }
                    );
                }

                await sendSystemNotification({
                    title: '✅ Lock Screen Alerts Enabled!',
                    body: 'You will receive loud order chimes even when your phone is locked or browser is closed.',
                    url: '/bite-waiter',
                    playSound: true
                });
            } else {
                toast.error('Notification prompt was dismissed (' + status + '). Tap Allow to receive alerts.', { id: toastId, duration: 5000 });
            }
        } catch (err) {
            toast.error('Failed to activate alerts: ' + (err.message || 'Unknown error'), { id: toastId, duration: 6000 });
        } finally {
            setIsEnablingAlerts(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        await apiService.updateOrderStatus(orderId, newStatus);
        setActiveNotifications(prev => {
            const updated = prev
                .map(o => {
                    const k = String(o.id || o.orderId || '');
                    return k === String(orderId) ? { ...o, status: newStatus } : o;
                })
                .filter(o => {
                    const s = String(o.status || '').toUpperCase();
                    return ['CONFIRMED', 'PENDING', 'PLACED', 'NEW', 'ACCEPTED'].includes(s);
                });
            if (updated.length === 0) {
                stopOrderRingingAlarm();
            }
            return updated;
        });
        loadOrders();
    };

    const handleMarkPaid = async (orderId) => {
        await apiService.updatePaymentStatus(orderId, 'SUCCESS');
        setActiveNotifications(prev =>
            prev.map(o => {
                const k = String(o.id || o.orderId || '');
                return k === String(orderId) ? { ...o, payment_status: 'SUCCESS' } : o;
            })
        );
        loadOrders();
    };

    const handleLogout = () => {
        stopOrderRingingAlarm();
        logout();
        navigate('/bite-waiter/login', { replace: true });
    };

    const handleChangeWaiterPassword = async (e) => {
        e.preventDefault();
        setWaiterPasswordError('');

        if (!waiterCurrentPassword) {
            setWaiterPasswordError('Please enter your current password.');
            return;
        }
        if (!waiterNewPassword || waiterNewPassword.length < 6) {
            setWaiterPasswordError('New password must be at least 6 characters long.');
            return;
        }
        if (waiterNewPassword !== waiterConfirmPassword) {
            setWaiterPasswordError('New password and confirmation do not match.');
            return;
        }

        setIsUpdatingWaiterPassword(true);
        const toastId = toast.loading('Updating your password...');
        try {
            const res = await apiService.changePassword({
                userId: user?.id || user?.user_id,
                role: 'WAITER',
                currentPassword: waiterCurrentPassword,
                newPassword: waiterNewPassword
            });

            if (res.success) {
                toast.success('🎉 Your password has been updated!', { id: toastId });
                setShowChangePasswordModal(false);
                setWaiterCurrentPassword('');
                setWaiterNewPassword('');
                setWaiterConfirmPassword('');
            } else {
                toast.error(res.error || 'Failed to update password.', { id: toastId });
                setWaiterPasswordError(res.error || 'Failed to update password.');
            }
        } catch (err) {
            toast.error(err.message || 'Error updating password.', { id: toastId });
            setWaiterPasswordError(err.message || 'Error updating password.');
        } finally {
            setIsUpdatingWaiterPassword(false);
        }
    };

    const activeOrders = orders.filter(o => o.status !== 'SERVED' && o.status !== 'completed' && o.status !== 'CANCELLED');
    const filteredOrders = filterStatus === 'all'
        ? activeOrders
        : activeOrders.filter(o => o.status === filterStatus);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6 font-sans relative overflow-x-hidden">

            {/* Live New Order Heads-Up Alert (Stacked Queue) */}
            {activeNotifications.length > 0 && (
                <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-xl flex flex-col gap-3 pointer-events-none max-h-[90vh] overflow-y-auto pr-1">
                    {/* Multi-Order Overview Banner if 2 or more orders pending */}
                    {activeNotifications.length > 1 && (
                        <div className="pointer-events-auto bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-xs border border-amber-400">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
                                <span>{activeNotifications.length} New Orders Waiting Acceptance!</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isOrderRinging && (
                                    <button
                                        type="button"
                                        onClick={() => stopOrderRingingAlarm()}
                                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                                    >
                                        <VolumeX className="w-3.5 h-3.5" />
                                        <span>Silence</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        activeNotifications.forEach(n => {
                                            let id = n.id || n.orderId;
                                            if (!id && (n.order_number || n.orderNumber)) {
                                                const matched = orders.find(o => String(o.order_number) === String(n.order_number || n.orderNumber));
                                                if (matched?.id) id = matched.id;
                                            }
                                            if (id) handleStatusUpdate(id, 'PREPARING');
                                        });
                                        stopOrderRingingAlarm();
                                        setActiveNotifications([]);
                                    }}
                                    className="px-3 py-1 bg-[#114536] hover:bg-[#0c382b] text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                                >
                                    Accept All ({activeNotifications.length})
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Each Incoming Order Card */}
                    {activeNotifications.map((notif, index) => {
                        const notifOrderId = notif.id || notif.orderId;
                        const notifOrderNum = notif.order_number || notif.orderNumber || (notifOrderId ? String(notifOrderId).slice(-4) : '') || 'NEW';
                        const notifTableNum = notif.table_number ?? notif.tableNumber ?? null;
                        const isTakeaway = notif.service_mode === 'SELF_SERVICE' || (!notifTableNum && !notif.table_id);
                        const notifRawTotal = notif.total_amount ?? notif.totalAmount ?? notif.total ?? 0;
                        const notifTotalFormatted = isNaN(Number(notifRawTotal)) ? '0.00' : Number(notifRawTotal).toFixed(2);
                        const notifCustomerName = notif.customer_name || notif.customerName || 'Guest Customer';
                        const notifItemsCount = (notif.order_items || notif.items || []).length;
                        const notifCreatedAt = notif.created_at || notif.timestamp;
                        const notifKey = String(notifOrderId || notifOrderNum || index);

                        return (
                            <div key={notifKey} className="pointer-events-auto w-full animate-bounce-in">
                                <div className={`rounded-3xl p-5 text-slate-900 shadow-2xl transition-all duration-300 border ${
                                    isOrderRinging
                                        ? 'bg-white border-rose-300 shadow-rose-500/20 ring-4 ring-rose-500/10'
                                        : 'bg-white border-slate-200 shadow-emerald-950/15'
                                }`}>
                                    {/* Header Row: Status badge, Title & Dismiss */}
                                    <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-sm ${
                                                isOrderRinging
                                                    ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
                                                    : 'bg-[#114536] text-white shadow-emerald-950/20'
                                            }`}>
                                                {isOrderRinging ? (
                                                    <Bell className="w-6 h-6 animate-bounce" />
                                                ) : (
                                                    <UtensilsCrossed className="w-6 h-6" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs ${
                                                        isOrderRinging
                                                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                            : 'bg-emerald-100 text-[#114536] border border-emerald-200'
                                                    }`}>
                                                        <Sparkles className="w-3 h-3" />
                                                        {activeNotifications.length > 1
                                                            ? `🚨 Order ${index + 1} of ${activeNotifications.length}`
                                                            : (isOrderRinging ? '🚨 Incoming Order Ringing' : 'New Incoming Order')}
                                                    </span>
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                                        isTakeaway
                                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                        {isTakeaway ? 'Takeaway' : `Table #${notifTableNum}`}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight mt-1">
                                                    {isTakeaway
                                                        ? `Takeaway Order #${notifOrderNum}`
                                                        : `Table #${notifTableNum} · Order #${notifOrderNum}`}
                                                </h3>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => dismissNotification(notif)}
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors shrink-0"
                                            title="Dismiss this order"
                                            aria-label="Dismiss this order"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Order Details Strip */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 my-3.5">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Bill</span>
                                            <span className="text-xl font-black text-slate-900">
                                                ₹{notifTotalFormatted}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Guest</span>
                                            <span className="text-sm font-extrabold text-slate-800 truncate block mt-0.5">
                                                {notifCustomerName}
                                            </span>
                                        </div>
                                        {notifItemsCount > 0 && (
                                            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-200/70 pt-2 sm:pt-0 sm:pl-3">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Items</span>
                                                <span className="text-sm font-black text-slate-800 block mt-0.5">
                                                    {notifItemsCount} {notifItemsCount === 1 ? 'Dish' : 'Dishes'}
                                                </span>
                                            </div>
                                        )}
                                        {notifCreatedAt && (
                                            <div className="col-span-2 sm:col-span-3 border-t border-slate-200/70 pt-2 flex items-center justify-between text-xs">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-[#114536]" /> Ordered At
                                                </span>
                                                <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 text-xs">
                                                    {formatOrderDateTime(notifCreatedAt)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2.5 pt-1">
                                        {isOrderRinging && (
                                            <button
                                                type="button"
                                                onClick={() => stopOrderRingingAlarm()}
                                                className="px-4 py-3 rounded-2xl border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                                            >
                                                <VolumeX className="w-4 h-4 text-rose-600" />
                                                <span>Silence Ring</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleAcceptNotification(notif)}
                                            className="flex-1 py-3 px-5 bg-[#114536] hover:bg-[#0d3429] active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                                            <span>ACCEPT & START PREPARING</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Top Bar Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-6 bg-[#114536] p-5 rounded-3xl shadow-lg text-white gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                        <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-black tracking-tight text-white">
                                Waiter Live Dashboard
                            </h1>
                            <span className="text-[10px] bg-white/15 text-white px-2.5 py-0.5 rounded-md font-mono font-bold border border-white/20">
                                {user?.name || 'Waiter Staff'}
                            </span>
                        </div>
                        <p className="text-xs text-emerald-100/80 font-medium">Real-time waiter notification & order fulfillment</p>
                    </div>
                </div>

                {/* Controls & Actions */}
                <div className="flex items-center gap-2 flex-wrap">

                    <button
                        onClick={() => navigate('/bite-waiter/pos')}
                        className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                        title="Create a new manual order (POS / Table / Counter)"
                    >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Take Order (POS)</span>
                    </button>

                    <button
                        onClick={loadOrders}
                        className="w-9 h-9 rounded-xl bg-white/15 text-white flex items-center justify-center hover:bg-white/25 transition-colors border border-white/20 cursor-pointer"
                        title="Refresh Orders"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => {
                            unlockAudio();
                            playCustomBellSound();
                            toast('Testing notification bell sound...', { icon: '🔔' });
                        }}
                        className="px-3.5 py-2 bg-emerald-500/25 hover:bg-emerald-500/35 text-white text-xs font-bold rounded-xl border border-emerald-300/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Test custom notification bell sound and unlock browser audio"
                    >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Test Bell</span>
                    </button>

                    <button
                        onClick={() => {
                            setWaiterCurrentPassword('');
                            setWaiterNewPassword('');
                            setWaiterConfirmPassword('');
                            setWaiterPasswordError('');
                            setShowChangePasswordModal(true);
                        }}
                        className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        title="Change Your Account Password"
                    >
                        <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                        <span>Change Password</span>
                    </button>

                    <button
                        onClick={handleLogout}
                        className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-white text-xs font-bold rounded-xl border border-rose-300/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5 text-rose-200" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs text-xs mb-6 w-fit">
                {['all', 'CONFIRMED', 'PREPARING', 'READY'].map((st) => (
                    <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${filterStatus === st
                            ? 'bg-[#114536] text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                            }`}
                    >
                        {st === 'all' ? `All Active (${activeOrders.length})` : st}
                    </button>
                ))}
            </div>

            {/* Orders Cards Grid */}
            {loading && orders.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-bold text-xs">Loading live waiter orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
                    <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-lg font-black text-slate-900">No Active Orders</p>
                    <p className="text-xs text-slate-500 mt-1">Confirmed guest orders will appear here automatically with sound alerts</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                    {filteredOrders.map((order) => {
                        const items = order.order_items || order.items || [];
                        const isSelfServiceOrder = order.service_mode === 'SELF_SERVICE' || (!order.table_number && !order.table_id);

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                            >
                                <div>
                                    {/* Card Header */}
                                    <div className="bg-[#114536] p-4 text-white flex justify-between items-center">
                                        <div>
                                            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-200 block">
                                                ORDER #{order.order_number || order.id}
                                            </span>
                                            {isSelfServiceOrder ? (
                                                <span className="text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded block mt-1">
                                                    Takeaway Order
                                                </span>
                                            ) : (
                                                <span className="text-lg font-black text-white block mt-0.5">
                                                    Table #{order.table_number}
                                                </span>
                                            )}
                                        </div>

                                        <span className="text-xs font-black px-3 py-1 rounded-full uppercase bg-white/15 text-white border border-white/20">
                                            {order.status || 'CONFIRMED'}
                                        </span>
                                    </div>

                                    {/* Info Strip */}
                                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500 font-medium">
                                        <span>Customer: <strong className="text-slate-900">{order.customer_name || 'Guest'}</strong></span>
                                        <span className="font-mono text-[11px] text-slate-700 bg-slate-200/70 border border-slate-300/60 px-2.5 py-0.5 rounded-md flex items-center gap-1.5 font-bold">
                                            <Clock className="w-3.5 h-3.5 text-[#114536]" />
                                            {formatOrderDateTime(order.created_at)}
                                        </span>
                                    </div>

                                    {/* Items & Customizations List */}
                                    <div className="p-4 space-y-3 min-h-[140px]">
                                        {items.map((item, idx) => {
                                            const customEntries = Object.entries(item.customizations || {});
                                            const note = item.special_instruction || item.specialInstruction;

                                            return (
                                                <div key={idx} className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-5 h-5 rounded-full bg-[#114536] text-white font-black text-[11px] flex items-center justify-center">
                                                                {item.quantity}
                                                            </span>
                                                            <span className="font-bold text-slate-900 text-sm">
                                                                {item.dish_name || item.name}
                                                            </span>
                                                        </div>
                                                        <span className="font-mono font-bold text-[#114536]">
                                                            ₹{(Number(item.unit_price_snapshot || item.unit_price || item.price || 0) * item.quantity).toFixed(2)}
                                                        </span>
                                                    </div>

                                                    {/* Portion */}
                                                    {item.portion_label && (
                                                        <span className="text-[10px] text-slate-500 font-semibold block">
                                                            Portion: {item.portion_label}
                                                        </span>
                                                    )}

                                                    {/* Customization tags */}
                                                    {customEntries.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 pt-1">
                                                            {customEntries.map(([k, v]) => (
                                                                <span key={k} className="text-[10px] font-bold bg-emerald-50 text-[#114536] px-1.5 py-0.5 rounded border border-[#114536]/20">
                                                                    • {v === 'No' ? `No ${k}` : `${k}: ${v}`}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Special Instructions */}
                                                    {note && (
                                                        <p className="text-[10px] text-amber-900 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 mt-1 flex items-center gap-1">
                                                            <MessageSquare className="w-3 h-3 text-amber-600 shrink-0" />
                                                            <span>"{note}"</span>
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-base font-black text-[#114536]">₹{Number(order.total_amount || 0).toFixed(2)}</span>
                                            {order.payment_status !== 'SUCCESS' && order.payment_status !== 'paid' && (
                                                <button
                                                    onClick={() => handleMarkPaid(order.id)}
                                                    className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded text-[10px] font-extrabold cursor-pointer"
                                                    title="Mark Order Payment as Paid"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5">
                                        {(order.status === 'CONFIRMED' || order.status === 'pending') && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                                                className="px-3.5 py-2 btn-primary text-xs flex items-center gap-1 cursor-pointer"
                                            >
                                                <Flame className="w-3.5 h-3.5" />
                                                <span>Prepare</span>
                                            </button>
                                        )}
                                        {order.status === 'PREPARING' && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'READY')}
                                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Mark Ready</span>
                                            </button>
                                        )}
                                        {(order.status === 'READY' || order.status === 'PREPARING') && (
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'SERVED')}
                                                className="px-3 py-2 btn-secondary text-xs cursor-pointer"
                                            >
                                                Complete / Served
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Device Help Tip for Waiters */}
            <div className="mt-8 pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#114536]" />
                    <span>
                        <strong>Mobile Tip:</strong> On Android, Chrome delivers lock-screen alerts automatically. On <strong>iPhone / iPad</strong> (iOS 16.4+), tap <em>Share ➔ Add to Home Screen</em> to receive push notifications when the screen is locked.
                    </span>
                </div>
                <div className="text-slate-600 text-xs font-mono font-bold">
                    Web Push: RFC 8292 Compliant
                </div>
            </div>

            {/* Waiter Change Password Modal */}
            {showChangePasswordModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-md w-full space-y-4 text-slate-900 animate-fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <KeyRound className="w-4 h-4 text-amber-600" />
                                    Change Waiter Password
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Logged in as <span className="font-bold text-slate-800">{user?.name || user?.username || 'Waiter'}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setShowChangePasswordModal(false)}
                                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {waiterPasswordError && (
                            <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl border border-rose-200">
                                {waiterPasswordError}
                            </div>
                        )}

                        <form onSubmit={handleChangeWaiterPassword} className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Enter current password"
                                    value={waiterCurrentPassword}
                                    onChange={(e) => setWaiterCurrentPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    New Password (Min 6 chars)
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="Enter new password"
                                    value={waiterNewPassword}
                                    onChange={(e) => setWaiterNewPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="Re-enter new password"
                                    value={waiterConfirmPassword}
                                    onChange={(e) => setWaiterConfirmPassword(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-slate-900"
                                />
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowChangePasswordModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingWaiterPassword}
                                    className="flex-1 py-3 bg-[#114536] hover:bg-[#0c382b] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                                    <span>{isUpdatingWaiterPassword ? 'Updating...' : 'Update Password'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* One-Time Waiter Onboarding Notification Setup Modal */}
            <NotificationSetupModal
                isOpen={notifPermission !== 'granted' && !showBlockedModal}
                onEnable={handleToggleNotifPermission}
                isEnabling={isEnablingAlerts}
            />

            {/* Step-by-Step Browser Notification Unblock Instructions Modal */}
            <NotificationBlockedModal
                isOpen={showBlockedModal}
                onClose={() => setShowBlockedModal(false)}
                onCheckAgain={async () => {
                    const current = getNotificationPermissionStatus();
                    setNotifPermission(current);
                    if (current === 'granted') {
                        setShowBlockedModal(false);
                        toast.success('🎉 Notifications unblocked successfully!');
                        await handleToggleNotifPermission();
                    } else {
                        toast.error('Still blocked in browser settings. Please follow the steps above, set to "Allow", and reload.', { duration: 4500 });
                    }
                }}
            />
        </div>
    );
}