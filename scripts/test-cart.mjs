import assert from "node:assert/strict";
import { clampQty, cleanTip, focusAfterChange, itemCount, pricedSubtotalCents, sanitizeCart } from "../src/lib/cart.mjs";

assert.equal(cleanTip(-20), 0);
assert.equal(cleanTip(500), 100);
assert.equal(cleanTip(15), 15);
assert.equal(cleanTip("15"), 15);
assert.equal(cleanTip(15.6), 16);
assert.equal(cleanTip(""), 0);
assert.equal(cleanTip("nope"), 0);
assert.equal(cleanTip(null), 0);
assert.equal(cleanTip(undefined), 0);
assert.equal(cleanTip(0), 0);
assert.equal(cleanTip(100), 100);

const before = [{ id: "a" }, { id: "b" }, { id: "c" }];
assert.deepEqual(focusAfterChange(before, before, { id: "b", action: "increase" }), {
  kind: "line",
  id: "b",
  action: "increase",
});
assert.deepEqual(
  focusAfterChange(before, [{ id: "a" }, { id: "c" }], { id: "b", action: "remove" }),
  { kind: "line", id: "c", action: "remove" },
);
assert.deepEqual(focusAfterChange(before, [{ id: "a" }, { id: "b" }], { id: "c", action: "decrease" }), {
  kind: "line",
  id: "b",
  action: "decrease",
});
assert.deepEqual(focusAfterChange([{ id: "a" }], [], { id: "a", action: "remove" }), { kind: "empty" });

assert.equal(clampQty("2"), 2);
assert.equal(clampQty(2.8), 2);
assert.equal(clampQty(0), 1);
assert.equal(clampQty(-4), 1);
assert.equal(clampQty(150), 99);
assert.equal(clampQty("nope"), null);

const menu = {
  picanha: { name: "Picanha", price: 32, itemLang: "pt" },
  soup: { name: "Caldo", price: null, itemLang: "es" },
};
const saved = {
  lines: [
    { id: "picanha", name: "<script>", price: -50, qty: "2" },
    { id: "gone", name: "Old special", price: 9, qty: 1 },
    { id: "soup", name: "Caldo", price: 4, qty: 3 },
  ],
  fulfillment: "x']",
  tip: -20,
  when: "not-a-time",
  notes: { bad: true },
};
const cart = sanitizeCart(saved, menu);
assert.deepEqual(
  cart.lines.map((line) => [line.id, line.name, line.price, line.qty]),
  [
    ["picanha", "Picanha", 32, 2],
    ["soup", "Caldo", null, 3],
  ],
);
assert.equal(cart.fulfillment, "pickup");
assert.equal(cart.tip, 0);
assert.equal(cart.when, "");
assert.equal(cart.notes, "");
assert.equal(itemCount(cart.lines), 5);
assert.equal(pricedSubtotalCents(cart.lines), 6400);
assert.equal(sanitizeCart({ lines: [], fulfillment: "delivery", tip: 500, when: "2026-10-20T18:00", notes: "sem cebola" }, menu).fulfillment, "delivery");
assert.equal(sanitizeCart({ lines: [{ id: "picanha", qty: "2", price: 1 }] }, { picanha: { name: "Picanha", price: 14 } }).lines[0].price, 14);
assert.equal(sanitizeCart(null, menu).lines.length, 0);

console.log("cart ok");
