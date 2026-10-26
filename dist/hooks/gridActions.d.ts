import type { ReactNode } from 'react';
export type RowId = string | number;
/** How many rows are selected, in the three cases that change what you can do. */
export type GridSelectionState = 'none' | 'one' | 'many';
export declare function gridSelectionState(count: number): GridSelectionState;
/**
 * One thing a grid lets you do. The same list drives the toolbar, the
 * right-click menu and the keyboard, so an action is described once.
 */
export interface GridActionItem {
    id: string;
    /** Name, tooltip and menu text. */
    label: string;
    icon: ReactNode;
    /** Runs with the ids it applies to — the selection, or the row that was opened. */
    onSelect: (ids: RowId[]) => void;
    /**
     * The selection states this action appears in. Default `['none']`.
     * "Neu" → `['none']`; "Bearbeiten" → `['one']`; "Löschen" → `['one', 'many']`.
     */
    when?: GridSelectionState[];
    /** Actions with the same group sit together; a separator stands between groups. */
    group?: string;
    /** `primary`: the one filled icon button. `destructive`: red on hover and in menus. */
    tone?: 'default' | 'primary' | 'destructive';
    /** e.g. `'Mod+D'`, `'Delete'`, `'Mod+Shift+E'`. Works while focus is in the grid page. */
    shortcut?: string;
    /** The row's main action: runs on double-click and on Enter on a row. */
    isDefault?: boolean;
    /** A function gets the ids the action would act on — e.g. "not for archived courses". */
    disabled?: boolean | ((ids: RowId[]) => boolean);
    /** Shown in the tooltip and the menu while disabled. */
    disabledReason?: string;
}
export declare function isGridActionDisabled(item: GridActionItem, ids: RowId[]): boolean;
/** The actions for a selection state, grouped in first-seen order, empty groups dropped. */
export declare function visibleGridActions(items: GridActionItem[], state: GridSelectionState): GridActionItem[][];
