/**
 * Square Checkout payment link.
 * Dondon creates the link in the Square Dashboard (Payment links) and pastes
 * the URL into the restaurant file as checkout.squarePaymentLink.
 * This stub does not call Square and does not charge a card.
 */
export function squareCheckout(order, config = {}) {
  const link = config.squarePaymentLink;
  if (!link) {
    return {
      ok: false,
      placed: false,
      reason: "Square payment link is not set. Add checkout.squarePaymentLink in the restaurant file.",
    };
  }
  let url;
  try {
    url = new URL(link);
  } catch {
    return { ok: false, placed: false, reason: "Square payment link is not a valid URL." };
  }
  const host = url.hostname;
  const squareHost =
    host === "square.link" ||
    host === "squareup.com" ||
    host.endsWith(".squareup.com") ||
    host === "square.site" ||
    host.endsWith(".square.site");
  if (url.protocol !== "https:" || !squareHost) {
    return {
      ok: false,
      placed: false,
      reason: "Square payment link must be an https URL on square.link, square.site, or squareup.com.",
    };
  }
  return {
    ok: true,
    placed: false,
    redirect: url.toString(),
    note: "Redirect the guest to this Square-hosted payment page. Square collects the card. Pass the order id in your own records before the redirect.",
    order,
  };
}
