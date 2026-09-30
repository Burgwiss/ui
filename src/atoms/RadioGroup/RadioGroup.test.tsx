import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Label } from '../Label';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

function Fixture({ onValueChange }: { onValueChange?: (v: string) => void }) {
    return (
        <RadioGroup defaultValue="a" aria-label="Wahl" onValueChange={onValueChange}>
            <RadioGroupItem value="a" id="a" />
            <Label htmlFor="a">Erste</Label>
            <RadioGroupItem value="b" id="b" />
            <Label htmlFor="b">Zweite</Label>
            <RadioGroupItem value="c" id="c" disabled />
            <Label htmlFor="c">Dritte</Label>
        </RadioGroup>
    );
}

describe('RadioGroup', () => {
    it('exposes a radiogroup with the default value checked', () => {
        render(<Fixture />);
        expect(screen.getByRole('radiogroup', { name: 'Wahl' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Erste' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Zweite' })).not.toBeChecked();
    });

    it('selects on click and reports the value', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Fixture onValueChange={onValueChange} />);
        await user.click(screen.getByRole('radio', { name: 'Zweite' }));
        expect(onValueChange).toHaveBeenCalledWith('b');
        expect(screen.getByRole('radio', { name: 'Zweite' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Erste' })).not.toBeChecked();
    });

    it('moves focus with arrow keys, skipping a disabled item', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        screen.getByRole('radio', { name: 'Erste' }).focus();
        // Radix moves focus on a timer, so wait for it.
        await user.keyboard('{ArrowDown}');
        await waitFor(() => expect(screen.getByRole('radio', { name: 'Zweite' })).toHaveFocus());
        await user.keyboard('{ArrowDown}');
        // Dritte is disabled, so focus wraps back to Erste.
        await waitFor(() => expect(screen.getByRole('radio', { name: 'Erste' })).toHaveFocus());
    });

    it('a disabled item cannot be chosen', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Fixture onValueChange={onValueChange} />);
        await user.click(screen.getByRole('radio', { name: 'Dritte' }));
        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('forwards refs on group and item', () => {
        const groupRef = createRef<HTMLDivElement>();
        const itemRef = createRef<HTMLButtonElement>();
        render(
            <RadioGroup ref={groupRef} aria-label="x">
                <RadioGroupItem ref={itemRef} value="a" aria-label="a" />
            </RadioGroup>,
        );
        expect(groupRef.current?.getAttribute('role')).toBe('radiogroup');
        expect(itemRef.current?.getAttribute('role')).toBe('radio');
    });
});
