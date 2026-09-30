import { Search } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Input } from '../../atoms/Input';
import { cn } from '../../lib/cn';

export interface SearchFieldProps extends Omit<
    ComponentProps<'input'>,
    'type' | 'onChange' | 'value'
> {
    /** The current text (controlled). */
    value: string;
    /** Called with the new text on every keystroke; receives the string, not the event. */
    onValueChange: (value: string) => void;
    /** Also used as the accessible name — a search box has no visible label. */
    placeholder: string;
}

/**
 * A search input with a leading magnifier, for filtering a list or table. The placeholder
 * doubles as its accessible name, so it must always be passed and translated. Other input
 * attributes (name, autoFocus, ...) pass through; `type`, `onChange` and `value` are set here.
 * For picking a record from search results use `EntitySearchPicker`.
 *
 * @summary Compact search input with a magnifier icon; the placeholder is also its accessible name.
 */
export function SearchField({
    value,
    onValueChange,
    placeholder,
    className,
    ...rest
}: SearchFieldProps) {
    return (
        <div className={cn('relative', className)}>
            <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
            />
            <Input
                {...rest}
                type="search"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
                className="h-8 w-full pl-8"
            />
        </div>
    );
}
