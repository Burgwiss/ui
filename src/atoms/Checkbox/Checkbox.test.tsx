import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Label } from '../Label';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
    it('toggles on click and reports the new state', async () => {
        const user = userEvent.setup();
        const onCheckedChange = vi.fn();
        render(<Checkbox aria-label="AGB" onCheckedChange={onCheckedChange} />);
        const box = screen.getByRole('checkbox', { name: 'AGB' });

        expect(box).toHaveAttribute('data-state', 'unchecked');
        await user.click(box);
        expect(onCheckedChange).toHaveBeenLastCalledWith(true);
        expect(box).toHaveAttribute('data-state', 'checked');
        await user.click(box);
        expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    });

    it('toggles with the space key', async () => {
        const user = userEvent.setup();
        render(<Checkbox aria-label="AGB" />);
        await user.tab();
        await user.keyboard(' ');
        expect(screen.getByRole('checkbox')).toHaveAttribute('data-state', 'checked');
    });

    it('is toggled by clicking its associated label', async () => {
        const user = userEvent.setup();
        render(
            <>
                <Checkbox id="c" />
                <Label htmlFor="c">Newsletter</Label>
            </>,
        );
        await user.click(screen.getByText('Newsletter'));
        expect(screen.getByRole('checkbox', { name: 'Newsletter' })).toBeChecked();
    });

    it('ignores clicks while disabled', async () => {
        const user = userEvent.setup();
        const onCheckedChange = vi.fn();
        render(<Checkbox aria-label="AGB" disabled onCheckedChange={onCheckedChange} />);
        await user.click(screen.getByRole('checkbox'));
        expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('shows the check indicator only when checked', () => {
        const { container, rerender } = render(<Checkbox aria-label="x" checked={false} />);
        expect(container.querySelector('svg')).toBeNull();
        rerender(<Checkbox aria-label="x" checked />);
        expect(container.querySelector('svg')).not.toBeNull();
    });

    it('forwards the ref to the button', () => {
        const ref = createRef<HTMLButtonElement>();
        render(<Checkbox ref={ref} aria-label="x" />);
        expect(ref.current?.tagName).toBe('BUTTON');
    });
});
