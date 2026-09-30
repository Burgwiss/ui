import type { RowId } from '../gridActions';
import type {
    GridColumn,
    GridColumnLayout,
    GridFilter,
    GridGroup,
    GridLine,
    GridSort,
} from './types';

/*
 * The grid's data engine: pure functions, no React. Sorting, filtering,
 * grouping, export and column layout all live here so they can be tested on
 * their own and reused by a server that wants to do the same thing.
 */

export const DEFAULT_COLUMN_WIDTH = 160;
export const DEFAULT_MIN_WIDTH = 64;
export const DEFAULT_MAX_WIDTH = 640;

/** The raw value of a column for a row: the accessor, or `row[id]`. */
export function columnValue<T>(column: GridColumn<T>, row: T): unknown {
    if (column.value) return column.value(row);
    return (row as Record<string, unknown>)[column.id];
}

const isEmpty = (v: unknown) => v === null || v === undefined || v === '';

// `numeric` sorts "Lektion 2" before "Lektion 10"; base sensitivity puts Ä with A.
const collator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });

function compareValues(a: unknown, b: unknown): number {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
    // ISO dates compare correctly as text; everything else as people read it.
    return collator.compare(String(a), String(b));
}

/**
 * Sort by several keys: the first decides, the next breaks ties. Stable, so
 * equal rows keep their order. Empty values go last whichever the direction.
 */
export function sortRows<T>(rows: T[], sorting: GridSort[], columns: GridColumn<T>[]): T[] {
    const keys = sorting
        .map((s) => ({ s, col: columns.find((c) => c.id === s.id) }))
        .filter((k): k is { s: GridSort; col: GridColumn<T> } => k.col !== undefined);
    if (keys.length === 0) return rows;
    // Array.prototype.sort is stable (ES2019): equal rows keep their order.
    return [...rows].sort((x, y) => {
        for (const { s, col } of keys) {
            const a = columnValue(col, x);
            const b = columnValue(col, y);
            if (isEmpty(a) || isEmpty(b)) {
                if (isEmpty(a) && isEmpty(b)) continue;
                return isEmpty(a) ? 1 : -1;
            }
            const result = (col.compare ?? compareValues)(a, b);
            if (result !== 0) return s.desc ? -result : result;
        }
        return 0;
    });
}

const fold = (s: string) => s.toLocaleLowerCase('de').normalize('NFC');

function toTime(v: unknown): number | null {
    if (v instanceof Date) return v.getTime();
    if (typeof v !== 'string' || v === '') return null;
    const t = Date.parse(v.length === 10 ? `${v}T00:00:00Z` : v);
    return Number.isNaN(t) ? null : t;
}

function matches(filter: GridFilter, value: unknown): boolean {
    switch (filter.type) {
        case 'text': {
            const needle = fold(filter.value.trim());
            if (needle === '') return true;
            const hay = isEmpty(value) ? '' : fold(String(value));
            if (filter.op === 'equals') return hay === needle;
            if (filter.op === 'startsWith') return hay.startsWith(needle);
            return hay.includes(needle);
        }
        case 'choice':
            return filter.values.length === 0 || filter.values.includes(String(value ?? ''));
        case 'number': {
            if (filter.min === undefined && filter.max === undefined) return true;
            const n = typeof value === 'number' ? value : Number.NaN;
            if (Number.isNaN(n)) return false;
            return (
                (filter.min === undefined || n >= filter.min) &&
                (filter.max === undefined || n <= filter.max)
            );
        }
        case 'date': {
            if (!filter.from && !filter.to) return true;
            const t = toTime(value);
            if (t === null) return false;
            const from = filter.from ? toTime(filter.from) : null;
            // Inclusive: "to 2026-10-31" keeps the whole of that day.
            const to = filter.to ? toTime(filter.to)! + 86_399_999 : null;
            return (from === null || t >= from) && (to === null || t <= to);
        }
    }
}

