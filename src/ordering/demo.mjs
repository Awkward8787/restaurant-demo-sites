/**
 * Demo checkout. It never places an order.
 * The screen must say so. Real adapters live beside this file.
 */
export function demoCheckout(order) {
  return {
    ok: true,
    placed: false,
    title: "Demo site: no order was placed. Call to order.",
    order,
  };
}
