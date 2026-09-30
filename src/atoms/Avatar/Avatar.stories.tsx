import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from './Avatar';

const meta = {
    title: 'Atoms/Avatar',
    component: Avatar,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pick `sm`, `default` or `lg` to match the row density. */
export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-3">
            <Avatar size="sm">
                <AvatarFallback>AH</AvatarFallback>
            </Avatar>
            <Avatar>
                <AvatarFallback>MK</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
                <AvatarFallback>JS</AvatarFallback>
            </Avatar>
        </div>
    ),
};

/** Adds a status dot (e.g. online) with `AvatarBadge`. */
export const WithBadge: Story = {
    render: () => (
        <Avatar size="lg">
            <AvatarFallback>LB</AvatarFallback>
            <AvatarBadge />
        </Avatar>
    ),
};

/** Stacks several people compactly, with `AvatarGroupCount` for the overflow. */
export const Group: Story = {
    render: () => (
        <AvatarGroup>
            <Avatar>
                <AvatarFallback>AH</AvatarFallback>
            </Avatar>
            <Avatar>
                <AvatarFallback>MK</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
    ),
};
