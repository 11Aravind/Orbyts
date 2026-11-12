import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../utils/apiService';
import { supabase, isSupabaseConfigured } from '../../utils/supabase';
import { sendSystemNotification, requestNotificationPermission, getNotificationPermissionStatus } from '../../utils/notifications';
import { unlockAudio, playCustomBellSound } from '../../utils/sound';
import { BackgroundTimer } from '../../utils/backgroundTimer';
import { useSettings } from '../../context/SettingsContext';
import { printThermalReceipt } from '../../utils/printReceipt';
import AdminSkeletonTable from '../../components/AdminSkeletonTable';
import NotificationBlockedModal from '../../components/NotificationBlockedModal';
import {
    Receipt,
    RefreshCw,
    CreditCard,
    Volume2,
    VolumeX,
    MessageSquare,
    Printer,
    Bell,
    BellOff,
    Plus,
    Search,
    Calendar,
    ChevronLeft,
    ChevronRight,
    X,
    RotateCcw
} from 'lucide-react';

const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    return `${day}/${month}/${year}, ${timeStr}`;
};

const getLocalDateString = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getTodayDateString = () => {
    return getLocalDateString(new Date());
};

const getYesterdayDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
};

export default function AdminOrders() {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search states
    const todayStr = useMemo(() => getTodayDateString(), []);
    const yesterdayStr = useMemo(() => getYesterdayDateString(), []);
    const [filterDate, setFilterDate] = useState(todayStr); // Defaults to today
    const [searchOrderNumber, setSearchOrderNumber] = useState('');
    const [filterPayment, setFilterPayment] = useState('all');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [soundEnabled, setSoundEnabled] = useState(true);
    const [notifPermission, setNotifPermission] = useState(getNotificationPermissionStatus());
    const [showBlockedModal, setShowBlockedModal] = useState(false);

    const previousOrderIdsRef = useRef(new Set());
    const alertedOrderIdsRef = useRef(new Set());
    const isFirstLoadRef = useRef(true);
    const soundEnabledRef = useRef(soundEnabled);

    useEffect(() => {
        soundEnabledRef.current = soundEnabled;
    }, [soundEnabled]);

    const triggerOrderNotification = (order) => {
        if (!order || !order.id || !soundEnabledRef.current) return;
        const orderKey = String(order.id);
        if (alertedOrderIdsRef.current.has(orderKey)) return;
        alertedOrderIdsRef.current.add(orderKey);
        previousOrderIdsRef.current.add(order.id);

        const orderNum = order.order_number || order.id || '';
        const isTakeaway = order.service_mode === 'SELF_SERVICE' || (!order.table_number && !order.table_id);
        sendSystemNotification({
            title: isTakeaway
                ? `🆕 Takeaway Order #${orderNum}`
                : `🔔 New Order - Table #${order.table_number}`,
            body: `Order #${orderNum} · Total: ₹${Number(order.total_amount || 0).toFixed(2)} · ${order.customer_name || 'Guest'}`,
            tag: `order-${order.id}`,
            orderId: order.id,
            url: '/bite-admin/orders',
            playSound: soundEnabledRef.current
        });
    };

    const loadOrders = async () => {
        setLoading(true);
        const data = await apiService.getOrders();
        const freshOrders = data || [];

        if (isFirstLoadRef.current) {
            freshOrders.forEach(o => {
                previousOrderIdsRef.current.add(o.id);
                alertedOrderIdsRef.current.add(String(o.id));
            });
            isFirstLoadRef.current = false;
        } else if (soundEnabledRef.current) {
            const newOrders = freshOrders.filter(o => !alertedOrderIdsRef.current.has(String(o.id)));
            if (newOrders.length > 0) {
                triggerOrderNotification(newOrders[0]);
                newOrders.forEach(o => alertedOrderIdsRef.current.add(String(o.id)));
            }
        }

        freshOrders.forEach(o => previousOrderIdsRef.current.add(o.id));
        setOrders(freshOrders);
        setLoading(false);
    };

    useEffect(() => {
        loadOrders();
        unlockAudio();
        const bgTimer = new BackgroundTimer(loadOrders, 30000);
        bgTimer.start();

        const handleCrossTabOrder = (event) => {
            if (event?.detail) {
                triggerOrderNotification(event.detail);
            }
            loadOrders();
        };
        window.addEventListener('innbite:new-order', handleCrossTabOrder);

        let subscription;
        if (isSupabaseConfigured && supabase) {
            subscription = supabase
                .channel('admin_orders_realtime')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                    if (payload.new) {
                        triggerOrderNotification(payload.new);
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
            window.removeEventListener('innbite:new-order', handleCrossTabOrder);
            if (subscription) supabase.removeChannel(subscription);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [soundEnabled]);

    const handleToggleNotification = async () => {
        if (notifPermission === 'denied') {
            setShowBlockedModal(true);
            return;
        }
        const perm = await requestNotificationPermission();
        setNotifPermission(perm);
        if (perm === 'denied') {
            setShowBlockedModal(true);
        }
    };

    const handleMarkPaid = async (orderId) => {
        await apiService.updatePaymentStatus(orderId, 'SUCCESS');
        loadOrders();
    };

    const handleUpdateStatus = async (orderId, status) => {
        await apiService.updateOrderStatus(orderId, status);
        loadOrders();
    };

    // Filter Handlers with automatic pagination reset
    const handleSearchChange = (val) => {
        setSearchOrderNumber(val);
        setCurrentPage(1);
    };

    const handleDateChange = (val) => {
        setFilterDate(val);
        setCurrentPage(1);
    };

    const handlePaymentChange = (val) => {
        setFilterPayment(val);
        setCurrentPage(1);
    };

    const handleResetToToday = () => {
        setSearchOrderNumber('');
        setFilterDate(todayStr);
        setFilterPayment('all');
        setCurrentPage(1);
    };

    // 1. Filtered Orders
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            // Payment filter
            if (filterPayment === 'paid') {
                const isPaid = order.payment_status === 'SUCCESS' || order.payment_status === 'paid';
                if (!isPaid) return false;
            } else if (filterPayment === 'pending') {
                const isPaid = order.payment_status === 'SUCCESS' || order.payment_status === 'paid';
                if (isPaid) return false;
            }

            // Date filter (default is today)
            if (filterDate && filterDate !== 'all') {
                const orderDate = getLocalDateString(order.created_at);
                if (orderDate !== filterDate) return false;
            }

            // Search by Order Number
            if (searchOrderNumber.trim()) {
                const query = searchOrderNumber.trim().toLowerCase().replace(/^#/, '');
                const orderNumStr = String(order.order_number || '').toLowerCase();
                const orderIdStr = String(order.id || '').toLowerCase();
                const refStr = String(order.idempotency_key || '').toLowerCase();
                const custNameStr = String(order.customer_name || '').toLowerCase();

                const matches =
                    orderNumStr.includes(query) ||
                    orderIdStr.includes(query) ||
                    refStr.includes(query) ||
                    custNameStr.includes(query);

                if (!matches) return false;
            }

            return true;
        });
    }, [orders, filterPayment, filterDate, searchOrderNumber]);

    // 2. Pagination Calculation
    const totalOrders = filteredOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalOrders / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const paginatedOrders = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredOrders.slice(start, start + pageSize);
    }, [filteredOrders, safeCurrentPage, pageSize]);

    const startIndex = totalOrders === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
    const endIndex = Math.min(safeCurrentPage * pageSize, totalOrders);

    return (
        <div className="space-y-6 text-slate-900 font-sans">
            {/* Top Header Bar */}
            <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Orders & Payments Log <Receipt className="w-5 h-5 text-rose-500" />
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">Track incoming table and self-service orders, live DB sync, payment logs, and status updates</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => {
                            const next = !soundEnabled;
                            setSoundEnabled(next);
                            if (next) {
                                unlockAudio();
                                playCustomBellSound();
                            }
                        }}
                        className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${soundEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'bg-slate-200 text-slate-700'}`}
                        title={soundEnabled ? "Sound Alert Enabled (Tap to Mute)" : "Sound Alert Muted (Tap to Enable)"}
                    >
                        {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>{soundEnabled ? 'Sound ON' : 'Muted'}</span>
                    </button>

                    <button
                        onClick={() => {
                            unlockAudio();
                            playCustomBellSound();
                        }}
                        className="px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer shadow-xs"
                        title="Test Custom Notification Bell Sound"
                    >
                        <Bell className="w-3.5 h-3.5 text-amber-500" />
                        <span>Test Bell</span>
                    </button>

                    <button
                        onClick={handleToggleNotification}
                        className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            notifPermission === 'granted'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold'
                                : notifPermission === 'denied'
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                        }`}
                        title={
                            notifPermission === 'granted'
                                ? 'Lock Screen Alerts Active'
                                : notifPermission === 'denied'
                                    ? 'Notifications Blocked - Click for steps to unblock'
                                    : 'Click to Enable Lock Screen & Sound Alerts'
                        }
                    >
                        {notifPermission === 'granted' ? <Bell className="w-3.5 h-3.5 text-emerald-700" /> : <BellOff className="w-3.5 h-3.5" />}
                        <span>
                            {notifPermission === 'granted'
                                ? 'Alerts ON'
                                : notifPermission === 'denied'
                                    ? 'Alerts Blocked (Fix)'
                                    : 'Enable Alerts'}
                        </span>
                    </button>

                    <button
                        onClick={() => navigate('/bite-admin/pos')}
                        className="px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 bg-[#114536] hover:bg-[#0c3429] text-white transition-all cursor-pointer shadow-md"
                        title="Create Manual POS Order"
                    >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Take Order (POS)</span>
                    </button>

                    <button
                        onClick={loadOrders}
                        className="p-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Dedicated Search & Filters Toolbar */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Search Input for Order Number */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchOrderNumber}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search by order number (e.g. 102, #ORD-102)..."
                            className="w-full h-10 bg-slate-50 border border-slate-200 pl-10 pr-9 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#114536] focus:bg-white transition-all"
                        />
                        {searchOrderNumber && (
                            <button
                                onClick={() => handleSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-full hover:bg-slate-200"
                                title="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Date Filter & Date Picker */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center bg-slate-50 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
                            <button
                                onClick={() => handleDateChange(todayStr)}
                                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                    filterDate === todayStr ? 'bg-[#114536] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => handleDateChange(yesterdayStr)}
                                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                    filterDate === yesterdayStr ? 'bg-[#114536] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Yesterday
                            </button>
                            <button
                                onClick={() => handleDateChange('all')}
                                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                                    filterDate === 'all' ? 'bg-[#114536] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                All Dates
                            </button>
                        </div>

                        {/* Custom Date Input */}
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
                            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <input
                                type="date"
                                value={filterDate === 'all' ? '' : filterDate}
                                onChange={(e) => handleDateChange(e.target.value || 'all')}
                                className="bg-transparent font-bold text-slate-900 outline-none text-xs cursor-pointer"
                                title="Select custom filter date"
                            />
                        </div>
                    </div>
                </div>

                {/* Secondary Row: Payment Filter & Count Summary */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Payment:</span>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                            {['all', 'paid', 'pending'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePaymentChange(p)}
                                    className={`px-2.5 py-1 rounded-lg capitalize font-bold text-[11px] transition-colors cursor-pointer ${
                                        filterPayment === p ? 'bg-[#114536] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    {p === 'pending' ? 'Unpaid / Counter' : p}
                                </button>
                            ))}
                        </div>

                        {(searchOrderNumber || filterPayment !== 'all' || filterDate !== todayStr) && (
                            <button
                                onClick={handleResetToToday}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset to Today
                            </button>
                        )}
                    </div>

                    <div className="text-slate-500 font-semibold text-[11px]">
                        Showing <span className="font-black text-slate-900">{totalOrders}</span> {totalOrders === 1 ? 'order' : 'orders'}
                        {filterDate !== 'all' && (
                            <span> for <strong className="text-slate-800">{filterDate === todayStr ? 'Today' : filterDate}</strong></span>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Content Area */}
            {loading && orders.length === 0 ? (
                <AdminSkeletonTable rows={pageSize} cols={5} />
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
                    <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                        <p className="font-black text-sm text-slate-800">No orders matching your filters</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {searchOrderNumber
                                ? `No orders found matching order number "${searchOrderNumber}".`
                                : filterDate !== 'all'
                                    ? `No orders recorded for ${filterDate === todayStr ? "today" : filterDate}.`
                                    : 'No orders available in this filter view.'}
                        </p>
                    </div>
                    <div className="flex justify-center gap-2 pt-1 flex-wrap">
                        {filterDate !== 'all' && (
                            <button
                                onClick={() => handleDateChange('all')}
                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                                View All Dates
                            </button>
                        )}
                        {(searchOrderNumber || filterPayment !== 'all' || filterDate !== todayStr) && (
                            <button
                                onClick={handleResetToToday}
                                className="px-3.5 py-1.5 bg-[#114536] hover:bg-[#0c3429] text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                                Reset to Today's Orders
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginatedOrders.map((order) => {
                        const items = order.order_items || order.items || [];
                        const isPaid = order.payment_status === 'SUCCESS' || order.payment_status === 'paid';
                        const isSelfService = order.service_mode === 'SELF_SERVICE' || (!order.table_number && !order.table_id);

                        return (
                            <div key={order.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                                <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        {isSelfService ? (
                                            <span className="text-xs font-black bg-amber-100 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl">
                                                Takeaway Order #{order.order_number || order.id}
                                            </span>
                                        ) : (
                                            <span className="text-xs font-black bg-slate-900 text-white px-3 py-1.5 rounded-xl">
                                                Table #{order.table_number} · Order #{order.order_number || order.id}
                                            </span>
                                        )}
                                        <div>
                                            <span className="font-bold text-slate-900 block text-sm">{order.customer_name || 'Guest'}</span>
                                            <span className="text-[11px] text-slate-400 font-mono">{formatDateTime(order.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Status</span>
                                            <select
                                                value={order.status || 'CONFIRMED'}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className="text-xs font-extrabold bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1 outline-none uppercase focus:border-slate-900"
                                            >
                                                <option value="CONFIRMED">CONFIRMED</option>
                                                <option value="ACCEPTED">ACCEPTED</option>
                                                <option value="PREPARING">PREPARING</option>
                                                <option value="READY">READY</option>
                                                <option value="SERVED">SERVED</option>
                                                <option value="CANCELLED">CANCELLED</option>
                                            </select>
                                        </div>

                                        <div className="text-right pl-3 border-l border-slate-100">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grand Total</span>
                                            <span className="text-base font-black text-slate-900">₹{Number(order.total_amount || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Breakdown */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                    {items.map((item, idx) => {
                                        const customEntries = Object.entries(item.customizations || {});
                                        const note = item.special_instruction || item.specialInstruction;

                                        return (
                                            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-bold text-slate-900 mr-1.5">{item.quantity}x</span>
                                                        <span className="font-bold text-slate-800">{item.dish_name || item.name}</span>
                                                    </div>
                                                    <span className="font-mono text-slate-900 font-bold">₹{(Number(item.unit_price_snapshot || item.unit_price || item.price || 0) * item.quantity).toFixed(2)}</span>
                                                </div>

                                                {item.portion_label && (
                                                    <span className="text-[10px] text-slate-500 font-medium block">Portion: {item.portion_label}</span>
                                                )}

                                                {customEntries.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                                        {customEntries.map(([k, v]) => (
                                                            <span key={k} className="text-[10px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                                                                • {v === 'No' ? `No ${k}` : `${k}: ${v}`}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {note && (
                                                    <p className="text-[10px] text-indigo-700 italic bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                                                        <MessageSquare className="w-3 h-3 text-indigo-500 shrink-0" />
                                                        <span>"{note}"</span>
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-slate-500 font-semibold">Payment Method:</span>
                                        <span className="font-bold text-slate-900 capitalize flex items-center gap-1">
                                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                            {order.payment_method === 'cash_at_counter' ? 'Pay at Counter / Cash' : 'Online Razorpay'}
                                        </span>
                                        {order.razorpay_payment_id ? (
                                            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200 font-bold" title="Razorpay Payment Transaction ID">
                                                Txn ID: {order.razorpay_payment_id}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200" title="Checkout Reference ID">
                                                Ref: {order.idempotency_key || `ORD-${order.id}`} (No Payment Completed)
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold px-3 py-1 rounded-full text-xs border ${isPaid ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                            {isPaid ? 'Payment Verified (SUCCESS)' : 'Payment Pending'}
                                        </span>

                                        {!isPaid && (
                                            <button
                                                onClick={() => handleMarkPaid(order.id)}
                                                className="px-3.5 py-1.5 bg-[#114536] hover:bg-[#0c382b] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                                            >
                                                Mark Paid
                                            </button>
                                        )}

                                        <button
                                            onClick={() => printThermalReceipt(order, settings)}
                                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                                            title="Print 80mm Thermal Receipt"
                                        >
                                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                                            <span>Print Receipt</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination Controls Footer */}
                    <div className="bg-white px-5 py-4 rounded-3xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs mt-4">
                        <div className="text-slate-500 font-medium">
                            Showing <span className="font-black text-slate-900">{startIndex}</span> to{' '}
                            <span className="font-black text-slate-900">{endIndex}</span> of{' '}
                            <span className="font-black text-slate-900">{totalOrders}</span> orders
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={safeCurrentPage <= 1}
                                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(page => {
                                        if (totalPages <= 7) return true;
                                        return page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1;
                                    })
                                    .map((page, idx, arr) => {
                                        const prevPage = arr[idx - 1];
                                        const showEllipsis = prevPage && page - prevPage > 1;

                                        return (
                                            <React.Fragment key={page}>
                                                {showEllipsis && <span className="px-1 text-slate-400 font-bold">...</span>}
                                                <button
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-8 h-8 rounded-xl font-black text-xs transition-colors cursor-pointer ${
                                                        safeCurrentPage === page
                                                            ? 'bg-[#114536] text-white shadow-xs'
                                                            : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage >= totalPages}
                                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold">Per Page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-slate-50 font-bold text-slate-900 border border-slate-200 rounded-xl px-2.5 py-1 outline-none cursor-pointer"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification Blocked Step-by-Step Modal */}
            <NotificationBlockedModal
                isOpen={showBlockedModal}
                onClose={() => setShowBlockedModal(false)}
                onCheckAgain={async () => {
                    const current = getNotificationPermissionStatus();
                    setNotifPermission(current);
                    if (current === 'granted') {
                        setShowBlockedModal(false);
                    }
                }}
            />
        </div>
    );
}
