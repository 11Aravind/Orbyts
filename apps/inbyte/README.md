# InnBite — Real-Time QR Food Ordering & Restaurant Management Platform

> **Developer & AI Agent First-Check Guide**: Read this file before implementing features or modifying logic. It provides the single source of truth for repository structure, architecture rules, operating modes, database contracts, and implementation guidelines.

---

## 1. Architectural Foundation & Cardinal Rules

### Entity Separation Principle
The system **must never** conflate the following entities:
```
Table QR (Context) ──▶ Customer Session (Guest) ──▶ Cart (Local) ──▶ Order (Database) ──▶ Payment
```
- **QR Code**: Identifies entry context (specific table or common restaurant entrance). Does **not** represent a customer or order.
- **Table**: Physical dining table. Multiple independent customer devices can scan the same table QR simultaneously.
- **Customer Session**: Isolated guest session (`sess_<timestamp>_<random>`) stored in client storage. Carts and orders are strictly isolated between devices.
- **Cart**: Ephemeral client-side cart (`react-use-cart`) associated with the active session.
- **Order**: Permanent database record created on checkout with a server-validated subtotal and sequential order number.

### Two Operating Service Modes
Controlled by `restaurant_settings.service_mode` or `VITE_SERVICE_MODE`:

| Mode | Entry Route | Table Handling | Order Number | Kitchen / Waiter Display |
| :--- | :--- | :--- | :--- | :--- |
| `TABLE_SERVICE` | `/table/:tableId`<br>`/qr/:qrCode` | Assigned (`table_id`, `table_number`) | Sequential (`#1045+`) | Displays **Table #** and customer details |
| `SELF_SERVICE` | `/qr/common` | **Strictly `NULL`** (`table_id = null`, `table_number = null`) | Sequential (`#1045+`) | Displays **Order #** & "Takeaway / Self-Service" (no fake tables) |

> ⚠️ **Rule**: In `SELF_SERVICE` mode, **never invent fake table numbers** (e.g. Table 0 or Table 1). Keep `table_id` and `table_number` `null`.

---

## 2. Technology Stack

- **Frontend Core**: React 19, Vite 6, React Router DOM v7 (lazy routes with code splitting)
- **Styling**: Tailwind CSS 3.4, PostCSS, Lucide React icons
- **State & Storage**:
  - `react-use-cart` for shopping cart management
  - `@tanstack/react-table` for data grid views
  - `CryptoJS` AES encrypted client storage (`src/utils/secureStorage.js`)
  - In-memory 60s TTL cache for instant menu transitions (`src/utils/apiService.js`)
- **Backend & Database**: Supabase (PostgreSQL 15+, Row Level Security, Realtime WebSockets)
- **Payments**: Razorpay Checkout SDK (client-side script loader) + Cash / Pay-at-Counter
- **Media & Processing**: `react-easy-crop` + canvas WebP image conversion (`0.85` quality)
- **Hardware & Printing**: 80mm thermal receipt printer renderer (`src/utils/printReceipt.js`)
- **Testing**: Playwright test suite (`tests/`)

---

## 3. Directory Structure

