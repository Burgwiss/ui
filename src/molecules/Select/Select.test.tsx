import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
    nativeSelectClass,
} from './Select';

function Fixture({
    onValueChange,
    defaultValue,
}: {
    onValueChange?: (v: string) => void;
    defaultValue?: string;
}) {
    return (
        <Select onValueChange={onValueChange} defaultValue={defaultValue}>
            <SelectTrigger aria-label="Sprache">
                <SelectValue placeholder="Sprache wählen" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Verfügbar</SelectLabel>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">Englisch</SelectItem>
                    <SelectItem value="fr" disabled>
                        Französisch
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

describe('Select', () => {
    it('shows the placeholder until a value is chosen', () => {
        render(<Fixture />);
        expect(screen.getByRole('combobox', { name: 'Sprache' })).toHaveTextContent(
            'Sprache wählen',
        );
    });

    it('shows the default value', () => {
        render(<Fixture defaultValue="en" />);
        expect(screen.getByRole('combobox')).toHaveTextContent('Englisch');
    });

    it('opens a listbox with the options and picks one on click', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Fixture onValueChange={onValueChange} />);

        await user.click(screen.getByRole('combobox'));
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Deutsch' })).toBeInTheDocument();

        await user.click(screen.getByRole('option', { name: 'Englisch' }));
        expect(onValueChange).toHaveBeenCalledWith('en');
        expect(screen.getByRole('combobox')).toHaveTextContent('Englisch');
        expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('is operable from the keyboard', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Fixture onValueChange={onValueChange} />);
        await user.tab();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        await user.keyboard('{ArrowDown}{Enter}');
        expect(onValueChange).toHaveBeenCalledOnce();
    });

    it('a disabled item cannot be chosen', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Fixture onValueChange={onValueChange} />);
        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: 'Französisch' }));
        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('a disabled trigger does not open', async () => {
        const user = userEvent.setup();
        render(
            <Select disabled>
                <SelectTrigger aria-label="Sprache">
                    <SelectValue placeholder="x" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
            </Select>,
        );
        await user.click(screen.getByRole('combobox'));
        expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('exposes the trigger size and forwards its ref', () => {
        const ref = createRef<HTMLButtonElement>();
        render(
            <Select>
                <SelectTrigger ref={ref} size="sm" aria-label="x">
                    <SelectValue placeholder="x" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="a">A</SelectItem>
                </SelectContent>
            </Select>,
        );
        expect(ref.current).toHaveAttribute('data-size', 'sm');
    });

    it('exports one class string for a native select that matches the Input look', () => {
        expect(nativeSelectClass).toContain('border-input');
        expect(nativeSelectClass).toContain('focus-visible:ring-ring');
    });
});
