import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';

/** Shared pill look for both chip modes (single + multi). */
const chipClass = (active: boolean) =>
    cn(
        'inline-flex min-h-11 shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 text-sm transition-colors',
        active
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground',
    );

type ChipSingleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Selection mode: leave unset (or `false`) for a single-select `aria-pressed` button. */
    multi?: false;
    /** Active state for the single-select button (drives `aria-pressed`). */
    selected?: boolean;
};

type ChipMultiProps = {
    /** Multi-select: a real checkbox (space toggles), for free-form tag pickers. */
    multi: true;
    /** Stable id so the visually-hidden checkbox + label associate. */
    id: string;
    /** Whether the chip is ticked (controlled). */
    checked: boolean;
    /** Called with the new checked state when the user toggles the chip. */
    onChange: (next: boolean) => void;
    /** Accessible name override; defaults to `children` when it is text. */
    ariaLabel?: string;
    /** The chip text, in the app's language. */
    children?: React.ReactNode;
    /** Extra classes merged onto the chip. */
    className?: string;
};

export type ChipProps = ChipSingleProps | ChipMultiProps;

/**
 * A selectable pill for filters and tag pickers. Use it to narrow a list (a
 * category row) or to pick free-form tags. For a non-interactive label use `Badge`. One
 * component, two selection modes that
 * share the exact same pill look + leading check glyph (non-colour-alone, so the
 * active state survives forced-colors):
 *
 *  - single (default): an `aria-pressed` `<button>`. Compose inside `<ChipRow>`
 *    for a scrollable, keyboard-navigable row. `<Chip selected onClick={…}>`.
 *  - multi (`multi`): a real `<input type="checkbox">` (space toggles) inside a
 *    `<label>`, for free-form multi-select. `<Chip multi id checked onChange>`.
 *
 * (`ToggleChip` is now a thin back-compat alias of `<Chip multi>`.)
 *
 * @summary Selectable filter pill: a single-select button, or a multi-select checkbox with `multi`.
 */
export function Chip(props: ChipProps) {
    if (props.multi) {
        const { id, checked, onChange, ariaLabel, children, className } = props;
        return (
            <label
                htmlFor={id}
                data-state={checked ? 'on' : 'off'}
                className={cn(
                    chipClass(checked),
                    'cursor-pointer focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
                    className,
                )}
            >
                <input
                    id={id}
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    aria-label={ariaLabel}
                />
                {checked && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
                <span>{children}</span>
            </label>
        );
    }

    const { selected = false, children, className, ...rest } = props;
    return (
        <button
            type="button"
            data-chip=""
            data-state={selected ? 'on' : 'off'}
            aria-pressed={selected}
            className={cn(
                chipClass(selected),
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none',
                className,
            )}
            {...rest}
        >
            {selected && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
            <span>{children}</span>
        </button>
    );
}

interface ChipRowProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Accessible group name (a translated string supplied by the caller). */
    ariaLabel?: string;
}

/**
 * Horizontal, scroll-snapping row of single-select `<Chip>`s with a hidden
 * scrollbar and roving keyboard navigation (arrow keys, Home and End move focus; only one
 * chip is in the tab order at a time). Use it as the container for a mobile-first
 * filter row; it needs single-select chips (not `multi`).
 */
export function ChipRow({ children, ariaLabel, className, ...props }: ChipRowProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [active, setActive] = React.useState(0);

    const chips = React.useCallback(
        (): HTMLButtonElement[] =>
            Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[data-chip]') ?? []),
        [],
    );

    // Roving tab order: the active chip is the only tab stop. Re-applied every
    // render so a changing chip set stays consistent.
    React.useEffect(() => {
        chips().forEach((chip, i) => {
            chip.tabIndex = i === active ? 0 : -1;
        });
    });

    function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        const items = chips();
        if (items.length === 0) {
            return;
        }
        let next = active;
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                next = Math.min(items.length - 1, active + 1);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                next = Math.max(0, active - 1);
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = items.length - 1;
                break;
            default:
                return;
        }
        e.preventDefault();
        setActive(next);
        items[next]?.focus();
    }

    function onFocus(e: React.FocusEvent<HTMLDivElement>) {
        const target: Node = e.target;
        const idx = chips().findIndex((chip) => chip === target);
        if (idx >= 0) {
            setActive(idx);
        }
    }

    return (
        // role="group" + arrow-key handler is the roving-tabindex composite
        // pattern (a row of focusable chips); the listener belongs on the
        // container, so the non-interactive-element rule doesn't apply here.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
            ref={ref}
            role="group"
            aria-label={ariaLabel}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            className={cn(
                'flex snap-x [scrollbar-width:none] gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
