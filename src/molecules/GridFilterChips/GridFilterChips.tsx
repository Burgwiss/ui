import { X } from 'lucide-react';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import type { GridFilter, GridFilterDef } from '../../hooks/grid/types';

export interface GridFilterChipsLabels {
    /** Accessible name and tooltip of a chip's remove button, from the chip's text, e.g. `Filter entfernen: ${chipText}`. */
    remove: (chipText: string) => string;
    /** The "remove every filter" button, e.g. "Alle Filter entfernen". Shown from two chips on. */
    clearAll: string;
    /** Accessible name of the whole row, e.g. "Aktive Filter". */
    region: string;
    /** Text filter, operator "contains": `Kurs enthält „arab“`. */
    contains: (header: string, value: string) => string;
    /** Text filter, operator "equals". */
    equals: (header: string, value: string) => string;
    /** Text filter, operator "starts with". */
    startsWith: (header: string, value: string) => string;
    /** Choice filter, from the option labels (not the raw values): `Status: Veröffentlicht, Entwurf`. Join the list with `Intl.ListFormat` or a comma. */
    choice: (header: string, values: string[]) => string;
    /** Number or date range with both bounds: `Preis 90–120`. Bounds arrive already formatted. */
    between: (header: string, low: string, high: string) => string;
    /** Date filter with only a start: `Beginn ab 01.10.2026`. */
    from: (header: string, value: string) => string;
    /** Date filter with only an end: `Beginn bis 31.12.2026`. */
    to: (header: string, value: string) => string;
    /** Number filter with only a lower bound: `Preis ab 90`. */
    min: (header: string, value: string) => string;
    /** Number filter with only an upper bound: `Preis bis 120`. */
    max: (header: string, value: string) => string;
}

export interface GridFilterChipsProps {
    /** The active filters, in the order the chips appear. Filters that say nothing (empty text, no values, no bounds) get no chip. */
    filters: GridFilter[];
    /** The grid's columns: `header` names the chip, a choice `filter` def turns raw values into option labels. A filter for an unknown column is named by its id. */
    columns: { id: string; header: string; filter?: GridFilterDef }[];
    /** Called with the column id when a chip's remove button is used. */
    onRemove: (columnId: string) => void;
    /** Called when "remove all" is used. */
    onClearAll: () => void;
    /** When given, the chip text becomes a button that calls this with the column id — the grid reopens that column's filter. */
    onEdit?: (columnId: string) => void;
    /** All visible text, in the app's language. Word order is up to the label functions. */
    labels: GridFilterChipsLabels;
    /** Formats an ISO `YYYY-MM-DD` date for the chip. Default: the ISO string. */
    formatDate?: (iso: string) => string;
    /** Formats a number for the chip. Default: `String(n)`. */
    formatNumber?: (n: number) => string;
}

const identity = (value: string) => value;
const asString = (n: number) => String(n);

function chipText(
    filter: GridFilter,
    column: GridFilterChipsProps['columns'][number] | undefined,
    labels: GridFilterChipsLabels,
    formatDate: (iso: string) => string,
    formatNumber: (n: number) => string,
): string | null {
    const header = column?.header ?? filter.id;
    switch (filter.type) {
        case 'text':
            if (filter.value === '') return null;
            return labels[filter.op](header, filter.value);
        case 'choice': {
            if (filter.values.length === 0) return null;
            const options = column?.filter?.type === 'choice' ? column.filter.options : [];
            const names = filter.values.map(
                (value) => options.find((option) => option.value === value)?.label ?? value,
            );
            return labels.choice(header, names);
        }
        case 'number': {
            const { min, max } = filter;
            if (min !== undefined && max !== undefined) {
                return labels.between(header, formatNumber(min), formatNumber(max));
            }
            if (min !== undefined) return labels.min(header, formatNumber(min));
            if (max !== undefined) return labels.max(header, formatNumber(max));
            return null;
        }
        case 'date': {
            const { from, to } = filter;
            if (from !== undefined && to !== undefined) {
                return labels.between(header, formatDate(from), formatDate(to));
            }
            if (from !== undefined) return labels.from(header, formatDate(from));
            if (to !== undefined) return labels.to(header, formatDate(to));
            return null;
        }
    }
}

/**
 * The row of active-filter chips above a data grid: one chip per filtered column, each
 * with an icon button that removes it, plus a "remove all" button once there is more than one.
 * Nothing is rendered while no filter says anything. The text of each chip is built by label
 * functions, so a language can put the words in its own order; choice chips show the option
 * labels, not the stored values. Pass `onEdit` to make the chip text reopen that column's
 * filter. It holds no state: the grid owns the filters. To edit a filter use `GridFilterEditor`.
 *
 * @summary Row of removable chips summarising a grid's active column filters, with "remove all".
 */
export function GridFilterChips({
    filters,
    columns,
    onRemove,
    onClearAll,
    onEdit,
    labels,
    formatDate = identity,
    formatNumber = asString,
}: GridFilterChipsProps) {
    const chips = filters.flatMap((filter) => {
        const text = chipText(
            filter,
            columns.find((column) => column.id === filter.id),
            labels,
            formatDate,
            formatNumber,
        );
        return text === null ? [] : [{ id: filter.id, text }];
    });

    if (chips.length === 0) return null;

    return (
        <div role="region" aria-label={labels.region} className="flex flex-wrap items-center gap-2">
            <ul className="flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                    <li key={chip.id}>
                        <Badge
                            variant="outline"
                            className="h-7 gap-1 ps-2.5 pe-1 text-sm font-normal"
                        >
                            {onEdit ? (
                                <button
                                    type="button"
                                    onClick={() => onEdit(chip.id)}
                                    className="rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    {chip.text}
                                </button>
                            ) : (
                                <span>{chip.text}</span>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                className="text-muted-foreground"
                                aria-label={labels.remove(chip.text)}
                                onClick={() => onRemove(chip.id)}
                            >
                                <X aria-hidden="true" />
                            </Button>
                        </Badge>
                    </li>
                ))}
            </ul>
            {chips.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
                    {labels.clearAll}
                </Button>
            )}
        </div>
    );
}
