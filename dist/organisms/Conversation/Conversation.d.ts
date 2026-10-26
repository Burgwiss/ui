import { type ReactNode } from 'react';
import { type ChatComposerLabels, type ChatComposerProps } from '../ChatComposer';
import { type MessageListItem, type MessageListLabels, type MessageListProps } from '../MessageList';
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
export declare function Conversation({ title, subtitle, actions, onBack, notice, messages, labels, onSend, sendError, attachmentsError, readOnly, lockedNotice, allowAttachments, replies, onDelete, canDelete, onLoadOlder, hasOlder, formatTime, className, }: ConversationProps): import("react").JSX.Element;
