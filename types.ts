/**
 * centavo's own type surface: the shapes the app computes and passes around.
 * Model rows are NOT declared here — they are generated from
 * `models/schema.js` into `.bootstrapp/schemas.d.ts` and re-exported below, so
 * a schema edit updates the app's types with no second place to keep in step.
 */

import type { RowInstance } from "@bootstrapp/model";
import type { TypeDefinition } from "@bootstrapp/types";

export type { AccountRecord, BudgetRecord, TransactionRecord } from "./.bootstrapp/schemas.js";

/**
 * The declared type of a reactive property. `T.array()`/`T.object()` alone
 * infer `unknown[]`/`unknown`, so a view that renders rows says what they are
 * by casting the descriptor:
 * `rows: /* @type {Prop<Row<TransactionRecord>[]>} *\/ (T.array({ defaultValue: [] }))`.
 */
export type Prop<V> = TypeDefinition<V>;

/** A model row as it comes back from a query: the declared fields plus `id` and the row methods. */
export type Row<T> = T & RowInstance;

/** A locale the app ships translations for. */
export type Locale = "en" | "pt-BR";

/** A transaction being edited: a partial row plus the id when it already exists. */
export type TransactionDraft = {
  id?: string;
  date?: string;
  amount?: number;
  currency?: string;
  accountId?: string;
  category?: string;
  note?: string;
};

/** CSV text parsed into lowercased headers and header-keyed rows. */
export type ParsedCsv = {
  headers: string[];
  rows: Array<Record<string, string>>;
};

/** Which parsed header feeds each transaction field; null when nothing matched. */
export type CsvMapping = {
  date: string | null;
  amount: string | null;
  note: string | null;
  category: string | null;
};

/** A row the importer refused, with what it could not read. */
export type SkippedRow = {
  row: Record<string, string>;
  reason: "date" | "amount";
};

/** A draft the importer produced: date and amount are what it refuses rows for. */
export type ImportedTransaction = TransactionDraft & { date: string; amount: number };

export type ImportResult = {
  drafts: ImportedTransaction[];
  skipped: SkippedRow[];
};

/** One category's expense total for a month, in the display currency. */
export type CategoryTotal = {
  category: string;
  total: number;
};

/** A month's derived numbers, all converted to the display currency. */
export type MonthSummary = {
  month: string;
  income: number;
  expenses: number;
  net: number;
  categories: CategoryTotal[];
  count: number;
};

/** One point of the spend-per-month series. */
export type SpendPoint = {
  month: string;
  total: number;
};

/** A category's budget for a month joined with what was actually spent. */
export type BudgetProgress = {
  category: string;
  limit: number;
  spent: number;
  ratio: number;
};

/** A base-keyed exchange-rate table, live or from the bundled snapshot. */
export type RateTable = {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
  offline: boolean;
};
