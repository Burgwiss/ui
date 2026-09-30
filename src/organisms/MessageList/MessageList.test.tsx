import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AttachmentListItem } from '../../molecules/AttachmentList';
import { MessageList, type MessageListItem, type MessageListLabels } from './MessageList';

const labels: MessageListLabels = {
    log: 'Messages',
    empty: 'Nothing here yet.',
    deleted: 'This message was deleted.',
    replyPreviewDeleted: 'Original deleted',
    reply: 'Reply',
    delete: 'Delete message',
    loadOlder: 'Load older messages',
    attachments: {
        empty: 'No files',
        download: (name) => `Download ${name}`,
        downloadShort: 'Download',
        remove: (name) => `Remove ${name}`,
        scan: { pending: 'Scanning', clean: 'Clean', infected: 'Infected', error: 'Error' },
    },
};

const message = (over: Partial<MessageListItem> = {}): MessageListItem => ({
    id: 1,
    authorName: 'Ms Smith',
    body: 'plain hello',
    sentAt: '2026-06-13T10:00:00Z',
    ...over,
});

const attachment = (over: Partial<AttachmentListItem> = {}): AttachmentListItem => ({
    id: 1,
    name: 'paper.pdf',
    sizeBytes: 2048,
    mime: 'application/pdf',
    scanStatus: 'clean',
    downloadUrl: '/d/1',
    ...over,
});

