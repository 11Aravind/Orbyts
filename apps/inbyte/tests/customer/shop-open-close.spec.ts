import { test, expect, BrowserContext, Page } from '@playwright/test';

interface MockBackendState {
    version: number;
    settings: {
        restaurant_id: string;
        restaurant_name: string;
        app_name: string;
        service_mode: string;
        payment_mode: string;
        theme_color: string;
        logo_url: string;
        is_closed: boolean;
    };
    dishes: Array<Record<string, unknown>>;
    categories: Array<Record<string, unknown>>;
    tables: Array<Record<string, unknown>>;
    orders: Array<Record<string, unknown>>;
    createOrderRequests: Array<Record<string, unknown>>;
    verifyPaymentCalls: number;
    simulateAutoRefundFail: boolean;
    nextOrderNum: number;
}

function createMockState(initialClosed = false): MockBackendState {
    return {
        version: 1,
        settings: {
            restaurant_id: 'R001',
            restaurant_name: 'InnBite Restaurant',
            app_name: 'InnBite',
            service_mode: 'TABLE_SERVICE',
            payment_mode: 'BOTH',
            theme_color: 'emerald',
            logo_url: '/logo.svg',
            is_closed: initialClosed,
        },
        dishes: [
            {
                id: 'dish-biryani',
                name: 'Hyderabadi Biryani',
                description: 'Fragrant basmati rice cooked with spices',
                preparation: 'Slow cooked in dum pot',
                base_price: 220,
                category_id: 'cat-mains',
                images: ['/placeholderfood.png'],
                portions: [
                    { value: 'half', label: 'Half', price: 150 },
                    { value: 'full', label: 'Full', price: 220 },
                ],
                is_popular: true,
                is_special: true,
                is_available: true,
                is_veg: false,
            },
            {
                id: 'dish-paneer',
                name: 'Paneer Tikka',
                description: 'Grilled cottage cheese cubes',
                preparation: 'Charcoal grilled in tandoor',
                base_price: 180,
                category_id: 'cat-mains',
                images: ['/placeholderfood.png'],
                portions: [],
                is_popular: true,
                is_special: false,
                is_available: true,
                is_veg: true,
            },
        ],
        categories: [
            {
                id: 'cat-mains',
                name: 'Main Foods',
                description: 'Signature main courses',
                image_url: '/placeholderfood.png',
                display_order: 1,
            },
        ],
        tables: [
            { id: 'tbl-1', table_number: 1, qr_code: 'QR-TBL-1', status: 'active', revoked: false },
        ],
        orders: [],
        createOrderRequests: [],
        verifyPaymentCalls: 0,
        simulateAutoRefundFail: false,
        nextOrderNum: 1050,
    };
}

