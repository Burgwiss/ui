import type { ReactNode } from 'react';
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
export declare function MeetingLobby({ header, notice, title, description, meta, access, preview, aside, footer, className, }: MeetingLobbyProps): import("react").JSX.Element;
