import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pencil, Trash2 } from 'lucide-react';

import { IconButton } from './IconButton';

/**
 * IconButton — the canonical icon-only button. A required `label` becomes both the
 * `aria-label` and the tooltip content, and the hit area grows to the 44px WCAG
 * touch floor on coarse pointers. Never roll your own `<button><Icon/></button>`.
 */
const meta = {
    title: 'Molecules/IconButton',
    component: IconButton,
    args: {
        label: 'Edit',
        icon: <Pencil className="size-4" />,
    },
    parameters: { layout: 'padded' },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <IconButton label="Edit" icon={<Pencil className="size-4" />} />
            <IconButton label="Delete" icon={<Trash2 className="size-4" />} destructive />
        </div>
    ),
};

export const Disabled: Story = {
    args: {
        label: 'Edit',
        icon: <Pencil className="size-4" />,
        disabled: true,
    },
};
