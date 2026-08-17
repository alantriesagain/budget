# centavo (examples/centavo)

A small personal-finance app: the framework's intermediate showcase

Built on the Bootstrapp framework. Read the repo-root `CLAUDE.md` for framework rules (runtimes, `$APP`, T.* types, model API, events, build modes). This file records THIS project's conventions — follow them for every change.

## NO COMMENTS

Never write comments in code: no `//`, no `/* */`, no `<!-- -->` inside lit templates. Lint strips them; code must be self-documenting. The only exception is a `/** JSDoc */` block on a genuine public API.

## uix first

Before writing any new `cv-*` component, check `packages/uix` for an existing component and compose it. List every available tag:

```bash
grep -rhoE 'tag:\s*"uix-[a-z-]+"' packages/uix
```

`cv-*` views are thin logic wrappers around uix components (`uix-button`, `uix-input`, `uix-icon`, `uix-empty-state`, `uix-modal`, `uix-form`, ...) — never hand-roll a button, input, modal, or list chrome. Restyle uix via `theme.js` (`uix.button`, `uix.input`, ... var blocks), not by wrapping in custom CSS. New lucide icons MUST be added to `package.json` → `bootstrapp.bundle.icons` or they 404 in prod.

## Styling: tailwind

This project uses **theme-token utility classes inline in templates** (recorded at `bootstrapp.generator.styling`), compiled by `@bootstrapp/tw` — the framework's own atomic-CSS engine (Tailwind grammar, no unocss).

- Style with utility classes directly in html templates; no `style: true`, no `.css` siblings.
- ONLY theme-token utilities: `bg-primary`, `bg-canvas`, `bg-surface`, `text-default`, `text-muted`, `border-dim`, plus spacing/radius scales (`p-4`, `gap-2`, `rounded-lg`). These resolve to `theme.js` CSS variables. Theme `shadow.*` and `radius.*` groups are utilities too (`shadow-card`, `rounded-pill`), and every declared colour has an `on-` companion (`text-on-hero`).
- Raw palette classes (`bg-blue-500`, `text-gray-600`) have NO CSS unless `bootstrapp.tw.palette: true` is set — and even then prefer tokens; if a color is missing, add it to `theme.js`.
- Keep every class list a static string literal — the prod class extractor misses concatenated/computed names. A class only composed at runtime goes in `bootstrapp.tw.safelist`.
- A utility-shaped class the engine doesn't know is reported by `bootstrapp check` (`tw/unknown-class`) and by a dev-console warning — an unknown class ships without CSS.

All styling flows through `theme.js` — the single source of every color, size, radius, and shadow. Never hardcode palette values in views. After editing `theme.js`, run `npx bootstrapp theme:check` to verify the token contract; use the `/restyle-theme` skill for a full visual restyle.

## Component pattern

Views are plain object literals, auto-loaded by tag convention: drop `views/<name>.js` and use `<cv-<name>>` anywhere — never import or register a view manually (the loader resolves the tag prefix via `bootstrapp.components`).

```js
import { html } from "@bootstrapp/html";

import T from "@bootstrapp/types";

export default {
  tag: "cv-example",
  properties: {
    count: T.number({ defaultValue: 0 }),
  },
  render() {
    return html`<uix-button primary @click=${() => this.count++}>${this.count}</uix-button>`;
  },
};
```

