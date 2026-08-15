const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

let lcg = 42;
const rand = () => {
  lcg = (lcg * 1664525 + 1013904223) % 4294967296;
  return lcg / 4294967296;
};
const pick = (list) => list[Math.floor(rand() * list.length)];
const between = (min, max) => Math.round((min + rand() * (max - min)) * 100) / 100;

const account = [
  { id: "seed-checking", name: "Conta Corrente", kind: "checking", currency: "BRL" },
  { id: "seed-credit", name: "Cartão de Crédito", kind: "credit", currency: "BRL" },
  { id: "seed-savings", name: "Dollar Savings", kind: "savings", currency: "USD" },
];

const SPEND = [
  { category: "food", notes: ["Mercado", "Padaria", "Almoço", "Delivery", "Feira"], min: 12, max: 240, perMonth: 14 },
  { category: "transport", notes: ["Uber", "Metrô", "Combustível", "99"], min: 6, max: 120, perMonth: 8 },
  { category: "housing", notes: ["Aluguel", "Condomínio", "Luz", "Internet"], min: 80, max: 1800, perMonth: 3 },
  { category: "leisure", notes: ["Cinema", "Bar", "Show", "Streaming"], min: 20, max: 180, perMonth: 4 },
  { category: "health", notes: ["Farmácia", "Academia", "Consulta"], min: 25, max: 300, perMonth: 2 },
  { category: "shopping", notes: ["Roupas", "Eletrônicos", "Livraria"], min: 30, max: 450, perMonth: 3 },
];

const transaction = [];
const now = new Date();
for (let back = 5; back >= 0; back--) {
  const monthStart = new Date(now.getFullYear(), now.getMonth() - back, 1);
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const lastDay = back === 0 ? Math.max(2, now.getDate() - 1) : daysInMonth;
  transaction.push({
    id: `seed-salary-${monthOf(monthStart)}`,
    accountId: "seed-checking",
    amount: 8500,
    currency: "BRL",
    date: iso(new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(5, lastDay))),
    category: "salary",
    note: "Salário",
  });
  for (const kind of SPEND)
    for (let i = 0; i < kind.perMonth; i++) {
      const day = 1 + Math.floor(rand() * lastDay);
      transaction.push({
        id: `seed-${kind.category}-${monthOf(monthStart)}-${i}`,
        accountId: kind.category === "food" && rand() > 0.5 ? "seed-credit" : "seed-checking",
        amount: -between(kind.min, kind.max),
        currency: "BRL",
        date: iso(new Date(monthStart.getFullYear(), monthStart.getMonth(), day)),
        category: kind.category,
        note: pick(kind.notes),
      });
    }
  transaction.push({
    id: `seed-usd-${monthOf(monthStart)}`,
    accountId: "seed-savings",
    amount: between(100, 400),
    currency: "USD",
    date: iso(new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(20, lastDay))),
    category: "salary",
    note: "Freelance",
  });
}

const budgetMonths = [0, -1].map((delta) => {
  const d = new Date(now.getFullYear(), now.getMonth() + delta, 1);
  return monthOf(d);
});
const budget = budgetMonths.flatMap((month) => [
  { id: `seed-b-food-${month}`, category: "food", month, limit: 1600 },
  { id: `seed-b-transport-${month}`, category: "transport", month, limit: 500 },
  { id: `seed-b-leisure-${month}`, category: "leisure", month, limit: 450 },
  { id: `seed-b-shopping-${month}`, category: "shopping", month, limit: 700 },
]);

export default { account, transaction, budget };
