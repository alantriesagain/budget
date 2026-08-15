/**
 * The static category catalog. Labels come from i18n ("categories.<id>");
 * colors are theme tokens (cat-<id>), so no view ever names a hex value.
 */
export const CATEGORIES = [
  { id: "salary", icon: "banknote", income: true },
  { id: "food", icon: "utensils" },
  { id: "transport", icon: "bus" },
  { id: "housing", icon: "home" },
  { id: "leisure", icon: "party-popper" },
  { id: "health", icon: "heart-pulse" },
  { id: "shopping", icon: "shopping-bag" },
  { id: "other", icon: "circle-ellipsis" },
];

export const categoryById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

export const categoryIcon = (id) => categoryById[id]?.icon || "circle-ellipsis";

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => !c.income);
