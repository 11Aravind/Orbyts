You are a Senior Monorepo Integration Architect.

Now integrate the company website and InByte
application into the existing monorepo architecture.

PROJECT STRUCTURE:

apps/
   website/
   inbyte/

packages/
   ui/
   shared/
   config/

OBJECTIVE:

Establish a clean and maintainable product ecosystem.

REQUIREMENTS:

1. Keep the company website independent.
2. Keep InByte software independent.
3. Keep product details pages inside the company website.
4. Configure shared packages only where necessary.
5. Configure independent development scripts.
6. Configure independent production builds.
7. Configure application-specific environment variables.
8. Ensure there are no dependency conflicts.

SHARED COMPONENTS:

Identify reusable components such as:

- Buttons.
- Form elements.
- Common UI utilities.
- Shared TypeScript types.

Do not unnecessarily move application-specific
components into shared packages.

ROUTING:

Company website:
/

InByte product details:
/products/inbyte

Actual InByte software:

Keep its existing routing and application structure.

Do not combine its routing with the company website.

IMPORTANT:

Do not modify the business logic of InByte.

Do not introduce breaking changes.

After integration, verify both applications
independently.

Generate an INTEGRATION_REPORT.md.

Stop after completing this phase.