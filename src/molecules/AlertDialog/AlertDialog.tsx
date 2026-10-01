import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

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
function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
    return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

/** The element that opens the dialog; use `asChild` to wrap your own `Button`. */
const AlertDialogTrigger = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger>
>(function AlertDialogTrigger({ ...props }, ref) {
    return <AlertDialogPrimitive.Trigger ref={ref} data-slot="alert-dialog-trigger" {...props} />;
});
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

/** Renders its children into `document.body`; `AlertDialogContent` already includes it. */
function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
    return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

/** The dimmed backdrop behind the dialog; `AlertDialogContent` already renders it. */
const AlertDialogOverlay = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(function AlertDialogOverlay({ className, ...props }, ref) {
    return (
        <AlertDialogPrimitive.Overlay
            ref={ref}
            data-slot="alert-dialog-overlay"
            className={cn(
                'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                className,
            )}
            {...props}
        />
    );
});
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

/** The centred panel (overlay and portal included); holds the header, description and footer. */
const AlertDialogContent = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(function AlertDialogContent({ className, ...props }, ref) {
    return (
        <AlertDialogPortal>
            <AlertDialogOverlay />
            <AlertDialogPrimitive.Content
                ref={ref}
                data-slot="alert-dialog-content"
                className={cn(
                    'fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-lg duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                    className,
                )}
                {...props}
            />
        </AlertDialogPortal>
    );
});
AlertDialogContent.displayName = 'AlertDialogContent';

/** Stacks the title and description at the top of the content. */
const AlertDialogHeader = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    function AlertDialogHeader({ className, ...props }, ref) {
        return (
            <div
                ref={ref}
                data-slot="alert-dialog-header"
                className={cn('flex flex-col gap-2 text-start', className)}
                {...props}
            />
        );
    },
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

/** Lays out the action and cancel buttons: stacked on mobile, right-aligned from `sm` up. */
const AlertDialogFooter = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    function AlertDialogFooter({ className, ...props }, ref) {
        return (
            <div
                ref={ref}
                data-slot="alert-dialog-footer"
                className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
                {...props}
            />
        );
    },
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

/** The dialog's accessible name; always render one. */
const AlertDialogTitle = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(function AlertDialogTitle({ className, ...props }, ref) {
    return (
        <AlertDialogPrimitive.Title
            ref={ref}
            data-slot="alert-dialog-title"
            className={cn('text-lg font-semibold text-foreground', className)}
            {...props}
        />
    );
});
AlertDialogTitle.displayName = 'AlertDialogTitle';

/** The accessible description: say what will happen if the user confirms. */
const AlertDialogDescription = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(function AlertDialogDescription({ className, ...props }, ref) {
    return (
        <AlertDialogPrimitive.Description
            ref={ref}
            data-slot="alert-dialog-description"
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    );
});
AlertDialogDescription.displayName = 'AlertDialogDescription';

/** The confirming button (primary style); closes the dialog and runs its `onClick`. */
const AlertDialogAction = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Action>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(function AlertDialogAction({ className, ...props }, ref) {
    return (
        <AlertDialogPrimitive.Action
            ref={ref}
            data-slot="alert-dialog-action"
            className={cn(
                'inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-xs font-semibold tracking-widest text-primary-foreground uppercase transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none',
                className,
            )}
            {...props}
        />
    );
});
AlertDialogAction.displayName = 'AlertDialogAction';

/** The dismissing button (outline style); closes the dialog without doing anything. */
const AlertDialogCancel = React.forwardRef<
    React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(function AlertDialogCancel({ className, ...props }, ref) {
    return (
        <AlertDialogPrimitive.Cancel
            ref={ref}
            data-slot="alert-dialog-cancel"
            className={cn(
                'inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold tracking-widest text-foreground uppercase transition-colors hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none',
                className,
            )}
            {...props}
        />
    );
});
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};
