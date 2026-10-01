# @burgwiss/ui

The shared design system for every Burgwiss app — tokens, atoms, molecules,
organisms and templates, built on React 19, Radix and Tailwind CSS v4.

**Storybook:** https://ui.infra.burgwiss.com

## Use it in an app

No registry yet — install straight from GitHub, pinned to a tag. Each release
tag carries the built `dist/` (see Releases), so nothing is built on install —
which matters because Burgwiss runs npm with `ignore-scripts`:

```bash
npm install github:Burgwiss/ui#v0.2.0
```

```jsonc
// package.json
"dependencies": { "@burgwiss/ui": "github:Burgwiss/ui#v0.2.0" }
```

Peer dependencies the app must have: `react` 19, `react-dom` 19, `radix-ui`,
`lucide-react`, `tailwindcss` 4.

In the app's main CSS:

```css
@import 'tailwindcss';
@import '@burgwiss/ui/styles.css';
/* Tailwind v4 does not scan node_modules. Without this line every class the
   components use is missing and they render unstyled. */
@source '../node_modules/@burgwiss/ui/dist';
```

```tsx
import { Button, GridPage, SearchField } from '@burgwiss/ui';
```

**Right-to-left:** set `dir` on `<html>` and wrap the app once in
`<DirectionProvider dir="rtl">` (exported from the package) — Radix menus and
arrow keys read direction from it, not from the attribute.

**Theme:** override the CSS variables from `src/tokens/theme.css` on `:root`
(e.g. `--primary`). That is the only way to theme — components never take colours.
Dark mode is the `.dark` class on an ancestor.

## Work on it

```bash
npm install
npm run dev          # Storybook with HMR → http://localhost:6006
npm test             # Vitest: behaviour tests, every story rendered + axe, lint-rule tests
npm run lint         # includes the "no app inside the package" guard
npm run typecheck
npm run build        # dist/ (ESM + types + CSS source)
npm run check        # all of the above + Storybook build — run before every push
```

Developing against an app at the same time: `npm link` here, `npm link @burgwiss/ui`
in the app — or point the app's dependency at a local path (`"file:../ui"`).

## Publish Storybook

```bash
npm run storybook:publish                     # build + rsync to the infra box
bash deploy/publish-storybook.sh setup        # one-time: install the nginx service
```

Served by nginx behind the infra box's Traefik `edge-proxy`, from
`/opt/ui-storybook` (compose file: `deploy/docker-compose.yml`). Needs root ssh
to the box. `/version.txt` on the site names the commit that is live.

## Releases

Semver, as git tags (`v0.2.0`). Apps pin a tag and update on purpose.

Bump `version` in `package.json` on main, then run `bash scripts/release.sh`.
It builds, commits `dist/` on a detached commit on top of main, tags that
commit and pushes the tag. Main never holds build output; only the tag does.
**Breaking** = a removed or renamed export, prop, or CSS variable.

See [AGENTS.md](AGENTS.md) for where a component goes and the rules it must follow.
