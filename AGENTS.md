# AGENTS.md — working in @burgwiss/ui

The single source of truth for how work is done here, for humans and coding
agents alike. Tool-specific files (CLAUDE.md) only point back here.

## What this is

The component library shared by every Burgwiss app (the Burgwiss school
platform and the other company apps). A fix here reaches every app on its next
update, so a component must work for **all** of them, not the page it was first
written for.

## Where a component goes — atomic design

| Level    | Folder           | It is…                                       | Examples                         |
| -------- | ---------------- | -------------------------------------------- | -------------------------------- |
| Tokens   | `src/tokens/`    | a CSS variable: colour, radius, font         | `--primary`, `--radius`          |
| Atom     | `src/atoms/`     | one element; no other component inside       | Button, Input, Label             |
| Molecule | `src/molecules/` | a few atoms acting as ONE control            | IconButton, SearchField, Tooltip |
| Organism | `src/organisms/` | a self-contained section of molecules        | DropdownMenu, Table, GridActions |
| Template | `src/templates/` | a page layout with slots, no data of its own | GridPage                         |

There are no pages here. Pages know data, routes and copy — those belong to the app.

When unsure between two levels, pick the lower one; promote later.

Every component is a folder: `src/<level>/<Name>/`

```
<Name>.tsx           the component
<Name>.stories.tsx   at least one story — also its smoke + axe test
<Name>.test.tsx      behaviour tests (what it does, not how it looks)
index.ts             export * from './<Name>'
```

…and one line in `src/index.ts` under its level.

## The rules (ESLint enforces 1–3, the test suite proves ESLint does)

1. **No app inside.** No router (`@inertiajs/*`, `react-router`, ziggy), no
   translation system, no HTTP, no `@/` app aliases. Links and actions come in
   as `href` / `onClick` props; data comes in as props.
2. **No copy inside.** Every visible string is a prop — labels, placeholders,
   empty states, aria-labels. Each app brings its own language. (Stories may use
   example text.)
3. **Tokens, never colours.** `bg-primary`, not `bg-blue-500`. Text on a
   `bg-{tone}/NN` tint uses `text-{tone}-tint-foreground`. An icon-only control
   has an `aria-label` and a tooltip (use `IconButton`).
4. **Accessible from line 1.** Keyboard reachable, labelled, AA contrast. Every
   story runs through axe in `npm test`; a violation fails the suite.
5. **Generic API.** Name props for what they mean in any app (`items`,
   `onSelect`), never for one app's domain (`courses`, `onEnrol`). If a prop
   only makes sense for one page, it belongs in that app.
6. **Breaking changes are deliberate.** Removing or renaming an export, a prop,
   or a CSS variable is a major version. Say so in the commit.

## Verify before pushing

```bash
npm run check    # typecheck + lint + tests + build + Storybook build
```

After merging to `main`, publish Storybook: `npm run storybook:publish`.

## Moving a component over from an app

1. Copy it into its level folder; rewrite imports to relative paths.
2. Strip what rule 1 and 2 forbid — translated strings become props, `Link`
   becomes `href`/`onClick` or an `asChild` slot.
3. Bring its story and its tests.
4. In the app, keep the old import path alive as a re-export of the package, so
   no call site has to change in the same step.
