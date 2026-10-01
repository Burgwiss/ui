import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import * as React from 'react';
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
declare const SegmentedChoice: React.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** One segment; `value` is what the group reports when it is chosen, `disabled` greys it out. */
declare const SegmentedChoiceItem: React.ForwardRefExoticComponent<Omit<RadioGroupPrimitive.RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { SegmentedChoice, SegmentedChoiceItem };
