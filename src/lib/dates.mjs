const LOCALE = { en: "en-GB", es: "es", pt: "pt-BR" };

/** ISO date as a diner would read it. The clock stays on UTC so the day does not shift. */
export function dinerDate(iso, lang = "en") {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!match) return iso || "";
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat(LOCALE[lang] ?? "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
