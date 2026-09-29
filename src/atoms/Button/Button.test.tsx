import type * as React from 'react';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../organisms/DropdownMenu';

/**
 * Pin the forwardRef contract on the Button component.
 *
 * On React 18 a plain function component silently drops any ref passed to it.
 * Radix `Trigger asChild` (DropdownMenu, Popover, Tooltip, …) clones the Button
 * and passes a ref it uses as the floating-ui anchor. Without forwardRef that
 * ref is null, the popper never measures an anchor, and the menu renders
 * off-screen at its unpositioned fallback (`translate(0, -200%)`) — i.e. the
 * "Add block dropdown does nothing" bug on /admin/marketing/home.
 *
 * This test fails-before / passes-after the forwardRef fix.
 */
describe('Button — forwardRef contract', () => {
    it('forwards the ref to the underlying HTMLButtonElement', () => {
        const ref = createRef<HTMLButtonElement>();

        render(<Button ref={ref}>Click</Button>);

        expect(ref.current).not.toBeNull();
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        expect(ref.current?.tagName).toBe('BUTTON');
    });

    it('forwards the ref through asChild (Slot) to the rendered element', () => {
        const ref = createRef<HTMLAnchorElement>();

        render(
            // Button's ref is typed for its own <button>; with asChild it lands on
            // the child instead, which the type cannot express — hence the cast.
            <Button asChild ref={ref as unknown as React.Ref<HTMLButtonElement>}>
                <a href="/somewhere">Link</a>
            </Button>,
        );

        expect(ref.current).not.toBeNull();
        expect(ref.current?.tagName).toBe('A');
    });

    it('exposes a Radix asChild trigger ref so the dropdown can anchor + open', async () => {
        // The real regression surface: a Button used as `DropdownMenuTrigger
        // asChild`. If the ref does not reach the DOM the trigger can't drive
        // the menu. Asserting the trigger carries Radix's wiring proves the
        // ref made it through the Slot clone.
        const { default: userEvent } = await import('@testing-library/user-event');
        const user = userEvent.setup();

        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button>Open</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>One</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        const trigger = screen.getByRole('button', { name: 'Open' });
        // Radix attaches its trigger wiring (aria-haspopup) onto the cloned
        // child — only possible if the Slot received a usable element.
        expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        await user.click(trigger);

        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(await screen.findByRole('menuitem', { name: 'One' })).toBeInTheDocument();
    });
});
