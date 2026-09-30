import { useVirtualizer } from '@tanstack/react-virtual';
import {
    ArrowDown,
    ArrowDownUp,
    ArrowUp,
    ChevronDown,
    ChevronRight,
    EllipsisVertical,
    Filter,
} from 'lucide-react';
import {
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type PointerEvent,
    type ReactNode,
} from 'react';

import { Button } from '../../atoms/Button';
import { columnValue, normaliseOrder } from '../../hooks/grid/engine';
import type { GridColumn, GridColumnLayout, GridFilter, GridGroup } from '../../hooks/grid/types';
import type { RowId } from '../../hooks/gridActions';
import { GRID_CONTROL_COLUMN_WIDTH, type GridApi } from '../../hooks/useGrid';
import { cn } from '../../lib/cn';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';
import { Popover, PopoverAnchor, PopoverContent } from '../../molecules/Popover';

/** Every text the grid shows. The app passes them in its own language. */
export interface DataGridLabels {
    /** The grid's accessible name. */
    table: string;
    selectAll: string;
    selectRow: (rowName: string) => string;
    /** Header of the expander column (screen readers only). */
    detailsColumn?: string;
    expand: (rowName: string) => string;
    collapse: (rowName: string) => string;
    columnMenu: (header: string) => string;
    sortAscending: string;
    sortDescending: string;
    clearSort: string;
    filter: string;
    pinLeft: string;
    pinRight: string;
    unpin: string;
    groupBy: string;
    ungroup: string;
    autosize: string;
    moveLeft: string;
    moveRight: string;
    hide: string;
    resize: (header: string) => string;
    /** A group row, e.g. `Kategorie: Religion (2)`. */
    group: (header: string, value: string, count: number) => string;
    /** Shown for the group of rows without a value. */
    emptyGroupValue: string;
    loading: string;
    empty: string;
    errorTitle: string;
    retry: string;
    /** Name of an editable cell's button, e.g. `Preis bearbeiten: 120 €`. */
    edit: (header: string, value: string) => string;
    save: string;
    cancel: string;
    saving: string;
}

export interface DataGridProps<T> {
    /** From `useGrid(…)`: rows, columns, sorting, selection, everything. */
    grid: GridApi<T>;
    labels: DataGridLabels;
    /** How a row is named in labels (checkbox, expander). Default: its first column's text. */
    rowLabel?: (row: T) => string;
    /** The panel under an expanded row (pair with `isExpandable` in `useGrid`). */
    renderDetail?: (row: T) => ReactNode;
    /**
     * The filter editor for a column, opened from its menu — usually a
     * `GridFilterEditor`. Omit and the menu offers no filter.
     */
    renderFilter?: (column: GridColumn<T>, close: () => void) => ReactNode;
    loading?: boolean;
    /** A load error to show instead of rows. */
    error?: string | null;
    onRetry?: () => void;
    /** Replaces `labels.empty` when there are no rows. */
    emptyState?: ReactNode;
    /** Render only the rows in view. Default: on from 200 lines. */
    virtualize?: boolean;
    className?: string;
}

const STEP = 16;
const BIG_STEP = 64;
const VIRTUALIZE_FROM = 200;

function stickyStyle(col: GridColumnLayout, header = false): CSSProperties | undefined {
    if (!col.pinned) return undefined;
    return { position: 'sticky', [col.pinned]: col.offset, zIndex: header ? 30 : 10 };
}

/**
 * A data grid for real work: sorting (Shift for several keys), a menu per
 * column (sort, filter, pin, group, move, autosize, hide), resizing and
 * drag-to-reorder, pinned columns, expandable rows with a detail panel,
 * grouped rows with counts and sums, inline editing, and loading, empty and
 * error states — all driven by `useGrid`, and rendered only with our tokens.
 * Put it in a `GridPage` for the toolbar, search and right-click menu.
 *
 * @summary Full-featured table body for a `useGrid` state (sort, filter, pin, group, edit, expand).
 */
