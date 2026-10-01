import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { contrastRatio } from '../../lib/color';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './DropdownMenu';

/*
 * What jsdom cannot tell us (#1558): whether the keyboard-focused item is
 * actually VISIBLE. The muted highlight alone measured ~1.1:1 against an
 * unfocused item. In real Chromium with the real styles, the focused item must
 * draw a ring, and the ring must clear 3:1 against the highlight it sits on.
 */

afterEach(cleanup);

function Menu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>Aktionen</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                <DropdownMenuItem>Duplizieren</DropdownMenuItem>
                <DropdownMenuCheckboxItem checked>Angeheftet</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** The inset ring is a box-shadow; `none` means nothing is drawn. */
const shadow = (el: Element) => getComputedStyle(el).boxShadow;

/**
 * The ring's colour. Tailwind stacks several shadows and leaves the unused
 * ones transparent, so take the one drawn `inset` — that is the ring.
 */
function ringColour(el: Element): string {
    const layer = shadow(el)
        .split(/,(?![^(]*\))/)
        .find((part) => part.includes('inset'));
    const m = layer?.match(/(?:oklch|oklab|rgba?)\([^)]*\)/);
    expect(m, `no inset ring in box-shadow "${shadow(el)}"`).toBeTruthy();
    return m![0];
}

/** `transition-colors` fades the highlight in; read it once it has settled. */
const settled = (el: Element) => Promise.all(el.getAnimations().map((a) => a.finished));

async function openWithKeyboard() {
    render(<Menu />);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('menu');
}

describe('DropdownMenu focus indicator, in a real browser', () => {
    it('draws a ring on the item the keyboard moved to', async () => {
        await openWithKeyboard();
        await userEvent.keyboard('{ArrowDown}');
        const item = screen.getByRole('menuitem', { name: 'Duplizieren' });
        expect(document.activeElement).toBe(item);
        expect(shadow(item)).not.toBe('none');
    });

    it('draws it on checkbox items too', async () => {
        await openWithKeyboard();
        await userEvent.keyboard('{End}');
        const item = screen.getByRole('menuitemcheckbox', { name: 'Angeheftet' });
        expect(document.activeElement).toBe(item);
        expect(shadow(item)).not.toBe('none');
    });

    it('leaves unfocused items without a ring', async () => {
        await openWithKeyboard();
        await userEvent.keyboard('{ArrowDown}');
        expect(shadow(screen.getByRole('menuitem', { name: 'Bearbeiten' }))).toBe('none');
    });

    it('the ring clears 3:1 against the highlighted item it sits inside', async () => {
        await openWithKeyboard();
        const item = screen.getByRole('menuitem', { name: 'Bearbeiten' });
        expect(document.activeElement).toBe(item);
        await settled(item);
        const ring = ringColour(item);
        const fill = getComputedStyle(item).backgroundColor;
        // Chromium serialises oklch() tokens as oklch(); contrastRatio reads those.
        const ratio = contrastRatio(ring, fill);
        expect(ratio, `ring ${ring} on ${fill}`).not.toBeNull();
        expect(ratio!).toBeGreaterThanOrEqual(3);
    });
});
