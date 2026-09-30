import {
    useEffect,
    useRef,
    useState,
    type InputHTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type TableHTMLAttributes,
} from 'react';

import {
    columnValue,
    filterRows,
    flattenLines,
    groupRows,
    layoutColumns,
    moveColumn as moveInOrder,
    normaliseOrder,
    sortRows,
    toCsv,
    toTsv,
} from './grid/engine';
import type { GridColumn, GridColumnLayout, GridFilter, GridLine, GridSort } from './grid/types';
import {
    gridSelectionState,
    isGridActionDisabled,
    visibleGridActions,
    type GridActionItem,
    type GridSelectionState,
    type RowId,
} from './gridActions';
import { matchShortcut } from './shortcuts';
import {
    useGridPreferences,
    type GridPreferenceStorage,
    type GridPreferences,
    type GridPreferencesApi,
    type GridView,
    type GridViewState,
} from './useGridPreferences';

/** What the app allows. The person can still switch selection off in ⋮. */
export type GridSelectionMode = 'none' | 'single' | 'multiple';

/** What a server needs to answer for a page of rows. */
export interface GridQuery {
    sorting: GridSort[];
    filters: GridFilter[];
}

/** Width of the checkbox and the expander column, in px. */
export const GRID_CONTROL_COLUMN_WIDTH = 40;

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

    // Sorting and filters
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

    // Grouping
    canGroup: boolean;
    groupBy: string[];
    setGroupBy: (columnIds: string[]) => void;
    toggleGroup: (key: string) => void;
    isGroupExpanded: (key: string) => boolean;
    expandAllGroups: () => void;
    collapseAllGroups: () => void;

    // Expandable rows
    hasExpandableRows: boolean;
    canExpand: (row: T) => boolean;
    isRowExpanded: (id: RowId) => boolean;
    toggleRowExpanded: (id: RowId) => void;

    // Columns
    setColumnWidth: (columnId: string, width: number) => void;
    moveColumn: (columnId: string, toIndex: number) => void;
    pinColumn: (columnId: string, side: 'left' | 'right' | null) => void;

    // Saved views
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

    // Copy and export
    /** CSV of the visible columns — all visible rows, or only the selected ones. */
    exportCsv: (options?: {
        scope?: 'all' | 'selection';
        separator?: string;
        bom?: boolean;
    }) => string;
    /** Copies the selected rows (or the focused row) as TSV; resolves to the text. */
    copySelection: () => Promise<string>;

    // Inline editing
    editing: { rowId: RowId; columnId: string } | null;
    editError: string | null;
    editPending: boolean;
    startEdit: (rowId: RowId, columnId: string) => void;
    cancelEdit: () => void;
    /** Validates, saves and resolves true — or keeps the editor open with `editError`. */
    commitEdit: (value: string | number) => Promise<boolean>;
    /** The value a cell shows: an edit being saved, or the row's own. */
    cellValue: (row: T, columnId: string) => unknown;

    // Selection
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
    getTableProps: () => TableHTMLAttributes<HTMLTableElement> & { role: 'grid' };
    getRowProps: (id: RowId) => Record<string, unknown>;
    getRowCheckboxProps: (id: RowId, label: string) => InputHTMLAttributes<HTMLInputElement>;
    getSelectAllProps: (label: string) => InputHTMLAttributes<HTMLInputElement>;
    /** For the page root: grid keys and action shortcuts. */
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
    /** For the right-click area: picks what the menu acts on. */
    onContextMenu: (event: MouseEvent<HTMLElement>) => void;
}

const INTERACTIVE =
    'a,button,input,select,textarea,label,[role=button],[role=checkbox],[role=menuitem],[data-grid-ignore]';

function isEditable(el: Element | null): boolean {
    return !!el?.closest(
        'input:not([type=checkbox]):not([type=radio]),textarea,select,[contenteditable=""],[contenteditable=true]',
    );
}

function rowOf(el: EventTarget | null): HTMLElement | null {
    return el instanceof Element ? (el.closest('[data-grid-row-id]') as HTMLElement | null) : null;
}

function isModClick(event: { metaKey: boolean; ctrlKey: boolean }): boolean {
    return event.metaKey || event.ctrlKey;
}

