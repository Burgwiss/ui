import { type ReactNode } from 'react';
import { type GridActionItem, type RowId, type ShortcutLabels } from '../../hooks';
/**
 * A grid's action toolbar. Flat, like a desktop app's: no frame, one height,
 * one plain line of icon buttons — each with a tooltip naming it and its
 * shortcut — and at most one filled primary action (`tone: 'primary'`).
 *
 * It shows only the actions whose `when` fits the selection: nothing, one row,
 * or many rows. `children` come first (GridPage puts "✕ 3 ausgewählt" there).
 * It takes the room it is given (put it in a flex row); with `moreLabel`, the
 * icons that do not fit go behind a "…" menu, in order, and come back when
 * there is room again. Their keyboard shortcuts keep working either way.
 *
 * Use it above a data grid where one list of actions (`GridActionItem`) also
 * drives the right-click menu (`GridActionMenuItems`); for a one-off button
 * row just use `Button`s.
 *
 * @summary Selection-aware icon toolbar for a grid: shows only the actions that fit no, one or many selected rows.
 */
export declare function GridActions({ label, items, selectedIds, shortcutLabels, moreLabel, children, }: {
    /** The toolbar's accessible name. */
    label: string;
    /** Name and tooltip of the "…" menu for the actions that do not fit, e.g. "Weitere Aktionen". Without it nothing overflows. */
    moreLabel?: string;
    /**
     * The actions. Each one's `when` decides in which selection state (none, one, many) it shows;
     * `group` orders them and separates them in the menus. Default: none.
     */
    items?: GridActionItem[];
    /** Ids of the selected rows. The count picks the state; the ids are passed to each action's `onSelect`. */
    selectedIds?: RowId[];
    /** How key names in shortcut hints are written in the app's language, e.g. `{ Mod: 'Strg', Delete: 'Entf' }`. */
    shortcutLabels?: ShortcutLabels;
    /** Content placed before the actions, e.g. a "3 selected" chip with a clear button. */
    children?: ReactNode;
}): import("react").JSX.Element;
/**
 * The same actions as menu items, for the grid's right-click menu. Render
 * inside a ContextMenuContent.
 */
export declare function GridActionMenuItems({ items, ids, shortcutLabels, }: {
    /** The actions already split into groups (as `visibleGridActions` returns); a separator is drawn between groups. */
    items: GridActionItem[][];
    /** The ids the actions apply to; passed to each `onSelect` and to `disabled` predicates. */
    ids: RowId[];
    /** How key names in shortcut hints are written in the app's language. */
    shortcutLabels?: ShortcutLabels;
}): import("react").JSX.Element;
