import assert from "node:assert/strict";
import { loadRestaurants } from "../src/lib/restaurants.mjs";
import { assertHttpsUrl, assertPrice, assertRating, assertWeekly, huesCollide, validateRestaurants } from "./validate.mjs";

assert.throws(() => assertHttpsUrl("javascript:alert(1)", "script"));
assert.throws(() => assertHttpsUrl("http://example.com/menu", "http"));
assert.doesNotThrow(() => assertHttpsUrl("https://example.com/menu", "https"));

assert.throws(() => assertPrice(0, "zero"));
assert.throws(() => assertPrice(-5, "negative"));
assert.throws(() => assertPrice("12", "string"));
assert.throws(() => assertPrice(Number.NaN, "nan"));
assert.doesNotThrow(() => assertPrice(null, "unpriced"));
assert.doesNotThrow(() => assertPrice(6.95, "priced"));

assert.throws(() => assertWeekly({ mon: [["25:00", "26:00"]] }, "hour"));
assert.throws(() => assertWeekly({ mon: [["9:00", "17:00"]] }, "hour"));
assert.throws(() => assertWeekly({ mon: [["18:00", "11:00"]] }, "order"));
assert.throws(() => assertWeekly({ mon: [["11:00", "11:00"]] }, "equal"));
assert.doesNotThrow(() => assertWeekly({ mon: [["00:00", "24:00"]] }, "all"));
assert.doesNotThrow(() => assertWeekly({ mon: [["11:30", "24:00"], ["00:00", "02:00"]] }, "overnight"));

const goodRating = {
  platform: "Google",
  source: "Restaurant Guru",
  url: "https://restaurantguru.com/example",
  value: 4.1,
  count: 12,
  checked: "2026-10-17",
};
assert.doesNotThrow(() => assertRating(null, "none"));
assert.doesNotThrow(() => assertRating(goodRating, "good"));
assert.throws(() => assertRating({ ...goodRating, url: "http://example.com" }, "http"));
assert.throws(() => assertRating({ ...goodRating, value: 5.1 }, "high"));
assert.throws(() => assertRating({ ...goodRating, value: -0.1 }, "low"));
assert.throws(() => assertRating({ ...goodRating, count: 1.5 }, "fraction"));
assert.throws(() => assertRating({ ...goodRating, checked: "" }, "blank"));
assert.throws(() => assertRating({ ...goodRating, checked: "2026-02-31" }, "day"));
assert.throws(() => assertRating({ ...goodRating, platform: "" }, "platform"));
assert.throws(() => assertRating({ ...goodRating, source: "  " }, "source"));

assert.equal(huesCollide("#B42318", "#B42318"), true);
assert.equal(huesCollide("#1B4D32", "#152E40"), false);

const all = loadRestaurants();
validateRestaurants(all);
validateRestaurants(all.slice(0, 1));
validateRestaurants(all.slice(0, 2));

const clone = structuredClone(all[0]);
clone.slug = "clone-room";
clone.name = "Clone Room";
clone.hero.variant = clone.hero.variant === "cafeteria" ? "poster" : "cafeteria";
assert.throws(() => validateRestaurants([all[0], clone]), /too close/);

console.log("validate cases ok");
