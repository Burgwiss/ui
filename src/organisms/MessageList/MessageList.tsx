import { CornerUpLeft, Trash2 } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { cn } from '../../lib/cn';
import {
    AttachmentList,
    type AttachmentListItem,
    type AttachmentListLabels,
} from '../../molecules/AttachmentList';

/** The quoted original shown inside a message that answers another. */
export interface MessageReplyPreview {
    /** Identifier of the answered message. */
    id: string | number;
    /** Who wrote the message that is answered. */
    authorName?: string | null;
    /** A short excerpt of it. */
    preview?: string | null;
    /** The answered message no longer exists. */
    deleted?: boolean;
}

/** One message in the log. */
export interface MessageListItem {
    /** Unique and stable; used as the React key and to detect newly arrived or older messages. */
    id: string | number;
    /** Display name; also drives the avatar initials. */
    authorName: string;
    /**
     * Who wrote it, for grouping consecutive messages. Without it the author is
     * told apart by name and badge.
     */
    authorId?: string | number;
    /** A role label next to the name, already in the reader's language (e.g. `Lehrkraft`). */
    authorBadge?: string | null;
    /** A second, smaller name in brackets after the first (e.g. a real name behind a pseudonym). */
    authorNote?: string | null;
    /** Written by the person looking at the list: shown on the right, in the primary colour. */
    own?: boolean;
    /** Plain text; line breaks are kept and nothing is parsed as HTML. */
    body?: string | null;
    /** When it was sent, as an ISO 8601 string. */
    sentAt: string;
    /** Shown as a tombstone; body, files and actions are not. */
    deleted?: boolean;
    /** Files on the message. Only rendered when `labels.attachments` is passed. */
    attachments?: AttachmentListItem[];
    /** The message this one answers, shown as a quote above the body. */
    replyTo?: MessageReplyPreview | null;
}

export interface MessageListLabels {
    /** Accessible name of the message log, e.g. `Nachrichten mit Anna`. */
    log: string;
    /** Shown when there are no messages. */
    empty: string;
    /** Text of a deleted message. */
    deleted: string;
    /** Shown in the quote of a reply whose original was deleted. */
    replyPreviewDeleted: string;
    /** Name and tooltip of the reply button. */
    reply: string;
    /** Name and tooltip of the delete button. */
    delete: string;
    /** The button above the oldest message. Needed for `onLoadOlder`. */
    loadOlder?: string;
    /** Labels of the files on messages. Without them files are not shown. */
    attachments?: AttachmentListLabels;
}

export interface MessageListProps {
    /** Oldest first. */
    messages: MessageListItem[];
    /** Every visible and accessible string: log name, empty state, button names, deleted text. */
    labels: MessageListLabels;
    /** Shows a reply button on every message. */
    onReply?: (message: MessageListItem) => void;
    /** Shows a delete button on the messages `canDelete` allows. */
    onDelete?: (message: MessageListItem) => void;
    /** Which messages may be deleted. Default: none. */
    canDelete?: boolean | ((message: MessageListItem) => boolean);
    /**
     * Fetch the page of messages before the first. Shown as a button while
     * `hasOlder`; it is busy while the promise is pending, and usable again
     * when it settles — a rejection is yours to report.
     */
    onLoadOlder?: () => Promise<void> | void;
    /** There are older messages to fetch. */
    hasOlder?: boolean;
    /**
     * Formats a time of day for the bubble. Default: `14:05` in the reader's
     * browser locale. Pass a function that also shows the date if the list
     * spans days.
     */
    formatTime?: (iso: string) => string;
    /** Extra classes on the scrolling `role="log"` element (it is `flex-1`, so give its parent a height). */
    className?: string;
}

/** Messages by one sender closer together than this share a name and avatar. */
const GROUP_GAP_MS = 5 * 60 * 1000;
/** Closer to the end than this counts as "reading the latest". */
const STICK_TO_BOTTOM_PX = 200;

