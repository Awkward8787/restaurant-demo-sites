import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyAddressError, clearAddressError, totalLabelKey } from "../src/lib/order-a11y.mjs";
import { t } from "../src/i18n.mjs";

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

assert.equal(totalLabelKey(false), "beforeTax");
assert.equal(totalLabelKey(true), "pricedBeforeTax");
assert.equal(t("en", "pricedBeforeTax"), "Priced items, before tax");
assert.notEqual(t("es", "pricedBeforeTax"), t("en", "pricedBeforeTax"));
assert.notEqual(t("pt", "pricedBeforeTax"), t("en", "pricedBeforeTax"));
assert.match(script, /totalLabelKey\(hasUnpriced\)/);
const orderText = script.slice(script.indexOf("function orderText"), script.indexOf('document.getElementById("copy-list")'));
assert.match(orderText, /t\(lang, "unpriced"\)/);

console.log("order ok");
