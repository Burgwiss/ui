import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ChatComposer, type ChatComposerLabels, type ChatComposerProps } from './ChatComposer';

const labels: ChatComposerLabels = {
    message: 'Write a message',
    placeholder: 'Type here',
    send: 'Send message',
    attach: 'Attach a file',
    removeFile: (name) => `Remove ${name}`,
    replyingTo: (name) => `Replying to ${name}`,
    cancelReply: 'Cancel reply',
    fileTooLarge: (name, max) => `${name} is larger than ${max} MB`,
    tooManyFiles: (max) => `At most ${max} files`,
};

function setup(props: Partial<ChatComposerProps> = {}) {
    const onSend = vi.fn<ChatComposerProps['onSend']>();
    const view = render(<ChatComposer labels={labels} onSend={onSend} {...props} />);
    return {
        onSend,
        ...view,
        field: () =>
            screen.getByRole('textbox', { name: 'Write a message' }) as HTMLTextAreaElement,
        send: () => screen.getByRole('button', { name: 'Send message' }),
        fileInput: () => view.container.querySelector('input[type=file]') as HTMLInputElement,
    };
}

const pdf = (name: string, size = 100) =>
    new File([new Uint8Array(size)], name, { type: 'application/pdf' });

/** A promise the test settles by hand, to observe the pending state. */
function deferred() {
    let resolve!: () => void;
    let reject!: (error: Error) => void;
    const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe('ChatComposer — sending', () => {
    it('sends the text with the send button and clears the field', async () => {
        const { onSend, field, send } = setup();
        await userEvent.type(field(), 'Hallo Anna');
        await userEvent.click(send());
        await waitFor(() => expect(field()).toHaveValue(''));
        expect(onSend).toHaveBeenCalledExactlyOnceWith('Hallo Anna', [], { replyTo: null });
    });

    it('sends on Enter', async () => {
        const { onSend, field } = setup();
        await userEvent.type(field(), 'Hallo{Enter}');
        expect(onSend).toHaveBeenCalledExactlyOnceWith('Hallo', [], { replyTo: null });
    });

    it('starts a new line on Shift+Enter instead of sending', async () => {
        const { onSend, field } = setup();
        await userEvent.type(field(), 'Zeile eins{Shift>}{Enter}{/Shift}Zeile zwei');
        expect(onSend).not.toHaveBeenCalled();
        expect(field()).toHaveValue('Zeile eins\nZeile zwei');
    });

    it('leaves Enter to an input method that is composing', async () => {
        const { onSend, field } = setup();
        await userEvent.type(field(), 'にほん');
        fireEvent.keyDown(field(), { key: 'Enter', isComposing: true });
        expect(onSend).not.toHaveBeenCalled();
    });

    it('sends the text trimmed, and keeps inner line breaks', async () => {
        const { onSend, field } = setup();
        await userEvent.type(field(), '  a{Shift>}{Enter}{/Shift}b  {Enter}');
        expect(onSend.mock.calls[0]?.[0]).toBe('a\nb');
    });

    it('does not send an empty or whitespace-only message', async () => {
        const { onSend, field, send } = setup();
        await userEvent.type(field(), '   {Enter}');
        await userEvent.click(send());
        expect(onSend).not.toHaveBeenCalled();
        expect(send()).toHaveAttribute('aria-disabled', 'true');
    });

    it('can send files with no text', async () => {
        const file = pdf('bericht.pdf');
        const { onSend, fileInput, send } = setup();
        await userEvent.upload(fileInput(), file);
        expect(send()).not.toHaveAttribute('aria-disabled');
        await userEvent.click(send());
        expect(onSend).toHaveBeenCalledExactlyOnceWith('', [file], { replyTo: null });
    });

    it('calls onSent after a successful send, and keeps the cursor in the field', async () => {
        const onSent = vi.fn();
        const { field } = setup({ onSent });
        await userEvent.type(field(), 'Hi{Enter}');
        await waitFor(() => expect(onSent).toHaveBeenCalledTimes(1));
        expect(field()).toHaveFocus();
    });
});

describe('ChatComposer — pending', () => {
    it('shows it is busy and ignores a second send while onSend is pending', async () => {
        const pending = deferred();
        const { onSend, field, send, container } = setup();
        onSend.mockReturnValue(pending.promise);
        await userEvent.type(field(), 'Eins{Enter}');

        expect(container.querySelector('form')).toHaveAttribute('aria-busy', 'true');
        expect(send()).toHaveAttribute('aria-disabled', 'true');
        expect(field()).toHaveAttribute('readonly');
        expect(field()).toHaveFocus();

        await userEvent.click(send());
        fireEvent.keyDown(field(), { key: 'Enter' });
        expect(onSend).toHaveBeenCalledTimes(1);

        await act(async () => pending.resolve());
        expect(container.querySelector('form')).toHaveAttribute('aria-busy', 'false');
        expect(field()).not.toHaveAttribute('readonly');
    });

    it('keeps the draft until the promise resolves, then clears it', async () => {
        const pending = deferred();
        const { onSend, field } = setup();
        onSend.mockReturnValue(pending.promise);
        await userEvent.type(field(), 'Noch da{Enter}');
        expect(field()).toHaveValue('Noch da');
        await act(async () => pending.resolve());
        expect(field()).toHaveValue('');
    });

    it('keeps the draft and the files when onSend rejects, and can be sent again', async () => {
        const pending = deferred();
        const onSent = vi.fn();
        const file = pdf('a.pdf');
        const { onSend, field, fileInput } = setup({ onSent });
        onSend.mockReturnValueOnce(pending.promise);
        await userEvent.upload(fileInput(), file);
        await userEvent.type(field(), 'Bleibt{Enter}');
        await act(async () => pending.reject(new Error('offline')));

        expect(field()).toHaveValue('Bleibt');
        expect(screen.getByText('a.pdf')).toBeInTheDocument();
        expect(onSent).not.toHaveBeenCalled();
        expect(field()).not.toHaveAttribute('readonly');

        await userEvent.type(field(), '{Enter}');
        await waitFor(() => expect(field()).toHaveValue(''));
        expect(onSend).toHaveBeenCalledTimes(2);
    });

    it('does not touch state after it is unmounted mid-send', async () => {
        const pending = deferred();
        const onSent = vi.fn();
        const { onSend, field, unmount } = setup({ onSent });
        onSend.mockReturnValue(pending.promise);
        await userEvent.type(field(), 'x{Enter}');
        unmount();
        await act(async () => pending.resolve());
        expect(onSent).not.toHaveBeenCalled();
    });
});

describe('ChatComposer — errors', () => {
    it('shows a validation error as an alert and marks the field invalid', () => {
        const { field } = setup({ error: 'Too long.' });
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Too long.');
        expect(field()).toHaveAttribute('aria-invalid', 'true');
        expect(field()).toHaveAttribute('aria-describedby', alert.id);
    });

    it('shows an error for the files as well', () => {
        setup({ error: 'Text is wrong.', attachmentsError: 'Files are wrong.' });
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Text is wrong.');
        expect(alert).toHaveTextContent('Files are wrong.');
    });

    it('shows no alert and no invalid mark without an error', () => {
        const { field } = setup();
        expect(screen.queryByRole('alert')).toBeNull();
        expect(field()).not.toHaveAttribute('aria-invalid');
    });
});

describe('ChatComposer — attachments', () => {
    it('shows a chip per chosen file and removes exactly that file', async () => {
        const { fileInput } = setup();
        await userEvent.upload(fileInput(), [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]);
        expect(screen.getAllByRole('listitem')).toHaveLength(3);

        await userEvent.click(screen.getByRole('button', { name: 'Remove b.pdf' }));
        expect(screen.queryByText('b.pdf')).toBeNull();
        expect(screen.getByText('a.pdf')).toBeInTheDocument();
        expect(screen.getByText('c.pdf')).toBeInTheDocument();
    });

    it('opens the file picker from the paperclip', async () => {
        const { fileInput } = setup();
        const click = vi.spyOn(fileInput(), 'click');
        await userEvent.click(screen.getByRole('button', { name: 'Attach a file' }));
        expect(click).toHaveBeenCalledTimes(1);
    });

    it('clears the files after a successful send', async () => {
        const { fileInput, send } = setup();
        await userEvent.upload(fileInput(), pdf('a.pdf'));
        await userEvent.click(send());
        await waitFor(() => expect(screen.queryByText('a.pdf')).toBeNull());
    });

    it('says so when a file is over the size limit, and does not stage it', async () => {
        const { fileInput } = setup({ maxAttachmentMb: 1 });
        await userEvent.upload(fileInput(), pdf('huge.pdf', 2 * 1024 * 1024));
        expect(screen.getByRole('alert')).toHaveTextContent('huge.pdf is larger than 1 MB');
        expect(screen.queryByRole('listitem')).toBeNull();
    });

    it('stops at the file limit, says so, and disables the paperclip', async () => {
        const { fileInput } = setup({ maxAttachments: 2 });
        await userEvent.upload(fileInput(), [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]);
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.queryByText('c.pdf')).toBeNull();
        expect(screen.getByRole('alert')).toHaveTextContent('At most 2 files');
        expect(screen.getByRole('button', { name: 'Attach a file' })).toBeDisabled();
    });

    it('can choose a file again after removing it', async () => {
        const file = pdf('again.pdf');
        const { fileInput } = setup();
        await userEvent.upload(fileInput(), file);
        await userEvent.click(screen.getByRole('button', { name: 'Remove again.pdf' }));
        await userEvent.upload(fileInput(), file);
        expect(screen.getByText('again.pdf')).toBeInTheDocument();
    });

    it('has no paperclip when attachments are off', () => {
        setup({ allowAttachments: false });
        expect(screen.queryByRole('button', { name: 'Attach a file' })).toBeNull();
    });

    it('limits the picker to the accepted types', () => {
        const { fileInput } = setup({ acceptedMimes: ['image/png', 'application/pdf'] });
        expect(fileInput()).toHaveAttribute('accept', 'image/png,application/pdf');
    });
});

