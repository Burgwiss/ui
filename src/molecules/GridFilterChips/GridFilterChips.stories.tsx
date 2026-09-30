import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import type { GridFilter } from '../../hooks/grid/types';
import { GridFilterChips, type GridFilterChipsProps } from './GridFilterChips';

const LABELS: GridFilterChipsProps['labels'] = {
    remove: (chip) => `Filter entfernen: ${chip}`,
    clearAll: 'Alle Filter entfernen',
    region: 'Aktive Filter',
    contains: (header, value) => `${header} enthält „${value}“`,
    equals: (header, value) => `${header} ist „${value}“`,
    startsWith: (header, value) => `${header} beginnt mit „${value}“`,
    choice: (header, values) =>
        `${header}: ${new Intl.ListFormat('de', { type: 'conjunction', style: 'narrow' }).format(values)}`,
    between: (header, low, high) => `${header} ${low}–${high}`,
    from: (header, value) => `${header} ab ${value}`,
    to: (header, value) => `${header} bis ${value}`,
    min: (header, value) => `${header} ab ${value}`,
    max: (header, value) => `${header} bis ${value}`,
};

const COLUMNS: GridFilterChipsProps['columns'] = [
    { id: 'title', header: 'Kurs', filter: { type: 'text' } },
    {
        id: 'status',
        header: 'Status',
        filter: {
            type: 'choice',
            options: [
                { value: 'published', label: 'Veröffentlicht' },
                { value: 'draft', label: 'Entwurf' },
                { value: 'archived', label: 'Archiviert' },
            ],
        },
    },
    { id: 'price', header: 'Preis', filter: { type: 'number' } },
    { id: 'start', header: 'Beginn', filter: { type: 'date' } },
];

const FILTERS: GridFilter[] = [
    { id: 'title', type: 'text', op: 'contains', value: 'arab' },
    { id: 'status', type: 'choice', values: ['published', 'draft'] },
    { id: 'price', type: 'number', min: 90, max: 120 },
    { id: 'start', type: 'date', from: '2026-10-01' },
];

const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('de-DE', { timeZone: 'UTC' });
const formatNumber = (n: number) => n.toLocaleString('de-DE');

/** Holds the filters so that removing a chip actually removes it. */
function Demo(args: GridFilterChipsProps) {
    const [filters, setFilters] = useState(args.filters);
    const [edited, setEdited] = useState<string | null>(null);
    return (
        <div className="flex flex-col gap-2">
            <GridFilterChips
                {...args}
                filters={filters}
                onRemove={(id) => setFilters((prev) => prev.filter((filter) => filter.id !== id))}
                onClearAll={() => setFilters([])}
                onEdit={args.onEdit ? setEdited : undefined}
            />
            {edited && <code className="text-xs text-muted-foreground">onEdit: {edited}</code>}
        </div>
    );
}

const meta = {
    title: 'Molecules/GridFilterChips',
    component: GridFilterChips,
    render: (args) => <Demo {...args} />,
    args: {
        filters: FILTERS,
        columns: COLUMNS,
        labels: LABELS,
        formatDate,
        formatNumber,
        onRemove: () => {},
        onClearAll: () => {},
    },
} satisfies Meta<typeof GridFilterChips>;

export default meta;
type Story = StoryObj<typeof meta>;

/** All four filter kinds at once, with dates and numbers in the German format; more than one chip adds "Alle Filter entfernen". */
export const Alle: Story = {};

/** One chip: no "remove all" button, the chip's own × is enough. */
export const EinFilter: Story = { args: { filters: FILTERS.slice(0, 1) } };

/** With `onEdit` the chip text is a button — the grid reopens that column's filter. */
export const BearbeitbarChips: Story = { args: { onEdit: () => {} } };

/** Nothing active: the component renders nothing at all. */
export const KeineFilter: Story = { args: { filters: [] } };
