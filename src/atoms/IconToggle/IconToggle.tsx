import { forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../atoms/Tooltip';
import { cn } from '../../lib/cn';

interface IconToggleProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children'> {
    /**
     * Accessible name — required. Rendered as tooltip content AND set as
     * `aria-label`, because tooltip content is not reliably announced.
     * Supplied by the app, in its own language.
     */
    label: string;
    /** Lucide (or other) icon element. */
    icon: ReactNode;
    /** The value this item selects in its group. */
    value: string;
    /**
     * The Radix toggle-item primitive the surrounding group is built from.
     *
     * A toolbar's group needs `Toolbar.ToggleItem` and a standalone group needs
     * `ToggleGroup.Item` — they are not interchangeable, because Radix rovings
     * focus only over its OWN item primitives and the wrong one silently
     * becomes a separate tab stop. Passing it in keeps one component for the
     * concept rather than one per container.
     */
    as: ElementType;
}

/**
 * An icon-only item inside a toggle group (e.g. text alignment left, center, right).
 * It is the `ToggleGroup` sibling of `IconButton`: use `IconButton` for a plain
 * action and this for an option that can be on or off. The required `label` is both the
 * `aria-label` and the tooltip, and `value` is what the item selects in its group.
 * Pass the Radix item primitive of the surrounding group as `as`
 * (`ToggleGroup.Item`, or `Toolbar.ToggleItem` inside a toolbar); the pressed look
 * follows `aria-checked` / `aria-pressed`.
 *
 * A native `title` is not a tooltip (unstyled, OS-timed, absent on touch), so every
 * icon toggle goes through here and the accessible name and the visible hover label
 * are the same string by construction.
 *
 * The provider is self-contained, exactly as in `IconButton`: Radix allows
 * nested providers, so this works inside the studio's global one and also in a
 * unit test that renders the item alone.
 *
 * @summary Icon-only item for a toggle group; its `label` is both the aria-label and the tooltip.
 */
export const IconToggle = forwardRef<HTMLButtonElement, IconToggleProps>(function IconToggle(
    { label, icon, value, as: Item, className, ...rest },
    ref,
) {
    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Item
                        ref={ref}
                        value={value}
                        aria-label={label}
                        className={cn(
                            'inline-flex min-h-9 items-center justify-center rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors',
                            // 44px touch target on coarse pointers only, as in
                            // `IconButton` — no desktop density loss.
                            'pointer-coarse:min-h-11 pointer-coarse:min-w-11',
                            'hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            // `TooltipTrigger asChild` writes its own `data-state`
                            // (open/closed) over the toggle's `on`/`off`, so the
                            // pressed look keys off ARIA instead: `aria-checked` in a
                            // single-select group, `aria-pressed` in a multi one.
                            'aria-checked:bg-primary aria-checked:text-primary-foreground aria-checked:shadow-sm',
                            'aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:shadow-sm',
                            className,
                        )}
                        {...rest}
                    >
                        {icon}
                    </Item>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});
