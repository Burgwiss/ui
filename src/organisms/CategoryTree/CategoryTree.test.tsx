import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { TreeNode } from '../../lib/tree';
import { CategoryTree, type CategoryTreeProps } from './CategoryTree';
import { CATEGORY_TREE_LABELS as LABELS } from './CategoryTree.fixtures';

afterEach(() => localStorage.clear());

const TREE: TreeNode[] = [
    {
        id: 'arabisch',
        label: 'Arabisch',
        children: [
            { id: 'grund', label: 'Grundstufe' },
            { id: 'aufbau', label: 'Aufbaustufe' },
        ],
    },
    {
        id: 'koran',
        label: 'Koran',
        children: [{ id: 'tajwid', label: 'Tajwid' }],
    },
    { id: 'kunst', label: 'Kunst' },
];

/** A controlled tree, the way a page holds it: nodes and selection in state. */
function setup(props: Partial<CategoryTreeProps> = {}, initial: TreeNode[] = TREE) {
    const onNodesChange = vi.fn();
    const onSelect = vi.fn();
    const state: { nodes: TreeNode[] } = { nodes: initial };
    let ids = 0;
    function Harness() {
        const [nodes, setNodes] = useState(initial);
        const [selected, setSelected] = useState<string | null>(props.selectedId ?? null);
        return (
            <CategoryTree
                nodes={nodes}
                onNodesChange={(next, change) => {
                    state.nodes = next;
                    onNodesChange(next, change);
                    setNodes(next);
                }}
                selectedId={selected}
                onSelect={(id) => {
                    onSelect(id);
                    setSelected(id);
                }}
                createId={() => `neu-${++ids}`}
                labels={LABELS}
                {...props}
            />
        );
    }
    const user = userEvent.setup();
    const view = render(<Harness />);
    return { user, onNodesChange, onSelect, state, ...view };
}

const tree = () => screen.getByRole('tree', { name: 'Kategorien' });
const item = (name: string | RegExp) => screen.getByRole('treeitem', { name });
/** Tab into the tree (past the + button, when there is one). */
async function enter(user: ReturnType<typeof userEvent.setup>) {
    for (let i = 0; i < 3 && document.activeElement?.getAttribute('role') !== 'treeitem'; i++)
        await user.tab();
}
const names = () => screen.queryAllByRole('treeitem').map((el) => el.getAttribute('data-id'));

/** The tree as `id(child,child)`. */
function shape(nodes: TreeNode[]): string {
    return nodes
        .map((n) => (n.children?.length ? `${n.id}(${shape(n.children)})` : n.id))
        .join(',');
}

