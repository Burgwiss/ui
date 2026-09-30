import { useEffect, useMemo, useState } from 'react';

export type GridDensity = 'comfortable' | 'compact';

/** What a person may change about a grid, remembered per grid. */
export interface GridPreferences {
    /** Column ids the person hid. Stored as "hidden" so a column added later shows by default. */
    hiddenColumns: string[];
    density: GridDensity;
    /** Whether rows can be selected. Only matters where the app allows selection at all. */
    selection: boolean;
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
    /** Back to the defaults, and forget what was stored. */
    reset: () => void;
}

/**
 * Bump when the stored shape changes incompatibly. A stored value with another
 * version is ignored, never half-read.
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

function same(a: GridPreferences, b: GridPreferences): boolean {
    return (
        a.density === b.density &&
        a.selection === b.selection &&
        a.hiddenColumns.length === b.hiddenColumns.length &&
        a.hiddenColumns.every((id) => b.hiddenColumns.includes(id))
    );
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
        if (typeof data !== 'object' || data === null || (data as { v?: unknown }).v !== VERSION) {
            return defaults;
        }
        const { hiddenColumns, density, selection } = data as Record<string, unknown>;
        return {
            hiddenColumns: Array.isArray(hiddenColumns)
                ? hiddenColumns.filter((id): id is string => typeof id === 'string')
                : defaults.hiddenColumns,
            density:
                density === 'compact' || density === 'comfortable' ? density : defaults.density,
            // Absent in entries written before the field existed: take the default.
            selection: typeof selection === 'boolean' ? selection : defaults.selection,
        };
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
 * Remembers how one grid is set up — hidden columns and row density — in
 * `localStorage`, under a key built from `gridId`.
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
    const defaultsJson = JSON.stringify({
        hiddenColumns: [],
        density: 'comfortable',
        selection: true,
        ...options.defaults,
    });
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

    const update = (change: (current: GridPreferences) => GridPreferences) => {
        const next = change(prefs);
        write(storage, key, next, defaults);
        setState({ key, prefs: next });
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
        reset: () => update(() => defaults),
    };
}
