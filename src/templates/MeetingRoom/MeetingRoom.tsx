import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import { cn } from '../../lib/cn';

export interface MeetingRoomProps {
    /** The top bar, usually a `MeetingHeader`. */
    header?: ReactNode;
    /** Notices above the stage — connection trouble, a device error, "turn on sound". `Alert`s, newest last. The stack scrolls past a third of the height. */
    notices?: ReactNode;
    /** The stage, usually a `VideoStage`. */
    stage: ReactNode;
    /** Floats over the stage's top end corner — knocking guests (`AdmissionRequests`). */
    overlay?: ReactNode;
    /** A prompt just above the toolbar, e.g. "Abstimmung öffnen" while a poll runs. */
    prompt?: ReactNode;
    /** The control bar, usually a `MeetingToolbar`. */
    toolbar: ReactNode;
    /** The open side panel (`MeetingRoomPanel`), or nothing. Only one panel is open at a time. */
    panel?: ReactNode;
    className?: string;
}

/**
 * The page skeleton of a meeting in progress: a slim header, notices, the stage, the
 * control bar at the bottom, and at most one side panel (chat, people, poll). It fills
 * its container — give the parent the full viewport height (`h-dvh`) — and never scrolls
 * as a page; the stage takes whatever room is left.
 *
 * The panel docks beside the stage from the `lg` breakpoint, so the stage shrinks and no
 * video hides behind it. On smaller screens it slides up over the stage as a bottom
 * sheet, leaving the toolbar reachable.
 *
 * It has no data and no media: header, stage, toolbar and panel are slots. The pieces
 * that fit them are `MeetingHeader`, `VideoStage` with `ParticipantTile`s,
 * `MeetingToolbar` with `MeetingControl`s, and `MeetingRoomPanel`.
 *
 * @summary Meeting page layout: header, notices, stage, bottom toolbar and one docked side panel.
 */
export function MeetingRoom({
    header,
    notices,
    stage,
    overlay,
    prompt,
    toolbar,
    panel,
    className,
}: MeetingRoomProps) {
    return (
        <div
            className={cn(
                'flex h-full min-h-0 w-full flex-col bg-background text-foreground',
                className,
            )}
        >
            {header}
            <div className="relative flex min-h-0 flex-1">
                <main className="relative flex min-h-0 min-w-0 flex-1 flex-col gap-2 px-2 pt-1 sm:px-3">
                    {notices && (
                        <div className="max-h-[30%] shrink-0 space-y-2 overflow-y-auto">
                            {notices}
                        </div>
                    )}
                    <div className="relative min-h-0 flex-1">
                        {stage}
                        {overlay && (
                            <div className="pointer-events-none absolute end-2 top-2 z-10 flex max-h-[calc(100%-1rem)] w-[min(24rem,calc(100%-1rem))] flex-col items-end gap-2 overflow-y-auto [&>*]:pointer-events-auto">
                                {overlay}
                            </div>
                        )}
                    </div>
                    {prompt && <div className="flex shrink-0 justify-center">{prompt}</div>}
                </main>
                {panel && (
                    <div
                        className={cn(
                            // Phone and tablet: a bottom sheet over the stage.
                            'absolute inset-x-0 bottom-0 z-20 flex h-[min(75%,40rem)] flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl',
                            'animate-in duration-200 fade-in slide-in-from-bottom-8 motion-reduce:animate-none',
                            // Desktop: docked beside the stage.
                            'lg:static lg:me-3 lg:mt-1 lg:h-auto lg:w-[22rem] lg:rounded-2xl lg:border lg:shadow-sm',
                        )}
                    >
                        {panel}
                    </div>
                )}
            </div>
            <div className="shrink-0">{toolbar}</div>
        </div>
    );
}

export interface MeetingRoomPanelProps {
    /** The panel's heading: "Chat", "Teilnehmende (12)". */
    title: string;
    /** Name of the close button: "Schließen". */
    closeLabel: string;
    onClose: () => void;
    /** Buttons beside the heading. */
    actions?: ReactNode;
    /** The panel's content. It scrolls; the header and `footer` stay. */
    children: ReactNode;
    /** Pinned under the content — a chat composer. */
    footer?: ReactNode;
    /** Remove the content padding, for content that brings its own (a message list). */
    flush?: boolean;
}

/**
 * One side panel of a meeting — chat, people, poll — with a heading, a close button, a
 * scrolling body and an optional pinned footer (the chat composer). Escape closes it and
 * focus moves into it when it opens, so a keyboard user lands where they asked to go;
 * returning focus to the toolbar button is the app's job (it owns the button).
 *
 * It is non-modal: the meeting stays usable while it is open. Pass it as
 * `MeetingRoom`'s `panel`.
 *
 * @summary A meeting side panel: heading, close, scrolling body and pinned footer; Escape closes.
 */
export function MeetingRoomPanel({
    title,
    closeLabel,
    onClose,
    actions,
    children,
    footer,
    flush = false,
}: MeetingRoomPanelProps) {
    const titleId = useId();
    const ref = useRef<HTMLElement>(null);
    const close = useRef(onClose);
    useEffect(() => {
        close.current = onClose;
    });
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.focus();
        // Escape inside the panel closes it, but not a menu or dialog opened from it —
        // those stop the event themselves.
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !e.defaultPrevented) {
                e.stopPropagation();
                close.current();
            }
        };
        el.addEventListener('keydown', onKey);
        return () => el.removeEventListener('keydown', onKey);
    }, []);
    return (
        <section
            ref={ref}
            tabIndex={-1}
            aria-labelledby={titleId}
            className="flex min-h-0 flex-1 flex-col outline-none"
        >
            <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-2.5">
                <h2 id={titleId} className="min-w-0 flex-1 truncate text-base font-semibold">
                    {title}
                </h2>
                {actions}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={closeLabel}
                    onClick={onClose}
                >
                    <X aria-hidden="true" />
                </Button>
            </div>
            <div className={cn('min-h-0 flex-1 overflow-y-auto', !flush && 'px-4 py-3')}>
                {children}
            </div>
            {footer && <div className="shrink-0 border-t border-border p-3">{footer}</div>}
        </section>
    );
}
