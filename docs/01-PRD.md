# Restaurant demo sites — Product Requirements Document (PRD)

## Problem
To win local-restaurant clients in Newark, Dondon needs polished, believable demo sites he can show as previews — one per restaurant — generated from a single data file, with a working in-browser cart but no real ordering, so prospects see what their own site could be.

## Audience and users
- **Prospects:** nine Newark restaurant owners/managers who view their demo.
- **Diners (in the demo):** browse the menu, build a cart, and get a copy/call/WhatsApp order summary (checkout does not place a real order).
- **Owner:** Dondon (sales tool). Published under `Awkward8787/restaurant-demo-sites`.

## Goals and success measures
- One JSON file per restaurant builds one page with its own palette, type, hero, menu, hours, and ratings.
- Trilingual (English/Spanish/Portuguese) to match the neighborhood.
- Honest demo: the cart works; checkout stops on a clear demo screen. Success: signed clients from demos.

## Features in scope
- Static per-restaurant pages from `data/restaurants/*.json` (high).
- In-browser cart with quantity steppers, pickup/delivery, tip, and an order summary to copy / call / send on WhatsApp (high).
- i18n (en/es/pt) with remembered language; Newark-clock open/closed status (high).
- Verified ratings (platform, source URL, score, count, checked date) — optional per restaurant (medium).
- Pluggable ordering adapters (demo, Square, Stripe, DoorDash Drive, Uber Direct) — only `demo` is wired for prospects (low).

## Out of scope
- Real payment/placement for prospect demos (checkout is copy-and-call only).
- Accounts, server, or a database.

## User stories
- As a prospect, I open my demo and see my restaurant with real hours and menu.
- As a diner, I add dishes, pick pickup/delivery, add a tip, and get an order summary to send.

## Constraints
- Prospect pages are previews, not the restaurants' own sites: they send `noindex`, omit third-party scores from structured data, and `robots.txt` doesn't advertise a sitemap.
- Ratings must be verifiable (https source, score 0–5, whole count, checked date) or omitted.
- Payment links, if ever enabled, must be Square hosts only (square.link/square.site/squareup.com).

## Open questions
- Are GitHub Pages published for all nine, and which (if any) are shown live vs. local preview?
- Will any demo be converted to a real ordering site (enabling the Square/Stripe adapters)?

## Changelog

- **2026-10-18** — Initial reverse-documented draft from the codebase (executor documentation bot). Facts drawn from the repo/box source at the commit recorded in `/workspace/project-docs/state.json`.
