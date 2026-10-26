import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
/**
 * A group of radio buttons where exactly one option can be chosen. Compose
 * `RadioGroup` with one `RadioGroupItem` per option, each with a unique `value`
 * and an `id` matching a `Label`. Give the group an `aria-label` or
 * `aria-labelledby`. Controlled with `value` + `onValueChange`, or uncontrolled with
 * `defaultValue`. For a compact, button-style single choice use `SegmentedChoice`;
 * for several choices use `Checkbox`.
 *
 * @summary Single-choice group; compose with RadioGroupItem, one per option.
 */
declare const RadioGroup: React.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/**
 * One radio button inside a `RadioGroup`. Needs a unique `value` and an `id` that a
 * `Label` points to with `htmlFor`; set `disabled` to make one option unavailable.
 */
declare const RadioGroupItem: React.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { RadioGroup, RadioGroupItem };
