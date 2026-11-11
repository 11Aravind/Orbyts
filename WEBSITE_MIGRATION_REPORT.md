# Website Migration Report: Static HTML to Next.js App Router

**Date:** 2026-11-11  
**Project:** ORBYT Company Website (`apps/website`)  
**Source Path:** `C:\Users\Dell\Downloads\New folder`  
**Destination Path:** `d:\Orbyts\apps\website`  
**Status:** Completed, Verified & Statically Prerendered (100% Zero-Error Compilation)

---

## 1. Executive Summary

The static HTML/CSS/JavaScript marketing website located at `C:\Users\Dell\Downloads\New folder` has been successfully migrated into a production-ready **Next.js 15 App Router** application inside the ORBYT monorepo (`apps/website`).

All original business information, dark-mode design aesthetics, interactive widgets, SVG graphics, responsive drawer behaviors, and brand assets were preserved with complete fidelity without altering the original source files.

---

## 2. Architecture & Directory Mapping

### 2.1 Next.js Application Architecture
```
apps/website/
├── app/
│   ├── layout.tsx                # Global HTML wrapper, Geist font rules, metadata & ClientLayout
│   ├── page.tsx                  # Primary ORBYT landing page composing all sections
│   ├── security/
│   │   └── page.tsx              # Full migration of security.html
│   ├── products/
│   │   └── page.tsx              # Dedicated products overview
│   ├── services/
│   │   └── page.tsx              # Detailed engineering & security service offerings
│   ├── about/
│   │   └── page.tsx              # Company mission & guiding principles
│   └── contact/
│       └── page.tsx              # Consultation request & enterprise contact page
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Sticky header with logo, navigation links, and search trigger
│   │   ├── Footer.tsx            # Global footer with product, service, and legal links
│   │   └── ClientLayout.tsx      # Client-side wrapper for modals and global hotkeys
│   │
│   ├── navigation/
│   │   └── CommandPalette.tsx    # Global Cmd+K / Ctrl+K interactive search modal
│   │
│   └── sections/
│       ├── HeroSection.tsx       # Hero headline, tabs, command pill box, and gauge
│       ├── SpeedometerGauge.tsx  # Interactive SVG benchmark gauge with animated needle
│       ├── StatsSection.tsx      # Metrics and experience counters
│       ├── ServicesOverviewSection.tsx # 3 core capability spotlight cards
│       ├── ProductUniverseSection.tsx  # Bento grid (Orbyt Dine/InByte, Commerce, Stock, Flow)
│       ├── SecurityPreviewSection.tsx  # Terminal audit scanner widget and preview
│       ├── DevelopmentSection.tsx      # 6 custom engineering pillar cards
│       ├── HowWeWorkSection.tsx        # 4-stage agile lifecycle
│       ├── ShowcaseSection.tsx         # Wall of verified client feedback/tweets
│       ├── AboutSection.tsx            # Principles and company philosophy
│       ├── FaqSection.tsx              # Interactive 5-item FAQ accordion
│       └── ContactSection.tsx          # Full inquiry form with submission feedback state
│
├── public/
│   ├── images/
│   │   ├── orbyt-logo.png        # Official brand logo
│   │   └── dine-preview.jpg      # High-resolution Orbyt Dine / InByte screenshot
│   └── fonts/
│       ├── Geist_Variable.woff2
│       └── GeistMono_Variable.woff2
│
├── styles/
│   └── globals.css               # Tailwind directives, font-face declarations, custom token styling
│
├── next.config.ts                # Next.js config with security.html rewrite & workspace transpilation
├── tailwind.config.ts            # Extending @orbyt/config/tailwind.base.js
├── postcss.config.js             # Autoprefixer & Tailwind processing
├── package.json                  # Next.js 15 + React 19 + Lucide React dependencies
└── tsconfig.json                 # Path aliases (@/*) extending @orbyt/config/tsconfig.next.json
```

---

## 3. Assets & Static Media Preservation