```
InnBite/
├── migrations/               # Supabase SQL schemas and migration scripts
│   ├── supabase_schema.sql   # Complete core database schema & initial seed
│   └── 00*_*.sql             # Incremental schema patches (CGST/SGST, RLS, settings)
├── ref-doc/                  # Specifications and audit reports
│   ├── requirment.md         # Full functional specification
│   └── bugs_report.md        # Architectural bug fixes & resolution audit
├── tests/                    # Playwright E2E test suites
│   ├── admin/                # Admin portal, dishes, POS tests
│   └── customer/             # Cart, checkout, QR, edge-case tests
├── src/
│   ├── components/           # Reusable UI widgets
│   │   ├── BottomNavigation.jsx         # Customer bottom action bar & category drawer
│   │   ├── CustomerOrderDetailsModal.jsx # Live order status tracker modal
│   │   ├── DataTable.jsx                 # Reusable TanStack data table
│   │   ├── FoodCard.jsx / CategoryCard.jsx
│   │   ├── ImageUploadCropModal.jsx      # Image cropping modal (1:1 & banners)
│   │   ├── NetworkStatusBanner.jsx       # Offline/online reconnection listener
│   │   └── ProtectedRoute.jsx            # Role-based route guard (ADMIN / WAITER)
│   ├── context/
│   │   ├── AuthContext.jsx               # Staff authentication session & RBAC
│   │   └── SettingsContext.jsx           # Dynamic restaurant themes & branding
│   ├── pages/
│   │   ├── Home.jsx                      # Customer landing & menu catalog
│   │   ├── FoodDetails.jsx               # Dish detail, portion sizes, spice level
│   │   ├── CategoryDetails.jsx           # Filtered dishes by category
│   │   ├── Cart.jsx                      # Checkout, stock check, Razorpay/Cash
│   │   ├── QRHandler.jsx                 # QR code scanner entry & validation
│   │   ├── admin/                        # Admin portal pages
│   │   │   ├── AdminDashboard.jsx        # Metrics, revenue, active order feed
│   │   │   ├── AdminPOS.jsx              # Counter/Table billing & 80mm thermal print
│   │   │   ├── AdminDishes.jsx           # Dish CRUD, portions, ingredients
│   │   │   ├── AdminCategories.jsx       # Category ordering & images
│   │   │   ├── AdminBanners.jsx          # Promo carousel banner manager
│   │   │   ├── AdminTables.jsx           # Table QR generator & revocation
│   │   │   ├── AdminWaiters.jsx          # Waiter account management & toggle
│   │   │   ├── AdminOrders.jsx           # Historical order ledger
│   │   │   ├── AdminSettings.jsx         # Tax, GST rates, service mode, themes
│   │   │   └── AdminLogin.jsx            # Admin login (Credentials & Google SSO)
│   │   ├── kitchen/
│   │   │   └── KitchenView.jsx           # Real-time KDS / Waiter order kanban
│   │   └── waiter/
│   │       └── WaiterLogin.jsx           # Waiter portal login
│   ├── utils/
│   │   ├── apiService.js                 # Unified Supabase API layer & in-memory cache
│   │   ├── cropImage.js                  # Canvas crop and WebP conversion
│   │   ├── notifications.js              # Browser Notification API triggers
│   │   ├── orderUtils.js                 # Active order syncing, persistence & audio
│   │   ├── printReceipt.js               # Thermal 80mm receipt generator
│   │   ├── razorpay.js                   # Dynamic Razorpay checkout loader
│   │   ├── secureStorage.js              # AES encrypted localStorage/sessionStorage
│   │   ├── session.js                    # Customer guest session lifecycle
│   │   ├── sound.js                      # Web Audio API synthesised order chime
│   │   ├── supabase.js                   # Supabase client singleton
│   │   └── validation.js                 # Form sanitization and regex rules
│   ├── App.jsx                           # Route declarations & prefetching
│   ├── config.js                         # Global fallback theme constants
│   └── main.jsx                          # React 19 entry point
```

---

## 4. Routing & Role Matrix

| Route | Access | Role Required | Purpose |
| :--- | :--- | :--- | :--- |
| `/` | Public | Guest | Menu browsing, search, recommendations |
| `/table/:tableId` | Public | Guest | QR table entry (validates table, sets session) |
| `/qr/common` | Public | Guest | QR self-service hotel entry (clears table ID) |
| `/qr/:qrCode` | Public | Guest | Dynamic QR resolver and validator |
| `/FoodDetails/:foodId`| Public | Guest | Dish view, portions, special instructions |
| `/CategoryDetails/:categoryId` | Public | Guest | Category filtered menu view |
| `/cart` | Public | Guest | Cart review, stock validation, checkout |
| `/bite-waiter/login` | Public | Unauthenticated | Waiter staff login (redirects from `/waiter/login`) |
| `/bite-waiter`, `/kitchen` | Protected | `WAITER` (or `ADMIN`) | Live order dispatch, audio alerts, status updates (redirects from `/waiter`) |
| `/bite-admin/login` | Public | Unauthenticated | Admin staff login (redirects from `/admin/login`) |
| `/bite-admin` | Protected | `ADMIN` / `SUPER_ADMIN` | Management dashboard (redirects from `/admin`) |
| `/bite-admin/pos` | Protected | `ADMIN` / `SUPER_ADMIN` | Rapid POS terminal & thermal print |
| `/bite-admin/dishes` | Protected | `ADMIN` / `SUPER_ADMIN` | Menu engineering, pricing & availability |
| `/bite-admin/categories` | Protected | `ADMIN` / `SUPER_ADMIN` | Category priorities & imagery |
| `/bite-admin/banners` | Protected | `ADMIN` / `SUPER_ADMIN` | Carousel banner promotions |
| `/bite-admin/tables` | Protected | `ADMIN` / `SUPER_ADMIN` | Table creation, QR downloads, revoke toggle |
| `/bite-admin/waiters` | Protected | `ADMIN` / `SUPER_ADMIN` | Staff accounts & status toggling |
| `/bite-admin/orders` | Protected | `ADMIN` / `SUPER_ADMIN` | Order history & status changes |
| `/bite-admin/settings` | Protected | `ADMIN` / `SUPER_ADMIN` | Business profile, GST, mode, themes |

