import { defineController } from "@bootstrapp/controller";
import $APP from "bootstrapp";

const idOf = (month, category) => `${month}:${category}`;

export default defineController({
  name: "budgets",

  monthBudgets(month) {
    return $APP.Model.budget.getAll({ where: { month } });
  },

  /** Create or update the one budget row for a category-month. */
  async setLimit(month, category, limit) {
    const id = idOf(month, category);
    const existing = await $APP.Model.budget.get(id);
    if (existing) return $APP.Model.budget.edit({ id, limit });
    return $APP.Model.budget.add({ id, month, category, limit });
  },

  removeLimit(month, category) {
    return $APP.Model.budget.remove(idOf(month, category));
  },

  /**
   * Budgets joined with the month's actual spending: [{ category, limit,
   * spent, ratio }], budgeted categories first (over-ratio first), then
   * unbudgeted spending appended with limit 0.
   */
  async progress(month) {
    const [rows, summary] = await Promise.all([
      this.monthBudgets(month),
      $APP.ledger.get().monthSummary(month),
    ]);
    const spentBy = Object.fromEntries(summary.categories.map((c) => [c.category, c.total]));
    const budgeted = rows
      .map((b) => {
        const spent = spentBy[b.category] || 0;
        return { category: b.category, limit: b.limit, spent, ratio: b.limit > 0 ? spent / b.limit : 0 };
      })
      .sort((a, b) => b.ratio - a.ratio);
    const covered = new Set(rows.map((b) => b.category));
    const unbudgeted = summary.categories
      .filter((c) => !covered.has(c.category))
      .map((c) => ({ category: c.category, limit: 0, spent: c.total, ratio: 0 }));
    return [...budgeted, ...unbudgeted];
  },
});
