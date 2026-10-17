/**
 * Where keyboard focus should land after a stepper or Remove click.
 * The line list is rebuilt, so the focused button is gone unless we put it back.
 * A removed line moves focus to the next line, then the previous one, then the empty state.
 */
export function focusAfterChange(before, after, { id, action }) {
  if (after.some((line) => line.id === id)) return { kind: "line", id, action };
  const index = before.findIndex((line) => line.id === id);
  const later = after.find((line) => before.findIndex((item) => item.id === line.id) > index);
  if (later) return { kind: "line", id: later.id, action };
  if (after.length === 0) return { kind: "empty" };
  const earlier = [...after].reverse().find((line) => before.findIndex((item) => item.id === line.id) < index);
  if (earlier) return { kind: "line", id: earlier.id, action };
  return { kind: "line", id: after[0].id, action };
}

/** Tip percent for the demo list. Whole numbers from 0 through 100. */
export function cleanTip(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : 0;
}
