import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyAddressError, addLiveText, clearAddressError, deliveryFeeLabel, queueLiveText, totalLabelKey } from "../src/lib/order-a11y.mjs";
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

assert.equal(deliveryFeeLabel("en", 2018), "Delivery (2018 menu)");
assert.equal(deliveryFeeLabel("es", 2018), "A domicilio (menú de 2018)");
assert.equal(deliveryFeeLabel("pt", 2018), "Entrega (cardápio de 2018)");
assert.equal(deliveryFeeLabel("en", ""), t("en", "delivery"));
assert.equal(deliveryFeeLabel("en", null), t("en", "delivery"));
assert.match(script, /deliveryFeeLabel\(lang, deliveryFeeYear\)/);
assert.doesNotMatch(script, /2018 menu/);
const andros = JSON.parse(readFileSync(new URL("../data/restaurants/andros-diner.json", import.meta.url), "utf8"));
assert.equal(andros.deliveryFeeYear, 2018);
assert.equal(andros.deliveryFee, 2);

assert.equal(addLiveText("en", "Picanha", 2), "Picanha, 2 in the order");
assert.equal(addLiveText("es", "Picanha", 2), "Picanha, 2 en el pedido");
assert.equal(addLiveText("pt", "Picanha", 2), "Picanha, 2 no pedido");
assert.match(addLiveText("en", "Picanha", 99), /most you can add/);
assert.match(addLiveText("es", "Picanha", 99), /99/);
assert.match(addLiveText("pt", "Picanha", 99), /99/);
assert.notEqual(addLiveText("es", "Picanha", 99), addLiveText("en", "Picanha", 99));
const live = { textContent: "old" };
let queued = null;
queueLiveText(live, "Picanha, 2 in the order", (fn) => {
  queued = fn;
});
assert.equal(live.textContent, "");
queued();
assert.equal(live.textContent, "Picanha, 2 in the order");
assert.match(script, /queueLiveText/);

console.log("order ok");