| Asset | Source Location | Destination | Status |
| :--- | :--- | :--- | :--- |
| **Brand Logo** | `images/orbyt-logo.png` | `apps/website/public/images/orbyt-logo.png` | Preserved (20.6 KB) |
| **Product Preview** | `images/dine-preview.jpg` | `apps/website/public/images/dine-preview.jpg` | Preserved (28.7 KB) |
| **Geist Sans Font** | `fonts/Geist_Variable.woff2` | `apps/website/public/fonts/Geist_Variable.woff2` | Preserved (69.6 KB) |
| **Geist Mono Font** | `fonts/GeistMono_Variable.woff2` | `apps/website/public/fonts/GeistMono_Variable.woff2` | Preserved (71.3 KB) |
| **Scraped Reference Files** | `Turborepo.html` + `Turborepo_files/` | *Excluded from production app* | Excluded as per audit |

---

## 4. Interactive Functionality & JavaScript Migration

1. **Interactive Speedometer Gauge (`SpeedometerGauge.tsx`):**
   - Transformed raw inline script into a reactive client component.
   - Mode switching (`Software` vs `AI` vs `Security` vs `Development`) dynamically updates needle rotation angles ($0^\circ$, $42^\circ$, $-45^\circ$, $25^\circ$), compute benchmarks, and performance metrics.
2. **Command Palette (`CommandPalette.tsx`):**
   - Global hotkey listener (`Cmd+K` / `Ctrl+K`) and Escape dismissal.
   - Real-time search query filtering across Navigation, Products, Services, and Actions.
3. **FAQ Accordion (`FaqSection.tsx`):**
   - State-driven open/close transitions with smooth rotating Lucide chevron indicators.
4. **Mobile Navigation Drawer (`Navbar.tsx`):**
   - Responsive hamburger button toggling full-screen backdrop-blurred navigation drawer on mobile viewports.
5. **Interactive Contact Form (`ContactSection.tsx`):**
   - Controlled inputs for Name, Email, Project Type, and Details with simulated submission feedback.
6. **Command Pill Box:**
   - One-click clipboard copy utility for `$ let's connect`.

---

## 5. Route Verification & Static Generation

Running `next build` verified that all pages compile cleanly with static HTML outputs:

| Route | Type | Generated Output Size | Status |
| :--- | :--- | :--- | :--- |
| `/` (Homepage) | Static (Prerendered) | 130.6 KB HTML / 2.33 kB JS | Passed |
| `/security` (Security Services) | Static (Prerendered) | 62.9 KB HTML / 172 B JS | Passed |
| `/products` (Product Catalog) | Static (Prerendered) | 32.3 KB HTML / 181 B JS | Passed |
| `/services` (Services Hub) | Static (Prerendered) | 59.8 KB HTML / 172 B JS | Passed |
| `/about` (About ORBYT) | Static (Prerendered) | 40.9 KB HTML / 1.47 kB JS | Passed |
| `/contact` (Consultation Booking) | Static (Prerendered) | 21.0 KB HTML / 1.48 kB JS | Passed |
| `/_not-found` (404 Page) | Static (Prerendered) | 13.5 KB HTML / 991 B JS | Passed |
| `/security.html` (Legacy URL) | Rewrite to `/security` | — | Configured in `next.config.ts` |

---

## 6. TypeScript & Linting Audit

- `pnpm --filter website check-types`: **0 errors**. Strict TypeScript type-checking passed cleanly across all components.
- Zero reliance on external public CDNs: Tailwind and Lucide React are now strictly bundled via npm packages.

---

## 7. Safety Rule Attestation

- **`C:\Users\Dell\Downloads\New folder`:** 100% read-only. 0 files modified, deleted, moved, or altered.
- **`D:\Projects\InnBite`:** 100% read-only. Original project state intact.

---

## 8. Next Phase Readiness

The website is now fully operational in Next.js 15. In accordance with project instructions, **work stops here** to wait for your review and explicit approval before moving to **Prompt 04 (`prompts/04-company-website-redesign.md`)**.

