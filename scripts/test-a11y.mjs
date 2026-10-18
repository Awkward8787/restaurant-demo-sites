import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cleanLang, t } from "../src/i18n.mjs";
import { wantsFieldScroll } from "../src/lib/ui.mjs";

const page = readFileSync(new URL("../src/pages/[slug].astro", import.meta.url), "utf8");
assert.match(page, /<legend[^>]*data-i18n="fulfillment"/);
assert.match(page, /<legend[^>]*data-i18n="tip"/);
assert.match(page, /<label[^>]*for="tip-custom"/);
assert.match(page, /id="tip-custom"[^>]*type="number"/);
assert.match(page, /id=\{`dish-\$\{item\.id\}`\}/);
assert.match(page, /aria-describedby=\{`dish-\$\{item\.id\}`\}/);
assert.match(page, /id="order-total"[^>]*role="status"/);
const cartScript = readFileSync(new URL("../src/scripts/page.mjs", import.meta.url), "utf8");
assert.match(cartScript, /demo-lang/);
assert.match(cartScript, /t\(lang, "demoFoot"\)/);
assert.doesNotMatch(cartScript, /Demo site: no order was placed\./);
assert.doesNotMatch(cartScript, /sms:/);
assert.doesNotMatch(cartScript, /wa\.me/);
assert.doesNotMatch(cartScript, /mailto:/);
assert.doesNotMatch(page, /sms:/);
assert.doesNotMatch(page, /wa\.me/);
assert.doesNotMatch(page, /mailto:/);
const addBlock = cartScript.slice(cartScript.indexOf('querySelectorAll("[data-add]")'), cartScript.indexOf("function openOrder"));
assert.doesNotMatch(addBlock, /openOrder/);
assert.match(addBlock, /add-live/);
assert.match(cartScript, /cleanLang/);
assert.match(cartScript, /wantsFieldScroll/);
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
assert.equal(cleanLang("en"), "en");
assert.equal(cleanLang("es"), "es");
assert.equal(cleanLang("pt"), "pt");
assert.equal(cleanLang("fr"), null);
assert.equal(cleanLang("en-US"), null);
assert.equal(cleanLang(""), null);
assert.equal(wantsFieldScroll(true), true);
assert.equal(wantsFieldScroll(false), false);
assert.equal(wantsFieldScroll(undefined), false);
assert.equal(t("en", "demoFoot"), "Demo site: no order was placed.");
assert.notEqual(t("es", "demoTitle"), t("en", "demoTitle"));
assert.notEqual(t("pt", "demoTitle"), t("en", "demoTitle"));
assert.notEqual(t("es", "demoFoot"), t("en", "demoFoot"));
assert.notEqual(t("pt", "demoFoot"), t("en", "demoFoot"));
assert.doesNotMatch(t("es", "demoFoot"), /demoFoot/);
assert.doesNotMatch(t("pt", "demoFoot"), /demoFoot/);

console.log("a11y ok");
