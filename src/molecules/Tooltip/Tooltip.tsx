import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

/**
 * shadcn-style wrapper around `@radix-ui/react-tooltip` (re-exported by
 * the `radix-ui` umbrella package the rest of the UI primitives use).
 *
 * Per `docs/ux-conventions.md`, every icon-only button MUST be
 * wrapped in a Tooltip + still carry an `aria-label` so the accessible
 * name resolves even when the tooltip is suppressed (e.g. on touch).
 *
 * Wrap the app root once in <TooltipProvider> (done in
 * AuthenticatedLayout) so individual call-sites stay terse.
 */

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

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

const TooltipTrigger = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(function TooltipTrigger({ ...props }, ref) {
    return <TooltipPrimitive.Trigger ref={ref} data-slot="tooltip-trigger" {...props} />;
});
TooltipTrigger.displayName = 'TooltipTrigger';

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
