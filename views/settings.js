import { html } from "@bootstrapp/html";
import { t } from "@bootstrapp/i18n";

const $APP = globalThis.$APP;
const { T } = $APP;

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "pt-BR", label: "Português (BR)" },
];
const CURRENCIES = ["BRL", "USD", "EUR", "GBP"];

export default {
  tag: "cv-settings",
  class: "block",
  properties: {
    displayCurrency: T.string({ defaultValue: "BRL", sync: "rates" }),
    ratesInfo: T.object(),
    refreshing: T.boolean({ defaultValue: false }),
  },
  async connected() {
    await $APP.rates.get().ensure();
    this.ratesInfo = $APP.rates.get().info();
  },
  async _refresh() {
    this.refreshing = true;
    await $APP.rates.get().refresh().catch(() => {});
    this.ratesInfo = $APP.rates.get().info();
    this.refreshing = false;
  },
  async _setLanguage(id) {
    await $APP.i18n.setLanguage(id);
    this.requestUpdate();
  },
  render() {
    const current = $APP.i18n?.getLanguage?.() || "en";
    const info = this.ratesInfo;
    return html`
      <div class="flex flex-col gap-4">
        <h1 class="text-2xl font-black tracking-tight">${t("settings.title")}</h1>

        <div class="flex flex-col gap-3 rounded-panel bg-surface p-4 shadow-sm">
          <h2 class="text-sm font-bold uppercase tracking-wide text-muted">${t("settings.language")}</h2>
          <div class="flex gap-2">
            ${LANGUAGES.map(
              (l) => html`
                <button type="button" @click=${() => this._setLanguage(l.id)}
                  class="rounded-lg px-4 py-2 text-sm font-bold ${current === l.id ? "bg-primary text-inverse" : "bg-surface-dark text-secondary"}">${l.label}</button>
              `,
            )}
          </div>
        </div>

        <div class="flex flex-col gap-3 rounded-panel bg-surface p-4 shadow-sm">
          <h2 class="text-sm font-bold uppercase tracking-wide text-muted">${t("settings.displayCurrency")}</h2>
          <div class="flex gap-2">
            ${CURRENCIES.map(
              (c) => html`
                <button type="button" @click=${() => (this.displayCurrency = c)}
                  class="rounded-lg px-4 py-2 text-sm font-bold tabular-nums ${this.displayCurrency === c ? "bg-primary text-inverse" : "bg-surface-dark text-secondary"}">${c}</button>
              `,
            )}
          </div>
        </div>

        <div class="flex flex-col gap-2 rounded-panel bg-surface p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold uppercase tracking-wide text-muted">${t("settings.rates")}</h2>
            <uix-button ghost size="sm" icon="refresh-cw" ?loading=${this.refreshing} @click=${() => this._refresh()}>${t("settings.refresh")}</uix-button>
          </div>
          ${info
            ? html`<p class="text-sm text-muted">
                ${t("settings.ratesUpdated")}: ${info.updatedAt || "—"}
                ${info.offline ? html`<span class="ml-1 rounded bg-warning-light/30 px-1.5 py-0.5 text-xs font-bold text-warning">${t("settings.offline")}</span>` : ""}
              </p>`
            : ""}
        </div>

        <div class="flex items-center justify-between rounded-panel bg-surface p-4 shadow-sm">
          <h2 class="text-sm font-bold uppercase tracking-wide text-muted">Dark mode</h2>
          <uix-darkmode></uix-darkmode>
        </div>
      </div>`;
  },
};
