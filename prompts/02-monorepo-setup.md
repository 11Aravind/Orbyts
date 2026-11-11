You are a Senior Monorepo Architect.

Based on the previously generated PROJECT_AUDIT.md,
create a production-ready Monorepo architecture.

TECHNOLOGY:

- PNPM Workspaces
- Turborepo
- Next.js
- React.js
- TypeScript
- Tailwind CSS

ARCHITECTURE:

my-company/
│
├── apps/
│   ├── website/
│   └── inbyte/
│
├── packages/
│   ├── ui/
│   ├── shared/
│   └── config/
│
├── prompts/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── .gitignore
└── README.md

REQUIREMENTS:

1. Create the complete monorepo structure.
2. Configure PNPM workspaces.
3. Configure Turborepo.
4. Configure shared TypeScript settings.
5. Configure ESLint where appropriate.
6. Configure shared package aliases.
7. Prepare independent application scripts.
8. Prepare independent build configurations.

IMPORTANT:

Do not migrate the company website yet.

Do not modify InByte source code yet.

Do not redesign anything.

Create only the monorepo foundation and configurations.

Ensure the architecture supports:

- Multiple Next.js applications.
- Multiple React applications.
- Independent builds.
- Independent deployments.
- Shared packages.
- Future software products.

After setup:

1. Verify workspace configuration.
2. Run dependency installation.
3. Verify application discovery.
4. Generate MONOREPO_SETUP_REPORT.md.

Stop after completing this phase.