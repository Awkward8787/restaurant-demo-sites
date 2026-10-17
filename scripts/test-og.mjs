import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadRestaurants } from "../src/lib/restaurants.mjs";

function pngSize(path) {
  const buf = readFileSync(path);
  assert.equal(buf.subarray(1, 4).toString(), "PNG", path);
  assert.equal(buf.readUInt32BE(16), 1200, path);
  assert.equal(buf.readUInt32BE(20), 630, path);
}

const root = new URL("../public/og/", import.meta.url);
for (const restaurant of loadRestaurants()) pngSize(new URL(`${restaurant.slug}.png`, root));
pngSize(new URL("index.png", root));

const slug = readFileSync(new URL("../src/pages/[slug].astro", import.meta.url), "utf8");
const index = readFileSync(new URL("../src/pages/index.astro", import.meta.url), "utf8");
assert.match(slug, /og\/\$\{r\.slug\}\.png/);
assert.match(slug, /property="og:image:width" content="1200"/);
assert.match(slug, /property="og:image:height" content="630"/);
assert.match(index, /og\/index\.png/);
assert.match(index, /property="og:image:width" content="1200"/);
assert.match(index, /property="og:image:height" content="630"/);
assert.doesNotMatch(slug, /og\/\$\{r\.slug\}\.svg/);

console.log("og ok");
