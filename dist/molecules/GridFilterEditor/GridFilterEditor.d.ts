import type { GridFilter, GridFilterDef } from '../../hooks/grid/types';
export interface GridFilterEditorLabels {
    /** Submit button, e.g. "Anwenden". */
    apply: string;
    /** Button that removes the filter, e.g. "Zurücksetzen". */
    clear: string;
    /** Text operator "contains", e.g. "enthält". */
    contains: string;
    /** Text operator "equals", e.g. "ist gleich". */
    equals: string;
    /** Text operator "starts with", e.g. "beginnt mit". */
    startsWith: string;
    /** Accessible name of the operator select, e.g. "Vergleich". */
    operator: string;
    /** Label of the text input, e.g. "Wert". */
    value: string;
    /** Choice shortcut that ticks every option, e.g. "Alle". */
    selectAll: string;
    /** Choice shortcut that unticks every option, e.g. "Keine". */
    selectNone: string;
    /** Label of the number minimum input, e.g. "Minimum". */
    min: string;
    /** Label of the number maximum input, e.g. "Maximum". */
    max: string;
    /** Label of the date start input, e.g. "Von". */
    from: string;
    /** Label of the date end input, e.g. "Bis". */
    to: string;
    /** Error shown when min > max (numbers) or from > to (dates). */
    invalidRange: string;
}
export interface GridFilterEditorProps {
    /** Stable id of the column; becomes `id` of the emitted filter. */
    columnId: string;
    /** The column's visible name; it names the editor group for screen readers. */
    header: string;
    /** Which editor to show: text, choice, number or date. */
    def: GridFilterDef;
    /** The column's current filter. Read once, when the editor mounts — remount (`key`) to load another. A filter of another type is ignored. */
    value?: GridFilter;
    /** Called with the typed filter, or `null` to remove the column's filter. Nothing is emitted while typing. */
    onApply: (filter: GridFilter | null) => void;
    /** All visible text, in the app's language. */
    labels: GridFilterEditorLabels;
}
/**
 * The body of one column's filter popover: the editor that fits the column's type —
 * an operator and a text box (text), a checkbox list with "all" and "none" (choice),
 * min and max (number), or from and to dates (date) — with Apply and Reset. Nothing is
 * emitted while typing: Apply (or Enter in an input) sends the typed `GridFilter`, an empty
 * editor sends `null`, and a reversed range shows an error and sends nothing. The grid owns the
 * popover (DataGrid's `renderFilter`).
 *
 * @summary Editor for one grid column's filter (text, choice, number or date), shown inside the grid's popover.
 */
export declare function GridFilterEditor({ columnId, header, def, value, onApply, labels, }: GridFilterEditorProps): import("react").JSX.Element;
