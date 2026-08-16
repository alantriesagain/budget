import { defineController } from "@bootstrapp/controller";
import { parseCsv, guessMapping, rowsToTransactions } from "../lib/csv.js";
import $APP from "bootstrapp";

/** @import { CsvMapping, ImportResult, TransactionDraft } from "../types.ts" */

export default defineController({
  name: "importer",

  /**
   * Parse pasted CSV into transaction drafts: sniffed delimiter, guessed
   * column mapping (overridable), and the rows that could not be read.
   * @param {string} text
   * @param {Partial<CsvMapping> | null} [mappingOverride]
   * @returns {{ headers: string[], mapping: CsvMapping } & ImportResult}
   */
  preview(text, mappingOverride = null) {
    const { headers, rows } = parseCsv(text);
    const mapping = { ...guessMapping(headers), ...(mappingOverride || {}) };
    const { drafts, skipped } = rowsToTransactions(rows, mapping);
    return { headers, mapping, drafts, skipped };
  },

  /**
   * Write the previewed drafts into an account; returns how many landed.
   * @param {TransactionDraft[]} drafts
   * @param {string} accountId
   */
  async commit(drafts, accountId) {
    const account = await $APP.Model.account.get(accountId);
    return $APP.ledger.get().addMany(drafts, accountId, account?.currency || "BRL");
  },
});
