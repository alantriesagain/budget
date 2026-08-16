# centavo

A small personal-finance app — the [Bootstrapp](https://github.com/meiraleal/index.html) framework's intermediate showcase. Readable in one sitting, using each core feature exactly once: models over indexed queries, controllers owning every write and derived number, `resource()` against a live exchange-rate API with an offline fallback, i18n in English and Brazilian Portuguese, CSV import that reads real bank exports, and its own browser test suite.

Track your accounts, transactions and monthly budgets; import your bank's CSV; switch language and display currency and watch every amount re-render through `Intl`.

## Running it

centavo lives inside the Bootstrapp monorepo (`examples/centavo`) and resolves the framework through workspace links, so it runs from a framework checkout:

```bash
git clone <bootstrapp-repo>
cd bootstrapp && pnpm install
npm run examples          # serves centavo on :3520
```

Inside the app dir: `npm test` runs the node lib tests and the browser suite (which boots the real app in an iframe), `npx bootstrapp check` runs the convention checker, `npx bootstrapp build --spa` produces the deployable build.

**This standalone repository is a published mirror** of the monorepo directory, split with `git subtree` — its history is real, but the framework packages are not vendored here. Clone the monorepo to run it.

## Why it exists

Beyond being an example, centavo is the framework's DX-evaluation ground: it was built strictly by the book, and every rough edge met along the way is recorded in [`FRICTION.md`](./FRICTION.md) — several entries are already closed by framework fixes the app itself provoked, including an ordering bug that had silently affected every query in every app.

The layering is the house MVC: `lib/` pure and node-tested, `controllers/` state and IO, `views/` render and dispatch. `CLAUDE.md` records the project conventions.
