import * as React from 'react';
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';
/**
 * The right-click menu (Radix ContextMenu), styled like DropdownMenu so the
 * two read as one family. Use it for secondary shortcuts on a region or row
 * (opened by right-click or long-press); it is not discoverable, so every action must also
 * exist elsewhere, and for a menu opened by a visible button use `DropdownMenu`.
 * Compose it from `ContextMenuTrigger` (the area) and `ContextMenuContent` holding
 * `ContextMenuItem`s, `ContextMenuLabel`s and `ContextMenuSeparator`s.
 *
 * @summary Right-click menu, styled like DropdownMenu, for secondary actions on a region.
 */
declare function ContextMenu({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Root>): React.JSX.Element;
/** The area that opens the menu on right-click or long-press; use `asChild` to wrap your own element. */
declare const ContextMenuTrigger: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuTriggerProps & React.RefAttributes<HTMLSpanElement>, "ref"> & React.RefAttributes<HTMLSpanElement>>;
/** The floating menu panel (rendered in a portal); holds the items. */
declare const ContextMenuContent: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** One action in the menu; use `onSelect` to run it and `disabled` to grey it out. */
declare const ContextMenuItem: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuItemProps & React.RefAttributes<HTMLDivElement>, "ref"> & {
    /** `destructive` highlights the item in the destructive colour when focused, for delete-like actions. */
    tone?: "default" | "destructive";
} & React.RefAttributes<HTMLDivElement>>;
/** A thin divider between groups of items. */
declare const ContextMenuSeparator: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuSeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** A non-interactive heading for a group of items. */
declare const ContextMenuLabel: React.ForwardRefExoticComponent<Omit<ContextMenuPrimitive.ContextMenuLabelProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** A shortcut hint at the right end of an item. Hidden from screen readers — aria-keyshortcuts carries it. */
declare function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>): React.JSX.Element;
export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger, };
