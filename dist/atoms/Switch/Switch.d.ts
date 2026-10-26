import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
/**
 * An on/off toggle for a setting that takes effect immediately (e.g. "Course
 * published"). Use `Checkbox` instead when the value is only applied on submit
 * or when several options can be ticked from a list. Controlled with
 * `checked` + `onCheckedChange`, or uncontrolled with `defaultChecked`.
 * The trigger needs a label associated via `<label htmlFor={id}>` or
 * `aria-labelledby`. Always pair with an `id` prop.
 * Wrapper around `@radix-ui/react-switch`, theme-token styling only.
 *
 * @summary On/off toggle switch for an immediate setting; always pair with a Label and `id`.
 */
declare const Switch: React.ForwardRefExoticComponent<Omit<SwitchPrimitive.SwitchProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { Switch };
