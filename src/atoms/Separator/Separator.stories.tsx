import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator } from './Separator';

const meta = {
    title: 'Atoms/Separator',
    component: Separator,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Divides stacked sections; the default orientation. */
export const Horizontal: Story = {
    render: () => (
        <div className="flex w-64 flex-col gap-3">
            <span className="text-sm text-muted-foreground">Section one</span>
            <Separator />
            <span className="text-sm text-muted-foreground">Section two</span>
        </div>
    ),
};

/** Divides items in a row, e.g. inline actions; needs a parent with a height. */
export const Vertical: Story = {
    render: () => (
        <div className="flex h-8 items-center gap-3 text-sm text-muted-foreground">
            <span>Edit</span>
            <Separator orientation="vertical" />
            <span>Duplicate</span>
            <Separator orientation="vertical" />
            <span>Delete</span>
        </div>
    ),
};
