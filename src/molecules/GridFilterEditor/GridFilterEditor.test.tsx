import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { GridFilter, GridFilterDef } from '../../hooks/grid/types';
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

const OPTIONS = [
    { value: 'published', label: 'Veröffentlicht' },
    { value: 'draft', label: 'Entwurf' },
    { value: 'archived', label: 'Archiviert' },
];

function setup(def: GridFilterDef, value?: GridFilter, columnId = 'col') {
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(
        <GridFilterEditor
            columnId={columnId}
            header="Spalte"
            def={def}
            value={value}
            onApply={onApply}
            labels={LABELS}
        />,
    );
    return { onApply, user };
}

const apply = () => screen.getByRole('button', { name: 'Anwenden' });
const clear = () => screen.getByRole('button', { name: 'Zurücksetzen' });

describe('GridFilterEditor — shell', () => {
    it('is a group named after the column', () => {
        setup({ type: 'text' });
        expect(screen.getByRole('group', { name: 'Spalte' })).toBeInTheDocument();
    });

    it('offers both buttons for every type', () => {
        for (const def of [
            { type: 'text' },
            { type: 'choice', options: OPTIONS },
            { type: 'number' },
            { type: 'date' },
        ] as GridFilterDef[]) {
            const { unmount } = render(
                <GridFilterEditor
                    columnId="c"
                    header="Spalte"
                    def={def}
                    onApply={() => {}}
                    labels={LABELS}
                />,
            );
            expect(apply()).toBeInTheDocument();
            expect(clear()).toBeInTheDocument();
            unmount();
        }
    });

    it('"Zurücksetzen" emits null, whatever was typed', async () => {
        const { onApply, user } = setup({ type: 'text' });
        await user.type(screen.getByRole('textbox', { name: 'Wert' }), 'arab');
        await user.click(clear());
        expect(onApply).toHaveBeenCalledExactlyOnceWith(null);
    });

    it('"Zurücksetzen" also empties the editor', async () => {
        const { user } = setup(
            { type: 'text' },
            { id: 'col', type: 'text', op: 'equals', value: 'x' },
        );
        await user.click(clear());
        expect(screen.getByRole('textbox', { name: 'Wert' })).toHaveValue('');
        expect(screen.getByRole('combobox', { name: 'Vergleich' })).toHaveTextContent('enthält');
    });

    it('ignores a value whose type does not match the def', () => {
        setup({ type: 'text' }, { id: 'col', type: 'number', min: 3 });
        expect(screen.getByRole('textbox', { name: 'Wert' })).toHaveValue('');
    });
});

describe('GridFilterEditor — text', () => {
    it('defaults to "enthält" and applies a typed contains filter with the column id', async () => {
        const { onApply, user } = setup({ type: 'text' }, undefined, 'title');
        expect(screen.getByRole('combobox', { name: 'Vergleich' })).toHaveTextContent('enthält');
        await user.type(screen.getByRole('textbox', { name: 'Wert' }), 'arab');
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith({
            id: 'title',
            type: 'text',
            op: 'contains',
            value: 'arab',
        });
    });

    it('lets the operator be changed to each of the three choices', async () => {
        for (const [name, op] of [
            ['ist gleich', 'equals'],
            ['beginnt mit', 'startsWith'],
            ['enthält', 'contains'],
        ] as const) {
            const { onApply, user } = setup(
                { type: 'text' },
                { id: 'col', type: 'text', op: 'startsWith', value: 'x' },
            );
            await user.click(screen.getByRole('combobox', { name: 'Vergleich' }));
            await user.click(screen.getByRole('option', { name }));
            await user.click(apply());
            expect(onApply).toHaveBeenCalledWith({ id: 'col', type: 'text', op, value: 'x' });
            cleanup();
        }
    });

    it('lists the three operators with the given labels', async () => {
        const { user } = setup({ type: 'text' });
        await user.click(screen.getByRole('combobox', { name: 'Vergleich' }));
        expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual([
            'enthält',
            'ist gleich',
            'beginnt mit',
        ]);
    });

    it('starts from the current filter', () => {
        setup({ type: 'text' }, { id: 'col', type: 'text', op: 'equals', value: 'Arabisch' });
        expect(screen.getByRole('textbox', { name: 'Wert' })).toHaveValue('Arabisch');
        expect(screen.getByRole('combobox', { name: 'Vergleich' })).toHaveTextContent('ist gleich');
    });

    it('Enter in the input applies', async () => {
        const { onApply, user } = setup({ type: 'text' });
        await user.type(screen.getByRole('textbox', { name: 'Wert' }), 'kurs{Enter}');
        expect(onApply).toHaveBeenCalledExactlyOnceWith({
            id: 'col',
            type: 'text',
            op: 'contains',
            value: 'kurs',
        });
    });

    it('an empty input applies null, never an empty filter', async () => {
        const { onApply, user } = setup({ type: 'text' });
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith(null);
    });

    it('whitespace only counts as empty, and typed text is trimmed', async () => {
        const first = setup({ type: 'text' });
        await first.user.type(screen.getByRole('textbox', { name: 'Wert' }), '   {Enter}');
        expect(first.onApply).toHaveBeenCalledExactlyOnceWith(null);
        cleanup();

        const second = setup({ type: 'text' });
        await second.user.type(screen.getByRole('textbox', { name: 'Wert' }), '  arab {Enter}');
        expect(second.onApply).toHaveBeenCalledExactlyOnceWith(
            expect.objectContaining({ value: 'arab' }),
        );
    });

    it('does not apply while typing', async () => {
        const { onApply, user } = setup({ type: 'text' });
        await user.type(screen.getByRole('textbox', { name: 'Wert' }), 'abc');
        expect(onApply).not.toHaveBeenCalled();
    });

    it('keeps the operator select from applying on Enter', async () => {
        const { onApply, user } = setup({ type: 'text' });
        screen.getByRole('combobox', { name: 'Vergleich' }).focus();
        await user.keyboard('{Enter}');
        expect(onApply).not.toHaveBeenCalled();
    });
});

