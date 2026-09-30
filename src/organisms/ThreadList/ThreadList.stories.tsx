import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { exampleThreadsDe, formatDateTimeDe, threadListLabelsDe } from '../../lib/chat.fixtures';
import { ThreadList } from './ThreadList';

const meta = {
    title: 'Organisms/ThreadList',
    component: ThreadList,
    tags: ['autodocs'],
    args: {
        threads: exampleThreadsDe,
        labels: threadListLabelsDe,
        formatTime: formatDateTimeDe,
    },
    decorators: [
        (Story) => (
            <div className="w-80 rounded-lg border border-border bg-card p-2">
                <Story />
            </div>
        ),
    ],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof ThreadList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start here: the plain list with a mix of read and unread threads. */
export const Playground: Story = {};

/** Master-detail selection: `activeId` marks the open thread and `onOpen` reports the chosen one. */
export const Auswaehlbar: Story = {
    render: (args) => {
        const [activeId, setActiveId] = useState<string | number | null>('yilmaz');
        return <ThreadList {...args} activeId={activeId} onOpen={setActiveId} />;
    },
};

/** Routed lists: give rows an `href` (and `as` for your router's `Link`) so each is a real link. */
export const AlsLinks: Story = {
    args: { threads: exampleThreadsDe.map((thread) => ({ ...thread, href: `#/${thread.id}` })) },
};

/** No conversations yet: shows the `labels.empty` text instead of a list. */
export const Leer: Story = { args: { threads: [] } };
