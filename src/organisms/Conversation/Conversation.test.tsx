import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Conversation, type ConversationLabels, type ConversationProps } from './Conversation';

const labels: ConversationLabels = {
    back: 'Back to the list',
    messages: {
        log: 'Messages with Anna',
        empty: 'No messages yet.',
        deleted: 'Deleted',
        replyPreviewDeleted: 'Original deleted',
        reply: 'Reply',
        delete: 'Delete message',
        loadOlder: 'Load older',
    },
    composer: {
        message: 'Write a message',
        placeholder: 'Type here',
        send: 'Send message',
        attach: 'Attach a file',
        removeFile: (name) => `Remove ${name}`,
        replyingTo: (name) => `Replying to ${name}`,
        cancelReply: 'Cancel reply',
        fileTooLarge: (name) => `${name} is too large`,
        tooManyFiles: (max) => `At most ${max} files`,
    },
};

const messages: ConversationProps['messages'] = [
    { id: 1, authorName: 'Anna', body: 'Hello there', sentAt: '2026-06-13T10:00:00Z' },
    { id: 2, authorName: 'Me', own: true, body: 'Hi Anna', sentAt: '2026-06-13T10:01:00Z' },
];

function setup(props: Partial<ConversationProps> = {}) {
    const onSend = vi.fn();
    render(
        <Conversation
            title="Anna"
            subtitle="Maths 9b"
            messages={messages}
            labels={labels}
            onSend={onSend}
            {...props}
        />,
    );
    return { onSend };
}

const field = () => screen.getByRole('textbox', { name: 'Write a message' });

describe('Conversation', () => {
    it('is a region named by its heading, with the subtitle', () => {
        setup();
        expect(screen.getByRole('region', { name: 'Anna' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Anna' })).toBeInTheDocument();
        expect(screen.getByText('Maths 9b')).toBeInTheDocument();
    });

    it('shows the messages in a log and a composer', () => {
        setup();
        const log = screen.getByRole('log', { name: 'Messages with Anna' });
        expect(within(log).getByText('Hello there')).toBeInTheDocument();
        expect(within(log).getByText('Hi Anna')).toBeInTheDocument();
        expect(field()).toBeInTheDocument();
    });

    it('shows the empty text when there are no messages', () => {
        setup({ messages: [] });
        expect(screen.getByText('No messages yet.')).toBeInTheDocument();
    });

    it('sends what is typed, through onSend, with no reply target', async () => {
        const { onSend } = setup();
        await userEvent.type(field(), 'On my way{Enter}');
        expect(onSend).toHaveBeenCalledExactlyOnceWith('On my way', [], { replyTo: null });
    });

    it('shows a send error under the composer', () => {
        setup({ sendError: 'Too long.' });
        expect(screen.getByRole('alert')).toHaveTextContent('Too long.');
    });

    it('renders header actions', () => {
        setup({ actions: <button type="button">Archive</button> });
        expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument();
    });

    it('shows a status notice above the messages', () => {
        setup({ notice: 'Read-only view.' });
        expect(screen.getByRole('status')).toHaveTextContent('Read-only view.');
    });

    describe('back button', () => {
        it('is there, and calls onBack, when onBack is given', async () => {
            const onBack = vi.fn();
            setup({ onBack });
            const back = screen.getByRole('button', { name: 'Back to the list' });
            expect(back.className).toContain('md:hidden');
            await userEvent.click(back);
            expect(onBack).toHaveBeenCalledTimes(1);
        });

        it('is absent without onBack', () => {
            setup();
            expect(screen.queryByRole('button', { name: 'Back to the list' })).toBeNull();
        });
    });

    describe('read-only and locked', () => {
        it('has no composer when read-only', () => {
            setup({ readOnly: true });
            expect(screen.queryByRole('textbox')).toBeNull();
            expect(screen.getByRole('log')).toBeInTheDocument();
        });

        it('replaces the composer with an alert when locked', () => {
            setup({ lockedNotice: 'This conversation is closed.' });
            expect(screen.getByRole('alert')).toHaveTextContent('This conversation is closed.');
            expect(screen.queryByRole('textbox')).toBeNull();
        });

        it('offers no reply buttons when it cannot be written to', () => {
            setup({ replies: true, readOnly: true });
            expect(screen.queryByRole('button', { name: 'Reply' })).toBeNull();
        });
    });

    describe('replying', () => {
        it('has no reply buttons unless replies are on', () => {
            setup();
            expect(screen.queryByRole('button', { name: 'Reply' })).toBeNull();
        });

        it('answers a message: shows who in the composer and sends the target', async () => {
            const { onSend } = setup({ replies: true });
            await userEvent.click(screen.getAllByRole('button', { name: 'Reply' })[0]!);
            expect(screen.getByText('Replying to Anna')).toBeInTheDocument();
            expect(field()).toHaveFocus();

            await userEvent.type(field(), 'Thanks{Enter}');
            expect(onSend).toHaveBeenCalledExactlyOnceWith('Thanks', [], {
                replyTo: { id: 1, name: 'Anna' },
            });
            await waitFor(() => expect(screen.queryByText('Replying to Anna')).toBeNull());
        });

        it('can cancel the reply', async () => {
            setup({ replies: true });
            await userEvent.click(screen.getAllByRole('button', { name: 'Reply' })[0]!);
            await userEvent.click(screen.getByRole('button', { name: 'Cancel reply' }));
            expect(screen.queryByText('Replying to Anna')).toBeNull();
        });
    });

    it('passes delete rules through to the list', async () => {
        const onDelete = vi.fn();
        setup({ onDelete, canDelete: (m) => m.own === true });
        const buttons = screen.getAllByRole('button', { name: 'Delete message' });
        expect(buttons).toHaveLength(1);
        await userEvent.click(buttons[0]!);
        expect(onDelete).toHaveBeenCalledExactlyOnceWith(messages[1]);
    });

    it('passes loading of older messages through to the list', async () => {
        const onLoadOlder = vi.fn();
        setup({ onLoadOlder, hasOlder: true });
        await userEvent.click(screen.getByRole('button', { name: 'Load older' }));
        expect(onLoadOlder).toHaveBeenCalledTimes(1);
    });

    it('can hide attachments in the composer', () => {
        setup({ allowAttachments: false });
        expect(screen.queryByRole('button', { name: 'Attach a file' })).toBeNull();
    });

    it('keeps the draft when the same conversation re-renders, and drops it under a new key', async () => {
        const props = { title: 'Anna', messages, labels, onSend: vi.fn() };
        const { rerender } = render(<Conversation key="a" {...props} />);
        await userEvent.type(field(), 'unsent');
        rerender(<Conversation key="a" {...props} subtitle="changed" />);
        expect(field()).toHaveValue('unsent');
        rerender(<Conversation key="b" {...props} />);
        expect(field()).toHaveValue('');
    });
});
