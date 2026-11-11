import { supabase } from './supabase.js';
import React from 'react';
import { secureStorage } from './secureStorage.js';
import { startReadyAlarm, stopReadyAlarm, isReadyAlarmActive, getReadyAlarmData } from './sound.js';
import { sendSystemNotification } from './notifications.js';
import { toast } from 'react-hot-toast';

const ACTIVE_ORDERS_KEY = 'orderly_active_orders';
const ACTIVE_ORDER_SINGLE_KEY = 'orderly_active_order';

export const getActiveOrdersFromStorage = () => {
    try {
        const storedList = secureStorage.getItem(ACTIVE_ORDERS_KEY);
        if (Array.isArray(storedList) && storedList.length > 0) {
            return storedList;
        }
        const singleStored = secureStorage.getItem(ACTIVE_ORDER_SINGLE_KEY);
        if (singleStored && singleStored.id) {
            return [singleStored];
        }
    } catch (e) {
        console.error('Error reading active orders from storage:', e);
    }
    return [];
};

export const saveActiveOrdersToStorage = (orders) => {
    try {
        if (!orders || !Array.isArray(orders) || orders.length === 0) {
            secureStorage.removeItem(ACTIVE_ORDERS_KEY);
            secureStorage.removeItem(ACTIVE_ORDER_SINGLE_KEY);
        } else {
            secureStorage.setItem(ACTIVE_ORDERS_KEY, orders);
            secureStorage.setItem(ACTIVE_ORDER_SINGLE_KEY, orders[orders.length - 1]); // Most recent as fallback
        }
    } catch (e) {
        console.error('Error saving active orders to storage:', e);
    }
};

export const addActiveOrderToStorage = (newOrder) => {
    if (!newOrder || !newOrder.id) return;
    const currentOrders = getActiveOrdersFromStorage();
    const existingIndex = currentOrders.findIndex(o => o.id === newOrder.id || o.order_number === newOrder.order_number);
    if (existingIndex >= 0) {
        currentOrders[existingIndex] = newOrder;
    } else {
        currentOrders.push(newOrder);
    }
    saveActiveOrdersToStorage(currentOrders);
    return currentOrders;
};

// Helper to trigger continuous sound, system notification, and interactive toast for READY orders
const notifyOrderReady = (order) => {
    const orderNum = order.order_number || order.id;

    // 1. Start continuous chime alarm every 4 seconds + vibration
    startReadyAlarm({ orderId: order.id, orderNumber: orderNum });

    // 2. Dispatch system native / lock-screen notification
    sendSystemNotification({
        title: `🍽️ Order #${orderNum} is READY!`,
        body: 'Your food is freshly prepared & ready! Tap to view details.',
        tag: `order-ready-${order.id}`,
        url: '/',
        playSound: false // Audio managed continuously by startReadyAlarm
    });

    // 3. Display interactive toast ONLY on secondary pages (Home has dedicated top banner)
    const isHomePage = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');
    if (!isHomePage) {
        toast.custom(
            (t) => (
                React.createElement('div', {
                    className: `${t.visible ? 'animate-fade-in' : 'opacity-0'} max-w-md w-full bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-rose-500/50 flex items-center justify-between gap-3 pointer-events-auto`
                },
                    React.createElement('div', { className: 'flex items-center gap-2.5 min-w-0' },
                        React.createElement('span', { className: 'text-lg shrink-0' }, '🍽️'),
                        React.createElement('div', { className: 'min-w-0' },
                            React.createElement('p', { className: 'font-black text-white text-xs sm:text-sm leading-tight' }, `Order #${orderNum} is READY!`),
                            React.createElement('p', { className: 'text-slate-300 text-[11px] truncate' }, 'Freshly prepared & ready for you')
                        )
                    ),
                    React.createElement('button', {
                        onClick: () => {
                            stopReadyAlarm();
                            toast.dismiss(t.id);
                        },
                        className: 'px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shrink-0 transition-colors shadow cursor-pointer active:scale-95'
                    }, '🔕 Stop Alarm')
                )
            ),
            { duration: 15000, id: `ready-toast-${order.id}`, position: 'top-center' }
        );
    }
};

export const syncActiveOrdersWithServer = async ({ sessionId = null, tableNumber = null, knownOrders = null } = {}) => {
    try {
        const currentStored = knownOrders || getActiveOrdersFromStorage();
        const storedIds = new Set(currentStored.map(o => o.id).filter(Boolean));
        
        // Secure targeted query: only fetch orders belonging to this session or known stored IDs
        const storedIdList = Array.from(storedIds);
        if (!sessionId && storedIdList.length === 0 && !tableNumber) {
            return currentStored;
        }

        let query = supabase.from('orders').select('*, order_items(*)');
        if (sessionId) {
            query = query.eq('session_id', sessionId);
        } else if (storedIdList.length > 0) {
            query = query.in('id', storedIdList);
        } else if (tableNumber) {
            query = query.eq('table_number', Number(tableNumber));
        }

        const { data: activeMatchesData, error } = await query
            .not('status', 'in', '("SERVED","completed","CANCELLED")')
            .order('created_at', { ascending: false });

        if (error) throw error;
        const activeMatches = activeMatchesData || [];

        // Check for new READY status notifications
        activeMatches.forEach(newOrder => {
            const prev = currentStored.find(o => o.id === newOrder.id);
            if (newOrder.status === 'READY' && (!prev || prev.status !== 'READY')) {
                notifyOrderReady(newOrder);
            }
        });

        saveActiveOrdersToStorage(activeMatches);
        return activeMatches;
    } catch (e) {
        console.error('Error syncing active orders:', e);
        return knownOrders || getActiveOrdersFromStorage();
    }
};

export const handleOrderRealtimeUpdate = (existingOrdersList, newPayload) => {
    const list = Array.isArray(existingOrdersList) ? [...existingOrdersList] : existingOrdersList ? [existingOrdersList] : [];
    if (!newPayload || !newPayload.id) return list;

    const index = list.findIndex(o => o.id === newPayload.id);
    const isCompleted = newPayload.status === 'SERVED' || newPayload.status === 'completed' || newPayload.status === 'CANCELLED';

    if (isCompleted) {
        if (index >= 0) {
            list.splice(index, 1);
        }
        // Stop alarm if the completed order was ringing
        if (isReadyAlarmActive() && getReadyAlarmData()?.orderId === newPayload.id) {
            stopReadyAlarm();
        }
    } else {
        const oldOrder = index >= 0 ? list[index] : null;
        if (newPayload.status === 'READY' && oldOrder?.status !== 'READY') {
            notifyOrderReady(newPayload);
        }

        const updated = oldOrder ? { ...oldOrder, ...newPayload } : newPayload;
        if (index >= 0) {
            list[index] = updated;
        } else {
            list.push(updated);
        }
    }

    saveActiveOrdersToStorage(list);
    return list;
};

// Backward compatibility helper
export const syncActiveOrderWithServer = async (orderToCheck) => {
    if (!orderToCheck || !orderToCheck.id) return null;
    const activeList = await syncActiveOrdersWithServer({ knownOrders: [orderToCheck] });
    return (activeList || []).find(o => o.id === orderToCheck.id) || null;
};
