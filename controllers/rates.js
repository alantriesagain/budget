import { defineController } from "@bootstrapp/controller";
import { resource } from "@bootstrapp/controller/resource.js";
import { convertAmount } from "../lib/money.js";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

const API_URL = "https://open.er-api.com/v6/latest/USD";
const SNAPSHOT_URL = "/assets/rates.json";

const fetchJson = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);

export default defineController({
  name: "rates",
  adapter: true,
  properties: {
    displayCurrency: T.string({ defaultValue: "BRL", sync: "local" }),
  },

  connected() {
    this._table = resource(
      async () => {
        const live = await fetchJson(API_URL);
        if (live?.rates)
          return { base: live.base_code || "USD", rates: live.rates, updatedAt: live.time_last_update_utc || "", offline: false };
        const snapshot = await fetchJson(SNAPSHOT_URL);
        if (snapshot?.rates) return { ...snapshot, offline: true };
        return { base: "USD", rates: { USD: 1 }, updatedAt: "", offline: true };
      },
      { name: "rates", ready: false },
    );
  },

  teardown() {
    this._table?.dispose();
  },

  /** Load the rate table once (deduped): live API first, bundled snapshot offline. */
  ensure() {
    return this._table.ensure();
  },

  /** Refetch now; the old table stays until the new answer lands. */
  refresh() {
    return this._table.refresh();
  },

  /** { base, updatedAt, offline } of whatever table is loaded, or null before the first load. */
  info() {
    return this._table.peek() ?? null;
  },

  /** Convert between currencies through the loaded table; null when unknown. */
  async convert(amount, from, to) {
    return convertAmount(amount, from, to, await this.ensure());
  },

  /**
   * A synchronous converter into the display currency, for hot loops:
   * `const display = await rates.displayer(); display(amount, currency)`.
   * Unknown currencies pass through unconverted.
   */
  async displayer(to = this.displayCurrency) {
    const table = await this.ensure();
    return (amount, from = to) => convertAmount(amount, from, to, table) ?? amount;
  },
});
