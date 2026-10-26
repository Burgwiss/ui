import type { ReactNode } from 'react';
export interface MeetingToolbarProps {
    /** The group's accessible name, e.g. "Eigene Geräte und Meetingaktionen". */
    label: string;
    /** Your own devices and actions — mic, camera, screen, hand, reactions. Centred. Usually `MeetingControl`s. */
    children: ReactNode;
    /** Quiet information at the start, e.g. the time and the room code. Hidden on narrow screens. */
    start?: ReactNode;
    /** Panel toggles and leave, at the end (chat, people, ⋮, leave). */
    end?: ReactNode;
    className?: string;
}
/**
 * The control bar at the bottom of a meeting, in three zones: quiet information at the
 * start (time, room code), your own devices and actions in the centre, and the panels and
 * "leave" at the end — the layout people know from every call app, so nobody hunts for
 * the mute button. On a narrow screen the start zone hides and the rest wraps onto two
 * centred rows; nothing scrolls sideways.
 *
 * It is a labelled group with plain Tab order (not an ARIA toolbar with arrow keys), so
 * every control is one Tab away and screen readers list them as buttons.
 *
 * @summary Meeting control bar: info at the start, own devices in the centre, panels and leave at the end.
 */
export declare function MeetingToolbar({ label, children, start, end, className }: MeetingToolbarProps): import("react").JSX.Element;
