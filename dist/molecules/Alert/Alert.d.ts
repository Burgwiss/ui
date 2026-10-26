import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const alertVariants: (props?: ({
    variant?: "default" | "destructive" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
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
declare function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>): React.JSX.Element;
/** The bold headline of an `Alert`; one short line. */
declare function AlertTitle({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
/** The supporting text of an `Alert`, in muted colour; links inside are underlined. */
declare function AlertDescription({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
/** A control (link or button) pinned to the top-right corner of an `Alert`; it needs its own accessible label. */
declare function AlertAction({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
export { Alert, AlertTitle, AlertDescription, AlertAction };
