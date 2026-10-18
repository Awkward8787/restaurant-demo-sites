# Turning on real ordering

The demo sites do not take payment and do not dispatch a driver. Checkout always ends on:

> Demo site: no order was placed. Call to order.

The guest can copy the list and call the restaurant. Nothing is posted to the restaurant, and the page does not open a text, email, or WhatsApp draft.

Real payment and white-label delivery are stubs in `src/ordering/`. They are not wired into the page. GitHub Pages is a static host: it cannot keep API secrets, and it cannot call DoorDash or Uber on the guest's behalf.

## Square payment link

Dondon already uses Square. This is the shortest path to a real charge.

1. In the Square Dashboard, create a Payment link for the amount, or a link the kitchen can match to the order.
2. Put the https URL on the restaurant as `checkout.squarePaymentLink`.
3. On a host you control (not in this repo), send the guest to that URL after you have stored the order. `squareCheckout()` in `src/ordering/square.mjs` only checks that the link is https and returns it. It does not call Square and it does not charge a card.

Square then collects the card on Square's page. Keep the order id in your own records before the redirect. Do not commit access tokens.

## Stripe Payment Link

Same shape, different dashboard.

1. Create a Payment Link in the Stripe Dashboard.
2. Set `checkout.stripePaymentLink` to an https URL on `stripe.com` (for example `buy.stripe.com`).
3. Redirect from your own server. `stripeCheckout()` in `src/ordering/stripe.mjs` rejects any other host. It does not call Stripe.

## DoorDash Drive

Drive is white-label dispatch. A Dasher picks up an order the restaurant already took, under the restaurant's name. It is not a DoorDash storefront, and it is not the DoorDash link already in some of these demos.

1. Sign the restaurant up for DoorDash Drive and get API credentials.
2. Set `DOORDASH_DRIVE_DEVELOPER_ID`, `DOORDASH_DRIVE_KEY_ID`, and `DOORDASH_DRIVE_SIGNING_SECRET` in the server environment. Never commit them.
3. Replace `doorDashDriveQuote()` in `src/ordering/doordash-drive.mjs`. The stub returns `ok: false` even when the three values are present, until a server requests a quote and then accepts the delivery.

Andros is the one room with a published delivery charge: the 2018 menu prints $2, and the cart adds that number. The other rooms either do not deliver, say they deliver without printing a fee, or do not publish a delivery offer. Do not invent a fee. Add one only when the owner states it, and show that number in the cart before you dispatch.

## Uber Direct

Same idea as Drive: the guest ordered on the restaurant's site, and Uber Direct sends a courier. It is not an Uber Eats listing.

1. Create an Uber Direct application and a customer id.
2. Set `UBER_DIRECT_CUSTOMER_ID` and `UBER_DIRECT_CLIENT_SECRET` on the server. Never commit them.
3. Replace `uberDirectQuote()` in `src/ordering/uber-direct.mjs`. The stub never dispatches. A live call is: OAuth client-credentials, create a quote, then create a delivery.

## What has to leave GitHub Pages

Payment links can be a redirect to Square or Stripe. Quote, accept, and webhook handling for Drive and Uber Direct need a server you control. Keep that server off this static repo, or add it later as a separate service. The demo banner stays up until that path is real and the owner has confirmed the menu.
