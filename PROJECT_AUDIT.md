# Monorepo Project Audit Report: Company Website & InByte Software

**Date:** 2026-11-11  
**Author:** Senior Software Architect and Monorepo Migration Specialist  
**Workspace Root:** `D:\Orbyts`  
**Audit Status:** Phase 1 Completed & Verified (Strictly Read-Only Inspection)

---

## 1. Executive Summary & Objective

The primary objective of this enterprise initiative is to establish a unified, production-ready monorepo ecosystem under `D:\Orbyts` containing two distinct business systems:
1. **Company Website (ORBYT)**: Currently located at `C:\Users\Dell\Downloads\New folder`. A static, dark-mode marketing website showcasing software products (Orbyt Dine / InByte, Commerce, Stock, Flow), digital security assessment services, and interactive architectural showcases.
2. **InByte Software (InnBite)**: Currently located at `D:\Projects\InnBite` (referenced in prompt as `D:\Projects\InnBite folder`). A mature, feature-complete, production-tested restaurant management and real-time QR food ordering application built on React 19, Vite, Tailwind CSS, Supabase, Cloudflare R2, Razorpay, Web Push, and Playwright.

In accordance with strict project guidelines:
- **Zero changes** have been made to original source projects.
- Both projects were audited with **read-only operations**.
- Source code copying to `apps/website/` and `apps/inbyte/` is deferred until explicit user approval of this audit.

---

## 2. Project 1: Company Website Audit

### 2.1 Overview & Architecture
- **Location:** `C:\Users\Dell\Downloads\New folder`
- **Application Type:** Multi-page static web application (HTML5, Tailwind CSS via CDN, Vanilla JavaScript, Lucide Icons).
- **Core Branding:** **ORBYT** ("Build. Secure. Evolve.") — Discover practical software products, digital security services, and custom technology solutions.
- **Git State:** Local Git repository present (`master` branch, clean working tree).

### 2.2 File and Directory Breakdown
```
C:\Users\Dell\Downloads\New folder\
├── index.html                  (383 KB - Primary landing page)
├── security.html               (272 KB - Dedicated Security Services & Assessments page)
├── Turborepo.html              (312 KB - Reference download snapshot of turborepo.dev)
├── fonts/
│   ├── Geist_Variable.woff2     (69.6 KB - Primary sans font)
│   └── GeistMono_Variable.woff2 (71.3 KB - Primary monospace font)
├── images/
│   ├── orbyt-logo.png          (20.6 KB - Official brand icon)
│   └── dine-preview.jpg        (28.7 KB - Product thumbnail for Dine/InByte)
└── Turborepo_files/            (45 files - Bundled CSS, JS, and image assets from turborepo.dev snapshot)
```

### 2.3 Frameworks, Libraries & Dependencies
| Component / Tool | Source / Version | Purpose |
| :--- | :--- | :--- |
| **Tailwind CSS** | CDN (`https://cdn.tailwindcss.com`) | Utility-first styling with runtime custom configuration |
| **Lucide Icons** | CDN (`https://unpkg.com/lucide@latest`) | Vector iconography across menus, buttons, and badges |
| **Fonts (Geist)** | Local WOFF2 & Base64 inline fallbacks | High-performance modern typography (Geist Sans & Geist Mono) |
| **JavaScript Engine** | Vanilla ES6+ | Dynamic DOM manipulation, modals, and SVG gauge animation |

### 2.4 Routes and Pages
1. **Home / Product Hub (`index.html`):**
   - **Hero Section:** Interactive speedometer benchmark (Humans vs Agents toggle with SVG gauge needle animation).
   - **Key Metrics:** Benchmark statistics grid (`statsGrid`).
   - **Services Section:** Digital security, bespoke engineering, and cloud architecture highlights.
   - **The Product Universe (`#products`):**
     - **Orbyt Dine / InByte:** QR-based interactive dining system (links to preview).
     - **Orbyt Commerce:** Transactional SaaS engine.
     - **Orbyt Stock:** Real-time inventory intelligence.
     - **Orbyt Flow:** Orchestration and team workflows.
   - **Development Process & Security:** Overview of engineering lifecycle and vulnerability protection.
   - **Showcase / Testimonials:** Client stories and adoption metrics.
   - **Interactive Command Palette:** Global modal keyboard shortcut (`Cmd+K` / `Ctrl+K`) for direct navigation.
   - **Contact Form & FAQ:** Interactive questions accordion and inquiry modal.
