const SAMPLE = /\b(sample price|precio de muestra|pre[cç]o de amostra)\b/gi;

function compact(value) {
  return String(value)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/** Drop a gloss that only repeats the dish name, including a sample-price tail. */
export function glossLine(item, code) {
  const bag = item?.gloss;
  if (!bag || typeof bag !== "object") return null;
  const raw = bag[code];
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const stripped = raw.replace(SAMPLE, "").replace(/[.,;:\s]+/g, " ").trim();
  if (stripped === "" || compact(stripped) === compact(item.name)) return null;
  return raw.trim();
}

/** Visible gloss for one page language. A missing translation stays English. A gloss that only repeats the name stays hidden. */
export function glossView(item, code) {
  const own = typeof item?.gloss?.[code] === "string" && item.gloss[code].trim() !== "";
  const line = glossLine(item, code);
  if (line) return { line, lang: code === "en" ? undefined : code };
  if (own || code === "en") return null;
  const english = glossLine(item, "en");
  if (!english) return null;
  return { line: english, lang: "en" };
}
