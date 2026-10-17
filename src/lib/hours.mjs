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

const NY = "America/New_York";
const DAY_FROM_UTC = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const PICKUP_LANG = { en: "en-US", es: "es", pt: "pt-BR" };

/** datetime-local value, read as a Newark wall clock, not the device zone. */
export function parseWallInput(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || hour > 23 || minute > 59) return null;
  const stamp = new Date(Date.UTC(year, month - 1, day));
  if (stamp.getUTCFullYear() !== year || stamp.getUTCMonth() !== month - 1 || stamp.getUTCDate() !== day) return null;
  return {
    year,
    month,
    day,
    hour,
    minute,
    dayKey: DAY_FROM_UTC[stamp.getUTCDay()],
    minutes: hour * 60 + minute,
  };
}

function zonedParts(date, timeZone) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((part) => [part.type, part.value]));
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/**
 * Newark wall time as real instants. Eastern Time is UTC−4 or UTC−5.
 * A candidate is kept only when it formats back to the same clock time,
 * so the spring-forward gap has none and the fall-back hour has both.
 */
export function nyInstants(wall) {
  const utcGuess = Date.UTC(wall.year, wall.month - 1, wall.day, wall.hour, wall.minute, 0);
  const found = [];
  for (const offsetHours of [-5, -4]) {
    const instant = new Date(utcGuess - offsetHours * 3_600_000);
    const back = zonedParts(instant, NY);
    const same =
      back.year === wall.year &&
      back.month === wall.month &&
      back.day === wall.day &&
      back.hour === wall.hour &&
      back.minute === wall.minute;
    if (same) found.push(instant.getTime());
  }
  return [...new Set(found)].sort((a, b) => a - b).map((time) => new Date(time));
}

/** null when hours are unknown, otherwise a boolean. End time is exclusive. */
export function isOpenAt(weekly, day, minutes) {
  if (!weekly) return null;
  const ranges = weekly[day] ?? [];
  return ranges.some(([start, end]) => minutes >= toMinutes(start) && minutes < toMinutes(end));
}

export function isOpen(weekly, date = new Date()) {
  if (!weekly) return null;
  const { day, minutes } = nyParts(date);
  return isOpenAt(weekly, day, minutes);
}

/** "past", "closed", "gap", "invalid", or null when the Newark pickup time is usable. */
export function pickupIssue(value, now, weekly) {
  const wall = parseWallInput(value);
  if (!wall) return "invalid";
  const instants = nyInstants(wall);
  if (instants.length === 0) return "gap";
  const latest = instants[instants.length - 1].getTime();
  const current = now instanceof Date ? now.getTime() : Number(now);
  if (latest < current - 60_000) return "past";
  if (weekly && isOpenAt(weekly, wall.dayKey, wall.minutes) === false) return "closed";
  return null;
}

export function formatPickup(value, lang = "en") {
  const wall = parseWallInput(value);
  if (!wall) return value;
  const instants = nyInstants(wall);
  if (instants.length === 0) return value;
  return new Intl.DateTimeFormat(PICKUP_LANG[lang] ?? "en-US", {
    timeZone: NY,
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(instants[0]);
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
