# AGENTS.md — working in @burgwiss/ui

The single source of truth for how work is done here, for humans and coding
agents alike. Tool-specific files (CLAUDE.md) only point back here.

## What this is

The component library shared by every Burgwiss app (the Burgwiss school
platform and the other company apps). A fix here reaches every app on its next
update, so a component must work for **all** of them, not the page it was first
written for.

## Where a component goes — atomic design

| Level    | Folder           | It is…                                       | Examples                           |
| -------- | ---------------- | -------------------------------------------- | ---------------------------------- |
| Tokens   | `src/tokens/`    | a CSS variable: colour, radius, font         | `--primary`, `--radius`            |
| Atom     | `src/atoms/`     | one control, used as a whole                 | Button, IconButton, Input, Tooltip |
| Molecule | `src/molecules/` | a small widget: a few atoms working together | DropdownMenu, SearchField          |
| Organism | `src/organisms/` | a region of the screen                       | Table, GridActions, a nav bar      |
| Template | `src/templates/` | a page layout with slots, no data of its own | GridPage                           |
| Page     | `src/pages/`     | a PROTOTYPE of a whole page: example content | Video-Lektion                      |

Pages are **prototypes, not components**: a folder `src/pages/<Name>/` holds
only `<Name>.stories.tsx`, built from package components with German example
content, and is never exported — the app builds its real page. They exist to
try page designs quickly. Rules: `src/docs/Pages.mdx`; `tests/pages.test.ts`
enforces stories-only and not-exported.

The test for each level: an **atom** is something you would never want to use
half of (a button, even one with a tooltip). A **molecule** is a widget you
could name in one word but that has parts (a dropdown: trigger, list, items).
An **organism** is a region a page is laid out from (a nav bar, a table, a
toolbar). An atom may use another atom; nothing uses a higher level than
itself.

When unsure between two levels, pick the lower one; promote later.

Every component is a folder: `src/<level>/<Name>/`

```
<Name>.tsx           the component
<Name>.stories.tsx   at least one story — also its smoke + axe test
<Name>.test.tsx      behaviour tests (what it does, not how it looks)
index.ts             export * from './<Name>'
```

…and one line in `src/index.ts` under its level.

## The rules (ESLint enforces 1–3 and the no-`title` half of 4, the test suite proves ESLint does)

1. **No app inside.** No router (`@inertiajs/*`, `react-router`, ziggy), no
   translation system, no HTTP, no `@/` app aliases. Links and actions come in
   as `href` / `onClick` props; data comes in as props.
2. **No copy inside.** Every visible string is a prop — labels, placeholders,
   empty states, aria-labels. Each app brings its own language. (Stories may use
   example text.)
3. **Tokens, never colours.** `bg-primary`, not `bg-blue-500`. Text on a
   `bg-{tone}/NN` tint uses `text-{tone}-tint-foreground`.
4. **Every button can explain itself.** `Button` takes a `tooltip` (hover and
   keyboard focus). Icon-only buttons always have one — their `aria-label` is
   the tooltip. A disabled button gets one saying why. A text button gets one
   when the click does more than its word says; never repeat the label. Never
   the native `title`. Full guidance: `src/docs/Tooltips.mdx` (Storybook:
   Richtlinien → Tooltips).
5. **Accessible from line 1.** Keyboard reachable, labelled, AA contrast. Every
   story runs through axe in `npm test`; a violation fails the suite.
6. **Generic API.** Name props for what they mean in any app (`items`,
   `onSelect`), never for one app's domain (`courses`, `onEnrol`). If a prop
   only makes sense for one page, it belongs in that app.
7. **Breaking changes are deliberate.** Removing or renaming an export, a prop,
   or a CSS variable is a major version. Say so in the commit.

## Storybook for coding agents (MCP)

This Storybook serves an **MCP server** (`@storybook/addon-mcp`) and
**manifests** — a machine-readable index of every component, its props (with
JSDoc) and its stories. Agents should use them instead of guessing.

**Connect.** `.mcp.json` registers `burgwiss-ui-storybook` at
`${STORYBOOK_MCP_URL:-http://localhost:6006/mcp}`. Start Storybook with
`npm run dev`. On a box where Storybook listens elsewhere (the devbox binds the
Tailscale IP), export `STORYBOOK_MCP_URL=http://<host>:6006/mcp` first.

**When working on UI here, use the `burgwiss-ui-storybook` tools first:**

| Before / after                       | Tool                                                    |
| ------------------------------------ | ------------------------------------------------------- |
| Before building or using a component | `docs-list`, then `docs-show` — reuse what exists       |
| Before writing or changing a story   | `get-storybook-story-instructions`                      |
| Finding a component's stories        | `stories-find-by-component`                             |
| After any visual change              | `stories-preview` — put the returned URLs in your reply |
| After a change                       | `test-run` — the stories in real Chromium, axe included |
| Reviewing a branch                   | `stories-changed`                                       |

**Without a dev server** the manifests are also in the static build:
`/manifests/components.json` and `/manifests/docs.json` (e.g. on
ui.infra.burgwiss.com after `npm run storybook:publish`).

**Write for the manifest** (it is what agents read):

- A JSDoc block on every exported component whose FIRST sentence says what it is for — agents see only the start (`docs-list`); the `@summary` tag does not reach the manifest with our prop extractor. Then when to use it, and what to use instead.
  A JSDoc line on every prop that is not self-explanatory.
- One concept per story, named for the case (`Deaktiviert mit Grund`), with a
  JSDoc line saying why you would use it. No "SizesAndVariants" catch-alls.
- MDX that only renders a component (the theme sheets) carries
  `tags={['!manifest']}` — the manifest reads MDX source, not rendered output.

**Toolbars.** Sprache (de, en, ar — right-to-left —, tr; `.storybook/locale.tsx`),
Mode (light/dark) and Theme (the Burgwiss presets; `npm run themes:sync`
refreshes them from `../burgwiss`). A story that shows text uses
`useStoryText()` with one entry per language — German is the fallback — so the
Sprache dropdown can check overflow and right-to-left.

**Tags.** `prototype` on every Pages story (sidebar badge "Prototyp");
`new` / `deprecated` / `experimental` from storybook-addon-tag-badges when they
apply. `!manifest` keeps a story or MDX page out of the AI manifest.

**Accessibility debt.** Every story must pass axe (`a11y: { test: 'error' }`).
A known, tracked violation may set `parameters: { a11y: { test: 'todo' } }` on
that one story, with a comment naming the issue — never on a whole component.

**Two test projects.** `npm test` (jsdom, fast, in `npm run check`) and
`npm run test:browser` (every story in real Chromium via
`@storybook/addon-vitest` — catches real colour contrast, which jsdom cannot).
`npm run check:full` runs both.

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
