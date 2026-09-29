import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from '../../atoms/Input';
import { Label } from './Label';

const meta = {
    title: 'Atoms/Label',
    component: Label,
    tags: ['autodocs'],
    args: { children: 'Display name' },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WiredToControl: Story = {
    render: () => (
        <div className="flex w-72 flex-col gap-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" placeholder="Jane Doe" />
        </div>
    ),
};
