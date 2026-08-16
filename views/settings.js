import { html } from "@bootstrapp/html";
import { defineComponent } from "@bootstrapp/view";
import { t } from "@bootstrapp/i18n";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "pt-BR", label: "Português (BR)" },
];
const CURRENCIES = ["BRL", "USD", "EUR", "GBP"];

export default defineComponent({
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
          <uix-segmented
            .options=${LANGUAGES.map((l) => ({ value: l.id, label: l.label }))}
            .value=${current}
            @change=${(e) => this._setLanguage(e.detail.value)}></uix-segmented>
        </div>

        <div class="flex flex-col gap-3 rounded-panel bg-surface p-4 shadow-sm">
          <h2 class="text-sm font-bold uppercase tracking-wide text-muted">${t("settings.displayCurrency")}</h2>
          <uix-segmented
            .options=${CURRENCIES}
            .value=${this.displayCurrency}
            @change=${(e) => (this.displayCurrency = e.detail.value)}></uix-segmented>
        </div>

        <div class="flex flex-col gap-2 rounded-panel bg-surface p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold uppercase tracking-wide text-muted">${t("settings.rates")}</h2>
            <uix-button ghost size="sm" icon="refresh-cw" ?loading=${this.refreshing} @click=${() => this._refresh()}>${t("settings.refresh")}</uix-button>
          </div>
          ${info
            ? html`<p class="text-sm text-muted">
                ${t("settings.ratesUpdated")}: ${info.updatedAt || "—"}
                ${info.offline ? html`<uix-tag variant="warning" size="sm" class="ml-1">${t("settings.offline")}</uix-tag>` : ""}
              </p>`
            : ""}
        </div>

        <div class="flex items-center justify-between rounded-panel bg-surface p-4 shadow-sm">
          <h2 class="text-sm font-bold uppercase tracking-wide text-muted">Dark mode</h2>
          <uix-darkmode></uix-darkmode>
        </div>
      </div>`;
  },
});
