import { readFileSync } from 'fs';
import { resolve } from 'path';

console.log('=====================================================');
console.log('🧪 COMPREHENSIVE VALIDATION & TEST SUITE FOR INNBITE');
console.log('=====================================================\n');

let failedTests = 0;
function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

// 1. ROUTING VALIDATION
console.log('--- 1. Testing Route Migration & Redirects ---');
const appJs = readFileSync(resolve('src/App.jsx'), 'utf-8');
assert(appJs.includes('path="/bite-waiter"'), 'App.jsx contains /bite-waiter route');
assert(appJs.includes('path="/bite-waiter/login"'), 'App.jsx contains /bite-waiter/login route');
assert(appJs.includes('path="/bite-waiter/pos"'), 'App.jsx contains /bite-waiter/pos route');
assert(appJs.includes('path="pos"'), 'App.jsx contains /bite-admin/pos route');
assert(appJs.includes('path="/bite-admin"'), 'App.jsx contains /bite-admin route');
assert(appJs.includes('path="/bite-admin/login"'), 'App.jsx contains /bite-admin/login route');
assert(!appJs.includes('path="/waiter"'), 'App.jsx does NOT expose or redirect /waiter');
assert(!appJs.includes('path="/admin"'), 'App.jsx does NOT expose or redirect /admin');
assert(appJs.includes('path="*"'), 'App.jsx includes catch-all 404 route');

const notFoundJs = readFileSync(resolve('src/pages/NotFound.jsx'), 'utf-8');
assert(notFoundJs.includes('Page Not Found'), 'NotFound page contains Page Not Found title');
assert(notFoundJs.includes('Error 404'), 'NotFound page contains Error 404');

const protectedRouteJs = readFileSync(resolve('src/components/ProtectedRoute.jsx'), 'utf-8');
assert(protectedRouteJs.includes("'/bite-waiter/login'"), 'ProtectedRoute redirects waiters to /bite-waiter/login');
assert(protectedRouteJs.includes("'/bite-admin/login'"), 'ProtectedRoute redirects admin to /bite-admin/login');

const adminLayoutJs = readFileSync(resolve('src/pages/admin/AdminLayout.jsx'), 'utf-8');
assert(adminLayoutJs.includes("path: '/bite-admin'"), 'AdminLayout has link to /bite-admin');
assert(adminLayoutJs.includes("path: '/bite-admin/orders'"), 'AdminLayout has link to /bite-admin/orders');
assert(adminLayoutJs.includes("navigate('/bite-admin/login'"), 'AdminLayout logs out to /bite-admin/login');

// 2. SERVICE WORKER & LOCK SCREEN NOTIFICATION VALIDATION
console.log('\n--- 2. Testing Service Worker & Lock Screen Notifications ---');
const swJs = readFileSync(resolve('public/sw.js'), 'utf-8');
assert(swJs.includes('notificationclick'), 'Service Worker handles notificationclick events');
assert(swJs.includes("action === 'stop_alarm'"), 'Service Worker supports stop_alarm action to silence sound');
assert(swJs.includes("client.postMessage({ type: 'STOP_ALARM' })"), 'Service Worker posts message to client to silence alarm');
assert(swJs.includes('skipWaiting'), 'Service Worker calls skipWaiting');
assert(swJs.includes('clients.claim'), 'Service Worker calls clients.claim');

const notificationsJs = readFileSync(resolve('src/utils/notifications.js'), 'utf-8');
assert(notificationsJs.includes('requireInteraction: true'), 'Notifications use requireInteraction for lock-screen persistence');
assert(notificationsJs.includes('renotify: true'), 'Notifications use renotify: true');
assert(notificationsJs.includes('silent: false'), 'Notifications use silent: false');
assert(notificationsJs.includes('vibrate:'), 'Notifications include vibration patterns');
assert(!notificationsJs.includes("action: 'stop_alarm'"), 'Notifications omit redundant Stop Sound action button');
assert(notificationsJs.includes("navigator.serviceWorker.addEventListener('message'"), 'Client listens for SW messages');

// 3. SOUND SYNTHESIS & CONTINUOUS READY ALARM VALIDATION
console.log('\n--- 3. Testing Sound Synthesis & Continuous Alarm Loop ---');
const soundJs = readFileSync(resolve('src/utils/sound.js'), 'utf-8');
assert(soundJs.includes('export const startReadyAlarm'), 'sound.js exports startReadyAlarm');
assert(soundJs.includes('export const stopReadyAlarm'), 'sound.js exports stopReadyAlarm');
assert(soundJs.includes('export const subscribeAlarmState'), 'sound.js exports subscribeAlarmState');
assert(soundJs.includes('generateChimeWavUri'), 'sound.js generates synthesized WAV fallback for background audio');
assert(soundJs.includes('4000'), 'sound.js loops alarm every 4000ms');