2. **Security Services (`security.html`):**
   - **Focus:** Practical security assessments, web application reviews, architecture threat modeling, and monorepo supply-chain security.
   - **Assessment Tiers:** Comprehensive breakdown of audit scopes, delivery timelines, and enterprise reporting.
3. **Reference Snapshot (`Turborepo.html` + `Turborepo_files/`):**
   - Offline saved archive of Turborepo official documentation for developer reference.

### 2.5 Styling & Custom Visual Elements
- Dark mode theme baseline (`#000000`, secondary `#080808`, card `#0c0c0e`, elevated `#121215`).
- Accent color palette: Cyan (`#00f0ff` / `#38bdf8`) and Emerald (`#10b981` / `#34d399`).
- Custom SVG radial gradients, filter shadows, and cubic-bezier transition curves for gauge animations.
- Inline CSS variables (`--ds-gray-*`, `--remote-cache-*`) echoing modern Vercel/Geist design tokens.

### 2.6 Environment Variables & APIs
- **None**: Entirely static client-side implementation. Contact form currently logs or triggers local simulated states.

---

## 3. Project 2: InByte Software Audit

### 3.1 Overview & Core Architecture
- **Location:** `D:\Projects\InnBite` (Note: The prompt specified `D:\Projects\InnBite folder`; actual directory name is `D:\Projects\InnBite`).
- **Application Name:** `innbite` (Product: InByte / InnBite).
- **Core Technology:** React 19.1 SPA + Vite 6.3 + React Router v7 + Supabase + Tailwind CSS 3.4.
- **Git State:** On branch `feature/data-cashe` with local staged/unstaged changes from active feature enhancement.

### 3.2 Core Architectural Principles & Invariants
As specified in `D:\Projects\InnBite\README.md` and `ref-doc/requirment.md`, InByte enforces strict architectural rules that **must not be broken during migration**:
1. **Entity Separation Principle:**
   ```
   Table QR Context ──▶ Customer Session ──▶ Ephemeral Cart ──▶ Order Record ──▶ Payment
   ```
   - QR codes define physical context (table vs counter entrance), not customer identities.
   - Customer sessions are isolated in encrypted browser storage (`sess_<timestamp>_<random>`).
   - Multiple guest devices at the same table do not overwrite each other's carts.
2. **Dual Operating Service Modes:**
   - `TABLE_SERVICE`: In-restaurant dining. Bound to concrete `table_id` and `table_number`. Waiters and kitchen view orders by table.
   - `SELF_SERVICE`: Takeaway / counter service (`/qr/common`). `table_id` and `table_number` are **strictly `NULL`** (never dummy or zero values). Displayed in KDS by sequential order number.

### 3.3 Dependencies Breakdown (`package.json`)
#### Production Dependencies
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `react` / `react-dom` | `^19.1.0` | Latest core React framework |
| `react-router-dom` | `^7.6.2` | Client-side routing with code-splitting & lazy boundaries |
| `@supabase/supabase-js` | `^2.116.0` | PostgreSQL DB, Auth, Realtime WebSockets, RLS |
| `@aws-sdk/client-s3` | `^3.1152.0` | S3-compatible Cloudflare R2 bucket integration for media |
| `@tanstack/react-table` | `^8.21.3` | High-performance admin and order management data grids |
| `react-use-cart` | `^1.14.0` | Cart state persistence and mutation management |
| `crypto-js` | `^4.2.0` | AES encrypted client storage for sessions and sensitive data |
| `lucide-react` | `^1.47.0` | Complete modern UI icon system |
| `html5-qrcode` / `qrcode.react`| `^2.3.8` / `^4.2.0` | QR camera scanning and dynamic QR code generation |
| `react-easy-crop` / `sharp` | `^6.2.3` / `^0.35.5` | Client canvas cropping & server-side WebP image optimization |
| `web-push` | `^3.6.7` | Web push notification delivery for staff alerts |
| `react-hot-toast` | `^2.6.1` | User notification toast dispatch |
| `react-loading-skeleton`| `^3.5.0` | Loading placeholders for dishes and tables |

