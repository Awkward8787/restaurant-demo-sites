/** WCAG 2 contrast, same formula as contrast-check.py. */

export function parseHex(value) {
  let hex = String(value).trim().replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) throw new Error(`Bad color ${value}`);
  return [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
}

function linearize(channel) {
  const c = channel / 255;
  if (c <= 0.03928) return c / 12.92;
  return ((c + 0.055) / 1.055) ** 2.4;
}

function luminance([r, g, b]) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(a, b) {
  const left = luminance(parseHex(a));
  const right = luminance(parseHex(b));
  const [lighter, darker] = left > right ? [left, right] : [right, left];
  return (lighter + 0.05) / (darker + 0.05);
}

export function passesNormal(ratio) {
  return ratio >= 4.5;
}
