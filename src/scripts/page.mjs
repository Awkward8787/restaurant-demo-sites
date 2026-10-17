import { clampQty, cleanTip, focusAfterChange, itemCount, pricedSubtotalCents, sanitizeCart } from "../lib/cart.mjs";
import { bindHoursRefresh, formatPickup, isOpen, pickupIssue, statusPhrase } from "../lib/hours.mjs";
import { cleanLang, t } from "../i18n.mjs";
import { wantsFieldScroll } from "../lib/ui.mjs";

const root = document.querySelector("[data-restaurant]");
if (!root) {
  // Index page has no cart.
} else {
  const slug = root.dataset.restaurant;
  const name = root.dataset.name;
  const offersDelivery = root.dataset.delivery === "true";
  const deliveryFee = Number(root.dataset.deliveryFee);
  const deliveryFeeCents = offersDelivery && Number.isFinite(deliveryFee) && deliveryFee > 0 ? Math.round(deliveryFee * 100) : 0;
  const storageKey = `demo-order:${slug}`;
  const hours = JSON.parse(document.getElementById("hours-data")?.textContent || "null");
  let lang = storedLang() || cleanLang(document.documentElement.lang) || "en";

  const dialog = document.getElementById("order-dialog");
  const linesEl = document.getElementById("order-lines");
  const emptyEl = document.getElementById("order-empty");
  const formEl = document.getElementById("order-form");
  const resultEl = document.getElementById("order-result");
  const errorEl = document.getElementById("order-error");
  const totalEl = document.getElementById("order-total");
  const unpricedEl = document.getElementById("order-unpriced");
  const deliveryNote = document.getElementById("delivery-note");
  const barLabel = document.getElementById("order-bar-label");
  const statusNodes = document.querySelectorAll("[data-hours-status]");

  let state = load();

  function menuFromPage() {
    const menu = {};
    document.querySelectorAll("[data-add]").forEach((button) => {
      const raw = button.dataset.price;
      const price = raw === "" || raw == null ? null : Number(raw);
      menu[button.dataset.id] = {
        name: button.dataset.name,
        itemLang: button.dataset.itemLang || "en",
        price: Number.isFinite(price) ? price : null,
      };
    });
    return menu;
  }

  function load() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      return normalizeCart(sanitizeCart(saved, menuFromPage()));
    } catch {
      return normalizeCart(sanitizeCart(null, menuFromPage()));
    }
  }

  function normalizeCart(cart) {
    if (!offersDelivery) cart.fulfillment = "pickup";
    return cart;
  }

  function activeWeekly() {
    if (state.fulfillment === "delivery" && hours?.deliveryWeekly) return hours.deliveryWeekly;
    return hours?.weekly;
  }

  function save() {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  }

  function storedLang() {
    try {
      return cleanLang(localStorage.getItem("demo-lang"));
    } catch {
      return null;
    }
  }

  function applyLang(next) {
    const clean = cleanLang(next);
    if (!clean) return;
    lang = clean;
    document.documentElement.lang = clean;
    try {
      localStorage.setItem("demo-lang", clean);
    } catch {
      /* Storage can be blocked. The choice still applies for this visit. */
    }
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      node.textContent = t(clean, key);
    });
    document.querySelectorAll(".lang-switch button").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.langSwitch === clean ? "true" : "false");
    });
    paintHours();
    render();
  }

  function paintHours() {
    const open = hours?.weekly ? isOpen(hours.weekly) : null;
    const phrase = statusPhrase(open, lang);
    statusNodes.forEach((node) => {
      node.textContent = phrase;
    });
  }

  function money(cents) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  }

  function pricedSubtotal() {
    return pricedSubtotalCents(state.lines);
  }

  function render(focus) {
    linesEl.replaceChildren();
    if (state.lines.length === 0) {
      emptyEl.hidden = false;
    } else {
      emptyEl.hidden = true;
      for (const line of state.lines) {
        const li = document.createElement("li");
        li.className = "line";
        const copy = document.createElement("div");
        const title = document.createElement("div");
        title.className = "dish-name";
        title.lang = line.itemLang || "en";
        title.textContent = line.name;
        copy.append(title);
        const qty = document.createElement("div");
        qty.className = "qty";
        qty.append(
          stepButton(line.id, "decrease", "−", () => setQty(line.id, line.qty - 1, "decrease")),
          countSpan(line.qty),
          stepButton(line.id, "increase", "+", () => setQty(line.id, line.qty + 1, "increase")),
          removeButton(line.id),
        );
        copy.append(qty);
        const price = document.createElement("div");
        price.className = line.price == null ? "ask" : "price";
        price.textContent =
          line.price == null ? t(lang, "askPrice") : money(Math.round(line.price * 100) * line.qty);
        li.append(copy, price);
        linesEl.append(li);
      }
    }

    const sub = pricedSubtotal();
    const tipCents = Math.round(sub * cleanTip(state.tip) / 100);
    const fee = state.fulfillment === "delivery" ? deliveryFeeCents : 0;
    const beforeTax = sub + tipCents + fee;
    const hasUnpriced = state.lines.some((line) => line.price == null);
    const parts = [`${t(lang, "subtotal")}: ${money(sub)}`, `${t(lang, "tip")}: ${money(tipCents)}`];
    if (fee) parts.push(`${t(lang, "delivery")}: ${money(fee)}`);
    parts.push(`${t(lang, "beforeTax")}: ${money(beforeTax)}`);
    totalEl.textContent = parts.join(" · ");
    unpricedEl.hidden = !hasUnpriced;
    deliveryNote.hidden = state.fulfillment !== "delivery";
    const addressLabel = document.getElementById("delivery-address-label");
    if (addressLabel) addressLabel.hidden = state.fulfillment !== "delivery";
    const count = itemCount(state.lines);
    if (barLabel) {
      barLabel.textContent =
        count === 0 ? t(lang, "orderBarEmpty") : `${t(lang, "orderBar")} · ${count} · ${money(sub)}`;
    }
    save();
    if (focus) restoreFocus(focus);
  }

  function restoreFocus(focus) {
    if (focus.kind === "empty") {
      emptyEl.tabIndex = -1;
      emptyEl.focus();
      return;
    }
    const button = linesEl.querySelector(
      `[data-line-id="${cssEscape(focus.id)}"][data-action="${cssEscape(focus.action)}"]`,
    );
    button?.focus();
  }

  function cssEscape(value) {
    if (typeof globalThis.CSS?.escape === "function") return globalThis.CSS.escape(String(value));
    return String(value).replace(/["\\]/g, "\\$&");
  }

  function stepButton(lineId, action, symbol, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.i18n = action;
    button.dataset.lineId = lineId;
    button.dataset.action = action;
    button.setAttribute("aria-label", t(lang, action));
    button.textContent = symbol;
    button.addEventListener("click", onClick);
    return button;
  }

  function countSpan(qty) {
    const span = document.createElement("span");
    span.textContent = String(qty);
    return span;
  }

  function removeButton(id) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "remove-line";
    button.dataset.i18n = "remove";
    button.dataset.lineId = id;
    button.dataset.action = "remove";
    button.textContent = t(lang, "remove");
    button.addEventListener("click", () => {
      const before = state.lines;
      state.lines = state.lines.filter((line) => line.id !== id);
      render(focusAfterChange(before, state.lines, { id, action: "remove" }));
    });
    return button;
  }

  function setQty(id, qty, action) {
    const before = state.lines;
    if (qty <= 0) {
      state.lines = state.lines.filter((line) => line.id !== id);
    } else {
      const line = state.lines.find((item) => item.id === id);
      if (line) line.qty = clampQty(qty) ?? line.qty;
    }
    render(focusAfterChange(before, state.lines, { id, action }));
  }

  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const item = menuFromPage()[id];
      if (!item) return;
      const existing = state.lines.find((line) => line.id === id);
      if (existing) existing.qty = clampQty(existing.qty + 1);
      else {
        state.lines.push({
          id,
          name: item.name,
          itemLang: item.itemLang,
          price: item.price,
          qty: 1,
        });
      }
      button.textContent = t(lang, "added");
      window.setTimeout(() => {
        if (button.dataset.i18n === "add") button.textContent = t(lang, "add");
      }, 700);
      const live = document.getElementById("add-live");
      if (live) live.textContent = `${item.name}. ${t(lang, "added")}`;
      render();
    });
  });

  function openOrder() {
    resultEl.hidden = true;
    formEl.hidden = false;
    errorEl.hidden = true;
    if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  }

  document.querySelectorAll("[data-open-order]").forEach((button) => {
    button.addEventListener("click", openOrder);
  });

  document.getElementById("order-close")?.addEventListener("click", () => dialog.close());

  document.querySelectorAll("[name='fulfillment']").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.fulfillment = input.value === "delivery" ? "delivery" : "pickup";
        render();
      }
    });
  });

  document.querySelectorAll("[name='tip']").forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      if (input.value === "custom") {
        state.tip = readCustomTip();
      } else {
        state.tip = cleanTip(input.value);
      }
      render();
    });
  });

  document.getElementById("tip-custom")?.addEventListener("input", () => {
    const customRadio = document.querySelector("[name='tip'][value='custom']");
    customRadio.checked = true;
    state.tip = readCustomTip();
    render();
  });

  document.getElementById("order-when")?.addEventListener("change", (event) => {
    state.when = event.target.value;
    save();
  });

  document.getElementById("order-notes")?.addEventListener("input", (event) => {
    state.notes = event.target.value;
    save();
  });

  document.getElementById("delivery-address")?.addEventListener("input", (event) => {
    state.address = event.target.value;
    save();
  });

  document.getElementById("order-submit")?.addEventListener("click", async () => {
    errorEl.hidden = true;
    if (state.lines.length === 0) {
      showError(t(lang, "errorEmpty"));
      return;
    }
    if (state.fulfillment === "delivery" && !String(state.address || "").trim()) {
      showError(t(lang, "deliveryNeedAddress"));
      return;
    }
    if (state.when) {
      const issue = pickupIssue(state.when, Date.now(), activeWeekly());
      if (issue === "past" || issue === "invalid") {
        showError(t(lang, "errorTime"));
        return;
      }
      if (issue === "gap") {
        showError(t(lang, "errorTimeGap"));
        return;
      }
      if (issue === "closed") {
        showError(t(lang, "errorClosed"));
        return;
      }
    }
    const submit = document.getElementById("order-submit");
    submit.disabled = true;
    submit.textContent = t(lang, "checking");
    await new Promise((resolve) => window.setTimeout(resolve, 280));
    try {
      const text = orderText();
      document.getElementById("order-list-text").textContent = text;
      formEl.hidden = true;
      resultEl.hidden = false;
      resultEl.focus();
    } catch {
      showError(t(lang, "errorGeneric"));
    } finally {
      submit.disabled = false;
      submit.textContent = t(lang, "checkout");
    }
  });

  function inputByValue(name, value) {
    return [...document.querySelectorAll(`input[name="${name}"]`)].find((input) => input.value === String(value)) ?? null;
  }

  function readCustomTip() {
    const field = document.getElementById("tip-custom");
    if (!field) return 0;
    const raw = field.value;
    if (raw.trim() === "") return 0;
    const tip = cleanTip(raw);
    if (String(tip) !== raw) field.value = String(tip);
    return tip;
  }

  function showError(message) {
    errorEl.hidden = false;
    errorEl.textContent = message;
  }

  function orderText() {
    const sub = pricedSubtotal();
    const tipCents = Math.round(sub * cleanTip(state.tip) / 100);
    const fee = state.fulfillment === "delivery" ? deliveryFeeCents : 0;
    const lines = state.lines.map((line) => {
      const price = line.price == null ? t(lang, "askPrice") : money(Math.round(line.price * 100) * line.qty);
      return `${line.qty} x ${line.name} (${price})`;
    });
    return [
      name,
      state.fulfillment === "delivery" ? t(lang, "delivery") : t(lang, "pickup"),
      state.fulfillment === "delivery" ? state.address : "",
      state.when ? formatPickup(state.when, lang) : "",
      ...lines,
      `${t(lang, "subtotal")}: ${money(sub)}`,
      `${t(lang, "tip")}: ${money(tipCents)}`,
      fee ? `${t(lang, "delivery")}: ${money(fee)}` : "",
      `${t(lang, "beforeTax")}: ${money(sub + tipCents + fee)}`,
      state.notes ? state.notes : "",
      t(lang, "demoFoot"),
    ]
      .filter(Boolean)
      .join("\n");
  }

  document.getElementById("copy-list")?.addEventListener("click", async () => {
    const text = document.getElementById("order-list-text").textContent;
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = t(lang, "copied");
    } catch {
      status.textContent = t(lang, "copyFailed");
    }
  });

  const nav = document.getElementById("nav-panel");
  const navToggle = document.getElementById("nav-toggle");
  navToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll("[data-lang-switch]").forEach((button) => {
    button.addEventListener("click", () => applyLang(button.dataset.langSwitch));
  });

  const catering = document.getElementById("catering-form");
  catering?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = document.getElementById("catering-error");
    const ok = document.getElementById("catering-ok");
    const note = document.getElementById("catering-preview");
    error.hidden = true;
    ok.hidden = true;
    const data = new FormData(catering);
    const person = String(data.get("name") || "").trim();
    const theirPhone = String(data.get("phone") || "").trim();
    const message = String(data.get("note") || "").trim();
    if (!person) return showCatering(error, t(lang, "cateringNeedName"));
    if (!theirPhone) return showCatering(error, t(lang, "cateringNeedPhone"));
    if (!message) return showCatering(error, t(lang, "cateringNeedNote"));
    const button = document.getElementById("catering-submit");
    button.disabled = true;
    button.textContent = t(lang, "cateringWorking");
    await new Promise((resolve) => window.setTimeout(resolve, 240));
    note.textContent = [
      name,
      person,
      theirPhone,
      data.get("date") || "",
      data.get("guests") || "",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    ok.hidden = false;
    button.disabled = false;
    button.textContent = t(lang, "cateringSend");
  });

  function showCatering(node, message) {
    node.hidden = false;
    node.textContent = message;
  }

  document.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("focus", () => {
      const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
      if (!wantsFieldScroll(coarse)) return;
      window.setTimeout(() => field.scrollIntoView({ block: "center" }), 80);
    });
  });

  const fulfillment = inputByValue("fulfillment", state.fulfillment);
  if (fulfillment) fulfillment.checked = true;
  const tipRadio = inputByValue("tip", state.tip);
  if (tipRadio) tipRadio.checked = true;
  else if (state.tip) {
    const custom = document.querySelector("[name='tip'][value='custom']");
    if (custom) custom.checked = true;
    const field = document.getElementById("tip-custom");
    if (field) field.value = String(state.tip);
  }
  const when = document.getElementById("order-when");
  if (when && state.when) when.value = state.when;
  const notes = document.getElementById("order-notes");
  if (notes) notes.value = state.notes || "";
  const address = document.getElementById("delivery-address");
  if (address) address.value = state.address || "";

  applyLang(lang);
  bindHoursRefresh(paintHours, {
    setInterval: (fn, ms) => window.setInterval(fn, ms),
    addEventListener: (type, fn) => document.addEventListener(type, fn),
    visibilityState: () => document.visibilityState,
  });
}

const indexNav = document.querySelector("[data-index]");
if (indexNav) {
  /* Index has no extra behavior. The selector keeps the file from being empty on that page. */
}
