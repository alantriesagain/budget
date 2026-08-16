import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { e2e } from "@bootstrapp/test/e2e.js";

let app;
let base;
before(async () => {
  app = await e2e();
  base = new URL(app.baseUrl).pathname.replace(/\/$/, "");
});
after(() => app.close());

test("dashboard renders and every top-nav route is a SPA transition", async () => {
  await app.goto("/");
  await app.page.waitForSelector("cv-dashboard uix-stat");
  await app.page.evaluate(() => { window.__nav = 1; });

  const routes = [
    ["/transactions", "cv-transactions"],
    ["/budgets", "cv-budgets"],
    ["/import", "cv-import"],
    ["/accounts", "cv-accounts"],
    ["/settings", "cv-settings"],
  ];
  for (const [path, tag] of routes) {
    await app.page.click(`header a[href="${base}${path}"]`);
    await app.page.waitForSelector(tag);
    assert.equal(new URL(app.page.url()).pathname, `${base}${path}`);
  }

  assert.equal(await app.page.evaluate(() => window.__nav), 1, "a full reload wiped the page marker");
  assert.deepEqual(app.errors, []);
});
