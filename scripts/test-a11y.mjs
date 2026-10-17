import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { t } from "../src/i18n.mjs";

const page = readFileSync(new URL("../src/pages/[slug].astro", import.meta.url), "utf8");
assert.match(page, /<legend[^>]*data-i18n="fulfillment"/);
assert.match(page, /<legend[^>]*data-i18n="tip"/);
assert.match(page, /<label[^>]*for="tip-custom"/);
assert.match(page, /id="tip-custom"[^>]*type="number"/);
assert.match(page, /id=\{`dish-\$\{item\.id\}`\}/);
assert.match(page, /aria-describedby=\{`dish-\$\{item\.id\}`\}/);
assert.match(page, /id="order-total"[^>]*role="status"/);
const cartScript = readFileSync(new URL("../src/scripts/page.mjs", import.meta.url), "utf8");
assert.doesNotMatch(cartScript, /visibilityState: \(\) => document\.visibilityState,\n\s*\}\);\n\s*render\(\);/);

for (const lang of ["en", "es", "pt"]) {
  for (const key of ["fulfillment", "tipPercent"]) {
    const value = t(lang, key);
    assert.equal(typeof value, "string");
    assert.notEqual(value, key);
  }
}
assert.notEqual(t("es", "fulfillment"), t("en", "fulfillment"));
assert.notEqual(t("pt", "fulfillment"), t("en", "fulfillment"));
assert.notEqual(t("es", "tipPercent"), t("en", "tipPercent"));
assert.notEqual(t("pt", "tipPercent"), t("en", "tipPercent"));

console.log("a11y ok");
