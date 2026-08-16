import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { e2e } from "@bootstrapp/test/e2e.js";

let app;
before(async () => { app = await e2e(); });
after(() => app.close());

test("a transaction added through the form appears in the list and on the dashboard", async () => {
  await app.goto("/transactions");
  await app.page.waitForSelector("cv-transactions uix-list-row");

  await app.page.click('cv-transactions uix-button[icon="plus"]');
  await app.page.waitForSelector("cv-transaction-form form");
  await app.page.fill('uix-input[placeholder="0,00"] input', "123.45");
  await app.page.fill('uix-input[placeholder="Note"] input', "e2e coffee");
  await app.page.getByRole("button", { name: "Save" }).click();

  await app.page.waitForSelector('uix-list-row[label="e2e coffee"]');

  const base = new URL(app.baseUrl).pathname.replace(/\/$/, "");
  await app.page.click(`header a[href="${base}/"]`);
  await app.page.waitForSelector("cv-dashboard uix-stat");
  await app.page.waitForFunction(() =>
    /123[.,]45/.test(document.querySelector("cv-dashboard")?.textContent ?? ""));

  assert.deepEqual(app.errors, []);
});