describe('CategoryTree — reading', () => {
    it('is a tree named by its heading, showing the top level', () => {
        setup();
        expect(tree()).toBeInTheDocument();
        expect(names()).toEqual(['arabisch', 'koran', 'kunst']);
        expect(item('Arabisch')).toHaveAttribute('aria-level', '1');
        expect(item('Arabisch')).toHaveAttribute('aria-setsize', '3');
        expect(item('Koran')).toHaveAttribute('aria-posinset', '2');
    });

    it('marks parents as collapsed and leaves leaves without aria-expanded', () => {
        setup();
        expect(item('Arabisch')).toHaveAttribute('aria-expanded', 'false');
        expect(item('Kunst')).not.toHaveAttribute('aria-expanded');
    });

    it('opens a parent from its chevron without selecting it', async () => {
        const { user, onSelect } = setup();
        await user.click(item('Arabisch').querySelector<HTMLElement>('[data-tree-toggle]')!);
        expect(item('Arabisch')).toHaveAttribute('aria-expanded', 'true');
        expect(names()).toEqual(['arabisch', 'grund', 'aufbau', 'koran', 'kunst']);
        expect(item('Grundstufe')).toHaveAttribute('aria-level', '2');
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('selects a category on click and marks it selected', async () => {
        const { user, onSelect } = setup();
        await user.click(item('Koran'));
        expect(onSelect).toHaveBeenCalledWith('koran');
        expect(item('Koran')).toHaveAttribute('aria-selected', 'true');
        expect(item('Kunst')).toHaveAttribute('aria-selected', 'false');
    });

    it('opens the ancestors of the selected category on first render', () => {
        setup({ selectedId: 'tajwid' });
        expect(item('Tajwid')).toHaveAttribute('aria-selected', 'true');
        expect(item('Koran')).toHaveAttribute('aria-expanded', 'true');
    });

    it('shows counts, and includes them in the name', () => {
        setup({ counts: { arabisch: 12, kunst: 0 } });
        expect(item('Arabisch, 12 Kurse')).toBeInTheDocument();
        expect(item('Kunst, 0 Kurse')).toBeInTheDocument();
        expect(item('Koran')).toBeInTheDocument();
    });

    it('says so when there are no categories', () => {
        setup({}, []);
        expect(screen.getByText('Noch keine Kategorien.')).toBeInTheDocument();
    });

    it('remembers which categories are open under its storage key', async () => {
        const first = setup({ storageKey: 'kurse' });
        await first.user.click(item('Koran').querySelector<HTMLElement>('[data-tree-toggle]')!);
        first.unmount();
        setup({ storageKey: 'kurse' });
        expect(item('Koran')).toHaveAttribute('aria-expanded', 'true');
        expect(item('Arabisch')).toHaveAttribute('aria-expanded', 'false');
    });

    it('ignores a corrupt remembered value', () => {
        localStorage.setItem('burgwiss-ui:tree:kurse', '{not json');
        setup({ storageKey: 'kurse', defaultExpandedIds: ['arabisch'] });
        expect(item('Arabisch')).toHaveAttribute('aria-expanded', 'true');
    });

    it('has no axe violations, open and closed', async () => {
        const { container } = setup({ counts: { arabisch: 3 }, defaultExpandedIds: ['arabisch'] });
        expect(await axe(container)).toHaveNoViolations();
    });
});

describe('CategoryTree — keyboard', () => {
    it('puts exactly one category in the tab order: the selected one, else the first', () => {
        setup({ selectedId: 'koran' });
        const tabbable = screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0);
        expect(tabbable.map((el) => el.getAttribute('data-id'))).toEqual(['koran']);
    });

    it('walks with the arrow keys, Home and End', async () => {
        const { user } = setup();
        await enter(user);
        expect(item('Arabisch')).toHaveFocus();
        await user.keyboard('{ArrowDown}');
        expect(item('Koran')).toHaveFocus();
        await user.keyboard('{End}');
        expect(item('Kunst')).toHaveFocus();
        await user.keyboard('{ArrowDown}');
        expect(item('Kunst')).toHaveFocus();
        await user.keyboard('{Home}');
        expect(item('Arabisch')).toHaveFocus();
        await user.keyboard('{ArrowUp}');
        expect(item('Arabisch')).toHaveFocus();
    });

    it('opens with → then steps in; closes with ← then steps out', async () => {
        const { user } = setup();
        await enter(user);
        await user.keyboard('{ArrowRight}');
        expect(item('Arabisch')).toHaveAttribute('aria-expanded', 'true');
        expect(item('Arabisch')).toHaveFocus();
        await user.keyboard('{ArrowRight}');
        expect(item('Grundstufe')).toHaveFocus();
        await user.keyboard('{ArrowLeft}');
        expect(item('Arabisch')).toHaveFocus();
        await user.keyboard('{ArrowLeft}');
        expect(item('Arabisch')).toHaveAttribute('aria-expanded', 'false');
    });

    it('swaps → and ← in a right-to-left page', async () => {
        const user = userEvent.setup();
        render(
            <div dir="rtl">
                <CategoryTree nodes={TREE} selectedId={null} onSelect={() => {}} labels={LABELS} />
            </div>,
        );
        await enter(user);
        await user.keyboard('{ArrowLeft}');
        expect(item('Arabisch')).toHaveAttribute('aria-expanded', 'true');
        await user.keyboard('{ArrowRight}');
        expect(item('Arabisch')).toHaveAttribute('aria-expanded', 'false');
    });

    it('selects with Enter and Space', async () => {
        const { user, onSelect } = setup();
        await enter(user);
        await user.keyboard('{ArrowDown}{Enter}');
        expect(onSelect).toHaveBeenLastCalledWith('koran');
        await user.keyboard('{ArrowDown} ');
        expect(onSelect).toHaveBeenLastCalledWith('kunst');
    });

    it('jumps to a category by typing the start of its name', async () => {
        const { user } = setup();
        await enter(user);
        await user.keyboard('k');
        expect(item('Koran')).toHaveFocus();
        await user.keyboard('k');
        expect(item('Kunst')).toHaveFocus();
    });
});

describe('CategoryTree — says what each edit was', () => {
    it('reports an add, a rename, a move and a delete as such', async () => {
        const { user, onNodesChange } = setup();
        const last = () => onNodesChange.mock.lastCall?.[1];

        await user.click(screen.getByRole('button', { name: 'Neue Kategorie' }));
        await user.keyboard('Kinder{Enter}');
        expect(last()).toEqual({
            type: 'add',
            id: 'neu-1',
            label: 'Kinder',
            parentId: null,
            index: 3,
        });

        await user.keyboard('{F2}Jugend{Enter}');
        expect(last()).toEqual({ type: 'rename', id: 'neu-1', label: 'Jugend' });

        await user.keyboard('{Alt>}{ArrowUp}{/Alt}');
        expect(last()).toEqual({ type: 'move', id: 'neu-1', parentId: null, index: 2 });

        await user.keyboard('{Delete}');
        expect(last()).toEqual({ type: 'remove', id: 'neu-1' });
    });
});

describe('CategoryTree — adding and renaming', () => {
    it('adds a top-level category from the + button, named on the spot', async () => {
        const { user, onNodesChange, state } = setup();
        await user.click(screen.getByRole('button', { name: 'Neue Kategorie' }));
        const input = screen.getByRole('textbox', { name: 'Name der Kategorie' });
        expect(input).toHaveFocus();
        expect(input).toHaveValue('Neue Kategorie');
        // The default name is selected, so typing replaces it.
        await user.keyboard('Kinder & Jugend{Enter}');
        expect(onNodesChange).toHaveBeenCalledTimes(1);
        expect(shape(state.nodes)).toBe('arabisch(grund,aufbau),koran(tajwid),kunst,neu-1');
        expect(state.nodes[3]!.label).toBe('Kinder & Jugend');
        expect(item('Kinder & Jugend')).toHaveFocus();
    });

    it('adds nothing when the new name is cancelled or left empty', async () => {
        const { user, onNodesChange } = setup();
        await user.click(screen.getByRole('button', { name: 'Neue Kategorie' }));
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('textbox')).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Neue Kategorie' }));
        await user.clear(screen.getByRole('textbox'));
        await user.keyboard('   {Enter}');
        expect(onNodesChange).not.toHaveBeenCalled();
        expect(names()).toEqual(['arabisch', 'koran', 'kunst']);
    });

    it('adds a subcategory from the menu, opening the parent', async () => {
        const { user, state } = setup();
        await user.pointer({ keys: '[MouseRight]', target: item('Kunst') });
        await user.click(await screen.findByRole('menuitem', { name: 'Unterkategorie anlegen' }));
        const input = await screen.findByRole('textbox', { name: 'Name der Kategorie' });
        await waitFor(() => expect(input).toHaveFocus());
        await user.keyboard('Kalligrafie{Enter}');
        expect(shape(state.nodes)).toBe('arabisch(grund,aufbau),koran(tajwid),kunst(neu-1)');
        expect(item('Kunst')).toHaveAttribute('aria-expanded', 'true');
        expect(item('Kalligrafie')).toHaveAttribute('aria-level', '2');
    });

    it('renames with F2: Enter keeps, Escape throws away, blank keeps the old name', async () => {
        const { user, state, onNodesChange } = setup();
        await enter(user);
        await user.keyboard('{F2}');
        const input = screen.getByRole('textbox', { name: 'Name der Kategorie' });
        expect(input).toHaveValue('Arabisch');
        await user.keyboard('Arabische Sprache{Enter}');
        expect(state.nodes[0]!.label).toBe('Arabische Sprache');
        expect(item('Arabische Sprache')).toHaveFocus();

        await user.keyboard('{F2}Egal{Escape}');
        expect(item('Arabische Sprache')).toHaveFocus();

        await user.keyboard('{F2}');
        await user.clear(screen.getByRole('textbox'));
        await user.keyboard('{Enter}');
        expect(state.nodes[0]!.label).toBe('Arabische Sprache');
        expect(onNodesChange).toHaveBeenCalledTimes(1);
    });

    it('does not report a rename to the same name', async () => {
        const { user, onNodesChange } = setup();
        await enter(user);
        await user.keyboard('{F2}{Enter}');
        expect(onNodesChange).not.toHaveBeenCalled();
    });

    it('keeps a rename when focus leaves the field', async () => {
        const { user, state } = setup();
        await enter(user);
        await user.keyboard('{F2}Sprachen');
        await user.click(document.body);
        expect(state.nodes[0]!.label).toBe('Sprachen');
    });

    it('keeps tree keys out of the name field', async () => {
        const { user } = setup();
        await enter(user);
        await user.keyboard('{F2}{Home}X{End}');
        expect(screen.getByRole('textbox')).toHaveValue('XArabisch');
    });
});