#### Developer & Build Tooling
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `vite` | `^6.3.5` | Build engine with custom local API middleware |
| `@vitejs/plugin-react` | `^4.4.1` | Fast Refresh Babel plugin |
| `@vitejs/plugin-basic-ssl` | `^2.3.0` | Local HTTPS for camera & Web Push testing |
| `tailwindcss` / `postcss` / `autoprefixer` | `^3.4.17` | Utility styling and CSS processing |
| `eslint` / `@eslint/js` | `^9.25.0` | Flat config code linting |
| `@playwright/test` | `^1.63.0` | Full E2E customer and admin test automation |

### 3.4 Routing Architecture & Role-Based Access Control
The application uses React Router DOM v7 with granular code-splitting:
```
/                                  ──▶ Customer Home & Menu (Protected by CustomerTableGuard)
/table/:tableId                    ──▶ Table-specific QR entry handler
/qr/common                         ──▶ Common takeaway / self-service entry
/qr/:qrCode                        ──▶ Generic QR code resolver
/FoodDetails/:foodId               ──▶ Dish detail, portion sizes, ingredients
/CategoryDetails/:categoryId       ──▶ Category dish listing
/cart                              ──▶ Checkout, order review, payment
/bite-waiter/login                 ──▶ Waiter authentication
/bite-waiter                       ──▶ Waiter Order Kanban / KDS (Role: WAITER)
/bite-waiter/pos                   ──▶ Waiter POS ordering terminal
/bite-admin/login                  ──▶ Admin credentials & SSO login
/bite-admin                        ──▶ Admin Layout container (Role: ADMIN)
  ├── (index)                      ──▶ Live dashboard, KPI metrics, active feed
  ├── pos                          ──▶ Thermal billing POS & receipt printing
  ├── dishes                       ──▶ Dish CRUD & portion management
  ├── categories                   ──▶ Category sequencing & media
  ├── banners                      ──▶ Promotional carousel banner manager
  ├── tables                       ──▶ Table QR code generator & management
  ├── waiters                      ──▶ Staff waiter account management
  ├── orders                       ──▶ Historic order audit ledger
  └── settings                     ──▶ Tax (CGST/SGST), currency, branding, service mode
* (Catch-all)                      ──▶ 404 Not Found Page
```

### 3.5 Serverless API & Dev Middleware (`api/`)
InByte operates with hybrid serverless functions served locally through a custom Vite middleware in `vite.config.js` and deployed to Vercel/Node:
1. `api/create-order.js`: Order validation, subtotal calculation, database insertion, and sequential numbering.
2. `api/store-data.js` & `api/_storeCache.js`: High-speed memory caching for instant menu loading.
3. `api/cache-invalidate.js`: Cache eviction trigger on menu/settings updates.
4. `api/upload-image.js` & `api/delete-image.js`: Media ingestion to Cloudflare R2 with WebP conversion.
5. `api/subscribe-waiter-push.js` & `api/send-waiter-push.js`: VAPID push notifications for waiters.
6. `api/verify-payment.js`: Razorpay signature validation and payment status confirmation.
7. `api/translate.js`: Multi-language dynamic menu translation.

### 3.6 Database & Migrations (`migrations/`)
The database backend consists of Supabase PostgreSQL schemas with 15 SQL migration scripts:
- `supabase_schema.sql`: Core schema (tables: `dishes`, `categories`, `tables`, `orders`, `order_items`, `waiters`, `restaurant_settings`, `banners`).
- `004_add_is_closed_to_settings.sql` & `013_enforce_shop_open_and_idempotency.sql`: Shop operational status controls and duplicate order safeguards.
- `006_add_cgst_sgst_rates.sql`: Tax compliance fields for restaurant billing.
- `007_waiter_push_subscriptions.sql` & `008_cleanup_localhost_push_subscriptions.sql`: Push subscription persistence.
- `010_migrate_images_to_cloudflare_r2.sql`: Image storage migration patches.
- `011_order_number_sequence.sql`: Atomic order number generator.
- `012_enable_rls_and_policies.sql`: Row-Level Security policy enforcement.

