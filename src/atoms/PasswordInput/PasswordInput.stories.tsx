import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../Label';
import { PasswordInput } from './PasswordInput';

const meta = {
    title: 'Atoms/PasswordInput',
    component: PasswordInput,
    tags: ['autodocs'],
    args: { labels: { show: 'Passwort anzeigen', hide: 'Passwort verbergen' } },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The standard usage: a Label plus `autoComplete="new-password"`; click the eye to reveal the text. */
export const WithLabel: Story = {
    render: (args) => (
        <div className="flex w-72 flex-col gap-1.5">
            <Label htmlFor="passwort">Passwort</Label>
            <PasswordInput
                {...args}
                id="passwort"
                autoComplete="new-password"
                defaultValue="geheim123"
            />
        </div>
    ),
};
