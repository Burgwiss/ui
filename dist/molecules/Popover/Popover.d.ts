import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
/**
 * A small floating panel anchored to a trigger, for content that is richer than a menu (a
 * short form, a picker, extra detail). It closes on Escape or an outside click. For a list of
 * actions use `DropdownMenu`; for a hover-only hint use the `Tooltip` atom; for a blocking
 * task use `Dialog`. Compose it from `PopoverTrigger` and `PopoverContent`. Uncontrolled by
 * default; pass `open` and `onOpenChange` to control it.
 *
 * @summary Floating panel anchored to a trigger for small forms, pickers or extra detail.
 */
declare function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>): React.JSX.Element;
/** The element that opens the popover; use `asChild` to wrap your own `Button`. */
declare const PopoverTrigger: React.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** Anchors the panel to another element than the trigger, when the two should differ. */
declare const PopoverAnchor: React.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverAnchorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The floating panel (in a portal): 18rem wide, `align` defaults to `center` and `sideOffset` to 4px. */
declare const PopoverContent: React.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