describe('CategoryTree — deleting', () => {
    it('deletes an empty category at once, announces it and keeps focus in the tree', async () => {
        const { user, state } = setup();
        await enter(user);
        await user.keyboard('{End}{Delete}');
        expect(shape(state.nodes)).toBe('arabisch(grund,aufbau),koran(tajwid)');
        expect(screen.getByText('„Kunst" gelöscht.')).toBeInTheDocument();
        expect(item('Koran')).toHaveFocus();
    });

    it('asks first when the category has subcategories or courses', async () => {
        const { user, state } = setup({ counts: { kunst: 4 } });
        await enter(user);
        await user.keyboard('{Delete}');
        const dialog = await screen.findByRole('alertdialog');
        expect(dialog).toHaveTextContent('2 Unterkategorien');
        await user.click(within(dialog).getByRole('button', { name: 'Abbrechen' }));
        expect(shape(state.nodes)).toBe(shape(TREE));
        await waitFor(() => expect(item('Arabisch')).toHaveFocus());

        await user.keyboard('{End}{Delete}');
        const second = await screen.findByRole('alertdialog');
        expect(second).toHaveTextContent('4 Kurse');
        await user.click(within(second).getByRole('button', { name: 'Löschen' }));
        expect(shape(state.nodes)).toBe('arabisch(grund,aufbau),koran(tajwid)');
    });

    it('clears the selection when the selected category goes', async () => {
        const { user, onSelect } = setup({ selectedId: 'kunst' });
        await enter(user);
        await user.keyboard('{Delete}');
        expect(onSelect).toHaveBeenLastCalledWith(null);
    });

    it('clears the selection when an ancestor of the selected category goes', async () => {
        const { user, onSelect } = setup({ selectedId: 'tajwid' });
        await user.pointer({ keys: '[MouseRight]', target: item('Koran') });
        await user.click(await screen.findByRole('menuitem', { name: 'Löschen …' }));
        await user.click(
            within(await screen.findByRole('alertdialog')).getByRole('button', {
                name: 'Löschen',
            }),
        );
        expect(onSelect).toHaveBeenLastCalledWith(null);
    });
});