function defaultFormatTime(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
        ? iso
        : date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function senderKey(message: MessageListItem): string {
    if (message.own) return '__own';
    if (message.authorId !== undefined) return `id:${message.authorId}`;
    return `${message.authorName}|${message.authorBadge ?? ''}`;
}

function hasBody(message: MessageListItem): boolean {
    return typeof message.body === 'string' && message.body.trim() !== '';
}

/**
 * A chat-style message log: bubbles, the reader's own messages on the right,
 * consecutive messages from one sender grouped under a single name and avatar,
 * plain-text bodies with their line breaks kept.
 *
 * The list is a scrolling `role="log"` region, so new messages are announced
 * by screen readers. It scrolls to the bottom on first show; when a message
 * arrives it follows only if the reader was already near the end (or wrote it),
 * so scrolling up to read history is not undone. Older messages loaded above
 * keep the reader where they were.
 *
 * Use it for the message log alone. For a whole chat pane with header and
 * input use `Conversation`. It fills `flex-1` of a column, so give its parent
 * a height.
 *
 * @summary Scrolling chat log with grouped bubbles, replies, deletion and older-message paging.
 */
export function MessageList({
    messages,
    labels,
    onReply,
    onDelete,
    canDelete = false,
    onLoadOlder,
    hasOlder = false,
    formatTime = defaultFormatTime,
    className,
}: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const follow = useRef(true);
    const seen = useRef<{
        first: string | number | undefined;
        last: string | number | undefined;
        height: number;
    } | null>(null);
    const [loadingOlder, setLoadingOlder] = useState(false);

    // Scroll after every render that changed the messages, before paint.
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const first = messages[0]?.id;
        const lastMessage = messages[messages.length - 1];
        const last = lastMessage?.id;
        const before = seen.current;

        if (before === null) {
            el.scrollTop = el.scrollHeight;
        } else if (last !== before.last) {
            if (follow.current || lastMessage?.own) el.scrollTop = el.scrollHeight;
        } else if (first !== before.first) {
            // Older messages were added above: keep what was being read in place.
            el.scrollTop += el.scrollHeight - before.height;
        }
        seen.current = { first, last, height: el.scrollHeight };
    }, [messages]);

    const deletable = (message: MessageListItem): boolean =>
        typeof canDelete === 'function' ? canDelete(message) : canDelete;

    const loadOlder = async () => {
        if (!onLoadOlder || loadingOlder) return;
        setLoadingOlder(true);
        try {
            await onLoadOlder();
        } catch {
            // Reporting the failure is the app's job; here the button just becomes usable again.
        } finally {
            setLoadingOlder(false);
        }
    };

    const actions = (message: MessageListItem) => {
        const canRemove = onDelete !== undefined && deletable(message);
        if (!onReply && !canRemove) return null;
        return (
            // Hover-reveal on desktop, always visible on touch (`pointer-coarse`):
            // a control that only appears on hover cannot be reached without one.
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100">
                {onReply && (
                    <IconButton
                        label={labels.reply}
                        icon={<CornerUpLeft className="size-4" aria-hidden="true" />}
                        onClick={() => onReply(message)}
                    />
                )}
                {canRemove && (
                    <IconButton
                        label={labels.delete}
                        icon={<Trash2 className="size-4" aria-hidden="true" />}
                        destructive
                        onClick={() => onDelete(message)}
                    />
                )}
            </div>
        );
    };

    return (
        // A scrolling region has to be reachable by keyboard to be scrollable
        // without a mouse, hence the tab stop on a non-interactive role.
        <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label={labels.log}
            aria-busy={loadingOlder}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            onScroll={(event) => {
                const el = event.currentTarget;
                follow.current =
                    el.scrollHeight - el.scrollTop - el.clientHeight < STICK_TO_BOTTOM_PX;
            }}
            className={cn(
                'min-h-0 flex-1 overflow-y-auto bg-background px-3 py-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset sm:px-4',
                className,
            )}
        >
            {hasOlder && onLoadOlder && labels.loadOlder && (
                <div className="mb-4 flex justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loadingOlder}
                        onClick={() => void loadOlder()}
                    >
                        {labels.loadOlder}
                    </Button>
                </div>
            )}

            {messages.length === 0 ? (
                <p className="flex h-full min-h-24 items-center justify-center text-center text-sm text-muted-foreground">
                    {labels.empty}
                </p>
            ) : (
                <ol className="flex flex-col gap-0.5">
                    {messages.map((message, index) => {
                        const previous = messages[index - 1];
                        const startsGroup =
                            !previous ||
                            senderKey(previous) !== senderKey(message) ||
                            new Date(message.sentAt).getTime() -
                                new Date(previous.sentAt).getTime() >
                                GROUP_GAP_MS;
                        const own = message.own === true;
                        const attachments = message.attachments ?? [];
                        const time = formatTime(message.sentAt);

                        // Trailing time that flows after the text, like a phone messenger.
                        const inlineTime = (
                            <time
                                dateTime={message.sentAt}
                                className={cn(
                                    'ms-2 inline-block translate-y-px align-baseline text-[11px] leading-none',
                                    own ? 'text-primary-foreground' : 'text-muted-foreground',
                                )}
                            >
                                {time}
                            </time>
                        );

                        return (
                            <li
                                key={message.id}
                                data-own={own || undefined}
                                className={cn(
                                    'group flex gap-1.5 sm:gap-2',
                                    startsGroup && 'mt-4 first:mt-0',
                                    own ? 'flex-row-reverse' : 'flex-row',
                                )}
                            >
                                {!own && (
                                    <div className="w-7 shrink-0 sm:w-8">
                                        {startsGroup && (
                                            <InitialsAvatar
                                                name={message.authorName}
                                                className="size-7 text-xs sm:size-8"
                                            />
                                        )}
                                    </div>
                                )}

                                <div
                                    className={cn(
                                        'flex max-w-[88%] min-w-0 flex-col sm:max-w-[78%]',
                                        own ? 'items-end' : 'items-start',
                                    )}
                                >
                                    {startsGroup && !own && (
                                        <div className="mb-0.5 flex items-center gap-2 px-1">
                                            <span className="text-xs font-semibold text-foreground">
                                                {message.authorName}
                                            </span>
                                            {message.authorBadge && (
                                                <Badge
                                                    variant="secondary"
                                                    className="px-1.5 py-0 text-[10px]"
                                                >
                                                    {message.authorBadge}
                                                </Badge>
                                            )}
                                            {message.authorNote &&
                                                message.authorNote !== message.authorName && (
                                                    <span className="text-[10px] font-normal text-muted-foreground">
                                                        ({message.authorNote})
                                                    </span>
                                                )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1">
                                        {/* Actions sit on the inner side of the bubble. */}
                                        {own && !message.deleted && actions(message)}

                                        <div
                                            className={cn(
                                                'max-w-full min-w-0 rounded-2xl px-3.5 py-2 text-sm',
                                                own
                                                    ? 'rounded-ee-md bg-primary text-primary-foreground'
                                                    : 'rounded-es-md bg-muted text-foreground',
                                                // Quieted by colour, not opacity: opacity also fades the
                                                // 11px time below AA (measured 3.52:1 in Chromium).
                                                message.deleted &&
                                                    'bg-muted text-muted-foreground italic',
                                            )}
                                        >
                                            {message.replyTo && (
                                                <div
                                                    className={cn(
                                                        'mb-1 rounded-md border-s-2 px-2 py-1 text-xs [overflow-wrap:anywhere] break-words',
                                                        own
                                                            ? 'border-primary-foreground/60 bg-primary-foreground/20'
                                                            : 'border-foreground/30 bg-foreground/5',
                                                    )}
                                                >
                                                    {message.replyTo.deleted ? (
                                                        <em>{labels.replyPreviewDeleted}</em>
                                                    ) : (
                                                        <>
                                                            <span className="font-semibold">
                                                                {message.replyTo.authorName}
                                                            </span>
                                                            {message.replyTo.preview
                                                                ? `: ${message.replyTo.preview}`
                                                                : ''}
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                            {message.deleted ? (
                                                <p className="text-sm">
                                                    {labels.deleted}
                                                    {inlineTime}
                                                </p>
                                            ) : hasBody(message) ? (
                                                <p className="text-sm [overflow-wrap:anywhere] break-words whitespace-pre-wrap sm:text-base">
                                                    {message.body}
                                                    {inlineTime}
                                                </p>
                                            ) : null}

                                            {!message.deleted &&
                                                attachments.length > 0 &&
                                                labels.attachments && (
                                                    <div className="mt-2 max-w-full min-w-0">
                                                        <AttachmentList
                                                            items={attachments}
                                                            labels={labels.attachments}
                                                        />
                                                    </div>
                                                )}

                                            {/* Files only: no paragraph to trail, so the time gets a line. */}
                                            {!message.deleted && !hasBody(message) && (
                                                <time
                                                    dateTime={message.sentAt}
                                                    className={cn(
                                                        'mt-1 block text-end text-[11px] leading-none',
                                                        own
                                                            ? 'text-primary-foreground'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {time}
                                                </time>
                                            )}
                                        </div>

                                        {!own && !message.deleted && actions(message)}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </div>
    );
}