describe('GridFilterEditor — choice', () => {
    it('renders one labelled checkbox per option, unchecked by default', () => {
        setup({ type: 'choice', options: OPTIONS });
        for (const o of OPTIONS) {
            expect(screen.getByRole('checkbox', { name: o.label })).not.toBeChecked();
        }
        expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    });

    it('starts from the current values', () => {
        setup(
            { type: 'choice', options: OPTIONS },
            { id: 'col', type: 'choice', values: ['draft'] },
        );
        expect(screen.getByRole('checkbox', { name: 'Entwurf' })).toBeChecked();
        expect(screen.getByRole('checkbox', { name: 'Archiviert' })).not.toBeChecked();
    });

    it('applies the checked values, in option order, by their raw value', async () => {
        const { onApply, user } = setup({ type: 'choice', options: OPTIONS }, undefined, 'status');
        await user.click(screen.getByRole('checkbox', { name: 'Archiviert' }));
        await user.click(screen.getByRole('checkbox', { name: 'Veröffentlicht' }));
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith({
            id: 'status',
            type: 'choice',
            values: ['published', 'archived'],
        });
    });

    it('unticking works', async () => {
        const { onApply, user } = setup(
            { type: 'choice', options: OPTIONS },
            { id: 'col', type: 'choice', values: ['draft', 'archived'] },
        );
        await user.click(screen.getByRole('checkbox', { name: 'Entwurf' }));
        await user.click(apply());
        expect(onApply).toHaveBeenCalledWith({ id: 'col', type: 'choice', values: ['archived'] });
    });

    it('"Alle" ticks everything and "Keine" unticks everything', async () => {
        const { user } = setup({ type: 'choice', options: OPTIONS });
        await user.click(screen.getByRole('button', { name: 'Alle' }));
        for (const box of screen.getAllByRole('checkbox')) expect(box).toBeChecked();
        await user.click(screen.getByRole('button', { name: 'Keine' }));
        for (const box of screen.getAllByRole('checkbox')) expect(box).not.toBeChecked();
    });

    it('"Alle" then apply emits every value', async () => {
        const { onApply, user } = setup({ type: 'choice', options: OPTIONS });
        await user.click(screen.getByRole('button', { name: 'Alle' }));
        await user.click(apply());
        expect(onApply).toHaveBeenCalledWith({
            id: 'col',
            type: 'choice',
            values: ['published', 'draft', 'archived'],
        });
    });

    it('nothing ticked applies null, never an empty list', async () => {
        const { onApply, user } = setup({ type: 'choice', options: OPTIONS });
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith(null);
    });

    it('"Keine" then apply removes an existing filter', async () => {
        const { onApply, user } = setup(
            { type: 'choice', options: OPTIONS },
            { id: 'col', type: 'choice', values: ['draft'] },
        );
        await user.click(screen.getByRole('button', { name: 'Keine' }));
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith(null);
    });

    it('drops stored values that are no longer options', async () => {
        const { onApply, user } = setup(
            { type: 'choice', options: OPTIONS },
            { id: 'col', type: 'choice', values: ['gone', 'draft'] },
        );
        await user.click(apply());
        expect(onApply).toHaveBeenCalledWith({ id: 'col', type: 'choice', values: ['draft'] });
    });

    it('a stored filter of only vanished values applies null', async () => {
        const { onApply, user } = setup(
            { type: 'choice', options: OPTIONS },
            { id: 'col', type: 'choice', values: ['gone'] },
        );
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith(null);
    });

    it('is reachable and toggleable by keyboard, with Space', async () => {
        const { onApply, user } = setup({ type: 'choice', options: OPTIONS });
        screen.getByRole('checkbox', { name: 'Entwurf' }).focus();
        await user.keyboard(' ');
        expect(screen.getByRole('checkbox', { name: 'Entwurf' })).toBeChecked();
        await user.click(apply());
        expect(onApply).toHaveBeenCalledWith({ id: 'col', type: 'choice', values: ['draft'] });
    });

    it('with no options offers nothing to tick and applies null', async () => {
        const { onApply, user } = setup({ type: 'choice', options: [] });
        expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith(null);
    });
});

