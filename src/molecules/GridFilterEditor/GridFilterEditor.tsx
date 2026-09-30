import { useId, useState, type KeyboardEvent } from 'react';

import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import type { GridFilter, GridFilterDef } from '../../hooks/grid/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../Select';

type TextOp = Extract<GridFilter, { type: 'text' }>['op'];

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

/** Enter in a single-line input applies — but not while an IME is composing. */
function applyOnEnter(apply: () => void) {
    return (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();
            apply();
        }
    };
}

/** Parses a number input's string; an empty or unparsable string is "not set". */
function toNumber(raw: string): number | undefined {
    if (raw.trim() === '') return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
}

interface EditorProps {
    columnId: string;
    labels: GridFilterEditorLabels;
    onApply: (filter: GridFilter | null) => void;
}

function Actions({
    labels,
    onApply,
    onClear,
    invalid,
}: {
    labels: GridFilterEditorLabels;
    onApply: () => void;
    onClear: () => void;
    invalid: boolean;
}) {
    return (
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                {labels.clear}
            </Button>
            <Button
                type="button"
                size="sm"
                onClick={onApply}
                disabled={invalid}
                tooltip={invalid ? labels.invalidRange : undefined}
            >
                {labels.apply}
            </Button>
        </div>
    );
}

function TextEditor({
    columnId,
    labels,
    onApply,
    value,
}: EditorProps & { value?: Extract<GridFilter, { type: 'text' }> }) {
    const id = useId();
    const [op, setOp] = useState<TextOp>(value?.op ?? 'contains');
    const [text, setText] = useState(value?.value ?? '');

    const apply = () => {
        const trimmed = text.trim();
        onApply(trimmed === '' ? null : { id: columnId, type: 'text', op, value: trimmed });
    };
    const clear = () => {
        setOp('contains');
        setText('');
        onApply(null);
    };

    return (
        <>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${id}-op`}>{labels.operator}</Label>
                <Select value={op} onValueChange={(next) => setOp(next as TextOp)}>
                    <SelectTrigger id={`${id}-op`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="contains">{labels.contains}</SelectItem>
                        <SelectItem value="equals">{labels.equals}</SelectItem>
                        <SelectItem value="startsWith">{labels.startsWith}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${id}-value`}>{labels.value}</Label>
                <Input
                    id={`${id}-value`}
                    type="text"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={applyOnEnter(apply)}
                />
            </div>
            <Actions labels={labels} onApply={apply} onClear={clear} invalid={false} />
        </>
    );
}

function ChoiceEditor({
    columnId,
    labels,
    onApply,
    options,
    value,
}: EditorProps & {
    options: { value: string; label: string }[];
    value?: Extract<GridFilter, { type: 'choice' }>;
}) {
    const id = useId();
    const [checked, setChecked] = useState<Set<string>>(() => new Set(value?.values ?? []));

    const toggle = (optionValue: string, on: boolean) =>
        setChecked((prev) => {
            const next = new Set(prev);
            if (on) next.add(optionValue);
            else next.delete(optionValue);
            return next;
        });

    const apply = () => {
        // Option order, and only values that are still options.
        const values = options.filter((o) => checked.has(o.value)).map((o) => o.value);
        onApply(values.length === 0 ? null : { id: columnId, type: 'choice', values });
    };
    const clear = () => {
        setChecked(new Set());
        onApply(null);
    };

    return (
        <>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setChecked(new Set(options.map((o) => o.value)))}
                >
                    {labels.selectAll}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setChecked(new Set())}
                >
                    {labels.selectNone}
                </Button>
            </div>
            <ul className="flex max-h-60 flex-col gap-2 overflow-y-auto">
                {options.map((option, index) => (
                    <li key={option.value} className="flex items-center gap-2">
                        <Checkbox
                            id={`${id}-${index}`}
                            checked={checked.has(option.value)}
                            onCheckedChange={(on) => toggle(option.value, on === true)}
                        />
                        <Label htmlFor={`${id}-${index}`} className="font-normal">
                            {option.label}
                        </Label>
                    </li>
                ))}
            </ul>
            <Actions labels={labels} onApply={apply} onClear={clear} invalid={false} />
        </>
    );
}

