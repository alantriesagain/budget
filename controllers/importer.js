import { defineController } from "@bootstrapp/controller";
import { parseCsv, guessMapping, rowsToTransactions } from "../lib/csv.js";
import $APP from "bootstrapp";

export default defineController({
  name: "importer",

  /**
   * Parse pasted CSV into transaction drafts: sniffed delimiter, guessed
   * column mapping (overridable), and the rows that could not be read.
   */
  preview(text, mappingOverride = null) {
    const { headers, rows } = parseCsv(text);
    const mapping = { ...guessMapping(headers), ...(mappingOverride || {}) };
    const { drafts, skipped } = rowsToTransactions(rows, mapping);
    return { headers, mapping, drafts, skipped };
  },

  /** Write the previewed drafts into an account; returns how many landed. */
  async commit(drafts, accountId) {
    const account = await $APP.Model.account.get(accountId);
    return $APP.ledger.get().addMany(drafts, accountId, account?.currency || "BRL");
  },
});
