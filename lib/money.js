/** Format an amount in a currency for a locale ("-R$ 1.234,56" / "-$1,234.56"). */
export const formatMoney = (amount, currency = "BRL", locale = "en") =>
  new Intl.NumberFormat(locale === "pt-BR" ? "pt-BR" : "en-US", {
    style: "currency",
    currency,
  }).format(amount);

/** Format an ISO date (YYYY-MM-DD) for a locale, short form. */
export const formatDate = (iso, locale = "en") => {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : "en-US", {
    day: "numeric",
    month: "short",
  }).format(d);
};

/** "2026-08-15" -> "2026-08". */
export const monthKey = (iso) => String(iso || "").slice(0, 7);

/** The month key for today, or shifted by delta months. */
export const currentMonth = (delta = 0, now = new Date()) => {
  const d = new Date(now.getFullYear(), now.getMonth() + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** "2026-08" -> "August 2026" / "agosto de 2026". */
export const monthLabel = (month, locale = "en") => {
  const [y, m] = String(month).split("-").map(Number);
  if (!y || !m) return String(month);
  return new Intl.DateTimeFormat(locale === "pt-BR" ? "pt-BR" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, 1));
};

/** The last `count` month keys ending at `month`, oldest first. */
export const monthRange = (month, count) => {
  const [y, m] = String(month).split("-").map(Number);
  const out = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
};

/**
 * Convert through a base-keyed rate table ({ base: "USD", rates: { BRL: 5.4, ... } }).
 * Returns null when either currency is missing from the table.
 */
export const convertAmount = (amount, from, to, table) => {
  if (!table?.rates) return null;
  if (from === to) return amount;
  const rateOf = (code) => (code === table.base ? 1 : table.rates[code]);
  const fromRate = rateOf(from);
  const toRate = rateOf(to);
  if (!fromRate || !toRate) return null;
  return (amount / fromRate) * toRate;
};
