import { Check, Filter } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../DropdownMenu';
import { cn } from '../../lib/cn';

export interface GridColumnFilterProps {
    /** The visible column heading text, already translated. */
    title: string;
    /** The filter choices; `value` is what `onChange` reports, `label` is the visible text. */
    options: { value: string; label: string }[];
    /** '' = no filter. */
    value: string;
    /** Called with the chosen option's `value`, or `''` when "all" is chosen. */
    onChange: (value: string) => void;
    /** Text of the first menu entry that clears the filter, e.g. `Alle`. */
    allLabel: string;
    /** Accessible name of the funnel button and the menu's heading, e.g. `Status filtern`. */
    filterLabel: string;
}

/**
 * A column header that filters its own column: the title, then a funnel that
 * opens the choices. The funnel fills in while a choice is active. Use it inside a table
 * header cell for a single-choice filter; it holds no state, so the app keeps `value`.
 *
 * @summary Table column heading with a funnel button that opens a single-choice filter menu.
 */
export function GridColumnFilter({
    title,
    options,
    value,
    onChange,
    allLabel,
    filterLabel,
}: GridColumnFilterProps) {
    const active = value !== '';
    return (
        <span className="inline-flex items-center gap-1">
            <span>{title}</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label={filterLabel}
                        className={cn(
                            'inline-flex size-6 items-center justify-center rounded transition-colors hover:bg-background',
                            active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Filter
                            className={cn('size-3.5', active && 'fill-current')}
                            aria-hidden="true"
                        />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="tracking-normal normal-case">
                    <DropdownMenuLabel>{filterLabel}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {[{ value: '', label: allLabel }, ...options].map((o) => (
                        <DropdownMenuItem
                            key={o.value || '__all'}
                            onSelect={() => onChange(o.value)}
                        >
                            <Check
                                className={cn(
                                    'size-4',
                                    value === o.value ? 'opacity-100' : 'opacity-0',
                                )}
                                aria-hidden="true"
                            />
                            {o.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </span>
    );
}
