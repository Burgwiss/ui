import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible';

function Fixture(props: React.ComponentProps<typeof Collapsible>) {
    return (
        <Collapsible {...props}>
            <CollapsibleTrigger>Mehr</CollapsibleTrigger>
            <CollapsibleContent>Versteckter Inhalt</CollapsibleContent>
        </Collapsible>
    );
}

describe('Collapsible', () => {
    it('starts closed with no content in the DOM', () => {
        render(<Fixture />);
        expect(screen.getByRole('button', { name: 'Mehr' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
        expect(screen.queryByText('Versteckter Inhalt')).toBeNull();
    });

    it('opens and closes through the trigger, reporting each change', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        render(<Fixture onOpenChange={onOpenChange} />);
        const trigger = screen.getByRole('button', { name: 'Mehr' });

        await user.click(trigger);
        expect(screen.getByText('Versteckter Inhalt')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(onOpenChange).toHaveBeenLastCalledWith(true);

        await user.click(trigger);
        // Removed synchronously: the primitive carries no exit animation.
        expect(screen.queryByText('Versteckter Inhalt')).toBeNull();
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('toggles with the keyboard', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        await user.tab();
        await user.keyboard('{Enter}');
        expect(screen.getByText('Versteckter Inhalt')).toBeInTheDocument();
        await user.keyboard(' ');
        expect(screen.queryByText('Versteckter Inhalt')).toBeNull();
    });

    it('honours defaultOpen and controlled open', () => {
        const { rerender } = render(<Fixture defaultOpen />);
        expect(screen.getByText('Versteckter Inhalt')).toBeInTheDocument();

        rerender(<Fixture open={false} />);
        expect(screen.queryByText('Versteckter Inhalt')).toBeNull();
    });

    it('does not toggle while disabled', async () => {
        const user = userEvent.setup();
        render(<Fixture disabled />);
        await user.click(screen.getByRole('button', { name: 'Mehr' }));
        expect(screen.queryByText('Versteckter Inhalt')).toBeNull();
    });

    it('forwards refs on root, trigger and content', () => {
        const root = createRef<HTMLDivElement>();
        const trigger = createRef<HTMLButtonElement>();
        const content = createRef<HTMLDivElement>();
        render(
            <Collapsible ref={root} defaultOpen>
                <CollapsibleTrigger ref={trigger}>Mehr</CollapsibleTrigger>
                <CollapsibleContent ref={content}>Inhalt</CollapsibleContent>
            </Collapsible>,
        );
        for (const r of [root, trigger, content]) {
            expect(r.current).toBeInstanceOf(HTMLElement);
        }
    });
});
