import { html } from "@bootstrapp/html";
import { defineComponent } from "@bootstrapp/view";
import { t } from "@bootstrapp/i18n";
import { formatMoney } from "../lib/money.js";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

/** @import { AccountRecord, Prop, Row } from "../types.ts" */

const KIND_ICON = { checking: "landmark", credit: "credit-card", savings: "piggy-bank", cash: "coins" };
const KINDS = ["checking", "credit", "savings", "cash"];
const CURRENCIES = ["BRL", "USD", "EUR", "GBP"];

export default defineComponent({
  tag: "cv-accounts",
  class: "block",
  properties: {
    accounts: /** @type {Prop<Row<AccountRecord>[]>} */ (T.array({ defaultValue: [], sync: $APP.Model.account, query: {} })),
    balances: /** @type {Prop<Record<string, number>>} */ (T.object({ defaultValue: {} })),
    adding: T.boolean({ defaultValue: false }),
    name: T.string({ defaultValue: "" }),
    kind: T.string({ defaultValue: "checking" }),
    currency: T.string({ defaultValue: "BRL" }),
  },
  async connected() {
    this.balances = await $APP.ledger.get().accountBalances();
  },
  async _add(e) {
    e.preventDefault();
    if (!this.name.trim()) return;
    await $APP.Model.account.add({ name: this.name.trim(), kind: this.kind, currency: this.currency });
    this.name = "";
    this.adding = false;
  },
  render() {
    const locale = $APP.i18n?.getLanguage?.() || "en";
    return html`
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black tracking-tight">${t("accounts.title")}</h1>
          <uix-button primary size="sm" icon="plus" @click=${() => (this.adding = !this.adding)}>${t("accounts.add")}</uix-button>
        </div>

        ${this.adding
          ? html`
              <form class="flex items-end gap-3 rounded-panel bg-surface p-4 shadow-md" @submit=${(e) => this._add(e)}>
                <uix-input class="flex-1" required .value=${this.name} @input=${(e) => (this.name = e.detail.value)}>
                  <span slot="label">${t("accounts.name")}</span>
                </uix-input>
                <uix-select
                  label=${t("accounts.kind")}
                  .options=${KINDS.map((k) => ({ value: k, label: t(`accounts.kinds.${k}`) }))}
                  .value=${this.kind}
                  @change=${(e) => (this.kind = e.detail.value)}></uix-select>
                <uix-select
                  label=${t("accounts.currency")}
                  .options=${CURRENCIES}
                  .value=${this.currency}
                  @change=${(e) => (this.currency = e.detail.value)}></uix-select>
                <uix-button primary type="submit">${t("transactions.save")}</uix-button>
              </form>
            `
          : ""}

        <div class="flex flex-col divide-y divide-dim overflow-hidden rounded-panel bg-surface shadow-sm">
          ${(this.accounts || []).map(
            (a) => html`
              <div class="flex items-center gap-3 px-4 py-3">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-dark text-secondary">
                  <uix-icon name=${KIND_ICON[a.kind] || "wallet"} size="16"></uix-icon>
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-semibold">${a.name}</span>
                  <span class="text-xs text-muted">${t(`accounts.kinds.${a.kind}`)} · ${a.currency}</span>
                </span>
                <span class="shrink-0 text-sm font-bold tabular-nums ${(this.balances[String(a.id)] || 0) >= 0 ? "text-gain" : "text-spend"}">
                  ${formatMoney(this.balances[String(a.id)] || 0, a.currency, locale)}
                </span>
              </div>
            `,
          )}
        </div>
      </div>`;
  },
});
