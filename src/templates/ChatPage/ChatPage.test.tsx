import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Conversation } from '../../organisms/Conversation';
import { ThreadList, type ThreadListItem } from '../../organisms/ThreadList';
import { ChatPage, type ChatPageLabels } from './ChatPage';

const labels: ChatPageLabels = {
    threadList: 'Conversation list',
    resize: 'Resize the list',
    noConversationTitle: 'No conversation open',
    noConversationDescription: 'Pick one on the left.',
};

const threadLabels = { list: 'Conversations', empty: 'None yet.', unread: 'Unread' };
const conversationLabels = {
    messages: {
        log: 'Messages',
        empty: 'No messages yet.',
        deleted: 'Deleted',
        replyPreviewDeleted: 'Gone',
        reply: 'Reply',
        delete: 'Delete',
    },
    composer: {
        message: 'Write a message',
        placeholder: 'Type here',
        send: 'Send',
        attach: 'Attach',
        removeFile: (n: string) => `Remove ${n}`,
        replyingTo: (n: string) => `Replying to ${n}`,
        cancelReply: 'Cancel reply',
        fileTooLarge: (n: string) => n,
        tooManyFiles: (n: number) => String(n),
    },
    back: 'Back',
};

const THREADS: ThreadListItem[] = [
    { id: 'a', title: 'Anna', unread: true },
    { id: 'b', title: 'Ben' },
];

/** The app-side wiring the template leaves out: which thread is open, and its messages. */
function Wired({ initial = null as string | null, onSend = vi.fn() }) {
    const [openId, setOpenId] = useState<string | null>(initial);
    const [sent, setSent] = useState<Record<string, string[]>>({});
    const active = THREADS.find((t) => t.id === openId);
    return (
        <ChatPage
            labels={labels}
            threadListHeader={<h2>Inbox</h2>}
            threadListFooter={<button type="button">Settings</button>}
            threadList={
                <ThreadList
                    threads={THREADS}
                    labels={threadLabels}
                    activeId={openId}
                    onOpen={(id) => setOpenId(String(id))}
                />
            }
            conversation={
                active ? (
                    <Conversation
                        key={active.id}
                        title={active.title}
                        messages={(sent[String(active.id)] ?? []).map((body, i) => ({
                            id: i,
                            authorName: 'Me',
                            own: true,
                            body,
                            sentAt: '2026-06-13T10:00:00Z',
                        }))}
                        labels={conversationLabels}
                        onBack={() => setOpenId(null)}
                        onSend={(body) => {
                            onSend(body);
                            setSent((s) => ({
                                ...s,
                                [String(active.id)]: [...(s[String(active.id)] ?? []), body],
                            }));
                        }}
                    />
                ) : null
            }
        />
    );
}

