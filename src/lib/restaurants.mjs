import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "../../data/restaurants");

/** Files starting with _ are templates and are not built. */
export function loadRestaurants() {
  const files = readdirSync(dataDir)
    .filter((name) => name.endsWith(".json") && !name.startsWith("_"))
    .sort();
  const restaurants = files.map((name) => JSON.parse(readFileSync(join(dataDir, name), "utf8")));
  return restaurants.sort((a, b) => (a.order ?? 100) - (b.order ?? 100) || a.name.localeCompare(b.name));
}

export function telHref(phone) {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits}`;
}

export function money(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}
