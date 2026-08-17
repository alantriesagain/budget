import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { bootApp, disposeApp, awaitModule } from "@bootstrapp/test/app.js";


const CSV = "data;valor;histórico\n01/03/2020;-1.234,56;Mercado do teste\n02/03/2020;2.000,00;Pagamento\nruim;10;lixo";

describe("centavo — importer controller", () => {
  let app;
  let importer;

  before(async () => {
    app = await bootApp("/settings");
    importer = await awaitModule(app.win, "importer");
  });

  after(async () => {
    const stray = await app.$APP.Model.transaction.getAll({ where: { date: { ">=": "2020-03-01", "<=": "2020-03-31" } } });
    for (const row of stray) await app.$APP.Model.transaction.remove(row.id);
    disposeApp(app);
  });

  describe("preview", () => {
    it("guesses the pt-BR mapping and reports the bad row", () => {
      const p = importer.preview(CSV);
      assert.deepEqual(p.mapping, { date: "data", amount: "valor", note: "histórico", category: null });
      assert.equal(p.drafts.length, 2);
      assert.equal(p.drafts[0].amount, -1234.56);
      assert.equal(p.skipped.length, 1);
    });

    it("honors a mapping override", () => {
      const p = importer.preview("d;v\n2020-03-05;-9,99", { date: "d", amount: "v" });
      assert.equal(p.drafts.length, 1);
      assert.equal(p.drafts[0].amount, -9.99);
    });
  });

  describe("commit", () => {
    it("writes the drafts into the account with its currency", async () => {
      const p = importer.preview(CSV);
      const count = await importer.commit(p.drafts, "seed-checking");
      assert.equal(count, 2);
      const rows = await app.$APP.Model.transaction.getAll({ where: { date: { ">=": "2020-03-01", "<=": "2020-03-31" } } });
      assert.equal(rows.length, 2);
      for (const row of rows) {
        assert.equal(row.accountId, "seed-checking");
        assert.equal(row.currency, "BRL");
      }
    });
  });
});
