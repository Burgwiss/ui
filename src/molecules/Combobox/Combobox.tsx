import {
    Combobox as HuiCombobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '../../lib/cn';
import { itemFocusRing } from '../../lib/itemFocus';

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
export function Combobox({
    id,
    value,
    options,
    onChange,
    placeholder,
    searchPlaceholder,
    emptyLabel,
    ariaInvalid,
    ariaDescribedby,
}: ComboboxProps) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q === '') {
            return options;
        }
        return options.filter((o) => o.toLowerCase().includes(q));
    }, [query, options]);

    return (
        <HuiCombobox
            value={value}
            onChange={(next: string | null) => {
                if (next !== null) {
                    onChange(next);
                }
            }}
            immediate
        >
            <div className="relative">
                <ComboboxInput
                    id={id}
                    aria-invalid={ariaInvalid ? true : undefined}
                    // NOTE: Headless UI computes `aria-describedby` itself (from its
                    // own `Description` parts) and its value wins over this one, so
                    // this prop currently does not reach the DOM. Kept as in the
                    // original component.
                    aria-describedby={ariaDescribedby}
                    displayValue={(v: string) => v}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder ?? searchPlaceholder}
                    className={cn(
                        'block w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-foreground shadow-sm focus:border-ring focus:ring-2 focus:ring-ring focus:outline-none',
                        'aria-[invalid=true]:border-destructive',
                    )}
                />
                <ComboboxButton
                    className="absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground focus:outline-none focus-visible:text-foreground"
                    // `searchPlaceholder` is OPTIONAL, so this button had no
                    // accessible name at all whenever a caller omitted it — an
                    // icon-only control with nothing to announce. Found by real-DOM
                    // axe (`button-name`) when the combobox first went into a
                    // style book.
                    aria-label={searchPlaceholder ?? placeholder ?? emptyLabel}
                >
                    <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
                </ComboboxButton>
                <ComboboxOptions
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card py-1 text-sm shadow-md focus:outline-none"
                    transition
                >
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-muted-foreground">{emptyLabel}</div>
                    ) : (
                        filtered.map((option) => (
                            <ComboboxOption
                                key={option}
                                value={option}
                                className={cn(
                                    'group flex cursor-pointer items-center gap-2 px-3 py-2 text-foreground data-[focus]:bg-accent data-[focus]:text-accent-foreground',
                                    itemFocusRing.headless,
                                )}
                            >
                                <Check
                                    className="h-4 w-4 opacity-0 group-data-[selected]:opacity-100"
                                    aria-hidden="true"
                                />
                                <span>{option}</span>
                            </ComboboxOption>
                        ))
                    )}
                </ComboboxOptions>
            </div>
        </HuiCombobox>
    );
}
