import { Search } from 'lucide-react';
import { useState, type ComponentProps } from 'react';

import { Input } from '../../atoms/Input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../atoms/Tooltip';
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
export function SearchField({
    value,
    onValueChange,
    placeholder,
    collapsible = false,
    className,
    onFocus,
    onBlur,
    ...rest
}: SearchFieldProps) {
    const [focused, setFocused] = useState(false);
    const [hint, setHint] = useState(false);
    const expanded = !collapsible || focused || value !== '';

    const field = (
        <div
            data-expanded={expanded ? '' : undefined}
            className={cn(
                'relative',
                collapsible && [
                    'w-8 shrink-0 transition-[width] duration-200 ease-out motion-reduce:transition-none',
                    'data-expanded:w-[var(--search-width,18rem)]',
                ],
                className,
            )}
        >
            <Search
                className={cn(
                    'pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground',
                    !expanded && 'start-2 text-foreground',
                )}
                aria-hidden="true"
            />
            <Input
                {...rest}
                type="search"
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                onFocus={(e) => {
                    setFocused(true);
                    setHint(false);
                    onFocus?.(e);
                }}
                onBlur={(e) => {
                    setFocused(false);
                    onBlur?.(e);
                }}
                placeholder={placeholder}
                aria-label={placeholder}
                className={cn(
                    'h-8 w-full ps-8',
                    !expanded &&
                        'cursor-pointer border-transparent pe-0 placeholder:text-transparent hover:bg-muted',
                )}
            />
        </div>
    );

    if (!collapsible) return field;
    // Small, it looks like an icon button — so it gets the icon button's tooltip.
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip open={hint && !expanded} onOpenChange={setHint}>
                <TooltipTrigger asChild>{field}</TooltipTrigger>
                <TooltipContent>{placeholder}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