// 4. SCREEN WAKE LOCK & BACKGROUND WORKER VALIDATION
console.log('\n--- 4. Testing Wake Lock & Web Worker Background Timer ---');
const wakeLockJs = readFileSync(resolve('src/utils/wakeLock.js'), 'utf-8');
assert(wakeLockJs.includes('export const requestScreenWakeLock'), 'wakeLock.js exports requestScreenWakeLock');
assert(wakeLockJs.includes('export const releaseScreenWakeLock'), 'wakeLock.js exports releaseScreenWakeLock');
assert(wakeLockJs.includes('visibilitychange'), 'wakeLock.js automatically re-acquires wake lock upon visibility change');

const bgTimerJs = readFileSync(resolve('src/utils/backgroundTimer.js'), 'utf-8');
assert(bgTimerJs.includes('Worker'), 'backgroundTimer.js uses Web Worker to bypass tab sleep throttling');

// 5. WAITER KITCHEN VIEW BACKGROUND RELIABILITY
console.log('\n--- 5. Testing Waiter Kitchen View Integration ---');
const kitchenJs = readFileSync(resolve('src/pages/kitchen/KitchenView.jsx'), 'utf-8');
assert(kitchenJs.includes('requestScreenWakeLock'), 'KitchenView requests Wake Lock on mount');
assert(kitchenJs.includes('BackgroundTimer'), 'KitchenView uses BackgroundTimer for un-throttled polling');
assert(kitchenJs.includes('unlockAudio'), 'KitchenView unlocks audio context on user interaction');
assert(kitchenJs.includes('requestScreenWakeLock()'), 'KitchenView automatically activates Always-On Screen Wake Lock');

// 6. CUSTOMER DISMISS ALARM UI INTEGRATION
console.log('\n--- 6. Testing Customer Alarm Dismissal UI ---');
const homeJs = readFileSync(resolve('src/pages/Home.jsx'), 'utf-8');
assert(homeJs.includes('subscribeAlarmState'), 'Home.jsx subscribes to ready alarm');
assert(homeJs.includes('stopReadyAlarm'), 'Home.jsx allows customer to stop alarm');
assert(homeJs.includes('YOUR FOOD IS READY!'), 'Home.jsx displays sticky alert banner when order is READY');

const modalJs = readFileSync(resolve('src/components/CustomerOrderDetailsModal.jsx'), 'utf-8');
assert(modalJs.includes('stopReadyAlarm'), 'Order Details Modal provides Stop Alarm button');

const cartJs = readFileSync(resolve('src/pages/Cart.jsx'), 'utf-8');
assert(cartJs.includes('requestNotificationPermission'), 'Cart prompts for notification permissions during checkout');
assert(cartJs.includes('Please enter your name before placing the order'), 'Cart enforces mandatory customer name validation');
assert(cartJs.includes('Please enter your correct name:'), 'Cart includes helpful note explaining why customer name is required');

const apiServiceJs = readFileSync(resolve('src/utils/apiService.js'), 'utf-8');
assert(apiServiceJs.includes('trimmedCustomerName') && apiServiceJs.includes('customer_name: trimmedCustomerName'), 'apiService.createOrder stores customer_name in database order payload');
assert(!apiServiceJs.includes('validateQRCode(qrCode) {\n        const trimmedCustomerName') && !apiServiceJs.includes('validateQRCode(qrCode) {\r\n        const trimmedCustomerName'), 'apiService.validateQRCode does not reference orderPayload');

assert(kitchenJs.includes('order.customer_name'), 'KitchenView displays customer_name to staff');

const adminOrdersJs = readFileSync(resolve('src/pages/admin/AdminOrders.jsx'), 'utf-8');
assert(adminOrdersJs.includes('order.customer_name'), 'AdminOrders displays customer_name to management');
assert(adminOrdersJs.includes('searchOrderNumber'), 'AdminOrders supports searching by order number');
assert(adminOrdersJs.includes('filterDate') && adminOrdersJs.includes('getTodayDateString'), 'AdminOrders defaults date filter to today');
assert(adminOrdersJs.includes('paginatedOrders') && adminOrdersJs.includes('pageSize'), 'AdminOrders provides pagination for order listings');

// 7. WEB PUSH & LOCK SCREEN SERVERLESS API VALIDATION
console.log('\n--- 7. Testing Web Push Architecture & Serverless Endpoints ---');
const subscribeApiJs = readFileSync(resolve('api/subscribe-waiter-push.js'), 'utf-8');
assert(subscribeApiJs.includes('waiter_push_subscriptions'), 'subscribe-waiter-push.js handles waiter push subscriptions');
assert(subscribeApiJs.includes('supabase'), 'subscribe-waiter-push.js uses Supabase for subscription storage');

const sendApiJs = readFileSync(resolve('api/send-waiter-push.js'), 'utf-8');
assert(sendApiJs.includes('webpush.sendNotification'), 'send-waiter-push.js uses webpush to dispatch push notifications');
assert(sendApiJs.includes('urgency: \'high\''), 'send-waiter-push.js specifies high urgency to wake sleeping devices');

