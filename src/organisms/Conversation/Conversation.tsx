import { ArrowLeft } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';

import { IconButton } from '../../atoms/IconButton';
import { cn } from '../../lib/cn';
import {
    ChatComposer,
    type ChatComposerLabels,
    type ChatComposerProps,
    type ReplyTarget,
} from '../ChatComposer';
import {
    MessageList,
    type MessageListItem,
    type MessageListLabels,
    type MessageListProps,
} from '../MessageList';

export interface ConversationLabels {
    /** Strings of the message log; see `MessageListLabels`. */
    messages: MessageListLabels;
    /** Strings of the composer at the foot; see `ChatComposerLabels`. */
    composer: ChatComposerLabels;
    /** Name and tooltip of the back button. Needed for `onBack`. */
    back?: string;
}

export interface ConversationProps {
    /** Who or what the conversation is with. Shown as its heading. */
    title: string;
    /** A line under the title. */
    subtitle?: string;
    /** Buttons at the end of the header. */
    actions?: ReactNode;
    /** Shows a back arrow that is visible on narrow screens, where the list of conversations is a screen of its own. */
    onBack?: () => void;
    /** A line between the header and the messages, e.g. "you are reading this as an admin". */
    notice?: string;
    /** The messages to show, oldest first; see `MessageListItem`. */
    messages: MessageListItem[];
    /** Every visible and accessible string, split into `messages`, `composer` and the optional `back`. */
    labels: ConversationLabels;

    /** See {@link ChatComposerProps.onSend}. */
    onSend: ChatComposerProps['onSend'];
    /** A validation error for the message text. */
    sendError?: string;
    /** A validation error for the files. */
    attachmentsError?: string;
    /** No composer: the conversation can only be read. */
    readOnly?: boolean;
    /** Replaces the composer with this text — the conversation is closed for new messages. */
    lockedNotice?: string;
    /** Turns file attachments off in the composer. */
    allowAttachments?: boolean;
    /** Lets a person answer a specific message; the composer then shows who. */
    replies?: boolean;

    /** Shows a delete button on the messages `canDelete` allows; see `MessageListProps.onDelete`. */
    onDelete?: MessageListProps['onDelete'];
    /** Which messages may be deleted (a boolean or a per-message predicate). Default: none. */
    canDelete?: MessageListProps['canDelete'];
    /** Fetches the page of messages before the first; the "load older" button shows only while `hasOlder`. */
    onLoadOlder?: MessageListProps['onLoadOlder'];
    /** There are older messages to fetch; shows the "load older" button (needs `labels.messages.loadOlder`). */
    hasOlder?: MessageListProps['hasOlder'];
    /** Formats the time on each bubble from its ISO string. Default: `14:05` in the reader's browser locale. */
    formatTime?: MessageListProps['formatTime'];
    /** Extra classes on the root `<section>`. */
    className?: string;
}

/**
 * One open conversation: a header with the title, the messages, and a
 * composer at the foot. It fills the height it is given and only the message
 * list scrolls. The draft lives inside, so give each conversation its own
 * `key` (its id) — switching without one would carry the draft to the next.
 *
 * Use it for a full chat pane. For only the log or only the input use
 * `MessageList` or `ChatComposer`; to pick between conversations use
 * `ThreadList`. Replies, deleting and older-message paging are opt-in props.
 *
 * @summary A complete chat pane: header, scrolling message log and composer, with read-only and locked modes.
 */
export function Conversation({
    title,
    subtitle,
    actions,
    onBack,
    notice,
    messages,
    labels,
    onSend,
    sendError,
    attachmentsError,
    readOnly = false,
    lockedNotice,
    allowAttachments,
    replies = false,
    onDelete,
    canDelete,
    onLoadOlder,
    hasOlder,
    formatTime,
    className,
}: ConversationProps) {
    const headingId = useId();
    const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);

    return (
        <section
            aria-labelledby={headingId}
            className={cn('flex h-full min-h-0 flex-col bg-card text-card-foreground', className)}
        >
            <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 sm:px-4">
                {onBack && labels.back && (
                    <IconButton
                        label={labels.back}
                        icon={<ArrowLeft className="size-4" aria-hidden="true" />}
                        onClick={onBack}
                        className="md:hidden"
                    />
                )}
                <div className="min-w-0 flex-1">
                    <h2 id={headingId} className="truncate text-sm font-semibold text-foreground">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                    )}
                </div>
                {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
            </header>

            {notice && (
                <p
                    role="status"
                    className="shrink-0 border-b border-border bg-muted px-4 py-2 text-center text-xs text-muted-foreground"
                >
                    {notice}
                </p>
            )}

            <MessageList
                messages={messages}
                labels={labels.messages}
                onReply={
                    replies && !readOnly && !lockedNotice
                        ? (message) => setReplyTo({ id: message.id, name: message.authorName })
                        : undefined
                }
                onDelete={onDelete}
                canDelete={canDelete}
                onLoadOlder={onLoadOlder}
                hasOlder={hasOlder}
                formatTime={formatTime}
            />

            {lockedNotice ? (
                <p
                    role="alert"
                    className="shrink-0 border-t border-border bg-card p-3 text-center text-sm text-muted-foreground"
                >
                    {lockedNotice}
                </p>
            ) : readOnly ? null : (
                <ChatComposer
                    labels={labels.composer}
                    onSend={onSend}
                    error={sendError}
                    attachmentsError={attachmentsError}
                    allowAttachments={allowAttachments}
                    replyTo={replyTo}
                    onClearReply={() => setReplyTo(null)}
                    className="shrink-0"
                />
            )}
        </section>
    );
}