async function installMockRoutes(context: BrowserContext, state: MockBackendState) {
    // Intercept Supabase realtime websocket so tests stay 100% isolated from any remote project
    await context.routeWebSocket('**/realtime/v1/**', (ws) => {
        ws.onMessage(() => {});
    });

    await context.route('https://checkout.razorpay.com/v1/checkout.js', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: `
                window.__mockRazorpayInstances = window.__mockRazorpayInstances || [];
                window.Razorpay = function(options) {
                    const inst = {
                        options: options,
                        isOpen: false,
                        wasClosed: false,
                        handlers: {},
                        on: function(ev, cb) { this.handlers[ev] = cb; },
                        open: function() { this.isOpen = true; },
                        close: function() {
                            this.wasClosed = true;
                            this.isOpen = false;
                            if (options && options.modal && typeof options.modal.ondismiss === 'function') {
                                options.modal.ondismiss();
                            }
                        }
                    };
                    window.__mockRazorpayInstances.push(inst);
                    return inst;
                };
            `,
        });
    });

    await context.route('**/api/store-data**', async (route) => {
        const reqUrl = new URL(route.request().url());
        if (reqUrl.searchParams.get('statusOnly') === '1' || reqUrl.searchParams.get('statusOnly') === 'true') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                headers: { 'Cache-Control': 'no-store, max-age=0', 'X-Cache': 'LIVE-DB' },
                body: JSON.stringify({
                    success: true,
                    is_closed: Boolean(state.settings.is_closed),
                    settings: state.settings,
                    timestamp: new Date().toISOString(),
                }),
            });
            return;
        }

        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                version: `v-${state.version}`,
                updatedAt: new Date().toISOString(),
                cacheStatus: 'MISS',
                data: {
                    banners: [],
                    categories: state.categories,
                    dishes: state.dishes,
                    settings: state.settings,
                    tables: state.tables,
                },
            }),
        });
    });

    await context.route('**/api/cache-invalidate**', async (route) => {
        state.version += 1;
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                version: `v-${state.version}`,
                updatedAt: new Date().toISOString(),
                broadcastSent: true,
                data: {
                    banners: [],
                    categories: state.categories,
                    dishes: state.dishes,
                    settings: state.settings,
                    tables: state.tables,
                },
            }),
        });
    });

    await context.route('**/api/verify-payment**', async (route) => {
        state.verifyPaymentCalls += 1;
        const body = JSON.parse(route.request().postData() || '{}');
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                success: true,
                verified: true,
                paymentId: body.razorpay_payment_id || 'pay_mock',
            }),
        });
    });

    await context.route('**/api/create-order**', async (route) => {
        const body = JSON.parse(route.request().postData() || '{}');
        state.createOrderRequests.push(body);

        const idempotencyKey = body.idempotency_key || null;
        const paymentId = body.razorpay_payment_id || null;

        // Deduplicate existing orders BEFORE checking is_closed
        const existing = state.orders.find(
            (o) => (idempotencyKey && o.idempotency_key === idempotencyKey) ||
                (paymentId && o.razorpay_payment_id === paymentId)
        );
        if (existing) {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, deduplicated: true, order: existing }),
            });
            return;
        }

        if (!body.is_pos && state.settings.is_closed) {
            const refund = body.payment_method === 'razorpay' && paymentId
                ? (state.simulateAutoRefundFail
                    ? { attempted: true, refunded: false, reason: 'Manual review required' }
                    : { attempted: true, refunded: true, refundId: `rfnd_mock_${paymentId}`, status: 'processed' })
                : null;

            await route.fulfill({
                status: 409,
                contentType: 'application/json',
                body: JSON.stringify({
                    success: false,
                    code: 'SHOP_CLOSED',
                    error: 'The shop is currently closed and is not accepting online orders.',
                    paymentId,
                    refund,
                }),
            });
            return;
        }

        const newOrder = {
            id: `ord-${state.nextOrderNum}`,
            order_number: String(state.nextOrderNum++),
            restaurant_id: 'R001',
            service_mode: body.service_mode || 'TABLE_SERVICE',
            table_number: body.table_number ?? 1,
            session_id: body.session_id || 'sess_test',
            customer_name: body.customer_name || 'Guest',
            total_amount: Number(body.total_amount || 0),
            status: 'CONFIRMED',
            payment_method: body.payment_method || 'cash_at_counter',
            payment_status: body.payment_status || 'PENDING',
            razorpay_payment_id: paymentId,
            idempotency_key: idempotencyKey,
            created_at: new Date().toISOString(),
            order_items: (body.items || []).map((it: Record<string, unknown>, i: number) => ({
                id: `oi-${state.nextOrderNum}-${i}`,
                dish_id: it.dish_id || it.id,
                dish_name: it.name,
                unit_price: Number(it.price || 0),
                quantity: Number(it.quantity || 1),
                subtotal: Number(it.price || 0) * Number(it.quantity || 1),
            })),
        };
        state.orders.push(newOrder);

        await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, deduplicated: false, order: newOrder }),
        });
    });

    await context.route('**/api/send-waiter-push**', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });

    await context.route('**/rest/v1/**', async (route) => {
        const req = route.request();
        const urlObj = new URL(req.url());
        const table = urlObj.pathname.split('/rest/v1/')[1]?.split('?')[0] || '';
        const accept = req.headers()['accept'] || '';
        const isSingle = accept.includes('application/vnd.pgrst.object+json');
        const method = req.method();

        if (table === 'restaurant_settings') {
            if (method === 'POST' || method === 'PATCH') {
                const body = JSON.parse(req.postData() || '{}');
                const row = Array.isArray(body) ? body[0] : body;
                if (row && typeof row.is_closed === 'boolean') {
                    state.settings = { ...state.settings, ...row };
                } else if (row) {
                    state.settings = { ...state.settings, ...row };
                }
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify(isSingle ? state.settings : [state.settings]),
                });
                return;
            }
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(isSingle ? state.settings : [state.settings]),
            });
            return;
        }

        if (table === 'dishes') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(isSingle ? state.dishes[0] : state.dishes),
            });
            return;
        }
        if (table === 'categories') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(isSingle ? state.categories[0] : state.categories),
            });
            return;
        }
        if (table === 'tables') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(isSingle ? state.tables[0] : state.tables),
            });
            return;
        }
        if (table === 'orders') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(isSingle ? (state.orders[0] || null) : state.orders),
            });
            return;
        }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(isSingle ? null : []) });
    });
}

