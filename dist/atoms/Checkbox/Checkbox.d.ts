import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
/**
 * A tick box for a yes/no value that is applied on submit, or for picking
 * several options from a list. Use `Switch` instead for a setting that takes
 * effect immediately, and `RadioGroup` when exactly one option may be chosen.
 * Controlled with `checked` + `onCheckedChange`, or uncontrolled with
 * `defaultChecked`; set `aria-invalid` to show an error border.
 * The trigger needs a label associated via `<label htmlFor={id}>` or
 * `aria-labelledby`. Always pair with an `id` prop.
 * Wrapper around `@radix-ui/react-checkbox`, theme-token styling only.
 *
 * @summary Tick box for a yes/no value or multi-select; always pair with a Label and `id`.
 */
declare const Checkbox: React.ForwardRefExoticComponent<Omit<CheckboxPrimitive.CheckboxProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { Checkbox };
