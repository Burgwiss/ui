import type { GridFilter, GridSort } from './grid/types';
export type GridDensity = 'comfortable' | 'compact';
/** What a saved view restores. Every field is optional: a view keeps what it names. */
export interface GridViewState {
    hiddenColumns?: string[];
    columnOrder?: string[];
    columnWidths?: Record<string, number>;
    pinned?: Record<string, 'left' | 'right' | null>;
    sorting?: GridSort[];
    filters?: GridFilter[];
    groupBy?: string[];
    density?: GridDensity;
}
/** A named snapshot of a grid's setup, e.g. "Unbezahlt diesen Monat". */
export interface GridView {
    id: string;
    name: string;
    state: GridViewState;
}
/** What a person may change about a grid, remembered per grid. */
export interface GridPreferences {
    /** Column ids the person hid. Stored as "hidden" so a column added later shows by default. */
    hiddenColumns: string[];
    density: GridDensity;
    /** Whether rows can be selected. Only matters where the app allows selection at all. */
    selection: boolean;
    /** Column ids in display order. Columns not listed follow, in definition order. */
    columnOrder: string[];
    /** Widths the person dragged, by column id. */
    columnWidths: Record<string, number>;
    /** Pinning the person chose; `null` unpins a column that pins itself. */
    pinned: Record<string, 'left' | 'right' | null>;
    sorting: GridSort[];
    /** Column ids to group by, outermost first. */
    groupBy: string[];
    views: GridView[];
    /** The view last applied, or null. */
    activeView: string | null;
}
/** The slice of `Storage` the hook needs — `localStorage` by default. */
export interface GridPreferenceStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
export interface GridPreferencesApi {
    values: GridPreferences;
    /** True while nothing differs from the defaults — "reset" has nothing to do. */
    isDefault: boolean;
    isColumnVisible: (id: string) => boolean;
    setColumnVisible: (id: string, visible: boolean) => void;
    setDensity: (density: GridDensity) => void;
    setSelectionEnabled: (enabled: boolean) => void;
    /**
     * Change several settings at once; stored immediately. Pass a function to
     * build on the latest settings — needed when one handler changes several.
     */
    set: (patch: Partial<GridPreferences> | ((current: GridPreferences) => Partial<GridPreferences>)) => void;
    /** Back to the defaults, and forget what was stored. */
    reset: () => void;
}
/** The storage key for one grid. Exported so an app can clear it (e.g. on sign-out). */
export declare function gridPreferencesKey(gridId: string): string;
/**
 * Remembers how one grid is set up — columns (hidden, order, widths, pinning),
 * density, sorting, grouping and saved views — in `localStorage`, under a key
 * built from `gridId`.
 *
 * `gridId` is a stable name the app chooses, such as the route name
 * (`'admin.courses'`). Not the URL: a URL changes with filters, the page, the
 * locale and route renames, and each change would lose the settings.
 *
 * Settings follow the browser, not the person. To keep two people on one
 * browser apart, put the user id in `gridId`.
 */
export declare function useGridPreferences(gridId: string, options?: {
    defaults?: Partial<GridPreferences>;
    /** Defaults to `localStorage`. `null` keeps settings for this visit only. */
    storage?: GridPreferenceStorage | null;
}): GridPreferencesApi;
