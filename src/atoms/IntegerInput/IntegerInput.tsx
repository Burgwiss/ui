import * as React from 'react';

import { Input, type InputProps } from '../../atoms/Input';

export interface IntegerInputProps extends Omit<
    InputProps,
    'value' | 'onChange' | 'type' | 'inputMode'
> {
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
export const IntegerInput = React.forwardRef<HTMLInputElement, IntegerInputProps>(
    function IntegerInput({ value, onValueChange, emptyValue = 0, onBlur, ...rest }, ref) {
        const [text, setText] = React.useState<string>(() =>
            Number.isFinite(value) ? String(value) : '',
        );

        // Re-sync the displayed text when the parent's numeric value diverges
        // from what the field currently represents — a form reset or a seeded
        // value (Edit/Admin). A mid-edit empty field represents `emptyValue`,
        // so it's left untouched (a cleared field must not snap back). This is
        // the documented "adjust state during render" pattern and converges in
        // one extra render.
        const represented = text.trim() === '' ? emptyValue : Number(text);
        if (represented !== value) {
            setText(Number.isFinite(value) ? String(value) : '');
        }

        return (
            <Input
                ref={ref}
                type="text"
                inputMode="numeric"
                value={text}
                onChange={(e) => {
                    const raw = e.target.value;
                    // Digits only, and drop leading zeros ("06" → "6"); "" stays "".
                    const next = raw.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
                    // React bails re-rendering when `next` maps to the current
                    // state, so normalise the DOM node here or the stray zero
                    // would linger in the input.
                    if (next !== raw) {
                        e.currentTarget.value = next;
                    }
                    setText(next);
                    onValueChange(next.trim() === '' ? emptyValue : Number(next));
                }}
                onBlur={(e) => {
                    // C-10 — `type="text"` (deliberate, for the #828 leading-zero
                    // fix) makes `min`/`max` INERT: the browser enforces neither,
                    // and four of the five call sites pass them as if it did. So
                    // typing 900 into a field capped at 720 was accepted, sent,
                    // and refused by the server a round trip later.
                    //
                    // Clamped on BLUR rather than on change, because clamping
                    // mid-typing is worse than not clamping at all: it rewrites
                    // "7" to "1" while somebody is on their way to "72".
                    const asNumber = Number(e.currentTarget.value);
                    if (e.currentTarget.value.trim() !== '' && Number.isFinite(asNumber)) {
                        // An absent bound must not constrain: defaulting it to
                        // `asNumber` made a field with only `min` cap at the typed
                        // value, so the minimum was never enforced.
                        const lo = typeof rest.min === 'number' ? rest.min : -Infinity;
                        const hi = typeof rest.max === 'number' ? rest.max : Infinity;
                        const clamped = Math.min(hi, Math.max(lo, asNumber));
                        if (clamped !== asNumber) {
                            setText(String(clamped));
                            onValueChange(clamped);
                        }
                    }
                    onBlur?.(e);
                }}
                {...rest}
            />
        );
    },
);
