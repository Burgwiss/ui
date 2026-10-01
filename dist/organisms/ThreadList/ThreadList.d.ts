import type { ElementType } from 'react';
/** One conversation row in the list. */
export interface ThreadListItem {
    /** Unique and stable; used as the React key, for `activeId` and passed to `onOpen`. */
    id: string | number;
    /** Who or what the conversation is with. */
    title: string;
    /** A second line under the title (a course, a role, …). */
    subtitle?: string | null;
    /** The latest message, cut to one line. */
    preview?: string | null;
    /** There is something new to read. */
    unread?: boolean;
    /** When the conversation last moved, as an ISO 8601 string. */
    lastActivityAt?: string | null;
    /** Makes the row a link. Without it the row is a button. */
    href?: string;
}
export interface ThreadListLabels {
    /** Accessible name of the list, e.g. `Konversationen`. */
    list: string;
    /** Shown when there are no threads. */
    empty: string;
    /** Read out for an unread thread, e.g. `Ungelesen`. */
    unread: string;
}
export interface ThreadListProps {
    /** The conversations, in the order to show them (the list does not sort). */
    threads: ThreadListItem[];
    /** Every visible and accessible string: list name, empty state, unread label. */
    labels: ThreadListLabels;
    /** The open thread; marked with `aria-current` and a tint. */
    activeId?: ThreadListItem['id'] | null;
    /** A row was chosen — by click, Enter or Space. */
    onOpen?: (id: ThreadListItem['id']) => void;
    /**
     * The element or component that renders a row that has an `href` — pass
     * your router's `Link`. Default `'a'`. It gets `href`, `className`,
     * `aria-current` and `onClick`.
     */
    as?: ElementType;
    /**
     * Formats `lastActivityAt`. Default: a short date and time in the reader's
     * browser locale.
     */
    formatTime?: (iso: string) => string;
    /** Extra classes on the `<ul>` (or on the empty-state paragraph when there are no threads). */
    className?: string;
}
/**
 * A list of conversations, newest activity as the caller orders it. Each row
 * shows who it is with, a preview, when it last moved, and a dot if something
 * is unread — the dot is decorative and a screen-reader-only label says the
 * same once. A row with an `href` is a link (give `as` to use a router's
 * `Link`); one without is a button. Either way `onOpen` fires.
 *
 * Use it as the master list next to a `Conversation`. It shows no avatars,
 * search or paging; for a plain link list use `Sidebar` menu parts.
 *
 * @summary List of conversations with preview, time and unread marker; rows are links or buttons.
 */
export declare function ThreadList({ threads, labels, activeId, onOpen, as, formatTime, className, }: ThreadListProps): import("react").JSX.Element;
