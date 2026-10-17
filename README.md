# Restaurant demo sites

Static demo sites for nine Newark restaurants. One JSON file in `data/restaurants/` generates one page. There is no server to view them. The cart works in the browser. Checkout does not place an order.

## Pages URLs

After GitHub Pages is enabled (see below):

- https://awkward8787.github.io/restaurant-demo-sites/
- https://awkward8787.github.io/restaurant-demo-sites/jv-grill/
- https://awkward8787.github.io/restaurant-demo-sites/andros-diner/
- https://awkward8787.github.io/restaurant-demo-sites/boi-na-brasa/
- https://awkward8787.github.io/restaurant-demo-sites/brisas-del-mar/
- https://awkward8787.github.io/restaurant-demo-sites/cityrub/
- https://awkward8787.github.io/restaurant-demo-sites/peruvian-brazas/
- https://awkward8787.github.io/restaurant-demo-sites/cantinho-mineiro/
- https://awkward8787.github.io/restaurant-demo-sites/sabor-unido/
- https://awkward8787.github.io/restaurant-demo-sites/virgen-de-la-nube/

Local preview:

```bash
npm install
npm test
npm run build
npm run preview
```

Local pages are also under `/restaurant-demo-sites/`. Override with `BASE_PATH=/` if you serve the site from a domain root. Set `SITE_URL` to the origin, without the base path.

## Add a restaurant

1. Copy `data/restaurants/_example.json` to `data/restaurants/<slug>.json`. Files that start with `_` are not built.
2. Fill the name, phone, address, map point, hours, and menu from a source you can link. If a price or hour is missing, leave it null or write `TODO` in the note. Do not invent a number.
3. Set `menu.status` to one of `published`, `partial`, `names-only`, or `sample`. Priced items on a `sample` menu must have `"sample": true`.
4. Pick a palette (paper, ink, and one accent), a display font, a `menuStyle` (`rows`, `leaders`, or `hanging`), and a `hero.variant`. Reusing another restaurant's combination fails `npm test`.
5. Run `npm test` and `npm run build`. Contrast for ink on paper, band text, accent text, and accent on paper must clear WCAG AA for normal text (4.5:1).
6. Run `node scripts/write-og.mjs` so the share image matches the new colors.

`npm test` checks open/closed math, the ordering stubs, the nine data files, dash characters, and contrast.

## Menus: what is real

Checked 17 October 2026. "Published" means a public page listed the price. It is not a promise the kitchen still charges that.

| Restaurant | Status | What is on the page |
| --- | --- | --- |
| J&V Grill | Names only | Dish names from MenuTuff. No prices on that listing, so every line says call for price. Hours are 5:30 a.m. to 9 p.m. every day, from Restaurant Guru, which also says no delivery. |
| Andros Diner | Partial | Breakfast, lunch, pizza, panini, burgers, and hot sandwiches from a 2018 PDF on atandros.com. That PDF also prints a $2 delivery charge and delivery hours. Pickup hours stay 24 hours. |
| Boi Na Brasa (1 Merchant Street) | Sample | Rodízio, churrasco, feijoada, and the salad bar are named on the Yelp listing, with no price. The priced cuts are marked sample. The Adams Street steakhouse menu is a different room and is not copied here. |
| Brisas del Mar | Partial | Bolones $3, ceviche mixto $16, sopa de gallina $13, camarones al ajillo $16, from their ordering page. They mentioned six ceviches. The other two names were not captured. |
| Cityrub | Published | SinglePlatform menu for 118 Stockton Street: starters, smoker, sausages, combos, sides, plates, salads, moonshine. Kids menu and happy hour were omitted because the parse was not clean. The restaurant site says they can deliver, with restrictions, and prints no fee. |
| Peruvian Brazas | Names only | Lomo saltado is named with no price. The Postmates page that used to print $25 no longer opens, and the Uber Eats page did not print a price. |
| Cantinho Mineiro | Partial | Feijoada à brasileira $24 and bife à cavalo $24 from DoorDash. DoorDash and Uber Eats list 51 Niagara Street for this phone. OpenStreetMap lists 51 Hensler Street. The page keeps Hensler and says so. |
| Sabor Unido | Published | Prices from the menu page on saborunido.com. Saturday feijoada is described on the homepage with no price, so it is not a priced dish. |
| Virgen de la Nube | Sample | No priced menu found. The plates and the prices are a labeled sample. Hours and a Google score are from Restaurant Guru, which also lists delivery with no fee. |

Reviews are rating counts with a source link. The only quotation is KT Harrison, as printed on Sabor Unido's press page, with that page linked. Other pages do not invent quotes.

## Real ordering

See [docs/ordering.md](docs/ordering.md). Square payment links, Stripe Payment Links, DoorDash Drive, and Uber Direct are documented there. The demo checkout does not use them.

## Turn a demo into the client's site

- Confirm phone, hours, address, and every price with the owner. Replace sample and partial menus.
- Put a real photo of their food in the hero only if they own the rights. Otherwise leave the type.
- Add a delivery zone, fee, and minimum only after the owner states them. The $2 on Andros is the charge printed on the 2018 menu, not a new fee.
- Remove the "Demo preview built for" banner.
- Point the catering note at a real inbox, or keep it as a call script.
- Set `checkout.squarePaymentLink` or `checkout.stripePaymentLink`, and host Drive or Uber Direct on a server. Do not put those secrets in this repo.
- In the GitHub repo settings, set Pages to **GitHub Actions**. The workflow is `.github/workflows/pages.yml`. It runs on pushes to `main`.
- For a custom domain, set `SITE_URL` and `BASE_PATH=/` in that workflow.

## What you do by hand

The workflow file is in the repo. Pages will not go live until someone opens the repository **Settings → Pages** and chooses **GitHub Actions** as the source. The first deploy happens on the next push to `main` after that, or by running the `pages` workflow by hand.
