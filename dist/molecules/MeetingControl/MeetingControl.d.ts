import { type ComponentPropsWithoutRef, type ReactNode } from 'react';
/**
 * How a control reads at a glance.
 * - `default` — a device or action that is fine as it is (mic on, camera on).
 * - `off` — a device the person switched off: red-tinted, so "I am muted" is never missed.
 * - `active` — a mode that is on (sharing the screen, a panel is open).
 * - `attention` — the person is asking for attention (hand raised).
 * - `danger` — leaves or ends something (leave the meeting).
 */
export type MeetingControlTone = 'default' | 'off' | 'active' | 'attention' | 'danger';
export interface MeetingControlOptions {
    /** Accessible name and tooltip of the chevron, e.g. "Mikrofonoptionen". */
    label: string;
    /** What the chevron opens: device selects, a short form. Rendered in a popover above the control. */
    content: ReactNode;
    /** Disable the chevron, e.g. while the connection is being restored. */
    disabled?: boolean;
    /** Controlled open state of the popover. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Classes for the popover panel (it is 18rem wide by default). */
    className?: string;
}
export interface MeetingControlProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'aria-label'> {
    /** Accessible name and tooltip — say what a click does now ("Mikrofon einschalten"). */
    label: string;
    /** A lucide icon element. */
    icon: ReactNode;
    /** See `MeetingControlTone`. Default `default`. */
    tone?: MeetingControlTone;
    /** For an on/off control: whether it is on. Sets `aria-pressed`; leave out for a plain action. */
    pressed?: boolean;
    /** A small count on the corner (unread messages, raised hands). Hidden at 0. Decorative: put the number in `label` too. */
    badge?: number;
    /** Shows `label` as text beside the icon from this width up, e.g. on the leave button. */
    showLabel?: boolean;
    /** Why the control cannot be used. Makes it disabled and becomes the tooltip, so the reason can be read. */
    disabledReason?: string;
    /** A chevron beside the control that opens its options (device choice). Turns it into a split button. */
    options?: MeetingControlOptions;
}
/**
 * One control in a meeting's toolbar: a round button with an icon, a tooltip that says
 * what a click does, an optional count badge, and an optional chevron for its options
 * (which microphone, which camera) — the split button every call app uses. `tone` makes
 * the state readable without the icon: `off` for a device someone switched off,
 * `attention` for a raised hand, `danger` for leaving.
 *
 * Use it inside `MeetingToolbar` and on the self-preview in `DevicePreview`. It forwards
 * its ref and props to the button, so a `DropdownMenuTrigger asChild` or
 * `PopoverTrigger asChild` can wrap it for a menu (more actions, reactions).
 *
 * A disabled control with `disabledReason` stays focusable and explains itself.
 *
 * @summary Round meeting toolbar button with tone, count badge and an optional options chevron.
 */
export declare const MeetingControl: import("react").ForwardRefExoticComponent<MeetingControlProps & import("react").RefAttributes<HTMLButtonElement>>;
