import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, guessMapping, rowsToTransactions } from "./csv.js";

test("parseCsv sniffs commas and honors quotes", () => {
  const { headers, rows } = parseCsv('Date,Amount,Description\n2026-08-01,-42.50,"Lunch, downtown"\n2026-08-02,1000,Salary');
  assert.deepEqual(headers, ["date", "amount", "description"]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].description, "Lunch, downtown");
});

test("parseCsv sniffs semicolons (BR bank exports)", () => {
  const { headers, rows } = parseCsv("Data;Valor;Histórico\n15/08/2026;-1.234,56;Mercado");
  assert.deepEqual(headers, ["data", "valor", "histórico"]);
  assert.equal(rows[0].valor, "-1.234,56");
});

test("guessMapping finds pt-BR and en headers", () => {
  assert.deepEqual(guessMapping(["data", "valor", "histórico"]), {
    date: "data",
    amount: "valor",
    note: "histórico",
    category: null,
  });
  assert.equal(guessMapping(["date", "amount", "memo", "category"]).category, "category");
});

test("rowsToTransactions parses both date and amount dialects", () => {
  const { rows } = parseCsv("data;valor;histórico\n15/08/2026;-1.234,56;Mercado\n2026-08-16;R$ 25,00;Padaria\nbad;10;x");
  const mapping = guessMapping(["data", "valor", "histórico"]);
  const { drafts, skipped } = rowsToTransactions(rows, mapping);
  assert.equal(drafts.length, 2);
  assert.deepEqual(drafts[0], { date: "2026-08-15", amount: -1234.56, note: "Mercado", category: "other" });
  assert.equal(drafts[1].amount, 25);
  assert.equal(skipped.length, 1);
  assert.equal(skipped[0].reason, "date");
});

test("rowsToTransactions reads parenthesized negatives", () => {
  const { drafts } = rowsToTransactions([{ d: "2026-01-02", a: "(300.00)" }], { date: "d", amount: "a" });
  assert.equal(drafts[0].amount, -300);
});
