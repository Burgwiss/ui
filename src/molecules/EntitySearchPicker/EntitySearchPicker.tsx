import { ChevronsUpDown, Loader2 } from 'lucide-react';
import * as React from 'react';

import { Button } from '../../atoms/Button';
import { Command, CommandInput, CommandItem, CommandList } from '../Command';
import { Popover, PopoverContent, PopoverTrigger } from '../Popover';

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

const DEFAULT_DEBOUNCE_MS = 250;

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
export function EntitySearchPicker<T>({
    onSearch,
    onSelect,
    getKey,
    renderRow,
    triggerLabel,
    placeholder,
    labels,
    disabled = false,
    id,
    triggerClassName,
    debounceMs = DEFAULT_DEBOUNCE_MS,
}: EntitySearchPickerProps<T>) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState('');
    const [results, setResults] = React.useState<T[]>([]);
    const [hasMore, setHasMore] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    // `onSearch` is usually an inline arrow. Reading it through a ref keeps it out
    // of the effect's dependencies — otherwise every render (including the one
    // caused by the results arriving) would restart the search, forever.
    const onSearchRef = React.useRef(onSearch);
    React.useEffect(() => {
        onSearchRef.current = onSearch;
    });

    // Debounced search. Re-runs on every query change while open.
    // An AbortController drops superseded responses so an out-of-order reply
    // can't clobber the results of a later keystroke.
    React.useEffect(() => {
        if (!open) {
            return;
        }

        const controller = new AbortController();
        const handle = window.setTimeout(() => {
            setLoading(true);
            onSearchRef
                .current(query, controller.signal)
                .then((found) => {
                    // A superseded / closed request must not clobber the results
                    // of a later keystroke, even if its promise still resolves.
                    if (controller.signal.aborted) {
                        return;
                    }
                    const list = Array.isArray(found) ? { items: found, hasMore: false } : found;
                    setResults(list.items);
                    setHasMore(list.hasMore ?? false);
                })
                .catch(() => {
                    if (controller.signal.aborted) {
                        return;
                    }
                    setResults([]);
                    setHasMore(false);
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setLoading(false);
                    }
                });
        }, debounceMs);

        return () => {
            controller.abort();
            window.clearTimeout(handle);
        };
    }, [open, query, debounceMs]);

    const handleSelect = (item: T) => {
        onSelect(item);
        setOpen(false);
        setQuery('');
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                    setQuery('');
                }
            }}
        >
            <PopoverTrigger asChild>
                <Button
                    id={id}
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    className={triggerClassName}
                >
                    {triggerLabel}
                    <ChevronsUpDown className="size-4 opacity-50" aria-hidden="true" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
                <Command shouldFilter={false} label={placeholder}>
                    <CommandInput
                        value={query}
                        onValueChange={setQuery}
                        placeholder={placeholder}
                        // cmdk wires aria-labelledby to its own (visually hidden) label,
                        // which `label` on <Command> fills; the explicit aria-label is
                        // kept as a second source of the same name.
                        aria-label={placeholder}
                    />
                    <CommandList>
                        {/* Status nodes are polite live regions (role=status) so
                            screen readers hear "searching" / "no matches" / "refine"
                            after a keystroke; the result rows are NOT announced
                            wholesale (would read out every name). */}
                        {loading ? (
                            <div
                                role="status"
                                className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"
                            >
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                {labels.searching}
                            </div>
                        ) : results.length === 0 ? (
                            <div
                                role="status"
                                className="py-6 text-center text-sm text-muted-foreground"
                            >
                                {labels.empty}
                            </div>
                        ) : (
                            <>
                                {results.map((item) => (
                                    <CommandItem
                                        key={getKey(item)}
                                        value={String(getKey(item))}
                                        onSelect={() => handleSelect(item)}
                                        className="flex flex-col items-start gap-0.5"
                                    >
                                        {renderRow(item)}
                                    </CommandItem>
                                ))}
                                {hasMore ? (
                                    <p
                                        role="status"
                                        className="px-3 py-2 text-xs text-muted-foreground"
                                    >
                                        {labels.refine}
                                    </p>
                                ) : null}
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
