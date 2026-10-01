import type { ElementType } from 'react';

import { cn } from '../../lib/cn';

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

function defaultFormatTime(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
        ? iso
        : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

const ROW =
    'flex w-full flex-col gap-0.5 rounded-lg px-3 py-3 text-start transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[active=true]:bg-muted';

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
export function ThreadList({
    threads,
    labels,
    activeId = null,
    onOpen,
    as,
    formatTime = defaultFormatTime,
    className,
}: ThreadListProps) {
    if (threads.length === 0) {
        return (
            <p className={cn('px-6 py-10 text-center text-sm text-muted-foreground', className)}>
                {labels.empty}
            </p>
        );
    }

    return (
        <ul aria-label={labels.list} className={cn('flex flex-col gap-0.5', className)}>
            {threads.map((thread) => {
                const active = activeId !== null && thread.id === activeId;
                const rowProps = {
                    'data-active': active,
                    'aria-current': active ? ('true' as const) : undefined,
                    className: ROW,
                    onClick: () => onOpen?.(thread.id),
                };
                const Row: ElementType = thread.href !== undefined ? (as ?? 'a') : 'button';
                const extra =
                    thread.href !== undefined ? { href: thread.href } : { type: 'button' as const };

                return (
                    <li key={thread.id}>
                        <Row {...rowProps} {...extra}>
                            <span className="flex w-full items-baseline justify-between gap-2">
                                <span
                                    className={cn(
                                        'flex min-w-0 items-center gap-2 text-sm text-foreground',
                                        thread.unread ? 'font-semibold' : 'font-medium',
                                    )}
                                >
                                    {thread.unread && (
                                        <>
                                            {/* The dot is decorative; the state is read out once, from the label. */}
                                            <span
                                                aria-hidden="true"
                                                className="inline-block size-2 shrink-0 rounded-full bg-primary"
                                            />
                                            <span className="sr-only">{labels.unread}</span>
                                        </>
                                    )}
                                    <span className="truncate">{thread.title}</span>
                                </span>
                                {thread.lastActivityAt && (
                                    <time
                                        dateTime={thread.lastActivityAt}
                                        className="shrink-0 text-xs text-muted-foreground"
                                    >
                                        {formatTime(thread.lastActivityAt)}
                                    </time>
                                )}
                            </span>
                            {thread.subtitle && (
                                <span className="truncate text-xs text-muted-foreground">
                                    {thread.subtitle}
                                </span>
                            )}
                            {thread.preview && (
                                <span className="truncate text-xs text-muted-foreground">
                                    {thread.preview}
                                </span>
                            )}
                        </Row>
                    </li>
                );
            })}
        </ul>
    );
}