/** Two bounds of one kind (numbers or dates): shared layout, validation and emit. */
function RangeEditor({
    columnId,
    labels,
    onApply,
    kind,
    initial,
}: EditorProps & {
    kind: 'number' | 'date';
    initial: { low?: string; high?: string };
}) {
    const id = useId();
    const [low, setLow] = useState(initial.low ?? '');
    const [high, setHigh] = useState(initial.high ?? '');

    const lowValue = kind === 'number' ? toNumber(low) : low === '' ? undefined : low;
    const highValue = kind === 'number' ? toNumber(high) : high === '' ? undefined : high;
    const invalid = lowValue !== undefined && highValue !== undefined && lowValue > highValue;
    const errorId = `${id}-error`;

    const apply = () => {
        if (invalid) return;
        if (lowValue === undefined && highValue === undefined) {
            onApply(null);
        } else if (kind === 'number') {
            onApply({
                id: columnId,
                type: 'number',
                ...(lowValue !== undefined && { min: lowValue as number }),
                ...(highValue !== undefined && { max: highValue as number }),
            });
        } else {
            onApply({
                id: columnId,
                type: 'date',
                ...(lowValue !== undefined && { from: lowValue as string }),
                ...(highValue !== undefined && { to: highValue as string }),
            });
        }
    };
    const clear = () => {
        setLow('');
        setHigh('');
        onApply(null);
    };

    const lowLabel = kind === 'number' ? labels.min : labels.from;
    const highLabel = kind === 'number' ? labels.max : labels.to;
    const shared = {
        type: kind,
        'aria-invalid': invalid || undefined,
        'aria-describedby': invalid ? errorId : undefined,
        onKeyDown: applyOnEnter(apply),
    } as const;

    return (
        <>
            <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`${id}-low`}>{lowLabel}</Label>
                    <Input
                        {...shared}
                        id={`${id}-low`}
                        value={low}
                        onChange={(event) => setLow(event.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`${id}-high`}>{highLabel}</Label>
                    <Input
                        {...shared}
                        id={`${id}-high`}
                        value={high}
                        onChange={(event) => setHigh(event.target.value)}
                    />
                </div>
            </div>
            {invalid && (
                <p id={errorId} role="alert" className="text-sm text-destructive">
                    {labels.invalidRange}
                </p>
            )}
            <Actions labels={labels} onApply={apply} onClear={clear} invalid={invalid} />
        </>
    );
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
export function GridFilterEditor({
    columnId,
    header,
    def,
    value,
    onApply,
    labels,
}: GridFilterEditorProps) {
    const common = { columnId, labels, onApply };
    return (
        <div role="group" aria-label={header} className="flex w-64 flex-col gap-3">
            {def.type === 'text' && (
                <TextEditor {...common} value={value?.type === 'text' ? value : undefined} />
            )}
            {def.type === 'choice' && (
                <ChoiceEditor
                    {...common}
                    options={def.options}
                    value={value?.type === 'choice' ? value : undefined}
                />
            )}
            {def.type === 'number' && (
                <RangeEditor
                    {...common}
                    kind="number"
                    initial={
                        value?.type === 'number'
                            ? { low: str(value.min), high: str(value.max) }
                            : {}
                    }
                />
            )}
            {def.type === 'date' && (
                <RangeEditor
                    {...common}
                    kind="date"
                    initial={value?.type === 'date' ? { low: value.from, high: value.to } : {}}
                />
            )}
        </div>
    );
}

function str(n: number | undefined): string | undefined {
    return n === undefined ? undefined : String(n);
}
