import { ReactNode } from 'react';
export interface ConfirmActionDialogProps {
    /** Controlled open state. */
    open: boolean;
    /** Called whenever the dialog wants to change its open state (cancel, escape, overlay click). */
    onOpenChange: (open: boolean) => void;
    /** Dialog heading. */
    title: string;
    /** Dialog body — typically the warning sentence. */
    description: ReactNode;
    /** Label for the destructive/confirm button. */
    confirmLabel: string;
    /** Label for the cancel button. */
    cancelLabel: string;
    /** Fired when the user confirms — runs the action. The dialog closes via onOpenChange. */
    onConfirm: () => void;
    /** `destructive` (the default) styles the confirm button in the destructive colour; use `default` for a neutral confirmation. */
    variant?: 'default' | 'destructive';
    /**
     * Optional extra controls rendered between the description and the
     * buttons — a scope choice, for instance ("also cancel the rest of the
     * series"). Deliberately BELOW the description and ABOVE the confirm
     * button, so it cannot be missed by somebody heading for the action.
     */
    children?: ReactNode;
    /**
     * Whether confirming dismisses the dialog. Default true, which is what
     * every command-shaped caller wants.
     *
     * Pass false when `children` collects something the SERVER can reject — a
     * two-factor code, say. Radix closes on confirm by default, so a 422 would
     * tear the dialog down and strand the error message on a page that no
     * longer shows the field it belongs to. With false the caller owns the
     * close and can keep the dialog up, populated, with the error under the
     * input.
     */
    closeOnConfirm?: boolean;
}
/**
 * A ready-made "are you sure?" dialog with a title, a warning and a confirm/cancel pair,
 * for destructive or hard-to-undo actions (archive, delete, remove). Use it instead of
 * `window.confirm`: it traps focus, uses theme tokens and is keyboard reachable. For
 * a custom layout compose `AlertDialog` yourself; for a form use `Dialog`.
 *
 * The button that triggers the dialog lives in the caller — this
 * component is purely the modal surface, controlled through `open` and `onOpenChange`.
 * The app passes every string (`title`, `description`, `confirmLabel`, `cancelLabel`).
 *
 * @summary Controlled confirm/cancel modal for destructive actions, replacing window.confirm.
 */
export declare function ConfirmActionDialog({ open, onOpenChange, title, description, confirmLabel, cancelLabel, onConfirm, variant, children, closeOnConfirm, }: ConfirmActionDialogProps): import("react").JSX.Element;
