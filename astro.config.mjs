import { defineConfig } from "astro/config";

// Project Pages URL: https://<user>.github.io/restaurant-demo-sites/
// Set BASE_PATH=/ if this repo is served from a domain root.
const base = process.env.BASE_PATH ?? "/restaurant-demo-sites";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://awkward8787.github.io",
  base,
  trailingSlash: "always",
  // Astro 7's default "jsx" drops spaces between inline elements ("StreetSkip").
  compressHTML: true,
  build: {
    format: "directory",
  },
});
