import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

const alertVariants = cva(
    "group/alert relative grid w-full gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default: 'bg-card text-card-foreground',
                destructive:
                    'bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

/**
 * An inline message with `role="alert"`, announced by screen readers the moment it renders.
 * Use it for something that has just happened or a state the user must notice (a failed
 * payment, a new version); do not use it for static help text, or for a blocking
 * confirmation (use `AlertDialog` or `ConfirmActionDialog`).
 * Compose it from `AlertTitle`, `AlertDescription` and an optional `AlertAction`; an SVG
 * icon placed as the first child gets its own column. `variant` is `default` (neutral card)
 * or `destructive` (destructive-coloured text, for errors).
 *
 * @summary Inline, screen-reader-announced message with title, description and optional action.
 */
function Alert({
    className,
    variant,
    ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
    return (
        <div
            data-slot="alert"
            role="alert"
            className={cn(alertVariants({ variant }), className)}
            {...props}
        />
    );
}

/** The bold headline of an `Alert`; one short line. */
function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-title"
            className={cn(
                'font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground',
                className,
            )}
            {...props}
        />
    );
}

/** The supporting text of an `Alert`, in muted colour; links inside are underlined. */
function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-description"
            className={cn(
                'text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4',
                className,
            )}
            {...props}
        />
    );
}

/** A control (link or button) pinned to the top-right corner of an `Alert`; it needs its own accessible label. */
function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="alert-action"
            className={cn('absolute top-2 right-2', className)}
            {...props}
        />
    );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
