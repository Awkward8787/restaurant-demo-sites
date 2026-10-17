import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { loadRestaurants } from "../src/lib/restaurants.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fontFile = join(here, "fonts/DejaVuSerif.ttf");

const out = join(here, "../public/og");
mkdirSync(out, { recursive: true });

function escape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function wrap(name) {
  const words = name.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > 18 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function svg({ paper, ink, accent, name, street }) {
  const lines = wrap(name);
  const text = lines
    .map((line, index) => `<text x="72" y="${210 + index * 92}" fill="${ink}" font-size="84" font-family="DejaVu Serif">${escape(line)}</text>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${paper}"/>
  <rect width="28" height="630" fill="${accent}"/>
  ${text}
  <text x="72" y="560" fill="${ink}" font-size="32" font-family="DejaVu Serif">${escape(street)}, Newark</text>
</svg>
`;
}

function writeCard(name, card) {
  const body = svg(card);
  writeFileSync(join(out, `${name}.svg`), body);
  const png = new Resvg(body, {
    font: {
      fontFiles: [fontFile],
      loadSystemFonts: false,
      defaultFontFamily: "DejaVu Serif",
    },
  })
    .render()
    .asPng();
  writeFileSync(join(out, `${name}.png`), png);
}

for (const restaurant of loadRestaurants()) {
  writeCard(restaurant.slug, {
    paper: restaurant.theme.paper,
    ink: restaurant.theme.ink,
    accent: restaurant.theme.accent,
    name: restaurant.name,
    street: restaurant.address.street,
  });
}

writeCard("index", {
  paper: "#F4EFE4",
  ink: "#1C1915",
  accent: "#7A2E24",
  name: "Newark restaurant demos",
  street: "Nine previews",
});

console.log("og ok");
