import { t } from "../i18n.mjs";
import { MAX_QTY } from "./cart.mjs";

/** Point the address field at the order error and move focus there. */
export function applyAddressError(field) {
  field.setAttribute("aria-invalid", "true");
  field.setAttribute("aria-describedby", "order-error");
  field.focus();
}

export function clearAddressError(field) {
  field.removeAttribute("aria-invalid");
  field.removeAttribute("aria-describedby");
}

/** A full "total" overstates the bill when some dishes have no price. */
export function totalLabelKey(hasUnpriced) {
  return hasUnpriced ? "pricedBeforeTax" : "beforeTax";
}

/** "Delivery (2018 menu)" when the fee's menu year is known. Otherwise just "Delivery". */
export function deliveryFeeLabel(lang, year) {
  if (year == null || String(year).trim() === "") return t(lang, "delivery");
  const n = Number(year);
  if (!Number.isInteger(n)) return t(lang, "delivery");
  return t(lang, "deliveryFromMenu").replaceAll("{year}", String(n));
}

export function addLiveText(lang, name, count) {
  const key = count >= MAX_QTY ? "addedMax" : "addedCount";
  return t(lang, key).replaceAll("{name}", name).replaceAll("{count}", String(count));
}

/** Clear the live region first so a repeat Add is announced again. */
export function queueLiveText(node, text, requestAnimationFrame) {
  node.textContent = "";
  requestAnimationFrame(() => {
    node.textContent = text;
  });
}
