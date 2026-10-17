import { loadRestaurants } from "../lib/restaurants.mjs";

export function GET({ site }) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const origin = site?.origin ?? "https://awkward8787.github.io";
  const paths = ["", ...loadRestaurants().map((restaurant) => `${restaurant.slug}/`)];
  const urls = paths
    .map((path) => `<url><loc>${origin}${base}${path}</loc></url>`)
    .join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
