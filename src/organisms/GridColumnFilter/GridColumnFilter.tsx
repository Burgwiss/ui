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
    title: string;
    options: { value: string; label: string }[];
    /** '' = no filter. */
    value: string;
    onChange: (value: string) => void;
    allLabel: string;
    filterLabel: string;
}

/**
 * A column header that filters its own column: the title, then a funnel that
 * opens the choices. The funnel fills in while a choice is active.
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
