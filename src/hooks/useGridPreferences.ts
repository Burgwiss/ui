import { useEffect, useMemo, useState } from 'react';

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

const EMPTY: GridPreferences = {
    hiddenColumns: [],
    density: 'comfortable',
    selection: true,
    columnOrder: [],
    columnWidths: {},
    pinned: {},
    sorting: [],
    groupBy: [],
    views: [],
    activeView: null,
};

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
    set: (
        patch: Partial<GridPreferences> | ((current: GridPreferences) => Partial<GridPreferences>),
    ) => void;
    /** Back to the defaults, and forget what was stored. */
    reset: () => void;
}

/**
 * Bump when the stored shape changes incompatibly. A stored value with another
 * version is ignored, never half-read. Adding a field is compatible: an entry
 * without it reads the default.
 */
const VERSION = 1;

/** The storage key for one grid. Exported so an app can clear it (e.g. on sign-out). */
export function gridPreferencesKey(gridId: string): string {
    return `burgwiss-ui:grid:${gridId}`;
}

function browserStorage(): GridPreferenceStorage | null {
    try {
        return typeof window === 'undefined' ? null : window.localStorage;
    } catch {
        // Some privacy modes throw on the mere access.
        return null;
    }
}

/** Stable JSON: object keys sorted, hidden columns as a set. */
function canonical(p: GridPreferences): string {
    const sortKeys = (v: unknown): unknown =>
        Array.isArray(v)
            ? v.map(sortKeys)
            : v && typeof v === 'object'
              ? Object.fromEntries(
                    Object.keys(v as object)
                        .sort()
                        .map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]),
                )
              : v;
    return JSON.stringify(sortKeys({ ...p, hiddenColumns: [...p.hiddenColumns].sort() }));
}

function same(a: GridPreferences, b: GridPreferences): boolean {
    return canonical(a) === canonical(b);
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

const strings = (v: unknown): string[] | null =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : null;

/** Each field is checked on its own: one bad field falls back, the rest survive. */
function readFields(data: Record<string, unknown>, defaults: GridPreferences): GridPreferences {
    const d = data;
    return {
        hiddenColumns: strings(d.hiddenColumns) ?? defaults.hiddenColumns,
        density:
            d.density === 'compact' || d.density === 'comfortable' ? d.density : defaults.density,
        // Absent in entries written before the field existed: take the default.
        selection: typeof d.selection === 'boolean' ? d.selection : defaults.selection,
        columnOrder: strings(d.columnOrder) ?? defaults.columnOrder,
        columnWidths: isRecord(d.columnWidths)
            ? Object.fromEntries(
                  Object.entries(d.columnWidths).filter(
                      (e): e is [string, number] =>
                          typeof e[1] === 'number' && Number.isFinite(e[1]) && e[1] > 0,
                  ),
              )
            : defaults.columnWidths,
        pinned: isRecord(d.pinned)
            ? (Object.fromEntries(
                  Object.entries(d.pinned).filter(
                      ([, side]) => side === 'left' || side === 'right' || side === null,
                  ),
              ) as GridPreferences['pinned'])
            : defaults.pinned,
        sorting: Array.isArray(d.sorting)
            ? d.sorting.filter(
                  (s): s is GridSort =>
                      isRecord(s) && typeof s.id === 'string' && typeof s.desc === 'boolean',
              )
            : defaults.sorting,
        groupBy: strings(d.groupBy) ?? defaults.groupBy,
        views: Array.isArray(d.views)
            ? d.views.filter(
                  (x): x is GridView =>
                      isRecord(x) &&
                      typeof x.id === 'string' &&
                      typeof x.name === 'string' &&
                      isRecord(x.state),
              )
            : defaults.views,
        activeView: typeof d.activeView === 'string' ? d.activeView : defaults.activeView,
    };
}

function read(
    storage: GridPreferenceStorage | null,
    key: string,
    defaults: GridPreferences,
): GridPreferences {
    try {
        const raw = storage?.getItem(key);
        if (!raw) return defaults;
        const data: unknown = JSON.parse(raw);
        if (!isRecord(data) || data.v !== VERSION) return defaults;
        return readFields(data, defaults);
    } catch {
        // Corrupt JSON, or storage that throws: the grid still works, with defaults.
        return defaults;
    }
}

function write(
    storage: GridPreferenceStorage | null,
    key: string,
    next: GridPreferences,
    defaults: GridPreferences,
): void {
    try {
        if (same(next, defaults)) storage?.removeItem(key);
        else storage?.setItem(key, JSON.stringify({ v: VERSION, ...next }));
    } catch {
        // Quota full or storage blocked: keep the choice for this visit only.
    }
}

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
export function useGridPreferences(
    gridId: string,
    options: {
        defaults?: Partial<GridPreferences>;
        /** Defaults to `localStorage`. `null` keeps settings for this visit only. */
        storage?: GridPreferenceStorage | null;
    } = {},
): GridPreferencesApi {
    const key = gridPreferencesKey(gridId);
    const storage = options.storage === undefined ? browserStorage() : options.storage;
    // A fresh `defaults` object each render must not look like a change.
    const defaultsJson = JSON.stringify({ ...EMPTY, ...options.defaults });
    const defaults = useMemo(() => JSON.parse(defaultsJson) as GridPreferences, [defaultsJson]);

    const [state, setState] = useState(() => ({ key, prefs: read(storage, key, defaults) }));
    let prefs = state.prefs;
    if (state.key !== key) {
        // Another grid on the same component: load its settings in this render,
        // so the old grid's columns never flash on the new one.
        prefs = read(storage, key, defaults);
        setState({ key, prefs });
    }

    // Another tab changed the same grid: follow it.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const onStorage = (event: StorageEvent) => {
            if (event.key === key) setState({ key, prefs: read(storage, key, defaults) });
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [key, storage, defaults]);

    // Functional: several changes in one handler each build on the last, instead
    // of all starting from the settings as they were when the handler began.
    // The storage write inside the updater is idempotent, so a repeated call
    // (React StrictMode) writes the same value twice and nothing else.
    const update = (change: (current: GridPreferences) => GridPreferences) => {
        setState((s) => {
            const base = s.key === key ? s.prefs : read(storage, key, defaults);
            const next = change(base);
            write(storage, key, next, defaults);
            return { key, prefs: next };
        });
    };

    return {
        values: prefs,
        isDefault: same(prefs, defaults),
        isColumnVisible: (id) => !prefs.hiddenColumns.includes(id),
        setColumnVisible: (id, visible) =>
            update((p) => ({
                ...p,
                hiddenColumns: visible
                    ? p.hiddenColumns.filter((x) => x !== id)
                    : [...p.hiddenColumns.filter((x) => x !== id), id],
            })),
        setDensity: (density) => update((p) => ({ ...p, density })),
        setSelectionEnabled: (selection) => update((p) => ({ ...p, selection })),
        set: (patch) =>
            update((p) => ({ ...p, ...(typeof patch === 'function' ? patch(p) : patch) })),
        reset: () => update(() => defaults),
    };
}
