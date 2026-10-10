import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FolderScope, TreeNode } from '../../lib/tree';
import { CATEGORY_TREE_LABELS } from '../CategoryTree/CategoryTree.fixtures';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../Sidebar';
import { FolderSidebar, type FolderSidebarProps } from './FolderSidebar';

afterEach(() => localStorage.clear());

const NODES: TreeNode[] = [
    {
        id: 'arabisch',
        label: 'Arabisch',
        children: [{ id: 'grund', label: 'Grundstufe' }],
    },
    { id: 'kunst', label: 'Kunst' },
];

function setup(props: Partial<FolderSidebarProps> = {}) {
    const onScopeChange = vi.fn();
    const user = userEvent.setup();
    const view = render(
        <FolderSidebar
            title="Kurse"
            all={{ label: 'Alle Kurse', count: 1234 }}
            none={{ label: 'Ohne Kategorie', count: 3 }}
            scope={{ kind: 'all' }}
            onScopeChange={onScopeChange}
            tree={{ nodes: NODES, labels: CATEGORY_TREE_LABELS, defaultExpandedIds: ['arabisch'] }}
            {...props}
        />,
    );
    return { user, onScopeChange, ...view };
}

const entry = (name: string | RegExp) => screen.getByRole('button', { name });
const item = (name: string | RegExp) => screen.getByRole('treeitem', { name });

