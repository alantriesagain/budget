import { html } from "@bootstrapp/html";
import { t } from "@bootstrapp/i18n";
import { formatMoney, monthLabel, currentMonth } from "../lib/money.js";
import { categoryIcon } from "../lib/categories.js";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

const stat = (label, value, tone) => html`
  <div class="rounded-panel bg-surface p-4 shadow-sm">
    <div class="text-xs font-semibold uppercase tracking-wide text-muted">${label}</div>
    <div class="mt-1 text-xl font-black tabular-nums ${tone}">${value}</div>
  </div>`;

export default {
  tag: "cv-dashboard",
  class: "block",
  properties: {
    month: T.string({ defaultValue: currentMonth(), sync: "ledger" }),
    summary: T.object(),
    series: T.array({ defaultValue: [] }),
    progress: T.array({ defaultValue: [] }),
    loaded: T.boolean({ defaultValue: false }),
  },
  async connected() {
    await this._load();
  },
  async _load() {
    const [summary, series, progress] = await Promise.all([
      $APP.ledger.get().monthSummary(this.month),
      $APP.ledger.get().spendSeries(6, this.month),
      $APP.budgets.get().progress(this.month),
    ]);
    this.summary = summary;
    this.series = series;
    this.progress = progress.filter((p) => p.limit > 0);
    this.loaded = true;
  },
  _shift(delta) {
    const [y, m] = this.month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    this.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    this._load();
  },
  render() {
    if (!this.loaded) return html`<uix-flex justify="center" class="py-16"><uix-spinner></uix-spinner></uix-flex>`;
    const s = this.summary;
    const locale = $APP.i18n?.getLanguage?.() || "en";
    const currency = $APP.rates.get().displayCurrency;
    const money = (v) => formatMoney(v, currency, locale);
    const maxCat = s.categories[0]?.total || 1;
    return html`
      <div class="flex flex-col gap-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-black tracking-tight capitalize">${monthLabel(this.month, locale)}</h1>
          <div class="flex gap-1">
            <uix-button ghost iconOnly icon="chevron-left" size="sm" aria-label="Previous month" @click=${() => this._shift(-1)}></uix-button>
            <uix-button ghost iconOnly icon="chevron-right" size="sm" aria-label="Next month" @click=${() => this._shift(1)}></uix-button>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          ${stat(t("dashboard.income"), money(s.income), "text-gain")}
          ${stat(t("dashboard.expenses"), money(-s.expenses), "text-spend")}
          ${stat(t("dashboard.net"), money(s.net), s.net >= 0 ? "text-gain" : "text-spend")}
        </div>

        ${s.count === 0 ? html`<p class="text-muted">${t("dashboard.empty")}</p>` : ""}

        <div class="rounded-panel bg-surface p-4 shadow-sm">
          <h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">${t("dashboard.lastMonths")}</h2>
          <uix-bar-chart .data=${this.series.map((p) => ({ label: p.month.slice(5), value: Math.round(p.total) }))} height="140"></uix-bar-chart>
        </div>

        <div class="rounded-panel bg-surface p-4 shadow-sm">
          <h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">${t("dashboard.byCategory")}</h2>
          <div class="flex flex-col gap-2.5">
            ${s.categories.map(
              (c) => html`
                <div class="flex items-center gap-3">
                  <uix-icon name=${categoryIcon(c.category)} size="16" class="shrink-0 text-secondary"></uix-icon>
                  <span class="w-28 shrink-0 text-sm font-semibold">${t(`categories.${c.category}`)}</span>
                  <div class="h-2 flex-1 overflow-hidden rounded-full bg-surface-dark">
                    <div class="h-full rounded-full bg-primary" style="width:${Math.round((c.total / maxCat) * 100)}%"></div>
                  </div>
                  <span class="w-24 shrink-0 text-right text-sm font-bold tabular-nums">${money(-c.total)}</span>
                </div>
              `,
            )}
          </div>
        </div>

        ${this.progress.length
          ? html`
              <div class="rounded-panel bg-surface p-4 shadow-sm">
                <h2 class="mb-3 text-sm font-bold uppercase tracking-wide text-muted">${t("dashboard.budgets")}</h2>
                <div class="flex flex-col gap-3">
                  ${this.progress.map(
                    (p) => html`
                      <div>
                        <div class="mb-1 flex items-baseline justify-between text-sm">
                          <span class="font-semibold">${t(`categories.${p.category}`)}</span>
                          <span class="tabular-nums ${p.ratio > 1 ? "font-bold text-spend" : "text-muted"}">${money(-p.spent)} / ${money(-p.limit)}</span>
                        </div>
                        <uix-progress-bar .value=${Math.min(100, p.ratio * 100)} variant=${p.ratio > 1 ? "error" : p.ratio > 0.85 ? "warning" : "primary"}></uix-progress-bar>
                      </div>
                    `,
                  )}
                </div>
              </div>
            `
          : ""}
      </div>`;
  },
};