---

## 5. Database Schema & Realtime Setup

### Core PostgreSQL Tables (`migrations/supabase_schema.sql`)

1. **`restaurant_settings`**:
   - `restaurant_id` (PK, e.g. `'R001'`), `restaurant_name`, `app_name`, `service_mode` (`'TABLE_SERVICE'` | `'SELF_SERVICE'`), `payment_mode` (`'ONLINE'` | `'PAY_AT_COUNTER'` | `'BOTH'`), `theme_color`, `cgst_rate`, `sgst_rate`, `gst_no`, `common_qr_code`, `common_qr_status`, `is_closed`.
2. **`categories`**:
   - `id` (PK), `name`, `description`, `image_url`, `display_order`.
3. **`dishes`**:
   - `id` (PK), `name`, `description`, `preparation`, `base_price`, `category_id` (FK), `images` (JSONB array of URLs), `portions` (JSONB array), `ingredients` (JSONB array), `allergens` (JSONB array), `taste_profile` (JSONB array), `is_popular`, `is_special`, `is_available`, `is_veg`.
4. **`banners`**:
   - `id` (PK), `title`, `image_url`, `dish_id` (FK optional).
5. **`tables`**:
   - `id` (UUID PK), `table_number` (INT UNIQUE), `status` (`'active'`), `qr_code`, `revoked` (BOOLEAN).
6. **`orders`**:
   - `id` (UUID PK), `order_number` (VARCHAR, sequential e.g. `'1046'`), `service_mode`, `table_id`, `table_number` (NULL in self-service), `session_id`, `customer_name`, `customer_phone`, `total_amount`, `status` (`'CONFIRMED'` | `'PREPARING'` | `'READY'` | `'SERVED'` | `'CANCELLED'`), `payment_method` (`'razorpay'` | `'cash_at_counter'`), `payment_status` (`'SUCCESS'` | `'PENDING'`), `razorpay_payment_id`.
7. **`order_items`**:
   - `id` (UUID PK), `order_id` (FK -> orders CASCADE), `dish_id`, `dish_name`, `unit_price`, `quantity`, `portion_label`, `customizations` (JSONB), `special_instruction`, `subtotal`.
8. **`waiters`** & **`admins`**:
   - `id` (PK), `name`, `email`, `username`, `password`, `role` (`'WAITER'` / `'ADMIN'`), `status` (`'ACTIVE'` | `'DISABLED'`), `google_email`.

