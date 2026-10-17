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
