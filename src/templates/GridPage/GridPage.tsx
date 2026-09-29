import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { IconButton } from '../../molecules/IconButton';
import { SearchField } from '../../molecules/SearchField';
import { GridActions, GridActionsSeparator } from '../../organisms/GridActions';

export interface GridPageProps {
    /** Page name — rendered as a visually hidden h1 only (the app's breadcrumb names the page). */
    title: string;
    /** The grid's action toolbar (GridActions), left. */
    actions?: ReactNode;
    /** Search, right. */
    search?: { value: string; onChange: (value: string) => void; placeholder: string };
    /** When count > 0, replaces `actions` with the selection toolbar. */
    selection?: {
        count: number;
        label: string;
        actions: ReactNode;
        onClear: () => void;
        clearLabel: string;
    };
    /** Active-filter chips, in a thin row under the toolbar. */
    chips?: ReactNode;
    notice?: ReactNode;
    footer?: ReactNode;
    /** Height of whatever sits above the page in the app shell (default: a 4rem top bar). */
    offsetTop?: string;
    children: ReactNode;
}

/**
 * The grid page template — how every list page looks.
 *
 *   [grid actions: icon toolbar] ··········· [search]
 *   [active filter chips]
 *   [the grid — fills the page, header pinned, only the body scrolls]
 *   [count ·························· pager]
 *
 * No container, no card, no margin, no visible title. Filtering lives in the
 * grid's column headers (GridColumnFilter); active filters also show as chips.
 */
export function GridPage({
    title,
    actions,
    search,
    selection,
    chips,
    notice,
    footer,
    offsetTop = '4rem',
    children,
}: GridPageProps) {
    const selecting = selection !== undefined && selection.count > 0;
    return (
        <div
            className="flex min-h-0 flex-col bg-card"
            style={{ height: `calc(100svh - ${offsetTop})` }}
        >
            <h1 className="sr-only">{title}</h1>

            <div className="flex min-h-14 shrink-0 items-center gap-3 border-b border-border px-4 py-2">
                {selecting ? (
                    <GridActions label={selection.label}>
                        <IconButton
                            label={selection.clearLabel}
                            icon={<X className="size-4" aria-hidden="true" />}
                            onClick={selection.onClear}
                        />
                        <span className="px-2 text-sm font-semibold tabular-nums">
                            {selection.label}
                        </span>
                        <GridActionsSeparator />
                        {selection.actions}
                    </GridActions>
                ) : (
                    actions
                )}
                {search && (
                    <SearchField
                        className="ml-auto w-72"
                        value={search.value}
                        onValueChange={search.onChange}
                        placeholder={search.placeholder}
                    />
                )}
            </div>

            {chips && (
                <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
                    {chips}
                </div>
            )}
            {notice && (
                <div className="shrink-0 border-b border-border px-4 py-2 text-sm">{notice}</div>
            )}

            <div
                className={cn(
                    'min-h-0 flex-1 overflow-auto',
                    '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-muted',
                    '[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4',
                    '[&_[data-slot=table-container]]:overflow-visible',
                )}
            >
                {children}
            </div>

            {footer && (
                <div className="flex min-h-12 shrink-0 items-center gap-3 border-t border-border px-4 py-2">
                    {footer}
                </div>
            )}
        </div>
    );
}
