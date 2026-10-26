import { type ComponentProps } from 'react';
export interface SearchFieldProps extends Omit<ComponentProps<'input'>, 'type' | 'onChange' | 'value'> {
    /** The current text (controlled). */
    value: string;
    /** Called with the new text on every keystroke; receives the string, not the event. */
    onValueChange: (value: string) => void;
    /** Also used as the accessible name — a search box has no visible label. */
    placeholder: string;
    /**
     * Start as a small magnifier and open to full width when focused (by click,
     * Tab or a shortcut). It stays open while it holds a search and closes
     * again when left empty. Size the open field with `--search-width` (default 18rem).
     */
    collapsible?: boolean;
}
/**
 * A search input with a leading magnifier, for filtering a list or table. The placeholder
 * doubles as its accessible name, so it must always be passed and translated. Other input
 * attributes (name, autoFocus, ...) pass through; `type`, `onChange` and `value` are set here.
 * With `collapsible` it waits as a magnifier in a busy toolbar and slides open when used.
 * For picking a record from search results use `EntitySearchPicker`.
 *
 * @summary Compact search input with a magnifier icon; optionally collapses to just the icon.
 */
export declare function SearchField({ value, onValueChange, placeholder, collapsible, className, onFocus, onBlur, ...rest }: SearchFieldProps): import("react").JSX.Element;
