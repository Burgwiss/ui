import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

/**
 * A small floating panel anchored to a trigger, for content that is richer than a menu (a
 * short form, a picker, extra detail). It closes on Escape or an outside click. For a list of
 * actions use `DropdownMenu`; for a hover-only hint use the `Tooltip` atom; for a blocking
 * task use `Dialog`. Compose it from `PopoverTrigger` and `PopoverContent`. Uncontrolled by
 * default; pass `open` and `onOpenChange` to control it.
 *
 * @summary Floating panel anchored to a trigger for small forms, pickers or extra detail.
 */
function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
    return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/** The element that opens the popover; use `asChild` to wrap your own `Button`. */
const PopoverTrigger = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(function PopoverTrigger({ ...props }, ref) {
    return <PopoverPrimitive.Trigger ref={ref} data-slot="popover-trigger" {...props} />;
});
PopoverTrigger.displayName = 'PopoverTrigger';

/** Anchors the panel to another element than the trigger, when the two should differ. */
const PopoverAnchor = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Anchor>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>
>(function PopoverAnchor({ ...props }, ref) {
    return <PopoverPrimitive.Anchor ref={ref} data-slot="popover-anchor" {...props} />;
});
PopoverAnchor.displayName = 'PopoverAnchor';

/** The floating panel (in a portal): 18rem wide, `align` defaults to `center` and `sideOffset` to 4px. */
const PopoverContent = React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, align = 'center', sideOffset = 4, ...props }, ref) {
    return (
        <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
                ref={ref}
                data-slot="popover-content"
                align={align}
                sideOffset={sideOffset}
                className={cn(
                    'z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=open]:animate-in',
                    className,
                )}
                {...props}
            />
        </PopoverPrimitive.Portal>
    );
});
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
