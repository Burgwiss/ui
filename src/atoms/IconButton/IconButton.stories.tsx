import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pencil, Trash2 } from 'lucide-react';

import { IconButton } from './IconButton';

const meta = {
    title: 'Atoms/IconButton',
    component: IconButton,
    args: {
        label: 'Edit',
        icon: <Pencil className="size-4" />,
    },
    parameters: { layout: 'padded' },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The basic case: an icon plus the `label` that names it and shows as tooltip. */
export const Default: Story = {};

/** Compare the normal and `destructive` (delete-style) hover looks. */
export const Variants: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <IconButton label="Edit" icon={<Pencil className="size-4" />} />
            <IconButton label="Delete" icon={<Trash2 className="size-4" />} destructive />
        </div>
    ),
};

/** A disabled icon button; it is dimmed and not clickable. */
export const Disabled: Story = {
    args: {
        label: 'Edit',
        icon: <Pencil className="size-4" />,
        disabled: true,
    },
};