### Supabase Realtime Configuration
Supabase Realtime must be enabled for instant cross-device updates:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE tables;
ALTER PUBLICATION supabase_realtime ADD TABLE waiters;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE dishes;
```
> 🔔 **Crucial Pattern**: Realtime listeners must always listen to `{ event: '*' }` (all events: `INSERT`, `UPDATE`, `DELETE`). Never listen only to `INSERT`/`UPDATE`, or record deletions will cause stale UI state.

### Storage Bucket
- Bucket name: `menu-images` (public).
- Used for cropped dish, category, and banner WebP images.
- If the bucket is not created, `apiService.js` safely falls back to inline WebP data URLs.

---

## 6. Critical Implementation Logic & Data Flows

### 1. Customer QR Entry & Session Lifecycle
1. User scans QR: hits `/table/:tableId`, `/qr/:qrCode`, or `/qr/common`.
2. `QRHandler.jsx` calls `apiService.validateQRCode(targetCode)`:
   - Verifies if table is active and `revoked !== true`.
   - If invalid/revoked, shows alert screen and halts.
   - If valid, updates customer session via `updateCustomerSessionTable()` (`src/utils/session.js`).
3. Session is encrypted in `sessionStorage` with a persistent guest ID (`sess_*`).

### 2. Live Stock Guard & Checkout Pipeline
1. In `Cart.jsx`, a realtime subscription listens to `dishes` table. If any cart item is toggled to `is_available: false`, checkout is blocked with an alert.
2. Checkout initiates `apiService.createOrder(orderPayload)`:
   - **Server Price Revalidation**: Re-fetches current `base_price` from the database to prevent client manipulation.
   - **Quantity Limits**: Enforces `0 < qty <= 50`.
   - **Sequential Order Numbering**: Reads highest order number and increments by 1.
   - **Mode Assignment**: Correctly assigns `table_id` and `table_number` or nullifies them for `SELF_SERVICE`.
3. Payment Handler:
   - **Razorpay**: Opens popup via `openRazorpayCheckout()`. On success, records `razorpay_payment_id` and saves order.
   - **Cash at Counter**: Saves order immediately with `payment_status: 'PENDING'`.
4. The confirmed order is stored in `orderly_active_orders` in `secureStorage` to persist live tracking for the guest.

### 3. Kitchen / Waiter Realtime Kanban
1. `KitchenView.jsx` fetches active orders and subscribes to `postgres_changes` on `orders`.
2. New incoming order triggers:
   - Synthesised tri-tone audio chime (`playOrderChimeSound()` via Web Audio API).
   - System push notification (`sendSystemNotification()`).
3. Staff transitions order status: `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `SERVED`.
4. When status hits `READY`, the customer device triggers an alert: *"Order #1046 is READY!"*.

### 4. Admin Image Upload & Storage Protocol
1. Admin selects image in `AdminDishes`, `AdminCategories`, or `AdminBanners`.
2. Cropped via `ImageUploadCropModal.jsx` and converted to WebP (`convertToWebP()`).
3. Uploaded to Supabase storage bucket `menu-images`.
4. **Safe Deletion Protocol**: Old image files in Supabase storage are deleted **only after** the new database record is successfully committed.

---

## 7. Configuration & Environment Variables

Copy `.env.example` to `.env`:

```ini
# Operating Service Mode: TABLE_SERVICE or SELF_SERVICE
VITE_SERVICE_MODE=TABLE_SERVICE

# Supabase Backend
VITE_SUPABASE_URL=https://your-supabase-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Razorpay Client Key ID
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here

# Client Storage Encryption Key
VITE_STORAGE_ENCRYPTION_KEY=orderly_secure_secret_key_2026
```

---

## 8. Development & Testing Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run on local network (for testing on mobile phones / tablets)
npm run cross-platform

# Production build & lint
npm run build
npm run lint

# Preview production build
npm run preview

# Run Playwright E2E tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui
```

---

## 9. Developer Guidelines & Common Pitfalls

1. **No Mock Data Resurrection**:
   - `apiService.js` operates exclusively against Supabase.
   - Never reintroduce `localStorage` fallbacks that merge deleted database rows back into UI state.
2. **Encrypted Storage Usage**:
   - Always use `secureStorage.getItem()` / `secureStorage.setItem()` instead of raw `localStorage` for session, active orders, and credentials.
3. **Keep Realtime Subscriptions Clean**:
   - Always return an unsubscribe / cleanup callback in `useEffect` (`supabase.removeChannel(subscription)`).
4. **Thermal Receipt Calculations**:
   - When modifying prices or taxes, update both `AdminPOS.jsx` and `src/utils/printReceipt.js` so thermal bill totals, CGST, and SGST match database values.
5. **Cache Invalidation**:
   - Whenever an admin mutates a dish, category, or banner, call `invalidateMenuCache()` so customer views immediately fetch fresh data.
