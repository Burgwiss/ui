import * as React from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

/**
 * A group of radio buttons where exactly one option can be chosen. Compose
 * `RadioGroup` with one `RadioGroupItem` per option, each with a unique `value`
 * and an `id` matching a `Label`. Give the group an `aria-label` or
 * `aria-labelledby`. Controlled with `value` + `onValueChange`, or uncontrolled with
 * `defaultValue`. For a compact, button-style single choice use `SegmentedChoice`;
 * for several choices use `Checkbox`.
 *
 * @summary Single-choice group; compose with RadioGroupItem, one per option.
 */
const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(function RadioGroup({ className, ...props }, ref) {
    return (
        <RadioGroupPrimitive.Root
            ref={ref}
            data-slot="radio-group"
            className={cn('grid gap-2', className)}
            {...props}
        />
    );
});
RadioGroup.displayName = 'RadioGroup';

/**
 * One radio button inside a `RadioGroup`. Needs a unique `value` and an `id` that a
 * `Label` points to with `htmlFor`; set `disabled` to make one option unavailable.
 */
const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function RadioGroupItem({ className, ...props }, ref) {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            data-slot="radio-group-item"
            className={cn(
                'aspect-square size-4 rounded-full border border-input text-primary shadow-sm',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <span className="size-2 rounded-full bg-primary" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
});
RadioGroupItem.displayName = 'RadioGroupItem';

// The segmented single-choice control moved to `@/Components/ui/segmented-choice`
// (SegmentedChoice) — a distinct, named component that visually matches
// SegmentedTabs, instead of a surprising second look hidden in this file.

export { RadioGroup, RadioGroupItem };
