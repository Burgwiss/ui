import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inbox } from 'lucide-react';

import { Button } from '../../atoms/Button';
import { EmptyState } from './EmptyState';

const meta = {
    title: 'Molecules/EmptyState',
    component: EmptyState,
    tags: ['autodocs'],
    args: {
        icon: Inbox,
        title: 'Noch keine Nachrichten',
        description: 'Sobald jemand schreibt, siehst du es hier.',
    },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start here: icon, heading and supporting sentence, with no next step. */
export const Playground: Story = {};

/** Pass `action` (a `Button`) when the user can fix the emptiness, e.g. by starting something. */
export const WithAction: Story = {
    args: { action: <Button>Konversation starten</Button> },
};

/** Leave out `description` when the heading says it all, e.g. "all caught up". */
export const TitleOnly: Story = {
    args: { description: undefined },
};