- `T.*` properties are reactive render state — mutate them (`this.count++`), never keep `_vars` + manual update calls. Persist small local state with `T.*({ sync: "local" })`, not localStorage.
- **This app opts into `defineComponent`** (the framework default is the plain object literal; `defineComponent` is the typed form). It is a runtime identity wrapper — the auto-loader and bundler see the same definition — and it types `this` inside `render()` and the lifecycle from the `properties` block. centavo is the framework's typed-app exemplar, so every view uses it.
- `views/transactions.js` + `controllers/ledger.js` are the exemplar pair: the view renders and dispatches (`$APP.ledger.get().add(...)`), the controller owns every `$APP.Model` write and the derived state (month summaries, spend series). `sync: "ledger"` on the `month` property is the shared-selection showcase — three screens follow one month. Copy that split, not just the view.
- Scaffold a new view with `npx bootstrapp new:view <name>` (it follows this project's styling convention).

## Types (JSDoc + checkJs — this app is the exemplar)

`npm run typecheck` (from the repo root) must report **0 errors** for
`examples/centavo`. The conventions:

- **`types.ts` at the project root** holds the app's own shapes
  (`MonthSummary`, `BudgetProgress`, `CsvMapping`, …) and **re-exports the
  generated row types** from `.bootstrapp/schemas.js` — never redeclare a model
  row by hand; edit `models/schema.js` and the types follow.
- **`.js` files reference them with `@import`**:
  `/** @import { MonthSummary, Prop } from "../types.ts" */`, then plain
  `@param`/`@returns`/`@type`.
- **A view property that holds rows or a computed shape declares it** by
  casting the descriptor:
  `rows: /** @type {Prop<Row<TransactionRecord>[]>} */ (T.array({ defaultValue: [] }))`.
  Without the cast `T.array()` is `unknown[]` and `render()` cannot see the
  fields. `Prop` and `Row` are defined in `types.ts`.
- **A controller method that takes `this.<prop>` as a default** must read it in
  the body (`monthTransactions(monthArg) { const month = monthArg ?? this.month; … }`)
  — TypeScript cannot see `this` inside a parameter default.
- `lib/` is fully annotated: it is pure, so its types are the cheapest and most
  useful in the app.

## Data

Models live in `models/schema.js` (`import T from "@bootstrapp/types";`). Access via `$APP.Model.<name>.add/get/getAll/edit/remove`. Lists load declaratively:

```js
html`<cv-list .data-query=${{ model: "task", key: "tasks", order: "-createdAt" }}></cv-list>`
```

with `dataQuery: true` + a matching `tasks` property on the component — the list live-updates on any model change. Add a model with `npx bootstrapp new:model <name> --fields "a:string,b:boolean"`. After schema or package.json changes: `npx bootstrapp types`, then restart serve.

## Controllers

**Logic lives in controllers; views render and dispatch.** Every `$APP.Model` write,
every rule, every piece of state shared beyond one component goes in a
`defineController` file under `controllers/` — a component definition minus `render`
(`properties` with `T.*`, `connected`/`disconnected`, object-literal methods with
`this`). The scaffolded `controllers/tasks.js` is the live example: it owns
add/toggle/remove and the `filter` state; the home view binds `filter` with
`T.string({ sync: "tasks" })` (the controller declares `adapter: true`, so its name
is a late-bound sync target — property names must match, there is no alias) and calls
`$APP.tasks.get().toggle(task)` on click. Registration is automatic — every
`controllers/*.js` is discovered at boot, and the singleton is
created on first use (`.get()` or the first `sync:` bind). Routes live in the root
`routes.js` — `defineRoutes(routes, { template: "template-app" })`, auto-loaded.
`npx bootstrapp new:controller <name> --properties "count:number"`. Never keep
shared state on a view or in a module of `let` + setters — `bootstrapp check` flags
that shape.

## Adding capabilities

Need auth, maps, admin, i18n, notifications, storage, forms, AI...? Run:

```bash
npx bootstrapp packages:list
```

then read the chosen package's README, add `"@bootstrapp/<pkg>": "workspace:*"` to `dependencies` — PLUS every framework package it uses transitively (root rule: projects declare every `@bootstrapp/*` they use) — and `pnpm install` + restart serve. The `/add-package` skill walks this; `/add-i18n` covers i18n wiring.

## Commands

```bash
npx bootstrapp serve                 # dev on :3520 (first run generates .bootstrapp/*.d.ts)
npx bootstrapp types                 # regenerate typed Model APIs after schema changes
npx bootstrapp build --spa           # prod build (explicit bundle.components if a view only renders client-side)
npx bootstrapp new:view <name>       # scaffold a view
npx bootstrapp new:model <name> --fields "a:string"
npx bootstrapp theme:check           # validate theme.js token contract
npx bootstrapp check                 # convention checker — run before committing; also live in serve --watch
```

`check` enforces this file's conventions mechanically (`--list` shows the rule catalog). Fix errors, don't suppress them; a rule that's genuinely wrong for this project can be overridden in `package.json` → `bootstrapp.check.rules: { "<id>": "off" | "warn" | "error" }`. This project can ship its own rules in `check/rules/*.js`.

Run `npm run lint:fix` from the repo root before committing.

## What this app is for

centavo is the framework's intermediate showcase and DX-evaluation ground:
readable in one sitting, built strictly by the book, every feature used exactly
once. When something here feels awkward, it goes in `FRICTION.md` as it
happens — each entry is a framework fix candidate, and an entry closes when the
fix lands (two closed already; the `-date` order bug lived in every app until
this one caught it).

The layering mirrors the meetup-rio showcase at 1/10 size: `lib/` pure and
node-tested, `controllers/` state and IO
(`ledger`, `budgets`, `rates` — the `resource()` exemplar with live API +
snapshot fallback — and `importer`), `views/` render and dispatch. i18n is real
here: every string a `t()` key, money and dates through `lib/money.js` with the
active locale, en + pt-BR.

## Tests (three layers — this app is the exemplar)

Every test here is written against `node:test` + `node:assert/strict` — the
same API in both runtimes (see root CLAUDE.md "Testing"). `npm test` =
`bootstrapp test`, which runs BOTH partitions:

- **Unit** — `lib/{csv,money}.test.js`: pure functions, no `$APP`, no DOM.
- **Integration** — `tests/app-*.browser.test.js`: one per controller, booting
  the real app in an iframe via `@bootstrapp/test/app.js` (`bootApp`,
  `awaitModule`, `wipe`). The `.browser.` in the name is what sends the file to
  Chromium; a file without it goes to `node --test`.
- **E2e** — `tests/e2e/*.e2e.js`: journeys that click through the BUILT app
  (`npx bootstrapp build --spa --seed` then `npx bootstrapp test --e2e`), served
  under this project's `/budget` base path exactly as GitHub Pages serves it.
  `navigation` proves every top-nav link is a SPA transition (a page marker
  survives), `transaction` adds one through the form and sees the dashboard
  move, `locale` switches to pt-BR and navigates away. Each ends with
  `assert.deepEqual(app.errors, [])` — page errors and same-origin 404s fail the
  journey.

New feature ⇒ its test in the same commit; new controller ⇒ its
`tests/app-<name>.browser.test.js` (`bootstrapp check` warns otherwise).

## Standalone mirror

This directory is also published as its own repository via git subtree:
`npm run examples:split` (from the repo root) refreshes the `centavo-standalone`
branch — centavo's history with paths rooted at `/` — and
`git push <centavo-remote> centavo-standalone:main` publishes it. The monorepo
stays the source of truth; never commit to the standalone repo directly.
