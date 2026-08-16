import { html } from "@bootstrapp/html";
import { t } from "@bootstrapp/i18n";
import { CATEGORIES } from "../lib/categories.js";
import T from "@bootstrapp/types";

export default {
  tag: "cv-transaction-form",
  class: "block",
  properties: {
    draft: T.object({ defaultValue: {} }),
    accounts: T.array({ defaultValue: [] }),
    kind: T.string({ defaultValue: "expense" }),
  },
  events: {
    save: T.object(),
    remove: T.object(),
    cancel: T.any(),
  },
  connected() {
    if ((this.draft?.amount ?? 0) > 0) this.kind = "income";
  },
  _field(key, value) {
    this.draft = { ...this.draft, [key]: value };
  },
  _submit(e) {
    e.preventDefault();
    const raw = Math.abs(Number(this.draft.amount) || 0);
    if (!raw) return;
    const accountId = this.draft.accountId || this.accounts[0]?.id;
    const account = this.accounts.find((a) => a.id === accountId);
    this.emit("save", {
      ...this.draft,
      accountId,
      currency: account?.currency || "BRL",
      amount: this.kind === "expense" ? -raw : raw,
      category: this.kind === "income" ? "salary" : this.draft.category || "other",
    });
  },
  render() {
    const d = this.draft || {};
    return html`
      <form class="flex flex-col gap-3 rounded-panel bg-surface p-4 shadow-md" @submit=${(e) => this._submit(e)}>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold">${d.id ? t("transactions.edit") : t("transactions.add")}</h2>
          <uix-segmented .value=${this.kind} .options=${[
            { value: "expense", label: t("transactions.expense") },
            { value: "income", label: t("transactions.income") },
          ]} @change=${(e) => (this.kind = e.detail.value)}></uix-segmented>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <uix-input type="number" step="0.01" min="0" required placeholder="0,00"
            .value=${d.amount != null ? String(Math.abs(d.amount)) : ""}
            @input=${(e) => this._field("amount", e.detail.value)}>
            <span slot="label">${t("transactions.amount")}</span>
          </uix-input>
          <uix-input type="date" .value=${d.date || new Date().toISOString().slice(0, 10)}
            @input=${(e) => this._field("date", e.detail.value)}>
            <span slot="label">${t("transactions.date")}</span>
          </uix-input>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <label class="flex flex-col gap-1 text-sm font-semibold">
            ${t("transactions.category")}
            <select class="rounded-lg border border-dim bg-surface px-3 py-2 text-sm"
              .value=${d.category || "other"} @change=${(e) => this._field("category", e.target.value)}
              ?disabled=${this.kind === "income"}>
              ${CATEGORIES.filter((c) => !c.income).map((c) => html`<option value=${c.id} ?selected=${(d.category || "other") === c.id}>${t(`categories.${c.id}`)}</option>`)}
            </select>
          </label>
          <label class="flex flex-col gap-1 text-sm font-semibold">
            ${t("transactions.account")}
            <select class="rounded-lg border border-dim bg-surface px-3 py-2 text-sm"
              @change=${(e) => this._field("accountId", e.target.value)}>
              ${this.accounts.map((a) => html`<option value=${a.id} ?selected=${(d.accountId || this.accounts[0]?.id) === a.id}>${a.name}</option>`)}
            </select>
          </label>
        </div>
        <uix-input placeholder=${t("transactions.note")} .value=${d.note || ""} @input=${(e) => this._field("note", e.detail.value)}></uix-input>
        <div class="flex items-center gap-2">
          <uix-button primary type="submit">${t("transactions.save")}</uix-button>
          <uix-button ghost @click=${() => this.emit("cancel")}>${t("transactions.cancel")}</uix-button>
          ${d.id ? html`<uix-button ghost class="ml-auto text-spend" icon="trash-2" @click=${() => this.emit("remove", { id: d.id })}>${t("transactions.delete")}</uix-button>` : ""}
        </div>
      </form>`;
  },
};