describe('CategoryTree — moving', () => {
    it('moves with Alt + arrows, keeps focus on it, and announces where it went', async () => {
        const { user, state } = setup();
        await enter(user);
        await user.keyboard('{End}{Alt>}{ArrowUp}{/Alt}');
        expect(shape(state.nodes)).toBe('arabisch(grund,aufbau),kunst,koran(tajwid)');
        expect(item('Kunst')).toHaveFocus();

        await user.keyboard('{Alt>}{ArrowRight}{/Alt}');
        expect(shape(state.nodes)).toBe('arabisch(grund,aufbau,kunst),koran(tajwid)');
        expect(item('Kunst')).toHaveFocus();
        expect(item('Kunst')).toHaveAttribute('aria-level', '2');
        expect(screen.getByText('„Kunst" nach „Arabisch" verschoben.')).toBeInTheDocument();

        await user.keyboard('{Alt>}{ArrowLeft}{/Alt}');
        expect(shape(state.nodes)).toBe('arabisch(grund,aufbau),kunst,koran(tajwid)');
        expect(screen.getByText('„Kunst" auf die oberste Ebene verschoben.')).toBeInTheDocument();

        await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
        expect(shape(state.nodes)).toBe(shape(TREE));
    });

    it('does nothing (and says nothing) for a move that cannot happen', async () => {
        const { user, onNodesChange } = setup();
        await enter(user);
        await user.keyboard('{Alt>}{ArrowUp}{ArrowRight}{ArrowLeft}{/Alt}');
        expect(onNodesChange).not.toHaveBeenCalled();
    });

    it('moves anywhere from the menu, but never into itself', async () => {
        const { user, state } = setup();
        await user.pointer({ keys: '[MouseRight]', target: item('Arabisch') });
        await user.click(await screen.findByRole('menuitem', { name: 'Verschieben nach' }));
        const sub = (await screen.findAllByRole('menu')).at(-1)!;
        expect(within(sub).getByRole('menuitem', { name: 'Arabisch' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        expect(within(sub).getByRole('menuitem', { name: 'Grundstufe' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        // Already at the top level.
        expect(within(sub).getByRole('menuitem', { name: 'Oberste Ebene' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        // jsdom has no pointer-grace geometry for submenus: pick the entry by keyboard.
        act(() => within(sub).getByRole('menuitem', { name: 'Tajwid' }).focus());
        await user.keyboard('{Enter}');
        expect(shape(state.nodes)).toBe('koran(tajwid(arabisch(grund,aufbau))),kunst');
    });

    it('offers the menu from the keyboard (Shift+F10) and returns focus after', async () => {
        const { user } = setup();
        await enter(user);
        await user.keyboard('{Shift>}{F10}{/Shift}');
        const menu = await screen.findByRole('menu');
        expect(within(menu).getByRole('menuitem', { name: /Nach oben/ })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        expect(within(menu).getByRole('menuitem', { name: /Eine Ebene höher/ })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        await user.keyboard('{Escape}');
        await waitFor(() => expect(item('Arabisch')).toHaveFocus());
    });

    it('runs a move from the menu and keeps focus on the moved category', async () => {
        const { user, state } = setup();
        await user.pointer({ keys: '[MouseRight]', target: item('Kunst') });
        await user.click(await screen.findByRole('menuitem', { name: /Nach oben/ }));
        expect(shape(state.nodes)).toBe('arabisch(grund,aufbau),kunst,koran(tajwid)');
        await waitFor(() => expect(item('Kunst')).toHaveFocus());
    });
});

describe('CategoryTree — read-only', () => {
    it('offers no editing without onNodesChange', async () => {
        const user = userEvent.setup();
        render(<CategoryTree nodes={TREE} selectedId={null} onSelect={() => {}} labels={LABELS} />);
        expect(screen.queryByRole('button', { name: 'Neue Kategorie' })).toBeNull();
        await enter(user);
        await user.keyboard('{F2}{Delete}{Alt>}{ArrowDown}{/Alt}{Shift>}{F10}{/Shift}');
        expect(screen.queryByRole('textbox')).toBeNull();
        expect(screen.queryByRole('menu')).toBeNull();
        expect(names()).toEqual(['arabisch', 'koran', 'kunst']);
    });
});

describe('CategoryTree — outside changes', () => {
    it('moves focus to a neighbour when the focused category disappears', async () => {
        const user = userEvent.setup();
        const { rerender } = render(
            <CategoryTree nodes={TREE} selectedId={null} onSelect={() => {}} labels={LABELS} />,
        );
        await enter(user);
        await user.keyboard('{ArrowDown}');
        rerender(
            <CategoryTree
                nodes={TREE.filter((n) => n.id !== 'koran')}
                selectedId={null}
                onSelect={() => {}}
                labels={LABELS}
            />,
        );
        await act(async () => {});
        const tabbable = screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0);
        expect(tabbable).toHaveLength(1);
    });
});

describe('CategoryTree — opening a category to edit it', () => {
    it('offers a pencil beside ⋮ that opens the category, without selecting it', async () => {
        const onEdit = vi.fn();
        const { user, onSelect } = setup({ onEdit });
        await user.click(item('Koran').querySelector<HTMLElement>('[data-tree-edit]')!);
        expect(onEdit).toHaveBeenCalledWith('koran');
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('lists "Bearbeiten" first in the menu', async () => {
        const onEdit = vi.fn();
        const { user } = setup({ onEdit });
        await user.pointer({ keys: '[MouseRight]', target: item('Kunst') });
        const menu = await screen.findByRole('menu');
        const first = within(menu).getAllByRole('menuitem')[0]!;
        expect(first).toHaveTextContent('Bearbeiten');
        await user.click(first);
        expect(onEdit).toHaveBeenCalledWith('kunst');
    });

    it('has no pencil and no "Bearbeiten" without onEdit', async () => {
        const { user } = setup();
        expect(document.querySelector('[data-tree-edit]')).toBeNull();
        await user.pointer({ keys: '[MouseRight]', target: item('Kunst') });
        const menu = await screen.findByRole('menu');
        expect(within(menu).queryByRole('menuitem', { name: /Bearbeiten/ })).toBeNull();
    });

    it('still opens a read-only tree’s category from the keyboard menu', async () => {
        const onEdit = vi.fn();
        const user = userEvent.setup();
        render(
            <CategoryTree
                nodes={TREE}
                selectedId={null}
                onSelect={() => {}}
                onEdit={onEdit}
                labels={LABELS}
            />,
        );
        await enter(user);
        await user.keyboard('{Shift>}{F10}{/Shift}');
        const menu = await screen.findByRole('menu');
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((m) => m.textContent),
        ).toEqual(['Bearbeiten']);
        await user.keyboard('{Enter}');
        expect(onEdit).toHaveBeenCalledWith('arabisch');
    });
});