describe('ChatPage', () => {
    it('shows the thread list in a named side panel', () => {
        render(<Wired />);
        const panel = screen.getByRole('complementary', { name: 'Conversation list' });
        expect(within(panel).getByRole('list', { name: 'Conversations' })).toBeInTheDocument();
        expect(within(panel).getByText('Inbox')).toBeInTheDocument();
        expect(within(panel).getByRole('button', { name: 'Settings' })).toBeInTheDocument();
    });

    it('shows the empty state, with its text from props, while no conversation is open', () => {
        render(<Wired />);
        const main = screen.getByRole('main');
        expect(within(main).getByText('No conversation open')).toBeInTheDocument();
        expect(within(main).getByText('Pick one on the left.')).toBeInTheDocument();
        expect(screen.queryByRole('textbox')).toBeNull();
    });

    it('leaves the description out of the empty state when there is none', () => {
        render(
            <ChatPage
                labels={{ ...labels, noConversationDescription: undefined }}
                threadList={null}
            />,
        );
        expect(screen.getByText('No conversation open')).toBeInTheDocument();
        expect(screen.queryByText('Pick one on the left.')).toBeNull();
    });

    it('shows a next step in the empty state', () => {
        render(
            <ChatPage
                labels={labels}
                threadList={null}
                emptyAction={<button type="button">Start one</button>}
            />,
        );
        expect(screen.getByRole('button', { name: 'Start one' })).toBeInTheDocument();
    });

    it('opens the chosen thread in the main area and hides the empty state', async () => {
        render(<Wired />);
        await userEvent.click(screen.getByRole('button', { name: /Ben/ }));
        const main = screen.getByRole('main');
        expect(within(main).getByRole('heading', { name: 'Ben' })).toBeInTheDocument();
        expect(within(main).queryByText('No conversation open')).toBeNull();
        expect(screen.getByRole('button', { name: /Ben/ })).toHaveAttribute('aria-current', 'true');
    });

    it('switches between threads, and each keeps its own draft', async () => {
        render(<Wired />);
        await userEvent.click(screen.getByRole('button', { name: /Anna/ }));
        await userEvent.type(
            screen.getByRole('textbox', { name: 'Write a message' }),
            'half a thought',
        );
        await userEvent.click(screen.getByRole('button', { name: /Ben/ }));
        expect(screen.getByRole('heading', { name: 'Ben' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Write a message' })).toHaveValue('');
    });

    it('sends in the open conversation and shows the message', async () => {
        const onSend = vi.fn();
        render(<Wired initial="a" onSend={onSend} />);
        await userEvent.type(
            screen.getByRole('textbox', { name: 'Write a message' }),
            'Hello Anna{Enter}',
        );
        expect(onSend).toHaveBeenCalledExactlyOnceWith('Hello Anna');
        expect(await within(screen.getByRole('log')).findByText('Hello Anna')).toBeInTheDocument();
    });

    it('returns to the empty state from the back button', async () => {
        render(<Wired initial="a" />);
        await userEvent.click(screen.getByRole('button', { name: 'Back' }));
        expect(screen.getByText('No conversation open')).toBeInTheDocument();
    });

    it('has a keyboard-operable resize handle named from props', async () => {
        render(<Wired />);
        const handle = screen.getByRole('separator', { name: 'Resize the list' });
        const before = Number(handle.getAttribute('aria-valuenow'));
        handle.focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(Number(handle.getAttribute('aria-valuenow'))).toBeGreaterThan(before);
    });

    it('starts at the default width, or the one given', () => {
        const { unmount } = render(<ChatPage labels={labels} threadList={null} />);
        expect(screen.getByRole('complementary')).toHaveStyle({ width: '320px' });
        unmount();
        render(<ChatPage labels={labels} threadList={null} defaultThreadListWidth={400} />);
        expect(screen.getByRole('complementary')).toHaveStyle({ width: '400px' });
    });

    it('on a narrow screen shows the list alone until a conversation opens, then the conversation alone', () => {
        const { rerender } = render(<ChatPage labels={labels} threadList={null} />);
        // No conversation: the list fills the screen and the empty pane is hidden below md.
        expect(screen.getByRole('complementary').className).toContain('max-md:w-full!');
        expect(
            screen.getByText('No conversation open').closest('div[class*="max-md:hidden"]'),
        ).not.toBeNull();

        rerender(<ChatPage labels={labels} threadList={null} conversation={<p>Open</p>} />);
        expect(screen.getByRole('complementary').className).toContain('max-md:hidden');
    });

    it('treats null, undefined and false alike as "nothing open"', () => {
        const { rerender } = render(
            <ChatPage labels={labels} threadList={null} conversation={null} />,
        );
        expect(screen.getByText('No conversation open')).toBeInTheDocument();
        rerender(<ChatPage labels={labels} threadList={null} conversation={false} />);
        expect(screen.getByText('No conversation open')).toBeInTheDocument();
        rerender(<ChatPage labels={labels} threadList={null} conversation={<p>Open</p>} />);
        expect(screen.queryByText('No conversation open')).toBeNull();
    });
});
