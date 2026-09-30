import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../Label';
import { Checkbox } from './Checkbox';

const meta = {
    title: 'Atoms/Checkbox',
    component: Checkbox,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The standard usage: a Label wired to the checkbox by `htmlFor` and `id`. */
export const WithLabel: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <Checkbox id="agb" />
            <Label htmlFor="agb">Ich akzeptiere die Nutzungsbedingungen</Label>
        </div>
    ),
};

/** Checked, disabled and `aria-invalid` (error) states side by side. */
export const States: Story = {
    render: () => (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <Checkbox id="s-on" defaultChecked />
                <Label htmlFor="s-on">Angehakt</Label>
            </div>
            <div className="flex items-center gap-2">
                <Checkbox id="s-off" disabled />
                <Label htmlFor="s-off">Deaktiviert</Label>
            </div>
            <div className="flex items-center gap-2">
                <Checkbox id="s-invalid" aria-invalid />
                <Label htmlFor="s-invalid">Ungültig</Label>
            </div>
        </div>
    ),
};
