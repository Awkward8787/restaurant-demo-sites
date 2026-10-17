import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spokenLang } from "../src/lib/lang-span.mjs";

assert.equal(spokenLang("en", { en: "Hello" }), undefined);
assert.equal(spokenLang("es", { en: "Hello" }), "en");
assert.equal(spokenLang("pt", { en: "Hello", es: "Hola" }), "en");
assert.equal(spokenLang("es", { en: "Hello", es: "Hola" }), "es");
assert.equal(spokenLang("pt", { en: "Hello", pt: "Olá" }), "pt");
assert.equal(spokenLang("es", { en: "Hello", es: "" }), "en");

const component = readFileSync(new URL("../src/components/Lang.astro", import.meta.url), "utf8");
assert.match(component, /spokenLang/);

console.log("lang ok");