export function DataGrid<T>({
    grid,
    labels,
    rowLabel,
    renderDetail,
    renderFilter,
    loading = false,
    error = null,
    onRetry,
    emptyState,
    virtualize,
    className,
}: DataGridProps<T>) {
    const baseId = useId();
    const tableRef = useRef<HTMLTableElement>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);
    const [filtering, setFiltering] = useState<string | null>(null);

    const layout = grid.layout;
    const controls =
        (grid.showCheckboxes ? GRID_CONTROL_COLUMN_WIDTH : 0) +
        (grid.hasExpandableRows ? GRID_CONTROL_COLUMN_WIDTH : 0);
    const totalWidth = controls + layout.reduce((sum, c) => sum + c.width, 0);
    const colSpan =
        (grid.showCheckboxes ? 1 : 0) + (grid.hasExpandableRows ? 1 : 0) + layout.length;
    const first = grid.columns.find((c) => c.id === layout[0]?.id) ?? grid.columns[0];
    const nameOf = (row: T) =>
        rowLabel?.(row) ?? (first ? String(columnValue(first, row) ?? '') : '');
    const order = normaliseOrder(
        grid.preferences.values.columnOrder,
        grid.columns.map((c) => c.id),
    );

    const lines = grid.lines;
    const useVirtual = virtualize ?? lines.length >= VIRTUALIZE_FROM;
    const rowHeight = grid.preferences.values.density === 'compact' ? 37 : 49;
    // Only this component reads the virtualizer, every render; no memoization to break.
    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: useVirtual ? lines.length : 0,
        getScrollElement: () =>
            (tableRef.current?.closest('[data-grid-scroll]') as HTMLElement | null) ??
            tableRef.current?.parentElement ??
            null,
        estimateSize: () => rowHeight,
        overscan: 12,
    });
    const items = useVirtual ? virtualizer.getVirtualItems() : null;
    const visible = items
        ? items.map((i) => ({ index: i.index, line: lines[i.index]! }))
        : lines.map((line, index) => ({ index, line }));
    const padTop = items && items.length ? items[0]!.start : 0;
    const padBottom =
        items && items.length ? virtualizer.getTotalSize() - items[items.length - 1]!.end : 0;

    const autosize = (id: string) => {
        const cells = tableRef.current?.querySelectorAll<HTMLElement>(
            `[data-col="${CSS.escape(id)}"] [data-cell-content]`,
        );
        let widest = 0;
        // Rendered width, not scrollWidth: the text is inline, whose scrollWidth is 0.
        cells?.forEach(
            (el) => (widest = Math.max(widest, el.getBoundingClientRect().width, el.scrollWidth)),
        );
        // Cell padding plus, on the header, room for the sort and menu buttons.
        grid.setColumnWidth(id, widest + 72);
    };

    const moveBy = (id: string, delta: -1 | 1) => {
        const i = layout.findIndex((c) => c.id === id);
        const neighbour = layout[i + delta];
        if (!neighbour) return;
        grid.moveColumn(id, order.indexOf(neighbour.id));
    };

    // Reorder by dragging a header: pointer events rather than HTML5 drag and
    // drop, because a drag that starts on the sort button never begins in
    // Chromium, and HTML5 drag does not exist on touch at all. A plain click
    // still sorts; past a few pixels it becomes a move.
    const reorder = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
    const suppressClick = useRef(false);
    const headerAt = (x: number, y: number) =>
        (document.elementFromPoint?.(x, y)?.closest('th[data-col]') as HTMLElement | null)?.dataset
            .col ?? null;
    const onHeaderPointerDown = (event: PointerEvent<HTMLElement>, id: string) => {
        if (event.button !== 0) return;
        if ((event.target as Element).closest('[role=separator],[aria-haspopup]')) return;
        reorder.current = { id, x: event.clientX, y: event.clientY, moved: false };
        const move = (e: globalThis.PointerEvent) => {
            const r = reorder.current;
            if (!r) return;
            if (!r.moved && Math.hypot(e.clientX - r.x, e.clientY - r.y) < 6) return;
            r.moved = true;
            setDragOver(headerAt(e.clientX, e.clientY));
        };
        const up = (e: globalThis.PointerEvent) => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            const r = reorder.current;
            reorder.current = null;
            setDragOver(null);
            if (!r?.moved) return;
            suppressClick.current = true;
            window.setTimeout(() => (suppressClick.current = false), 0);
            const target = headerAt(e.clientX, e.clientY);
            if (target && target !== r.id) grid.moveColumn(r.id, order.indexOf(target));
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
    };

    const busy = loading && !error;
    const showSkeleton = busy && grid.visibleRows.length === 0;
    const showEmpty = !loading && !error && lines.length === 0;

    return (
        <div className={cn('relative', className)}>
            <div role="status" className="sr-only">
                {busy ? labels.loading : ''}
            </div>
            <table
                ref={tableRef}
                aria-label={labels.table}
                aria-busy={busy || undefined}
                {...grid.getTableProps()}
                style={{ width: totalWidth, tableLayout: 'fixed' }}
                className={cn(
                    'caption-bottom border-separate border-spacing-0 text-sm',
                    busy && !showSkeleton && 'opacity-60',
                )}
            >
                <colgroup>
                    {grid.showCheckboxes && <col style={{ width: GRID_CONTROL_COLUMN_WIDTH }} />}
                    {grid.hasExpandableRows && <col style={{ width: GRID_CONTROL_COLUMN_WIDTH }} />}
                    {layout.map((c) => (
                        <col key={c.id} style={{ width: c.width }} />
                    ))}
                </colgroup>
                <thead>
                    <tr className="border-b border-border">
                        {grid.showCheckboxes && (
                            <th
                                className="h-10 border-b border-border bg-muted px-3 text-left"
                                style={{ position: 'sticky', left: 0, zIndex: 30 }}
                            >
                                <input {...grid.getSelectAllProps(labels.selectAll)} />
                            </th>
                        )}
                        {grid.hasExpandableRows && (
                            <th
                                className="h-10 border-b border-border bg-muted"
                                style={{
                                    position: 'sticky',
                                    left: grid.showCheckboxes ? GRID_CONTROL_COLUMN_WIDTH : 0,
                                    zIndex: 30,
                                }}
                            >
                                {labels.detailsColumn && (
                                    <span className="sr-only">{labels.detailsColumn}</span>
                                )}
                            </th>
                        )}
                        {layout.map((l, index) => {
                            const col = grid.columns.find((c) => c.id === l.id)!;
                            return (
                                <HeaderCell
                                    key={l.id}
                                    grid={grid}
                                    column={col}
                                    layout={l}
                                    labels={labels}
                                    isFirst={index === 0}
                                    isLast={index === layout.length - 1}
                                    dragOver={dragOver === l.id}
                                    onHeaderPointerDown={onHeaderPointerDown}
                                    shouldIgnoreClick={() => suppressClick.current}
                                    onAutosize={() => autosize(l.id)}
                                    onMove={(d) => moveBy(l.id, d)}
                                    filterOpen={filtering === l.id}
                                    onFilterOpenChange={(open) => setFiltering(open ? l.id : null)}
                                    renderFilter={renderFilter}
                                />
                            );
                        })}
                    </tr>
                </thead>
                {padTop > 0 && (
                    <tbody aria-hidden="true">
                        <tr style={{ height: padTop }} />
                    </tbody>
                )}
                {showSkeleton &&
                    Array.from({ length: 5 }, (_, i) => (
                        <tbody key={`s${i}`} aria-hidden="true">
                            <tr data-skeleton="">
                                {Array.from({ length: colSpan }, (_, j) => (
                                    <td key={j} className="border-b border-border px-3 py-3">
                                        <span className="block h-3 w-3/4 animate-pulse rounded bg-muted" />
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    ))}
                {error && (
                    <tbody>
                        <tr>
                            <td colSpan={colSpan} className="px-4 py-10">
                                <div
                                    role="alert"
                                    className="flex flex-col items-center gap-2 text-center"
                                >
                                    <p className="font-medium">{labels.errorTitle}</p>
                                    <p className="text-sm text-muted-foreground">{error}</p>
                                    {onRetry && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={onRetry}
                                        >
                                            {labels.retry}
                                        </Button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                )}
                {showEmpty && (
                    <tbody>
                        <tr>
                            <td
                                colSpan={colSpan}
                                className="px-4 py-12 text-center text-muted-foreground"
                            >
                                {emptyState ?? labels.empty}
                            </td>
                        </tr>
                    </tbody>
                )}
                {!error &&
                    visible.map(({ index, line }) => (
                        <tbody
                            key={
                                line.kind === 'group'
                                    ? `g:${line.group.key}`
                                    : `r:${String(line.id)}`
                            }
                            data-index={index}
                            ref={useVirtual ? virtualizer.measureElement : undefined}
                        >
                            {line.kind === 'group' ? (
                                <GroupRow grid={grid} group={line.group} labels={labels} />
                            ) : (
                                <DataRow
                                    grid={grid}
                                    row={line.row}
                                    id={line.id}
                                    depth={line.depth}
                                    name={nameOf(line.row)}
                                    labels={labels}
                                    detailId={`${baseId}-detail-${String(line.id)}`}
                                    renderDetail={renderDetail}
                                    colSpan={colSpan}
                                />
                            )}
                        </tbody>
                    ))}
                {padBottom > 0 && (
                    <tbody aria-hidden="true">
                        <tr style={{ height: padBottom }} />
                    </tbody>
                )}
            </table>
        </div>
    );
}

function HeaderCell<T>({
    grid,
    column,
    layout,
    labels,
    isFirst,
    isLast,
    dragOver,
    onHeaderPointerDown,
    shouldIgnoreClick,
    onAutosize,
    onMove,
    filterOpen,
    onFilterOpenChange,
    renderFilter,
}: {
    grid: GridApi<T>;
    column: GridColumn<T>;
    layout: GridColumnLayout;
    labels: DataGridLabels;
    isFirst: boolean;
    isLast: boolean;
    dragOver: boolean;
    onHeaderPointerDown: (event: PointerEvent<HTMLElement>, id: string) => void;
    shouldIgnoreClick: () => boolean;
    onAutosize: () => void;
    onMove: (delta: -1 | 1) => void;
    filterOpen: boolean;
    onFilterOpenChange: (open: boolean) => void;
    renderFilter?: (column: GridColumn<T>, close: () => void) => ReactNode;
}) {
    const sortable = column.sortable !== false;
    const sortIndex = grid.sorting.findIndex((s) => s.id === column.id);
    const sort = sortIndex >= 0 ? grid.sorting[sortIndex] : undefined;
    const filtered = grid.filters.some((f: GridFilter) => f.id === column.id);
    const SortIcon = !sort ? ArrowDownUp : sort.desc ? ArrowDown : ArrowUp;
    const grouped = grid.groupBy.includes(column.id);
    // "Filtern …" opens the popover only once the menu has finished closing:
    // the menu hands focus back to its button, which the popover would take
    // for an outside click and close again at once.
    const wantsFilter = useRef(false);

    return (
        <th
            data-col={column.id}
            aria-sort={
                sortable ? (!sort ? 'none' : sort.desc ? 'descending' : 'ascending') : undefined
            }
            style={{ width: layout.width, ...stickyStyle(layout, true) }}
            onPointerDown={(e) => onHeaderPointerDown(e, column.id)}
            className={cn(
                'group/th relative border-b border-border bg-muted px-2 text-left align-middle text-xs font-medium tracking-wider text-muted-foreground uppercase select-none',
                grid.preferences.values.density === 'compact' ? 'h-8' : 'h-10',
                !isLast && 'border-r',
                dragOver && 'bg-accent',
                layout.pinned === 'left' && 'shadow-[inset_-1px_0_0_var(--border)]',
                column.align === 'right' && 'text-right',
            )}
        >
            <Popover open={filterOpen} onOpenChange={onFilterOpenChange}>
                <PopoverAnchor asChild>
                    <div
                        className={cn(
                            'flex min-w-0 items-center gap-0.5',
                            column.align === 'right' && 'flex-row-reverse',
                        )}
                    >
                        {sortable ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    if (shouldIgnoreClick()) return;
                                    grid.toggleSort(column.id, e.shiftKey);
                                }}
                                className="flex min-w-0 items-center gap-1 rounded px-1 py-1 uppercase hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <span data-cell-content className="truncate">
                                    {column.header}
                                </span>
                                <SortIcon
                                    aria-hidden="true"
                                    className={cn(
                                        'size-3.5 shrink-0',
                                        !sort && 'opacity-0 group-hover/th:opacity-60',
                                    )}
                                />
                                {sort && grid.sorting.length > 1 && (
                                    <span aria-hidden="true" className="text-[10px] tabular-nums">
                                        {sortIndex + 1}
                                    </span>
                                )}
                            </button>
                        ) : (
                            <span data-cell-content className="truncate px-1">
                                {column.header}
                            </span>
                        )}
                        {filtered && (
                            <Filter
                                aria-hidden="true"
                                className="size-3 shrink-0 text-foreground"
                            />
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={labels.columnMenu(column.header)}
                                    className="ml-auto shrink-0 text-muted-foreground opacity-60 group-hover/th:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100"
                                >
                                    <EllipsisVertical aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="start"
                                className="normal-case"
                                onCloseAutoFocus={(e) => {
                                    if (!wantsFilter.current) return;
                                    wantsFilter.current = false;
                                    e.preventDefault();
                                    onFilterOpenChange(true);
                                }}
                            >
                                {sortable && (
                                    <>
                                        <DropdownMenuItem
                                            onSelect={() =>
                                                grid.setSorting([{ id: column.id, desc: false }])
                                            }
                                        >
                                            {labels.sortAscending}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={() =>
                                                grid.setSorting([{ id: column.id, desc: true }])
                                            }
                                        >
                                            {labels.sortDescending}
                                        </DropdownMenuItem>
                                        {sort && (
                                            <DropdownMenuItem
                                                onSelect={() =>
                                                    grid.setSorting(
                                                        grid.sorting.filter(
                                                            (s) => s.id !== column.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                {labels.clearSort}
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                {column.filter && renderFilter && (
                                    <DropdownMenuItem onSelect={() => (wantsFilter.current = true)}>
                                        {labels.filter}
                                    </DropdownMenuItem>
                                )}
                                {column.groupable && grid.canGroup && (
                                    <DropdownMenuItem
                                        onSelect={() =>
                                            grid.setGroupBy(
                                                grouped
                                                    ? grid.groupBy.filter((g) => g !== column.id)
                                                    : [...grid.groupBy, column.id],
                                            )
                                        }
                                    >
                                        {grouped ? labels.ungroup : labels.groupBy}
                                    </DropdownMenuItem>
                                )}
                                {layout.pinned !== 'left' && (
                                    <DropdownMenuItem
                                        onSelect={() => grid.pinColumn(column.id, 'left')}
                                    >
                                        {labels.pinLeft}
                                    </DropdownMenuItem>
                                )}
                                {layout.pinned !== 'right' && (
                                    <DropdownMenuItem
                                        onSelect={() => grid.pinColumn(column.id, 'right')}
                                    >
                                        {labels.pinRight}
                                    </DropdownMenuItem>
                                )}
                                {layout.pinned && (
                                    <DropdownMenuItem
                                        onSelect={() => grid.pinColumn(column.id, null)}
                                    >
                                        {labels.unpin}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {!isFirst && (
                                    <DropdownMenuItem onSelect={() => onMove(-1)}>
                                        {labels.moveLeft}
                                    </DropdownMenuItem>
                                )}
                                {!isLast && (
                                    <DropdownMenuItem onSelect={() => onMove(1)}>
                                        {labels.moveRight}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onSelect={onAutosize}>
                                    {labels.autosize}
                                </DropdownMenuItem>
                                {column.hideable !== false && (
                                    <DropdownMenuItem
                                        onSelect={() =>
                                            grid.preferences.setColumnVisible(column.id, false)
                                        }
                                    >
                                        {labels.hide}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </PopoverAnchor>
                {renderFilter && column.filter && (
                    <PopoverContent align="start" className="w-72 tracking-normal normal-case">
                        {renderFilter(column, () => onFilterOpenChange(false))}
                    </PopoverContent>
                )}
            </Popover>
            <ResizeHandle
                grid={grid}
                column={column}
                layout={layout}
                labels={labels}
                onAutosize={onAutosize}
            />
        </th>
    );
}

function ResizeHandle<T>({
    grid,
    column,
    layout,
    labels,
    onAutosize,
}: {
    grid: GridApi<T>;
    column: GridColumn<T>;
    layout: GridColumnLayout;
    labels: DataGridLabels;
    onAutosize: () => void;
}) {
    const drag = useRef<{ x: number; width: number; dir: 1 | -1 } | null>(null);
    const min = column.minWidth ?? 64;
    const max = column.maxWidth ?? 640;

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        const rtl = event.currentTarget.closest('[dir=rtl]') !== null;
        drag.current = { x: event.clientX, width: layout.width, dir: rtl ? -1 : 1 };
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!drag.current) return;
        const next = drag.current.width + (event.clientX - drag.current.x) * drag.current.dir;
        grid.setColumnWidth(column.id, Math.min(max, Math.max(min, next)));
    };
    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? BIG_STEP : STEP;
        const rtl = event.currentTarget.closest('[dir=rtl]') !== null;
        const grow = rtl ? 'ArrowLeft' : 'ArrowRight';
        const shrink = rtl ? 'ArrowRight' : 'ArrowLeft';
        const next: Record<string, () => number> = {
            [grow]: () => layout.width + step,
            [shrink]: () => layout.width - step,
            Home: () => min,
            End: () => max,
        };
        if (event.key === 'Enter') {
            event.preventDefault();
            onAutosize();
            return;
        }
        const run = next[event.key];
        if (!run) return;
        event.preventDefault();
        event.stopPropagation();
        grid.setColumnWidth(column.id, Math.min(max, Math.max(min, run())));
    };

    return (
        // The WAI-ARIA window-splitter pattern: a focusable separator with a value.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
            role="separator"
            aria-orientation="vertical"
            aria-label={labels.resize(column.header)}
            aria-valuenow={layout.width}
            aria-valuemin={min}
            aria-valuemax={max}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- window splitter
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => (drag.current = null)}
            onPointerCancel={() => (drag.current = null)}
            onDoubleClick={onAutosize}
            onKeyDown={onKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="group/rs absolute inset-y-0 -end-1 z-10 w-2 cursor-col-resize outline-none"
        >
            <span
                aria-hidden="true"
                className="absolute inset-y-1 start-1/2 w-0.5 -translate-x-1/2 rounded bg-transparent transition-colors group-hover/rs:bg-ring group-focus-visible/rs:bg-ring"
            />
        </div>
    );
}

function GroupRow<T>({
    grid,
    group,
    labels,
}: {
    grid: GridApi<T>;
    group: GridGroup<T>;
    labels: DataGridLabels;
}) {
    const open = grid.isGroupExpanded(group.key);
    const column = grid.columns.find((c) => c.id === group.columnId);
    const value = group.value === null ? labels.emptyGroupValue : String(group.value);
    const Icon = open ? ChevronDown : ChevronRight;
    const leading = (grid.showCheckboxes ? 1 : 0) + (grid.hasExpandableRows ? 1 : 0);
    return (
        <tr data-grid-group={group.key} className="bg-muted/40">
            {leading > 0 && (
                <td role="gridcell" colSpan={leading} className="border-b border-border" />
            )}
            {grid.layout.map((l, index) => {
                const col = grid.columns.find((c) => c.id === l.id)!;
                const agg = group.aggregates[l.id];
                return (
                    <td
                        key={l.id}
                        role="gridcell"
                        data-col={l.id}
                        style={stickyStyle(l)}
                        className={cn(
                            'border-b border-border px-3 py-2 text-sm font-medium',
                            l.pinned && 'bg-muted',
                            col.align === 'right' && 'text-right tabular-nums',
                        )}
                    >
                        {index === 0 ? (
                            <button
                                type="button"
                                aria-expanded={open}
                                onClick={() => grid.toggleGroup(group.key)}
                                style={{ paddingInlineStart: group.depth * 16 }}
                                className="flex max-w-full items-center gap-1 rounded text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <Icon
                                    aria-hidden="true"
                                    className="size-4 shrink-0 rtl:rotate-180"
                                />
                                <span className="truncate">
                                    {labels.group(
                                        column?.header ?? group.columnId,
                                        value,
                                        group.rows.length,
                                    )}
                                </span>
                            </button>
                        ) : agg !== undefined ? (
                            (col.formatAggregate?.(agg) ?? agg.toLocaleString())
                        ) : null}
                    </td>
                );
            })}
        </tr>
    );
}

function DataRow<T>({
    grid,
    row,
    id,
    depth,
    name,
    labels,
    detailId,
    renderDetail,
    colSpan,
}: {
    grid: GridApi<T>;
    row: T;
    id: RowId;
    depth: number;
    name: string;
    labels: DataGridLabels;
    detailId: string;
    renderDetail?: (row: T) => ReactNode;
    colSpan: number;
}) {
    const props = grid.getRowProps(id) as { className?: string } & Record<string, unknown>;
    const expandable = grid.canExpand(row);
    const expanded = grid.isRowExpanded(id);
    const control = 'border-b border-border px-3 bg-card in-data-[state=selected]:bg-muted';
    return (
        <>
            <tr
                {...props}
                className={cn(
                    'transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                    '[&>td:not(:last-child)]:border-r',
                    props.className,
                )}
            >
                {grid.showCheckboxes && (
                    <td
                        role="gridcell"
                        className={control}
                        style={{ position: 'sticky', left: 0, zIndex: 10 }}
                    >
                        <input {...grid.getRowCheckboxProps(id, labels.selectRow(name))} />
                    </td>
                )}
                {grid.hasExpandableRows && (
                    <td
                        role="gridcell"
                        className={cn(control, 'px-1')}
                        style={{
                            position: 'sticky',
                            left: grid.showCheckboxes ? GRID_CONTROL_COLUMN_WIDTH : 0,
                            zIndex: 10,
                        }}
                    >
                        {expandable && (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={expanded ? labels.collapse(name) : labels.expand(name)}
                                aria-expanded={expanded}
                                aria-controls={detailId}
                                onClick={() => grid.toggleRowExpanded(id)}
                                className="text-muted-foreground"
                            >
                                <ChevronRight
                                    aria-hidden="true"
                                    className={cn(
                                        'transition-transform rtl:rotate-180',
                                        expanded && 'rotate-90 rtl:rotate-90',
                                    )}
                                />
                            </Button>
                        )}
                    </td>
                )}
                {grid.layout.map((l, index) => {
                    const col = grid.columns.find((c) => c.id === l.id)!;
                    return (
                        <Cell
                            key={l.id}
                            grid={grid}
                            row={row}
                            rowId={id}
                            column={col}
                            layout={l}
                            labels={labels}
                            indent={index === 0 ? depth * 16 : 0}
                        />
                    );
                })}
            </tr>
            {expandable && expanded && (
                <tr id={detailId} data-grid-detail="">
                    <td colSpan={colSpan} className="border-b border-border bg-muted/30 p-0">
                        {renderDetail?.(row)}
                    </td>
                </tr>
            )}
        </>
    );
}

function Cell<T>({
    grid,
    row,
    rowId,
    column,
    layout,
    labels,
    indent,
}: {
    grid: GridApi<T>;
    row: T;
    rowId: RowId;
    column: GridColumn<T>;
    layout: GridColumnLayout;
    labels: DataGridLabels;
    indent: number;
}) {
    const value = grid.cellValue(row, column.id);
    const edited = value !== columnValue(column, row);
    const shown = edited && !column.value ? ({ ...row, [column.id]: value } as T) : row;
    const node = column.cell
        ? column.cell(shown)
        : value === null || value === undefined
          ? ''
          : String(value);
    const text =
        typeof node === 'string'
            ? node
            : value === null || value === undefined
              ? ''
              : String(value);
    const editing = grid.editing?.rowId === rowId && grid.editing.columnId === column.id;

    return (
        <td
            role="gridcell"
            data-col={column.id}
            style={{ ...stickyStyle(layout), paddingInlineStart: indent ? indent + 12 : undefined }}
            className={cn(
                'truncate border-b border-border px-3 align-middle',
                grid.preferences.values.density === 'compact' ? 'py-1.5' : 'py-3',
                layout.pinned && 'bg-card in-data-[state=selected]:bg-muted',
                layout.pinned === 'left' && 'shadow-[inset_-1px_0_0_var(--border)]',
                column.align === 'right' && 'text-right tabular-nums',
            )}
        >
            {editing ? (
                <CellEditor grid={grid} column={column} value={value} labels={labels} />
            ) : column.editable ? (
                <button
                    type="button"
                    aria-label={labels.edit(column.header, text)}
                    onClick={() => grid.startEdit(rowId, column.id)}
                    className={cn(
                        '-mx-1 block w-full truncate rounded px-1 text-left hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                        column.align === 'right' && 'text-right',
                    )}
                >
                    <span data-cell-content>{node}</span>
                </button>
            ) : (
                <span data-cell-content>{node}</span>
            )}
        </td>
    );
}

function CellEditor<T>({
    grid,
    column,
    value,
    labels,
}: {
    grid: GridApi<T>;
    column: GridColumn<T>;
    value: unknown;
    labels: DataGridLabels;
}) {
    const def = column.editable!;
    const errorId = useId();
    const [draft, setDraft] = useState(value === null || value === undefined ? '' : String(value));
    // The editor opens because the person asked to edit: take focus once, on mount.
    const field = useRef<HTMLInputElement & HTMLSelectElement>(null);
    useEffect(() => {
        field.current?.focus();
        if (field.current instanceof HTMLInputElement) field.current.select();
    }, []);
    const parse = (s: string): string | number => (def.type === 'number' ? Number(s) : s);
    const commit = () => {
        if (draft === String(value ?? '')) {
            grid.cancelEdit();
            return;
        }
        void grid.commitEdit(parse(draft));
    };
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commit();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            grid.cancelEdit();
        }
    };
    const common = {
        'aria-label': column.header,
        'aria-invalid': grid.editError ? true : undefined,
        'aria-describedby': grid.editError ? errorId : undefined,
        disabled: grid.editPending,
        onKeyDown,
        className:
            'h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive',
    };
    return (
        <div className="relative">
            {def.type === 'choice' ? (
                <select
                    ref={field}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    {...common}
                >
                    {(def.options ?? []).map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    ref={field}
                    type={def.type === 'number' ? 'number' : 'text'}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    {...common}
                />
            )}
            {grid.editPending && <span className="sr-only">{labels.saving}</span>}
            {grid.editError && (
                <p
                    id={errorId}
                    className="absolute top-full z-20 mt-1 rounded-md bg-destructive px-2 py-1 text-xs whitespace-normal text-destructive-foreground shadow-md"
                >
                    {grid.editError}
                </p>
            )}
        </div>
    );
}
