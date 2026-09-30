import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../Label';
import { Switch } from './Switch';

const meta = {
    title: 'Atoms/Switch',
    component: Switch,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The standard usage: a Label wired to the switch by `htmlFor` and `id`. */
export const WithLabel: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <Switch id="veroeffentlicht" defaultChecked />
            <Label htmlFor="veroeffentlicht">Kurs veröffentlicht</Label>
        </div>
    ),
};

/** A locked setting the user cannot change; explain why next to it. */
export const Disabled: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <Switch id="gesperrt" disabled />
            <Label htmlFor="gesperrt">Nicht änderbar</Label>
        </div>
    ),
};