### 3.7 Assets, Testing & Hardware Integration
- **Assets (`public/`):** PWA Web App Manifest, Service Worker (`sw.js`), 192x192 & 512x512 app icons, audio alert chimes (`order-bell.wav`, `silent.wav`).
- **Hardware Integration:** Direct ESC/POS 80mm thermal receipt printer rendering engine in `src/utils/printReceipt.js`.
- **E2E Testing Suite (`tests/`):** 16 comprehensive Playwright test files covering POS, checkout, cart edge cases, dish management, and waiter alerts.

---

## 4. Environment Variables & Secret Configuration Audit

### 4.1 Company Website
- **Required Variables:** None. (Static assets).

### 4.2 InByte Application
Based on `.env` and `.env.example`, the InByte application requires:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `VITE_SERVICE_MODE` | Client (`Vite`) | Default service mode: `TABLE_SERVICE` or `SELF_SERVICE` |
| `VITE_SUPABASE_URL` | Client (`Vite`) | Supabase project endpoint |
| `VITE_SUPABASE_ANON_KEY` | Client (`Vite`) | Supabase anonymous public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server (`Node/API`) | Elevated database key for secure serverless routes |
| `VITE_RAZORPAY_KEY_ID` | Client (`Vite`) | Razorpay public key ID for checkout modal |
| `RAZORPAY_KEY_ID` | Server (`Node/API`) | Razorpay API key ID for order creation |
| `RAZORPAY_KEY_SECRET` | Server (`Node/API`) | Razorpay private API secret |
| `RAZORPAY_WEBHOOK_SECRET` | Server (`Node/API`) | Razorpay webhook verification secret |
| `VITE_VAPID_PUBLIC_KEY` | Client (`Vite`) | Public VAPID key for push notification registration |
| `VAPID_PUBLIC_KEY` | Server (`Node/API`) | Server VAPID key for web-push payload signing |
| `VAPID_PRIVATE_KEY` | Server (`Node/API`) | Server VAPID private secret |
| `VAPID_SUBJECT` | Server (`Node/API`) | Mailto identifier for VAPID push payload |
| `CLOUDFLARE_ACCOUNT_ID` | Server (`Node/API`) | Cloudflare account identifier for R2 |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Server (`Node/API`) | Cloudflare R2 bucket S3 access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Server (`Node/API`) | Cloudflare R2 bucket S3 secret key |
| `CLOUDFLARE_R2_BUCKET_NAME` | Server (`Node/API`) | Cloudflare R2 bucket name |
| `CLOUDFLARE_R2_PUBLIC_URL` / `VITE_CLOUDFLARE_R2_PUBLIC_URL` | Client/Server | Public CDN URL for serving dish and banner images |

---

## 5. Reusable Components & Monorepo Package Extraction Opportunities

During the monorepo architecture phase (`packages/ui`, `packages/shared`, `packages/config`), the following candidates can be standardized without compromising application independence:

### 5.1 Shared UI Primitives (`packages/ui`)
- **Modal Dialogs:** `ConfirmDeleteModal`, `DishPreviewModal`, `CustomerOrderDetailsModal`.
- **Skeleton Loaders:** `ImageWithSkeleton`, `AdminSkeletonTable`.
- **Form & Input Controls:** Quantity counter controls, toggle switches, search bars.
- **Indicators & Badges:** `VegNonVegSymbol`, network status banner.
- **Icons:** Standardized icon export wrappers from `lucide-react`.

### 5.2 Shared Utilities & Configuration (`packages/shared` & `packages/config`)
- **Shared Typography & Font Assets:** Geist Sans and Geist Mono variable fonts can be unified in `packages/ui` or a shared asset package.
- **Tailwind Tokens:** Base dark-theme color tokens (`#000000`, `#0c0c0e`, `#00f0ff`, emerald palettes) extracted into a shared preset (`@orbyt/config/tailwind`).
- **Formatters & Validations:** Currency formatting (`₹`), date/time formatters, and table number validators.
- **TypeScript Base Configs:** Shared `tsconfig.base.json` for strict type-checking across apps and packages.

