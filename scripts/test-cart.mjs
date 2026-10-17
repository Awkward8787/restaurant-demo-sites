import assert from "node:assert/strict";
import { cleanTip } from "../src/lib/cart.mjs";

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

console.log("cart ok");
