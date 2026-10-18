/**
 * Stripe Payment Link.
 * Create the link in the Stripe Dashboard and set checkout.stripePaymentLink.
 * This stub does not call Stripe and does not charge a card.
 */
export function stripeCheckout(order, config = {}) {
  const link = config.stripePaymentLink;
  if (!link) {
    return {
      ok: false,
      placed: false,
      reason: "Stripe payment link is not set. Add checkout.stripePaymentLink in the restaurant file.",
    };
  }
  let url;
  try {
    url = new URL(link);
  } catch {
    return { ok: false, placed: false, reason: "Stripe payment link is not a valid URL." };
  }
  const host = url.hostname;
  const stripeHost = host === "stripe.com" || host.endsWith(".stripe.com");
  if (url.protocol !== "https:" || !stripeHost) {
    return {
      ok: false,
      placed: false,
      reason: "Stripe payment link must be an https URL on stripe.com.",
    };
  }
  return {
    ok: true,
    placed: false,
    redirect: url.toString(),
    note: "Redirect the guest to the Stripe Payment Link. Stripe collects the card.",
    order,
  };
}
