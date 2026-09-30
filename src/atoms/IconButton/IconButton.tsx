import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';
import { cn } from '../../lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Accessible name — required. Also rendered as tooltip content. Pass a
     *  translated string (a `t('domain.area.key')` value), never a literal. */
    label: string;
    /** Lucide (or other) icon element. Give it `aria-hidden`; the `label` names the button. */
    icon: ReactNode;
    /** When true, the button turns solid destructive (red) on hover. Use for delete-style actions. */
    destructive?: boolean;
}

/**
 * A standalone icon-only button with a required `label`. Use it wherever the visible UI
 * is just an icon (edit, delete, close); for a button that also has text use `Button`,
 * and for an icon item inside a toggle group use `IconToggle`. It is the canonical
 * icon-only button per `docs/ux-conventions.md`: it
 * wraps a shadcn `Tooltip`, sets `aria-label` (so the accessible name resolves
 * even when the tooltip is suppressed on touch), and ships the 44px WCAG touch
 * floor via `pointer-coarse:min-*` — the hit area grows on touch devices while
 * dense desktop UIs keep their compact 32px footprint.
 *
 * Use this anywhere the visible UI is just an icon — never roll your own
 * `<button><Icon/></button>` without an accessible name + tooltip.
 *
 * @summary Icon-only button whose required `label` is both its aria-label and its tooltip.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
    { label, icon, destructive = false, className, type = 'button', ...rest },
    ref,
) {
    return (
        // Self-contained TooltipProvider — Radix allows nested providers, so
        // this works inside the layout's global provider AND when IconButton is
        // rendered outside one (e.g. unit tests).
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        ref={ref}
                        type={type}
                        aria-label={label}
                        className={cn(
                            'inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors',
                            // 44px touch target on coarse pointers only — no
                            // desktop density loss, no click-stealing overlay.
                            'pointer-coarse:min-h-11 pointer-coarse:min-w-11',
                            'hover:bg-muted hover:text-foreground',
                            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            // Full destructive bg + foreground on hover — text-destructive on
                            // bg-destructive/10 falls below WCAG AA (3.7:1); destructive-foreground
                            // on bg-destructive is the shadcn-canonical contrast-safe pair.
                            destructive && 'hover:bg-destructive hover:text-destructive-foreground',
                            className,
                        )}
                        {...rest}
                    >
                        {icon}
                    </button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});
