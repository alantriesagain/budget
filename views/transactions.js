import { html } from "@bootstrapp/html";
import { t } from "@bootstrapp/i18n";
import { formatMoney, formatDate, currentMonth, monthLabel } from "../lib/money.js";
import { CATEGORIES, categoryIcon } from "../lib/categories.js";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

export default {
  tag: "cv-transactions",
  class: "block",
  properties: {
    month: T.string({ defaultValue: currentMonth(), sync: "ledger" }),
    rows: T.array({ defaultValue: [] }),
    accounts: T.array({ defaultValue: [] }),
    category: T.string({ defaultValue: "all" }),
    editing: T.object(),
    loaded: T.boolean({ defaultValue: false }),
  },
  async connected() {
    this.accounts = await $APP.Model.account.getAll();
    await this._load();
  },
  async _load() {
    this.rows = await $APP.ledger.get().monthTransactions(this.month);
    this.loaded = true;
  },
  _shift(delta) {
    const [y, m] = this.month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    this.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    this._load();
  },
  async _save(draft) {
    if (draft.id) await $APP.ledger.get().edit(draft);
    else await $APP.ledger.get().add(draft);
    this.editing = null;
    await this._load();
  },
  async _remove(id) {
    await $APP.ledger.get().remove(id);
    this.editing = null;
    await this._load();
  },
  _visible() {
    const rows = /** @type {any[]} */ (this.rows || []);
    return this.category === "all" ? rows : rows.filter((r) => r.category === this.category);
  },
  render() {
    if (!this.loaded) return html`<uix-flex justify="center" class="py-16"><uix-spinner></uix-spinner></uix-flex>`;
    const locale = $APP.i18n?.getLanguage?.() || "en";
    const visible = this._visible();
    const accountOf = Object.fromEntries(this.accounts.map((a) => [a.id, a]));
    return html`
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black tracking-tight capitalize">${monthLabel(this.month, locale)}</h1>
          <div class="flex items-center gap-1">
            <uix-button ghost iconOnly icon="chevron-left" size="sm" aria-label="Previous month" @click=${() => this._shift(-1)}></uix-button>
            <uix-button ghost iconOnly icon="chevron-right" size="sm" aria-label="Next month" @click=${() => this._shift(1)}></uix-button>
            <uix-button primary size="sm" icon="plus" @click=${() => (this.editing = {})}>${t("transactions.add")}</uix-button>
          </div>
        </div>

        <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          <button type="button" @click=${() => (this.category = "all")}
            class="shrink-0 rounded-full px-3 py-1 text-xs font-bold ${this.category === "all" ? "bg-primary text-inverse" : "bg-surface text-secondary"}">${t("transactions.all")}</button>
          ${CATEGORIES.map(
            (c) => html`
              <button type="button" @click=${() => (this.category = c.id)}
                class="flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${this.category === c.id ? "bg-primary text-inverse" : "bg-surface text-secondary"}">
                <uix-icon name=${c.icon} size="12"></uix-icon>${t(`categories.${c.id}`)}
              </button>
            `,
          )}
        </div>

        ${this.editing ? html`<cv-transaction-form .draft=${this.editing} .accounts=${this.accounts}
          @save=${(e) => this._save(e.detail)} @remove=${(e) => this._remove(e.detail.id)} @cancel=${() => (this.editing = null)}></cv-transaction-form>` : ""}

        ${visible.length
          ? html`
              <div class="flex flex-col divide-y divide-dim overflow-hidden rounded-panel bg-surface shadow-sm">
                ${visible.map(
                  (r) => html`
                    <button type="button" style="background:transparent" @click=${() => (this.editing = { ...r })}
                      class="flex items-center gap-3 border-0 px-4 py-3 text-left">
                      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${r.amount >= 0 ? "bg-gain-tint text-gain" : "bg-spend-tint text-spend"}">
                        <uix-icon name=${categoryIcon(r.category)} size="16"></uix-icon>
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block truncate text-sm font-semibold">${r.note || t(`categories.${r.category}`)}</span>
                        <span class="text-xs text-muted">${formatDate(r.date, locale)} · ${accountOf[r.accountId]?.name || ""}</span>
                      </span>
                      <span class="shrink-0 text-sm font-bold tabular-nums ${r.amount >= 0 ? "text-gain" : "text-spend"}">${formatMoney(r.amount, r.currency, locale)}</span>
                    </button>
                  `,
                )}
              </div>
            `
          : html`<p class="py-8 text-center text-muted">${t("transactions.empty")}</p>`}
      </div>`;
  },
};
