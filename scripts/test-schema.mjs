import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isProspect, restaurantJsonLd } from "../src/lib/schema.mjs";

const restaurant = {
  name: "Test Grill",
  servesCuisine: ["Brazilian"],
  phone: "+19735550100",
  address: { street: "1 Merchant Street", city: "Newark", region: "NJ", postalCode: "07102", country: "US" },
  geo: { lat: 40.73, lon: -74.16 },
  menu: { status: "published", categories: [] },
  rating: { value: 4.5, count: 80 },
};
const node = restaurantJsonLd(restaurant, "https://example.com/test/");
assert.equal("aggregateRating" in node, false);
assert.equal(isProspect(restaurant), true);
assert.equal(isProspect({ demo: true }), true);
assert.equal(isProspect({ demo: false }), false);

const slug = readFileSync(new URL("../src/pages/[slug].astro", import.meta.url), "utf8");
const index = readFileSync(new URL("../src/pages/index.astro", import.meta.url), "utf8");
const robots = readFileSync(new URL("../public/robots.txt", import.meta.url), "utf8");
assert.match(slug, /isProspect\(r\) && <meta name="robots" content="noindex" \/>/);
assert.match(index, /<meta name="robots" content="noindex" \/>/);
assert.doesNotMatch(robots, /sitemap/i);

console.log("schema ok");
