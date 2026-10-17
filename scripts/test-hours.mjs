import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { formatClock, isOpen } from "../src/lib/hours.mjs";

const boi = JSON.parse(readFileSync(new URL("../data/restaurants/boi-na-brasa.json", import.meta.url), "utf8"));
const andros = JSON.parse(readFileSync(new URL("../data/restaurants/andros-diner.json", import.meta.url), "utf8"));

const weekly = boi.hours.weekly;

// Saturday 17 Oct 2026 is still EDT (UTC-4).
assert.equal(isOpen(weekly, new Date("2026-10-17T05:00:00Z")), true, "1:00 a.m. Saturday still in the late window");
assert.equal(isOpen(weekly, new Date("2026-10-17T08:00:00Z")), false, "4:00 a.m. Saturday is between services");
assert.equal(isOpen(weekly, new Date("2026-10-17T16:00:00Z")), true, "noon Saturday is open");
assert.equal(isOpen(weekly, new Date("2026-10-19T06:00:00Z")), false, "2:00 a.m. Monday is the exclusive end");
assert.equal(isOpen(weekly, new Date("2026-10-18T03:59:00Z")), true, "11:59 p.m. Saturday is still open");

assert.equal(isOpen(andros.hours.weekly, new Date("2026-10-17T08:00:00Z")), true);
assert.equal(isOpen(andros.hours.weekly, new Date("2026-01-15T05:00:00Z")), true);
assert.equal(isOpen(null), null);

assert.equal(formatClock("24:00"), "midnight");
assert.equal(formatClock("11:30"), "11:30 a.m.");
assert.equal(formatClock("00:00"), "12 a.m.");
assert.equal(formatClock("15:00"), "3 p.m.");

console.log("hours ok");
