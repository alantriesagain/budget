import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { e2e } from "@bootstrapp/test/e2e.js";

let app;
before(async () => { app = await e2e(); });
after(() => app.close());

test("switching to pt-BR retranslates and survives navigation", async () => {
  await app.goto("/settings");
  await app.page.waitForSelector("cv-settings uix-segmented");

  await app.page.getByRole("radio", { name: "Português (BR)" }).click();
  await app.page.waitForSelector('cv-settings h1:has-text("Ajustes")');

  const base = new URL(app.baseUrl).pathname.replace(/\/$/, "");
  await app.page.click(`header a[href="${base}/transactions"]`);
  await app.page.waitForSelector("cv-transactions");
  await app.page.waitForSelector('cv-transactions uix-button:has-text("Nova transação")');

  assert.deepEqual(app.errors, []);
});
