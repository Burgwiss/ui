import type { ReactNode } from 'react';

import type { RowId } from '../gridActions';

/** How a column filters. The type decides the operators and the filter UI. */
export type GridFilterDef =
    | { type: 'text' }
    | { type: 'choice'; options: { value: string; label: string }[] }
    | { type: 'number' }
    | { type: 'date' };

export type GridFilterType = GridFilterDef['type'];

/** One active filter on one column. */
export type GridFilter =
    | { id: string; type: 'text'; op: 'contains' | 'equals' | 'startsWith'; value: string }
    | { id: string; type: 'choice'; values: string[] }
    | { id: string; type: 'number'; min?: number; max?: number }
    /** ISO dates (`YYYY-MM-DD`), inclusive. */
    | { id: string; type: 'date'; from?: string; to?: string };

export interface GridSort {
    id: string;
    desc: boolean;
}

export type GridAggregate = 'count' | 'sum' | 'avg' | 'min' | 'max';

/** Inline editing for one column. */
export interface GridEditDef<T> {
    type: 'text' | 'number' | 'choice';
    options?: { value: string; label: string }[];
    /**
     * Save the new value. Resolve to keep it; reject (with a message) to put the
     * old value back and show the message. Called with the value before the edit,
     * so the app can offer "Rückgängig" by saving `previous` again.
     */
    onCommit: (row: T, next: string | number, previous: unknown) => Promise<void> | void;
    /** Return an error message to refuse a value before saving. */
    validate?: (value: string | number, row: T) => string | null;
}

/** A column: what it shows, how it sorts, filters, groups, exports and edits. */
export interface GridColumn<T> {
    /** Stable id — also the key for remembered width, order, pinning and filters. */
    id: string;
    /** Header text; also used in menus, filter chips and exports. */
    header: string;
    /** The raw value for sorting, filtering, grouping, copying and exporting. Default: `row[id]`. */
    value?: (row: T) => unknown;
    /** What the cell shows. Default: the value as text. */
    cell?: (row: T) => ReactNode;
    /** Text for copy and CSV when the raw value is not what a person should read. */
    exportValue?: (row: T) => string;
    /** Default true. */
    sortable?: boolean;
    /** Custom comparison of two raw values; ascending. */
    compare?: (a: unknown, b: unknown) => number;
    filter?: GridFilterDef;
    /** Starting width in px. */
    width?: number;
    /** Default 64. */
    minWidth?: number;
    /** Default 640. */
    maxWidth?: number;
    /** Keep the column at an edge while scrolling sideways. */
    pinned?: 'left' | 'right';
    /** False for the column that names the row. Default true. */
    hideable?: boolean;
    align?: 'left' | 'right';
    /** Offer "group by this column". */
    groupable?: boolean;
    /** What a group row shows in this column. */
    aggregate?: GridAggregate;
    /** Formats an aggregated number for display. */
    formatAggregate?: (value: number) => string;
    editable?: GridEditDef<T>;
}

/** Everything the rows need to know about a column after layout. */
export interface GridColumnLayout {
    id: string;
    width: number;
    pinned: 'left' | 'right' | null;
    /** Sticky offset from its pinned edge, in px (0 for unpinned). */
    offset: number;
}

/** A group of rows under one value of the grouped column. */
export interface GridGroup<T> {
    /** Unique within the grid, e.g. `category:Sprachen`. */
    key: string;
    columnId: string;
    value: unknown;
    depth: number;
    /** All leaf rows under this group, however deep. */
    rows: T[];
    children: GridGroup<T>[];
    /** Aggregates by column id. */
    aggregates: Record<string, number>;
}

/** One line of the flattened body: a group header or a data row. */
export type GridLine<T> =
    { kind: 'group'; group: GridGroup<T> } | { kind: 'row'; row: T; id: RowId; depth: number };
