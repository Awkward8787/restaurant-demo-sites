import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { contrastRatio, parseHex, passesNormal } from "./contrast.mjs";
import { DAY_ORDER, toMinutes } from "../src/lib/hours.mjs";

assert.ok(contrastRatio("#000000", "#ffffff") > 20);
assert.equal(passesNormal(contrastRatio("#777777", "#ffffff")), false);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "data/restaurants");
const required = ["menu", "order", "visit", "reviews", "about", "catering"];
const heroes = ["cafeteria", "marquee", "poster", "tide", "butcher", "counter", "letterpress", "column", "chapel"];
const menuStyles = ["rows", "leaders", "hanging"];
const statuses = ["published", "partial", "names-only", "sample"];
const URL_KEYS = new Set(["url", "sourceUrl", "fontHref", "osmUrl", "href"]);
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$|^24:00$/;

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

function collectUrlFields(value, path, hits) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectUrlFields(item, `${path}[${index}]`, hits));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      const next = `${path}.${key}`;
      if (URL_KEYS.has(key) && child != null) hits.push([next, child]);
      else collectUrlFields(child, next, hits);
    }
  }
}

export function assertHttpsUrl(url, label) {
  assert.equal(typeof url, "string", label);
  assert.match(url, /^https:\/\//, `${label} must be an https URL`);
}

export function assertPrice(price, label) {
  if (price == null) return;
  assert.equal(typeof price, "number", `${label} price`);
  assert.ok(Number.isFinite(price) && price > 0, `${label} price must be a positive number`);
}

function hsl(hex) {
  const [red, green, blue] = parseHex(hex).map((channel) => channel / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  const light = (max + min) / 2;
  const sat = delta === 0 ? 0 : delta / (1 - Math.abs(2 * light - 1));
  return { hue, sat, light };
}

function hueUnstable({ sat, light }) {
  return sat < 0.2 || light < 0.15 || light > 0.85;
}

/** True when two colors would read as the same hue. Near-black, near-white, and low-chroma colors are skipped, because their hue is not a visible difference. Hero variant is not part of this. */
export function huesCollide(a, b) {
  const left = hsl(a);
  const right = hsl(b);
  if (hueUnstable(left) || hueUnstable(right)) return false;
  let distance = Math.abs(left.hue - right.hue);
  distance = Math.min(distance, 360 - distance);
  if (left.sat >= 0.25 && right.sat >= 0.25) return distance < 14;
  return distance < 14 && Math.abs(left.light - right.light) < 0.2;
}

export function assertRating(rating, label) {
  if (rating == null) return;
  assert.equal(typeof rating.platform, "string", `${label} platform`);
  assert.ok(rating.platform.trim(), `${label} platform`);
  assert.equal(typeof rating.source, "string", `${label} source`);
  assert.ok(rating.source.trim(), `${label} source`);
  assertHttpsUrl(rating.url, `${label} rating url`);
  assert.equal(typeof rating.value, "number", `${label} rating value`);
  assert.ok(Number.isFinite(rating.value) && rating.value >= 0 && rating.value <= 5, `${label} rating value`);
  assert.equal(typeof rating.count, "number", `${label} rating count`);
  assert.ok(Number.isInteger(rating.count) && rating.count >= 0, `${label} rating count`);
  assert.match(String(rating.checked ?? ""), /^\d{4}-\d{2}-\d{2}$/, `${label} checked`);
  const parsed = new Date(`${rating.checked}T00:00:00Z`);
  assert.equal(Number.isNaN(parsed.getTime()), false, `${label} checked`);
  assert.equal(parsed.toISOString().slice(0, 10), rating.checked, `${label} checked`);
}

export function assertWeekly(weekly, label) {
  if (weekly == null) return;
  assert.equal(typeof weekly, "object", `${label} hours`);
  for (const day of Object.keys(weekly)) {
    assert.ok(DAY_ORDER.includes(day), `${label} unknown day ${day}`);
  }
  for (const day of DAY_ORDER) {
    if (weekly[day] == null) continue;
    const ranges = weekly[day];
    assert.ok(Array.isArray(ranges), `${label} ${day}`);
    for (const range of ranges) {
      assert.ok(Array.isArray(range) && range.length === 2, `${label} ${day}`);
      const [start, end] = range;
      assert.match(start, HHMM, `${label} ${day} start`);
      assert.match(end, HHMM, `${label} ${day} end`);
      assert.ok(toMinutes(start) < toMinutes(end), `${label} ${day} ${start} must end after it starts`);
    }
  }
}

export function validateRestaurants(restaurants) {
  const slugs = new Set();
  const accents = [];
  for (const restaurant of restaurants) {
    const label = restaurant.slug || restaurant.name || "restaurant";
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
    assert.ok(
      restaurant.delivery === true || restaurant.delivery === false || restaurant.delivery === "unknown",
      `${label} delivery must be true, false, or unknown`,
    );
    if (restaurant.deliveryFee != null) {
      assert.equal(restaurant.delivery, true, `${label} delivery fee without delivery`);
      assertPrice(restaurant.deliveryFee, `${label} delivery fee`);
    }
    if (restaurant.deliveryFeeYear != null) {
      assert.equal(restaurant.deliveryFee != null, true, `${label} delivery fee year without a delivery fee`);
      assert.equal(
        Number.isInteger(restaurant.deliveryFeeYear),
        true,
        `${label} delivery fee year must be an integer`,
      );
      const currentYear = new Date().getFullYear();
      assert.ok(
        restaurant.deliveryFeeYear >= 1990 && restaurant.deliveryFeeYear <= currentYear,
        `${label} delivery fee year must be from 1990 through ${currentYear}`,
      );
    }
    assert.equal(
      huesCollide(theme.accent, theme.band),
      false,
      `${label} accent and band are too close (${theme.accent} / ${theme.band})`,
    );
    accents.push({ slug: restaurant.slug, accent: theme.accent, band: theme.band, ink: theme.ink });
    const dashes = [];
    walkStrings(restaurant, label, dashes);
    assert.deepEqual(dashes, [], `dash characters in ${dashes.join(", ")}`);
    const urls = [];
    collectUrlFields(restaurant, label, urls);
    for (const [path, url] of urls) assertHttpsUrl(url, path);
    assertWeekly(restaurant.hours?.weekly, label);
    assertWeekly(restaurant.hours?.deliveryWeekly, `${label} delivery`);
    assertRating(restaurant.rating, `${label} rating`);
    const ids = new Set();
    for (const category of restaurant.menu.categories) {
      for (const item of category.items) {
        assert.ok(item.id && item.name && item.lang, `${label} item missing id/name/lang`);
        assert.ok(!ids.has(item.id), `${label} duplicate item ${item.id}`);
        ids.add(item.id);
        assertPrice(item.price, `${label} ${item.id}`);
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
  for (const key of ["accent", "band", "ink"]) {
    for (let i = 0; i < accents.length; i += 1) {
      for (let j = i + 1; j < accents.length; j += 1) {
        assert.equal(
          huesCollide(accents[i][key], accents[j][key]),
          false,
          `${accents[i].slug} and ${accents[j].slug} ${key} colors are too close (${accents[i][key]} / ${accents[j][key]})`,
        );
      }
    }
  }
}

function loadFromDisk() {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json") && !name.startsWith("_"))
    .sort()
    .map((file) => {
      const restaurant = JSON.parse(readFileSync(join(dir, file), "utf8"));
      assert.equal(file, `${restaurant.slug}.json`);
      return restaurant;
    });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  validateRestaurants(loadFromDisk());
  console.log("validate ok");
}
