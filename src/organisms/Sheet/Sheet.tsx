import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
import { X } from 'lucide-react';

import { cn } from '../../lib/cn';

/**
 * A slide-over panel anchored to an edge of the viewport (Radix Dialog root,
 * like `Dialog` but not centred). Use it for the mobile navigation drawer
 * (`side="left"`) or a mobile bottom sheet (`side="bottom"` with `showHandle`);
 * for a centred modal use `Dialog`.
 *
 * Compose it as `Sheet` > `SheetTrigger` + `SheetContent` (> `SheetTitle`,
 * optional `SheetDescription`, your content). Every `SheetContent` MUST contain
 * a `SheetTitle` (visually hidden is fine) so the dialog satisfies the Radix
 * accessible-name requirement.
 *
 * The corner close button needs a screen-reader name, so `closeLabel` is
 * required unless `showClose={false}` — the package carries no copy of its own.
 *
 * @summary Slide-over panel from a screen edge (nav drawer or bottom sheet) built on Radix Dialog.
 */
function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
    return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

/** The element that opens the `Sheet`; use `asChild` to make your own button the trigger. */
const SheetTrigger = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger>
>(function SheetTrigger({ ...props }, ref) {
    return <SheetPrimitive.Trigger ref={ref} data-slot="sheet-trigger" {...props} />;
});
SheetTrigger.displayName = 'SheetTrigger';

/** Closes the `Sheet` when clicked, e.g. a "Cancel" button inside the content (use `asChild`). */
const SheetClose = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Close>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Close>
>(function SheetClose({ ...props }, ref) {
    return <SheetPrimitive.Close ref={ref} data-slot="sheet-close" {...props} />;
});
SheetClose.displayName = 'SheetClose';

/** Portals the sheet to the document body; `SheetContent` already includes it. */
function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>) {
    return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

/** The dimmed backdrop behind the sheet; `SheetContent` already renders one. */
const SheetOverlay = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(function SheetOverlay({ className, ...props }, ref) {
    return (
        <SheetPrimitive.Overlay
            ref={ref}
            data-slot="sheet-overlay"
            className={cn(
                // Motion dial — same fallback numbers
                // tw-animate-css already defaulted to (150ms, `ease`), so NULL
                // / explicit-`default` renders byte-for-byte what this overlay
                // always rendered.
                'fixed inset-0 z-50 bg-black/50 duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                className,
            )}
            {...props}
        />
    );
});
SheetOverlay.displayName = 'SheetOverlay';

const SIDE_CLASSES = {
    left: 'inset-y-0 left-0 h-full w-72 max-w-[85vw] border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
    right: 'inset-y-0 right-0 h-full w-72 max-w-[85vw] border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
    // Mobile bottom sheet (auth, class-select). Rounded
    // top, slides up, and clears the home indicator via the safe-area inset.
    bottom: 'inset-x-0 bottom-0 w-full max-h-[90vh] rounded-t-2xl border-t pb-[max(1rem,env(safe-area-inset-bottom))] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
    top: 'inset-x-0 top-0 w-full max-h-[90vh] rounded-b-2xl border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
} as const;

/** A small, decorative grab affordance for the bottom sheet (aria-hidden). */
function SheetHandle({ className }: { className?: string }) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                'mx-auto h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30',
                className,
            )}
        />
    );
}

type SheetCloseProps =
    | {
          /** Show the corner close button. Default true; then `closeLabel` is required. */
          showClose?: true;
          /** Accessible name of the corner close button, in the app's language. */
          closeLabel: string;
      }
    | {
          /** Hides the corner close button (dismiss via Escape, the overlay or a `SheetClose`). */
          showClose: false;
          closeLabel?: string;
      };

export type SheetContentProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    /** Which screen edge the panel slides from: `left` (default), `right`, `bottom` or `top`. */
    side?: keyof typeof SIDE_CLASSES;
    /** Render a drag-handle affordance (typically with side="bottom"). */
    showHandle?: boolean;
} & SheetCloseProps;

/**
 * The panel itself: overlay, portal, edge-anchored surface and the corner close
 * button. Must contain a `SheetTitle`.
 */
const SheetContent = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Content>,
    SheetContentProps
>(function SheetContent(
    {
        className,
        children,
        side = 'left',
        showClose = true,
        closeLabel,
        showHandle = false,
        ...props
    },
    ref,
) {
    return (
        <SheetPortal>
            <SheetOverlay />
            <SheetPrimitive.Content
                ref={ref}
                data-slot="sheet-content"
                className={cn(
                    // Motion dial — own historical fallbacks: `ease-in-out`
                    // (Tailwind's `cubic-bezier(0.4, 0, 0.2, 1)`), 200ms closing
                    // / 300ms opening. The token, when set, applies the SAME
                    // duration to both directions (one shared system tempo);
                    // only the unset fallback keeps the original asymmetry.
                    'fixed z-50 flex flex-col gap-4 overflow-y-auto border-border bg-card text-card-foreground shadow-lg transition ease-[var(--motion-ease,cubic-bezier(0.4,0,0.2,1))] data-[state=closed]:animate-out data-[state=closed]:duration-[var(--motion-duration,200ms)] data-[state=open]:animate-in data-[state=open]:duration-[var(--motion-duration,300ms)]',
                    SIDE_CLASSES[side],
                    className,
                )}
                {...props}
            >
                {showHandle && <SheetHandle />}
                {children}
                {showClose && (
                    <SheetPrimitive.Close
                        aria-label={closeLabel}
                        className="absolute top-3 right-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                    >
                        <X className="h-4 w-4" aria-hidden="true" />
                    </SheetPrimitive.Close>
                )}
            </SheetPrimitive.Content>
        </SheetPortal>
    );
});
SheetContent.displayName = 'SheetContent';

/** The sheet's accessible name (required in every `SheetContent`; may be visually hidden). */
const SheetTitle = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(function SheetTitle({ className, ...props }, ref) {
    return (
        <SheetPrimitive.Title
            ref={ref}
            data-slot="sheet-title"
            className={cn('text-lg font-semibold text-foreground', className)}
            {...props}
        />
    );
});
SheetTitle.displayName = 'SheetTitle';

/** Optional secondary text that describes the sheet to screen readers. */
const SheetDescription = React.forwardRef<
    React.ElementRef<typeof SheetPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(function SheetDescription({ className, ...props }, ref) {
    return (
        <SheetPrimitive.Description
            ref={ref}
            data-slot="sheet-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
});
SheetDescription.displayName = 'SheetDescription';

export {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetPortal,
    SheetOverlay,
    SheetContent,
    SheetHandle,
    SheetTitle,
    SheetDescription,
};
