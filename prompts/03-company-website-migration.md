You are a Senior Next.js Developer and Website
Migration Specialist.

I have an existing company website developed using:

- HTML
- CSS
- JavaScript

I want to migrate this website into Next.js.

SOURCE PATH:

[PASTE EXISTING COMPANY WEBSITE PATH]

DESTINATION:

apps/website/

FRAMEWORK:

- Next.js
- React
- TypeScript
- Tailwind CSS

OBJECTIVE:

Convert the complete existing HTML website into
a properly structured Next.js application.

IMPORTANT REQUIREMENTS:

1. Inspect every existing HTML page.
2. Identify all existing sections.
3. Identify navigation menus.
4. Identify headers and footers.
5. Identify product listing sections.
6. Identify images and other assets.
7. Identify existing JavaScript functionality.
8. Identify responsive layouts.

MIGRATION RULES:

- Preserve all existing website content.
- Preserve important images and assets.
- Preserve existing business information.
- Preserve navigation functionality.
- Preserve existing forms and interactions.
- Do not remove important sections.
- Do not modify the original source files.

NEXT.JS ARCHITECTURE:

Use the Next.js App Router.

Create reusable components.

Suggested structure:

apps/website/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/
│   ├── products/
│   ├── services/
│   └── contact/
│
├── components/
│   ├── layout/
│   ├── sections/
│   ├── navigation/
│   └── common/
│
├── public/
│   └── assets/
│
├── styles/
│
├── package.json
└── next.config.ts

IMPORTANT:

This phase is primarily a migration phase.

Do not introduce unnecessary design changes.

Do not redesign the entire website yet.

First reproduce the existing website in Next.js.

After migration:

1. Run the development server.
2. Check all routes.
3. Check all images.
4. Check navigation.
5. Check responsive layouts.
6. Check console errors.
7. Compare the migrated pages with the original website.

Generate a WEBSITE_MIGRATION_REPORT.md.

Do not proceed to the next phase automatically.