/** Order-insensitive where order carries no meaning, so "modified" means modified. */
function viewKey(state: GridViewState): string {
    return JSON.stringify({
        hiddenColumns: [...(state.hiddenColumns ?? [])].sort(),
        columnOrder: state.columnOrder ?? [],
        columnWidths: Object.entries(state.columnWidths ?? {}).sort(),
        pinned: Object.entries(state.pinned ?? {}).sort(),
        sorting: state.sorting ?? [],
        filters: [...(state.filters ?? [])].sort((a, b) => a.id.localeCompare(b.id)),
        groupBy: state.groupBy ?? [],
        density: state.density ?? 'comfortable',
    });
}

const cellKey = (rowId: RowId, columnId: string) => `${String(rowId)}::${columnId}`;

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
export function useGrid<T>({
    id,
    rows: inputRows,
    getRowId,
    columns,
    mode: dataMode = 'client',
    onQueryChange,
    selection = 'multiple',
    actions = [],
    defaultSelectedIds = [],
    isExpandable,
    defaults,
    storage,
    initialFilters,
}: UseGridOptions<T>): GridApi<T> {
    const preferences = useGridPreferences(id, { defaults, storage });
    const prefs = preferences.values;
    const [selected, setSelected] = useState<RowId[]>(defaultSelectedIds);
    const [anchor, setAnchor] = useState<RowId | null>(null);
    const [activeId, setActiveId] = useState<RowId | null>(null);
    const rowEls = useRef(new Map<RowId, HTMLElement>());

    // Filters live in state, not in storage: a filter nobody remembers setting
    // hides rows. They come back only as part of the active saved view.
    const [filters, setFilters] = useState<GridFilter[]>(
        () =>
            initialFilters ??
            prefs.views.find((v) => v.id === prefs.activeView)?.state.filters ??
            [],
    );
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [expandedRows, setExpandedRows] = useState<Set<RowId>>(new Set());

    // Optimistic edits, tied to the row OBJECT they were made on: when the app
    // hands in fresh rows (new objects), the stale value simply stops matching.
    // No reset step — so an app that builds a new rows array every render
    // cannot loop.
    const [edits, setEdits] = useState<Map<string, { row: T; value: unknown }>>(new Map());
    const [editing, setEditing] = useState<{ rowId: RowId; columnId: string } | null>(null);
    const [editError, setEditError] = useState<string | null>(null);
    const [editPending, setEditPending] = useState(false);

    const columnById = (columnId: string) => columns.find((c) => c.id === columnId);
    const client = dataMode === 'client';

    // ---- data -----------------------------------------------------------------
    const sorting = prefs.sorting.filter(
        (s) => columnById(s.id)?.sortable !== false && columnById(s.id),
    );
    const groupBy = client ? prefs.groupBy.filter((g) => columnById(g)?.groupable) : [];
    const visibleRows = client
        ? sortRows(filterRows(inputRows, filters, columns), sorting, columns)
        : inputRows;
    const groups = groupBy.length ? groupRows(visibleRows, groupBy, columns) : [];
    const lines = flattenLines(visibleRows, groups, expandedGroups, getRowId);
    const rowIds = visibleRows.map(getRowId);
    const query: GridQuery = { sorting, filters };

    // Server mode: tell the app when the question changes (not on mount — the
    // app asks with `grid.query` for its first page).
    const queryJson = JSON.stringify(query);
    const lastQuery = useRef(queryJson);
    useEffect(() => {
        if (dataMode !== 'server' || lastQuery.current === queryJson) return;
        lastQuery.current = queryJson;
        onQueryChange?.(JSON.parse(queryJson) as GridQuery);
    }, [dataMode, queryJson, onQueryChange]);

    // ---- selection ------------------------------------------------------------
    const mode: GridSelectionMode = selection !== 'none' && prefs.selection ? selection : 'none';
    const present = new Set(rowIds);
    const selectedIds = mode === 'none' ? [] : selected.filter((r) => present.has(r));
    const selectionState = gridSelectionState(selectedIds.length);
    const isSelected = (r: RowId) => selectedIds.includes(r);
    const focusable = activeId !== null && present.has(activeId) ? activeId : (rowIds[0] ?? null);
    const hasExpandableRows = isExpandable !== undefined;

    const layout = layoutColumns(columns, {
        order: prefs.columnOrder,
        hidden: prefs.hiddenColumns,
        widths: prefs.columnWidths,
        pinned: prefs.pinned,
        leading:
            (mode === 'multiple' ? GRID_CONTROL_COLUMN_WIDTH : 0) +
            (hasExpandableRows ? GRID_CONTROL_COLUMN_WIDTH : 0),
    });

    const select = (ids: RowId[]) => {
        if (mode === 'none') return;
        setSelected(mode === 'single' ? ids.slice(-1) : [...new Set(ids)]);
    };
    const toggle = (r: RowId) => {
        if (mode === 'none') return;
        if (mode === 'single') setSelected(isSelected(r) ? [] : [r]);
        else setSelected(isSelected(r) ? selectedIds.filter((x) => x !== r) : [...selectedIds, r]);
        setAnchor(r);
    };
    const selectAll = () => {
        if (mode === 'multiple') setSelected([...rowIds]);
    };
    const clear = () => setSelected([]);
    const range = (from: RowId, to: RowId): RowId[] => {
        const a = rowIds.indexOf(from);
        const b = rowIds.indexOf(to);
        if (a < 0 || b < 0) return [to];
        return rowIds.slice(Math.min(a, b), Math.max(a, b) + 1);
    };

    const focusRow = (r: RowId) => {
        setActiveId(r);
        rowEls.current.get(r)?.focus();
    };

    /** Run an action if it fits the ids it would act on and is enabled. */
    const run = (action: GridActionItem | undefined, ids: RowId[]) => {
        if (!action || isGridActionDisabled(action, ids)) return false;
        if (!(action.when ?? ['none']).includes(gridSelectionState(ids.length))) return false;
        action.onSelect(ids);
        return true;
    };
    const defaultAction = actions.find((a) => a.isDefault);
    const openRow = (r: RowId) => {
        const ids = isSelected(r) ? selectedIds : [r];
        if (!isSelected(r)) select([r]);
        run(defaultAction, ids);
    };

    // ---- expandable rows --------------------------------------------------------
    const rowById = (r: RowId) => inputRows.find((row) => getRowId(row) === r);
    const canExpand = (row: T) => isExpandable?.(row) ?? false;
    const toggleRowExpanded = (r: RowId) => {
        const row = rowById(r);
        if (!row || !canExpand(row)) return;
        setExpandedRows((s) => {
            const next = new Set(s);
            if (next.has(r)) next.delete(r);
            else next.add(r);
            return next;
        });
    };

    // ---- copy -------------------------------------------------------------------
    const exportColumns = () => layout.map((l) => columnById(l.id)!).filter(Boolean);
    const selectedRows = () => visibleRows.filter((row) => isSelected(getRowId(row)));
    const copySelection = async () => {
        const focused = activeId !== null ? rowById(activeId) : undefined;
        const rows = selectedIds.length ? selectedRows() : focused ? [focused] : [];
        if (rows.length === 0) return '';
        const text = toTsv(rows, exportColumns());
        try {
            await navigator.clipboard?.writeText(text);
        } catch {
            // Clipboard refused (permissions, insecure context): the text is still returned.
        }
        return text;
    };

    // ---- keyboard ---------------------------------------------------------------
    const onRowClick = (event: MouseEvent<HTMLElement>, r: RowId) => {
        if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
        setActiveId(r);
        if (mode === 'none') return;
        if (mode === 'multiple' && event.shiftKey && anchor !== null) {
            const span = range(anchor, r);
            select(isModClick(event) ? [...selectedIds, ...span] : span);
            return;
        }
        if (mode === 'multiple' && isModClick(event)) {
            toggle(r);
            return;
        }
        select([r]);
        setAnchor(r);
    };

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        const target = event.target as Element;
        if (isEditable(target)) return;
        const rowEl = rowOf(target);
        const rowId = rowEl ? rowIdFrom(rowEl, rowIds) : null;

        // 1. The app's own shortcuts, for actions that fit the current selection.
        for (const action of visibleGridActions(actions, selectionState).flat()) {
            if (action.shortcut && matchShortcut(event, action.shortcut)) {
                event.preventDefault();
                run(action, selectedIds);
                return;
            }
        }

        // 2. Built-in grid keys.
        const mod = event.metaKey || event.ctrlKey;
        if (event.key === 'Escape' && selectedIds.length > 0) {
            event.preventDefault();
            clear();
            return;
        }
        if (mod && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'a') {
            if (mode !== 'multiple') return;
            event.preventDefault();
            selectAll();
            return;
        }
        if (mod && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'c') {
            // Text the person highlighted is theirs to copy.
            if (window.getSelection?.()?.toString()) return;
            if (selectedIds.length === 0 && rowId === null) return;
            event.preventDefault();
            void copySelection();
            return;
        }
        if (rowId === null || (target !== rowEl && target.closest(INTERACTIVE))) return;

        const index = rowIds.indexOf(rowId);
        const moveTo = (next: number) => {
            const to = rowIds[Math.max(0, Math.min(rowIds.length - 1, next))];
            if (to === undefined) return;
            event.preventDefault();
            focusRow(to);
            if (event.shiftKey && mode === 'multiple') {
                const from = anchor ?? rowId;
                setAnchor(from);
                select(range(from, to));
            } else if (!mod && mode !== 'none') {
                // Selection follows focus, as in a file manager. ⌘/Ctrl+arrow
                // moves focus alone, to reach a row without losing the set.
                select([to]);
                setAnchor(to);
            }
        };
        const row = rowById(rowId);
        switch (event.key) {
            case 'ArrowDown':
                return moveTo(index + 1);
            case 'ArrowUp':
                return moveTo(index - 1);
            case 'Home':
                return moveTo(0);
            case 'End':
                return moveTo(rowIds.length - 1);
            case 'ArrowRight':
            case 'ArrowLeft': {
                // Open with →, close with ← — the tree-grid convention (mirrored in RTL).
                if (!row || !canExpand(row)) return;
                const rtl = (target as HTMLElement).closest('[dir=rtl]') !== null;
                const opening = (event.key === 'ArrowRight') !== rtl;
                if (opening !== expandedRows.has(rowId)) {
                    event.preventDefault();
                    toggleRowExpanded(rowId);
                }
                return;
            }
            case ' ':
                event.preventDefault();
                if (mode === 'multiple') toggle(rowId);
                else if (mode === 'single') select([rowId]);
                return;
            case 'Enter':
                event.preventDefault();
                openRow(rowId);
                return;
        }
    };

    const onContextMenu = (event: MouseEvent<HTMLElement>) => {
        const rowEl = rowOf(event.target);
        if (!rowEl) {
            // Empty space: the menu is about the whole list.
            clear();
            return;
        }
        const r = rowIdFrom(rowEl, rowIds);
        if (r === null) return;
        setActiveId(r);
        // Right-clicking outside the selection makes that row the selection,
        // as a file manager does; inside it, the selection stays.
        if (!isSelected(r)) {
            select([r]);
            setAnchor(r);
        }
    };

    // ---- views ------------------------------------------------------------------
    const snapshot = (): GridViewState => ({
        hiddenColumns: prefs.hiddenColumns,
        columnOrder: prefs.columnOrder,
        columnWidths: prefs.columnWidths,
        pinned: prefs.pinned,
        sorting: prefs.sorting,
        filters,
        groupBy: prefs.groupBy,
        density: prefs.density,
    });
    const activeView = prefs.views.find((v) => v.id === prefs.activeView) ?? null;

    // ---- editing ----------------------------------------------------------------
    const cellValue = (row: T, columnId: string) => {
        const edit = edits.get(cellKey(getRowId(row), columnId));
        if (edit && edit.row === row) return edit.value;
        const col = columnById(columnId);
        return col ? columnValue(col, row) : undefined;
    };
    const setEdit = (k: string, entry: { row: T; value: unknown } | null) =>
        setEdits((e) => {
            const next = new Map(e);
            if (entry === null) next.delete(k);
            else next.set(k, entry);
            return next;
        });

    return {
        id,
        preferences,
        actions,
        columns,
        columnById,
        layout,
        visibleRows,
        lines,
        getRowId,
        mode,
        dataMode,

        query,
        sorting,
        toggleSort: (columnId, additive = false) => {
            const col = columnById(columnId);
            if (!col || col.sortable === false) return;
            preferences.set((p) => {
                const current = p.sorting.find((s) => s.id === columnId);
                const cycled: GridSort | null = !current
                    ? { id: columnId, desc: false }
                    : !current.desc
                      ? { id: columnId, desc: true }
                      : null;
                if (additive && current) {
                    return {
                        sorting: p.sorting.flatMap((s) =>
                            s.id === columnId ? (cycled ? [cycled] : []) : [s],
                        ),
                    };
                }
                const rest = additive ? p.sorting.filter((s) => s.id !== columnId) : [];
                return { sorting: cycled ? [...rest, cycled] : rest };
            });
        },
        setSorting: (next) => preferences.set({ sorting: next }),
        filters,
        setFilter: (filter) =>
            setFilters((fs) => [...fs.filter((f) => f.id !== filter.id), filter]),
        removeFilter: (columnId) => setFilters((fs) => fs.filter((f) => f.id !== columnId)),
        clearFilters: () => setFilters([]),

        canGroup: client && columns.some((c) => c.groupable),
        groupBy,
        setGroupBy: (ids) => {
            if (!client) return;
            preferences.set({ groupBy: ids.filter((g) => columnById(g)?.groupable) });
        },
        toggleGroup: (key) =>
            setExpandedGroups((s) => {
                const next = new Set(s);
                if (next.has(key)) next.delete(key);
                else next.add(key);
                return next;
            }),
        isGroupExpanded: (key) => expandedGroups.has(key),
        expandAllGroups: () => {
            const keys = new Set<string>();
            const walk = (gs: typeof groups) =>
                gs.forEach((g) => (keys.add(g.key), walk(g.children)));
            walk(groups);
            setExpandedGroups(keys);
        },
        collapseAllGroups: () => setExpandedGroups(new Set()),

        hasExpandableRows,
        canExpand,
        isRowExpanded: (r) => expandedRows.has(r),
        toggleRowExpanded,

        setColumnWidth: (columnId, width) =>
            preferences.set((p) => ({
                columnWidths: { ...p.columnWidths, [columnId]: Math.round(width) },
            })),
        moveColumn: (columnId, toIndex) =>
            preferences.set((p) => ({
                columnOrder: moveInOrder(
                    normaliseOrder(
                        p.columnOrder,
                        columns.map((c) => c.id),
                    ),
                    columnId,
                    toIndex,
                ),
            })),
        pinColumn: (columnId, side) =>
            preferences.set((p) => ({ pinned: { ...p.pinned, [columnId]: side } })),

        views: prefs.views,
        activeViewId: activeView?.id ?? null,
        isViewModified: activeView !== null && viewKey(activeView.state) !== viewKey(snapshot()),
        saveView: (name) => {
            const trimmed = name.trim();
            if (!trimmed) return null;
            const view: GridView = {
                id: `view-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
                name: trimmed,
                state: snapshot(),
            };
            preferences.set((p) => ({ views: [...p.views, view], activeView: view.id }));
            return view;
        },
        applyView: (viewId) => {
            const view = prefs.views.find((v) => v.id === viewId);
            if (!view) return;
            const s = view.state;
            preferences.set({
                hiddenColumns: s.hiddenColumns ?? [],
                columnOrder: s.columnOrder ?? [],
                columnWidths: s.columnWidths ?? {},
                pinned: s.pinned ?? {},
                sorting: s.sorting ?? [],
                groupBy: s.groupBy ?? [],
                density: s.density ?? prefs.density,
                activeView: view.id,
            });
            setFilters(s.filters ?? []);
        },
        updateView: (viewId) => {
            const state = snapshot();
            preferences.set((p) => ({
                views: p.views.map((v) => (v.id === viewId ? { ...v, state } : v)),
                activeView: viewId,
            }));
        },
        renameView: (viewId, name) => {
            const trimmed = name.trim();
            if (!trimmed) return;
            preferences.set((p) => ({
                views: p.views.map((v) => (v.id === viewId ? { ...v, name: trimmed } : v)),
            }));
        },
        deleteView: (viewId) =>
            preferences.set((p) => ({
                views: p.views.filter((v) => v.id !== viewId),
                activeView: p.activeView === viewId ? null : p.activeView,
            })),

        exportCsv: ({ scope = 'all', separator, bom } = {}) =>
            toCsv(scope === 'selection' ? selectedRows() : visibleRows, exportColumns(), {
                separator,
                bom,
            }),
        copySelection,

        editing,
        editError,
        editPending,
        startEdit: (rowId, columnId) => {
            if (!columnById(columnId)?.editable || !rowById(rowId)) return;
            setEditError(null);
            setEditing({ rowId, columnId });
        },
        cancelEdit: () => {
            setEditing(null);
            setEditError(null);
        },
        commitEdit: async (value) => {
            if (!editing) return false;
            const col = columnById(editing.columnId);
            const row = rowById(editing.rowId);
            if (!col?.editable || !row) return false;
            const refusal = col.editable.validate?.(value, row) ?? null;
            if (refusal) {
                setEditError(refusal);
                return false;
            }
            const k = cellKey(editing.rowId, col.id);
            const previous = cellValue(row, col.id);
            setEdit(k, { row, value });
            setEditPending(true);
            try {
                await col.editable.onCommit(row, value, previous);
                setEditing(null);
                setEditError(null);
                return true;
            } catch (error) {
                setEdit(k, null);
                setEditError(error instanceof Error ? error.message : String(error));
                return false;
            } finally {
                setEditPending(false);
            }
        },
        cellValue,

        allowedMode: selection,
        selectedIds,
        selectionState,
        visibleActions: visibleGridActions(actions, selectionState),
        isSelected,
        select,
        toggle,
        selectAll,
        clear,
        showCheckboxes: mode === 'multiple',
        getTableProps: () => ({
            role: 'grid',
            ...(mode === 'multiple' ? { 'aria-multiselectable': true } : {}),
        }),
        getRowProps: (r) => {
            return {
                'data-grid-row-id': String(r),
                'data-state': isSelected(r) ? 'selected' : undefined,
                ...(mode === 'none' ? {} : { 'aria-selected': isSelected(r) }),
                // No aria-expanded here: ARIA allows it on a row only in a treegrid.
                // The expand button carries it (and aria-controls the detail row).
                tabIndex: r === focusable ? 0 : -1,
                ref: (el: HTMLElement | null) => {
                    if (el) rowEls.current.set(r, el);
                    else rowEls.current.delete(r);
                },
                onClick: (event: MouseEvent<HTMLElement>) => onRowClick(event, r),
                onDoubleClick: (event: MouseEvent<HTMLElement>) => {
                    if (event.target instanceof Element && event.target.closest(INTERACTIVE))
                        return;
                    openRow(r);
                },
                // Shift-click extends the selection; it must not also select text.
                onMouseDown: (event: MouseEvent<HTMLElement>) => {
                    if (!event.shiftKey) return;
                    event.preventDefault();
                    // preventDefault also stops the row taking focus; the keyboard
                    // must carry on from the row that was clicked.
                    event.currentTarget.focus();
                },
                onFocus: () => setActiveId(r),
                className:
                    'cursor-default outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
            };
        },
        getRowCheckboxProps: (r, label) => ({
            type: 'checkbox',
            'aria-label': label,
            checked: isSelected(r),
            // The row is the tab stop; Space on the row toggles.
            tabIndex: -1,
            onChange: () => toggle(r),
        }),
        getSelectAllProps: (label) => {
            const all = rowIds.length > 0 && rowIds.every((r) => isSelected(r));
            const some = !all && selectedIds.length > 0;
            return {
                type: 'checkbox',
                'aria-label': label,
                checked: all,
                ref: (el: HTMLInputElement | null) => {
                    if (el) el.indeterminate = some;
                },
                onChange: () => (all ? clear() : selectAll()),
            } as InputHTMLAttributes<HTMLInputElement>;
        },
        onKeyDown,
        onContextMenu,
    };
}

/** Map the DOM attribute back to the original id, keeping numbers numbers. */
function rowIdFrom(el: HTMLElement, rowIds: RowId[]): RowId | null {
    const raw = el.dataset.gridRowId;
    return rowIds.find((r) => String(r) === raw) ?? null;
}
