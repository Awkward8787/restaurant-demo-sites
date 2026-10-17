import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dinerDate } from "../src/lib/dates.mjs";
import { glossLine, glossView } from "../src/lib/gloss.mjs";
import { spokenLang } from "../src/lib/lang-span.mjs";

assert.equal(spokenLang("en", { en: "Hello" }), undefined);
assert.equal(spokenLang("es", { en: "Hello" }), "en");
assert.equal(spokenLang("pt", { en: "Hello", es: "Hola" }), "en");
assert.equal(spokenLang("es", { en: "Hello", es: "Hola" }), "es");
assert.equal(spokenLang("pt", { en: "Hello", pt: "Olá" }), "pt");
assert.equal(spokenLang("es", { en: "Hello", es: "" }), "en");

const component = readFileSync(new URL("../src/components/Lang.astro", import.meta.url), "utf8");
assert.match(component, /spokenLang/);
assert.match(component, /<span class:list=\{\["l", \{ block \}\]\} data-lang=\{lang\} lang=\{spokenLang\(lang, source\)\}>\{value\[lang\]\}<\/span>/);
const config = readFileSync(new URL("../astro.config.mjs", import.meta.url), "utf8");
assert.match(config, /compressHTML:\s*true/);

const guatita = {
  name: "Guatita",
  gloss: { en: "Tripe in peanut sauce", es: "Guatita", pt: "Dobradinha ao molho de amendoim" },
};
assert.equal(glossLine(guatita, "es"), null);
assert.equal(glossView(guatita, "es"), null);
assert.equal(glossLine(guatita, "en"), "Tripe in peanut sauce");

const hornado = {
  name: "Hornado",
  gloss: {
    en: "Hornado. Precio de muestra.",
    es: "Hornado. Precio de muestra.",
    pt: "Hornado. Preço de amostra.",
  },
};
assert.equal(glossLine(hornado, "en"), null);
assert.equal(glossLine(hornado, "pt"), null);

const manjar = { name: "Manjar de Côco", gloss: { en: "Coconut Flan" } };
assert.equal(dinerDate("2026-10-17", "en"), "17 October 2026");
assert.equal(dinerDate("2026-10-17", "es"), "17 de octubre de 2026");
assert.equal(dinerDate("2026-10-17", "pt"), "17 de outubro de 2026");
assert.deepEqual(glossView(manjar, "es"), { line: "Coconut Flan", lang: "en" });
assert.deepEqual(glossView(manjar, "en"), { line: "Coconut Flan", lang: undefined });

console.log("lang ok");
