import { html } from "@bootstrapp/html";
import { t } from "@bootstrapp/i18n";
import { formatMoney, currentMonth, monthLabel } from "../lib/money.js";
import { EXPENSE_CATEGORIES, categoryIcon } from "../lib/categories.js";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

export default {
  tag: "cv-budgets",
  class: "block",
  properties: {
    month: T.string({ defaultValue: currentMonth(), sync: "ledger" }),
    progress: T.array({ defaultValue: [] }),
    newCategory: T.string({ defaultValue: "food" }),
    newLimit: T.string({ defaultValue: "" }),
    loaded: T.boolean({ defaultValue: false }),
  },
  async connected() {
    await this._load();
  },
  async _load() {
    this.progress = await $APP.budgets.get().progress(this.month);
    this.loaded = true;
  },
  async _set(e) {
    e.preventDefault();
    const limit = Number(this.newLimit);
    if (!limit || limit <= 0) return;
    await $APP.budgets.get().setLimit(this.month, this.newCategory, limit);
    this.newLimit = "";
    await this._load();
  },
  async _remove(category) {
    await $APP.budgets.get().removeLimit(this.month, category);
    await this._load();
  },
  render() {
    if (!this.loaded) return html`<uix-flex justify="center" class="py-16"><uix-spinner></uix-spinner></uix-flex>`;
    const locale = $APP.i18n?.getLanguage?.() || "en";
    const currency = $APP.rates.get().displayCurrency;
    const money = (v) => formatMoney(v, currency, locale);
    const budgeted = this.progress.filter((p) => p.limit > 0);
    return html`
      <div class="flex flex-col gap-4">
        <h1 class="text-2xl font-black tracking-tight capitalize">${t("budgets.title")} · ${monthLabel(this.month, locale)}</h1>

        ${budgeted.length
          ? html`
              <div class="flex flex-col gap-4 rounded-panel bg-surface p-4 shadow-sm">
                ${budgeted.map(
                  (p) => html`
                    <div>
                      <div class="mb-1 flex items-center gap-2 text-sm">
                        <uix-icon name=${categoryIcon(p.category)} size="15" class="text-secondary"></uix-icon>
                        <span class="font-semibold">${t(`categories.${p.category}`)}</span>
                        <span class="ml-auto tabular-nums ${p.ratio > 1 ? "font-bold text-spend" : "text-muted"}">
                          ${money(-p.spent)} / ${money(-p.limit)}
                          ${p.ratio > 1 ? html`· ${money(-(p.spent - p.limit))} ${t("budgets.over")}` : ""}
                        </span>
                        <button type="button" style="background:transparent" aria-label="Remove budget"
                          class="border-0 p-0 text-muted hover:text-spend" @click=${() => this._remove(p.category)}>
                          <uix-icon name="x" size="14"></uix-icon>
                        </button>
                      </div>
                      <uix-progress-bar .value=${Math.min(100, p.ratio * 100)} variant=${p.ratio > 1 ? "error" : p.ratio > 0.85 ? "warning" : "primary"}></uix-progress-bar>
                    </div>
                  `,
                )}
              </div>
            `
          : html`<p class="py-4 text-muted">${t("budgets.empty")}</p>`}

        <form class="flex items-end gap-3 rounded-panel bg-surface p-4 shadow-sm" @submit=${(e) => this._set(e)}>
          <label class="flex flex-col gap-1 text-sm font-semibold">
            ${t("transactions.category")}
            <select class="rounded-lg border border-dim bg-surface px-3 py-2 text-sm" @change=${(e) => (this.newCategory = e.target.value)}>
              ${EXPENSE_CATEGORIES.map((c) => html`<option value=${c.id} ?selected=${this.newCategory === c.id}>${t(`categories.${c.id}`)}</option>`)}
            </select>
          </label>
          <uix-input class="flex-1" type="number" min="1" step="1" placeholder="0"
            .value=${this.newLimit} @input=${(e) => (this.newLimit = e.detail.value)}>
            <span slot="label">${t("budgets.limit")}</span>
          </uix-input>
          <uix-button primary type="submit">${t("budgets.add")}</uix-button>
        </form>
      </div>`;
  },
};
