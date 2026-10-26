import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface MeetingLobbyProps {
    /** The top bar: the app's logo or the school's name. */
    header?: ReactNode;
    /** Above everything: why the person is back here ("Die Leitung hat das Meeting beendet"). An `Alert`. */
    notice?: ReactNode;
    /** What happens next, as the page's `h1`: "Bereit zum Beitreten?", "Du wartest auf die Zulassung". */
    title: string;
    /** One or two sentences under the title. */
    description?: ReactNode;
    /** Facts about the meeting under the description: the appointment, the room code, the recording notice. */
    meta?: ReactNode;
    /** The way in: the join button, a guest form, the waiting state. */
    access: ReactNode;
    /** The self-check, usually a `DevicePreview`. Leave out where there is nothing to check (meeting ended). */
    preview?: ReactNode;
    /** For hosts: who is already waiting (a `ParticipantList` of waiting guests). Beside on wide screens, below on narrow ones. */
    aside?: ReactNode;
    /** Links at the bottom: help, privacy, imprint. */
    footer?: ReactNode;
    className?: string;
}

/**
 * The page before a meeting — and after it. Your picture and devices on one side (to
 * check them before anyone sees you), and on the other what this meeting is and the one
 * button that matters: join, knock, or wait. The same page shows why someone is back
 * after leaving or being removed (`notice`), so they are never dropped on a blank screen.
 *
 * Two columns from `md`, the self-check first; one column on a phone, the way in first so
 * nobody scrolls past their camera to find the button. A host's waiting list (`aside`)
 * goes to the side on wide screens.
 *
 * @summary Pre-join and after-meeting page: self-check beside the meeting's title and the way in.
 */
export function MeetingLobby({
    header,
    notice,
    title,
    description,
    meta,
    access,
    preview,
    aside,
    footer,
    className,
}: MeetingLobbyProps) {
    return (
        <div
            className={cn(
                'flex min-h-full w-full flex-col bg-background text-foreground',
                className,
            )}
        >
            {header && (
                <header className="shrink-0 border-b border-border px-4 py-3 sm:px-6">
                    {header}
                </header>
            )}
            <main className="flex flex-1 justify-center px-4 py-6 sm:px-6 sm:py-10">
                <div
                    className={cn(
                        'flex w-full max-w-6xl flex-col gap-6',
                        aside && 'xl:flex-row xl:items-start',
                    )}
                >
                    <div className="min-w-0 flex-1 space-y-6">
                        {notice}
                        <div
                            className={cn(
                                'grid items-center gap-6 sm:gap-10',
                                preview && 'md:grid-cols-[minmax(0,1.4fr)_minmax(18rem,1fr)]',
                            )}
                        >
                            {preview && <div className="order-2 min-w-0 md:order-1">{preview}</div>}
                            <div
                                className={cn(
                                    'order-1 min-w-0 space-y-5 md:order-2',
                                    !preview && 'mx-auto w-full max-w-md text-center',
                                )}
                            >
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                                        {title}
                                    </h1>
                                    {description && (
                                        <div className="text-base text-pretty text-muted-foreground">
                                            {description}
                                        </div>
                                    )}
                                </div>
                                {meta && (
                                    <div
                                        className={cn(
                                            'flex flex-wrap items-center gap-2 text-sm',
                                            !preview && 'justify-center',
                                        )}
                                    >
                                        {meta}
                                    </div>
                                )}
                                <div className="space-y-3">{access}</div>
                            </div>
                        </div>
                    </div>
                    {aside && (
                        <aside className="w-full shrink-0 rounded-2xl border border-border bg-card p-4 xl:w-80">
                            {aside}
                        </aside>
                    )}
                </div>
            </main>
            {footer && (
                <footer className="shrink-0 px-4 py-4 text-sm text-muted-foreground sm:px-6">
                    {footer}
                </footer>
            )}
        </div>
    );
}
