import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { bootApp, disposeApp, awaitModule } from "@bootstrapp/test/app.js";


describe("centavo — budgets controller", () => {
  let app;
  let budgets;
  let month;

  before(async () => {
    app = await bootApp("/settings");
    budgets = await awaitModule(app.win, "budgets");
    month = (await awaitModule(app.win, "ledger")).month;
  });

  after(() => disposeApp(app));

  describe("limits", () => {
    it("setLimit creates, then updates the same row", async () => {
      await budgets.setLimit(month, "health", 300);
      await budgets.setLimit(month, "health", 450);
      const rows = await budgets.monthBudgets(month);
      const health = rows.filter((b) => b.category === "health");
      assert.equal(health.length, 1);
      assert.equal(health[0].limit, 450);
      await budgets.removeLimit(month, "health");
    });
  });

  describe("progress", () => {
    it("joins limits with actuals, over-budget first, unbudgeted appended", async () => {
      const progress = await budgets.progress(month);
      assert.equal(progress.length > 0, true);
      const budgeted = progress.filter((p) => p.limit > 0);
      for (let i = 1; i < budgeted.length; i++)
        assert.equal(budgeted[i - 1].ratio >= budgeted[i].ratio, true);
      for (const p of progress.filter((x) => x.limit === 0)) assert.equal(p.spent > 0, true);
    });

    it("reflects a fresh limit against real spending", async () => {
      await budgets.setLimit(month, "housing", 1);
      const progress = await budgets.progress(month);
      const housing = progress.find((p) => p.category === "housing");
      assert.equal(housing.limit, 1);
      assert.equal(housing.ratio > 1, true);
      await budgets.removeLimit(month, "housing");
    });
  });
});
