import { type ReactNode } from 'react';
import type { GridApi, ShortcutLabels } from '../../hooks';
export interface GridPageProps<T = unknown> {
    /** Page name — rendered as a visually hidden h1 only (the app's breadcrumb names the page). */
    title: string;
    /**
     * From `useGrid({ id, rows, getRowId, columns, actions, selection })`. Brings the actions,
     * the selection, the keyboard and the remembered settings.
     */
    grid?: GridApi<T>;
    /** The toolbar's accessible name. Defaults to `title`. */
    actionsLabel?: string;
    /** Search, right: a magnifier that slides open when clicked or when `/` jumps to it. */
    search?: {
        value: string;
        onChange: (value: string) => void;
        placeholder: string;
    };
    /** Name of the "…" menu that takes the actions that do not fit, e.g. "Weitere Aktionen". Without it they never collapse. */
    moreActionsLabel?: string;
    /** Text for the "✕ 3 ausgewählt" part of the toolbar. */
    selectionLabels?: {
        count: (count: number) => string;
        clear: string;
    };
    /** Key names in the app's language, e.g. `{ Mod: 'Strg', Delete: 'Entf' }`. */
    shortcutLabels?: ShortcutLabels;
    /** The ⋮ table-options menu (GridOptions), at the far right. */
    options?: ReactNode;
    /** Active-filter chips, in a thin row under the toolbar. */
    chips?: ReactNode;
    /** A message row (e.g. a warning or info banner) between the toolbar/chips and the grid. */
    notice?: ReactNode;
    /** The bar pinned under the grid, e.g. a count on the left and a pager on the right (`GridFooter`). */
    footer?: ReactNode;
    /** Height of whatever sits above the page in the app shell (default: a 4rem top bar). */
    offsetTop?: string;
    /** The grid itself, usually a `Table`. It scrolls inside the page; the header stays pinned. */
    children: ReactNode;
}
/**
 * The page template for every list page: a table with a toolbar of actions,
 * search, filter chips, a right-click menu and a footer. It takes the grid state from
 * `useGrid` (`grid`), which supplies the actions, selection, keyboard shortcuts and
 * remembered settings; all text is passed in by the app. It fills the viewport
 * below `offsetTop`. For a sidebar-plus-content page use `SidebarLayout`.
 *
 * How every list page looks and behaves:
 *
 *   [✕ 3 ausgewählt | actions for this selection] ····· [🔍] [⋮]
 *   [active filter chips]
 *   [the grid — header pinned, lines between columns, right-click menu]
 *   [count ·························· pager]
 *
 * The same actions show in the toolbar and the right-click menu, and answer
 * their keyboard shortcuts — always the ones that fit the selection. Actions
 * that do not fit beside the search go behind a "…" menu (`moreActionsLabel`).
 *
 * @summary List-page template: table with selection toolbar, search, filter chips, context menu and footer.
 */
export declare function GridPage<T>({ title, grid, actionsLabel, search, moreActionsLabel, selectionLabels, shortcutLabels, options, chips, notice, footer, offsetTop, children, }: GridPageProps<T>): import("react").JSX.Element;
