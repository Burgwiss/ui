import { type InputProps } from '../../atoms/Input';
export interface PasswordInputLabels {
    /** Accessible name + tooltip of the toggle while the password is hidden. */
    show: string;
    /** Accessible name + tooltip of the toggle while the password is visible. */
    hide: string;
}
export type PasswordInputProps = Omit<InputProps, 'type'> & {
    /** The show/hide toggle's accessible name and tooltip, in the app's language (required). */
    labels: PasswordInputLabels;
};
/**
 * A password field with a show/hide "eye" toggle. Use it for every password
 * input instead of `<Input type="password" />`; it is a drop-in for that, forwarding the
 * ref and every input prop except `type`. The app passes the toggle's text as `labels`.
 *
 * a11y: the toggle is an {@link IconButton} (`aria-label` + tooltip from `labels` +
 * 44px touch floor), keyboard-reachable, with `aria-pressed` reflecting
 * visibility. Toggling flips the input between `password` and `text`.
 *
 * @summary Password input with a show/hide toggle; a drop-in for Input type="password".
 */
export declare const PasswordInput: import("react").ForwardRefExoticComponent<Omit<PasswordInputProps, "ref"> & import("react").RefAttributes<HTMLInputElement>>;
