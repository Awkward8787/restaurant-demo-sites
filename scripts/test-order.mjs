import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { addLiveText, applyAddressError, applyAriaLabels, clearAddressError, closedMessageKey, deliveryFeeLabel, queueLiveText, setAddressRequired, totalLabelKey } from "../src/lib/order-a11y.mjs";
import { ratingSentence, t } from "../src/i18n.mjs";

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
assert.match(script, /if \(addressField && !showAddress\) clearAddressError\(addressField\)/);
assert.equal(t("es", "navHours"), "Horario");
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

assert.match(page, /id="delivery-address"[^>]*autocomplete="address-line1"/);
assert.match(page, /id="delivery-address"[^>]*maxlength="240"/);
assert.doesNotMatch(page, /autocomplete="street-address"/);
const shown = field();
setAddressRequired(shown, true);
assert.equal(shown.attrs.get("aria-required"), "true");
setAddressRequired(shown, false);
assert.equal(shown.attrs.has("aria-required"), false);
assert.match(script, /setAddressRequired\(/);

const sampleRating = { platform: "Google", value: 4.1, count: 1225, source: "Restaurant Guru" };
assert.match(ratingSentence("en", sampleRating), /4\.1/);
assert.match(ratingSentence("en", sampleRating), /1,225/);
assert.match(ratingSentence("es", sampleRating), /4,1/);
assert.match(ratingSentence("es", sampleRating), /1\.225/);
assert.match(ratingSentence("pt", sampleRating), /4,1/);
assert.match(ratingSentence("pt", sampleRating), /1\.225/);
assert.doesNotMatch(ratingSentence("es", sampleRating), /1225/);

assert.match(page, /data-i18n-aria="sectionsLabel"/);
assert.match(page, /data-i18n-aria="langLabel"/);
const ariaNode = {
  label: "",
  getAttribute() {
    return "langLabel";
  },
  setAttribute(name, value) {
    if (name === "aria-label") this.label = value;
  },
};
applyAriaLabels({ querySelectorAll: () => [ariaNode] }, "es");
assert.equal(ariaNode.label, t("es", "langLabel"));
assert.notEqual(ariaNode.label, t("en", "langLabel"));
assert.match(script, /applyAriaLabels/);

assert.equal(closedMessageKey("pickup"), "errorClosed");
assert.equal(closedMessageKey("delivery"), "errorDeliveryClosed");
assert.notEqual(t("en", "errorDeliveryClosed"), t("en", "errorClosed"));
assert.notEqual(t("es", "errorDeliveryClosed"), t("en", "errorDeliveryClosed"));
assert.notEqual(t("pt", "errorDeliveryClosed"), t("en", "errorDeliveryClosed"));
assert.match(t("en", "errorDeliveryClosed"), /[Dd]elivery/);
assert.doesNotMatch(t("en", "errorDeliveryClosed"), /restaurant is closed/);
assert.match(script, /closedMessageKey\(state\.fulfillment\)/);

assert.equal(t("en", "total"), "total");
assert.equal(t("es", "total"), "total");
assert.equal(t("pt", "total"), "total");
assert.equal(t("en", "beforeTax"), "Total before tax");
assert.equal(t("es", "beforeTax"), "Total antes de impuestos");
assert.equal(t("pt", "beforeTax"), "Total antes dos impostos");

console.log("order ok");
