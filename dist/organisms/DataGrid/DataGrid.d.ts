import { type ReactNode } from 'react';
import type { GridColumn } from '../../hooks/grid/types';
import { type GridApi } from '../../hooks/useGrid';
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
export declare function DataGrid<T>({ grid, labels, rowLabel, renderDetail, renderFilter, loading, error, onRetry, emptyState, virtualize, className, }: DataGridProps<T>): import("react").JSX.Element;
