import { ChevronUp } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import { cn } from '../../lib/cn';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';

/**
 * How a control reads at a glance.
 * - `default` — a device or action that is fine as it is (mic on, camera on).
 * - `off` — a device the person switched off: red-tinted, so "I am muted" is never missed.
 * - `active` — a mode that is on (sharing the screen, a panel is open).
 * - `attention` — the person is asking for attention (hand raised).
 * - `danger` — leaves or ends something (leave the meeting).
 */
export type MeetingControlTone = 'default' | 'off' | 'active' | 'attention' | 'danger';

const TONE: Record<MeetingControlTone, string> = {
    default: 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground',
    off: 'bg-destructive/10 text-destructive-tint-foreground hover:bg-destructive/15',
    active: 'bg-primary text-primary-foreground hover:bg-primary/90',
    attention: 'bg-warning text-warning-foreground hover:bg-warning/90',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
};

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

export interface MeetingControlProps extends Omit<
    ComponentPropsWithoutRef<'button'>,
    'children' | 'aria-label'
> {
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
export const MeetingControl = forwardRef<HTMLButtonElement, MeetingControlProps>(
    function MeetingControl(
        {
            label,
            icon,
            tone = 'default',
            pressed,
            badge,
            showLabel = false,
            disabledReason,
            options,
            disabled,
            className,
            ...rest
        },
        ref,
    ) {
        const blocked = disabled || Boolean(disabledReason);
        const split = Boolean(options);
        const main = (
            <Button
                ref={ref}
                type="button"
                variant="ghost"
                size={showLabel ? 'default' : 'icon-lg'}
                aria-label={label}
                aria-pressed={pressed}
                tooltip={disabledReason ?? label}
                disabled={blocked}
                data-tone={tone}
                className={cn(
                    'relative h-11 rounded-full transition-colors',
                    showLabel ? 'gap-2 px-4' : 'w-11',
                    split && 'w-auto rounded-e-none ps-3 pe-2.5',
                    TONE[tone],
                    !split && className,
                )}
                {...rest}
            >
                {icon}
                {showLabel && <span className="hidden sm:inline">{label}</span>}
                {badge !== undefined && badge > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6875rem] leading-none font-semibold text-primary-foreground tabular-nums ring-2 ring-background"
                    >
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </Button>
        );

        if (!options) return main;

        return (
            <div
                className={cn('inline-flex items-stretch rounded-full', className)}
                data-slot="meeting-control-split"
            >
                {main}
                <Popover open={options.open} onOpenChange={options.onOpenChange}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-lg"
                            aria-label={options.label}
                            tooltip={options.label}
                            disabled={options.disabled}
                            className={cn(
                                'h-11 w-7 rounded-s-none rounded-e-full border-s border-background/40 ps-0.5 pe-1.5',
                                TONE[tone],
                            )}
                        >
                            <ChevronUp aria-hidden="true" className="size-3.5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        aria-label={options.label}
                        side="top"
                        align="start"
                        sideOffset={10}
                        className={cn('max-h-[70dvh] overflow-y-auto', options.className)}
                    >
                        {options.content}
                    </PopoverContent>
                </Popover>
            </div>
        );
    },
);
