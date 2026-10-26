/** The message being answered; passed to `onSend` as `context.replyTo`. */
export interface ReplyTarget {
    /** Identifier of the message being answered; changing it moves focus into the field. */
    id: string | number;
    /** Whose message is being answered. */
    name: string;
}
export interface ChatComposerLabels {
    /** Accessible name of the text field (there is no visible label). */
    message: string;
    /** Placeholder text shown in the empty field. */
    placeholder: string;
    /** Accessible name and tooltip of the round send button (icon only, no visible text). */
    send: string;
    /** Name and tooltip of the paperclip. */
    attach: string;
    /** Name and tooltip of a chosen file's remove button, e.g. `bericht.pdf entfernen`. */
    removeFile: (name: string) => string;
    /** Text of the reply chip, e.g. `Antwort an Anna`. */
    replyingTo: (name: string) => string;
    /** Name and tooltip of the reply chip's close button. */
    cancelReply: string;
    /** Shown when a picked file is over the size limit. */
    fileTooLarge: (name: string, maxSizeMb: number) => string;
    /** Shown when a picked file would go past the file limit. */
    tooManyFiles: (maxFiles: number) => string;
}
export interface ChatComposerProps {
    /**
     * Send what was written. While the returned promise is pending the
     * composer shows it is busy and ignores further sends; when it resolves
     * the draft and the files are cleared. If it rejects the draft stays, so
     * nothing is lost — show why through `error`.
     */
    onSend: (body: string, attachments: File[], context: {
        replyTo: ReplyTarget | null;
    }) => Promise<void> | void;
    /** All visible text and accessible names of the composer, in the app's language (required). */
    labels: ChatComposerLabels;
    /** A validation error for the message text, shown under the field. */
    error?: string;
    /** A validation error for the files, shown under the field. */
    attachmentsError?: string;
    /** Shows a chip and passes `replyTo` to `onSend`. The parent owns it. */
    replyTo?: ReplyTarget | null;
    /** Called when the reply chip is dismissed and after a successful send, so the parent can reset `replyTo`. */
    onClearReply?: () => void;
    /** After a successful send. */
    onSent?: () => void;
    /** Turns file attachments off. */
    allowAttachments?: boolean;
    /** Disables the field, the paperclip and the send button, e.g. when the thread is closed. Default false. */
    disabled?: boolean;
    /** Allowed MIME types of the file picker. Default: documents and images. */
    acceptedMimes?: readonly string[];
    /** Largest file, in MB. Default 25. */
    maxAttachmentMb?: number;
    /** Most files per message. Default 5. */
    maxAttachments?: number;
    /** Extra classes on the `<form>` root. */
    className?: string;
}
/**
 * A plain-text chat composer: a text field that grows with what is written,
 * Enter to send and Shift+Enter for a new line, a paperclip with the chosen
 * files as removable chips, and a round send button.
 *
 * It keeps the draft itself. Focus stays in the field after a send (and moves
 * into it when a reply target is set), so a conversation can be typed straight
 * through. Enter during an IME composition (Japanese, Chinese, Korean) is left
 * to the IME.
 *
 * Use it to write into a thread or conversation; for the messages above it
 * see `MessageList` or `Conversation`. Every string comes in through `labels`.
 *
 * @summary Plain-text chat input with Enter-to-send, file chips and an optional reply chip.
 */
export declare function ChatComposer({ onSend, labels, error, attachmentsError, replyTo, onClearReply, onSent, allowAttachments, disabled, acceptedMimes, maxAttachmentMb, maxAttachments, className, }: ChatComposerProps): import("react").JSX.Element;