describe('GridFilterEditor — number', () => {
    it('has a labelled min and max input, both numeric', () => {
        setup({ type: 'number' });
        expect(screen.getByRole('spinbutton', { name: 'Minimum' })).toBeInTheDocument();
        expect(screen.getByRole('spinbutton', { name: 'Maximum' })).toBeInTheDocument();
    });

    it('applies min and max as numbers', async () => {
        const { onApply, user } = setup({ type: 'number' }, undefined, 'price');
        await user.type(screen.getByRole('spinbutton', { name: 'Minimum' }), '90');
        await user.type(screen.getByRole('spinbutton', { name: 'Maximum' }), '120.5');
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith({
            id: 'price',
            type: 'number',
            min: 90,
            max: 120.5,
        });
    });

    it('applies with only a min, leaving max out', async () => {
        const { onApply, user } = setup({ type: 'number' });
        await user.type(screen.getByRole('spinbutton', { name: 'Minimum' }), '5');
        await user.click(apply());
        const filter = onApply.mock.calls[0]![0];
        expect(filter).toEqual({ id: 'col', type: 'number', min: 5 });
        expect('max' in filter).toBe(false);
    });

    it('applies with only a max, leaving min out', async () => {
        const { onApply, user } = setup({ type: 'number' });
        await user.type(screen.getByRole('spinbutton', { name: 'Maximum' }), '5');
        await user.click(apply());
        const filter = onApply.mock.calls[0]![0];
        expect(filter).toEqual({ id: 'col', type: 'number', max: 5 });
        expect('min' in filter).toBe(false);
    });

    it('0 is a real bound, not empty', async () => {
        const { onApply, user } = setup({ type: 'number' });
        await user.type(screen.getByRole('spinbutton', { name: 'Minimum' }), '0');
        await user.click(apply());
        expect(onApply).toHaveBeenCalledWith({ id: 'col', type: 'number', min: 0 });
    });

    it('accepts negative numbers', async () => {
        const { onApply, user } = setup({ type: 'number' });
        await user.type(screen.getByRole('spinbutton', { name: 'Minimum' }), '-10');
        await user.type(screen.getByRole('spinbutton', { name: 'Maximum' }), '-2');
        await user.click(apply());
        expect(onApply).toHaveBeenCalledWith({ id: 'col', type: 'number', min: -10, max: -2 });
    });

    it('min equal to max is fine', async () => {
        const { onApply, user } = setup({ type: 'number' });
        await user.type(screen.getByRole('spinbutton', { name: 'Minimum' }), '7');
        await user.type(screen.getByRole('spinbutton', { name: 'Maximum' }), '7');
        await user.click(apply());
        expect(onApply).toHaveBeenCalledWith({ id: 'col', type: 'number', min: 7, max: 7 });
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('starts from the current filter', () => {
        setup({ type: 'number' }, { id: 'col', type: 'number', min: 1, max: 9 });
        expect(screen.getByRole('spinbutton', { name: 'Minimum' })).toHaveValue(1);
        expect(screen.getByRole('spinbutton', { name: 'Maximum' })).toHaveValue(9);
    });

    it('both empty applies null', async () => {
        const { onApply, user } = setup({ type: 'number' });
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith(null);
    });

    it('Enter in either input applies', async () => {
        const { onApply, user } = setup({ type: 'number' });
        await user.type(screen.getByRole('spinbutton', { name: 'Minimum' }), '3{Enter}');
        await user.type(screen.getByRole('spinbutton', { name: 'Maximum' }), '4{Enter}');
        expect(onApply).toHaveBeenCalledTimes(2);
        expect(onApply).toHaveBeenLastCalledWith({ id: 'col', type: 'number', min: 3, max: 4 });
    });

    it('min > max shows an error, marks both inputs and does not apply', async () => {
        const { onApply, user } = setup({ type: 'number' });
        const min = screen.getByRole('spinbutton', { name: 'Minimum' });
        const max = screen.getByRole('spinbutton', { name: 'Maximum' });
        await user.type(min, '10');
        await user.type(max, '5');
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Das Minimum darf nicht größer als das Maximum sein.');
        expect(min).toBeInvalid();
        expect(max).toBeInvalid();
        expect(min).toHaveAccessibleDescription(
            'Das Minimum darf nicht größer als das Maximum sein.',
        );
        await user.click(apply());
        await user.type(max, '{Enter}');
        expect(onApply).not.toHaveBeenCalled();
    });

    it('the error clears once the range is fixed, and then applies', async () => {
        const { onApply, user } = setup({ type: 'number' });
        await user.type(screen.getByRole('spinbutton', { name: 'Minimum' }), '10');
        await user.type(screen.getByRole('spinbutton', { name: 'Maximum' }), '5');
        expect(screen.getByRole('alert')).toBeInTheDocument();
        await user.clear(screen.getByRole('spinbutton', { name: 'Minimum' }));
        expect(screen.queryByRole('alert')).toBeNull();
        await user.click(apply());
        expect(onApply).toHaveBeenCalledWith({ id: 'col', type: 'number', max: 5 });
    });

    it('"Zurücksetzen" still works while the range is invalid', async () => {
        const { onApply, user } = setup({ type: 'number' });
        await user.type(screen.getByRole('spinbutton', { name: 'Minimum' }), '10');
        await user.type(screen.getByRole('spinbutton', { name: 'Maximum' }), '5');
        await user.click(clear());
        expect(onApply).toHaveBeenCalledExactlyOnceWith(null);
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('shows no error before anything is wrong', () => {
        setup({ type: 'number' });
        expect(screen.queryByRole('alert')).toBeNull();
        expect(screen.getByRole('spinbutton', { name: 'Minimum' })).toBeValid();
    });
});

describe('GridFilterEditor — date', () => {
    it('has labelled from and to date inputs', () => {
        const { container } = render(
            <GridFilterEditor
                columnId="c"
                header="Beginn"
                def={{ type: 'date' }}
                onApply={() => {}}
                labels={LABELS}
            />,
        );
        expect(screen.getByLabelText('Von')).toHaveAttribute('type', 'date');
        expect(screen.getByLabelText('Bis')).toHaveAttribute('type', 'date');
        expect(container.querySelectorAll('input[type="date"]')).toHaveLength(2);
    });

    it('applies ISO dates', async () => {
        const { onApply, user } = setup({ type: 'date' }, undefined, 'start');
        await user.type(screen.getByLabelText('Von'), '2026-10-01');
        await user.type(screen.getByLabelText('Bis'), '2026-12-31');
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith({
            id: 'start',
            type: 'date',
            from: '2026-10-01',
            to: '2026-12-31',
        });
    });

    it('applies an open-ended range, leaving the empty side out', async () => {
        const { onApply, user } = setup({ type: 'date' });
        await user.type(screen.getByLabelText('Von'), '2026-10-01');
        await user.click(apply());
        const filter = onApply.mock.calls[0]![0];
        expect(filter).toEqual({ id: 'col', type: 'date', from: '2026-10-01' });
        expect('to' in filter).toBe(false);
    });

    it('starts from the current filter', () => {
        setup({ type: 'date' }, { id: 'col', type: 'date', from: '2026-01-02', to: '2026-03-04' });
        expect(screen.getByLabelText('Von')).toHaveValue('2026-01-02');
        expect(screen.getByLabelText('Bis')).toHaveValue('2026-03-04');
    });

    it('both empty applies null', async () => {
        const { onApply, user } = setup({ type: 'date' });
        await user.click(apply());
        expect(onApply).toHaveBeenCalledExactlyOnceWith(null);
    });

    it('the same day on both sides is fine', async () => {
        const { onApply, user } = setup({ type: 'date' });
        await user.type(screen.getByLabelText('Von'), '2026-10-01');
        await user.type(screen.getByLabelText('Bis'), '2026-10-01');
        await user.click(apply());
        expect(onApply).toHaveBeenCalledWith({
            id: 'col',
            type: 'date',
            from: '2026-10-01',
            to: '2026-10-01',
        });
    });

    it('Enter applies', async () => {
        const { onApply, user } = setup({ type: 'date' });
        await user.type(screen.getByLabelText('Von'), '2026-10-01{Enter}');
        expect(onApply).toHaveBeenCalledWith({ id: 'col', type: 'date', from: '2026-10-01' });
    });

    it('from after to is an error and does not apply', async () => {
        const { onApply, user } = setup({ type: 'date' });
        await user.type(screen.getByLabelText('Von'), '2026-12-31');
        await user.type(screen.getByLabelText('Bis'), '2026-10-01');
        expect(screen.getByRole('alert')).toHaveTextContent(LABELS.invalidRange);
        expect(screen.getByLabelText('Von')).toBeInvalid();
        await user.click(apply());
        await user.type(screen.getByLabelText('Bis'), '{Enter}');
        expect(onApply).not.toHaveBeenCalled();
    });
});
