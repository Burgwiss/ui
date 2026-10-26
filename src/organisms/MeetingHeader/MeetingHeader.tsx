import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface MeetingHeaderProps {
    /** What the meeting is — the appointment's title, or the room code when there is no title. Rendered as the page's `h1`. */
    title: string;
    /** A quieter line beside the title: the room code, the course. */
    subtitle?: ReactNode;
    /** Status right after the title: the recording indicator, a "lecture mode" badge. */
    status?: ReactNode;
    /** At the end: the clock, the participant count, a help link. */
    end?: ReactNode;
    className?: string;
}

/**
 * The slim bar at the top of a meeting: what this meeting is, whether it is being
 * recorded, and the time. It stays one line tall and gives the stage the room; on a phone
 * the subtitle drops away and the title truncates.
 *
 * The title is the page's `h1`, so a screen reader landing in the meeting hears where it
 * is.
 *
 * @summary Slim top bar of a meeting: title as h1, subtitle, recording status and the clock.
 */
export function MeetingHeader({ title, subtitle, status, end, className }: MeetingHeaderProps) {
    return (
        <header className={cn('flex min-h-11 items-center gap-3 px-3 py-1.5', className)}>
            <div className="flex min-w-0 flex-1 items-center gap-x-3 gap-y-1">
                <h1 className="truncate text-base font-semibold">{title}</h1>
                {subtitle && (
                    <span className="hidden shrink-0 text-sm text-muted-foreground sm:inline">
                        {subtitle}
                    </span>
                )}
                {status && <div className="flex shrink-0 items-center gap-2">{status}</div>}
            </div>
            {end && (
                <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground tabular-nums">
                    {end}
                </div>
            )}
        </header>
    );
}
