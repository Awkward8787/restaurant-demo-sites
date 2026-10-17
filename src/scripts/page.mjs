import { isOpen, statusPhrase } from "../lib/hours.mjs";
import { t } from "../i18n.mjs";

const root = document.querySelector("[data-restaurant]");
if (!root) {
  // Index page has no cart.
} else {
  const slug = root.dataset.restaurant;
  const phone = root.dataset.phone;
  const phoneDisplay = root.dataset.phoneDisplay;
  const name = root.dataset.name;
  const email = root.dataset.email || "";
  const storageKey = `demo-order:${slug}`;
  const hours = JSON.parse(document.getElementById("hours-data")?.textContent || "null");
  let lang = document.documentElement.lang || "en";

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

  function load() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      if (saved?.lines) return saved;
    } catch {
      /* ignore broken storage */
    }
    return { lines: [], fulfillment: "pickup", tip: 0, when: "", notes: "" };
  }

  function save() {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  }

  function applyLang(next) {
    lang = next;
    document.documentElement.lang = next;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      node.textContent = t(next, key);
    });
    document.querySelectorAll(".lang-switch button").forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.langSwitch === next ? "true" : "false");
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
    return state.lines.reduce((sum, line) => {
      if (line.price == null) return sum;
      return sum + Math.round(line.price * 100) * line.qty;
    }, 0);
  }

  function render() {
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
          stepButton("decrease", "−", () => setQty(line.id, line.qty - 1)),
          countSpan(line.qty),
          stepButton("increase", "+", () => setQty(line.id, line.qty + 1)),
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
    const tipCents = Math.round(sub * (Number(state.tip) || 0) / 100);
    const hasUnpriced = state.lines.some((line) => line.price == null);
    totalEl.textContent = `${t(lang, "total")}: ${money(sub)} · ${t(lang, "tip")}: ${money(tipCents)}`;
    unpricedEl.hidden = !hasUnpriced;
    deliveryNote.hidden = state.fulfillment !== "delivery";
    const count = state.lines.reduce((sum, line) => sum + line.qty, 0);
    if (barLabel) {
      barLabel.textContent =
        count === 0 ? t(lang, "orderBarEmpty") : `${t(lang, "orderBar")} · ${count} · ${money(sub)}`;
    }
    save();
  }

  function stepButton(key, symbol, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.i18n = key;
    button.setAttribute("aria-label", t(lang, key));
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
    button.textContent = t(lang, "remove");
    button.addEventListener("click", () => {
      state.lines = state.lines.filter((line) => line.id !== id);
      render();
    });
    return button;
  }

  function setQty(id, qty) {
    if (qty <= 0) {
      state.lines = state.lines.filter((line) => line.id !== id);
    } else {
      const line = state.lines.find((item) => item.id === id);
      if (line) line.qty = qty;
    }
    render();
  }

  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      const price = button.dataset.price === "" ? null : Number(button.dataset.price);
      const existing = state.lines.find((line) => line.id === id);
      if (existing) existing.qty += 1;
      else {
        state.lines.push({
          id,
          name: button.dataset.name,
          itemLang: button.dataset.itemLang,
          price,
          qty: 1,
        });
      }
      button.textContent = t(lang, "added");
      window.setTimeout(() => {
        button.textContent = t(lang, "add");
      }, 700);
      render();
      openOrder();
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
        state.fulfillment = input.value;
        render();
      }
    });
  });

  document.querySelectorAll("[name='tip']").forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      if (input.value === "custom") {
        const custom = document.getElementById("tip-custom");
        state.tip = Number(custom.value) || 0;
      } else {
        state.tip = Number(input.value) || 0;
      }
      render();
    });
  });

  document.getElementById("tip-custom")?.addEventListener("input", (event) => {
    const customRadio = document.querySelector("[name='tip'][value='custom']");
    customRadio.checked = true;
    state.tip = Number(event.target.value) || 0;
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

  document.getElementById("order-submit")?.addEventListener("click", async () => {
    errorEl.hidden = true;
    if (state.lines.length === 0) {
      showError(t(lang, "errorEmpty"));
      return;
    }
    if (state.when) {
      const chosen = new Date(state.when);
      if (Number.isNaN(chosen.getTime()) || chosen.getTime() < Date.now() - 60_000) {
        showError(t(lang, "errorTime"));
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
      const encoded = encodeURIComponent(text);
      document.getElementById("sms-link").href = `sms:${phone}?&body=${encoded}`;
      const mailTo = email ? email : "";
      document.getElementById("mail-link").href =
        `mailto:${mailTo}?subject=${encodeURIComponent("Order list for " + name)}&body=${encoded}`;
      const wa = phone.replace(/[^\d]/g, "");
      document.getElementById("wa-link").href = `https://wa.me/${wa}?text=${encoded}`;
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

  function showError(message) {
    errorEl.hidden = false;
    errorEl.textContent = message;
  }

  function orderText() {
    const sub = pricedSubtotal();
    const tipCents = Math.round(sub * (Number(state.tip) || 0) / 100);
    const lines = state.lines.map((line) => {
      const price = line.price == null ? t(lang, "askPrice") : money(Math.round(line.price * 100) * line.qty);
      return `${line.qty} x ${line.name} (${price})`;
    });
    return [
      name,
      state.fulfillment === "delivery" ? t(lang, "delivery") : t(lang, "pickup"),
      state.when ? state.when : "",
      ...lines,
      `${t(lang, "total")}: ${money(sub)}`,
      `${t(lang, "tip")}: ${money(tipCents)}`,
      state.notes ? state.notes : "",
      "Demo site: no order was placed.",
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
      window.setTimeout(() => field.scrollIntoView({ block: "center" }), 80);
    });
  });

  const fulfillment = document.querySelector(`[name='fulfillment'][value='${state.fulfillment}']`);
  if (fulfillment) fulfillment.checked = true;
  const tipRadio = document.querySelector(`[name='tip'][value='${state.tip}']`);
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

  applyLang(lang);
  render();
}

const indexNav = document.querySelector("[data-index]");
if (indexNav) {
  /* Index has no extra behavior. The selector keeps the file from being empty on that page. */
}
