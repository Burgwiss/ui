import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { Switch } from '../atoms/Switch';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '../molecules/DropdownMenu';
import { Sidebar } from '../organisms/Sidebar';
import { SidebarLayout } from '../templates/SidebarLayout';
import { DirectionProvider } from './direction';

/*
 * Right-to-left, measured. jsdom has no layout, so whether a mirrored layout is
 * actually mirrored can only be seen here: real Chromium, real styles, the
 * same `dir` + `DirectionProvider` pair an app sets up.
 */

afterEach(cleanup);

function Rtl({ children }: { children: ReactNode }) {
    return (
        <div dir="rtl">
            <DirectionProvider dir="rtl">{children}</DirectionProvider>
        </div>
    );
}

const box = (el: Element) => el.getBoundingClientRect();

describe('right-to-left, in a real browser', () => {
    it('docks a start sidebar on the right, with its resize handle facing the page', async () => {
        render(
            <Rtl>
                <div style={{ height: 300, width: 900 }}>
                    <SidebarLayout
                        sidebar={
                            <Sidebar label="Navigation" resize={{ label: 'Breite ändern' }}>
                                <p>Menü</p>
                            </Sidebar>
                        }
                    >
                        <p>Inhalt</p>
                    </SidebarLayout>
                </div>
            </Rtl>,
        );
        const aside = screen.getByRole('complementary', { name: 'Navigation' });
        const main = screen.getByRole('main');
        expect(box(aside).left).toBeGreaterThanOrEqual(box(main).right - 0.5);

        // The handle straddles the aside's LEFT edge — the one next to the page.
        const handle = screen.getByRole('separator', { name: 'Breite ändern' });
        const centre = box(handle).left + box(handle).width / 2;
        expect(Math.abs(centre - box(aside).left)).toBeLessThan(4);

        // ← points into the page, so it grows the panel.
        const before = box(aside).width;
        handle.focus();
        await userEvent.keyboard('{ArrowLeft}');
        expect(box(aside).width).toBeGreaterThan(before);
    });

    it('opens a submenu to the left, and ← opens it from the keyboard', async () => {
        render(
            <Rtl>
                <div style={{ paddingInlineStart: 500, paddingTop: 20 }}>
                    <DropdownMenu>
                        <DropdownMenuTrigger>إجراءات</DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>نقل إلى</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem>الأرشيف</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuCheckboxItem checked>مثبت</DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </Rtl>,
        );
        await userEvent.tab();
        await userEvent.keyboard('{Enter}');
        const sub = await screen.findByRole('menuitem', { name: 'نقل إلى' });
        expect(document.activeElement).toBe(sub);

        // The check mark sits at the START of its item: the right.
        const checkbox = screen.getByRole('menuitemcheckbox', { name: 'مثبت' });
        const mark = checkbox.querySelector('svg')!;
        expect(box(mark).left - box(checkbox).left).toBeGreaterThan(
            box(checkbox).right - box(mark).right,
        );

        await userEvent.keyboard('{ArrowLeft}');
        const inner = await screen.findByRole('menuitem', { name: 'الأرشيف' });
        expect(box(inner).right).toBeLessThanOrEqual(box(sub).left + 8);
    });

    it('moves a switched-on thumb to the left end of its track', async () => {
        render(
            <Rtl>
                <Switch aria-label="مفعل" defaultChecked />
            </Rtl>,
        );
        const track = screen.getByRole('switch', { name: 'مفعل' });
        const thumb = track.firstElementChild!;
        await Promise.all(thumb.getAnimations().map((a) => a.finished));
        expect(box(thumb).left).toBeGreaterThanOrEqual(box(track).left - 0.5);
        expect(box(thumb).right).toBeLessThanOrEqual(box(track).right + 0.5);
        // On = toward the end edge, which is the left.
        expect(box(thumb).left - box(track).left).toBeLessThan(box(track).right - box(thumb).right);
    });
});
