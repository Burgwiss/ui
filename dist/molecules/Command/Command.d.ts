import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Dialog } from '../Dialog';
/**
 * A filterable, keyboard-navigable command list (built on cmdk): an input that filters
 * groups of items. Use it for a command palette or a searchable action list; it renders
 * inline, so use `CommandDialog` for the modal palette. Compose it from `CommandInput`,
 * `CommandList`, `CommandEmpty`, `CommandGroup` and `CommandItem`. Pass `label` for an
 * accessible name. Needs `cmdk`.
 *
 * @summary Filterable, keyboard-navigable list of grouped commands.
 */
declare function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>): React.JSX.Element;
/**
 * Modal command palette: a {@see Command} inside a centered {@see Dialog}.
 * A visually-hidden title + description satisfy Radix's accessible-name
 * requirement without showing chrome — the input placeholder carries the
 * visible affordance. The host owns the `open`/`onOpenChange` state.
 */
declare function CommandDialog({ title, description, closeLabel, children, className, shouldFilter, ...props }: React.ComponentProps<typeof Dialog> & {
    /** Visually hidden dialog title (the accessible name); the app supplies it translated. */
    title: string;
    /** Visually hidden dialog description announced to screen readers. */
    description: string;
    /** Accessible name of the dialog's corner close button. */
    closeLabel: string;
    /** Extra classes for the dialog panel. */
    className?: string;
    /** Pass `false` when the item list is already filtered (e.g. server-side
     *  search) — otherwise cmdk re-filters on the input value and can hide
     *  valid matches whose displayed text doesn't contain the query. */
    shouldFilter?: boolean;
}): React.JSX.Element;
/** The search field at the top; its `placeholder` is the visible hint and it needs an `aria-label`. */
declare function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>): React.JSX.Element;
/** The scrollable listbox (max 300px high) that holds the empty message, groups and items. */
declare function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>): React.JSX.Element;
/** Shown in place of the list when no item matches the input; pass the localised message as children. */
declare function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>): React.JSX.Element;
/** A labelled group of items; `heading` is the visible group title. */
declare function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>): React.JSX.Element;
/**
 * A divider between groups. Do not place it inside `CommandList`'s listbox when
 * the list must pass axe — `role=separator` is not an allowed child of a
 * listbox (aria-required-children); prefer separate groups with headings.
 */
declare function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>): React.JSX.Element;
/** One selectable entry; use `onSelect` to run it, `disabled` to grey it out, `value` to control what the filter matches. */
declare function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>): React.JSX.Element;
export { Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, };
