import { defineController } from "@bootstrapp/controller";
import { currentMonth, monthRange } from "../lib/money.js";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

/** @import { MonthSummary, SpendPoint, TransactionDraft } from "../types.ts" */

/** @param {unknown} error */
const errorMessage = (error) => (error instanceof Error ? error.message : String(error));

export default defineController({
  name: "ledger",
  adapter: true,
  properties: {
    month: T.string({ defaultValue: currentMonth() }),
  },

  /**
   * Every transaction of a month, newest first, via the indexed date range.
   * @param {string} [monthArg]
   */
  monthTransactions(monthArg) {
    const month = monthArg ?? this.month;
    return $APP.Model.transaction.getAll({
      where: { date: { ">=": `${month}-01`, "<=": `${month}-31` } },
      order: "-date",
    });
  },

  /**
   * The month's derived numbers in the display currency: income, expenses,
   * net, and per-category expense totals (largest first). Foreign-currency
   * rows convert through the rates controller.
   * @param {string} [monthArg]
   * @returns {Promise<MonthSummary>}
   */
  async monthSummary(monthArg) {
    const month = monthArg ?? this.month;
    const rows = await this.monthTransactions(month);
    const display = await $APP.rates.get().displayer();
    let income = 0;
    let expenses = 0;
    /** @type {Record<string, number>} */
    const byCategory = {};
    for (const row of rows) {
      const amount = display(row.amount, row.currency);
      if (amount >= 0) income += amount;
      else {
        expenses += -amount;
        const category = row.category ?? "other";
        byCategory[category] = (byCategory[category] || 0) + -amount;
      }
    }
    const categories = Object.entries(byCategory)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
    return { month, income, expenses, net: income - expenses, categories, count: rows.length };
  },

  /**
   * Expense totals for the last `count` months ending at `month`, oldest first.
   * @param {number} [count]
   * @param {string} [monthArg]
   * @returns {Promise<SpendPoint[]>}
   */
  async spendSeries(count = 6, monthArg) {
    const months = monthRange(monthArg ?? this.month, count);
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

  /**
   * Create a transaction; resolves the created row (Model.add's [error, row] unwrapped).
   * @param {TransactionDraft} draft
   */
  async add(draft) {
    const [error, row] = await $APP.Model.transaction.add({ ...draft, date: draft.date || new Date().toISOString().slice(0, 10) });
    if (error) throw new Error(errorMessage(error));
    return row;
  },

  /** @param {TransactionDraft & { id: string }} patch */
  async edit(patch) {
    const [error, row] = await $APP.Model.transaction.edit(patch);
    if (error) throw new Error(errorMessage(error));
    return row;
  },

  /** @param {string} id */
  remove(id) {
    return $APP.Model.transaction.remove(id);
  },

  /**
   * Batch-write imported drafts into one account. Returns how many landed.
   * @param {TransactionDraft[]} drafts
   * @param {string} accountId
   * @param {string} currency
   */
  async addMany(drafts, accountId, currency) {
    const rows = drafts.map((d) => ({ ...d, accountId, currency }));
    await $APP.Model.transaction.addMany(rows);
    return rows.length;
  },

  /**
   * Per-account balance (sum of that account's rows, own currency).
   * @returns {Promise<Record<string, number>>}
   */
  async accountBalances() {
    const rows = await $APP.Model.transaction.getAll({ fields: ["accountId", "amount"] });
    /** @type {Record<string, number>} */
    const totals = {};
    for (const row of rows) {
      const accountId = row.accountId ?? "";
      totals[accountId] = (totals[accountId] || 0) + row.amount;
    }
    return totals;
  },
});
