# Friction log

Every rough edge met while building centavo strictly by the book, written down
as it happens. Each entry names the friction, what we did about it, and what the
framework should do about it. An entry is CLOSED when the framework fix lands.

## 1. `new:app` could only scaffold into `projects/` — CLOSED

The scaffolder hard-coded `projects/` as the target parent, so an example app
had nowhere to be born. Fixed inline: `new:app --dir examples` (any workspace
glob), and `examples/*` joined `pnpm-workspace.yaml`. The error message and the
"next" hints follow the chosen dir now.

## 2. The root `npm run examples` script pointed at a path that never existed

`node cli/bin/bootstrapp.js serve .` — there is no `cli/` at the repo root; the
CLI lives at `packages/cli/bin/`. Nobody noticed because nobody ran it. Fixed to
serve this app. Lesson for the framework: scripts that no test executes rot
silently; anything advertised in the README should be exercised by something.

## 3. A new controller file needs a dev-server restart

`controllers.d.ts` regenerates the moment a controller file changes, but the
MANIFEST's `controllers.frontend` list — what actually registers them at boot —
is only built at serve start. Adding `controllers/ledger.js` while the server
ran left `$APP.ledger` undefined until a restart. The typings watcher already
knows the trigger; the manifest should regenerate (and the page reload) on the
same event.

## 4. `Model.add`/`Model.edit` answer `[error, row]`; everything else answers the value

`get` and `getAll` resolve rows directly, but `add` and `edit` resolve a
`[error, row]` tuple — and the root CLAUDE.md's Model examples
(`await $APP.Model.users.add({...})`) never mention it. Nobody had noticed
because every existing caller was fire-and-forget. An app that wants the
created row (for its id) must know the secret handshake. Either the docs teach
the tuple, or add/edit should throw and resolve the row like their siblings.
centavo's ledger unwraps at the controller so views never see it.

## 5. `order: "-date"` never sorted anything, anywhere — CLOSED

The biggest one. `parseOrder` only understood the SQL-ish "date desc" form,
while the whole codebase — including the root CLAUDE.md's own examples and the
scaffold template — writes the "-date" prefix form. That parsed as a field
literally named "-date", undefined on every row, so the comparator always
answered 0 and every such query returned INSERTION order. It looked sorted for
years because insertion order correlates with createdAt; centavo's ledger test,
asserting strict descending dates over seeds inserted month-by-month, was the
first caller that could tell the difference. Fixed in query-builder with
regression tests; every "-field" order in every app now actually sorts.

## 6. A prod SPA silently drops any component not hand-listed in `bundle.components`

Dev auto-loads every view by tag convention, so the app looks complete right up
until the production build — where the shell itself (`template-app`) failed to
upgrade because nobody had enumerated it. gymfluencer documents this as a known
footgun ("a tag missing from that list never upgrades in prod, which dev never
shows you"); the scaffold doesn't generate the list, and nothing checks it
stays complete. The build already scans `views/` for the typings generator —
the SPA bundler could derive the same list, or `bootstrapp check` could diff
`bundle.components` against the views directory. It compounds: the list must
also carry every uix tag the views use AND the tags those components render
internally (uix-darkmode needs uix-switch) — three build-verify loops to get
one small app complete.

## 7. The scaffold shipped no .gitignore — CLOSED

centavo's first commits quietly included its generated `.bootstrapp/*.d.ts`
artifacts because `new:app` created no `.gitignore` and the root one only
covered `projects/**` and `packages/**`. Both real projects carry the same
six-line ignore file by hand — that is the definition of a scaffold gap. Fixed:
the template ships `gitignore.tpl` (copyTemplate renames it, since npm mangles
literal .gitignore files inside packages), and the root ignore learned
`examples/**`.

## 8. Two conventions for one singleton — CLOSED

Half the codebase read `const { T } = globalThis.$APP` while the other half
imported T; $APP itself was a global read everywhere because the "bootstrapp"
specifier only existed inside the prod bundler. Now both are real imports in
all four runtimes (a workspace package carries the name for Node), the schema
rule requires the T import, and the repo-wide sweep converted ~750 files. The
hunt also surfaced that projects/bootstrapp had silently owned the package
name "bootstrapp" — pnpm was handing out a personal app as a dependency.

## 9. Three apps wrote three page() helpers for the same missing defaults — CLOSED

Every project's controllers/index.js began with a page() wrapper whose only
job was injecting template/ssg into each route — three copies, three shapes,
plus one app repeating template: seventeen times and another whose
localization call had been dead code for months (an option name the wrapper
never read). defineRoutes(routes, defaults?) owns the defaults now, routes.js
is auto-loaded like every other citizen, late registration warns instead of
silently never matching, and Router.go() autocompletes the declared names.