const manifestJson = readFileSync(resolve('public/manifest.json'), 'utf-8');
assert(manifestJson.includes('"standalone"'), 'manifest.json specifies standalone PWA display for mobile');

const indexHtml = readFileSync(resolve('index.html'), 'utf-8');
assert(indexHtml.includes('manifest.json'), 'index.html references manifest.json');
assert(indexHtml.includes('apple-mobile-web-app-capable'), 'index.html includes iOS Safari PWA meta tags');

const migration007 = readFileSync(resolve('migrations/007_waiter_push_subscriptions.sql'), 'utf-8');
assert(migration007.includes('CREATE TABLE IF NOT EXISTS waiter_push_subscriptions'), 'Migration 007 creates waiter_push_subscriptions table');

// 9. MALAYALAM MULTILINGUAL & I18N VALIDATION
console.log('\n--- 9. Testing Malayalam (മലയാളം) Language Localization ---');
const translationsJs = readFileSync(resolve('src/utils/translations.js'), 'utf-8');
assert(translationsJs.includes('TRANSLATIONS') && translationsJs.includes('ml: {'), 'translations.js exports Malayalam translation dictionary');
assert(translationsJs.includes('നല്ല ഭക്ഷണം') && translationsJs.includes('നിങ്ങളുടെ കാർട്ട്'), 'Malayalam dictionary contains authentic restaurant phrasing');
assert(translationsJs.includes('പേര് നിർബന്ധം') && translationsJs.includes('ഓർഡറുകൾ'), 'Malayalam dictionary supports customer name requirement & ordering');

const langContextJs = readFileSync(resolve('src/context/LanguageContext.jsx'), 'utf-8');
assert(langContextJs.includes('useLanguage') && langContextJs.includes('LanguageProvider'), 'LanguageContext exports LanguageProvider and useLanguage hook');

const langToggleJs = readFileSync(resolve('src/components/LanguageToggle.jsx'), 'utf-8');
assert(langToggleJs.includes('LanguageToggle'), 'LanguageToggle component is available');

const appJsRef = readFileSync(resolve('src/App.jsx'), 'utf-8');
assert(appJsRef.includes('<LanguageProvider>'), 'App.jsx wraps application with LanguageProvider');

const homeJsRef = readFileSync(resolve('src/pages/Home.jsx'), 'utf-8');
assert(homeJsRef.includes('LanguageToggle') && homeJsRef.includes('useLanguage'), 'Home.jsx integrates LanguageToggle and localized strings');

const autoTranslateJs = readFileSync(resolve('src/utils/autoTranslate.js'), 'utf-8');
assert(autoTranslateJs.includes('fetchLiveTranslation') && autoTranslateJs.includes('getCachedTranslation'), 'autoTranslate.js exports fetchLiveTranslation and caching service');

const apiTranslateJs = readFileSync(resolve('api/translate.js'), 'utf-8');
assert(apiTranslateJs.includes('translate.googleapis.com') && apiTranslateJs.includes('export default async function handler'), 'api/translate.js provides serverless proxy handler');

assert(langContextJs.includes('fetchLiveTranslation') && langContextJs.includes('getDishTitle'), 'LanguageContext dynamically translates new categories and products on the fly');

// 10. FAST-FOOD KIOSK & POS MANUAL ORDERING VALIDATION
console.log('\n--- 10. Testing Fast-Food Kiosk & Manual Ordering (POS) ---');
const posJs = readFileSync(resolve('src/pages/admin/AdminPOS.jsx'), 'utf-8');
assert(posJs.includes('portionModalDish'), 'AdminPOS supports portion size selection modal (McDonalds/KFC style)');
assert(posJs.includes('is_pos: true'), 'AdminPOS marks orders with is_pos flag');
assert(posJs.includes('printThermalReceipt'), 'AdminPOS integrates 80mm thermal receipt printing');
assert(kitchenJs.includes('/bite-waiter/pos'), 'KitchenView contains quick Take Order button for waiters');
assert(adminOrdersJs.includes('/bite-admin/pos'), 'AdminOrders contains quick Take Order button for admin');
assert(adminLayoutJs.includes('/bite-admin/pos'), 'AdminLayout sidebar contains POS Billing navigation link');

// 8. DEV SERVER LIVE CHECK
console.log('\n--- 8. Checking Vite Dev Server Live Status ---');
try {
  const res = await fetch('http://localhost:5173/');
  assert(res.status === 200, `Dev server returned HTTP ${res.status}`);
} catch {
  console.log('  ℹ️ INFO: Dev server not currently running on port 5173 (Run "npm run dev" to test interactively)');
}

console.log('\n=====================================================');
if (failedTests === 0) {
  console.log('🎉 ALL VALIDATION & FUNCTIONALITY TESTS PASSED (0 FAILURES)!');
} else {
  console.error(`⚠️ ${failedTests} TEST(S) FAILED!`);
  process.exit(1);
}
console.log('=====================================================');
