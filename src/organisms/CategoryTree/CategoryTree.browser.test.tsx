import { act, cleanup, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { TreeNode } from '../../lib/tree';
import { CategoryTree } from './CategoryTree';
import { CATEGORY_TREE_LABELS as LABELS } from './CategoryTree.fixtures';

/*
 * What jsdom cannot tell us: where a drop lands. The row under the pointer
 * and how far down it the pointer is decide "before", "into" or "after".
 */

afterEach(() => {
    cleanup();
    localStorage.clear();
});

const TREE: TreeNode[] = [
    {
        id: 'arabisch',
        label: 'Arabisch',
        children: [
            { id: 'grund', label: 'Grundstufe' },
            { id: 'aufbau', label: 'Aufbaustufe' },
        ],
    },
    { id: 'koran', label: 'Koran', children: [{ id: 'tajwid', label: 'Tajwid' }] },
    { id: 'kunst', label: 'Kunst' },
];

function shape(nodes: TreeNode[]): string {
    return nodes
        .map((n) => (n.children?.length ? `${n.id}(${shape(n.children)})` : n.id))
        .join(',');
}

let current: TreeNode[] = TREE;
const onSelect = vi.fn();

function Harness({ expanded = [] as string[] }) {
    const [nodes, setNodes] = useState(TREE);
    const [selected, setSelected] = useState<string | null>(null);
    return (
        <div className="w-72 p-2">
            <CategoryTree
                nodes={nodes}
                onNodesChange={(next) => {
                    current = next;
                    setNodes(next);
                }}
                selectedId={selected}
                onSelect={(id) => {
                    onSelect(id);
                    setSelected(id);
                }}
                defaultExpandedIds={expanded}
                labels={LABELS}
            />
        </div>
    );
}

const row = (name: string) => screen.getByRole('treeitem', { name });

/** A mouse drag from the middle of one row to a spot on another (0 = its top edge, 1 = its bottom). */
async function drag(from: HTMLElement, to: () => Element, at = 0.5, release = true) {
    const a = from.getBoundingClientRect();
    const fire = (el: Element, type: string, x: number, y: number) =>
        el.dispatchEvent(
            new PointerEvent(type, {
                bubbles: true,
                button: 0,
                pointerId: 1,
                pointerType: 'mouse',
                clientX: x,
                clientY: y,
            }),
        );
    const x = a.left + 40;
    fire(from, 'pointerdown', x, a.top + a.height / 2);
    // Past the threshold first: the drop zone only shows once a drag has begun.
    fire(from, 'pointermove', x, a.top + a.height / 2 + 10);
    await act(async () => {});
    const b = to().getBoundingClientRect();
    const y = b.top + b.height * at;
    fire(to(), 'pointermove', x, y);
    await act(async () => {});
    if (release) {
        fire(to(), 'pointerup', x, y);
        await act(async () => {});
    }
}

describe('CategoryTree — dragging, in a real browser', () => {
    it('drops into a category from the middle of its row', async () => {
        current = TREE;
        render(<Harness />);
        await drag(row('Kunst'), () => row('Arabisch'));
        expect(shape(current)).toBe('arabisch(grund,aufbau,kunst),koran(tajwid)');
        // The new parent opens so the moved category stays in view.
        expect(row('Arabisch')).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('„Kunst" nach „Arabisch" verschoben.')).toBeInTheDocument();
    });

    it('drops before a category from the top of its row, after it from the bottom', async () => {
        current = TREE;
        render(<Harness />);
        await drag(row('Kunst'), () => row('Koran'), 0.1);
        expect(shape(current)).toBe('arabisch(grund,aufbau),kunst,koran(tajwid)');
        await drag(row('Arabisch'), () => row('Koran'), 0.9);
        expect(shape(current)).toBe('kunst,koran(tajwid),arabisch(grund,aufbau)');
    });

    it('drops as the first child when dropped just below an open category', async () => {
        current = TREE;
        render(<Harness expanded={['arabisch']} />);
        await drag(row('Kunst'), () => row('Arabisch'), 0.9);
        expect(shape(current)).toBe('arabisch(kunst,grund,aufbau),koran(tajwid)');
    });

    it('shows where it will land while dragging, and nothing for an impossible drop', async () => {
        current = TREE;
        render(<Harness expanded={['arabisch']} />);
        await drag(row('Kunst'), () => row('Koran'), 0.5, false);
        expect(row('Koran')).toHaveAttribute('data-drop', 'inside');
        expect(row('Kunst').className).toContain('opacity-50');
        // Into itself: no indicator, and letting go changes nothing.
        cleanup();
        render(<Harness expanded={['arabisch']} />);
        await drag(row('Arabisch'), () => row('Grundstufe'), 0.5);
        expect(document.querySelector('[data-drop]')).toBeNull();
        expect(shape(current)).toBe(shape(TREE));
    });

    it('moves to the top level from the drop zone under the tree', async () => {
        current = TREE;
        render(<Harness expanded={['arabisch']} />);
        await drag(row('Grundstufe'), () => document.querySelector('[data-tree-end]')!);
        expect(shape(current)).toBe('arabisch(aufbau),koran(tajwid),kunst,grund');
    });

    it('cancels with Escape', async () => {
        current = TREE;
        render(<Harness />);
        await drag(row('Kunst'), () => row('Arabisch'), 0.5, false);
        await userEvent.keyboard('{Escape}');
        row('Arabisch').dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        await act(async () => {});
        expect(shape(current)).toBe(shape(TREE));
        expect(document.querySelector('[data-drop]')).toBeNull();
    });

    it('does not select the row a drag ends on', async () => {
        current = TREE;
        onSelect.mockClear();
        render(<Harness />);
        await drag(row('Kunst'), () => row('Koran'), 0.1, false);
        // A browser sends the click right after the pointerup, in the same turn.
        const target = row('Koran');
        const box = target.getBoundingClientRect();
        target.dispatchEvent(
            new PointerEvent('pointerup', {
                bubbles: true,
                clientX: box.left + 40,
                clientY: box.top + box.height * 0.1,
            }),
        );
        target.click();
        await act(async () => {});
        expect(shape(current)).toBe('arabisch(grund,aufbau),kunst,koran(tajwid)');
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('opens a closed category after hovering into it for a moment', async () => {
        current = TREE;
        render(<Harness />);
        await drag(row('Kunst'), () => row('Koran'), 0.5, false);
        expect(row('Koran')).toHaveAttribute('aria-expanded', 'false');
        await expect.poll(() => row('Koran').getAttribute('aria-expanded')).toBe('true');
        expect(row('Tajwid')).toBeInTheDocument();
        await userEvent.keyboard('{Escape}');
    });

    it('drags with a real mouse, too', async () => {
        current = TREE;
        render(<Harness />);
        await userEvent.dragAndDrop(
            page.getByRole('treeitem', { name: 'Kunst' }),
            page.getByRole('treeitem', { name: 'Koran' }),
        );
        expect(shape(current)).toBe('arabisch(grund,aufbau),koran(tajwid,kunst)');
    });

    it('looks right', async () => {
        render(
            <>
                <div data-testid="tree" className="w-72 bg-card p-2">
                    <CategoryTree
                        nodes={TREE}
                        onNodesChange={() => {}}
                        selectedId="grund"
                        onSelect={() => {}}
                        counts={{
                            arabisch: 11,
                            grund: 6,
                            aufbau: 5,
                            koran: 4,
                            tajwid: 4,
                            kunst: 2,
                        }}
                        labels={LABELS}
                    />
                </div>
                <p data-testid="away">·</p>
            </>,
        );
        // No hover from wherever an earlier test left the pointer.
        await userEvent.hover(page.getByTestId('away'));
        await expect.element(page.getByTestId('tree')).toMatchScreenshot('category-tree');
    });
});
