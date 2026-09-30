import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';
import { Label } from '../../atoms/Label';

const meta = {
    title: 'Atoms/Input',
    component: Input,
    tags: ['autodocs'],
    args: { placeholder: 'you@example.com', type: 'email' },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Try any input `type` and `placeholder` from the controls panel. */
export const Playground: Story = {
    decorators: [
        (Story) => (
            <div className="w-72">
                <Story />
            </div>
        ),
    ],
};

/** The standard usage: a Label wired to the input by `htmlFor` and `id`. */
export const WithLabel: Story = {
    render: () => (
        <div className="flex w-72 flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
        </div>
    ),
};

/** Default, disabled and `aria-invalid` (error) side by side. */
export const States: Story = {
    render: () => (
        <div className="flex w-72 flex-col gap-3">
            <Input placeholder="Default" />
            <Input placeholder="Disabled" disabled />
            <Input placeholder="Invalid" aria-invalid defaultValue="not-an-email" />
        </div>
    ),
};
