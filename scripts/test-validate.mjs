import assert from "node:assert/strict";
import { loadRestaurants } from "../src/lib/restaurants.mjs";
import { assertHttpsUrl, assertPrice, assertWeekly, validateRestaurants } from "./validate.mjs";

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

const all = loadRestaurants();
validateRestaurants(all);
validateRestaurants(all.slice(0, 1));
validateRestaurants(all.slice(0, 2));

console.log("validate cases ok");
