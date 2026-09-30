import * as React from 'react';
export type InputProps = React.ComponentProps<'input'>;
/**
 * A single-line text field. Takes every native `<input>` prop, so set `type`
 * (`text`, `email`, `search`, `number`, ...), `placeholder`, `disabled` and so on as
 * usual. Pair it with a `Label` (`htmlFor` + `id`) or pass `aria-label`; a placeholder
 * is not a label. Mark a failed validation with `aria-invalid` (destructive border).
 * For passwords use `PasswordInput` (show/hide toggle), for whole numbers `IntegerInput`,
 * for several lines `Textarea`, and for a search box with a magnifier icon `SearchField`.
 *
 * @summary Single-line text input with theme-token styling; pair it with a Label.
 */
declare const Input: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "ref"> & React.RefAttributes<HTMLInputElement>>;
export { Input };
