import { defineController } from "@bootstrapp/controller";
import $APP from "bootstrapp";

/** @import { BudgetProgress, BudgetRecord } from "../types.ts" */

/**
 * @param {string} month
 * @param {string} category
 */
const idOf = (month, category) => `${month}:${category}`;

export default defineController({
  name: "budgets",

  /**
   * @param {string} month
   * @returns {Promise<BudgetRecord[]>}
   */
  monthBudgets(month) {
    return $APP.Model.budget.getAll({ where: { month } });
  },

  /**
   * Create or update the one budget row for a category-month.
   * @param {string} month
   * @param {string} category
   * @param {number} limit
   */
  async setLimit(month, category, limit) {
    const id = idOf(month, category);
    const existing = await $APP.Model.budget.get(id);
    if (existing) return $APP.Model.budget.edit({ id, limit });
    return $APP.Model.budget.add({ id, month, category, limit });
  },

  /**
   * @param {string} month
   * @param {string} category
   */
  removeLimit(month, category) {
    return $APP.Model.budget.remove(idOf(month, category));
  },

  /**
   * Budgets joined with the month's actual spending: [{ category, limit,
   * spent, ratio }], budgeted categories first (over-ratio first), then
   * unbudgeted spending appended with limit 0.
   * @param {string} month
   * @returns {Promise<BudgetProgress[]>}
   */
  async progress(month) {
    const [rows, summary] = await Promise.all([
      this.monthBudgets(month),
      $APP.ledger.get().monthSummary(month),
    ]);
    /** @type {Record<string, number>} */
    const spentBy = Object.fromEntries(summary.categories.map((c) => [c.category, c.total]));
    const budgeted = rows
      .map((b) => {
        const category = b.category ?? "other";
        const limit = b.limit ?? 0;
        const spent = spentBy[category] || 0;
        return { category, limit, spent, ratio: limit > 0 ? spent / limit : 0 };
      })
      .sort((a, b) => b.ratio - a.ratio);
    const covered = new Set(rows.map((b) => b.category ?? "other"));
    const unbudgeted = summary.categories
      .filter((c) => !covered.has(c.category))
      .map((c) => ({ category: c.category, limit: 0, spent: c.total, ratio: 0 }));
    return [...budgeted, ...unbudgeted];
  },
});
