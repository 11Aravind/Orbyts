# Project Audit – Existing Software Projects

You are a Senior Software Architect and Monorepo Migration Specialist.

I am building a centralized software product ecosystem for my software development company.

I have two existing projects.

## 1. Existing Company Website

- Technology: HTML, CSS and JavaScript.
- Contains company information.
- Contains product listings.
- Contains existing images, assets and website content.

**Current source path:**

`C:\Users\Dell\Downloads\New folder`

## 2. Existing InByte Software

- Technology: React.js.
- This is an existing, developed and tested application.
- Its existing functionality must be preserved.
- Do not redesign or rewrite this application.

**Current source path:**

`D:\Projects\InnBite folder`

## Main Objective

I want to create a centralized monorepo containing both projects.

Initially, I want you to inspect and analyze both existing projects and prepare them for migration.

## Your Tasks

1. Inspect the complete folder structures of both projects.
2. Identify frameworks and dependencies.
3. Identify existing routes and pages.
4. Inspect CSS, JavaScript and assets.
5. Identify reusable components.
6. Understand the InByte application's architecture.
7. Identify environment variables and API integrations.
8. Identify potential migration issues.
9. Identify files that should be preserved during migration.

## Copying Requirements

After inspecting both projects, prepare to copy their complete source code into the new monorepo.

Expected destination:

`apps/website/` – Company Website

`apps/inbyte/` – InByte Software

However, do not perform the copying until I approve the audit report.

Preserve all existing source files, configurations, assets and dependencies.

## CRITICAL SAFETY RULES

- Never modify the original source projects.
- Never delete original files.
- Never rename original files.
- Never move original folders.
- Never overwrite existing source files.
- Never install or update dependencies.
- Never start migration or redesign.
- Do not modify application functionality.
- Treat both original projects as read-only.
- If any folder cannot be accessed, report the issue instead of guessing.

## Audit Report

Generate a detailed `PROJECT_AUDIT.md` in the root directory of the new monorepo.

Include:

- Existing project architecture.
- Technology stack.
- Dependencies.
- Important files.
- Asset locations.
- Routing information.
- Environment variables.
- API integrations.
- Migration recommendations.
- Potential compatibility issues.
- Recommended copying strategy.

After completing the audit:

1. Show me the audit summary.
2. List any problems found.
3. Confirm that original source files were not modified.
4. Wait for my explicit approval before copying or proceeding to the next phase.

**This phase is strictly for project analysis and reporting.**