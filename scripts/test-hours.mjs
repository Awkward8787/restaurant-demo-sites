import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { bindHoursRefresh, formatClock, isOpen, weekLines } from "../src/lib/hours.mjs";

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

assert.equal(formatClock("11:30", "en"), "11:30 AM");
assert.equal(formatClock("00:00", "en"), "12:00 AM");
assert.equal(formatClock("15:00", "en"), "3:00 PM");
assert.equal(formatClock("02:00", "es"), "2:00");
assert.equal(formatClock("15:00", "pt"), "15:00");

const boiLines = (lang) => Object.fromEntries(weekLines(weekly, lang).map((line) => [line.day, line.text]));
const boiEn = boiLines("en");
assert.equal(boiEn.mon, "11:30 AM to 2:00 AM");
assert.equal(boiEn.fri, "11:30 AM to 3:00 AM");
assert.equal(boiEn.sun, "11:30 AM to 2:00 AM");
assert.doesNotMatch(boiEn.mon, /12:00 AM to 2:00 AM/);
const boiEs = boiLines("es");
assert.equal(boiEs.mon, "11:30 a 2:00");
assert.equal(boiEs.fri, "11:30 a 3:00");
assert.doesNotMatch(boiEs.mon, /a\.m\.|\bto\b/);
const boiPt = boiLines("pt");
assert.equal(boiPt.mon, "11:30 às 2:00");
assert.equal(boiPt.sat, "11:30 às 3:00");

assert.deepEqual(
  weekLines(andros.hours.weekly, "en").map((line) => line.text),
  Array(7).fill("Open 24 hours"),
);
assert.equal(weekLines(andros.hours.weekly, "es")[0].text, "Abierto 24 horas");
assert.equal(weekLines(andros.hours.weekly, "pt")[0].text, "Aberto 24 horas");

const carry = {
  mon: [["00:00", "02:00"]],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [["11:30", "24:00"]],
};
const carryLines = Object.fromEntries(weekLines(carry, "en").map((line) => [line.day, line.text]));
assert.equal(carryLines.sun, "11:30 AM to 2:00 AM");
assert.equal(carryLines.mon, "Closed");

const fullThenMorning = {
  mon: [["00:00", "02:00"]],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [["00:00", "24:00"]],
};
const fullLines = Object.fromEntries(weekLines(fullThenMorning, "en").map((line) => [line.day, line.text]));
assert.equal(fullLines.sun, "Open 24 hours");
assert.equal(fullLines.mon, "12:00 AM to 2:00 AM");

const standalone = {
  mon: [["00:00", "09:00"]],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [["11:00", "21:00"]],
};
const standaloneLines = Object.fromEntries(weekLines(standalone, "en").map((line) => [line.day, line.text]));
assert.equal(standaloneLines.mon, "12:00 AM to 9:00 AM");
assert.equal(standaloneLines.sun, "11:00 AM to 9:00 PM");

const jv = JSON.parse(readFileSync(new URL("../data/restaurants/jv-grill.json", import.meta.url), "utf8"));
const virgen = JSON.parse(readFileSync(new URL("../data/restaurants/virgen-de-la-nube.json", import.meta.url), "utf8"));
const jvLines = Object.fromEntries(weekLines(jv.hours.weekly, "en").map((line) => [line.day, line.text]));
const virgenLines = Object.fromEntries(weekLines(virgen.hours.weekly, "en").map((line) => [line.day, line.text]));
assert.equal(jvLines.mon, "5:30 AM to 9:00 PM");
assert.equal(jvLines.sun, "5:30 AM to 9:00 PM");
assert.equal(virgenLines.mon, "6:00 AM to 8:30 PM");
assert.equal(virgenLines.sun, "8:30 AM to 4:30 PM");
assert.equal(isOpen(jv.hours.weekly, new Date("2026-10-19T13:00:00Z")), true, "Monday 9:00 a.m. Newark, J&V open");
assert.equal(isOpen(jv.hours.weekly, new Date("2026-10-20T02:00:00Z")), false, "Monday 10:00 p.m. Newark, J&V closed");
assert.equal(isOpen(virgen.hours.weekly, new Date("2026-10-18T16:00:00Z")), true, "Sunday noon Newark, Virgen open");
assert.equal(isOpen(virgen.hours.weekly, new Date("2026-10-18T21:00:00Z")), false, "Sunday 5:00 p.m. Newark, Virgen closed");
assert.equal(isOpen(virgen.hours.weekly, new Date("2026-10-19T09:00:00Z")), false, "Monday 5:00 a.m. Newark, Virgen closed");

let timer;
let onVisible;
let shown = "hidden";
const paints = [];
bindHoursRefresh(() => paints.push("paint"), {
  setInterval: (fn, ms) => {
    timer = { fn, ms };
  },
  addEventListener: (type, fn) => {
    assert.equal(type, "visibilitychange");
    onVisible = fn;
  },
  visibilityState: () => shown,
});
assert.equal(timer.ms, 60_000);
timer.fn();
assert.deepEqual(paints, ["paint"]);
onVisible();
assert.deepEqual(paints, ["paint"]);
shown = "visible";
onVisible();
assert.deepEqual(paints, ["paint", "paint"]);

console.log("hours ok");
