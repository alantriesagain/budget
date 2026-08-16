import { html } from "@bootstrapp/html";
import { t } from "@bootstrapp/i18n";
import $APP from "bootstrapp";
import T from "@bootstrapp/types";

const NAV = [
  { path: "/", key: "dashboard", icon: "layout-dashboard" },
  { path: "/transactions", key: "transactions", icon: "list" },
  { path: "/budgets", key: "budgets", icon: "piggy-bank" },
  { path: "/import", key: "import", icon: "upload" },
  { path: "/accounts", key: "accounts", icon: "wallet" },
  { path: "/settings", key: "settings", icon: "settings" },
];

export default {
  tag: "template-app",
  class: "flex flex-1 flex-col min-h-screen",
  properties: {
    component: T.object(),
    currentRoute: T.object({ sync: $APP.Router }),
  },
  render() {
    const path = $APP.Router.normalizePath(globalThis.location?.pathname || "/");
    return html`
      <header class="sticky top-0 z-40 border-b border-dim bg-surface/90 backdrop-blur">
        <div class="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
          <uix-link href="/" icon="coins" class="font-black text-lg tracking-tight text-default">
            <span>centavo</span>
          </uix-link>
          <nav class="ml-auto flex flex-wrap items-center justify-end gap-1">
            ${NAV.map(
              (item) => html`
                <uix-link
                  href=${item.path}
                  icon=${item.icon}
                  icon-size="sm"
                  class="rounded-lg transition-colors ${path === item.path ? "bg-primary/10 text-primary" : "text-secondary hover:bg-hover"}">
                  <span class="hidden sm:inline">${t(`nav.${item.key}`)}</span>
                </uix-link>
              `,
            )}
          </nav>
        </div>
      </header>
      <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">${this.component}</main>
    `;
  },
};
