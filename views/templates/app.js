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
        <div class="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-3">
          <a href=${$APP.Router.href("/")} class="flex items-center gap-2 font-black text-lg tracking-tight text-default no-underline">
            <uix-icon name="coins" size="20" class="text-primary"></uix-icon>
            <span>centavo</span>
          </a>
          <nav class="ml-auto flex items-center gap-1 overflow-x-auto">
            ${NAV.map(
              (item) => html`
                <a href=${$APP.Router.href(item.path)}
                  class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold no-underline transition-colors ${path === item.path ? "bg-primary/10 text-primary" : "text-secondary hover:bg-hover"}">
                  <uix-icon name=${item.icon} size="16"></uix-icon>
                  <span class="hidden sm:inline">${t(`nav.${item.key}`)}</span>
                </a>
              `,
            )}
          </nav>
        </div>
      </header>
      <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">${this.component}</main>
    `;
  },
};