describe('ChatComposer — replying', () => {
    const target = { id: 7, name: 'Anna' };

    it('shows who is being answered, focuses the field, and passes the target to onSend', async () => {
        const { onSend, field } = setup({ replyTo: target });
        expect(screen.getByText('Replying to Anna')).toBeInTheDocument();
        expect(field()).toHaveFocus();
        await userEvent.type(field(), 'Ja{Enter}');
        expect(onSend).toHaveBeenCalledExactlyOnceWith('Ja', [], { replyTo: target });
    });

    it('cancels the reply from the chip', async () => {
        const onClearReply = vi.fn();
        setup({ replyTo: target, onClearReply });
        await userEvent.click(screen.getByRole('button', { name: 'Cancel reply' }));
        expect(onClearReply).toHaveBeenCalledTimes(1);
    });

    it('asks the parent to clear the reply after a send', async () => {
        const onClearReply = vi.fn();
        const { field } = setup({ replyTo: target, onClearReply });
        await userEvent.type(field(), 'Ja{Enter}');
        await waitFor(() => expect(onClearReply).toHaveBeenCalledTimes(1));
    });
});

describe('ChatComposer — disabled', () => {
    it('cannot be typed into or sent', () => {
        const { field, send } = setup({ disabled: true });
        expect(field()).toBeDisabled();
        expect(send()).toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByRole('button', { name: 'Attach a file' })).toBeDisabled();
    });
});

describe('ChatComposer — accessibility', () => {
    it('names the field with a visible-to-screen-readers label and shows the placeholder', () => {
        const { field } = setup();
        expect(field()).toHaveAttribute('placeholder', 'Type here');
    });

    it('names the icon-only send button, and gives each file its own uniquely named remove button', async () => {
        const { fileInput } = setup();
        await userEvent.upload(fileInput(), [pdf('a.pdf'), pdf('b.pdf')]);
        expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove a.pdf' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove b.pdf' })).toBeInTheDocument();
    });
});
