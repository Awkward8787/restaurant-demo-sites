# Restaurant demo sites — Technical Requirements Document (TRD)

## Stack and why
- **Astro** static site (`output` static). One dynamic route (`src/pages/[slug].astro`) renders a page per restaurant JSON; `index.astro` lists them. Client logic is vanilla JS (`src/scripts/page.mjs`). No framework runtime, no server.
- **i18n** via `src/i18n.mjs`; **hours** logic in `src/lib/hours.mjs`; schema/validation in `src/lib/schema.mjs` and `scripts/validate.mjs`.

## Hosting and deploy target
- GitHub Pages via `.github/workflows/pages.yml` (deploy permissions scoped to the deploy job; a PR workflow runs tests + build; actions pinned to commit SHAs; deploy waits rather than cancels). Node 22.22 pinned (Astro 7.4 in the box copy; repo `package.json` lists Astro 5 — see open question). `robots.txt` generated from the site base.

## Third-party services and APIs
- None required for the demo. Ordering adapters exist for Square, Stripe, DoorDash Drive, Uber Direct but are stubs; only `demo` is used for prospect pages. Share images are 1200×630 PNGs.

## Environments and secrets (names only)
- None needed for the static demo. Any future Square payment link is a public URL stored per restaurant (`checkout.squarePaymentLink`), not a secret.

## Security, performance, privacy, accessibility
- Inline JSON escapes `<` to Unicode so menu/hours text can't close the script tag.
- Prospect pages `noindex`; no third-party scores in structured data.
- Accessibility (extensive, per commit history): named tip field + order groups with legends, per-dish `aria-describedby` on Add buttons, live-region cart total, focus restored after quantity changes, 44px link targets, language-tagged fallback text, address-line1 semantics for delivery.
- Custom tip clamped 0–100; cart rebuilt/allowlisted from the menu on restore from sessionStorage.

## Browser/device support
- Evergreen mobile + desktop; coarse-pointer-only scroll-into-view.

## Testing
- `npm test` runs `scripts/test-hours.mjs`, `scripts/test-adapters.mjs`, `scripts/validate.mjs` (also `contrast.mjs`). Validator requires https URLs, positive prices, HH:MM hour ranges, and well-formed ratings.

## Open questions
- Reconcile Astro version: box copy upgraded to 7.4.0 (Node 22.22), repo `package.json` shows `astro ^5.14.1`. Confirm the shipped version.

## Changelog

- **2026-10-18** — Initial reverse-documented draft from the codebase (executor documentation bot). Facts drawn from the repo/box source at the commit recorded in `/workspace/project-docs/state.json`.
