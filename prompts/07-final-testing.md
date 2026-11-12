You are a Senior QA Engineer and DevOps Architect.

Perform a complete quality verification of
the company monorepo.

APPLICATIONS:

1. Company Website
2. InByte Software

TESTING REQUIREMENTS:

COMPANY WEBSITE:

- Homepage.
- Navigation.
- About page.
- Product listing.
- InByte details page.
- Contact page.
- Responsive layouts.
- Images and assets.
- SEO metadata.
- Forms.
- Links.

INBYTE SOFTWARE:

- Existing application startup.
- Existing routes.
- Existing functionality.
- API connectivity.
- Environment variables.
- Existing UI.
- Build process.

MONOREPO:

- PNPM workspace.
- Turbo configuration.
- Dependencies.
- Independent development.
- Independent builds.
- Shared package imports.

COMMAND VERIFICATION:

Verify:

pnpm install

pnpm --filter website dev

pnpm --filter inbyte dev

pnpm --filter website build

pnpm --filter inbyte build

Use the actual package names and scripts
defined in each package.json.

IMPORTANT:

Do not modify existing functionality just to
make tests pass.

Do not remove features.

Document every error found.

Fix only issues introduced during migration
or integration.

Generate:

FINAL_QA_REPORT.md

Include:

- Completed tests.
- Failed tests.
- Fixed issues.
- Remaining issues.
- Production readiness.
- Deployment recommendations.

Stop after completing the report.