---

## 6. Potential Migration & Compatibility Issues

### 6.1 Directory Path Discrepancy
- **Finding:** The prompt specifies `D:\Projects\InnBite folder`, whereas the actual directory on disk is `D:\Projects\InnBite`.
- **Recommendation:** Use `D:\Projects\InnBite` as the verified source directory.

### 6.2 React 19 Ecosystem Consistency
- **Finding:** InByte is already upgraded to React 19 (`^19.1.0`). If the Company Website is migrated to Next.js (as outlined in Monorepo Setup Prompt 02), Next.js 15+ with React 19 should be selected to avoid React peer dependency conflicts across the PNPM workspace.

### 6.3 Native Node Modules in Serverless API
- **Finding:** `sharp` (`^0.35.5`) is a native C++ binary module used for WebP image processing. In PNPM monorepos, native binaries require proper hoisting or build configuration (`pnpm.onlyBuiltDependencies` or explicit inclusion in `apps/inbyte/package.json`).

### 6.4 CDN vs Bundled Dependencies in Website
- **Finding:** The original company website references Tailwind CSS and Lucide from public CDNs (`cdn.tailwindcss.com`, `unpkg.com/lucide`).
- **Recommendation:** When migrated into `apps/website/` (Next.js/React in later prompts), convert CDN dependencies into bundled NPM packages (`tailwindcss`, `lucide-react`) for offline reliability, performance, and type safety.

### 6.5 InByte Working Branch State
- **Finding:** `D:\Projects\InnBite` has local uncommitted modifications on branch `feature/data-cashe`.
- **Recommendation:** The copying process must copy the complete current working tree snapshot (including uncommitted feature enhancements such as `api/create-order.js` and shop closed guards) so that no active work is lost.

### 6.6 Files to Exclude During Copying
To keep the monorepo clean, fast, and secure, the following must **not** be copied into the monorepo:
- `node_modules/` (in both projects)
- `.git/` (original git histories; the monorepo will have its own root git repository)
- `dist/` (compiled build outputs)
- `playwright-report/` and `test-results/` (ephemeral test runs)
- `backups/` and `.agents/` (local developer backup dumps)
- `Turborepo_files/` and `Turborepo.html` (external reference website scrape in downloads)

---

## 7. Recommended Copying & Monorepo Setup Strategy

### 7.1 Source to Destination Mapping
| Source Directory | Monorepo Destination | Preservation Action |
| :--- | :--- | :--- |
| `C:\Users\Dell\Downloads\New folder\` | `d:\Orbyts\apps\website\` | Copy `index.html`, `security.html`, `fonts/`, `images/` |
| `D:\Projects\InnBite\` | `d:\Orbyts\apps\inbyte\` | Copy `src/`, `api/`, `public/`, `migrations/`, `tests/`, `docs/`, `ref-doc/`, `scripts/`, `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`, `playwright.config.ts`, `vercel.json`, `.env.example`, `.env` |

### 7.2 Safety Verification Checklist
- [x] Read-only audit conducted.
- [x] Zero files altered, moved, or deleted in `C:\Users\Dell\Downloads\New folder`.
- [x] Zero files altered, moved, or deleted in `D:\Projects\InnBite`.
- [x] No dependencies installed or modified.
- [x] No copying performed prior to user approval.

---

## 8. Conclusion & Next Steps

Both projects have been comprehensively analyzed and are structurally ready for monorepo integration. Once you approve this audit report:
1. Proceed with **Prompt 02 (`prompts/02-monorepo-setup.md`)**: Initialize the PNPM workspace, Turborepo pipeline, and shared packages (`@orbyt/ui`, `@orbyt/shared`, `@orbyt/config`).
2. Copy source projects cleanly into `apps/website/` and `apps/inbyte/` according to the exclusion rules defined above.
3. Configure independent dev scripts and builds.

