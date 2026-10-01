import { Paperclip, SendHorizontal, X } from 'lucide-react';
import {
    useEffect,
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
    type KeyboardEvent,
} from 'react';

import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { Textarea } from '../../atoms/Textarea';
import { cn } from '../../lib/cn';
import {
    addFiles,
    MESSAGE_ATTACHMENT_MAX_MB,
    MESSAGE_ATTACHMENT_MIMES,
    MESSAGE_MAX_ATTACHMENTS,
} from '../../lib/messageAttachments';

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
    onSend: (
        body: string,
        attachments: File[],
        context: { replyTo: ReplyTarget | null },
    ) => Promise<void> | void;
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

const MAX_TEXTAREA_PX = 160;

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
export function ChatComposer({
    onSend,
    labels,
    error,
    attachmentsError,
    replyTo = null,
    onClearReply,
    onSent,
    allowAttachments = true,
    disabled = false,
    acceptedMimes = MESSAGE_ATTACHMENT_MIMES,
    maxAttachmentMb = MESSAGE_ATTACHMENT_MAX_MB,
    maxAttachments = MESSAGE_MAX_ATTACHMENTS,
    className,
}: ChatComposerProps) {
    const fieldId = useId();
    const errorId = useId();
    const textRef = useRef<HTMLTextAreaElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const mounted = useRef(true);
    const [body, setBody] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [pending, setPending] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    // Answering a message: put the cursor where the answer goes.
    const replyId = replyTo?.id ?? null;
    useEffect(() => {
        if (replyId !== null) textRef.current?.focus();
    }, [replyId]);

    const resize = () => {
        const el = textRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_PX)}px`;
    };

    const canSend = !disabled && (body.trim() !== '' || files.length > 0);
    const atFileCap = files.length >= maxAttachments;

    const pickFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(event.target.files ?? []);
        // Clear the input so the same file can be chosen again after removing it.
        event.target.value = '';
        if (picked.length === 0) return;
        const result = addFiles(files, picked, {
            maxFiles: maxAttachments,
            maxSizeMb: maxAttachmentMb,
        });
        setFiles(result.files);
        const first = result.rejected[0];
        if (!first) {
            setLocalError(null);
        } else if (first.reason === 'too_large') {
            setLocalError(labels.fileTooLarge(first.file.name, maxAttachmentMb));
        } else {
            setLocalError(labels.tooManyFiles(maxAttachments));
        }
    };

    const submit = async (event?: FormEvent) => {
        event?.preventDefault();
        if (pending || !canSend) return;
        setPending(true);
        try {
            await onSend(body.trim(), files, { replyTo });
        } catch {
            // The draft stays; the parent shows why through `error`.
            return;
        } finally {
            if (mounted.current) setPending(false);
        }
        if (!mounted.current) return;
        setBody('');
        setFiles([]);
        setLocalError(null);
        if (textRef.current) textRef.current.style.height = 'auto';
        onClearReply?.();
        onSent?.();
        textRef.current?.focus();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
        event.preventDefault();
        void submit();
    };

    const errors = [error, attachmentsError, localError].filter(
        (message): message is string => typeof message === 'string' && message !== '',
    );

    return (
        <form
            onSubmit={(event) => void submit(event)}
            aria-busy={pending}
            className={cn('border-t border-border bg-card px-3 py-3 sm:px-4', className)}
        >
            {replyTo && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                    <span className="truncate">{labels.replyingTo(replyTo.name)}</span>
                    <IconButton
                        label={labels.cancelReply}
                        icon={<X className="size-4" aria-hidden="true" />}
                        className="size-6 shrink-0"
                        onClick={onClearReply}
                    />
                </div>
            )}

            {files.length > 0 && (
                <ul className="mb-2 flex flex-wrap gap-2">
                    {files.map((file, index) => (
                        <li
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-1 rounded-md border border-border bg-card py-1 ps-2 pe-1 text-xs"
                        >
                            <span className="max-w-[12rem] truncate text-foreground">
                                {file.name}
                            </span>
                            <IconButton
                                label={labels.removeFile(file.name)}
                                icon={<X className="size-3" aria-hidden="true" />}
                                destructive
                                disabled={pending}
                                className="size-6"
                                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex items-end gap-2">
                {allowAttachments && (
                    <>
                        <input
                            ref={fileRef}
                            type="file"
                            multiple
                            hidden
                            tabIndex={-1}
                            accept={acceptedMimes.join(',')}
                            onChange={pickFiles}
                        />
                        <IconButton
                            label={labels.attach}
                            icon={<Paperclip className="size-5" aria-hidden="true" />}
                            disabled={disabled || pending || atFileCap}
                            onClick={() => fileRef.current?.click()}
                            className="shrink-0 rounded-full"
                        />
                    </>
                )}
                <label htmlFor={fieldId} className="sr-only">
                    {labels.message}
                </label>
                <Textarea
                    id={fieldId}
                    ref={textRef}
                    rows={1}
                    value={body}
                    // Read-only, not disabled, while sending: focus stays put and
                    // nothing typed now is wiped when the send finishes.
                    readOnly={pending}
                    disabled={disabled}
                    onChange={(event) => {
                        setBody(event.target.value);
                        resize();
                    }}
                    onKeyDown={onKeyDown}
                    placeholder={labels.placeholder}
                    aria-invalid={errors.length > 0 ? true : undefined}
                    aria-describedby={errors.length > 0 ? errorId : undefined}
                    className="max-h-40 min-h-10 flex-1 resize-none rounded-2xl px-4 py-2"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={!canSend || pending}
                    aria-label={labels.send}
                    tooltip={labels.send}
                    className="shrink-0 rounded-full"
                >
                    <SendHorizontal className="size-4" aria-hidden="true" />
                </Button>
            </div>
            {errors.length > 0 && (
                <div id={errorId} role="alert" className="space-y-1 pt-2 text-sm text-destructive">
                    {errors.map((message) => (
                        <p key={message}>{message}</p>
                    ))}
                </div>
            )}
        </form>
    );
}
