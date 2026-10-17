import assert from "node:assert/strict";
import { demoCheckout } from "../src/ordering/demo.mjs";
import { squareCheckout } from "../src/ordering/square.mjs";
import { stripeCheckout } from "../src/ordering/stripe.mjs";
import { doorDashDriveQuote } from "../src/ordering/doordash-drive.mjs";
import { uberDirectQuote } from "../src/ordering/uber-direct.mjs";

const order = { lines: [{ name: "Picanha", qty: 1 }] };
const demo = demoCheckout(order);
assert.equal(demo.placed, false);
assert.equal(demo.title, "Demo site: no order was placed. Call to order.");

assert.equal(squareCheckout(order).ok, false);
assert.equal(squareCheckout(order, { squarePaymentLink: "http://square.link/u/example" }).ok, false);
const square = squareCheckout(order, { squarePaymentLink: "https://square.link/u/example" });
assert.equal(square.ok, true);
assert.equal(square.placed, false);
assert.equal(square.redirect, "https://square.link/u/example");

assert.equal(stripeCheckout(order).ok, false);
assert.equal(stripeCheckout(order, { stripePaymentLink: "https://example.com/pay" }).ok, false);
assert.equal(stripeCheckout(order, { stripePaymentLink: "https://notstripe.com/pay" }).ok, false);
const stripe = stripeCheckout(order, { stripePaymentLink: "https://buy.stripe.com/test_abc" });
assert.equal(stripe.ok, true);
assert.equal(stripe.placed, false);

const delivery = { pickupAddress: "1 Merchant Street", dropoffAddress: "77 Jefferson Street" };
assert.equal(doorDashDriveQuote(delivery).ok, false);
assert.equal(doorDashDriveQuote(delivery, { developerId: "a", keyId: "b", signingSecret: "c" }).ok, false);
assert.equal(uberDirectQuote(delivery).ok, false);
assert.equal(uberDirectQuote(delivery, { customerId: "a", clientSecret: "b" }).dispatched, false);

console.log("adapters ok");
