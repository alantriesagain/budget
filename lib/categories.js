/**
 * The static category catalog. Labels come from i18n ("categories.<id>");
 * colors are theme tokens (cat-<id>), so no view ever names a hex value.
 */
export const CATEGORIES = [
  { id: "salary", icon: "banknote", income: true },
  { id: "food", icon: "utensils" },
  { id: "transport", icon: "bus" },
  { id: "housing", icon: "house" },
  { id: "leisure", icon: "party-popper" },
  { id: "health", icon: "heart-pulse" },
  { id: "shopping", icon: "shopping-bag" },
  { id: "other", icon: "circle-ellipsis" },
];

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const categoryIcon = (id) => categoryById[id]?.icon || "circle-ellipsis";

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => !c.income);

/**
 * How a budget's spend-to-limit ratio reads on a uix-progress-bar. The names
 * are uix's variant vocabulary, not free-form: anything outside its enum
 * renders as the default and the warning is silently lost.
 */
export const budgetTone = (ratio) =>
  ratio > 1 ? "danger" : ratio > 0.85 ? "warning" : "default";
