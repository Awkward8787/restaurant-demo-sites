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

export const MAX_QTY = 99;

/** Whole dishes from 1 through 99. Null when the stored value is not a number. */
export function clampQty(value) {
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n)) return null;
  return Math.min(MAX_QTY, Math.max(1, n));
}

function menuRecord(menu, id) {
  if (!menu || typeof id !== "string") return null;
  const item = menu instanceof Map ? menu.get(id) : menu[id];
  return item && typeof item === "object" ? item : null;
}

function menuPrice(value) {
  if (value == null || value === "") return null;
  const price = Number(value);
  return Number.isFinite(price) ? price : null;
}

const WHEN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/**
 * Rebuild a saved cart from the current menu. Stored prices and names are ignored,
 * unknown dishes are dropped, and fulfillment is only pickup or delivery.
 */
export function sanitizeCart(saved, menu) {
  const lines = [];
  const stored = Array.isArray(saved?.lines) ? saved.lines : [];
  for (const line of stored) {
    const item = menuRecord(menu, line?.id);
    if (!item) continue;
    const qty = clampQty(line.qty);
    if (qty == null) continue;
    lines.push({
      id: line.id,
      name: String(item.name ?? ""),
      itemLang: item.itemLang || item.lang || "en",
      price: menuPrice(item.price),
      qty,
    });
  }
  return {
    lines,
    fulfillment: saved?.fulfillment === "delivery" ? "delivery" : "pickup",
    tip: cleanTip(saved?.tip),
    when: typeof saved?.when === "string" && WHEN.test(saved.when) ? saved.when : "",
    notes: typeof saved?.notes === "string" ? saved.notes : "",
    address: typeof saved?.address === "string" ? saved.address.slice(0, 240) : "",
  };
}

export function pricedSubtotalCents(lines) {
  return lines.reduce((sum, line) => {
    if (line.price == null) return sum;
    const qty = clampQty(line.qty);
    if (qty == null) return sum;
    return sum + Math.round(Number(line.price) * 100) * qty;
  }, 0);
}

export function itemCount(lines) {
  return lines.reduce((sum, line) => sum + (clampQty(line.qty) ?? 0), 0);
}

/** Tip percent for the demo list. Whole numbers from 0 through 100. */
export function cleanTip(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : 0;
}
