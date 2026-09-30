import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { GridFilter } from '../../hooks/grid/types';
import { GridFilterChips, type GridFilterChipsProps } from './GridFilterChips';

const LABELS: GridFilterChipsProps['labels'] = {
    remove: (chip) => `Filter entfernen: ${chip}`,
    clearAll: 'Alle Filter entfernen',
    region: 'Aktive Filter',
    contains: (h, v) => `${h} enthält „${v}“`,
    equals: (h, v) => `${h} ist „${v}“`,
    startsWith: (h, v) => `${h} beginnt mit „${v}“`,
    choice: (h, values) => `${h}: ${values.join(', ')}`,
    between: (h, a, b) => `${h} ${a}–${b}`,
    from: (h, v) => `${h} ab ${v}`,
    to: (h, v) => `${h} bis ${v}`,
    min: (h, v) => `${h} mindestens ${v}`,
    max: (h, v) => `${h} höchstens ${v}`,
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
    { id: 'plain', header: 'Ohne Filter' },
];

const TEXT: GridFilter = { id: 'title', type: 'text', op: 'contains', value: 'arab' };
const CHOICE: GridFilter = { id: 'status', type: 'choice', values: ['published', 'draft'] };

function setup(filters: GridFilter[], extra: Partial<GridFilterChipsProps> = {}) {
    const onRemove = vi.fn();
    const onClearAll = vi.fn();
    const user = userEvent.setup();
    const view = render(
        <GridFilterChips
            filters={filters}
            columns={COLUMNS}
            onRemove={onRemove}
            onClearAll={onClearAll}
            labels={LABELS}
            {...extra}
        />,
    );
    return { onRemove, onClearAll, user, ...view };
}

const region = () => screen.getByRole('region', { name: 'Aktive Filter' });
const chipTexts = () =>
    within(region())
        .getAllByRole('listitem')
        .map((li) => li.textContent);

describe('GridFilterChips — rendering', () => {
    it('renders nothing when there are no filters', () => {
        const { container } = setup([]);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when every filter is empty', () => {
        const { container } = setup([
            { id: 'title', type: 'text', op: 'contains', value: '' },
            { id: 'status', type: 'choice', values: [] },
            { id: 'price', type: 'number' },
            { id: 'start', type: 'date' },
        ]);
        expect(container).toBeEmptyDOMElement();
    });

    it('is a named region', () => {
        setup([TEXT]);
        expect(region()).toBeInTheDocument();
    });

    it('does not offer "clear all" for a single chip', () => {
        setup([TEXT]);
        expect(screen.queryByRole('button', { name: 'Alle Filter entfernen' })).toBeNull();
    });

    it('offers "clear all" from two chips on', () => {
        setup([TEXT, CHOICE]);
        expect(screen.getByRole('button', { name: 'Alle Filter entfernen' })).toBeInTheDocument();
    });

    it('counts only chips that render when deciding on "clear all"', () => {
        setup([TEXT, { id: 'status', type: 'choice', values: [] }]);
        expect(screen.queryByRole('button', { name: 'Alle Filter entfernen' })).toBeNull();
    });

    it('keeps the order of the filters', () => {
        setup([CHOICE, TEXT]);
        expect(chipTexts()).toEqual([
            expect.stringContaining('Status'),
            expect.stringContaining('Kurs'),
        ]);
    });
});

