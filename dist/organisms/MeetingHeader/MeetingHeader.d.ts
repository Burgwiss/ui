import type { ReactNode } from 'react';
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
export declare function MeetingHeader({ title, subtitle, status, end, className }: MeetingHeaderProps): import("react").JSX.Element;
