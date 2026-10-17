import assert from "node:assert/strict";
import { cleanTip, focusAfterChange } from "../src/lib/cart.mjs";

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

console.log("cart ok");
