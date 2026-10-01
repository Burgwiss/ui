import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
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
declare function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>): React.JSX.Element;
/** The element that opens the dialog; use `asChild` to wrap your own `Button`. */
declare function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>): React.JSX.Element;
/** Renders its children into `document.body`; `DialogContent` already includes it. */
declare function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>): React.JSX.Element;
/** The dimmed backdrop behind the dialog; `DialogContent` already renders it. */
declare const DialogOverlay: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The dialog panel (overlay and portal included): top-anchored on phones so the soft keyboard cannot cover the footer, centred from `sm` up. */
declare const DialogContent: React.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React.RefAttributes<HTMLDivElement> & {
    /** Accessible name of the corner close button, in the app's language. */
    closeLabel: string;
}, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** Stacks the title and description at the top of the content. */
declare function DialogHeader({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
/** Lays out the buttons: stacked on mobile, right-aligned from `sm` up. */
declare function DialogFooter({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
/** The dialog's accessible name; always render one (visually hide it if the design has none). */
declare function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>): React.JSX.Element;
/** The accessible description under the title. */
declare function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>): React.JSX.Element;
/** A control that closes the dialog; use `asChild` for a Cancel `Button` in the footer. */
declare function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>): React.JSX.Element;
export { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, };
