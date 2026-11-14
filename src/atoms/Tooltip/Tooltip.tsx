import * as React from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

/** How long a finger must rest on a trigger before the hint opens; shorter would fire on ordinary taps. */
const TOUCH_HOLD_MS = 500;
/** How long the hint stays readable after the finger lifts. */
const TOUCH_SHOW_MS = 1500;
/** Finger travel that turns a hold into a scroll and cancels the hint. */
const TOUCH_SLOP_PX = 10;

/** Lets a trigger open its own Tooltip on touch, which Radix only opens on hover and focus. */
const TouchHintContext = React.createContext<((open: boolean) => void) | null>(null);

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
 * for non-button triggers (an info icon, a truncated text). On touch screens a
 * long press (0.5 s) opens it; it closes 1.5 s after the finger lifts or on the
 * next tap elsewhere, and that press does not activate the trigger. The content
 * is still a hint only, never the sole carrier of information.
 *
 * Every icon-only button MUST be wrapped in a Tooltip and still carry an
 * `aria-label`, so the accessible name resolves even when the tooltip is
 * not open. Wrap the app root once in `TooltipProvider`
 * so individual call sites stay terse (`delayDuration` defaults to 200 ms).
 * Wrapper around `@radix-ui/react-tooltip`; `open`, `defaultOpen` and
 * `onOpenChange` work as there.
 *
 * @summary Hover/focus/long-press hint bubble; prefer Button's `tooltip` prop or IconButton for buttons.
 */
function Tooltip({
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const setOpen = React.useCallback(
        (open: boolean) => {
            if (openProp === undefined) setUncontrolledOpen(open);
            onOpenChange?.(open);
        },
        [openProp, onOpenChange],
    );
    return (
        <TouchHintContext.Provider value={setOpen}>
            <TooltipPrimitive.Root
                data-slot="tooltip"
                open={openProp ?? uncontrolledOpen}
                onOpenChange={setOpen}
                {...props}
            />
        </TouchHintContext.Provider>
    );
}

/**
 * The element that opens the tooltip on hover, keyboard focus or a touch long
 * press; pass `asChild` to use your own button instead of a wrapper.
 */
const TooltipTrigger = React.forwardRef<
    React.ElementRef<typeof TooltipPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(function TooltipTrigger(
    { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture, onContextMenu, style, ...props },
    ref,
) {
    const setOpen = React.useContext(TouchHintContext);
    const hold = React.useRef<{ x: number; y: number; timer: ReturnType<typeof setTimeout> } | null>(null);
    const hideTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    // True from the moment a long press opened the hint until its release click was swallowed or the hint closed.
    const shownByTouch = React.useRef(false);

    const cancelHold = React.useCallback(() => {
        if (hold.current) clearTimeout(hold.current.timer);
        hold.current = null;
    }, []);
    const hideLater = React.useCallback(() => {
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
            shownByTouch.current = false;
            setOpen?.(false);
        }, TOUCH_SHOW_MS);
    }, [setOpen]);
    React.useEffect(
        () => () => {
            cancelHold();
            clearTimeout(hideTimer.current);
        },
        [cancelHold],
    );

    return (
        <TooltipPrimitive.Trigger
            ref={ref}
            data-slot="tooltip-trigger"
            // A long press must show our hint, not the iOS callout menu.
            style={{ WebkitTouchCallout: 'none', ...style }}
            onPointerDown={(event) => {
                onPointerDown?.(event);
                cancelHold();
                if (event.defaultPrevented || event.pointerType !== 'touch' || !setOpen) return;
                clearTimeout(hideTimer.current);
                shownByTouch.current = false;
                hold.current = {
                    x: event.clientX,
                    y: event.clientY,
                    timer: setTimeout(() => {
                        hold.current = null;
                        shownByTouch.current = true;
                        setOpen(true);
                    }, TOUCH_HOLD_MS),
                };
            }}
            onPointerMove={(event) => {
                onPointerMove?.(event);
                const start = hold.current;
                if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > TOUCH_SLOP_PX) {
                    cancelHold();
                }
            }}
            onPointerUp={(event) => {
                onPointerUp?.(event);
                cancelHold();
                if (shownByTouch.current) hideLater();
            }}
            onPointerCancel={(event) => {
                onPointerCancel?.(event);
                cancelHold();
                if (shownByTouch.current) hideLater();
            }}
            onClickCapture={(event) => {
                // The press that opened the hint asked a question; it must not also activate the trigger.
                if (shownByTouch.current) {
                    shownByTouch.current = false;
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                onClickCapture?.(event);
            }}
            onContextMenu={(event) => {
                if (hold.current || shownByTouch.current) event.preventDefault();
                onContextMenu?.(event);
            }}
            {...props}
        />
    );
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
