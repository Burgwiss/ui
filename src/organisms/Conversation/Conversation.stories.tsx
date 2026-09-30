import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { conversationLabelsDe, exampleMessagesDe, formatTimeDe } from '../../lib/chat.fixtures';
import type { MessageListItem } from '../MessageList';
import { Conversation } from './Conversation';

const meta = {
    title: 'Organisms/Conversation',
    component: Conversation,
    tags: ['autodocs'],
    args: {
        title: 'Frau Berger',
        subtitle: 'Arabisch für Anfänger',
        messages: exampleMessagesDe,
        labels: conversationLabelsDe,
        formatTime: formatTimeDe,
        onSend: () => {},
    },
    decorators: [
        (Story) => (
            <div className="h-[560px] border border-border">
                <Story />
            </div>
        ),
    ],
    parameters: { layout: 'padded' },
} satisfies Meta<typeof Conversation>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start here: a working chat that appends your sent message, with replies switched on. */
export const Playground: Story = {
    render: (args) => {
        const [messages, setMessages] = useState<MessageListItem[]>(args.messages);
        return (
            <Conversation
                {...args}
                messages={messages}
                replies
                onSend={async (body, attachments, { replyTo }) => {
                    await new Promise((resolve) => setTimeout(resolve, 400));
                    setMessages((current) => [
                        ...current,
                        {
                            id: current.length + 1,
                            authorName: 'Jonas Weber',
                            own: true,
                            body,
                            sentAt: new Date().toISOString(),
                            attachments: attachments.map((file, index) => ({
                                id: `${current.length}-${index}`,
                                name: file.name,
                                sizeBytes: file.size,
                                mime: file.type,
                                downloadUrl: '#',
                            })),
                            replyTo: replyTo ? { id: replyTo.id, authorName: replyTo.name } : null,
                        },
                    ]);
                }}
            />
        );
    },
};

/** Read-only view with a `notice` line, e.g. an admin reading someone else's conversation (no composer). */
export const MitHinweis: Story = {
    args: { notice: 'Du liest diese Konversation als Administratorin.', readOnly: true },
};

/** A closed conversation: `lockedNotice` replaces the composer with an explanation. */
export const Gesperrt: Story = {
    args: {
        lockedNotice: 'Diese Konversation ist geschlossen. Neue Nachrichten sind nicht möglich.',
    },
};

/** A conversation with no messages yet: shows the empty-state text. */
export const Leer: Story = { args: { messages: [] } };

/** Mobile master-detail: `onBack` adds a back arrow (narrow screens only) to return to the thread list. */
export const MitZurueckPfeil: Story = { args: { onBack: () => {} } };

/** A rejected message: `sendError` shows the validation error under the composer. */
export const MitFehler: Story = {
    args: { sendError: 'Die Nachricht darf höchstens 2000 Zeichen lang sein.' },
};
