import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

import { cn } from '../../lib/cn';

/**
 * The ONE class string for a native `<select>`.
 *
 * Some surfaces deliberately keep the native control (it opens the OS picker
 * on mobile, which is better for long/hierarchical option lists) — but a
 * hand-copied class string per call site is how four different-looking
 * dropdowns end up on one form. Those sites import this constant so the
 * native select matches the `Input` sitting next to it, focus ring included.
 *
 * Reach for the Radix `Select` below for bounded, short choice lists; use
 * this only when the native picker is the deliberate choice.
 */
export const nativeSelectClass =
    'block w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30';

/**
 * A styled listbox for choosing one value from a short, bounded list. Use it inside forms
 * next to `Input`; for a long or searchable list use `Combobox`, and for a native OS picker
 * on phones use a plain `<select>` with `nativeSelectClass`. Compose it from `SelectTrigger`
 * (with a `SelectValue`) and `SelectContent` holding `SelectItem`s, optionally grouped.
 * Control it with `value` and `onValueChange`, or start it with `defaultValue`; pair the
 * trigger with a `Label` through its `id`. The app passes every visible string, including the
 * `SelectValue` placeholder.
 *
 * @summary Styled single-choice dropdown for short, bounded lists; compose trigger, content and items.
 */
function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

/** Groups related `SelectItem`s under an optional `SelectLabel`. */
const SelectGroup = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Group>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>
>(function SelectGroup({ ...props }, ref) {
    return <SelectPrimitive.Group ref={ref} data-slot="select-group" {...props} />;
});
SelectGroup.displayName = 'SelectGroup';

/** Shows the chosen item's text inside the trigger; `placeholder` is what shows while nothing is chosen. */
const SelectValue = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Value>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(function SelectValue({ ...props }, ref) {
    return <SelectPrimitive.Value ref={ref} data-slot="select-value" {...props} />;
});
SelectValue.displayName = 'SelectValue';

/** The button that shows the current value and opens the list; give it an `id` so a `Label` can point at it. */
const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
        /** Kept for back-compat: both values currently render at the same height (`h-8`). */
        size?: 'sm' | 'default';
    }
>(function SelectTrigger({ className, children, size = 'default', ...props }, ref) {
    return (
        <SelectPrimitive.Trigger
            ref={ref}
            data-slot="select-trigger"
            data-size={size}
            // h-8 is the canonical form-control height — matches Input and the
            // default Button so Select/Input/Button align in a row. The `size`
            // prop is kept for back-compat; both values now render at h-8.
            className={cn(
                'flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:ring-2 focus:ring-ring focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground [&>span]:line-clamp-1',
                className,
            )}
            {...props}
        >
            {children}
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="size-4 opacity-50" aria-hidden="true" />
            </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
    );
});
SelectTrigger.displayName = 'SelectTrigger';

/** The arrow shown at the top of a long list to scroll up; `SelectContent` already renders it. */
const SelectScrollUpButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(function SelectScrollUpButton({ className, ...props }, ref) {
    return (
        <SelectPrimitive.ScrollUpButton
            ref={ref}
            data-slot="select-scroll-up-button"
            className={cn('flex cursor-default items-center justify-center py-1', className)}
            {...props}
        >
            <ChevronUp className="size-4" aria-hidden="true" />
        </SelectPrimitive.ScrollUpButton>
    );
});
SelectScrollUpButton.displayName = 'SelectScrollUpButton';

/** The arrow shown at the bottom of a long list to scroll down; `SelectContent` already renders it. */
const SelectScrollDownButton = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(function SelectScrollDownButton({ className, ...props }, ref) {
    return (
        <SelectPrimitive.ScrollDownButton
            ref={ref}
            data-slot="select-scroll-down-button"
            className={cn('flex cursor-default items-center justify-center py-1', className)}
            {...props}
        >
            <ChevronDown className="size-4" aria-hidden="true" />
        </SelectPrimitive.ScrollDownButton>
    );
});
SelectScrollDownButton.displayName = 'SelectScrollDownButton';

/** The floating list (in a portal, max 24rem high); positioned under the trigger and at least as wide by default. */
const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, position = 'popper', ...props }, ref) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                ref={ref}
                data-slot="select-content"
                position={position}
                className={cn(
                    'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
                    position === 'popper' &&
                        'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
                    className,
                )}
                {...props}
            >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                    className={cn(
                        'p-1',
                        position === 'popper' &&
                            'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]',
                    )}
                >
                    {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
});
SelectContent.displayName = 'SelectContent';

/** A non-interactive heading for a `SelectGroup`. */
const SelectLabel = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...props }, ref) {
    return (
        <SelectPrimitive.Label
            ref={ref}
            data-slot="select-label"
            className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}
            {...props}
        />
    );
});
SelectLabel.displayName = 'SelectLabel';

/** One choice; `value` (a non-empty string) is what `onValueChange` reports, `disabled` greys it out. */
const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
    return (
        <SelectPrimitive.Item
            ref={ref}
            data-slot="select-item"
            className={cn(
                'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        >
            <span className="absolute right-2 flex size-4 items-center justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check className="size-4" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
});
SelectItem.displayName = 'SelectItem';

/** A thin divider between groups of items. */
const SelectSeparator = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
    return (
        <SelectPrimitive.Separator
            ref={ref}
            data-slot="select-separator"
            className={cn('-mx-1 my-1 h-px bg-border', className)}
            {...props}
        />
    );
});
SelectSeparator.displayName = 'SelectSeparator';

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
};
