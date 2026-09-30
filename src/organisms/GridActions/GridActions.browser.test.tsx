import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import type { GridActionItem } from '../../hooks';
import { GridActions } from './GridActions';

/*
 * What jsdom cannot tell us: how many icons fit. The toolbar measures itself
 * and puts what does not fit behind a "…" menu.
 */

afterEach(cleanup);

const icon = <svg aria-hidden="true" viewBox="0 0 16 16" />;
function item(id: string, extra: Partial<GridActionItem> = {}): GridActionItem {
    return { id, label: id, icon, onSelect: () => {}, ...extra };
}
const ITEMS = ['Eins', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht'].map((id, i) =>
    item(id, { group: i < 4 ? 'a' : 'b' }),
);

const frame = () => act(() => new Promise((r) => requestAnimationFrame(() => r(null))));
const shown = () =>
    within(screen.getByRole('toolbar'))
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-label'));

function Bar({ width, items = ITEMS }: { width: number; items?: GridActionItem[] }) {
    return (
        <div style={{ width }} className="flex">
            <GridActions label="Kurse" items={items} moreLabel="Weitere Aktionen" />
        </div>
    );
}

describe('GridActions — overflow, in a real browser', () => {
    it('shows every icon when there is room, and no "…"', async () => {
        render(<Bar width={600} />);
        await frame();
        expect(shown()).toEqual([
            'Eins',
            'Zwei',
            'Drei',
            'Vier',
            'Fünf',
            'Sechs',
            'Sieben',
            'Acht',
        ]);
    });

    it('shows what fits, then "…" — and nothing spills out', async () => {
        // 8 buttons need 8 × 32 + 7 × 4 = 284px. At 160px: 3 icons + "…" = 4 × 32 + 3 × 4 = 140.
        render(<Bar width={160} />);
        await frame();
        expect(shown()).toEqual(['Eins', 'Zwei', 'Drei', 'Weitere Aktionen']);
        const bar = screen.getByRole('toolbar').getBoundingClientRect();
        for (const button of within(screen.getByRole('toolbar')).getAllByRole('button'))
            expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(bar.right + 0.5);
    });

    it('lists the rest in the "…" menu, and runs them from there', async () => {
        const onSelect = vi.fn();
        const items = ITEMS.map((i) => (i.id === 'Sieben' ? { ...i, onSelect } : i));
        render(<Bar width={160} items={items} />);
        await frame();
        await userEvent.click(screen.getByRole('button', { name: 'Weitere Aktionen' }));
        const menu = await screen.findByRole('menu');
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((m) => m.textContent),
        ).toEqual(['Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht']);
        // Groups keep a line between them inside the menu.
        expect(within(menu).getAllByRole('separator')).toHaveLength(1);
        await userEvent.click(within(menu).getByRole('menuitem', { name: 'Sieben' }));
        expect(onSelect).toHaveBeenCalled();
    });

    it('re-measures when its room changes', async () => {
        const { rerender } = render(<Bar width={600} />);
        await frame();
        expect(shown()).toHaveLength(8);
        rerender(<Bar width={100} />);
        await frame();
        await frame();
        // 100px: 2 icons + "…" = 3 × 32 + 2 × 4 = 104 > 100, so 1 icon + "…".
        expect(shown()).toEqual(['Eins', 'Weitere Aktionen']);
        rerender(<Bar width={600} />);
        await frame();
        await frame();
        expect(shown()).toHaveLength(8);
    });

    it('holds still while the "…" menu is open, even when room frees up', async () => {
        const { rerender } = render(<Bar width={160} />);
        await frame();
        await userEvent.click(screen.getByRole('button', { name: 'Weitere Aktionen' }));
        await screen.findByRole('menu');
        rerender(<Bar width={600} />);
        await frame();
        await frame();
        expect(screen.getByRole('menu')).toBeVisible();
        await userEvent.keyboard('{Escape}');
        await frame();
        await frame();
        expect(shown()).toHaveLength(8);
    });
});
