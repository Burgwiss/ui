import * as React from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
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
export declare const nativeSelectClass = "block w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:bg-input/30";
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
declare function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>): React.JSX.Element;
/** Groups related `SelectItem`s under an optional `SelectLabel`. */
declare const SelectGroup: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectGroupProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** Shows the chosen item's text inside the trigger; `placeholder` is what shows while nothing is chosen. */
declare const SelectValue: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectValueProps & React.RefAttributes<HTMLSpanElement>, "ref"> & React.RefAttributes<HTMLSpanElement>>;
/** The button that shows the current value and opens the list; give it an `id` so a `Label` can point at it. */
declare const SelectTrigger: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & {
    /** Kept for back-compat: both values currently render at the same height (`h-8`). */
    size?: "sm" | "default";
} & React.RefAttributes<HTMLButtonElement>>;
/** The arrow shown at the top of a long list to scroll up; `SelectContent` already renders it. */
declare const SelectScrollUpButton: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollUpButtonProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The arrow shown at the bottom of a long list to scroll down; `SelectContent` already renders it. */
declare const SelectScrollDownButton: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollDownButtonProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The floating list (in a portal, max 24rem high); positioned under the trigger and at least as wide by default. */
declare const SelectContent: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** A non-interactive heading for a `SelectGroup`. */
declare const SelectLabel: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** One choice; `value` (a non-empty string) is what `onValueChange` reports, `disabled` greys it out. */
declare const SelectItem: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** A thin divider between groups of items. */
declare const SelectSeparator: React.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton, };
