export interface ReactionOption {
    id: string;
    emoji: string;
    /** What it means, read out and shown as the tooltip ("Applaus"). */
    label: string;
}
export interface ReactionPickerProps {
    /** The reactions on offer, in order. */
    reactions: ReactionOption[];
    /** Called with the chosen reaction's id. */
    onPick: (id: string) => void;
    /** The group's accessible name, e.g. "Reaktionen". */
    label: string;
    /** Disable every reaction, e.g. while waiting out a rate limit. */
    disabled?: boolean;
    className?: string;
}
/**
 * A row of emoji reactions to send in a meeting — thumbs up, applause, a laugh. Each is a
 * big, easy-to-hit button named by what it means, so "👏" is read as "Applaus". Put it in
 * a popover that opens from a `MeetingControl`, and close the popover after a pick.
 *
 * @summary Row of large emoji reaction buttons, each named by its meaning.
 */
export declare function ReactionPicker({ reactions, onPick, label, disabled, className, }: ReactionPickerProps): import("react").JSX.Element;
