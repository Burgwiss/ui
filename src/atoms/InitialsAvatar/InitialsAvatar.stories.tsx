import type { Meta, StoryObj } from '@storybook/react-vite';

import { InitialsAvatar } from './InitialsAvatar';

const meta = {
    title: 'Atoms/InitialsAvatar',
    component: InitialsAvatar,
    tags: ['autodocs'],
    args: { name: 'Amira Haddad' },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof InitialsAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Try any name; two-word names give first and last initial. */
export const Playground: Story = {};

/** The intended use: `colored` discs beside visible names, so people are told apart at a glance. */
export const InList: Story = {
    render: () => (
        <ul className="flex flex-col gap-2">
            {['Amira Haddad', 'Jonas Schneider', 'Lena Brandt', 'Cher'].map((name) => (
                <li key={name} className="flex items-center gap-3 text-sm">
                    <InitialsAvatar name={name} colored />
                    <span>{name}</span>
                </li>
            ))}
        </ul>
    ),
};

/** Pick `sm` for dense rows, `md` (default) for standard rows, `lg` for headers. */
export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-3">
            <InitialsAvatar name="Amira Haddad" size="sm" />
            <InitialsAvatar name="Amira Haddad" size="md" />
            <InitialsAvatar name="Amira Haddad" size="lg" />
        </div>
    ),
};
