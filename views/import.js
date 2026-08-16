import { html } from "@bootstrapp/html";
import { defineComponent } from "@bootstrapp/view";
import { t } from "@bootstrapp/i18n";
import { formatMoney, formatDate } from "../lib/money.js";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

/** @import { AccountRecord, CsvMapping, ImportResult, Prop, Row } from "../types.ts" */

export default defineComponent({
  tag: "cv-import",
  class: "block",
  properties: {
    text: T.string({ defaultValue: "" }),
    preview: /** @type {Prop<({ headers: string[], mapping: CsvMapping } & ImportResult) | null>} */ (T.object()),
    accounts: /** @type {Prop<Row<AccountRecord>[]>} */ (T.array({ defaultValue: [] })),
    accountId: T.string({ defaultValue: "" }),
    done: T.number({ defaultValue: 0 }),
  },
  async connected() {
    this.accounts = await $APP.Model.account.getAll();
    this.accountId = String(this.accounts[0]?.id ?? "");
  },
  _preview() {
    this.done = 0;
    this.preview = this.text.trim() ? $APP.importer.get().preview(this.text) : null;
  },
  async _commit() {
    if (!this.preview?.drafts?.length) return;
    this.done = await $APP.importer.get().commit(this.preview.drafts, this.accountId);
    this.text = "";
    this.preview = null;
  },
  render() {
    const locale = $APP.i18n?.getLanguage?.() || "en";
    const p = this.preview;
    return html`
      <div class="flex flex-col gap-4">
        <h1 class="text-2xl font-black tracking-tight">${t("import.title")}</h1>

        <textarea rows="7" placeholder=${t("import.paste")} .value=${this.text}
          class="w-full rounded-panel border border-dim bg-surface p-3 font-mono text-xs"
          @input=${(e) => { this.text = e.target.value; this._preview(); }}></textarea>

        ${this.done ? html`<p class="rounded-lg bg-gain-tint px-4 py-3 text-sm font-semibold text-gain">${t("import.done", { count: this.done })}</p>` : ""}

        ${p
          ? html`
              <div class="flex flex-col gap-3 rounded-panel bg-surface p-4 shadow-sm">
                <div class="flex items-center justify-between">
                  <h2 class="text-sm font-bold uppercase tracking-wide text-muted">${t("import.preview")}</h2>
                  ${p.skipped.length ? html`<span class="text-xs font-semibold text-warning">${t("import.skipped", { count: p.skipped.length })}</span>` : ""}
                </div>
                <div class="max-h-64 overflow-y-auto">
                  <div class="flex flex-col divide-y divide-dim">
                    ${p.drafts.slice(0, 50).map(
                      (d) => html`
                        <div class="flex items-center gap-3 py-2 text-sm">
                          <span class="w-16 shrink-0 text-xs text-muted">${formatDate(d.date, locale)}</span>
                          <span class="min-w-0 flex-1 truncate">${d.note}</span>
                          <span class="shrink-0 font-bold tabular-nums ${d.amount >= 0 ? "text-gain" : "text-spend"}">${formatMoney(d.amount, "BRL", locale)}</span>
                        </div>
                      `,
                    )}
                  </div>
                </div>
                <div class="flex items-end gap-3">
                  <label class="flex flex-col gap-1 text-sm font-semibold">
                    ${t("import.account")}
                    <select class="rounded-lg border border-dim bg-surface px-3 py-2 text-sm" @change=${(e) => (this.accountId = e.target.value)}>
                      ${this.accounts.map((a) => html`<option value=${a.id} ?selected=${this.accountId === a.id}>${a.name}</option>`)}
                    </select>
                  </label>
                  <uix-button primary icon="upload" ?disabled=${!p.drafts.length} @click=${() => this._commit()}>
                    ${t("import.commit", { count: p.drafts.length })}
                  </uix-button>
                </div>
              </div>
            `
          : ""}
      </div>`;
  },
});
