import * as React from 'react';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
/**
 * A menu of actions opened by a visible trigger button (Radix DropdownMenu): row actions,
 * "more" menus, column toggles. For a right-click menu use `ContextMenu`; for choosing one
 * value into a form field use `Select`; for free content in a floating panel use `Popover`.
 * Compose it from `DropdownMenuTrigger` and `DropdownMenuContent` holding items, checkbox or
 * radio items, labels, separators and sub-menus. An icon-only trigger needs an `aria-label`
 * (see `IconButton`); the app passes every visible string.
 *
 * @summary Menu of actions opened by a trigger button, with items, checkbox and radio items and sub-menus.
 */
declare function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>): React.JSX.Element;
/** The element that opens the menu; use `asChild` to wrap your own `Button`. */
declare const DropdownMenuTrigger: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** Renders its children into `document.body`; the content parts already include it. */
declare function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>): React.JSX.Element;
/** The floating menu panel (in a portal); `sideOffset` defaults to 6px and `align` positions it against the trigger. */
declare const DropdownMenuContent: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
    /** Render the menu inside this element instead of <body> — e.g. a fullscreen player, where anything outside it is invisible. */
    container?: HTMLElement | null;
} & React.RefAttributes<HTMLDivElement>>;
/** One action; use `onSelect` to run it (the menu closes afterwards) and `disabled` to grey it out. */
declare const DropdownMenuItem: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** An item with a check mark, for a toggle; control it with `checked` and `onCheckedChange`. */
declare const DropdownMenuCheckboxItem: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuCheckboxItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** Groups `DropdownMenuRadioItem`s so exactly one is selected; control it with `value` and `onValueChange`. */
declare function DropdownMenuRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>): React.JSX.Element;
/** One choice inside a `DropdownMenuRadioGroup`; `value` identifies it. */
declare const DropdownMenuRadioItem: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuRadioItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** Wraps a `DropdownMenuSubTrigger` and `DropdownMenuSubContent` into a nested menu. */
declare function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>): React.JSX.Element;
/** The item that opens a nested menu; shows a chevron at its right end. */
declare const DropdownMenuSubTrigger: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubTriggerProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The panel of a nested menu, opened by its `DropdownMenuSubTrigger`. */
declare const DropdownMenuSubContent: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** A shortcut hint at the right end of an item. Hidden from screen readers — aria-keyshortcuts carries it. */
declare function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>): React.JSX.Element;
/** A non-interactive, uppercase heading for a group of items. */
declare const DropdownMenuLabel: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** A thin divider between groups of items. */
declare const DropdownMenuSeparator: React.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, };
