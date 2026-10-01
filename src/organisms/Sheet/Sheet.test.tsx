import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetOverlay,
    SheetTitle,
    SheetTrigger,
} from './Sheet';

function renderSide(side: 'left' | 'right' | 'top' | 'bottom', showHandle = false) {
    return render(
        <Sheet open>
            <SheetContent side={side} showHandle={showHandle} closeLabel="Schließen">
                <SheetTitle>Titel</SheetTitle>
            </SheetContent>
        </Sheet>,
    );
}

const content = () => document.querySelector('[data-slot="sheet-content"]') as HTMLElement;

describe('Sheet', () => {
    it('is closed until the trigger is used, then opens as a named dialog', async () => {
        const user = userEvent.setup();
        render(
            <Sheet>
                <SheetTrigger>Öffnen</SheetTrigger>
                <SheetContent closeLabel="Schließen">
                    <SheetTitle>Menü</SheetTitle>
                    <SheetDescription>Navigation</SheetDescription>
                </SheetContent>
            </Sheet>,
        );
        expect(screen.queryByRole('dialog')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Öffnen' }));
        const dialog = screen.getByRole('dialog', { name: 'Menü' });
        expect(dialog).toHaveAccessibleDescription('Navigation');
    });

    it('the corner close button is named by closeLabel and closes the sheet', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        render(
            <Sheet defaultOpen onOpenChange={onOpenChange}>
                <SheetContent closeLabel="Menü schließen">
                    <SheetTitle>Menü</SheetTitle>
                </SheetContent>
            </Sheet>,
        );
        await user.click(screen.getByRole('button', { name: 'Menü schließen' }));
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('showClose={false} renders no corner close button and needs no closeLabel', () => {
        render(
            <Sheet open>
                <SheetContent showClose={false}>
                    <SheetTitle>Menü</SheetTitle>
                </SheetContent>
            </Sheet>,
        );
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('SheetClose closes it and Escape does too', async () => {
        const user = userEvent.setup();
        render(
            <Sheet defaultOpen>
                <SheetContent closeLabel="Schließen">
                    <SheetTitle>Menü</SheetTitle>
                    <SheetClose>Fertig</SheetClose>
                </SheetContent>
            </Sheet>,
        );
        await user.click(screen.getByRole('button', { name: 'Fertig' }));
        expect(screen.queryByRole('dialog')).toBeNull();

        render(
            <Sheet defaultOpen>
                <SheetContent closeLabel="Schließen">
                    <SheetTitle>Zweites Menü</SheetTitle>
                </SheetContent>
            </Sheet>,
        );
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it.each([
        ['left', 'start-0', 'slide-in-from-start'],
        ['right', 'end-0', 'slide-in-from-end'],
        ['top', 'top-0', 'slide-in-from-top'],
        ['bottom', 'bottom-0', 'slide-in-from-bottom'],
    ] as const)('side="%s" anchors to its edge and slides from it', (side, anchor, slide) => {
        renderSide(side);
        expect(content().className).toContain(anchor);
        expect(content().className).toContain(slide);
    });

    it('defaults to the left edge', () => {
        render(
            <Sheet open>
                <SheetContent closeLabel="Schließen">
                    <SheetTitle>Menü</SheetTitle>
                </SheetContent>
            </Sheet>,
        );
        expect(content().className).toContain('slide-in-from-start');
    });

    it('the bottom sheet is rounded on top and clears the home indicator', () => {
        renderSide('bottom');
        expect(content().className).toContain('rounded-t-2xl');
        expect(content().className).toContain('safe-area-inset-bottom');
    });

    it('renders an aria-hidden grab handle only with showHandle', () => {
        const { unmount } = renderSide('bottom', true);
        expect(content().querySelectorAll('div[aria-hidden="true"]')).toHaveLength(1);
        unmount();
        renderSide('bottom', false);
        expect(content().querySelectorAll('div[aria-hidden="true"]')).toHaveLength(0);
    });

    it('forwards refs on content, title, overlay and trigger', () => {
        const contentRef = createRef<HTMLDivElement>();
        const titleRef = createRef<HTMLHeadingElement>();
        const triggerRef = createRef<HTMLButtonElement>();
        const closeRef = createRef<HTMLButtonElement>();
        const overlayRef = createRef<HTMLDivElement>();
        render(
            <Sheet open>
                <SheetTrigger ref={triggerRef}>Auf</SheetTrigger>
                <SheetOverlay ref={overlayRef} />
                <SheetContent ref={contentRef} closeLabel="Schließen">
                    <SheetTitle ref={titleRef}>Titel</SheetTitle>
                    <SheetClose ref={closeRef}>Zu</SheetClose>
                </SheetContent>
            </Sheet>,
        );
        for (const r of [contentRef, titleRef, triggerRef, closeRef]) {
            expect(r.current).toBeInstanceOf(HTMLElement);
        }
    });
});
