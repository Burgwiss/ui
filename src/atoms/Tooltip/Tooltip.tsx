import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

/** Supplies the shared open delay (`delayDuration`, default 200 ms) to every Tooltip below it; mount once near the app root. */
function TooltipProvider({
    delayDuration = 200,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
    return (
        <TooltipPrimitive.Provider
            data-slot="tooltip-provider"
            delayDuration={delayDuration}
            {...props}
        />
    );
}

/**
 * Low-level hover/focus hint. Compose `Tooltip` > `TooltipTrigger` (usually
 * `asChild`) + `TooltipContent`. For a button you rarely need it: `Button` takes a
 * `tooltip` prop and `IconButton` a `label`, both built on this. Use it directly
 * for non-button triggers (an info icon, a truncated text). The content is a
 * hint only, never the sole carrier of information, since it does not show on touch.
 *
 * Every icon-only button MUST be wrapped in a Tooltip and still carry an
 * `aria-label`, so the accessible name resolves even when the tooltip is
 * suppressed (e.g. on touch). Wrap the app root once in `TooltipProvider`
 * so individual call sites stay terse (`delayDuration` defaults to 200 ms).
 * Wrapper around `@radix-ui/react-tooltip`.
 *
 * @summary Hover/focus hint bubble; prefer Button's `tooltip` prop or IconButton for buttons.
 */
function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

/** The element that opens the tooltip on hover or keyboard focus; pass `asChild` to use your own button instead of a wrapper. */
const TooltipTrigger = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(function TooltipTrigger({ ...props }, ref) {
    return <TooltipPrimitive.Trigger ref={ref} data-slot="tooltip-trigger" {...props} />;
});
TooltipTrigger.displayName = 'TooltipTrigger';

/** The bubble itself, rendered in a portal. Children are the hint text (app-language string). `sideOffset` defaults to 6px. */
const TooltipContent = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent({ className, sideOffset = 6, children, ...props }, ref) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
                ref={ref}
                data-slot="tooltip-content"
                sideOffset={sideOffset}
                className={cn(
                    'z-50 overflow-hidden rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md',
                    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0',
                    className,
                )}
                {...props}
            >
                {children}
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
    );
});
TooltipContent.displayName = 'TooltipContent';

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