describe('FolderSidebar', () => {
    it('is a landmark named by its title, which is also shown at the top', () => {
        setup();
        const panel = screen.getByRole('complementary', { name: 'Kurse' });
        expect(within(panel).getByText('Kurse')).toBeInTheDocument();
    });

    it('shows the counts beside "all" and "none", as given', () => {
        setup();
        expect(entry(/Alle Kurse/)).toHaveTextContent('1234');
        expect(entry(/Ohne Kategorie/)).toHaveTextContent('3');
    });

    it('formats counts with formatCount', () => {
        setup({ formatCount: (n) => n.toLocaleString('de') });
        expect(entry(/Alle Kurse/)).toHaveTextContent('1.234');
    });

    it('shows a count of zero, and none when count is omitted', () => {
        setup({ all: { label: 'Alle Kurse', count: 0 }, none: { label: 'Ohne Kategorie' } });
        expect(entry(/Alle Kurse/)).toHaveTextContent('0');
        expect(entry(/Ohne Kategorie/)).toHaveTextContent(/^Ohne Kategorie$/);
    });

    it('draws a custom icon instead of the default', () => {
        setup({ all: { label: 'Alle Kurse', icon: <span data-testid="mein-icon" /> } });
        expect(within(entry(/Alle Kurse/)).getByTestId('mein-icon')).toBeInTheDocument();
    });

    it('asks for "all" when "all" is clicked', async () => {
        const { user, onScopeChange } = setup({ scope: { kind: 'none' } });
        await user.click(entry(/Alle Kurse/));
        expect(onScopeChange).toHaveBeenCalledExactlyOnceWith({ kind: 'all' });
    });

    it('asks for "none" when "without folder" is clicked', async () => {
        const { user, onScopeChange } = setup();
        await user.click(entry(/Ohne Kategorie/));
        expect(onScopeChange).toHaveBeenCalledExactlyOnceWith({ kind: 'none' });
    });

    it('asks for the folder when a tree node is clicked, at any depth', async () => {
        const { user, onScopeChange } = setup();
        await user.click(item('Grundstufe'));
        expect(onScopeChange).toHaveBeenLastCalledWith({ kind: 'folder', id: 'grund' });
        await user.click(item('Kunst'));
        expect(onScopeChange).toHaveBeenLastCalledWith({ kind: 'folder', id: 'kunst' });
    });

    it('asks for "all" when the tree reports its selection cleared', async () => {
        const onScopeChange = vi.fn();
        const user = userEvent.setup();
        render(
            <FolderSidebar
                title="Kurse"
                all={{ label: 'Alle Kurse' }}
                scope={{ kind: 'folder', id: 'kunst' }}
                onScopeChange={onScopeChange}
                tree={{ nodes: NODES, labels: CATEGORY_TREE_LABELS, onNodesChange: () => {} }}
            />,
        );
        await user.click(item('Kunst'));
        await user.keyboard('{Delete}');
        expect(onScopeChange).toHaveBeenLastCalledWith({ kind: 'all' });
    });

    it('marks the active entry for each kind of scope', () => {
        const { rerender } = setup();
        const render_ = (scope: FolderScope | null) =>
            rerender(
                <FolderSidebar
                    title="Kurse"
                    all={{ label: 'Alle Kurse' }}
                    none={{ label: 'Ohne Kategorie' }}
                    scope={scope}
                    onScopeChange={() => {}}
                    tree={{ nodes: NODES, labels: CATEGORY_TREE_LABELS }}
                />,
            );
        expect(entry(/Alle Kurse/)).toHaveAttribute('aria-current', 'page');
        expect(entry(/Ohne Kategorie/)).not.toHaveAttribute('aria-current');

        render_({ kind: 'none' });
        expect(entry(/Ohne Kategorie/)).toHaveAttribute('aria-current', 'page');
        expect(entry(/Alle Kurse/)).not.toHaveAttribute('aria-current');
        expect(screen.queryByRole('treeitem', { selected: true })).not.toBeInTheDocument();

        render_({ kind: 'folder', id: 'kunst' });
        expect(item('Kunst')).toHaveAttribute('aria-selected', 'true');
        expect(entry(/Alle Kurse/)).not.toHaveAttribute('aria-current');
        expect(entry(/Ohne Kategorie/)).not.toHaveAttribute('aria-current');
    });

    it('highlights nothing for a null scope, but clicks still report', async () => {
        const { user, onScopeChange } = setup({ scope: null });
        expect(entry(/Alle Kurse/)).not.toHaveAttribute('aria-current');
        expect(entry(/Ohne Kategorie/)).not.toHaveAttribute('aria-current');
        expect(screen.queryByRole('treeitem', { selected: true })).not.toBeInTheDocument();
        await user.click(entry(/Ohne Kategorie/));
        expect(onScopeChange).toHaveBeenCalledWith({ kind: 'none' });
        await user.click(item('Kunst'));
        expect(onScopeChange).toHaveBeenLastCalledWith({ kind: 'folder', id: 'kunst' });
    });

    it('opens the ancestors of a selected folder', () => {
        setup({
            scope: { kind: 'folder', id: 'grund' },
            tree: { nodes: NODES, labels: CATEGORY_TREE_LABELS },
        });
        expect(item('Grundstufe')).toHaveAttribute('aria-selected', 'true');
    });

    it('hides the "without folder" entry when none is omitted', () => {
        setup({ none: undefined });
        expect(screen.queryByRole('button', { name: /Ohne Kategorie/ })).not.toBeInTheDocument();
        expect(entry(/Alle Kurse/)).toBeInTheDocument();
    });

    it('passes tree props through, e.g. maxDepth makes the folders flat', async () => {
        const { user } = setup({
            tree: {
                nodes: NODES,
                labels: CATEGORY_TREE_LABELS,
                onNodesChange: () => {},
                maxDepth: 1,
            },
        });
        await user.pointer({ keys: '[MouseRight]', target: item('Kunst') });
        await screen.findByRole('menu');
        expect(
            screen.queryByRole('menuitem', { name: 'Unterkategorie anlegen' }),
        ).not.toBeInTheDocument();
    });

    it('renders its children after the tree', () => {
        setup({
            children: (
                <SidebarGroup label="Einstellungen">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>Schlagwörter</SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            ),
        });
        const tree = screen.getByRole('tree');
        const link = screen.getByRole('button', { name: 'Schlagwörter' });
        expect(tree.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('remounts the tree when treeKey changes, dropping a half-typed name', async () => {
        const again = (treeKey: string) => (
            <FolderSidebar
                title="Kurse"
                all={{ label: 'Alle Kurse' }}
                scope={null}
                onScopeChange={() => {}}
                treeKey={treeKey}
                tree={{ nodes: NODES, labels: CATEGORY_TREE_LABELS, onNodesChange: () => {} }}
            />
        );
        const user = userEvent.setup();
        const { rerender } = render(again('a'));
        await user.click(screen.getByRole('button', { name: 'Neue Kategorie' }));
        const field = await screen.findByRole('textbox', { name: 'Name der Kategorie' });
        await user.type(field, 'Halb');

        // The same key keeps the field and what was typed.
        rerender(again('a'));
        const same = screen.getByRole('textbox', { name: 'Name der Kategorie' });
        expect(same).toBe(field);
        expect((same as HTMLInputElement).value).toContain('Halb');

        rerender(again('b'));
        expect(
            screen.queryByRole('textbox', { name: 'Name der Kategorie' }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('has no axe violations, with and without a scope', async () => {
        const { container, rerender } = setup({
            children: (
                <SidebarGroup label="Einstellungen">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>Schlagwörter</SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            ),
        });
        expect(await axe(container)).toHaveNoViolations();
        rerender(
            <FolderSidebar
                title="Kurse"
                all={{ label: 'Alle Kurse', count: 4 }}
                scope={{ kind: 'folder', id: 'kunst' }}
                onScopeChange={() => {}}
                tree={{ nodes: NODES, labels: CATEGORY_TREE_LABELS, onNodesChange: () => {} }}
            />,
        );
        expect(await axe(container)).toHaveNoViolations();
    });
});
