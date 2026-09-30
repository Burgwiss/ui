import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookOpen, House } from 'lucide-react';
import { forwardRef, type ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

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
                <AppRailItem icon={BookOpen} label="Kurse" onClick={onClick} />
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
});
