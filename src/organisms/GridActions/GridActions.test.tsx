import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    gridSelectionState,
    visibleGridActions,
    type GridActionItem,
    type RowId,
} from '../../hooks';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '../../molecules/ContextMenu';
import { GridActionMenuItems, GridActions } from './GridActions';

const icon = <svg aria-hidden="true" />;
function item(id: string, extra: Partial<GridActionItem> = {}): GridActionItem {
    return { id, label: id, icon, onSelect: () => {}, ...extra };
}

const ITEMS = [
    item('Neu', { tone: 'primary' }),
    item('Exportieren', { group: 'io' }),
    item('Bearbeiten', { when: ['one'] }),
    item('Duplizieren', { when: ['one', 'many'] }),
    item('Löschen', { when: ['one', 'many'], group: 'danger', tone: 'destructive' }),
    item('Zusammenführen', { when: ['many'] }),
];
const ids = (n: number): RowId[] => Array.from({ length: n }, (_, i) => i + 1);
const names = () => screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));

describe('gridSelectionState', () => {
    it.each([
        [0, 'none'],
        [-1, 'none'],
        [1, 'one'],
        [2, 'many'],
        [500, 'many'],
    ] as const)('%i selected rows is "%s"', (count, state) => {
        expect(gridSelectionState(count)).toBe(state);
    });
});

describe('GridActions — what shows for a selection', () => {
    it('shows only the "none" actions when nothing is selected, and "none" is the default', () => {
        render(<GridActions label="Kurse" items={ITEMS} />);
        expect(names()).toEqual(['Neu', 'Exportieren']);
    });

    it('shows the "one" actions for exactly one row', () => {
        render(<GridActions label="Kurse" items={ITEMS} selectedIds={ids(1)} />);
        expect(names()).toEqual(['Bearbeiten', 'Duplizieren', 'Löschen']);
    });

    it('shows the "many" actions for several rows — not the single-row ones', () => {
        render(<GridActions label="Kurse" items={ITEMS} selectedIds={ids(4)} />);
        expect(names()).toEqual(['Duplizieren', 'Zusammenführen', 'Löschen']);
    });

    it('puts a separator only between groups that have something to show', () => {
        const { container, rerender } = render(<GridActions label="Kurse" items={ITEMS} />);
        expect(container.querySelectorAll('span.w-px')).toHaveLength(1);
        rerender(
            <GridActions
                label="Kurse"
                items={[item('A', { group: 'x', when: ['one'] }), item('B', { group: 'y' })]}
            />,
        );
        expect(container.querySelectorAll('span.w-px')).toHaveLength(0);
    });

    it('keeps groups in the order they first appear', () => {
        const groups = visibleGridActions(
            [item('a', { group: 'b' }), item('b', { group: 'a' }), item('c', { group: 'b' })],
            'none',
        );
        expect(groups.map((g) => g.map((i) => i.id))).toEqual([['a', 'c'], ['b']]);
    });

    it('renders every action — the primary one too — as an icon button without visible text', () => {
        render(<GridActions label="Kurse" items={ITEMS} />);
        for (const button of screen.getAllByRole('button')) {
            expect(button).toHaveAttribute('aria-label');
            expect(button).toHaveTextContent('');
        }
        expect(screen.getByRole('button', { name: 'Neu' })).toHaveAttribute(
            'data-variant',
            'default',
        );
    });

    it('passes the selected ids to onSelect', async () => {
        const onSelect = vi.fn();
        render(
            <GridActions
                label="Kurse"
                selectedIds={[7, 9]}
                items={[item('Duplizieren', { when: ['many'], onSelect })]}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Duplizieren' }));
        expect(onSelect).toHaveBeenCalledWith([7, 9]);
    });

    it('names the shortcut in the tooltip and in aria-keyshortcuts', async () => {
        render(
            <GridActions
                label="Kurse"
                items={[item('Neu', { shortcut: 'Mod+Shift+N' })]}
                shortcutLabels={{ Mod: 'Strg', Shift: 'Umschalt' }}
            />,
        );
        const button = screen.getByRole('button', { name: 'Neu' });
        expect(button).toHaveAttribute('aria-keyshortcuts', 'Control+Shift+N');
        await userEvent.hover(button);
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Strg+Umschalt+N');
    });

    it('decides disabled from the ids, tells why, and does not run', async () => {
        const onSelect = vi.fn();
        render(
            <GridActions
                label="Kurse"
                selectedIds={[1, 5]}
                items={[
                    item('Veröffentlichen', {
                        when: ['many'],
                        onSelect,
                        disabled: (picked) => picked.includes(5),
                        disabledReason: 'Archivierte Kurse erst wiederherstellen',
                    }),
                ]}
            />,
        );
        const button = screen.getByRole('button', { name: 'Veröffentlichen' });
        await userEvent.click(button);
        expect(onSelect).not.toHaveBeenCalled();
        expect(button).toHaveAttribute('aria-disabled', 'true');
        await userEvent.hover(button);
        expect(await screen.findByRole('tooltip')).toHaveTextContent(
            'Archivierte Kurse erst wiederherstellen',
        );
    });

    it('is a named toolbar', () => {
        render(<GridActions label="Kurse" items={ITEMS} />);
        expect(screen.getByRole('toolbar', { name: 'Kurse' })).toBeInTheDocument();
    });
});

describe('GridActionMenuItems — the right-click menu', () => {
    async function openMenu(items: GridActionItem[], selected: RowId[]) {
        const user = userEvent.setup();
        render(
            <ContextMenu>
                <ContextMenuTrigger>
                    <div>Fläche</div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <GridActionMenuItems
                        items={visibleGridActions(items, gridSelectionState(selected.length))}
                        ids={selected}
                        shortcutLabels={{ Mod: 'Strg' }}
                    />
                </ContextMenuContent>
            </ContextMenu>,
        );
        await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Fläche') });
        return { user, menu: await screen.findByRole('menu') };
    }

    it('shows the same actions the toolbar would, with shortcuts', async () => {
        await openMenu(
            [item('Neu'), item('Duplizieren', { when: ['one'], shortcut: 'Mod+D' })],
            [3],
        );
        const items = screen.getAllByRole('menuitem');
        expect(items.map((i) => i.textContent)).toEqual(['DuplizierenStrg+D']);
        expect(items[0]).toHaveAttribute('aria-keyshortcuts', 'Control+D');
    });

    it('runs with the ids on select', async () => {
        const onSelect = vi.fn();
        const { user } = await openMenu([item('Löschen', { when: ['one'], onSelect })], [3]);
        await user.click(screen.getByRole('menuitem', { name: /Löschen/ }));
        expect(onSelect).toHaveBeenCalledWith([3]);
    });

    it('shows a disabled action with its reason and does not run it', async () => {
        const onSelect = vi.fn();
        const { user } = await openMenu(
            [
                item('Veröffentlichen', {
                    when: ['one'],
                    disabled: true,
                    disabledReason: 'Erst wiederherstellen',
                    onSelect,
                }),
            ],
            [3],
        );
        const entry = screen.getByRole('menuitem', { name: /Veröffentlichen/ });
        expect(entry).toHaveAttribute('aria-disabled', 'true');
        expect(entry).toHaveTextContent('Erst wiederherstellen');
        await user.click(entry);
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('separates groups', async () => {
        await openMenu([item('A'), item('B', { group: 'x' })], []);
        expect(screen.getAllByRole('separator')).toHaveLength(1);
    });
});
