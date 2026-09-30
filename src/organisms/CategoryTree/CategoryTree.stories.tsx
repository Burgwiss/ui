import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { TreeNode } from '../../lib/tree';
import { CategoryTree, type CategoryTreeProps } from './CategoryTree';
import { CATEGORY_TREE_LABELS, COURSE_CATEGORIES } from './CategoryTree.fixtures';

const COUNTS: Record<string, number> = {
    arabisch: 14,
    'arabisch-grundstufe': 6,
    'arabisch-aufbaustufe': 5,
    'arabisch-grammatik': 3,
    koran: 7,
    'koran-tajwid': 4,
    'koran-hifz': 3,
    islamwissenschaften: 9,
    fiqh: 3,
    hadith: 2,
    sira: 4,
    kinder: 3,
    kunst: 5,
};

function Demo({
    initial = COURSE_CATEGORIES,
    ...props
}: Partial<CategoryTreeProps> & { initial?: TreeNode[] }) {
    const [nodes, setNodes] = useState<TreeNode[]>(initial);
    const [selected, setSelected] = useState<string | null>(props.selectedId ?? null);
    return (
        <div className="w-72 rounded-lg border border-border bg-card p-2">
            <CategoryTree
                nodes={nodes}
                onNodesChange={setNodes}
                selectedId={selected}
                onSelect={setSelected}
                counts={COUNTS}
                labels={CATEGORY_TREE_LABELS}
                shortcutLabels={{ Delete: 'Entf' }}
                {...props}
            />
        </div>
    );
}

/**
 * The course categories as folders. Click to pick one; drag a folder onto
 * another to put it inside, or between two to put it beside them. Right-click
 * (or ⋮, or Shift+F10) for the menu. Keys: ↑ ↓ → ←, F2 to rename, Entf to
 * delete, Alt + arrows to move.
 */
const meta: Meta<typeof CategoryTree> = {
    title: 'Organisms/CategoryTree',
    component: CategoryTree,
    parameters: { layout: 'padded' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.startsWith('burgwiss-ui:tree:')) localStorage.removeItem(k);
    },
};
export default meta;

type Story = StoryObj<typeof CategoryTree>;

/** Editable, with course counts; "Arabisch" open. */
export const Kategorien: Story = {
    render: () => <Demo defaultExpandedIds={['arabisch']} />,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);

        await step('Add a category and name it', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Neue Kategorie' }));
            await userEvent.keyboard('Tafsir{Enter}');
            await expect(canvas.getByRole('treeitem', { name: 'Tafsir' })).toHaveFocus();
        });

        await step('Move it into "Koran" with Alt + arrows', async () => {
            // Up past "Kunst & Kultur", "Kinder & Jugend" and "Islamwissenschaften",
            // then into the category above.
            await userEvent.keyboard('{Alt>}{ArrowUp}{ArrowUp}{ArrowUp}{ArrowRight}{/Alt}');
            await waitFor(() =>
                expect(canvas.getByRole('treeitem', { name: 'Tafsir' })).toHaveAttribute(
                    'aria-level',
                    '2',
                ),
            );
        });
    },
};

/** A category is selected: its folders open to show it. */
export const Ausgewaehlt: Story = {
    name: 'Ausgewählt',
    render: () => <Demo selectedId="koran-hifz" />,
};

/** Without `onNodesChange`: pick only — no +, no menu, no dragging. */
export const NurLesen: Story = {
    name: 'Nur lesen',
    render: () => (
        <div className="w-72 rounded-lg border border-border bg-card p-2">
            <ReadOnly />
        </div>
    ),
};

function ReadOnly() {
    const [selected, setSelected] = useState<string | null>('fiqh');
    return (
        <CategoryTree
            nodes={COURSE_CATEGORIES}
            selectedId={selected}
            onSelect={setSelected}
            counts={COUNTS}
            labels={CATEGORY_TREE_LABELS}
        />
    );
}

/** No categories yet: the + button starts the first one. */
export const Leer: Story = {
    render: () => <Demo initial={[]} />,
};
