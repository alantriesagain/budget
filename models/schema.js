import T from "@bootstrapp/types";

export default {
  account: {
    name: T.string({ required: true }),
    kind: T.string({ defaultValue: "checking", enum: ["checking", "credit", "savings", "cash"] }),
    currency: T.string({ defaultValue: "BRL" }),
  },
  transaction: {
    accountId: T.belongs("account"),
    amount: T.number({ required: true }),
    currency: T.string({ defaultValue: "BRL" }),
    date: T.string({ index: true }),
    category: T.string({ index: true, defaultValue: "other" }),
    note: T.string({ defaultValue: "" }),
  },
  budget: {
    category: T.string({ index: true }),
    month: T.string({ index: true }),
    limit: T.number({ defaultValue: 0 }),
  },
};
