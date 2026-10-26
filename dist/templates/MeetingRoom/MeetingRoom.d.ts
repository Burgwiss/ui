import { type ReactNode } from 'react';
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
export declare function MeetingRoom({ header, notices, stage, overlay, prompt, toolbar, panel, className, }: MeetingRoomProps): import("react").JSX.Element;
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
export declare function MeetingRoomPanel({ title, closeLabel, onClose, actions, children, footer, flush, }: MeetingRoomPanelProps): import("react").JSX.Element;
