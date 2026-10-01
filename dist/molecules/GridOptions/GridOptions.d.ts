import type { GridPreferencesApi } from '../../hooks';
import { type GridOptionsViews } from './GridViews';
export interface GridOptionsColumn {
    /** Stable column id; the key under which visibility is stored and the argument to `preferences.isColumnVisible`. */
    id: string;
    /** Visible name of the column in the "Columns" submenu, already translated. */
    label: string;
    /** False for the column that names the row — a grid without it is unreadable. */
    hideable?: boolean;
}
export interface GridOptionsProps {
    /** `grid.preferences` from `useGrid`, or `useGridPreferences(id)` on its own. */
    preferences: GridPreferencesApi;
    /** The columns the person may show or hide, in menu order. */
    columns: GridOptionsColumn[];
    /** Offer the "select rows" switch. Pass `grid.allowedMode !== 'none'`. */
    canSelect?: boolean;
    /**
     * Saved views (from `useGridPreferences`): adds an "Ansichten" submenu at the top of the menu
     * to switch, save, update, rename and delete them, and a dot on the ⋮ button while the setup
     * differs from the active view. Without it the menu has no views entry.
     */
    views?: GridOptionsViews;
    /** All visible text of the menu, in the app's language (required). */
    labels: {
        /** The ⋮ button's name and tooltip, e.g. "Tabellenoptionen". */
        trigger: string;
        /** Label of the submenu that lists the column checkboxes, e.g. "Spalten". */
        columns: string;
        /** Heading above the row-height choices, e.g. "Zeilenhöhe". */
        density: string;
        /** Radio option for the roomier row height. */
        comfortable: string;
        /** Radio option for the tighter row height. */
        compact: string;
        /** e.g. "Zeilen auswählen". */
        selection: string;
        /** Menu entry that restores column, density and selection defaults; disabled when nothing differs. */
        reset: string;
    };
}
/**
 * The ⋮ menu at the right end of a grid toolbar: the saved views (an optional
 * submenu), which columns show (a submenu), how dense the rows are, whether rows can be selected, and a way
 * back to the defaults. Every choice is remembered per grid (in localStorage under
 * `burgwiss-ui:grid:<gridId>`, so it survives a reload). It holds no state of its
 * own: pass the `preferences` object from `useGrid` (or `useGridPreferences`). Pass `views`
 * to add the saved-views submenu; saving and renaming then ask for a name in a small dialog,
 * deleting asks for confirmation, and focus returns to the ⋮ button afterwards. For a generic
 * actions menu use `DropdownMenu`.
 *
 * @summary Grid toolbar options menu for saved views, column visibility, row density, row selection and reset.
 */
export declare function GridOptions({ preferences, columns, canSelect, views, labels, }: GridOptionsProps): import("react").JSX.Element;
