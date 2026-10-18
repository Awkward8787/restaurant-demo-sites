# Restaurant demo sites — Implementation Plan

## Status
Live/publishable. `Awkward8787/restaurant-demo-sites` `main` has PR #1 merged (nine demos) with an extensive review pass (H/M/N/D fixes) and an Astro upgrade. A `pr1`/`pr1v4` review branch exists on the box.

## Phases / milestones (reverse-documented)
1. **Data-driven generator** — one JSON builds one page; index + `[slug]` routes. ✅
2. **Cart + order summary** — stepper, pickup/delivery, tip, copy/call/WhatsApp, honest demo checkout. ✅
3. **i18n (en/es/pt)** + Newark-clock hours + remembered language. ✅
4. **Ratings** — verified-only, schema-validated, formatted per language. ✅
5. **Accessibility + SEO review** — focus management, live regions, 44px targets, noindex for prospects, PNG OG cards, SHA-pinned Pages workflow. ✅
6. **Astro upgrade** to 7.4 (Node 22.22) in the box copy. ✅ (verify in repo)

## Task breakdown (remaining / verify)
- Confirm GitHub Pages is enabled and list the live URLs.
- Reconcile Astro version between box copy (7.4) and repo `package.json` (5.x).
- Decide if/when a demo becomes a real ordering site (wire Square adapter + link).

## Dependencies
- Node 22.22; GitHub Pages; per-restaurant verified data (hours, ratings sources).

## Review gates
- UI review per restaurant (palette separation, hero, hours) ✅; validator + hours + adapter tests in CI ✅.

## Deploy / launch checklist
- `npm test` (hours/adapters/validate) green; `npm run build`; Pages deploy; verify each slug renders, hours are correct on the Newark clock, and prospect pages are `noindex`.

## Rollback plan
- Revert to the previous Pages deploy; static only, so no data migration risk.

## Post-launch follow-ups
- Keep hours/menus/ratings current per restaurant; convert won prospects to real sites.

## Open questions
- Which of the nine are active sales targets vs. already-pitched?

## Changelog

- **2026-10-18** — Initial reverse-documented draft from the codebase (executor documentation bot). Facts drawn from the repo/box source at the commit recorded in `/workspace/project-docs/state.json`.
