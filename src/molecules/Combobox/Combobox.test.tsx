import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Combobox } from './Combobox';

const OPTIONS = ['Berlin', 'Bern', 'Wien', 'Zürich'];

function Host({
    onChange = () => {},
    initial = 'Wien',
    ...rest
}: Partial<React.ComponentProps<typeof Combobox>> & { initial?: string }) {
    const [value, setValue] = useState(initial);
    return (
        <Combobox
            id="stadt"
            value={value}
            options={OPTIONS}
            onChange={(v) => {
                setValue(v);
                onChange(v);
            }}
            searchPlaceholder="Stadt suchen"
            emptyLabel="Keine Stadt gefunden"
            {...rest}
        />
    );
}

describe('Combobox', () => {
    it('shows the current value in the input', () => {
        render(<Host />);
        expect(screen.getByRole('combobox')).toHaveValue('Wien');
    });

    it('gives the toggle button an accessible name (searchPlaceholder, then placeholder, then emptyLabel)', () => {
        const { rerender } = render(<Host />);
        expect(screen.getByRole('button', { name: 'Stadt suchen' })).toBeInTheDocument();

        rerender(<Host searchPlaceholder={undefined} placeholder="Stadt wählen" />);
        expect(screen.getByRole('button', { name: 'Stadt wählen' })).toBeInTheDocument();

        rerender(<Host searchPlaceholder={undefined} />);
        expect(screen.getByRole('button', { name: 'Keine Stadt gefunden' })).toBeInTheDocument();
    });

    it('opens the list on focus and picks an option with the mouse', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Host onChange={onChange} />);

        await user.click(screen.getByRole('combobox'));
        expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length);

        await user.click(screen.getByRole('option', { name: 'Zürich' }));
        expect(onChange).toHaveBeenCalledWith('Zürich');
        expect(screen.getByRole('combobox')).toHaveValue('Zürich');
    });

    it('filters the options as the user types (case-insensitive)', async () => {
        const user = userEvent.setup();
        render(<Host />);
        const input = screen.getByRole('combobox');
        await user.clear(input);
        await user.type(input, 'BER');
        const names = screen.getAllByRole('option').map((o) => o.textContent);
        expect(names).toEqual(['Berlin', 'Bern']);
    });

    it('shows emptyLabel when nothing matches, and reports nothing', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Host onChange={onChange} />);
        const input = screen.getByRole('combobox');
        await user.clear(input);
        await user.type(input, 'xyz');
        expect(screen.queryByRole('option')).toBeNull();
        expect(screen.getAllByText('Keine Stadt gefunden').length).toBeGreaterThan(0);
        expect(onChange).not.toHaveBeenCalled();
    });

    it('selects with the keyboard', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Host onChange={onChange} initial="" />);
        await user.click(screen.getByRole('combobox'));
        await user.keyboard('{ArrowDown}{Enter}');
        expect(onChange).toHaveBeenCalledOnce();
    });

    it('passes id and aria-invalid to the input', () => {
        render(<Host ariaInvalid />);
        const input = screen.getByRole('combobox');
        expect(input).toHaveAttribute('id', 'stadt');
        expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('omits aria-invalid when the field is valid', () => {
        render(<Host />);
        expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid');
    });
});
