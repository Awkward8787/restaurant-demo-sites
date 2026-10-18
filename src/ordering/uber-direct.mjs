/**
 * Uber Direct, white-label courier dispatch.
 * Same idea as DoorDash Drive: the guest ordered on the restaurant's site,
 * and Uber Direct sends a courier. It is not an Uber Eats listing.
 *
 * Dondon turns this on himself:
 * 1. Create an Uber Direct app and a customer id.
 * 2. Set UBER_DIRECT_CUSTOMER_ID and UBER_DIRECT_CLIENT_SECRET in the host
 *    environment. Never commit them.
 * 3. Replace this stub with a server call: OAuth client-credentials, create a
 *    quote, then create a delivery. GitHub Pages cannot keep the secret.
 *
 * This file does not call Uber.
 */
export function uberDirectQuote(delivery, config = {}) {
  if (!config.customerId || !config.clientSecret) {
    return {
      ok: false,
      dispatched: false,
      reason: "Uber Direct credentials are not set. See docs/ordering.md.",
    };
  }
  if (!delivery?.dropoffAddress || !delivery?.pickupAddress) {
    return {
      ok: false,
      dispatched: false,
      reason: "An Uber Direct quote needs a pickup address and a dropoff address.",
    };
  }
  return {
    ok: false,
    dispatched: false,
    reason: "Uber Direct stub only. Wire the API from a server before dispatching a courier.",
  };
}
