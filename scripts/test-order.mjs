import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyAddressError, clearAddressError } from "../src/lib/order-a11y.mjs";

const page = readFileSync(new URL("../src/pages/[slug].astro", import.meta.url), "utf8");
assert.match(page, /id="order-error"[^>]*role="alert"/);

const script = readFileSync(new URL("../src/scripts/page.mjs", import.meta.url), "utf8");
assert.match(script, /applyAddressError/);
assert.match(script, /deliveryNeedAddress/);

function field() {
  const attrs = new Map();
  return {
    attrs,
    focused: false,
    setAttribute(name, value) {
      attrs.set(name, value);
    },
    removeAttribute(name) {
      attrs.delete(name);
    },
    focus() {
      this.focused = true;
    },
  };
}

const missing = field();
applyAddressError(missing);
assert.equal(missing.attrs.get("aria-invalid"), "true");
assert.equal(missing.attrs.get("aria-describedby"), "order-error");
assert.equal(missing.focused, true);
clearAddressError(missing);
assert.equal(missing.attrs.has("aria-invalid"), false);
assert.equal(missing.attrs.has("aria-describedby"), false);

console.log("order ok");
