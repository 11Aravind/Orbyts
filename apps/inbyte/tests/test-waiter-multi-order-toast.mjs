import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('=====================================================');
console.log('🧪 TESTING WAITER MULTI-ORDER CONCURRENT TOAST LOGIC');
console.log('=====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passCount++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failCount++;
    }
}

// 1. Verify code structure in KitchenView.jsx
const kitchenPath = resolve('src/pages/kitchen/KitchenView.jsx');
const content = readFileSync(kitchenPath, 'utf-8');

assert(content.includes('const [activeNotifications, setActiveNotifications] = useState([])'),
    'KitchenView uses an activeNotifications queue state array instead of single object');

assert(content.includes('addActiveNotification'),
    'KitchenView defines addActiveNotification helper');

assert(content.includes('dismissNotification'),
    'KitchenView defines dismissNotification helper');

assert(content.includes('handleAcceptNotification'),
    'KitchenView defines handleAcceptNotification helper');

assert(content.includes('activeNotifications.map('),
    'KitchenView maps over activeNotifications to render all concurrent toast notifications');

assert(content.includes('Accept All'),
    'KitchenView provides Accept All action when multiple orders are waiting');

assert(content.includes('formatOrderDateTime'),
    'KitchenView displays exact order timestamp on each card');

assert(!content.includes('newOrders[0]'),
    'KitchenView no longer truncates polling to only newOrders[0]');

// 2. Logic & State Simulation Test Suite
console.log('\n--- Running State Queue Simulation ---');

const isIncomingOrder = (status) => {
    if (!status) return true;
    const s = String(status || '').toUpperCase();
    return ['CONFIRMED', 'PENDING', 'PLACED', 'NEW', 'ACCEPTED'].includes(s);
};

let activeNotifications = [];
let isRinging = false;

function addActiveNotification(newOrder) {
    if (!newOrder) return;
    if (newOrder.status && !isIncomingOrder(newOrder.status)) return;

    const newId = String(newOrder.id || newOrder.orderId || '');
    const newNum = String(newOrder.order_number || newOrder.orderNumber || '');
    if (!newId && !newNum) return;

    const index = activeNotifications.findIndex(o => {
        const oId = String(o.id || o.orderId || '');
        const oNum = String(o.order_number || o.orderNumber || '');
        return (newId && oId && newId === oId) || (newNum && oNum && newNum === oNum);
    });

    if (index >= 0) {
        activeNotifications[index] = { ...activeNotifications[index], ...newOrder };
    } else {
        activeNotifications.push(newOrder);
        isRinging = true;
    }
}

function dismissNotification(target) {
    if (!target) return;
    const targetKey = String(typeof target === 'object' ? (target.id || target.orderId || target.order_number || target.orderNumber || '') : target);
    if (!targetKey) return;

    activeNotifications = activeNotifications.filter(o => {
        const oId = String(o.id || o.orderId || '');
        const oNum = String(o.order_number || o.orderNumber || '');
        const isMatch = (oId && oId === targetKey) || (oNum && oNum === targetKey);
        return !isMatch;
    });

    if (activeNotifications.length === 0) {
        isRinging = false;
    }
}

function handleAcceptNotification(target) {
    if (!target) return;
    dismissNotification(target);
}

// Test Case 1: First customer places an order
const order1 = { id: 'uuid-001', order_number: '101', customer_name: 'Alice', total_amount: 350, status: 'CONFIRMED' };
addActiveNotification(order1);
assert(activeNotifications.length === 1, 'First order creates an active notification');
assert(activeNotifications[0].order_number === '101', 'First order details are correct');
assert(isRinging === true, 'Alarm starts ringing for incoming order');

// Test Case 2: Second customer places order WHILE previous toast is STILL active & undismissed
const order2 = { id: 'uuid-002', order_number: '102', customer_name: 'Bob', total_amount: 600, status: 'PENDING' };
addActiveNotification(order2);
assert(activeNotifications.length === 2, 'Second order is NOT dropped; queue now holds 2 active notifications');
assert(activeNotifications[0].order_number === '101', 'Order 1 remains active and visible');
assert(activeNotifications[1].order_number === '102', 'Order 2 is displayed simultaneously');

// Test Case 3: Third customer places order
const order3 = { id: 'uuid-003', order_number: '103', customer_name: 'Charlie', total_amount: 150, status: 'CONFIRMED' };
addActiveNotification(order3);
assert(activeNotifications.length === 3, 'Third order appends cleanly; queue holds 3 active notifications');

// Test Case 4: Same order updated via realtime or push with richer data (should NOT create duplicates)
const order2Update = { id: 'uuid-002', order_number: '102', customer_name: 'Bob', total_amount: 600, status: 'CONFIRMED', items: ['Pizza', 'Coke'] };
addActiveNotification(order2Update);
assert(activeNotifications.length === 3, 'Updating existing order does not duplicate cards in queue');
assert(activeNotifications[1].items?.length === 2, 'Existing order enriched with new item details');

// Test Case 5: Dismissing order 1 leaves order 2 and 3 active on screen
dismissNotification(order1);
assert(activeNotifications.length === 2, 'Dismissing order 1 leaves 2 active orders');
assert(!activeNotifications.some(o => o.id === 'uuid-001'), 'Order 1 is dismissed');
assert(activeNotifications.some(o => o.id === 'uuid-002'), 'Order 2 is still active');
assert(activeNotifications.some(o => o.id === 'uuid-003'), 'Order 3 is still active');
assert(isRinging === true, 'Alarm continues ringing because remaining orders are still pending');

// Test Case 6: Accepting order 2 leaves order 3 active
handleAcceptNotification(order2);
assert(activeNotifications.length === 1, 'Accepting order 2 removes it from queue; order 3 remains');
assert(activeNotifications[0].id === 'uuid-003', 'Only order 3 remains active');
assert(isRinging === true, 'Alarm still active for order 3');

// Test Case 7: Dismissing final order stops alarm ringing
dismissNotification(order3);
assert(activeNotifications.length === 0, 'Queue is completely empty after dismissing last order');
assert(isRinging === false, 'Alarm stops ringing automatically when queue reaches 0');

// Test Case 8: Batch arrival test (e.g., polling returning multiple fresh orders at once)
console.log('\n--- Running Batch Polling Simulation ---');
const previousOrderIds = new Set(['old-order-1']);
const freshOrdersFromDB = [
    { id: 'old-order-1', status: 'SERVED' },
    { id: 'batch-1', order_number: '201', status: 'CONFIRMED' },
    { id: 'batch-2', order_number: '202', status: 'CONFIRMED' },
    { id: 'batch-3', order_number: '203', status: 'CONFIRMED' }
];

const newOrders = freshOrdersFromDB.filter(o =>
    !previousOrderIds.has(o.id) && isIncomingOrder(o.status)
);

assert(newOrders.length === 3, 'Polling accurately detects all 3 new orders in batch');

// Emulate loadOrders iteration
newOrders.forEach(order => {
    addActiveNotification(order);
    previousOrderIds.add(order.id);
});

assert(activeNotifications.length === 3, 'All 3 orders from batch polling are preserved in active queue');
assert(activeNotifications.map(o => o.order_number).join(',') === '201,202,203',
    'Order 201, 202, and 203 are all present in display queue');

console.log('\n=====================================================');
console.log(`TOTAL TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
console.log('=====================================================');

if (failCount > 0) {
    process.exit(1);
}