const fixedTime = () => '10:00';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('MessageList — content', () => {
    it('is a labelled live log so new messages are announced', () => {
        render(<MessageList messages={[message()]} labels={labels} />);
        const log = screen.getByRole('log', { name: 'Messages' });
        expect(log).toHaveAttribute('aria-live', 'polite');
        expect(log).toHaveAttribute('aria-relevant', 'additions text');
    });

    it('shows the empty text when there are no messages', () => {
        render(<MessageList messages={[]} labels={labels} />);
        expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
        expect(screen.queryByRole('list')).toBeNull();
    });

    it('renders each message, the sender name, and the time from formatTime', () => {
        render(<MessageList messages={[message()]} labels={labels} formatTime={fixedTime} />);
        expect(screen.getByText('Ms Smith')).toBeInTheDocument();
        expect(screen.getByText('plain hello')).toBeInTheDocument();
        const time = screen.getByText('10:00');
        expect(time.tagName).toBe('TIME');
        expect(time).toHaveAttribute('datetime', '2026-06-13T10:00:00Z');
    });

    it('falls back to the raw string for a time it cannot parse', () => {
        render(<MessageList messages={[message({ sentAt: 'gestern' })]} labels={labels} />);
        expect(screen.getByText('gestern')).toBeInTheDocument();
    });

    it('renders a plain-text body, never parsed as HTML', () => {
        render(
            <MessageList messages={[message({ body: '<b>x</b> a < b & c' })]} labels={labels} />,
        );
        expect(screen.getByText(/<b>x<\/b> a < b & c/)).toBeInTheDocument();
        expect(document.querySelector('b')).toBeNull();
    });

    it('keeps line breaks in the body and breaks long unbroken words', () => {
        const url = 'https://example.com/' + 'a'.repeat(120);
        render(<MessageList messages={[message({ body: url })]} labels={labels} />);
        const body = screen.getByText(url, { exact: false });
        expect(body.className).toContain('whitespace-pre-wrap');
        expect(body.className).toContain('break-words');
        expect(body.className).toContain('[overflow-wrap:anywhere]');
    });

    it('shows a role badge and a note next to the name, but not a note equal to the name', () => {
        render(
            <MessageList
                messages={[
                    message({ id: 1, authorBadge: 'Teacher', authorNote: 'Real Name' }),
                    message({ id: 2, authorName: 'Same', authorNote: 'Same' }),
                ]}
                labels={labels}
            />,
        );
        expect(screen.getByText('Teacher')).toBeInTheDocument();
        expect(screen.getByText('(Real Name)')).toBeInTheDocument();
        expect(screen.queryByText('(Same)')).toBeNull();
    });

    it('shows a tombstone for a deleted message instead of its body, files and actions', () => {
        render(
            <MessageList
                messages={[message({ deleted: true, body: 'secret', attachments: [attachment()] })]}
                labels={labels}
                onReply={vi.fn()}
            />,
        );
        expect(screen.getByText('This message was deleted.')).toBeInTheDocument();
        expect(screen.queryByText('secret')).toBeNull();
        expect(screen.queryByText('paper.pdf')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Reply' })).toBeNull();
    });

    it('quotes the message being answered, or says the original is gone', () => {
        render(
            <MessageList
                messages={[
                    message({
                        id: 1,
                        replyTo: { id: 9, authorName: 'Anna', preview: 'earlier text' },
                    }),
                    message({ id: 2, replyTo: { id: 8, deleted: true } }),
                ]}
                labels={labels}
            />,
        );
        expect(screen.getByText('Anna')).toBeInTheDocument();
        expect(screen.getByText(/: earlier text/)).toBeInTheDocument();
        expect(screen.getByText('Original deleted')).toBeInTheDocument();
    });
});

describe('MessageList — own versus other', () => {
    const renderPair = () =>
        render(
            <MessageList
                messages={[
                    message({ id: 1, authorName: 'Other Person', body: 'from them' }),
                    message({ id: 2, authorName: 'Me', own: true, body: 'from me' }),
                ]}
                labels={labels}
            />,
        );

    it('puts own messages on the right in the primary colour, and others on the left in muted', () => {
        renderPair();
        const [theirs, mine] = screen.getAllByRole('listitem');
        expect(mine).toHaveClass('flex-row-reverse');
        expect(mine).toHaveAttribute('data-own', 'true');
        expect(within(mine!).getByText('from me').closest('div')).toHaveClass(
            'bg-primary',
            'text-primary-foreground',
        );
        expect(theirs).toHaveClass('flex-row');
        expect(theirs).not.toHaveAttribute('data-own');
        expect(within(theirs!).getByText('from them').closest('div')).toHaveClass('bg-muted');
    });

    it('shows a name and avatar for others only, never for the reader', () => {
        renderPair();
        expect(screen.getByText('Other Person')).toBeInTheDocument();
        expect(screen.queryByText('Me')).toBeNull();
        expect(screen.getAllByTestId('initials-avatar')).toHaveLength(1);
    });
});

describe('MessageList — grouping', () => {
    const at = (minute: number) => `2026-06-13T10:${String(minute).padStart(2, '0')}:00Z`;

    it('shows the name and avatar once for consecutive messages from one sender', () => {
        render(
            <MessageList
                messages={[
                    message({ id: 1, sentAt: at(0), body: 'one' }),
                    message({ id: 2, sentAt: at(1), body: 'two' }),
                    message({ id: 3, sentAt: at(2), body: 'three' }),
                ]}
                labels={labels}
            />,
        );
        expect(screen.getAllByText('Ms Smith')).toHaveLength(1);
        expect(screen.getAllByTestId('initials-avatar')).toHaveLength(1);
    });

    it('starts a new group when the sender changes', () => {
        render(
            <MessageList
                messages={[
                    message({ id: 1, authorName: 'A', sentAt: at(0) }),
                    message({ id: 2, authorName: 'B', sentAt: at(1) }),
                    message({ id: 3, authorName: 'A', sentAt: at(2) }),
                ]}
                labels={labels}
            />,
        );
        expect(screen.getAllByTestId('initials-avatar')).toHaveLength(3);
    });

    it('starts a new group after a gap of more than five minutes, but not at exactly five', () => {
        render(
            <MessageList
                messages={[
                    message({ id: 1, sentAt: at(0) }),
                    message({ id: 2, sentAt: at(5) }),
                    message({ id: 3, sentAt: at(11) }),
                ]}
                labels={labels}
            />,
        );
        // 0 → 5 min: same group. 5 → 11 min: new group.
        expect(screen.getAllByTestId('initials-avatar')).toHaveLength(2);
    });

    it('tells two senders with the same name apart by authorId', () => {
        render(
            <MessageList
                messages={[
                    message({ id: 1, authorId: 'u1', sentAt: at(0) }),
                    message({ id: 2, authorId: 'u2', sentAt: at(1) }),
                ]}
                labels={labels}
            />,
        );
        expect(screen.getAllByTestId('initials-avatar')).toHaveLength(2);
    });

    it('tells senders with the same name apart by badge when there is no id', () => {
        render(
            <MessageList
                messages={[
                    message({ id: 1, authorBadge: 'Teacher', sentAt: at(0) }),
                    message({ id: 2, authorBadge: null, sentAt: at(1) }),
                ]}
                labels={labels}
            />,
        );
        expect(screen.getAllByTestId('initials-avatar')).toHaveLength(2);
    });
});

describe('MessageList — attachments', () => {
    it('shows files under the text', () => {
        render(
            <MessageList messages={[message({ attachments: [attachment()] })]} labels={labels} />,
        );
        expect(screen.getByText('paper.pdf')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Download paper.pdf' })).toHaveAttribute(
            'href',
            '/d/1',
        );
    });

    it('gives a files-only message its own time line', () => {
        render(
            <MessageList
                messages={[message({ body: null, attachments: [attachment()] })]}
                labels={labels}
                formatTime={fixedTime}
            />,
        );
        expect(screen.getByText('10:00')).toHaveClass('block');
    });

    it('constrains the bubble and the file block so a long file name cannot burst it', () => {
        const long = 'a-ridiculously-long-attachment-filename-that-would-bust-the-bubble-width.pdf';
        render(
            <MessageList
                messages={[message({ body: null, attachments: [attachment({ name: long })] })]}
                labels={labels}
            />,
        );
        const column = document.querySelector('.max-w-\\[88\\%\\]') as HTMLElement;
        expect(column.className).toContain('min-w-0');
        expect(column.className).toContain('sm:max-w-[78%]');
        const block = column.querySelector('.mt-2') as HTMLElement;
        expect(block.className).toContain('min-w-0');
        expect(block.className).toContain('max-w-full');
        expect(screen.getByText(long).className).toContain('truncate');
    });

    it('does not render files when no attachment labels are given', () => {
        render(
            <MessageList
                messages={[message({ attachments: [attachment()] })]}
                labels={{ ...labels, attachments: undefined }}
            />,
        );
        expect(screen.queryByText('paper.pdf')).toBeNull();
    });
});

describe('MessageList — actions', () => {
    it('has no action buttons by default', () => {
        render(<MessageList messages={[message()]} labels={labels} />);
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('offers reply when onReply is given, and passes the message', async () => {
        const onReply = vi.fn();
        const m = message({ id: 42 });
        render(<MessageList messages={[m]} labels={labels} onReply={onReply} />);
        await userEvent.click(screen.getByRole('button', { name: 'Reply' }));
        expect(onReply).toHaveBeenCalledExactlyOnceWith(m);
    });

    it('offers delete only where canDelete allows, and passes the message', async () => {
        const onDelete = vi.fn();
        const mine = message({ id: 1, own: true, body: 'mine' });
        const theirs = message({ id: 2, body: 'theirs' });
        render(
            <MessageList
                messages={[mine, theirs]}
                labels={labels}
                onDelete={onDelete}
                canDelete={(m) => m.own === true}
            />,
        );
        const buttons = screen.getAllByRole('button', { name: 'Delete message' });
        expect(buttons).toHaveLength(1);
        await userEvent.click(buttons[0]!);
        expect(onDelete).toHaveBeenCalledExactlyOnceWith(mine);
    });

    it('offers no delete without canDelete, or without onDelete', () => {
        const { rerender } = render(
            <MessageList messages={[message()]} labels={labels} onDelete={vi.fn()} />,
        );
        expect(screen.queryByRole('button', { name: 'Delete message' })).toBeNull();
        rerender(<MessageList messages={[message()]} labels={labels} canDelete />);
        expect(screen.queryByRole('button', { name: 'Delete message' })).toBeNull();
        rerender(
            <MessageList messages={[message()]} labels={labels} onDelete={vi.fn()} canDelete />,
        );
        expect(screen.getByRole('button', { name: 'Delete message' })).toBeInTheDocument();
    });

    it('keeps the actions reachable on touch and on keyboard focus, not only on hover', () => {
        render(<MessageList messages={[message()]} labels={labels} onReply={vi.fn()} />);
        const wrapper = screen.getByRole('button', { name: 'Reply' }).parentElement!;
        expect(wrapper.className).toContain('pointer-coarse:opacity-100');
        expect(wrapper.className).toContain('focus-within:opacity-100');
    });
});

describe('MessageList — scrolling', () => {
    /** jsdom has no layout: give the log a scroll height and record scrollTop. */
    function stubScroll(height: number) {
        const state = { height, top: 0 };
        vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(
            () => state.height,
        );
        vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400);
        vi.spyOn(HTMLElement.prototype, 'scrollTop', 'get').mockImplementation(() => state.top);
        vi.spyOn(HTMLElement.prototype, 'scrollTop', 'set').mockImplementation((value: number) => {
            state.top = value;
        });
        return state;
    }

    it('starts at the bottom', () => {
        const state = stubScroll(2000);
        render(<MessageList messages={[message()]} labels={labels} />);
        expect(state.top).toBe(2000);
    });

    it('follows a new message when the reader is at the bottom', () => {
        const state = stubScroll(2000);
        const { rerender } = render(
            <MessageList messages={[message({ id: 1 })]} labels={labels} />,
        );
        state.height = 2100;
        rerender(
            <MessageList messages={[message({ id: 1 }), message({ id: 2 })]} labels={labels} />,
        );
        expect(state.top).toBe(2100);
    });

    it('does not yank a reader who scrolled up when someone else writes', () => {
        const state = stubScroll(2000);
        const { rerender } = render(
            <MessageList messages={[message({ id: 1 })]} labels={labels} />,
        );
        // Scrolled to the top: 2000 - 0 - 400 is far from the bottom.
        state.top = 0;
        fireEvent.scroll(screen.getByRole('log'));
        state.height = 2100;
        rerender(
            <MessageList messages={[message({ id: 1 }), message({ id: 2 })]} labels={labels} />,
        );
        expect(state.top).toBe(0);
    });

    it("does follow the reader's own message, even from far up", () => {
        const state = stubScroll(2000);
        const { rerender } = render(
            <MessageList messages={[message({ id: 1 })]} labels={labels} />,
        );
        state.top = 0;
        fireEvent.scroll(screen.getByRole('log'));
        state.height = 2100;
        rerender(
            <MessageList
                messages={[message({ id: 1 }), message({ id: 2, own: true })]}
                labels={labels}
            />,
        );
        expect(state.top).toBe(2100);
    });

    it('keeps the reader in place when older messages are added above', () => {
        const state = stubScroll(2000);
        const { rerender } = render(
            <MessageList messages={[message({ id: 5 }), message({ id: 6 })]} labels={labels} />,
        );
        state.top = 100;
        fireEvent.scroll(screen.getByRole('log'));
        state.height = 2600;
        rerender(
            <MessageList
                messages={[
                    message({ id: 3 }),
                    message({ id: 4 }),
                    message({ id: 5 }),
                    message({ id: 6 }),
                ]}
                labels={labels}
            />,
        );
        expect(state.top).toBe(700);
    });
});

describe('MessageList — loading older messages', () => {
    it('shows the button only while there are older messages and a handler', () => {
        const { rerender } = render(
            <MessageList messages={[message()]} labels={labels} onLoadOlder={vi.fn()} />,
        );
        expect(screen.queryByRole('button', { name: 'Load older messages' })).toBeNull();
        rerender(
            <MessageList messages={[message()]} labels={labels} onLoadOlder={vi.fn()} hasOlder />,
        );
        expect(screen.getByRole('button', { name: 'Load older messages' })).toBeInTheDocument();
        rerender(<MessageList messages={[message()]} labels={labels} hasOlder />);
        expect(screen.queryByRole('button', { name: 'Load older messages' })).toBeNull();
    });

    it('is disabled and marks the log busy while loading, then recovers', async () => {
        let finish!: () => void;
        const onLoadOlder = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
        render(
            <MessageList
                messages={[message()]}
                labels={labels}
                onLoadOlder={onLoadOlder}
                hasOlder
            />,
        );
        const button = screen.getByRole('button', { name: 'Load older messages' });
        await userEvent.click(button);
        expect(button).toBeDisabled();
        expect(screen.getByRole('log')).toHaveAttribute('aria-busy', 'true');
        await userEvent.click(button);
        expect(onLoadOlder).toHaveBeenCalledTimes(1);

        await act(async () => finish());
        await waitFor(() => expect(button).toBeEnabled());
        expect(screen.getByRole('log')).toHaveAttribute('aria-busy', 'false');
    });

    it('recovers when loading fails', async () => {
        const onLoadOlder = vi.fn(() => Promise.reject(new Error('offline')));
        render(
            <MessageList
                messages={[message()]}
                labels={labels}
                onLoadOlder={onLoadOlder}
                hasOlder
            />,
        );
        const button = screen.getByRole('button', { name: 'Load older messages' });
        await userEvent.click(button);
        await waitFor(() => expect(button).toBeEnabled());
    });
});
