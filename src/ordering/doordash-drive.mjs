/**
 * DoorDash Drive, white-label delivery dispatch.
 * Not a customer-facing DoorDash storefront. Drive sends a Dasher to pick up
 * an order the restaurant already took, under the restaurant's own name.
 *
 * Dondon turns this on himself:
 * 1. Sign the restaurant up for DoorDash Drive and get API credentials.
 * 2. Set DOORDASH_DRIVE_DEVELOPER_ID, DOORDASH_DRIVE_KEY_ID, DOORDASH_DRIVE_SIGNING_SECRET
 *    in the host environment. Never commit them.
 * 3. Replace this stub with a server call that requests a quote, then accepts
 *    the delivery. A static GitHub Pages site cannot hold that secret, so the
 *    live site needs a small backend or a trusted serverless function.
 *
 * This file does not call DoorDash.
 */
export function doorDashDriveQuote(delivery, config = {}) {
  if (!config.developerId || !config.keyId || !config.signingSecret) {
    return {
      ok: false,
      dispatched: false,
      reason: "DoorDash Drive credentials are not set. See docs/ordering.md.",
    };
  }
  if (!delivery?.dropoffAddress || !delivery?.pickupAddress) {
    return {
      ok: false,
      dispatched: false,
      reason: "A Drive quote needs a pickup address and a dropoff address.",
    };
  }
  return {
    ok: false,
    dispatched: false,
    reason: "Drive quote stub only. Wire the Drive API from a server before dispatching a Dasher.",
  };
}
