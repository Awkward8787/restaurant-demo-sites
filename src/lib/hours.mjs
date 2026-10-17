/** Open/closed math for America/New_York. Weekly ranges are ["HH:MM", "HH:MM"]. */

export const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const WEEKDAY = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

const DAY_LABEL = {
  en: { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" },
  es: { mon: "Lunes", tue: "Martes", wed: "Miércoles", thu: "Jueves", fri: "Viernes", sat: "Sábado", sun: "Domingo" },
  pt: { mon: "Segunda", tue: "Terça", wed: "Quarta", thu: "Quinta", fri: "Sexta", sat: "Sábado", sun: "Domingo" },
};

export function nyParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  const minute = Number(parts.minute);
  return {
    day: WEEKDAY[parts.weekday],
    minutes: hour * 60 + minute,
  };
}

export function toMinutes(hhmm) {
  if (hhmm === "24:00") return 24 * 60;
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

/** null when hours are unknown, otherwise a boolean. End time is exclusive. */
export function isOpen(weekly, date = new Date()) {
  if (!weekly) return null;
  const { day, minutes } = nyParts(date);
  const ranges = weekly[day] ?? [];
  return ranges.some(([start, end]) => minutes >= toMinutes(start) && minutes < toMinutes(end));
}

export function formatClock(hhmm) {
  if (hhmm === "24:00") return "midnight";
  const [hourRaw, minute] = hhmm.split(":").map(Number);
  const suffix = hourRaw >= 12 ? "p.m." : "a.m.";
  const hour = hourRaw % 12 === 0 ? 12 : hourRaw % 12;
  const mins = minute === 0 ? "" : `:${String(minute).padStart(2, "0")}`;
  return `${hour}${mins} ${suffix}`;
}

export function formatDay(ranges, lang = "en") {
  if (!ranges || ranges.length === 0) {
    if (lang === "es") return "Cerrado";
    if (lang === "pt") return "Fechado";
    return "Closed";
  }
  return ranges.map(([start, end]) => `${formatClock(start)} to ${formatClock(end)}`).join(", ");
}

export function weekLines(weekly, lang = "en") {
  if (!weekly) return [];
  const labels = DAY_LABEL[lang] ?? DAY_LABEL.en;
  return DAY_ORDER.map((day) => ({
    day,
    label: labels[day],
    text: formatDay(weekly[day], lang),
  }));
}

export function statusPhrase(open, lang = "en") {
  if (open === null) {
    if (lang === "es") return "Horario no publicado";
    if (lang === "pt") return "Horário não publicado";
    return "Hours not published";
  }
  if (open) {
    if (lang === "es") return "Abierto ahora";
    if (lang === "pt") return "Aberto agora";
    return "Open now";
  }
  if (lang === "es") return "Cerrado ahora";
  if (lang === "pt") return "Fechado agora";
  return "Closed now";
}
