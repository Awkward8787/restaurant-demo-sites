import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { t } from "../src/i18n.mjs";
import { formatPickup, pickupIssue } from "../src/lib/hours.mjs";

const boi = JSON.parse(readFileSync(new URL("../data/restaurants/boi-na-brasa.json", import.meta.url), "utf8"));
const weekly = boi.hours.weekly;
const evening = new Date("2026-10-20T22:00:00Z");

assert.equal(pickupIssue("2026-10-20T17:30", evening, weekly), "past");
assert.equal(pickupIssue("2026-10-20T17:58", evening, weekly), "past");
assert.equal(pickupIssue("2026-10-20T17:59", evening, weekly), null);
assert.equal(pickupIssue("2026-10-20T19:00", evening, weekly), null);
assert.equal(pickupIssue("2026-10-24T04:00", evening, weekly), "closed");
assert.equal(pickupIssue("2026-10-24T12:00", evening, weekly), null);
assert.equal(pickupIssue("2026-03-08T02:30", new Date("2026-03-01T15:00:00Z"), weekly), "gap");
assert.equal(pickupIssue("2026-03-08T03:30", new Date("2026-03-01T15:00:00Z"), weekly), "closed");
assert.equal(pickupIssue("2026-11-01T01:30", new Date("2026-11-01T06:00:00Z"), weekly), null);
assert.equal(pickupIssue("2026-11-01T01:30", new Date("2026-11-01T07:00:00Z"), weekly), "past");
assert.equal(pickupIssue("tomorrow", evening, weekly), "invalid");
assert.equal(pickupIssue("2026-02-31T12:00", evening, weekly), "invalid");
assert.equal(pickupIssue("2026-10-20T19:00", evening, null), null);
assert.equal(pickupIssue("2026-10-20T17:30", evening, null), "past");

assert.equal(formatPickup("2026-10-20T19:00", "en"), "Tue 7:00 PM");
assert.equal(formatPickup("2026-10-20T19:00", "es"), "mar, 19:00");
assert.equal(formatPickup("2026-10-20T19:00", "pt"), "ter., 19:00");
assert.equal(formatPickup("nope", "en"), "nope");
for (const key of ["errorTimeGap", "errorClosed"]) {
  assert.notEqual(t("es", key), t("en", key));
  assert.notEqual(t("pt", key), t("en", key));
}

console.log("pickup ok");
