import { type InputHTMLAttributes, type KeyboardEvent, type MouseEvent, type TableHTMLAttributes } from 'react';
import type { GridColumn, GridColumnLayout, GridFilter, GridLine, GridSort } from './grid/types';
import { type GridActionItem, type GridSelectionState, type RowId } from './gridActions';
import { type GridPreferenceStorage, type GridPreferences, type GridPreferencesApi, type GridView } from './useGridPreferences';
/** What the app allows. The person can still switch selection off in ⋮. */
export type GridSelectionMode = 'none' | 'single' | 'multiple';
/** What a server needs to answer for a page of rows. */
export interface GridQuery {
    sorting: GridSort[];
    filters: GridFilter[];
}
/** Width of the checkbox and the expander column, in px. */
export declare const GRID_CONTROL_COLUMN_WIDTH = 40;
export interface UseGridOptions<T> {
    /** Stable name for this grid, e.g. the route name. Keys the remembered settings. */
    id: string;
    /** The rows. In `server` mode: already sorted and filtered, one page. */
    rows: T[];
    getRowId: (row: T) => RowId;
    columns: GridColumn<T>[];
    /**
     * `client` (default): the grid sorts, filters and groups `rows` itself.
     * `server`: `rows` arrive ready; sorting and filters are reported through
     * `onQueryChange` for the app to fetch. Grouping is client-only.
     */
    mode?: 'client' | 'server';
    onQueryChange?: (query: GridQuery) => void;
    /** Default `'multiple'`. */
    selection?: GridSelectionMode;
    /** Everything the grid lets you do, each with the selection states it fits. */
    actions?: GridActionItem[];
    /** Rows selected on first render. */
    defaultSelectedIds?: RowId[];
    /** Rows that open a detail panel (e.g. a course's offerings). Omit for none. */
    isExpandable?: (row: T) => boolean;
    defaults?: Partial<GridPreferences>;
    storage?: GridPreferenceStorage | null;
    /**
     * The filters to start with, instead of the active saved view's. For
     * `server` mode, where the address is the truth: pass the filters the
     * server answered for (e.g. parsed from `?status[]=pending`), so the chips
     * and the rows agree on first render.
     */
    initialFilters?: GridFilter[];
}
export interface GridApi<T = unknown> {
    id: string;
    preferences: GridPreferencesApi;
    actions: GridActionItem[];
    columns: GridColumn<T>[];
    columnById: (id: string) => GridColumn<T> | undefined;
    /** Visible columns in display order, with widths and pinning. */
    layout: GridColumnLayout[];
    /** Rows after filtering and sorting, in display order (all of them, even inside collapsed groups). */
    visibleRows: T[];
    /** The body: group headers and rows, as displayed. */
    lines: GridLine<T>[];
    getRowId: (row: T) => RowId;
    mode: GridSelectionMode;
    dataMode: 'client' | 'server';
    query: GridQuery;
    sorting: GridSort[];
    /** Plain: sort by this column only, cycling asc → desc → off. Additive: add or cycle it as another key. */
    toggleSort: (columnId: string, additive?: boolean) => void;
    setSorting: (sorting: GridSort[]) => void;
    filters: GridFilter[];
    /** Set or replace this column's filter. */
    setFilter: (filter: GridFilter) => void;
    removeFilter: (columnId: string) => void;
    clearFilters: () => void;
    canGroup: boolean;
    groupBy: string[];
    setGroupBy: (columnIds: string[]) => void;
    toggleGroup: (key: string) => void;
    isGroupExpanded: (key: string) => boolean;
    expandAllGroups: () => void;
    collapseAllGroups: () => void;
    hasExpandableRows: boolean;
    canExpand: (row: T) => boolean;
    isRowExpanded: (id: RowId) => boolean;
    toggleRowExpanded: (id: RowId) => void;
    setColumnWidth: (columnId: string, width: number) => void;
    moveColumn: (columnId: string, toIndex: number) => void;
    pinColumn: (columnId: string, side: 'left' | 'right' | null) => void;
    views: GridView[];
    activeViewId: string | null;
    /** True when the setup differs from the active view. */
    isViewModified: boolean;
    /** Saves the current setup; returns null for a blank name. */
    saveView: (name: string) => GridView | null;
    applyView: (viewId: string) => void;
    /** Overwrite a saved view with the current setup. */
    updateView: (viewId: string) => void;
    renameView: (viewId: string, name: string) => void;
    deleteView: (viewId: string) => void;
    /** CSV of the visible columns — all visible rows, or only the selected ones. */
    exportCsv: (options?: {
        scope?: 'all' | 'selection';
        separator?: string;
        bom?: boolean;
    }) => string;
    /** Copies the selected rows (or the focused row) as TSV; resolves to the text. */
    copySelection: () => Promise<string>;
    editing: {
        rowId: RowId;
        columnId: string;
    } | null;
    editError: string | null;
    editPending: boolean;
    startEdit: (rowId: RowId, columnId: string) => void;
    cancelEdit: () => void;
    /** Validates, saves and resolves true — or keeps the editor open with `editError`. */
    commitEdit: (value: string | number) => Promise<boolean>;
    /** The value a cell shows: an edit being saved, or the row's own. */
    cellValue: (row: T, columnId: string) => unknown;
    /** What the app allows. */
    allowedMode: GridSelectionMode;
    selectedIds: RowId[];
    selectionState: GridSelectionState;
    /** The actions that fit the current selection, grouped. */
    visibleActions: GridActionItem[][];
    isSelected: (id: RowId) => boolean;
    select: (ids: RowId[]) => void;
    toggle: (id: RowId) => void;
    selectAll: () => void;
    clear: () => void;
    /** True in multiple mode — render a checkbox column. */
    showCheckboxes: boolean;
    getTableProps: () => TableHTMLAttributes<HTMLTableElement> & {
        role: 'grid';
    };
    getRowProps: (id: RowId) => Record<string, unknown>;
    getRowCheckboxProps: (id: RowId, label: string) => InputHTMLAttributes<HTMLInputElement>;
    getSelectAllProps: (label: string) => InputHTMLAttributes<HTMLInputElement>;
    /** For the page root: grid keys and action shortcuts. */
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    /** For the right-click area: picks what the menu acts on. */
    onContextMenu: (event: MouseEvent<HTMLElement>) => void;
}
/**
 * Everything a grid does besides looking like one: sorting, filtering,
 * grouping, expandable rows, column layout, saved views, inline editing,
 * copy/export, selection (click, ⌘/Ctrl, Shift, checkboxes, keyboard), the
 * actions that fit that selection, the right-click menu, keyboard shortcuts —
 * and the settings it remembers. Render it with `DataGrid`.
 *
 *   const grid = useGrid({ id: 'admin.courses', rows, getRowId: (r) => r.id, columns, actions });
 *   <GridPage grid={grid} …><DataGrid grid={grid} labels={…} /></GridPage>
 */
export declare function useGrid<T>({ id, rows: inputRows, getRowId, columns, mode: dataMode, onQueryChange, selection, actions, defaultSelectedIds, isExpandable, defaults, storage, initialFilters, }: UseGridOptions<T>): GridApi<T>;
