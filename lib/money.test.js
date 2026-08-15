import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMoney, monthKey, currentMonth, monthRange, convertAmount, monthLabel } from "./money.js";

test("formatMoney speaks both locales", () => {
  assert.equal(formatMoney(-1234.56, "USD", "en"), "-$1,234.56");
  const br = formatMoney(-1234.56, "BRL", "pt-BR");
  assert.ok(br.includes("1.234,56"));
  assert.ok(br.includes("R$"));
});

test("monthKey slices an ISO date", () => {
  assert.equal(monthKey("2026-08-15"), "2026-08");
  assert.equal(monthKey(""), "");
});

test("currentMonth shifts across year boundaries", () => {
  const jan = new Date(2026, 0, 15);
  assert.equal(currentMonth(0, jan), "2026-01");
  assert.equal(currentMonth(-1, jan), "2025-12");
  assert.equal(currentMonth(-13, jan), "2024-12");
});

test("monthRange walks oldest-first up to the anchor", () => {
  assert.deepEqual(monthRange("2026-02", 3), ["2025-12", "2026-01", "2026-02"]);
});

test("monthLabel localizes", () => {
  assert.equal(monthLabel("2026-08", "en"), "August 2026");
  assert.ok(monthLabel("2026-08", "pt-BR").includes("agosto"));
});

test("convertAmount routes through the base and refuses unknowns", () => {
  const table = { base: "USD", rates: { BRL: 5.0, EUR: 0.9 } };
  assert.equal(convertAmount(10, "USD", "BRL", table), 50);
  assert.equal(convertAmount(50, "BRL", "USD", table), 10);
  assert.equal(Math.round(convertAmount(50, "BRL", "EUR", table) * 100) / 100, 9);
  assert.equal(convertAmount(10, "USD", "USD", table), 10);
  assert.equal(convertAmount(10, "USD", "XYZ", table), null);
  assert.equal(convertAmount(10, "USD", "BRL", null), null);
});