describe('GridFilterChips — chip text', () => {
    it('text: "Kurs enthält „arab“"', () => {
        setup([TEXT]);
        expect(screen.getByText('Kurs enthält „arab“')).toBeInTheDocument();
    });

    it('text: equals and startsWith use their own label function', () => {
        setup([
            { id: 'title', type: 'text', op: 'equals', value: 'Arabisch A1' },
            { id: 'plain', type: 'text', op: 'startsWith', value: 'A' },
        ]);
        expect(screen.getByText('Kurs ist „Arabisch A1“')).toBeInTheDocument();
        expect(screen.getByText('Ohne Filter beginnt mit „A“')).toBeInTheDocument();
    });

    it('choice: shows the option labels, not the raw values', () => {
        setup([CHOICE]);
        expect(screen.getByText('Status: Veröffentlicht, Entwurf')).toBeInTheDocument();
        expect(screen.queryByText(/published/)).toBeNull();
    });

    it('choice: falls back to the raw value for one that is no longer an option', () => {
        setup([{ id: 'status', type: 'choice', values: ['draft', 'gone'] }]);
        expect(screen.getByText('Status: Entwurf, gone')).toBeInTheDocument();
    });

    it('choice: falls back to raw values when the column has no choice def', () => {
        setup([{ id: 'plain', type: 'choice', values: ['x', 'y'] }]);
        expect(screen.getByText('Ohne Filter: x, y')).toBeInTheDocument();
    });

    it('number: min and max become a range "Preis 90–120"', () => {
        setup([{ id: 'price', type: 'number', min: 90, max: 120 }]);
        expect(screen.getByText('Preis 90–120')).toBeInTheDocument();
    });

    it('number: only min, only max', () => {
        setup([
            { id: 'price', type: 'number', min: 90 },
            { id: 'plain', type: 'number', max: 5 },
        ]);
        expect(screen.getByText('Preis mindestens 90')).toBeInTheDocument();
        expect(screen.getByText('Ohne Filter höchstens 5')).toBeInTheDocument();
    });

    it('number: 0 is a bound, not empty', () => {
        setup([{ id: 'price', type: 'number', min: 0 }]);
        expect(screen.getByText('Preis mindestens 0')).toBeInTheDocument();
    });

    it('number: uses formatNumber for every number', () => {
        setup([{ id: 'price', type: 'number', min: 1000, max: 2500.5 }], {
            formatNumber: (n) => n.toFixed(2).replace('.', ','),
        });
        expect(screen.getByText('Preis 1000,00–2500,50')).toBeInTheDocument();
    });

    it('date: from only, formatted "Beginn ab 01.10.2026"', () => {
        const formatDate = (iso: string) => iso.split('-').reverse().join('.');
        setup([{ id: 'start', type: 'date', from: '2026-10-01' }], { formatDate });
        expect(screen.getByText('Beginn ab 01.10.2026')).toBeInTheDocument();
    });

    it('date: to only, and a range', () => {
        const formatDate = (iso: string) => iso.split('-').reverse().join('.');
        setup(
            [
                { id: 'start', type: 'date', to: '2026-12-31' },
                { id: 'plain', type: 'date', from: '2026-10-01', to: '2026-12-31' },
            ],
            { formatDate },
        );
        expect(screen.getByText('Beginn bis 31.12.2026')).toBeInTheDocument();
        expect(screen.getByText('Ohne Filter 01.10.2026–31.12.2026')).toBeInTheDocument();
    });

    it('date: shows the ISO string by default', () => {
        setup([{ id: 'start', type: 'date', from: '2026-10-01' }]);
        expect(screen.getByText('Beginn ab 2026-10-01')).toBeInTheDocument();
    });

    it('lets the label functions reorder the words', () => {
        setup([TEXT], {
            labels: { ...LABELS, contains: (h, v) => `contains "${v}" in ${h}` },
        });
        expect(screen.getByText('contains "arab" in Kurs')).toBeInTheDocument();
    });

    it('uses the column id when the column is unknown', () => {
        setup([{ id: 'mystery', type: 'text', op: 'contains', value: 'x' }]);
        expect(screen.getByText('mystery enthält „x“')).toBeInTheDocument();
    });
});

describe('GridFilterChips — remove and clear', () => {
    it('gives every chip a remove button named after the chip', () => {
        setup([TEXT, CHOICE]);
        expect(
            screen.getByRole('button', { name: 'Filter entfernen: Kurs enthält „arab“' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'Filter entfernen: Status: Veröffentlicht, Entwurf',
            }),
        ).toBeInTheDocument();
    });

    it('removing reports the column id', async () => {
        const { onRemove, user } = setup([TEXT, CHOICE]);
        await user.click(
            screen.getByRole('button', {
                name: 'Filter entfernen: Status: Veröffentlicht, Entwurf',
            }),
        );
        expect(onRemove).toHaveBeenCalledExactlyOnceWith('status');
    });

    it('the remove button works from the keyboard', async () => {
        const { onRemove, user } = setup([TEXT]);
        screen.getByRole('button', { name: /Filter entfernen/ }).focus();
        await user.keyboard('{Enter}');
        expect(onRemove).toHaveBeenCalledExactlyOnceWith('title');
    });

    it('"clear all" calls onClearAll and nothing else', async () => {
        const { onClearAll, onRemove, user } = setup([TEXT, CHOICE]);
        await user.click(screen.getByRole('button', { name: 'Alle Filter entfernen' }));
        expect(onClearAll).toHaveBeenCalledOnce();
        expect(onRemove).not.toHaveBeenCalled();
    });

    it('the remove button is an icon: its name is the only text it has', () => {
        setup([TEXT]);
        const button = screen.getByRole('button', { name: /Filter entfernen/ });
        expect(button).toHaveTextContent('');
        expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });
});

describe('GridFilterChips — edit', () => {
    it('without onEdit the chip text is not a button', () => {
        setup([TEXT]);
        expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('with onEdit the chip text is a button that reports the column id', async () => {
        const onEdit = vi.fn();
        const { user } = setup([TEXT, CHOICE], { onEdit });
        await user.click(screen.getByRole('button', { name: 'Status: Veröffentlicht, Entwurf' }));
        expect(onEdit).toHaveBeenCalledExactlyOnceWith('status');
    });

    it('editing works from the keyboard and does not remove', async () => {
        const onEdit = vi.fn();
        const { user, onRemove } = setup([TEXT], { onEdit });
        screen.getByRole('button', { name: 'Kurs enthält „arab“' }).focus();
        await user.keyboard('{Enter}');
        expect(onEdit).toHaveBeenCalledExactlyOnceWith('title');
        expect(onRemove).not.toHaveBeenCalled();
    });

    it('tab order is edit, remove per chip, then clear all', async () => {
        const { user } = setup([TEXT, CHOICE], { onEdit: () => {} });
        await user.tab();
        expect(screen.getByRole('button', { name: 'Kurs enthält „arab“' })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole('button', { name: /Filter entfernen: Kurs/ })).toHaveFocus();
        await user.tab();
        expect(
            screen.getByRole('button', { name: 'Status: Veröffentlicht, Entwurf' }),
        ).toHaveFocus();
        await user.tab();
        expect(screen.getByRole('button', { name: /Filter entfernen: Status/ })).toHaveFocus();
        await user.tab();
        expect(screen.getByRole('button', { name: 'Alle Filter entfernen' })).toHaveFocus();
    });
});
