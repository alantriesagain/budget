import Testing from "@bootstrapp/test";
import { bootApp, disposeApp, awaitModule } from "@bootstrapp/test/app.js";

if (typeof document === "undefined") throw new Error("browser-only: needs a DOM");

const { describe, it, assert, beforeAll, afterAll } = Testing;

Testing.suite("centavo — ledger controller", () => {
  let app;
  let ledger;

  beforeAll(async () => {
    app = await bootApp("/settings");
    ledger = await awaitModule(app.win, "ledger");
  });

  afterAll(() => disposeApp(app));

  describe("month queries", () => {
    it("reads the current month through the indexed range, newest first", async () => {
      const rows = await ledger.monthTransactions();
      assert.equal(rows.length > 0, true);
      for (const row of rows) assert.equal(row.date.startsWith(ledger.month), true);
      const dates = rows.map((r) => r.date);
      for (let i = 1; i < dates.length; i++) assert.equal(dates[i - 1] >= dates[i], true);
    });

    it("summarizes income, expenses, net and sorted categories", async () => {
      const s = await ledger.monthSummary();
      assert.equal(s.income > 0, true);
      assert.equal(s.expenses > 0, true);
      assert.equal(Math.round(s.net), Math.round(s.income - s.expenses));
      for (let i = 1; i < s.categories.length; i++)
        assert.equal(s.categories[i - 1].total >= s.categories[i].total, true);
    });

    it("spendSeries answers one positive total per month, oldest first", async () => {
      const series = await ledger.spendSeries(6);
      assert.equal(series.length, 6);
      assert.equal(series[series.length - 1].month, ledger.month);
      for (const point of series) assert.equal(point.total >= 0, true);
    });
  });

  describe("writes", () => {
    it("add lands in the month view and remove takes it back out", async () => {
      const date = `${ledger.month}-02`;
      const added = await ledger.add({ amount: -77.7, date, category: "leisure", note: "Ledger test", accountId: "seed-checking", currency: "BRL" });
      const rows = await ledger.monthTransactions();
      assert.equal(rows.some((r) => r.note === "Ledger test"), true);
      await ledger.remove(added.id);
      const after = await ledger.monthTransactions();
      assert.equal(after.some((r) => r.note === "Ledger test"), false);
    });

    it("edit changes the row in place", async () => {
      const added = await ledger.add({ amount: -10, date: `${ledger.month}-03`, category: "food", note: "Before", accountId: "seed-checking", currency: "BRL" });
      await ledger.edit({ id: added.id, note: "After" });
      const rows = await ledger.monthTransactions();
      assert.equal(rows.find((r) => r.id === added.id).note, "After");
      await ledger.remove(added.id);
    });
  });

  describe("currency conversion in summaries", () => {
    it("counts the USD freelance row converted, not at face value", async () => {
      const s = await ledger.monthSummary();
      const rates = await app.$APP.rates.get().ensure();
      const brl = rates.rates.BRL;
      assert.equal(brl > 1, true);
      assert.equal(s.income > 8500, true);
    });
  });
});
