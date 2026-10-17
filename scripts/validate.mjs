import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { contrastRatio, passesNormal } from "./contrast.mjs";

assert.ok(contrastRatio("#000000", "#ffffff") > 20);
assert.equal(passesNormal(contrastRatio("#777777", "#ffffff")), false);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "data/restaurants");
const required = ["menu", "order", "visit", "reviews", "about", "catering"];
const heroes = ["cafeteria", "marquee", "poster", "tide", "butcher", "counter", "letterpress", "column", "chapel"];
const menuStyles = ["rows", "leaders", "hanging"];
const statuses = ["published", "partial", "names-only", "sample"];

function walkStrings(value, path, hits) {
  if (typeof value === "string") {
    if (value.includes("—") || value.includes("–")) hits.push(path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, `${path}[${index}]`, hits));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) walkStrings(child, `${path}.${key}`, hits);
  }
}

const files = readdirSync(dir).filter((name) => name.endsWith(".json") && !name.startsWith("_"));
assert.equal(files.length, 9, `expected 9 restaurants, found ${files.length}`);

const slugs = new Set();
const themes = [];

for (const file of files) {
  const restaurant = JSON.parse(readFileSync(join(dir, file), "utf8"));
  const label = restaurant.slug || file;
  assert.equal(file, `${restaurant.slug}.json`);
  assert.ok(!slugs.has(restaurant.slug), `duplicate ${restaurant.slug}`);
  slugs.add(restaurant.slug);
  assert.ok(restaurant.name && restaurant.phone && restaurant.phoneDisplay);
  assert.ok(restaurant.address?.street && restaurant.address.postalCode);
  assert.equal(typeof restaurant.geo.lat, "number");
  assert.ok(restaurant.seo?.title && restaurant.seo.description);
  assert.ok(heroes.includes(restaurant.hero?.variant), `${label} hero`);
  assert.ok(menuStyles.includes(restaurant.theme?.menuStyle), `${label} menu style`);
  assert.ok(statuses.includes(restaurant.menu?.status), `${label} menu status`);
  for (const section of required) {
    assert.ok(restaurant.sections.includes(section), `${label} missing ${section}`);
  }
  const theme = restaurant.theme;
  for (const key of ["paper", "ink", "band", "onBand", "accent", "onAccent"]) {
    assert.match(theme[key], /^#[0-9A-Fa-f]{6}$/, `${label} ${key}`);
  }
  const pairs = [
    ["ink", "paper", theme.ink, theme.paper],
    ["onBand", "band", theme.onBand, theme.band],
    ["onAccent", "accent", theme.onAccent, theme.accent],
    ["accent", "paper", theme.accent, theme.paper],
  ];
  for (const [name, , fg, bg] of pairs) {
    const ratio = contrastRatio(fg, bg);
    assert.ok(passesNormal(ratio), `${label} ${name} ${ratio.toFixed(2)} < 4.5 (${fg} on ${bg})`);
  }
  themes.push(theme.paper + theme.ink + theme.accent + restaurant.hero.variant);
  const dashes = [];
  walkStrings(restaurant, label, dashes);
  assert.deepEqual(dashes, [], `dash characters in ${dashes.join(", ")}`);
  const ids = new Set();
  for (const category of restaurant.menu.categories) {
    for (const item of category.items) {
      assert.ok(item.id && item.name && item.lang, `${label} item missing id/name/lang`);
      assert.ok(!ids.has(item.id), `${label} duplicate item ${item.id}`);
      ids.add(item.id);
      if (item.price != null && restaurant.menu.status === "sample") {
        assert.equal(item.sample, true, `${label} ${item.id} priced sample must be flagged`);
      }
      if (item.sample === true) {
        assert.equal(restaurant.menu.status, "sample", `${label} ${item.id} sample flag on a real menu`);
      }
    }
  }
  if (restaurant.reviews?.quote) {
    const quote = restaurant.reviews.quote;
    assert.ok(quote.text && quote.name && quote.source && quote.url, `${label} quote needs name, source, url`);
  }
}

assert.equal(new Set(themes).size, 9, "themes collapsed to the same skin");
console.log("validate ok");
