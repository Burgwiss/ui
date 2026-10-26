export interface ColorPickerProps {
    /** Id of the text input, so an outside `<Label htmlFor>` can point at it. */
    id: string;
    /** The current colour as an OKLCH string, e.g. `oklch(0.62 0.13 230)`. Controlled: the app keeps the state. */
    value: string;
    /** Called with an OKLCH string on every change, from the swatch (converted from hex) or from typing in the text field (passed through as typed, not validated). */
    onChange: (value: string) => void;
    /** Accessible name of the native colour swatch, in the app's language. */
    swatchAriaLabel: string;
    /** Marks the text input `aria-invalid`; set it when the app's validation rejects the value. */
    ariaInvalid?: boolean;
    /** Extra classes for the outer row. */
    className?: string;
}
/**
 * A colour field for theme tokens: a native colour swatch plus a text input, both editing the
 * same OKLCH string (e.g. `oklch(0.62 0.13 230)`, the colour space the theme tokens use). The
 * native swatch speaks hex, so the value is converted both ways; the text field takes OKLCH directly. Use it when a person has to choose a brand or theme colour; the swatch
 * shows black while the text is not a value it can parse. Pair it with a `Label`, since it
 * renders none of its own.
 *
 * @summary Native colour swatch plus text field that edit one OKLCH colour string.
 */
export declare function ColorPicker({ id, value, onChange, swatchAriaLabel, ariaInvalid, className, }: ColorPickerProps): import("react").JSX.Element;
