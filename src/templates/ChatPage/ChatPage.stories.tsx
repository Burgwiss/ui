import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../../atoms/Button';
import {
    chatPageLabelsDe,
    conversationLabelsDe,
    exampleMessagesDe,
    exampleThreadsDe,
    formatDateTimeDe,
    formatTimeDe,
    threadListLabelsDe,
} from '../../lib/chat.fixtures';
import { Conversation } from '../../organisms/Conversation';
import type { MessageListItem } from '../../organisms/MessageList';
import { ThreadList, type ThreadListItem } from '../../organisms/ThreadList';
import { ChatPage } from './ChatPage';

const REPLIES: Record<string, string> = {
    berger: 'Perfekt, dann sehen wir uns am Donnerstag.',
    yilmaz: 'Alles klar, danke für die Rückmeldung.',
    sekretariat: 'Wir melden uns, sobald es Neuigkeiten gibt.',
};

const OPENING: Record<string, MessageListItem[]> = {
    berger: exampleMessagesDe,
    yilmaz: [
        {
            id: 1,
            authorName: 'Herr Yılmaz',
            authorBadge: 'Lehrkraft',
            body: 'Die Abgabe des Aufsatzes ist bis Freitag verlängert.',
            sentAt: '2026-09-27T14:12:00Z',
        },
    ],
    sekretariat: [
        {
            id: 1,
            authorName: 'Sekretariat',
            body: 'Deine Teilnahmebescheinigung ist fertig.',
            sentAt: '2026-09-22T10:30:00Z',
        },
    ],
};

/** A clickable prototype: pick a conversation, write, and the message is added. */
function Prototype({ initialOpen }: { initialOpen: string | null }) {
    const [threads, setThreads] = useState<ThreadListItem[]>(exampleThreadsDe);
    const [openId, setOpenId] = useState<string | null>(initialOpen);
    const [messages, setMessages] = useState(OPENING);

    const open = (id: string | number) => {
        setOpenId(String(id));
        // Reading a conversation marks it read.
        setThreads((current) =>
            current.map((thread) => (thread.id === id ? { ...thread, unread: false } : thread)),
        );
    };

    const send = (threadId: string, body: string) => {
        const sentAt = new Date().toISOString();
        setMessages((current) => ({
            ...current,
            [threadId]: [
                ...(current[threadId] ?? []),
                {
                    id: (current[threadId]?.length ?? 0) + 1,
                    authorName: 'Jonas Weber',
                    own: true,
                    body,
                    sentAt,
                },
            ],
        }));
        setThreads((current) =>
            current.map((thread) =>
                thread.id === threadId
                    ? { ...thread, preview: body, lastActivityAt: sentAt }
                    : thread,
            ),
        );
        // The other side answers a moment later.
        setTimeout(() => {
            setMessages((current) => ({
                ...current,
                [threadId]: [
                    ...(current[threadId] ?? []),
                    {
                        id: (current[threadId]?.length ?? 0) + 1,
                        authorName: threads.find((t) => t.id === threadId)?.title ?? '',
                        body: REPLIES[threadId] ?? 'Danke!',
                        sentAt: new Date().toISOString(),
                    },
                ],
            }));
        }, 1200);
    };

    const active = threads.find((thread) => thread.id === openId);

    return (
        <div className="h-[560px] border border-border">
            <ChatPage
                labels={chatPageLabelsDe}
                resizeStorageKey="storybook.chat-page"
                threadListHeader={
                    <div className="flex items-center justify-between gap-2 px-1">
                        <h2 className="text-base font-semibold">Nachrichten</h2>
                        <Button size="icon-sm" variant="ghost" tooltip="Neue Konversation">
                            <Plus aria-hidden="true" />
                        </Button>
                    </div>
                }
                threadList={
                    <ThreadList
                        threads={threads}
                        labels={threadListLabelsDe}
                        activeId={openId}
                        onOpen={open}
                        formatTime={formatDateTimeDe}
                    />
                }
                conversation={
                    active ? (
                        <Conversation
                            key={active.id}
                            title={active.title}
                            subtitle={active.subtitle ?? undefined}
                            messages={messages[String(active.id)] ?? []}
                            labels={conversationLabelsDe}
                            formatTime={formatTimeDe}
                            onBack={() => setOpenId(null)}
                            replies
                            onSend={(body) => send(String(active.id), body)}
                        />
                    ) : null
                }
            />
        </div>
    );
}

const meta = {
    title: 'Templates/ChatPage',
    component: ChatPage,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ChatPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click a conversation, write, and the message is added; an answer follows. */
export const Prototyp: Story = {
    args: { threadList: null, labels: chatPageLabelsDe },
    render: () => <Prototype initialOpen="berger" />,
};

/** No conversation open: the empty state shows on wide screens, only the list on narrow ones. */
export const KeineKonversationGeoeffnet: Story = {
    args: { threadList: null, labels: chatPageLabelsDe },
    render: () => <Prototype initialOpen={null} />,
};

/** An empty list with a call to action (`emptyAction`) that starts the first conversation. */
export const MitAktionImLeerzustand: Story = {
    args: {
        labels: chatPageLabelsDe,
        threadList: <ThreadList threads={[]} labels={threadListLabelsDe} />,
        emptyAction: <Button>Konversation starten</Button>,
    },
    decorators: [
        (Story) => (
            <div className="h-[480px] border border-border">
                <Story />
            </div>
        ),
    ],
};
