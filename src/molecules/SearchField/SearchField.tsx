import { Search } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Input } from '../../atoms/Input';
import { cn } from '../../lib/cn';

export interface SearchFieldProps extends Omit<
    ComponentProps<'input'>,
    'type' | 'onChange' | 'value'
> {
    value: string;
    onValueChange: (value: string) => void;
    /** Also used as the accessible name — a search box has no visible label. */
    placeholder: string;
}

/** A search input with a leading magnifier. The placeholder doubles as its label. */
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
