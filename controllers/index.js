import { html } from "@bootstrapp/html";

const $APP = globalThis.$APP;

const page = (component, opts = {}) => ({ template: "template-app", ...opts, component });

$APP.mergeCollection($APP.routes, {
  "/": page(() => html`<cv-dashboard></cv-dashboard>`, { name: "dashboard", title: "centavo" }),
  "/transactions": page(() => html`<cv-transactions></cv-transactions>`, { name: "transactions", title: "Transactions" }),
  "/budgets": page(() => html`<cv-budgets></cv-budgets>`, { name: "budgets", title: "Budgets" }),
  "/import": page(() => html`<cv-import></cv-import>`, { name: "import", title: "Import" }),
  "/accounts": page(() => html`<cv-accounts></cv-accounts>`, { name: "accounts", title: "Accounts" }),
  "/settings": page(() => html`<cv-settings></cv-settings>`, { name: "settings", title: "Settings" }),
});
