import * as React from 'react';
/** What `onSearch` resolves to: the matches, and whether more exist than were returned. */
export interface EntitySearchResult<T> {
    items: T[];
    /** True when the list is truncated — shows the `labels.refine` hint. */
    hasMore?: boolean;
}
export interface EntitySearchPickerLabels {
    /** Polite status while a search is in flight. */
    searching: string;
    /** Status when the search returned nothing. */
    empty: string;
    /** Hint shown under the results when `hasMore` is true ("refine your search"). */
    refine: string;
}
export interface EntitySearchPickerProps<T> {
    /**
     * Runs the search for `query` — the component never fetches by itself.
     * Called (debounced) on open and on every query change. Aborting `signal`
     * means the answer is no longer wanted; a rejection is treated as "no
     * results". Resolve a plain array, or `{ items, hasMore }`.
     */
    onSearch: (query: string, signal: AbortSignal) => Promise<T[] | EntitySearchResult<T>>;
    /** Called with the chosen item; the popover then closes and the query is cleared. */
    onSelect: (item: T) => void;
    /** Stable React key + `CommandItem` value for an item. */
    getKey: (item: T) => string | number;
    /** Render an item's row content (e.g. name + email, or title + slug). */
    renderRow: (item: T) => React.ReactNode;
    /** The trigger button's inner content — a static label, or a
     *  selected-value-or-placeholder expression. */
    triggerLabel: React.ReactNode;
    /** Search input placeholder + its accessible name. */
    placeholder: string;
    /** The three status texts, in the app's language. */
    labels: EntitySearchPickerLabels;
    /** Disables the trigger button so the popover cannot open. Default false. */
    disabled?: boolean;
    /** Id of the trigger button, so an outside `<Label htmlFor>` can point at it. */
    id?: string;
    /** Extra classes on the trigger Button (e.g. `w-full justify-between`). */
    triggerClassName?: string;
    /** Wait this long after the last keystroke before searching. Default 250. */
    debounceMs?: number;
}
/**
 * A search-as-you-type picker for choosing one record (a person, a course) from a large
 * or remote set: a trigger button opens a popover with a search input and result rows. Use it
 * when the options come from a search; for a short static list use `Select`, and for a
 * long list of plain strings use `Combobox`.
 * It calls `onSearch` (debounced), drops superseded responses via an
 * AbortController, and shows polite status regions (searching / empty /
 * refine).
 *
 * It does not fetch: the app supplies `onSearch`, so the same picker serves a
 * user lookup, a course lookup, or an in-memory filter. Generic over the result
 * row — an app wraps it with its own `renderRow` + trigger.
 *
 * @summary Popover with debounced search-as-you-type for picking one record from a remote or large set.
 */
export declare function EntitySearchPicker<T>({ onSearch, onSelect, getKey, renderRow, triggerLabel, placeholder, labels, disabled, id, triggerClassName, debounceMs, }: EntitySearchPickerProps<T>): React.JSX.Element;
