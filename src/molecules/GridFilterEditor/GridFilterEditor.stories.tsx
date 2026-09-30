import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import type { GridFilter } from '../../hooks/grid/types';
import { GridFilterEditor, type GridFilterEditorProps } from './GridFilterEditor';

const LABELS: GridFilterEditorProps['labels'] = {
    apply: 'Anwenden',
    clear: 'Zurücksetzen',
    contains: 'enthält',
    equals: 'ist gleich',
    startsWith: 'beginnt mit',
    operator: 'Vergleich',
    value: 'Wert',
    selectAll: 'Alle',
    selectNone: 'Keine',
    min: 'Minimum',
    max: 'Maximum',
    from: 'Von',
    to: 'Bis',
    invalidRange: 'Das Minimum darf nicht größer als das Maximum sein.',
};

/** The grid puts the editor in a popover; here a bordered card stands in, with the emitted filter printed below. */
function Frame(args: GridFilterEditorProps) {
    const [applied, setApplied] = useState<GridFilter | null | undefined>(undefined);
    return (
        <div className="flex w-72 flex-col gap-3">
            <div className="rounded-md border border-border bg-card p-3 text-card-foreground shadow-sm">
                <GridFilterEditor {...args} onApply={setApplied} />
            </div>
            <code className="text-xs break-all text-muted-foreground">
                {applied === undefined ? '–' : JSON.stringify(applied)}
            </code>
        </div>
    );
}

const meta = {
    title: 'Molecules/GridFilterEditor',
    component: GridFilterEditor,
    parameters: { layout: 'centered' },
    render: (args) => <Frame {...args} />,
    args: {
        columnId: 'title',
        header: 'Kurs',
        def: { type: 'text' },
        labels: LABELS,
        onApply: () => {},
    },
} satisfies Meta<typeof GridFilterEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A text column: pick how to compare, type the text, apply with the button or Enter. */
export const Text: Story = {};

/** A text column that already has a filter: the editor opens with it filled in. */
export const TextMitBestehendemFilter: Story = {
    args: { value: { id: 'title', type: 'text', op: 'startsWith', value: 'Arabisch' } },
};

/** A column with a fixed set of values: tick any number of them, or use "Alle" and "Keine". */
export const Auswahl: Story = {
    args: {
        columnId: 'status',
        header: 'Status',
        def: {
            type: 'choice',
            options: [
                { value: 'published', label: 'Veröffentlicht' },
                { value: 'draft', label: 'Entwurf' },
                { value: 'archived', label: 'Archiviert' },
            ],
        },
        value: { id: 'status', type: 'choice', values: ['published'] },
    },
};

/** A numeric column: minimum and maximum, either may stay empty. */
export const Zahl: Story = {
    args: { columnId: 'price', header: 'Preis', def: { type: 'number' } },
};

/** A reversed range shows an error and cannot be applied. */
export const ZahlMitFehler: Story = {
    args: {
        columnId: 'price',
        header: 'Preis',
        def: { type: 'number' },
        value: { id: 'price', type: 'number', min: 120, max: 90 },
    },
};

/** A date column: from and to, as ISO dates. */
export const Datum: Story = {
    args: {
        columnId: 'start',
        header: 'Beginn',
        def: { type: 'date' },
        value: { id: 'start', type: 'date', from: '2026-10-01' },
    },
};
