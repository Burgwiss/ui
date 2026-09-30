import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '../../lib/cn';

/**
 * A segmented pill control for picking one FORM VALUE that you submit (e.g. a billing mode).
 * It is the radiogroup-semantics twin of `SegmentedTabs` (which switches CONTENT):
 * same pill look, but it carries `role="radiogroup"`/`radio` and announces
 * "X of N selected" rather than "tab N". Reach for this when the choice is a
 * value you submit (e.g. a billing mode); reach for `SegmentedTabs` when it
 * swaps a panel of content.
 *
 * Built on Radix RadioGroup, so it inherits roving focus + arrow-key navigation.
 * Visual deliberately matches `SegmentedTabs` (raised card track, `bg-primary`
 * active pill) so the two segmented controls read as one family.
 * Give the group an accessible name (`aria-label` or `aria-labelledby`); control it with
 * `value` and `onValueChange`, or start it with `defaultValue`. For a long list of choices
 * use `Select`.
 *
 * @summary Segmented pill control for choosing one form value, with radio-group semantics.
 */
const SegmentedChoice = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(function SegmentedChoice({ className, ...props }, ref) {
    return (
        <RadioGroupPrimitive.Root
            ref={ref}
            data-slot="segmented-choice"
            className={cn(
                'flex w-full gap-1 rounded-lg border border-border bg-card p-1 shadow-sm',
                className,
            )}
            {...props}
        />
    );
});
SegmentedChoice.displayName = 'SegmentedChoice';

/** One segment; `value` is what the group reports when it is chosen, `disabled` greys it out. */
const SegmentedChoiceItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(function SegmentedChoiceItem({ className, children, ...props }, ref) {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            data-slot="segmented-choice-item"
            className={cn(
                'inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors',
                'hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-sm',
                'disabled:pointer-events-none disabled:opacity-50',
                className,
            )}
            {...props}
        >
            {children}
        </RadioGroupPrimitive.Item>
    );
});
SegmentedChoiceItem.displayName = 'SegmentedChoiceItem';

export { SegmentedChoice, SegmentedChoiceItem };
