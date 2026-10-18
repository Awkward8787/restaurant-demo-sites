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

const CLOCK_LANG = { en: "en-US", es: "es", pt: "pt-BR" };
const JOIN = { en: "to", es: "a", pt: "às" };
const OPEN_ALL = { en: "Open 24 hours", es: "Abierto 24 horas", pt: "Aberto 24 horas" };
const CLOSED = { en: "Closed", es: "Cerrado", pt: "Fechado" };
const NEXT_DAY = { sun: "mon", mon: "tue", tue: "wed", wed: "thu", thu: "fri", fri: "sat", sat: "sun" };
const PREV_DAY = { mon: "sun", tue: "mon", wed: "tue", thu: "wed", fri: "thu", sat: "fri", sun: "sat" };

export function formatClock(hhmm, lang = "en") {
  const stamp = hhmm === "24:00" ? "00:00" : hhmm;
  const [hour, minute] = stamp.split(":").map(Number);
  const date = new Date(Date.UTC(2026, 0, 1, hour, minute));
  return new Intl.DateTimeFormat(CLOCK_LANG[lang] ?? "en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function isFullDay(ranges) {
  return (ranges ?? []).some(([start, end]) => start === "00:00" && end === "24:00");
}

function rangesForDisplay(weekly, day) {
  const ranges = weekly[day] ?? [];
  const prev = weekly[PREV_DAY[day]] ?? [];
  // A full day is not an overnight service, so it must not swallow the next morning.
  const prevEndsAtMidnight = !isFullDay(prev) && prev.some(([, end]) => end === "24:00");
  const own = ranges.filter(([start, end]) => !(prevEndsAtMidnight && start === "00:00" && end !== "24:00"));
  const carry =
    !isFullDay(own) && own.some(([, end]) => end === "24:00")
      ? (weekly[NEXT_DAY[day]] ?? []).find(([start, end]) => start === "00:00" && end !== "24:00")
      : null;
  return own.map(([start, end]) => (end === "24:00" && carry ? [start, carry[1]] : [start, end]));
}

export function formatDay(ranges, lang = "en") {
  if (!ranges || ranges.length === 0) return CLOSED[lang] ?? CLOSED.en;
  if (ranges.length === 1 && ranges[0][0] === "00:00" && ranges[0][1] === "24:00") {
    return OPEN_ALL[lang] ?? OPEN_ALL.en;
  }
  const joiner = JOIN[lang] ?? JOIN.en;
  return ranges.map(([start, end]) => `${formatClock(start, lang)} ${joiner} ${formatClock(end, lang)}`).join(", ");
}

export function weekLines(weekly, lang = "en") {
  if (!weekly) return [];
  const labels = DAY_LABEL[lang] ?? DAY_LABEL.en;
  return DAY_ORDER.map((day) => ({
    day,
    label: labels[day],
    text: formatDay(rangesForDisplay(weekly, day), lang),
  }));
}

/** Repaint open/closed text on a timer and when the guest comes back to the tab. */
export function bindHoursRefresh(paint, { setInterval, addEventListener, visibilityState }) {
  setInterval(paint, 60_000);
  addEventListener("visibilitychange", () => {
    if (visibilityState() === "visible") paint();
  });
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
