import { defineController } from "@bootstrapp/controller";
import { currentMonth, monthRange } from "../lib/money.js";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

export default defineController({
  name: "ledger",
  adapter: true,
  properties: {
    month: T.string({ defaultValue: currentMonth() }),
  },

  /** Every transaction of a month, newest first, via the indexed date range. */
  monthTransactions(month = this.month) {
    return $APP.Model.transaction.getAll({
      where: { date: { ">=": `${month}-01`, "<=": `${month}-31` } },
      order: "-date",
    });
  },

  /**
   * The month's derived numbers in the display currency: income, expenses,
   * net, and per-category expense totals (largest first). Foreign-currency
   * rows convert through the rates controller.
   */
  async monthSummary(month = this.month) {
    const rows = await this.monthTransactions(month);
    const display = await $APP.rates.get().displayer();
    let income = 0;
    let expenses = 0;
    const byCategory = {};
    for (const row of rows) {
      const amount = display(row.amount, row.currency);
      if (amount >= 0) income += amount;
      else {
        expenses += -amount;
        byCategory[row.category] = (byCategory[row.category] || 0) + -amount;
      }
    }
    const categories = Object.entries(byCategory)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
    return { month, income, expenses, net: income - expenses, categories, count: rows.length };
  },

  /** Expense totals for the last `count` months ending at `month`, oldest first. */
  async spendSeries(count = 6, month = this.month) {
    const months = monthRange(month, count);
    const display = await $APP.rates.get().displayer();
    const rows = await $APP.Model.transaction.getAll({
      where: { date: { ">=": `${months[0]}-01`, "<=": `${months[months.length - 1]}-31` } },
      fields: ["amount", "currency", "date"],
    });
    const totals = Object.fromEntries(months.map((m) => [m, 0]));
    for (const row of rows) {
      const key = String(row.date).slice(0, 7);
      if (row.amount < 0 && key in totals) totals[key] += -display(row.amount, row.currency);
    }
    return months.map((m) => ({ month: m, total: Math.abs(totals[m]) }));
  },

  /** Create a transaction; resolves the created row (Model.add's [error, row] unwrapped). */
  async add(draft) {
    const [error, row] = await $APP.Model.transaction.add({ ...draft, date: draft.date || new Date().toISOString().slice(0, 10) });
    if (error) throw new Error(String(error?.message || error));
    return row;
  },

  async edit(patch) {
    const [error, row] = await $APP.Model.transaction.edit(patch);
    if (error) throw new Error(String(error?.message || error));
    return row;
  },

  remove(id) {
    return $APP.Model.transaction.remove(id);
  },

  /** Batch-write imported drafts into one account. Returns how many landed. */
  async addMany(drafts, accountId, currency) {
    const rows = drafts.map((d) => ({ ...d, accountId, currency }));
    await $APP.Model.transaction.addMany(rows);
    return rows.length;
  },

  /** Per-account balance (sum of that account's rows, own currency). */
  async accountBalances() {
    const rows = await $APP.Model.transaction.getAll({ fields: ["accountId", "amount"] });
    const totals = {};
    for (const row of rows) totals[row.accountId] = (totals[row.accountId] || 0) + row.amount;
    return totals;
  },
});
