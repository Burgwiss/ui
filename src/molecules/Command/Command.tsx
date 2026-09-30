import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { cn } from '../../lib/cn';

/**
 * A filterable, keyboard-navigable command list (built on cmdk): an input that filters
 * groups of items. Use it for a command palette or a searchable action list; it renders
 * inline, so use `CommandDialog` for the modal palette. Compose it from `CommandInput`,
 * `CommandList`, `CommandEmpty`, `CommandGroup` and `CommandItem`. Pass `label` for an
 * accessible name. Needs `cmdk`.
 *
 * @summary Filterable, keyboard-navigable list of grouped commands.
 */
function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            data-slot="command"
            className={cn(
                'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
                className,
            )}
            {...props}
        />
    );
}

/**
 * Modal command palette: a {@see Command} inside a centered {@see Dialog}.
 * A visually-hidden title + description satisfy Radix's accessible-name
 * requirement without showing chrome — the input placeholder carries the
 * visible affordance. The host owns the `open`/`onOpenChange` state.
 */
function CommandDialog({
    title,
    description,
    closeLabel,
    children,
    className,
    shouldFilter,
    ...props
}: React.ComponentProps<typeof Dialog> & {
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
}) {
    return (
        <Dialog {...props}>
            <DialogContent closeLabel={closeLabel} className={cn('overflow-hidden p-0', className)}>
                <DialogHeader className="sr-only">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <Command
                    shouldFilter={shouldFilter}
                    className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
                >
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    );
}

/** The search field at the top; its `placeholder` is the visible hint and it needs an `aria-label`. */
function CommandInput({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
    return (
        <div
            data-slot="command-input-wrapper"
            className="flex items-center gap-2 border-b border-border px-3"
        >
            <Search className="size-4 shrink-0 opacity-50" aria-hidden="true" />
            <CommandPrimitive.Input
                data-slot="command-input"
                className={cn(
                    'flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                {...props}
            />
        </div>
    );
}

/** The scrollable listbox (max 300px high) that holds the empty message, groups and items. */
function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
    return (
        <CommandPrimitive.List
            data-slot="command-list"
            className={cn('max-h-[300px] overflow-x-hidden overflow-y-auto', className)}
            {...props}
        />
    );
}

/** Shown in place of the list when no item matches the input; pass the localised message as children. */
function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="command-empty"
            className="py-6 text-center text-sm"
            {...props}
        />
    );
}

/** A labelled group of items; `heading` is the visible group title. */
function CommandGroup({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            data-slot="command-group"
            className={cn(
                'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
                className,
            )}
            {...props}
        />
    );
}

/**
 * A divider between groups. Do not place it inside `CommandList`'s listbox when
 * the list must pass axe — `role=separator` is not an allowed child of a
 * listbox (aria-required-children); prefer separate groups with headings.
 */
function CommandSeparator({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            data-slot="command-separator"
            className={cn('-mx-1 h-px bg-border', className)}
            {...props}
        />
    );
}

/** One selectable entry; use `onSelect` to run it, `disabled` to grey it out, `value` to control what the filter matches. */
function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="command-item"
            className={cn(
                'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground',
                className,
            )}
            {...props}
        />
    );
}

export {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
};
