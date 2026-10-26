import { type AttachmentListItem, type AttachmentListLabels } from '../../molecules/AttachmentList';
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
export declare function MessageList({ messages, labels, onReply, onDelete, canDelete, onLoadOlder, hasOlder, formatTime, className, }: MessageListProps): import("react").JSX.Element;
