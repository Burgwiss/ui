import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';

import { cn } from '../../lib/cn';

/**
 * A modal dialog for a form field or other free content; it can be dismissed with Escape,
 * the corner close button or a click outside. For a yes/no confirmation use
 * `AlertDialog` or `ConfirmActionDialog` instead: they have no implicit confirm semantics
 * here and no outside-click guard.
 * Compose it from `DialogTrigger` and `DialogContent` (with header, title, description and
 * footer). Every dialog needs a `DialogTitle`, and `DialogContent` takes a required
 * `closeLabel` — the screen-reader name of the corner close button. The package carries no
 * copy of its own. Uncontrolled by default; pass `open` and `onOpenChange` to control it.
 *
 * @summary Modal dialog for forms and free content, with a corner close button and outside-click dismiss.
 */
function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
    return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/** The element that opens the dialog; use `asChild` to wrap your own `Button`. */
function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
    return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/** Renders its children into `document.body`; `DialogContent` already includes it. */
function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
    return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

// forwardRef (not a plain function) because Radix's `DialogPortal` wraps each
// child in a `Presence` that clones it and attaches a ref to drive the
// open/close animation. A plain function child can't receive that ref and
// React warns ("Function components cannot be given refs") on every open.
/** The dimmed backdrop behind the dialog; `DialogContent` already renders it. */
const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentProps<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        data-slot="dialog-overlay"
        className={cn(
            // Motion dial: the school's `--motion-duration` /
            // `--motion-ease` when set, else the exact numbers tw-animate-css's
            // `animate-in`/`animate-out` already defaulted to (150ms, `ease`) —
            // so a NULL or explicit-`default` appearance renders byte-for-byte
            // what this overlay always rendered.
            'fixed inset-0 z-50 bg-black/50 duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
            className,
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/** The dialog panel (overlay and portal included): top-anchored on phones so the soft keyboard cannot cover the footer, centred from `sm` up. */
const DialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentProps<typeof DialogPrimitive.Content> & {
        /** Accessible name of the corner close button, in the app's language. */
        closeLabel: string;
    }
>(({ className, children, closeLabel, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        {/* Anchored to the TOP below `sm`, centred from `sm` up.
            A vertically-centred dialog on a phone puts its footer under the
            soft keyboard the moment a field inside it takes focus — and every
            dialog in this product that asks for a code (disable two-factor,
            regenerate recovery codes) does exactly that, so the submit button
            was unreachable without dismissing the keyboard first. Anchoring to
            the top pins the actions above the keyboard by construction rather
            than by arithmetic. Desktop is unchanged. */}
        <DialogPrimitive.Content
            ref={ref}
            data-slot="dialog-content"
            className={cn(
                // Motion dial: same token pair as DialogOverlay, but this
                // element's OWN historical fallback (200ms — the `duration-200`
                // it always carried; no explicit `ease-*` before, so `ease`).
                'fixed top-4 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 translate-y-0 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg duration-[var(--motion-duration,200ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:top-1/2 sm:-translate-y-1/2',
                className,
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close
                aria-label={closeLabel}
                className="absolute top-3 right-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            >
                <X className="h-4 w-4" aria-hidden="true" />
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/** Stacks the title and description at the top of the content. */
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-header"
            className={cn('flex flex-col gap-2 text-left', className)}
            {...props}
        />
    );
}

/** Lays out the buttons: stacked on mobile, right-aligned from `sm` up. */
function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
            {...props}
        />
    );
}

/** The dialog's accessible name; always render one (visually hide it if the design has none). */
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
    return (
        <DialogPrimitive.Title
            data-slot="dialog-title"
            className={cn('text-lg font-semibold text-foreground', className)}
            {...props}
        />
    );
}

/** The accessible description under the title. */
function DialogDescription({
    className,
    ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
    return (
        <DialogPrimitive.Description
            data-slot="dialog-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

/** A control that closes the dialog; use `asChild` for a Cancel `Button` in the footer. */
function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
    return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export {
    Dialog,
    DialogTrigger,
    DialogPortal,
    DialogOverlay,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
};
