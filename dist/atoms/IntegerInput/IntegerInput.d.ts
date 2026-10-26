import * as React from 'react';
import { type InputProps } from '../../atoms/Input';
export interface IntegerInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type' | 'inputMode'> {
    /** Current numeric value (the field's source of truth). */
    value: number;
    /** Called with the parsed integer on every edit; an empty field reports `emptyValue`. */
    onValueChange: (value: number) => void;
    /**
     * Value reported when the field is cleared. Defaults to 0 — a sentinel a
     * form should never treat as a valid count or duration, so a blank field
     * surfaces as a validation error instead of a silent 0.
     */
    emptyValue?: number;
}
/**
 * A whole-number field for counts, durations and similar (digits only, no decimals or
 * signs). Controlled: pass `value` and `onValueChange`, which receives a number.
 * Optional `min` / `max` are enforced when the field loses focus (the value is clamped),
 * and a cleared field reports `emptyValue`. Pair it with a `Label`. For free text use
 * `Input`. It behaves the way `<input type="number">` +
 * `Number(e.target.value)` does NOT (issues #828 / #829):
 *
 *   1. Typing a leading zero ("06", "075") no longer sticks. With a numeric
 *      controlled value, React skips re-rendering when the sanitised string
 *      maps back to the SAME number, so the stray "0" was frozen in the DOM.
 *      We normalise the DOM node directly in the handler to beat that bail-out.
 *   2. Clearing the field shows an EMPTY box, not "0". `Number('')` is 0, which
 *      made every emptied duration read "immer 0" (#828). Here empty stays
 *      empty and reports `emptyValue`, so the server's `min:1` rule rejects it
 *      instead of the field silently pretending it's zero.
 *
 * Rendered as `type="text" inputMode="numeric"` (not `type="number"`) because
 * number inputs sanitise their own `.value` inconsistently across browsers,
 * which is exactly what defeats the leading-zero fix.
 *
 * @summary Controlled whole-number input: digits only, no stuck leading zeros, min/max clamped on blur.
 */
export declare const IntegerInput: React.ForwardRefExoticComponent<Omit<IntegerInputProps, "ref"> & React.RefAttributes<HTMLInputElement>>;
