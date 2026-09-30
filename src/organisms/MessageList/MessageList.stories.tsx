import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { exampleMessagesDe, formatTimeDe, messageListLabelsDe } from '../../lib/chat.fixtures';
import { MessageList, type MessageListItem } from './MessageList';

const meta = {
    title: 'Organisms/MessageList',
    component: MessageList,
    tags: ['autodocs'],
    args: {
        messages: exampleMessagesDe,
        labels: messageListLabelsDe,
        formatTime: formatTimeDe,
    },
    decorators: [
        (Story) => (
            <div className="flex h-[480px] flex-col border border-border">
                <Story />
            </div>
        ),
    ],
    parameters: { layout: 'padded' },
} satisfies Meta<typeof MessageList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start here: a read-only log with grouped bubbles and your own messages on the right. */
export const Playground: Story = {};

/** Reply and delete buttons: `onReply` shows reply everywhere, `canDelete` limits delete (here to own messages). */
export const MitAktionen: Story = {
    args: {
        onReply: () => {},
        onDelete: () => {},
        canDelete: (message) => message.own === true,
    },
};

/** No messages yet: shows the `labels.empty` text. */
export const Leer: Story = { args: { messages: [] } };

/** Author shown as a pseudonym with the real name in brackets (`authorNote`) and a role badge (`authorBadge`). */
export const MitPseudonym: Story = {
    args: {
        messages: [
            {
                id: 1,
                authorName: 'Mitglied 3',
                authorNote: 'Jonas Weber',
                body: 'Kann jemand die dritte Aufgabe erklären?',
                sentAt: '2026-09-29T08:02:00Z',
            },
            {
                id: 2,
                authorName: 'Frau Berger',
                authorBadge: 'Lehrkraft',
                body: 'Gern, schau dir zuerst das Beispiel auf Seite 12 an.',
                sentAt: '2026-09-29T08:10:00Z',
            },
        ],
    },
};

const OLDER: MessageListItem[] = [
    {
        id: -2,
        authorName: 'Frau Berger',
        authorBadge: 'Lehrkraft',
        body: 'Willkommen in der Konversation.',
        sentAt: '2026-09-28T15:00:00Z',
    },
];

/** Paging back through history: the `loadOlder` button prepends messages without moving what is being read. */
export const MitAelterenNachrichten: Story = {
    render: (args) => {
        const [messages, setMessages] = useState(args.messages);
        const [hasOlder, setHasOlder] = useState(true);
        return (
            <MessageList
                {...args}
                messages={messages}
                hasOlder={hasOlder}
                onLoadOlder={async () => {
                    await new Promise((resolve) => setTimeout(resolve, 400));
                    setMessages((current) => [...OLDER, ...current]);
                    setHasOlder(false);
                }}
            />
        );
    },
};
