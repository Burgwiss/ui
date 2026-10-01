import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { resizableWidthKey } from '../../hooks/useResizableWidth';
import {
    Sidebar,
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    type SidebarSide,
} from './Sidebar';

afterEach(() => localStorage.clear());

function Panel({ side = 'left' as SidebarSide, storageKey = 'test' }) {
    return (
        <Sidebar
            label="Kurse"
            side={side}
            resize={{ label: 'Breite ändern', storageKey, minWidth: 200, maxWidth: 560 }}
        >
            <p>Inhalt</p>
        </Sidebar>
    );
}
const panel = () => screen.getByRole('complementary', { name: 'Kurse' });
const handle = () => screen.getByRole('separator', { name: 'Breite ändern' });

describe('Sidebar', () => {
    it('is a named complementary landmark at its default width', () => {
        render(<Panel />);
        expect(panel()).toHaveStyle({ width: '280px' });
    });

    it('has a keyboard-operable resize handle announcing its value', () => {
        render(<Panel />);
        expect(handle()).toHaveAttribute('tabindex', '0');
        expect(handle()).toHaveAttribute('aria-orientation', 'vertical');
        expect(handle()).toHaveAttribute('aria-valuenow', '280');
        expect(handle()).toHaveAttribute('aria-valuemin', '200');
        expect(handle()).toHaveAttribute('aria-valuemax', '560');
    });

    it('grows with → and shrinks with ← on a left panel, Shift for big steps', async () => {
        const user = userEvent.setup();
        render(<Panel />);
        handle().focus();
        await user.keyboard('{ArrowRight}');
        expect(panel()).toHaveStyle({ width: '296px' });
        await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
        expect(panel()).toHaveStyle({ width: '232px' });
    });

    it('grows with ← on a right panel — toward the page', async () => {
        const user = userEvent.setup();
        render(<Panel side="right" />);
        handle().focus();
        await user.keyboard('{ArrowLeft}');
        expect(panel()).toHaveStyle({ width: '296px' });
    });

    it('jumps to the limits with Home and End, and resets with Enter', async () => {
        const user = userEvent.setup();
        render(<Panel />);
        handle().focus();
        await user.keyboard('{End}');
        expect(handle()).toHaveAttribute('aria-valuenow', '560');
        await user.keyboard('{Home}');
        expect(handle()).toHaveAttribute('aria-valuenow', '200');
        await user.keyboard('{Enter}');
        expect(handle()).toHaveAttribute('aria-valuenow', '280');
    });

    it('resets on double-click', async () => {
        const user = userEvent.setup();
        render(<Panel />);
        handle().focus();
        await user.keyboard('{End}');
        await user.dblClick(handle());
        expect(handle()).toHaveAttribute('aria-valuenow', '280');
    });

    it.each([
        ['left', 100, 380],
        ['right', 100, 200], // 280 - 100 = 180, held at the 200 minimum
        ['right', -100, 380],
    ] as const)('drags on a %s panel by %ipx', (side, dx, expected) => {
        render(<Panel side={side} />);
        fireEvent.pointerDown(handle(), { button: 0, clientX: 500, pointerId: 1 });
        fireEvent.pointerMove(handle(), { clientX: 500 + dx, pointerId: 1 });
        fireEvent.pointerUp(handle(), { pointerId: 1 });
        expect(panel()).toHaveStyle({ width: `${expected}px` });
        // The drag stops at pointer-up.
        fireEvent.pointerMove(handle(), { clientX: 0, pointerId: 1 });
        expect(panel()).toHaveStyle({ width: `${expected}px` });
    });

    it('ignores a right-button drag', () => {
        render(<Panel />);
        fireEvent.pointerDown(handle(), { button: 2, clientX: 500 });
        fireEvent.pointerMove(handle(), { clientX: 600 });
        expect(panel()).toHaveStyle({ width: '280px' });
    });

    it('remembers the width per storageKey', async () => {
        const user = userEvent.setup();
        const { unmount } = render(<Panel storageKey="kurse" />);
        handle().focus();
        await user.keyboard('{ArrowRight}');
        unmount();
        expect(localStorage.getItem(resizableWidthKey('kurse'))).toContain('296');
        render(<Panel storageKey="kurse" />);
        expect(panel()).toHaveStyle({ width: '296px' });
    });

    it('has no handle and a fixed width without resize', () => {
        render(
            <Sidebar label="Fest" defaultWidth={240}>
                x
            </Sidebar>,
        );
        expect(screen.queryByRole('separator')).not.toBeInTheDocument();
        expect(screen.getByRole('complementary', { name: 'Fest' })).toHaveStyle({ width: '240px' });
    });

    it('puts the border and the handle on the inner edge', () => {
        const { rerender } = render(<Panel side="left" />);
        expect(panel()).toHaveClass('border-e');
        expect(handle()).toHaveClass('-end-1');
        rerender(<Panel side="right" />);
        expect(panel()).toHaveClass('border-s');
        expect(handle()).toHaveClass('-start-1');
    });
});

describe('Sidebar menu', () => {
    it('marks the active entry as the current page and groups under a name', () => {
        render(
            <SidebarGroup label="Ordner">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton active>Alle</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <a href="#x">Sprachen</a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>,
        );
        expect(screen.getByRole('group', { name: 'Ordner' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Alle' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        expect(screen.getByRole('button', { name: 'Alle' })).toHaveAttribute('type', 'button');
        const link = screen.getByRole('link', { name: 'Sprachen' });
        expect(link).not.toHaveAttribute('aria-current');
        expect(link).not.toHaveAttribute('type');
    });
});
