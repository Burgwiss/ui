interface ComboboxProps {
    /** Id of the text input, so an outside `<Label htmlFor>` can point at it. */
    id: string;
    /** The selected option (controlled); shown in the input while it is not being edited. */
    value: string;
    /** The choices. Typing filters them by case-insensitive substring; the option text is also its value. */
    options: string[];
    /** Called with the chosen option when one is picked; typing alone never calls it. */
    onChange: (value: string) => void;
    /** Placeholder of the input. Falls back to `searchPlaceholder`. */
    placeholder?: string;
    /** Placeholder when `placeholder` is absent; also the accessible name of the chevron button (falling back to `placeholder`, then `emptyLabel`). */
    searchPlaceholder?: string;
    /** Message shown in the list when no option matches the typed text. */
    emptyLabel: string;
    /** Marks the input `aria-invalid` and gives it a destructive border. */
    ariaInvalid?: boolean;
    /** Intended `aria-describedby` for the input; currently overridden by Headless UI's own computed value, so it does not reach the DOM. */
    ariaDescribedby?: string;
}
/**
 * A searchable single-choice field over a list of strings: type to filter, pick one option.
 * Use it when the list is too long for a plain `Select` (time zones, countries); for a
 * short list use `Select`, and for choosing records that need a lookup use `EntitySearchPicker`.
 * The app passes every string (`placeholder`, `searchPlaceholder`, `emptyLabel`). Needs
 * `@headlessui/react`.
 *
 * @summary Searchable single-choice field over a list of strings.
 */
export declare function Combobox({ id, value, options, onChange, placeholder, searchPlaceholder, emptyLabel, ariaInvalid, ariaDescribedby, }: ComboboxProps): import("react").JSX.Element;
export {};
