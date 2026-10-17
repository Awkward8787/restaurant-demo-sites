import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { formatClock, isOpen, weekLines } from "../src/lib/hours.mjs";

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

console.log("hours ok");
