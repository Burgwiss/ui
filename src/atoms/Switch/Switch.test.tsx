import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Label } from '../Label';
import { Switch } from './Switch';

describe('Switch', () => {
    it('is a switch that starts off and flips on click', async () => {
        const user = userEvent.setup();
        const onCheckedChange = vi.fn();
        render(<Switch aria-label="Sichtbar" onCheckedChange={onCheckedChange} />);
        const sw = screen.getByRole('switch', { name: 'Sichtbar' });

        expect(sw).toHaveAttribute('aria-checked', 'false');
        await user.click(sw);
        expect(sw).toHaveAttribute('aria-checked', 'true');
        expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    });

    it('flips with the keyboard', async () => {
        const user = userEvent.setup();
        render(<Switch aria-label="Sichtbar" />);
        await user.tab();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('is named by its label and toggled by clicking it', async () => {
        const user = userEvent.setup();
        render(
            <>
                <Switch id="s" />
                <Label htmlFor="s">Benachrichtigungen</Label>
            </>,
        );
        await user.click(screen.getByText('Benachrichtigungen'));
        expect(screen.getByRole('switch', { name: 'Benachrichtigungen' })).toBeChecked();
    });

    it('does nothing while disabled', async () => {
        const user = userEvent.setup();
        const onCheckedChange = vi.fn();
        render(<Switch aria-label="x" disabled onCheckedChange={onCheckedChange} />);
        await user.click(screen.getByRole('switch'));
        expect(onCheckedChange).not.toHaveBeenCalled();
    });

    it('forwards the ref to the button', () => {
        const ref = createRef<HTMLButtonElement>();
        render(<Switch ref={ref} aria-label="x" />);
        expect(ref.current?.tagName).toBe('BUTTON');
    });
});
