/** Tip percent for the demo list. Whole numbers from 0 through 100. */
export function cleanTip(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : 0;
}
