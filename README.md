# ORBYT Monorepo Ecosystem

Production-ready enterprise monorepo managing the ORBYT company website, product showcase, and the InByte restaurant management suite.

## 1. Monorepo Architecture

```
orbyt-monorepo/
├── apps/
│   ├── website/              # ORBYT Company Marketing & Product Showcase (Next.js 15)
│   └── inbyte/               # InByte Real-Time QR Restaurant Suite (React 19 + Vite 6 + Supabase)
│
├── packages/
│   ├── ui/                   # Reusable UI component library (@orbyt/ui)
│   ├── shared/               # Shared domain models, constants, and utilities (@orbyt/shared)
│   └── config/               # Base configurations for TypeScript, ESLint, Tailwind (@orbyt/config)
│
├── prompts/                  # Migration & architectural execution prompts
├── PROJECT_AUDIT.md          # Comprehensive Phase 1 source project audit
├── MONOREPO_SETUP_REPORT.md  # Phase 2 verification and workspace discovery report
├── pnpm-workspace.yaml       # PNPM workspace definition
├── turbo.json                # Turborepo task pipeline configuration
├── tsconfig.json             # Root TypeScript project references & aliases
└── package.json              # Monorepo root manifest and orchestration scripts
```

## 2. Technology Stack

- **Package Manager:** PNPM Workspaces
- **Build System:** Turborepo
- **Frameworks:**
  - `apps/website`: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
  - `apps/inbyte`: React 19, Vite 6, React Router DOM v7, Supabase, Tailwind CSS
- **Shared Packages:** TypeScript, Tailwind presets, Lucide React

## 3. Getting Started

### Prerequisites
- Node.js `>= 18.0.0`
- PNPM `>= 9.0.0`

### Installation
Install all dependencies across the entire monorepo workspace:
```bash
pnpm install
```

### Development Scripts

Run all applications in development mode in parallel via Turborepo:
```bash
pnpm dev
```

Run independent applications:
```bash
# Company Website (Next.js - port 3000)
pnpm dev:website

# InByte Application (Vite - port 5173)
pnpm dev:inbyte
```

### Build Scripts

Run production builds across the entire workspace:
```bash
pnpm build
```

Run independent production builds:
```bash
# Build Company Website
pnpm build:website

# Build InByte
pnpm build:inbyte
```

### Quality Assurance & Linting

```bash
# Type-check all packages and apps
pnpm check-types

# Lint all packages and apps
pnpm lint
```

