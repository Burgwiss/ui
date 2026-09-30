import {
    useRef,
    useState,
    type InputHTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
    type TableHTMLAttributes,
} from 'react';

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
} from './useGridPreferences';

/** What the app allows. The person can still switch selection off in ⋮. */
export type GridSelectionMode = 'none' | 'single' | 'multiple';

export interface UseGridOptions {
    /** Stable name for this grid, e.g. the route name. Keys the remembered settings. */
    id: string;
    /** The rows on screen, in order. Selection never outlives a row that left. */
    rowIds: RowId[];
    /** Default `'multiple'`. */
    selection?: GridSelectionMode;
    /** Everything the grid lets you do, each with the selection states it fits. */
    actions?: GridActionItem[];
    /** Rows selected on first render. */
    defaultSelectedIds?: RowId[];
    defaults?: Partial<GridPreferences>;
    storage?: GridPreferenceStorage | null;
}

export interface GridApi {
    id: string;
    preferences: GridPreferencesApi;
    actions: GridActionItem[];
    /** What the app allows. */
    allowedMode: GridSelectionMode;
    /** What is in effect — `'none'` while the person switched selection off. */
    mode: GridSelectionMode;
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

/**
 * Everything a grid does besides looking like one: which rows are selected
 * (click, ⌘/Ctrl-click, Shift-click, checkboxes, keyboard), which actions fit
 * that selection, the right-click menu, keyboard shortcuts and the settings
 * it remembers. The app still renders its own table and spreads the props.
 *
 *   const grid = useGrid({ id: 'admin.courses', rowIds, actions });
 *   <GridPage grid={grid} …>
 *     <Table {...grid.getTableProps()}>…<TableRow {...grid.getRowProps(row.id)}>
 */
export function useGrid({
    id,
    rowIds,
    selection = 'multiple',
    actions = [],
    defaultSelectedIds = [],
    defaults,
    storage,
}: UseGridOptions): GridApi {
    const preferences = useGridPreferences(id, { defaults, storage });
    const [selected, setSelected] = useState<RowId[]>(defaultSelectedIds);
    const [anchor, setAnchor] = useState<RowId | null>(null);
    const [activeId, setActiveId] = useState<RowId | null>(null);
    const rows = useRef(new Map<RowId, HTMLElement>());

    const mode: GridSelectionMode =
        selection !== 'none' && preferences.values.selection ? selection : 'none';
    const present = new Set(rowIds);
    const selectedIds = mode === 'none' ? [] : selected.filter((r) => present.has(r));
    const selectionState = gridSelectionState(selectedIds.length);
    const isSelected = (r: RowId) => selectedIds.includes(r);
    const focusable = activeId !== null && present.has(activeId) ? activeId : (rowIds[0] ?? null);

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
        rows.current.get(r)?.focus();
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
        switch (event.key) {
            case 'ArrowDown':
                return moveTo(index + 1);
            case 'ArrowUp':
                return moveTo(index - 1);
            case 'Home':
                return moveTo(0);
            case 'End':
                return moveTo(rowIds.length - 1);
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

    return {
        id,
        preferences,
        actions,
        allowedMode: selection,
        mode,
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
        getRowProps: (r) => ({
            'data-grid-row-id': String(r),
            'data-state': isSelected(r) ? 'selected' : undefined,
            ...(mode === 'none' ? {} : { 'aria-selected': isSelected(r) }),
            tabIndex: r === focusable ? 0 : -1,
            ref: (el: HTMLElement | null) => {
                if (el) rows.current.set(r, el);
                else rows.current.delete(r);
            },
            onClick: (event: MouseEvent<HTMLElement>) => onRowClick(event, r),
            onDoubleClick: (event: MouseEvent<HTMLElement>) => {
                if (event.target instanceof Element && event.target.closest(INTERACTIVE)) return;
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
        }),
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
