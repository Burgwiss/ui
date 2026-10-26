import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
/** Supplies the shared open delay (`delayDuration`, default 200 ms) to every Tooltip below it; mount once near the app root. */
declare function TooltipProvider({ delayDuration, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>): React.JSX.Element;
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
declare function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>): React.JSX.Element;
/** The element that opens the tooltip on hover or keyboard focus; pass `asChild` to use your own button instead of a wrapper. */
declare const TooltipTrigger: React.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** The bubble itself, rendered in a portal. Children are the hint text (app-language string). `sideOffset` defaults to 6px. */
declare const TooltipContent: React.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
