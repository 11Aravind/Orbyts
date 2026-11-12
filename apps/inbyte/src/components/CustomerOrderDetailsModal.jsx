import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { ChefHat, Check, CreditCard, X, RefreshCw, MessageSquare, UtensilsCrossed, Clock, Bell, } from 'lucide-react';
import { secureStorage } from '../utils/secureStorage';
import { handleOrderRealtimeUpdate, syncActiveOrdersWithServer, getActiveOrdersFromStorage } from '../utils/orderUtils';
import { stopReadyAlarm, subscribeAlarmState, isReadyAlarmActive } from '../utils/sound';
import { useLanguage } from '../context/LanguageContext';

export default function CustomerOrderDetailsModal({
    order: initialSingleOrder,
    orders: initialOrdersProp,
    onClose,
    onOrderMore,
    disableSubscription = false
}) {
    const { t } = useLanguage();
    const [orders, setOrders] = useState(() => {
        if (Array.isArray(initialOrdersProp) && initialOrdersProp.length > 0) return initialOrdersProp;
        if (initialSingleOrder) return [initialSingleOrder];
        return getActiveOrdersFromStorage();
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [alarmActive, setAlarmActive] = useState(isReadyAlarmActive());

    useEffect(() => {
        const unsub = subscribeAlarmState((active) => {
            setAlarmActive(active);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (Array.isArray(initialOrdersProp) && initialOrdersProp.length > 0) {
            setOrders(initialOrdersProp);
        } else if (initialSingleOrder) {
            setOrders([initialSingleOrder]);
        }
    }, [initialSingleOrder, initialOrdersProp]);

    const refreshActiveOrders = async () => {
        setIsRefreshing(true);
        const activeList = await syncActiveOrdersWithServer({ knownOrders: orders });
        if (!activeList || activeList.length === 0) {
            onClose();
        } else {
            setOrders(activeList);
        }
        setIsRefreshing(false);
    };

    useEffect(() => {
        if (!disableSubscription) {
            refreshActiveOrders();
        }

        const interval = setInterval(() => {
            if (!disableSubscription) {
                refreshActiveOrders();
            }
        }, 15000);

        let subscription;
        if (!disableSubscription && isSupabaseConfigured && supabase) {
            const firstOrderId = orders?.[0]?.id;
            const channelFilter = firstOrderId ? `id=eq.${firstOrderId}` : undefined;
            subscription = supabase
                .channel(`modal_orders_${firstOrderId || 'track'}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    ...(channelFilter ? { filter: channelFilter } : {})
                }, (payload) => {
                    if (payload.eventType === 'DELETE' || payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                        setOrders(prevOrders => {
                            const updated = handleOrderRealtimeUpdate(prevOrders, payload.new || payload.old);
                            if (!updated || updated.length === 0) {
                                onClose();
                                return [];
                            }
                            return updated;
                        });
                    }
                })
                .subscribe();
        }

        return () => {
            clearInterval(interval);
            if (subscription) supabase.removeChannel(subscription);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disableSubscription, onClose]);

    if (!orders || orders.length === 0) return null;

    const firstOrder = orders[0];
    const isSelfService = orders.every(o => o.service_mode === 'SELF_SERVICE' || (!o.table_number && !o.table_id));
    const tableNumber = orders.find(o => o.table_number)?.table_number || secureStorage.getItem('orderly_table_number') || '1';

    const grandTotal = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const orderNumbersString = orders.map(o => `#${o.order_number || o.id}`).join(', ');

    const statusMap = { CONFIRMED: 1, ACCEPTED: 2, PREPARING: 2, READY: 3, SERVED: 3, pending: 1, preparing: 2, completed: 3 };
    const maxStep = Math.max(...orders.map(o => statusMap[o.status] || 1));

    const isAllPaid = orders.every(o => o.payment_status === 'SUCCESS' || o.payment_status === 'paid');

    const totalItemsCount = orders.reduce((acc, o) => acc + (o.order_items || o.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0), 0);

    const formatTime = (isoString) => {
        if (!isoString) return '';
        try {
            return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const headerStatusTitle = maxStep === 3
        ? (t('food_ready_alert') || 'Order Ready!')
        : maxStep === 2
            ? (t('status_preparing') || 'Preparing in Kitchen')
            : (t('status_confirmed') || 'Order Confirmed');


    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto font-sans animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-100 max-h-[92vh]">

                {/* Modern Top Header (Clean like Swiggy / Zomato) */}
                <div className="p-5 pb-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm ${maxStep === 3
                            ? 'bg-rose-600 animate-bounce'
                            : maxStep === 2
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}>
                            {maxStep === 3 ? (
                                <Bell className="w-5 h-5" />
                            ) : maxStep === 2 ? (
                                <ChefHat className="w-5 h-5" />
                            ) : (
                                <Check className="w-5 h-5 stroke-[3]" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight">
                                    {headerStatusTitle}
                                </h2>
                                <span className={`w-2 h-2 rounded-full ${maxStep === 3 ? 'bg-rose-500 animate-ping' : maxStep === 2 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                                    }`} />
                            </div>
                            <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                                <span>{isSelfService ? 'Takeaway Pickup' : `Table #${tableNumber}`}</span>
                                <span>•</span>
                                <span className="font-mono">{orderNumbersString}</span>
                                {firstOrder?.created_at && (
                                    <>
                                        <span>•</span>
                                        <span>{formatTime(firstOrder.created_at)}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {alarmActive && (
                            <button
                                onClick={() => stopReadyAlarm()}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer animate-pulse"
                            >
                                <Bell className="w-3.5 h-3.5" />
                                <span>Silence</span>
                            </button>
                        )}
                        <button
                            onClick={refreshActiveOrders}
                            className={`p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
                            title="Refresh status"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                stopReadyAlarm();
                                onClose();
                            }}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5 stroke-[2.2]" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-5 space-y-4 overflow-y-auto bg-white flex-1">

                    {/* Order Ready Alert Card */}
                    {(alarmActive || orders.some(o => o.status === 'READY')) && (
                        <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                                    🍽️
                                </div>
                                <div>
                                    <p className="text-xs font-black text-rose-950">{t('food_ready_alert') || 'Your Food is Ready!'}</p>
                                    <p className="text-[11px] text-rose-700 font-medium">Please collect your order or wait for waiter service.</p>
                                </div>
                            </div>
                            {alarmActive && (
                                <button
                                    onClick={() => stopReadyAlarm()}
                                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                                >
                                    {t('stop_alarm') || 'Stop Sound'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Modern Order Progress Tracker */}
                    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Live Status</span>
                            <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${maxStep === 3
                                ? 'bg-rose-100 text-rose-800'
                                : maxStep === 2
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                {maxStep === 3 ? 'Ready' : maxStep === 2 ? 'In Kitchen' : 'Confirmed'}
                            </span>
                        </div>

                        {/* Visual Step Tracker */}
                        <div className="relative pt-1 pb-1">
                            {/* Connecting Line */}
                            <div className="absolute top-[18px] left-[15%] right-[15%] h-1 bg-slate-200 rounded-full z-0">
                                <div
                                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                    style={{ width: maxStep === 3 ? '100%' : maxStep === 2 ? '50%' : '0%' }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2 relative z-10 text-center">
                                {[
                                    { step: 1, label: t('status_confirmed') || 'Confirmed', icon: Check },
                                    { step: 2, label: t('status_preparing') || 'Preparing', icon: ChefHat },
                                    { step: 3, label: t('status_ready') || 'Ready', icon: UtensilsCrossed }
                                ].map((st) => {
                                    const isDone = maxStep >= st.step;
                                    const isCurrent = maxStep === st.step;
                                    const IconComponent = st.icon;

                                    return (
                                        <div key={st.step} className="flex flex-col items-center gap-1.5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCurrent
                                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm scale-110'
                                                : isDone
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-200 text-slate-400'
                                                }`}>
                                                <IconComponent className="w-3.5 h-3.5 stroke-[2.5]" />
                                            </div>
                                            <span className={`text-[11px] font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                                                {st.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* <p className="text-[11px] text-slate-600 font-medium text-center bg-white/70 py-1.5 px-3 rounded-xl border border-slate-200/50">
                            {statusSubtext}
                        </p> */}
                    </div>

                    {/* Ordered Items List (Clean, Modern & Grouped) */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between pb-1">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                                Items Ordered ({totalItemsCount})
                            </h3>
                            {orders.length > 1 && (
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                    {orders.length} Rounds
                                </span>
                            )}
                        </div>

                        <div className="space-y-2">
                            {orders.map((subOrder, orderIdx) => {
                                const items = subOrder.order_items || subOrder.items || [];

                                return (
                                    <div key={subOrder.id || orderIdx} className="space-y-2">
                                        {orders.length > 1 && (
                                            <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-slate-500 border-t border-slate-100">
                                                <span>Round #{orderIdx + 1} ({formatTime(subOrder.created_at)})</span>
                                                <span className="text-emerald-700 font-extrabold">₹{Number(subOrder.total_amount || 0).toFixed(2)}</span>
                                            </div>
                                        )}

                                        {items.map((item, itemIdx) => {
                                            const customEntries = Object.entries(item.customizations || {});
                                            const instruction = item.special_instruction || item.specialInstruction;
                                            const unitPrice = Number(item.unit_price_snapshot || item.unit_price || item.price || 0);
                                            const itemTotal = unitPrice * (item.quantity || 1);

                                            return (
                                                <div
                                                    key={itemIdx}
                                                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-black text-slate-900 text-sm">
                                                                {item.dish_name || item.name}
                                                            </span>
                                                            {item.portion_label && (
                                                                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                                                    {item.portion_label}
                                                                </span>
                                                            )}
                                                            <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                                × {item.quantity}
                                                            </span>
                                                        </div>

                                                        {/* Customization Badges */}
                                                        {customEntries.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 pt-0.5">
                                                                {customEntries.map(([k, v]) => (
                                                                    <span key={k} className="text-[10px] font-medium bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                                                                        {v === 'No' ? `No ${k}` : `${k}: ${v}`}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Special Instruction */}
                                                        {instruction && (
                                                            <p className="text-[11px] text-indigo-700 italic flex items-center gap-1 pt-0.5">
                                                                <MessageSquare className="w-3 h-3 text-indigo-500 shrink-0" />
                                                                <span>Note: &quot;{instruction}&quot;</span>
                                                            </p>
                                                        )}
                                                    </div>

                                                    <span className="font-black text-slate-900 text-sm whitespace-nowrap shrink-0 pt-0.5">
                                                        ₹{itemTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Clean Bill Summary Card (Replaces the ugly black boxes) */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <div className="flex justify-between items-center text-xs text-slate-600">
                            <span>{t('item_total') || 'Item Total'}</span>
                            <span className="font-bold text-slate-800">₹{grandTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-600">
                            <span>{t('taxes_and_charges') || 'Taxes & Service Charges'}</span>
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                                Included
                            </span>
                        </div>
                        <div className="h-px bg-slate-200 my-1" />
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t('grand_total') || 'Grand Total'}</span>
                                <span className="text-xl font-black text-slate-900">₹{grandTotal.toFixed(2)}</span>
                            </div>
                            <span className={`text-xs font-black px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${isAllPaid
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-900 border-amber-200'
                                }`}>
                                <CreditCard className="w-3.5 h-3.5" />
                                {isAllPaid ? 'Paid' : 'Pay at Counter / Waiter'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions (Clean & User-Friendly) */}
                <div className="p-4 bg-white border-t border-slate-100 flex gap-2.5 shrink-0">
                    <button
                        onClick={onClose}
                        className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-xs cursor-pointer"
                    >
                        {t('browse_menu') || 'Back to Menu'}
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            if (onOrderMore) onOrderMore();
                        }}
                        className="flex-1 py-3 px-4 bg-[#114536] hover:bg-[#0d3429] text-white font-black rounded-2xl transition-all text-xs shadow-md shadow-emerald-950/20 cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-95"
                    >
                        <span>+ {t('order_more') || 'Order More Items'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}