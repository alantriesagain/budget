import Testing from "@bootstrapp/test";
import { bootApp, disposeApp, awaitModule } from "./helpers/app.js";

if (typeof document === "undefined") throw new Error("browser-only: needs a DOM");

const { describe, it, assert, beforeAll, afterAll } = Testing;

Testing.suite("centavo — rates controller", () => {
  let app;
  let rates;

  beforeAll(async () => {
    app = await bootApp("/settings");
    rates = await awaitModule(app.win, "rates");
  });

  afterAll(() => disposeApp(app));

  describe("the table", () => {
    it("loads a table with a base and a BRL rate, live or snapshot", async () => {
      const table = await rates.ensure();
      assert.equal(typeof table.base, "string");
      assert.equal(table.rates.BRL > 1, true);
      assert.equal(typeof table.offline, "boolean");
    });

    it("info() mirrors what loaded", async () => {
      await rates.ensure();
      const info = rates.info();
      assert.equal(typeof info.offline, "boolean");
    });
  });

  describe("conversion", () => {
    it("converts through the base both ways", async () => {
      const table = await rates.ensure();
      const hundredUsdInBrl = await rates.convert(100, "USD", "BRL");
      assert.equal(Math.round(hundredUsdInBrl), Math.round(100 * table.rates.BRL / (table.rates.USD || 1)));
      const back = await rates.convert(hundredUsdInBrl, "BRL", "USD");
      assert.equal(Math.round(back), 100);
    });

    it("displayer passes unknown currencies through unconverted", async () => {
      const display = await rates.displayer("BRL");
      assert.equal(display(50, "XXX"), 50);
      assert.equal(typeof display(50, "USD"), "number");
    });
  });

  describe("the fallback snapshot", () => {
    it("is served, well-formed, and agrees on the base", async () => {
      const snapshot = await app.win.fetch("/assets/rates.json").then((r) => r.json());
      assert.equal(snapshot.base, "USD");
      assert.equal(snapshot.rates.BRL > 1, true);
    });
  });
});
