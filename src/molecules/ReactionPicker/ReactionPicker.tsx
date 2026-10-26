import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../atoms/Tooltip';
import { cn } from '../../lib/cn';

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
export function ReactionPicker({
    reactions,
    onPick,
    label,
    disabled,
    className,
}: ReactionPickerProps) {
    return (
        <TooltipProvider delayDuration={200}>
            <div role="group" aria-label={label} className={cn('flex flex-wrap gap-1', className)}>
                {reactions.map((r) => (
                    <Tooltip key={r.id}>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                aria-label={r.label}
                                disabled={disabled}
                                onClick={() => onPick(r.id)}
                                className={cn(
                                    'flex size-11 items-center justify-center rounded-full text-2xl transition-transform',
                                    'hover:scale-110 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                    'disabled:pointer-events-none disabled:opacity-50 motion-reduce:hover:scale-100',
                                )}
                            >
                                <span aria-hidden="true">{r.emoji}</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{r.label}</TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
}
