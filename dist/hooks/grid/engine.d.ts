import type { RowId } from '../gridActions';
import type { GridColumn, GridColumnLayout, GridFilter, GridGroup, GridLine, GridSort } from './types';
export declare const DEFAULT_COLUMN_WIDTH = 160;
export declare const DEFAULT_MIN_WIDTH = 64;
export declare const DEFAULT_MAX_WIDTH = 640;
/** The raw value of a column for a row: the accessor, or `row[id]`. */
export declare function columnValue<T>(column: GridColumn<T>, row: T): unknown;
/**
 * Sort by several keys: the first decides, the next breaks ties. Stable, so
 * equal rows keep their order. Empty values go last whichever the direction.
 */
export declare function sortRows<T>(rows: T[], sorting: GridSort[], columns: GridColumn<T>[]): T[];
/** Keep the rows that pass every filter (AND). Unknown columns are ignored. */
export declare function filterRows<T>(rows: T[], filters: GridFilter[], columns: GridColumn<T>[]): T[];
/**
 * Group rows by one or more columns, nested in that order. Groups are ordered
 * by their value; the group of empty values comes last. Each group carries the
 * aggregates of every column that declares one.
 */
export declare function groupRows<T>(rows: T[], groupBy: string[], columns: GridColumn<T>[], depth?: number, parentKey?: string): GridGroup<T>[];
/**
 * The body as a flat list: group headers and the rows of expanded groups, each
 * with its depth. Without groups, just the rows.
 */
export declare function flattenLines<T>(rows: T[], groups: GridGroup<T>[], expanded: ReadonlySet<string>, getRowId: (row: T) => RowId): GridLine<T>[];
/**
 * CSV (RFC 4180) of the given rows and columns, header first. Text that a
 * spreadsheet would run as a formula is prefixed with `'`.
 */
export declare function toCsv<T>(rows: T[], columns: GridColumn<T>[], { separator, bom }?: {
    separator?: string;
    bom?: boolean;
}): string;
/** Tab-separated rows for the clipboard: pastes into a spreadsheet as cells. */
export declare function toTsv<T>(rows: T[], columns: GridColumn<T>[]): string;
/** Saved order + any new columns at the end, minus columns that no longer exist. */
export declare function normaliseOrder(saved: string[], ids: string[]): string[];
export declare function moveColumn(order: string[], id: string, toIndex: number): string[];
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
export declare function layoutColumns<T>(columns: GridColumn<T>[], state: ColumnLayoutState): GridColumnLayout[];
