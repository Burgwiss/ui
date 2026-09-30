import { X } from 'lucide-react';
import { useRef, type KeyboardEvent, type ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import type { GridApi, ShortcutLabels } from '../../hooks';
import { cn } from '../../lib/cn';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '../../molecules/ContextMenu';
import { SearchField } from '../../molecules/SearchField';
import { GridActionMenuItems, GridActions } from '../../organisms/GridActions';

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
    search?: { value: string; onChange: (value: string) => void; placeholder: string };
    /** Name of the "…" menu that takes the actions that do not fit, e.g. "Weitere Aktionen". Without it they never collapse. */
    moreActionsLabel?: string;
    /** Text for the "✕ 3 ausgewählt" part of the toolbar. */
    selectionLabels?: { count: (count: number) => string; clear: string };
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
export function GridPage<T>({
    title,
    grid,
    actionsLabel,
    search,
    moreActionsLabel,
    selectionLabels,
    shortcutLabels,
    options,
    chips,
    notice,
    footer,
    offsetTop = '4rem',
    children,
}: GridPageProps<T>) {
    const root = useRef<HTMLDivElement>(null);
    const count = grid?.selectedIds.length ?? 0;
    const menuItems = grid?.visibleActions ?? [];

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as Element;
        const typing = !!target.closest('input:not([type=checkbox]),textarea,select');
        if (event.key === '/' && !typing && search) {
            event.preventDefault();
            root.current?.querySelector<HTMLInputElement>('input[type=search]')?.focus();
            return;
        }
        grid?.onKeyDown(event);
    };

    const body = (
        <div
            data-grid-scroll=""
            data-density={grid?.preferences.values.density ?? 'comfortable'}
            onContextMenu={grid?.onContextMenu}
            className={cn(
                'min-h-0 flex-1 overflow-auto',
                '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-muted',
                '[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4',
                // Lines between columns, as in a spreadsheet.
                '[&_td]:border-border [&_td:not(:last-child)]:border-r [&_th]:border-border [&_th:not(:last-child)]:border-r',
                // Density: the grid sets row height, so pages never pad cells themselves.
                'data-[density=comfortable]:[&_td]:py-3 data-[density=compact]:[&_td]:py-1.5 data-[density=compact]:[&_th]:h-8',
                '[&_[data-slot=table-container]]:overflow-visible',
            )}
        >
            {children}
        </div>
    );

    return (
        // The page root only listens: the keys belong to the grid inside it.
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
            ref={root}
            onKeyDown={onKeyDown}
            className="flex min-h-0 flex-col bg-card"
            style={{ height: `calc(100svh - ${offsetTop})` }}
        >
            <h1 className="sr-only">{title}</h1>

            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
                <GridActions
                    label={actionsLabel ?? title}
                    items={grid?.actions}
                    selectedIds={grid?.selectedIds}
                    shortcutLabels={shortcutLabels}
                    moreLabel={moreActionsLabel}
                >
                    {grid && selectionLabels && count > 0 && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={selectionLabels.clear}
                                aria-keyshortcuts="Escape"
                                onClick={grid.clear}
                                className="text-muted-foreground"
                            >
                                <X aria-hidden="true" />
                            </Button>
                            <span
                                aria-live="polite"
                                className="px-1 text-sm font-medium whitespace-nowrap tabular-nums"
                            >
                                {selectionLabels.count(count)}
                            </span>
                        </>
                    )}
                </GridActions>
                <div className="ml-auto flex shrink-0 items-center gap-1">
                    {search && (
                        <SearchField
                            collapsible
                            value={search.value}
                            onValueChange={search.onChange}
                            placeholder={search.placeholder}
                            aria-keyshortcuts="/"
                        />
                    )}
                    {options}
                </div>
            </div>

            {chips && (
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
                    {chips}
                </div>
            )}
            {notice && (
                <div className="shrink-0 border-b border-border px-4 py-2 text-sm">{notice}</div>
            )}

            {grid && grid.actions.length > 0 ? (
                <ContextMenu>
                    <ContextMenuTrigger asChild>{body}</ContextMenuTrigger>
                    <ContextMenuContent>
                        <GridActionMenuItems
                            items={menuItems}
                            ids={grid.selectedIds}
                            shortcutLabels={shortcutLabels}
                        />
                    </ContextMenuContent>
                </ContextMenu>
            ) : (
                body
            )}

            {footer && (
                <div className="flex h-12 shrink-0 items-center gap-3 border-t border-border px-4">
                    {footer}
                </div>
            )}
        </div>
    );
}
