import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Download, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';

import type { GridActionItem } from '../../hooks';
import { GridActions } from './GridActions';

const noop = () => {};
const ITEMS: GridActionItem[] = [
    {
        id: 'new',
        label: 'Neu',
        icon: <Plus aria-hidden="true" />,
        onSelect: noop,
        tone: 'primary',
        shortcut: 'N',
    },
    {
        id: 'export',
        label: 'Exportieren',
        icon: <Download aria-hidden="true" />,
        onSelect: noop,
        group: 'io',
    },
    {
        id: 'reload',
        label: 'Neu laden',
        icon: <RefreshCw aria-hidden="true" />,
        onSelect: noop,
        group: 'view',
    },
    {
        id: 'edit',
        label: 'Bearbeiten',
        icon: <Pencil aria-hidden="true" />,
        onSelect: noop,
        when: ['one'],
    },
    {
        id: 'copy',
        label: 'Duplizieren',
        icon: <Copy aria-hidden="true" />,
        onSelect: noop,
        when: ['one', 'many'],
        shortcut: 'Mod+D',
    },
    {
        id: 'delete',
        label: 'Löschen',
        icon: <Trash2 aria-hidden="true" />,
        onSelect: noop,
        when: ['one', 'many'],
        group: 'danger',
        tone: 'destructive',
        shortcut: 'Delete',
    },
];

const meta = {
    title: 'Organisms/GridActions',
    component: GridActions,
    args: { label: 'Kurse', items: ITEMS, selectedIds: [] },
    argTypes: { items: { control: false } },
} satisfies Meta<typeof GridActions>;
export default meta;

type Story = StoryObj<typeof meta>;

/** With no selection: only the actions whose `when` is the default `['none']` (create, export, reload). */
export const NichtsAusgewaehlt: Story = { name: 'Nichts ausgewählt' };
/** One row selected: adds the single-row actions such as edit and duplicate. */
export const EineZeile: Story = { args: { selectedIds: [1] } };
/** Several rows selected: edit disappears, bulk actions such as delete and duplicate remain. */
export const MehrereZeilen: Story = { args: { selectedIds: [1, 2, 3] } };