async function seedAdminAuth(page: Page) {
    await page.addInitScript(() => {
        window.localStorage.setItem(
            'orderly_auth_session',
            JSON.stringify({
                token: 'admin_test_token',
                user_id: 'adm-1',
                name: 'Owner',
                email: 'admin@innbite.com',
                role: 'ADMIN',
                restaurant_id: 'R001',
            })
        );
    });
}

test.describe('Shop Open/Close End-to-End & Edge Cases', () => {
    test('Admin Dashboard and Admin Settings toggles stay synchronized and update backend state', async ({ context }) => {
        const state = createMockState(false);
        await installMockRoutes(context, state);

        const adminPage = await context.newPage();
        await seedAdminAuth(adminPage);

        await adminPage.goto('/bite-admin');
        const dashToggle = adminPage.getByTestId('admin-shop-toggle');
        await expect(dashToggle).toBeEnabled();
        await expect(dashToggle).toContainText('Shop is OPEN');

        // Close shop from Admin Dashboard
        await dashToggle.click();
        await expect(dashToggle).toContainText('Shop is CLOSED');
        expect(state.settings.is_closed).toBe(true);

        // Navigate to Admin Settings and verify state matches immediately
        await adminPage.goto('/bite-admin/settings');
        const settingsToggle = adminPage.getByTestId('settings-shop-toggle');
        await expect(settingsToggle).toContainText('Open Shop Now');

        // Reopen shop from Admin Settings
        await settingsToggle.click();
        await expect(settingsToggle).toContainText('Close Shop Now');
        expect(state.settings.is_closed).toBe(false);

        // Navigate back to Admin Dashboard and verify sync
        await adminPage.goto('/bite-admin');
        await expect(adminPage.getByTestId('admin-shop-toggle')).toContainText('Shop is OPEN');
    });

    test('Closed shop blocks adding items across Home, CategoryDetails, DishPreviewModal, and FoodDetails while preserving existing cart', async ({ context }) => {
        const state = createMockState(false);
        await installMockRoutes(context, state);

        const page = await context.newPage();
        await page.goto('/table/1');

        // Add Paneer Tikka (no portions) while shop is open
        const paneerCard = page.locator('div').filter({ hasText: 'Paneer Tikka' }).locator('button', { hasText: 'ADD' }).first();
        await expect(paneerCard).toBeVisible();
        await paneerCard.click();

        // Navigate to /cart to verify item is present
        await page.goto('/cart');
        await expect(page.getByText('Paneer Tikka')).toBeVisible();

        // Admin closes the shop on the backend
        state.settings.is_closed = true;

        // Reload /cart -> pre-existing item preserved, checkout & '+' disabled, banner visible
        await page.reload();
        await expect(page.getByTestId('shop-closed-banner')).toBeVisible();
        await expect(page.getByText('Paneer Tikka')).toBeVisible();
        const cartCheckoutBtn = page.locator('button').filter({ hasText: 'Shop is Closed' });
        await expect(cartCheckoutBtn).toBeDisabled();

        // '+' increase button on CartItem must be disabled
        const increaseBtn = page.getByLabel('Increase quantity');
        await expect(increaseBtn).toBeDisabled();

        // Home page shows banner and blocks Add / + buttons
        await page.goto('/');
        await expect(page.getByTestId('shop-closed-banner')).toBeVisible();
        const closedButtons = page.locator('button', { hasText: 'Shop is Closed' });
        expect(await closedButtons.count()).toBeGreaterThan(0);
        await expect(closedButtons.first()).toBeDisabled();

        // DishPreviewModal shows banner and disables Add to Cart
        await page.getByText('Hyderabadi Biryani').first().click();
        const modal = page.locator('.fixed').filter({ hasText: 'Hyderabadi Biryani' }).last();
        await expect(modal.getByTestId('shop-closed-banner')).toBeVisible();
        await expect(modal.locator('button', { hasText: 'Shop is Closed' })).toBeDisabled();
        await modal.getByTitle('Close Modal').click();

        // CategoryDetails shows banner & disables ADD
        await page.goto('/CategoryDetails/cat-mains');
        await expect(page.getByTestId('shop-closed-banner')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Shop is Closed' }).first()).toBeDisabled();

        // FoodDetails shows banner & disables Add Item / + buttons
        await page.goto('/FoodDetails/dish-biryani');
        await expect(page.getByTestId('shop-closed-banner')).toBeVisible();
        await expect(page.locator('button', { hasText: 'Shop is Closed' })).toBeDisabled();
        await expect(page.locator('button', { hasText: '+' })).toBeDisabled();
    });

    test('Customer already on /cart receives live open/close status changes without refresh and can order once reopened', async ({ browser }) => {
        const state = createMockState(false);
        const customerCtx = await browser.newContext();
        const adminCtx = await browser.newContext();
        await installMockRoutes(customerCtx, state);
        await installMockRoutes(adminCtx, state);

        const customerPage = await customerCtx.newPage();
        await customerPage.goto('/table/1');
        await customerPage.locator('div').filter({ hasText: 'Paneer Tikka' }).locator('button', { hasText: 'ADD' }).first().click();
        await customerPage.goto('/cart');

        await customerPage.locator('#customer-name-input').fill('Alice Customer');
        await customerPage.getByText('Pay at Counter').click();

        // Admin in a separate browser context closes the shop while customer sits on /cart WITHOUT refreshing
        const adminPage = await adminCtx.newPage();
        await seedAdminAuth(adminPage);
        await adminPage.goto('/bite-admin');
        await adminPage.getByTestId('admin-shop-toggle').click();
        expect(state.settings.is_closed).toBe(true);

        // Simulate tab focus sync OR wait for live poll (without reload!)
        await customerPage.dispatchEvent('window', 'focus');
        await expect(customerPage.getByTestId('shop-closed-banner')).toBeVisible({ timeout: 10000 });
        await expect(customerPage.locator('button', { hasText: 'Shop is Closed' })).toBeDisabled();
        expect(state.orders.length).toBe(0);

        // Now Admin reopens the shop without customer refreshing
        await adminPage.getByTestId('admin-shop-toggle').click();
        expect(state.settings.is_closed).toBe(false);

        await customerPage.waitForTimeout(1600);
        await customerPage.dispatchEvent('window', 'focus');
        await expect(customerPage.getByTestId('shop-closed-banner')).toHaveCount(0, { timeout: 10000 });

        const placeOrderBtn = customerPage.locator('button', { hasText: 'Place Order' });
        await expect(placeOrderBtn).toBeEnabled();
        await placeOrderBtn.click();

        await expect(customerPage.getByText('Alice Customer')).toBeVisible({ timeout: 10000 });
        expect(state.orders.length).toBe(1);
        expect(state.orders[0].customer_name).toBe('Alice Customer');

        await customerCtx.close();
        await adminCtx.close();
    });

    test('Mid-payment close aborts Razorpay modal, and delayed payment callback triggers auto-refund + clear alert without creating order', async ({ context }) => {
        const state = createMockState(false);
        await installMockRoutes(context, state);

        const page = await context.newPage();
        await page.goto('/table/1');
        await page.locator('div').filter({ hasText: 'Paneer Tikka' }).locator('button', { hasText: 'ADD' }).first().click();
        await page.goto('/cart');

        await page.locator('#customer-name-input').fill('Bob Online');
        await page.getByText('Pay Online').click();
        await page.locator('button', { hasText: 'Place Order' }).click();

        // Wait until mock Razorpay modal is opened
        await page.waitForFunction(() => (window as unknown as { __mockRazorpayInstances?: Array<{ isOpen: boolean }> }).__mockRazorpayInstances?.some((i) => i.isOpen));

        // Shop closes while customer is on the Razorpay modal (no page refresh)
        state.settings.is_closed = true;

        // Active modal 4s poll closes the Razorpay modal and reveals closed message
        await expect(page.getByTestId('shop-closed-banner')).toBeVisible({ timeout: 10000 });
        const wasClosed = await page.evaluate(() => {
            const list = (window as unknown as { __mockRazorpayInstances: Array<{ wasClosed: boolean }> }).__mockRazorpayInstances;
            return Boolean(list[0]?.wasClosed);
        });
        expect(wasClosed).toBe(true);
        expect(state.orders.length).toBe(0);

        // Simulate delayed payment success callback arriving just after modal close / shop close
        await page.evaluate(() => {
            const list = (window as unknown as { __mockRazorpayInstances: Array<{ options: { handler: (r: Record<string, string>) => void } }> }).__mockRazorpayInstances;
            list[0].options.handler({
                razorpay_payment_id: 'pay_delayed_001',
                razorpay_order_id: 'order_delayed_001',
                razorpay_signature: 'sig_valid_mock',
            });
        });

        const alertBox = page.getByTestId('payment-rejected-alert');
        await expect(alertBox).toBeVisible({ timeout: 10000 });
        await expect(alertBox).toContainText('pay_delayed_001');
        await expect(alertBox).toContainText('rfnd_mock_pay_delayed_001');
        expect(state.orders.length).toBe(0);
    });

    test('Back/forward navigation and multi-tab checkout locks prevent duplicate orders and sync across tabs', async ({ context }) => {
        const state = createMockState(false);
        await installMockRoutes(context, state);

        const tab1 = await context.newPage();
        await tab1.goto('/table/1');
        await tab1.locator('div').filter({ hasText: 'Paneer Tikka' }).locator('button', { hasText: 'ADD' }).first().click();
        await tab1.goto('/FoodDetails/dish-biryani');
        await tab1.goto('/cart');

        // Test Back & Forward navigation maintains accurate status
        await tab1.goBack();
        await expect(tab1).toHaveURL(/\/FoodDetails\/dish-biryani/);
        state.settings.is_closed = true;
        await tab1.dispatchEvent('window', 'focus');
        await expect(tab1.getByTestId('shop-closed-banner')).toBeVisible({ timeout: 10000 });
        await tab1.goForward();
        await expect(tab1).toHaveURL(/\/cart/);
        await expect(tab1.getByTestId('shop-closed-banner')).toBeVisible({ timeout: 10000 });

        // Reopen shop for multi-tab checkout lock test
        state.settings.is_closed = false;
        await tab1.reload();
        await expect(tab1.locator('button', { hasText: 'Place Order' })).toBeEnabled();

        const tab2 = await context.newPage();
        await tab2.goto('/cart');
        await expect(tab2.getByText('Paneer Tikka')).toBeVisible();

        // Tab 1 initiates Razorpay checkout -> acquires cross-tab lock
        await tab1.locator('#customer-name-input').fill('MultiTab User');
        await tab1.getByText('Pay Online').click();
        await tab1.locator('button', { hasText: 'Place Order' }).click();
        await tab1.waitForFunction(() => (window as unknown as { __mockRazorpayInstances?: Array<{ isOpen: boolean }> }).__mockRazorpayInstances?.some((i) => i.isOpen));

        // Tab 2 must block checkout while Tab 1 is mid-payment
        await expect(tab2.locator('button', { hasText: 'Checkout Active in Another Tab...' })).toBeDisabled({ timeout: 10000 });

        // Tab 1 completes payment
        await tab1.evaluate(() => {
            const list = (window as unknown as { __mockRazorpayInstances: Array<{ options: { handler: (r: Record<string, string>) => void } }> }).__mockRazorpayInstances;
            list[0].options.handler({
                razorpay_payment_id: 'pay_multitab_1',
                razorpay_order_id: 'order_multitab_1',
                razorpay_signature: 'sig_valid',
            });
        });

        await expect(tab1.getByText('MultiTab User')).toBeVisible({ timeout: 10000 });
        // Tab 2 receives ORDER_COMPLETED sync, empties cart & shows order receipt without creating a 2nd order
        await expect(tab2.getByText('MultiTab User')).toBeVisible({ timeout: 10000 });
        expect(state.orders.length).toBe(1);
    });
});

