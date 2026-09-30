import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from './Popover';

function Fixture() {
    return (
        <Popover>
            <PopoverTrigger>Filter</PopoverTrigger>
            <PopoverContent aria-label="Filteroptionen">
                <button type="button">Nur aktive</button>
            </PopoverContent>
        </Popover>
    );
}

describe('Popover', () => {
    it('is closed until the trigger is used', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        const trigger = screen.getByRole('button', { name: 'Filter' });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText('Nur aktive')).toBeNull();

        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('dialog', { name: 'Filteroptionen' })).toBeInTheDocument();
    });

    it('closes on Escape and gives focus back to the trigger', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        await user.click(screen.getByRole('button', { name: 'Filter' }));
        await user.keyboard('{Escape}');
        expect(screen.queryByText('Nur aktive')).toBeNull();
        expect(screen.getByRole('button', { name: 'Filter' })).toHaveFocus();
    });

    it('closes on a click outside', async () => {
        const user = userEvent.setup();
        render(
            <>
                <p>Außerhalb</p>
                <Fixture />
            </>,
        );
        await user.click(screen.getByRole('button', { name: 'Filter' }));
        await user.click(screen.getByText('Außerhalb'));
        expect(screen.queryByText('Nur aktive')).toBeNull();
    });

    it('applies the default width and merges a caller className', () => {
        render(
            <Popover open>
                <PopoverTrigger>x</PopoverTrigger>
                <PopoverContent className="w-96">Inhalt</PopoverContent>
            </Popover>,
        );
        const cls = screen.getByText('Inhalt').className;
        expect(cls).toContain('w-96');
        expect(cls).not.toContain('w-72');
    });

    it('forwards refs on trigger, anchor and content', () => {
        const trigger = createRef<HTMLButtonElement>();
        const anchor = createRef<HTMLDivElement>();
        const content = createRef<HTMLDivElement>();
        render(
            <Popover open>
                <PopoverAnchor ref={anchor}>Anker</PopoverAnchor>
                <PopoverTrigger ref={trigger}>Auf</PopoverTrigger>
                <PopoverContent ref={content}>Inhalt</PopoverContent>
            </Popover>,
        );
        for (const r of [trigger, anchor, content]) {
            expect(r.current).toBeInstanceOf(HTMLElement);
        }
    });
});
