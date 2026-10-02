import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
/**
 * A confirm-style modal that cannot be dismissed by clicking outside; the user must choose
 * `AlertDialogAction` or `AlertDialogCancel`. Use it for a destructive or irreversible
 * decision built by hand; for the common "are you sure?" case use `ConfirmActionDialog`,
 * and for a form or free content use `Dialog`.
 * Compose it from `AlertDialogTrigger` and `AlertDialogContent` (with header, footer, title,
 * description, action, cancel). The app passes every visible string as children.
 *
 * @summary Modal that forces an explicit confirm or cancel choice, with no outside dismiss.
 */
declare function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>): React.JSX.Element;
/** The element that opens the dialog; use `asChild` to wrap your own `Button`. */
declare const AlertDialogTrigger: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** Renders its children into `document.body`; `AlertDialogContent` already includes it. */
declare function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>): React.JSX.Element;
/** The dimmed backdrop behind the dialog; `AlertDialogContent` already renders it. */
declare const AlertDialogOverlay: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogOverlayProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The centred panel (overlay and portal included); holds the header, description and footer. */
declare const AlertDialogContent: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** Stacks the title and description at the top of the content. */
declare const AlertDialogHeader: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** Lays out the action and cancel buttons: stacked on mobile, right-aligned from `sm` up. */
declare const AlertDialogFooter: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The dialog's accessible name; always render one. */
declare const AlertDialogTitle: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
/** The accessible description: say what will happen if the user confirms. */
declare const AlertDialogDescription: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
/** The confirming button (primary style); closes the dialog and runs its `onClick`. */
declare const AlertDialogAction: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogActionProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** The dismissing button (outline style); closes the dialog without doing anything. */
declare const AlertDialogCancel: React.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogCancelProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, };
