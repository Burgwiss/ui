import type * as React from 'react';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';

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

describe('Button — tooltip', () => {
    async function setup() {
        const { default: userEvent } = await import('@testing-library/user-event');
        return userEvent.setup();
    }

    it('shows the tooltip on hover', async () => {
        const user = await setup();
        render(<Button tooltip="Kurs sichtbar machen">Veröffentlichen</Button>);

        await user.hover(screen.getByRole('button', { name: 'Veröffentlichen' }));

        expect(await screen.findByRole('tooltip')).toHaveTextContent('Kurs sichtbar machen');
    });

    it('shows the tooltip on keyboard focus and links it as the description', async () => {
        const user = await setup();
        render(<Button tooltip="Kurs sichtbar machen">Veröffentlichen</Button>);

        await user.tab();
        const button = screen.getByRole('button', { name: 'Veröffentlichen' });

        expect(button).toHaveFocus();
        expect(await screen.findByRole('tooltip')).toBeInTheDocument();
        expect(button).toHaveAccessibleDescription('Kurs sichtbar machen');
    });

    it('closes the tooltip on Escape and keeps focus on the button', async () => {
        const user = await setup();
        render(<Button tooltip="Kurs sichtbar machen">Veröffentlichen</Button>);

        await user.tab();
        await screen.findByRole('tooltip');
        await user.keyboard('{Escape}');

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        expect(screen.getByRole('button')).toHaveFocus();
    });

    it('keeps the visible text as the accessible name, not the tooltip', () => {
        render(<Button tooltip="Kurs sichtbar machen">Veröffentlichen</Button>);

        expect(screen.getByRole('button')).toHaveAccessibleName('Veröffentlichen');
    });

    it('renders a bare button with no tooltip wiring when a text button has no tooltip', async () => {
        const user = await setup();
        const { container } = render(<Button>Speichern</Button>);

        await user.hover(screen.getByRole('button'));

        expect(container.firstChild).toBe(screen.getByRole('button'));
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('treats an empty tooltip as none', async () => {
        const user = await setup();
        render(<Button tooltip="">Speichern</Button>);

        await user.hover(screen.getByRole('button'));

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('gives an icon-only button its aria-label as the tooltip', async () => {
        const user = await setup();
        render(
            <Button size="icon" aria-label="Neuer Kurs">
                <svg aria-hidden="true" />
            </Button>,
        );

        await user.hover(screen.getByRole('button', { name: 'Neuer Kurs' }));

        expect(await screen.findByRole('tooltip')).toHaveTextContent('Neuer Kurs');
    });

    it.each(['icon', 'icon-xs', 'icon-sm', 'icon-lg'] as const)(
        'gives an icon-only button (%s) a string tooltip as its aria-label',
        (size) => {
            render(
                <Button size={size} tooltip="Neuer Ordner">
                    <svg aria-hidden="true" />
                </Button>,
            );

            expect(screen.getByRole('button')).toHaveAccessibleName('Neuer Ordner');
        },
    );

    it('prefers an explicit aria-label over the tooltip on an icon-only button', () => {
        render(
            <Button size="icon" aria-label="Ordner anlegen" tooltip="Neuer Ordner in Kurse">
                <svg aria-hidden="true" />
            </Button>,
        );

        expect(screen.getByRole('button')).toHaveAccessibleName('Ordner anlegen');
    });

    it('does not borrow the tooltip as a name on a text button', () => {
        render(<Button tooltip="Kurs sichtbar machen">Veröffentlichen</Button>);

        expect(screen.getByRole('button')).not.toHaveAttribute('aria-label');
    });

    it('explains a disabled button on hover', async () => {
        const user = await setup();
        render(
            <Button disabled tooltip="Erst eine Lektion anlegen">
                Veröffentlichen
            </Button>,
        );

        await user.hover(screen.getByRole('button', { name: 'Veröffentlichen' }));

        expect(await screen.findByRole('tooltip')).toHaveTextContent('Erst eine Lektion anlegen');
    });

    it('lets the keyboard reach a disabled button with a reason, announced as disabled', async () => {
        const user = await setup();
        render(
            <Button disabled tooltip="Erst eine Lektion anlegen">
                Veröffentlichen
            </Button>,
        );

        await user.tab();
        const button = screen.getByRole('button', { name: 'Veröffentlichen' });

        expect(button).toHaveFocus();
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(await screen.findByRole('tooltip')).toBeInTheDocument();
        expect(button).toHaveAccessibleDescription('Erst eine Lektion anlegen');
    });

    it('never runs the handlers of a disabled button with a reason', async () => {
        const user = await setup();
        const onClick = vi.fn();
        const onPointerDown = vi.fn();
        const onKeyDown = vi.fn();
        render(
            <Button
                disabled
                tooltip="Erst eine Lektion anlegen"
                onClick={onClick}
                onPointerDown={onPointerDown}
                onKeyDown={onKeyDown}
            >
                Veröffentlichen
            </Button>,
        );

        const button = screen.getByRole('button');
        await user.click(button);
        button.focus();
        await user.keyboard('{Enter}{ }');

        expect(onClick).not.toHaveBeenCalled();
        expect(onPointerDown).not.toHaveBeenCalled();
        expect(onKeyDown).not.toHaveBeenCalled();
    });

    it('does not submit its form when disabled with a reason', async () => {
        const user = await setup();
        const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
        render(
            <form onSubmit={onSubmit}>
                <Button type="submit" disabled tooltip="Pflichtfelder fehlen">
                    Speichern
                </Button>
            </form>,
        );

        const button = screen.getByRole('button');
        await user.click(button);
        button.focus();
        await user.keyboard('{Enter}');

        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('does not open a dropdown from a disabled trigger with a reason', async () => {
        const user = await setup();
        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button disabled tooltip="Keine Aktionen verfügbar">
                        Mehr
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Eins</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        const trigger = screen.getByRole('button', { name: 'Mehr' });
        await user.click(trigger);
        trigger.focus();
        await user.keyboard('{Enter}{ArrowDown}');

        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });

    it('keeps a disabled button without a reason natively disabled and out of the tab order', async () => {
        const user = await setup();
        render(<Button disabled>Veröffentlichen</Button>);

        await user.tab();

        expect(screen.getByRole('button')).toBeDisabled();
        expect(document.body).toHaveFocus();
    });

    it('still forwards the ref when a tooltip wraps the button', () => {
        const ref = createRef<HTMLButtonElement>();
        render(
            <Button ref={ref} tooltip="Hinweis">
                Speichern
            </Button>,
        );

        expect(ref.current).toBe(screen.getByRole('button'));
    });

    it('still works as a dropdown trigger when it has a tooltip', async () => {
        const user = await setup();
        render(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button tooltip="Weitere Aktionen">Mehr</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem>Eins</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>,
        );

        const trigger = screen.getByRole('button', { name: 'Mehr' });
        expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

        await user.click(trigger);

        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(await screen.findByRole('menuitem', { name: 'Eins' })).toBeInTheDocument();
    });

    it('carries a tooltip through asChild onto a link', async () => {
        const user = await setup();
        render(
            <Button asChild tooltip="Öffnet die Kursseite">
                <a href="/kurse/arabisch">Ansehen</a>
            </Button>,
        );

        const link = screen.getByRole('link', { name: 'Ansehen' });
        await user.hover(link);

        expect(await screen.findByRole('tooltip')).toHaveTextContent('Öffnet die Kursseite');
    });
});

describe('Button — link variant', () => {
    // `--primary` is each app's (or school's) colour, so small text in it has
    // no contrast guarantee. The text is the body colour; the brand rides on
    // the underline, which is there at rest so colour never carries "link"
    // alone (WCAG 1.4.1).
    it('keeps its text out of the brand colour and underlines it at rest', () => {
        render(<Button variant="link">Mehr erfahren</Button>);
        const button = screen.getByRole('button', { name: 'Mehr erfahren' });
        const classes = button.className.split(/\s+/);
        expect(classes.some((c) => /^([a-z-]+:)*text-primary$/.test(c))).toBe(false);
        expect(button).toHaveClass('text-foreground', 'underline', 'decoration-primary');
    });
});
