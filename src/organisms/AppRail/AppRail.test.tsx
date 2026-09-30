import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookOpen, House } from 'lucide-react';
import { forwardRef, type ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';
import { AppRail, AppRailItem, AppRailSpacer } from './AppRail';

describe('AppRail', () => {
    it('is a named navigation landmark', () => {
        render(
            <AppRail label="Apps">
                <AppRailItem icon={House} label="Start" href="/" />
            </AppRail>,
        );
        expect(screen.getByRole('navigation', { name: 'Apps' })).toBeInTheDocument();
    });

    it('renders a link for href, marked as the current page when active', () => {
        render(
            <AppRail label="Apps">
                <AppRailItem icon={House} label="Start" href="/start" active />
            </AppRail>,
        );
        const link = screen.getByRole('link', { name: 'Start' });
        expect(link).toHaveAttribute('href', '/start');
        expect(link).toHaveAttribute('aria-current', 'page');
    });

    it('renders a toggle button without href, pressed when active', async () => {
        const onClick = vi.fn();
        render(
            <AppRail label="Apps">
                <AppRailItem icon={BookOpen} label="Kurse" active={false} onClick={onClick} />
                <AppRailItem icon={House} label="Nutzer" active onClick={() => {}} />
            </AppRail>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Kurse' }));
        expect(onClick).toHaveBeenCalledOnce();
        expect(screen.getByRole('button', { name: 'Kurse' })).toHaveAttribute(
            'aria-pressed',
            'false',
        );
        expect(screen.getByRole('button', { name: 'Nutzer' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
    });

    it('uses a router link component when given one', () => {
        const RouterLink = forwardRef<HTMLAnchorElement, ComponentProps<'a'>>(function RouterLink(
            { children, ...props },
            ref,
        ) {
            return (
                <a ref={ref} data-router="yes" {...props}>
                    {children}
                </a>
            );
        });
        render(
            <AppRail label="Apps">
                <AppRailItem icon={House} label="Start" href="/" as={RouterLink} />
            </AppRail>,
        );
        expect(screen.getByRole('link', { name: 'Start' })).toHaveAttribute('data-router', 'yes');
    });

    it('shows the label as a tooltip on hover, for names the narrow rail cuts off', async () => {
        render(
            <AppRail label="Apps">
                <AppRailItem icon={BookOpen} label="Kurse" onClick={() => {}} />
            </AppRail>,
        );
        await userEvent.hover(screen.getByRole('button', { name: 'Kurse' }));
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Kurse');
    });

    it('renders the logo slot and a spacer', () => {
        const { container } = render(
            <AppRail label="Apps" logo={<a href="/">Logo</a>}>
                <AppRailSpacer />
            </AppRail>,
        );
        expect(screen.getByRole('link', { name: 'Logo' })).toBeInTheDocument();
        expect(container.querySelector('.flex-1[aria-hidden="true"]')).not.toBeNull();
    });

    it('is a plain button, not a toggle, when active is left out', () => {
        render(
            <AppRail label="Apps">
                <AppRailItem icon={BookOpen} label="Konto" onClick={() => {}} />
            </AppRail>,
        );
        expect(screen.getByRole('button', { name: 'Konto' })).not.toHaveAttribute('aria-pressed');
    });

    it('works as a menu trigger: ref and props reach the button', async () => {
        const user = userEvent.setup();
        render(
            <AppRail label="Apps">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <AppRailItem icon={House} label="Konto" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right">
                        <DropdownMenuItem>Abmelden</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </AppRail>,
        );
        const trigger = screen.getByRole('button', { name: 'Konto' });
        expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
        await user.click(trigger);
        expect(await screen.findByRole('menuitem', { name: 'Abmelden' })).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
});