/** Keep the rows that pass every filter (AND). Unknown columns are ignored. */
export function filterRows<T>(rows: T[], filters: GridFilter[], columns: GridColumn<T>[]): T[] {
    const active = filters
        .map((f) => ({ f, col: columns.find((c) => c.id === f.id) }))
        .filter((a): a is { f: GridFilter; col: GridColumn<T> } => a.col !== undefined);
    if (active.length === 0) return rows;
    return rows.filter((row) => active.every(({ f, col }) => matches(f, columnValue(col, row))));
}

function aggregate<T>(rows: T[], columns: GridColumn<T>[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const col of columns) {
        if (!col.aggregate) continue;
        if (col.aggregate === 'count') {
            out[col.id] = rows.length;
            continue;
        }
        const nums = rows
            .map((r) => columnValue(col, r))
            .filter((v): v is number => typeof v === 'number');
        const sum = nums.reduce((a, b) => a + b, 0);
        out[col.id] =
            col.aggregate === 'sum'
                ? sum
                : nums.length === 0
                  ? 0
                  : col.aggregate === 'avg'
                    ? sum / nums.length
                    : col.aggregate === 'min'
                      ? Math.min(...nums)
                      : Math.max(...nums);
    }
    return out;
}

/**
 * Group rows by one or more columns, nested in that order. Groups are ordered
 * by their value; the group of empty values comes last. Each group carries the
 * aggregates of every column that declares one.
 */
export function groupRows<T>(
    rows: T[],
    groupBy: string[],
    columns: GridColumn<T>[],
    depth = 0,
    parentKey = '',
): GridGroup<T>[] {
    const [id, ...rest] = groupBy;
    const col = columns.find((c) => c.id === id);
    if (!col) return [];
    const buckets = new Map<string, { value: unknown; rows: T[] }>();
    for (const row of rows) {
        const value = columnValue(col, row);
        const k = isEmpty(value) ? '' : String(value);
        const bucket = buckets.get(k) ?? { value: isEmpty(value) ? null : value, rows: [] };
        bucket.rows.push(row);
        buckets.set(k, bucket);
    }
    const ordered = [...buckets.entries()].sort(([a], [b]) => {
        if (a === '' || b === '') return a === b ? 0 : a === '' ? 1 : -1;
        return collator.compare(a, b);
    });
    return ordered.map(([k, bucket]) => {
        const key = `${parentKey}${parentKey ? '>' : ''}${col.id}:${k}`;
        return {
            key,
            columnId: col.id,
            value: bucket.value,
            depth,
            rows: bucket.rows,
            children: rest.length ? groupRows(bucket.rows, rest, columns, depth + 1, key) : [],
            aggregates: aggregate(bucket.rows, columns),
        };
    });
}

/**
 * The body as a flat list: group headers and the rows of expanded groups, each
 * with its depth. Without groups, just the rows.
 */
export function flattenLines<T>(
    rows: T[],
    groups: GridGroup<T>[],
    expanded: ReadonlySet<string>,
    getRowId: (row: T) => RowId,
): GridLine<T>[] {
    if (groups.length === 0)
        return rows.map((row) => ({ kind: 'row', row, id: getRowId(row), depth: 0 }));
    const out: GridLine<T>[] = [];
    const walk = (list: GridGroup<T>[]) => {
        for (const group of list) {
            out.push({ kind: 'group', group });
            if (!expanded.has(group.key)) continue;
            if (group.children.length) walk(group.children);
            else
                for (const row of group.rows)
                    out.push({ kind: 'row', row, id: getRowId(row), depth: group.depth + 1 });
        }
    };
    walk(groups);
    return out;
}

function exportText<T>(col: GridColumn<T>, row: T): { text: string; wasString: boolean } {
    if (col.exportValue) return { text: col.exportValue(row), wasString: true };
    const v = columnValue(col, row);
    if (isEmpty(v)) return { text: '', wasString: false };
    if (v instanceof Date) return { text: v.toISOString(), wasString: false };
    return { text: String(v), wasString: typeof v === 'string' };
}

