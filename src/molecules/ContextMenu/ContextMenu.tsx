import * as React from 'react';
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';
import { itemFocusRing } from '../../lib/itemFocus';

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
function ContextMenu({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
    return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

/** The area that opens the menu on right-click or long-press; use `asChild` to wrap your own element. */
const ContextMenuTrigger = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Trigger>
>(function ContextMenuTrigger(props, ref) {
    return <ContextMenuPrimitive.Trigger ref={ref} data-slot="context-menu-trigger" {...props} />;
});
ContextMenuTrigger.displayName = 'ContextMenuTrigger';

/** The floating menu panel (rendered in a portal); holds the items. */
const ContextMenuContent = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(function ContextMenuContent({ className, ...props }, ref) {
    return (
        <ContextMenuPrimitive.Portal>
            <ContextMenuPrimitive.Content
                ref={ref}
                data-slot="context-menu-content"
                className={cn(
                    'z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md',
                    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                    className,
                )}
                {...props}
            />
        </ContextMenuPrimitive.Portal>
    );
});
ContextMenuContent.displayName = 'ContextMenuContent';

/** One action in the menu; use `onSelect` to run it and `disabled` to grey it out. */
const ContextMenuItem = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
        /** `destructive` highlights the item in the destructive colour when focused, for delete-like actions. */
        tone?: 'default' | 'destructive';
    }
>(function ContextMenuItem({ className, tone = 'default', ...props }, ref) {
    return (
        <ContextMenuPrimitive.Item
            ref={ref}
            data-slot="context-menu-item"
            data-tone={tone}
            className={cn(
                'relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none select-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
                'data-[highlighted]:bg-muted',
                itemFocusRing.real,
                'data-[tone=destructive]:data-[highlighted]:bg-destructive data-[tone=destructive]:data-[highlighted]:text-destructive-foreground data-[tone=destructive]:data-[highlighted]:[&_svg]:text-destructive-foreground',
                'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        />
    );
});
ContextMenuItem.displayName = 'ContextMenuItem';

/** A thin divider between groups of items. */
const ContextMenuSeparator = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(function ContextMenuSeparator({ className, ...props }, ref) {
    return (
        <ContextMenuPrimitive.Separator
            ref={ref}
            data-slot="context-menu-separator"
            className={cn('-mx-1 my-1 h-px bg-border', className)}
            {...props}
        />
    );
});
ContextMenuSeparator.displayName = 'ContextMenuSeparator';

/** A non-interactive heading for a group of items. */
const ContextMenuLabel = React.forwardRef<
    React.ElementRef<typeof ContextMenuPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label>
>(function ContextMenuLabel({ className, ...props }, ref) {
    return (
        <ContextMenuPrimitive.Label
            ref={ref}
            data-slot="context-menu-label"
            className={cn('px-2 py-1.5 text-xs font-medium text-muted-foreground', className)}
            {...props}
        />
    );
});
ContextMenuLabel.displayName = 'ContextMenuLabel';

/** A shortcut hint at the right end of an item. Hidden from screen readers — aria-keyshortcuts carries it. */
function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="context-menu-shortcut"
            aria-hidden="true"
            className={cn('ml-auto pl-4 text-xs text-muted-foreground', className)}
            {...props}
        />
    );
}

export {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuTrigger,
};
