import { defineRoutes } from "@bootstrapp/router";
import { html } from "@bootstrapp/html";

export default defineRoutes({
  "/": { name: "dashboard", title: "centavo", component: () => html`<cv-dashboard></cv-dashboard>` },
  "/transactions": { name: "transactions", title: "Transactions", component: () => html`<cv-transactions></cv-transactions>` },
  "/budgets": { name: "budgets", title: "Budgets", component: () => html`<cv-budgets></cv-budgets>` },
  "/import": { name: "import", title: "Import", component: () => html`<cv-import></cv-import>` },
  "/accounts": { name: "accounts", title: "Accounts", component: () => html`<cv-accounts></cv-accounts>` },
  "/settings": { name: "settings", title: "Settings", component: () => html`<cv-settings></cv-settings>` },
}, { template: "template-app" });