// A cell starting with one of these is run as a formula by spreadsheets.
const FORMULA = /^[=+\-@\t\r]/;

function csvCell(text: string, wasString: boolean, separator: string): string {
    const safe = wasString && FORMULA.test(text) ? `'${text}` : text;
    return safe.includes(separator) || /["\r\n]/.test(safe)
        ? `"${safe.replace(/"/g, '""')}"`
        : safe;
}

/**
 * CSV (RFC 4180) of the given rows and columns, header first. Text that a
 * spreadsheet would run as a formula is prefixed with `'`.
 */
export function toCsv<T>(
    rows: T[],
    columns: GridColumn<T>[],
    { separator = ',', bom = false }: { separator?: string; bom?: boolean } = {},
): string {
    const lines = [
        columns.map((c) => csvCell(c.header, true, separator)).join(separator),
        ...rows.map((row) =>
            columns
                .map((c) => {
                    const { text, wasString } = exportText(c, row);
                    return csvCell(text, wasString, separator);
                })
                .join(separator),
        ),
    ];
    return (bom ? '﻿' : '') + lines.join('\r\n');
}

/** Tab-separated rows for the clipboard: pastes into a spreadsheet as cells. */
export function toTsv<T>(rows: T[], columns: GridColumn<T>[]): string {
    const flat = (s: string) => s.replace(/[\t\r\n]+/g, ' ');
    return [
        columns.map((c) => flat(c.header)).join('\t'),
        ...rows.map((row) => columns.map((c) => flat(exportText(c, row).text)).join('\t')),
    ].join('\n');
}

/** Saved order + any new columns at the end, minus columns that no longer exist. */
export function normaliseOrder(saved: string[], ids: string[]): string[] {
    const known = new Set(ids);
    const kept = saved.filter((id) => known.has(id));
    return [...kept, ...ids.filter((id) => !kept.includes(id))];
}

export function moveColumn(order: string[], id: string, toIndex: number): string[] {
    const from = order.indexOf(id);
    if (from < 0) return order;
    const next = order.filter((x) => x !== id);
    next.splice(Math.max(0, Math.min(next.length, toIndex)), 0, id);
    return next;
}

export interface ColumnLayoutState {
    order: string[];
    hidden: string[];
    widths: Record<string, number>;
    /** Per-column override; `null` unpins a column that pins itself. */
    pinned: Record<string, 'left' | 'right' | null>;
    /** Width of fixed columns before the first data column (checkbox, expander). */
    leading?: number;
}

/**
 * The visible columns in display order — left-pinned, middle, right-pinned —
 * with clamped widths and the sticky offset of every pinned column.
 */
export function layoutColumns<T>(
    columns: GridColumn<T>[],
    state: ColumnLayoutState,
): GridColumnLayout[] {
    const order = normaliseOrder(
        state.order,
        columns.map((c) => c.id),
    );
    const byId = new Map(columns.map((c) => [c.id, c]));
    const visible = order
        .map((id) => byId.get(id)!)
        .filter((c) => c.hideable === false || !state.hidden.includes(c.id));
    const items = visible.map((c) => {
        const width = Math.round(
            Math.min(
                c.maxWidth ?? DEFAULT_MAX_WIDTH,
                Math.max(
                    c.minWidth ?? DEFAULT_MIN_WIDTH,
                    state.widths[c.id] ?? c.width ?? DEFAULT_COLUMN_WIDTH,
                ),
            ),
        );
        const pinned = c.id in state.pinned ? state.pinned[c.id]! : (c.pinned ?? null);
        return { id: c.id, width, pinned, offset: 0 };
    });
    const left = items.filter((i) => i.pinned === 'left');
    const middle = items.filter((i) => i.pinned === null);
    const right = items.filter((i) => i.pinned === 'right');
    let x = state.leading ?? 0;
    for (const i of left) {
        i.offset = x;
        x += i.width;
    }
    x = 0;
    for (const i of [...right].reverse()) {
        i.offset = x;
        x += i.width;
    }
    return [...left, ...middle, ...right];
}
