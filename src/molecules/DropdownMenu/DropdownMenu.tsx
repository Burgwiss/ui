import * as React from 'react';
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import { Check, ChevronRight, Circle } from 'lucide-react';

import { cn } from '../../lib/cn';

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
function DropdownMenu({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
    return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

/** The element that opens the menu; use `asChild` to wrap your own `Button`. */
const DropdownMenuTrigger = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(function DropdownMenuTrigger({ ...props }, ref) {
    return <DropdownMenuPrimitive.Trigger ref={ref} data-slot="dropdown-menu-trigger" {...props} />;
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

/** Renders its children into `document.body`; the content parts already include it. */
function DropdownMenuPortal({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
    return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

/** The floating menu panel (in a portal); `sideOffset` defaults to 6px and `align` positions it against the trigger. */
const DropdownMenuContent = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content> & {
        /** Render the menu inside this element instead of <body> — e.g. a fullscreen player, where anything outside it is invisible. */
        container?: HTMLElement | null;
    }
>(function DropdownMenuContent({ className, sideOffset = 6, container, ...props }, ref) {
    return (
        <DropdownMenuPortal container={container}>
            <DropdownMenuPrimitive.Content
                ref={ref}
                data-slot="dropdown-menu-content"
                sideOffset={sideOffset}
                className={cn(
                    'z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md',
                    // Motion dial (#1611, #1632) — same fallback numbers
                    // tw-animate-css already defaulted to (150ms, `ease`), so
                    // NULL / explicit-`default` renders byte-for-byte what this
                    // menu always rendered.
                    'duration-[var(--motion-duration,150ms)] ease-[var(--motion-ease,ease)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                    className,
                )}
                {...props}
            />
        </DropdownMenuPortal>
    );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

/** One action; use `onSelect` to run it (the menu closes afterwards) and `disabled` to grey it out. */
const DropdownMenuItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(function DropdownMenuItem({ className, ...props }, ref) {
    return (
        <DropdownMenuPrimitive.Item
            ref={ref}
            data-slot="dropdown-menu-item"
            className={cn(
                'relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground transition-colors outline-none select-none',
                'focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        />
    );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

/** An item with a check mark, for a toggle; control it with `checked` and `onCheckedChange`. */
const DropdownMenuCheckboxItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className, children, checked, ...props }, ref) {
    return (
        <DropdownMenuPrimitive.CheckboxItem
            ref={ref}
            data-slot="dropdown-menu-checkbox-item"
            checked={checked}
            className={cn(
                'relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm text-foreground transition-colors outline-none select-none',
                'focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        >
            <span className="absolute left-2 flex size-4 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Check className="size-4" aria-hidden="true" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.CheckboxItem>
    );
});
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

/** Groups `DropdownMenuRadioItem`s so exactly one is selected; control it with `value` and `onValueChange`. */
function DropdownMenuRadioGroup({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
    return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

/** One choice inside a `DropdownMenuRadioGroup`; `value` identifies it. */
const DropdownMenuRadioItem = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
    return (
        <DropdownMenuPrimitive.RadioItem
            ref={ref}
            data-slot="dropdown-menu-radio-item"
            className={cn(
                'relative flex cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm text-foreground transition-colors outline-none select-none',
                'focus:bg-muted focus:text-foreground data-[highlighted]:bg-muted data-[highlighted]:text-foreground',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className,
            )}
            {...props}
        >
            <span className="absolute left-2 flex size-4 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                    <Circle className="size-2 fill-current" aria-hidden="true" />
                </DropdownMenuPrimitive.ItemIndicator>
            </span>
            {children}
        </DropdownMenuPrimitive.RadioItem>
    );
});
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

/** Wraps a `DropdownMenuSubTrigger` and `DropdownMenuSubContent` into a nested menu. */
function DropdownMenuSub({ ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
    return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

/** The item that opens a nested menu; shows a chevron at its right end. */
const DropdownMenuSubTrigger = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
    return (
        <DropdownMenuPrimitive.SubTrigger
            ref={ref}
            data-slot="dropdown-menu-sub-trigger"
            className={cn(
                'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none select-none',
                'focus:bg-muted data-[highlighted]:bg-muted data-[state=open]:bg-muted',
                className,
            )}
            {...props}
        >
            {children}
            <ChevronRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
        </DropdownMenuPrimitive.SubTrigger>
    );
});
DropdownMenuSubTrigger.displayName = 'DropdownMenuSubTrigger';

/** The panel of a nested menu, opened by its `DropdownMenuSubTrigger`. */
const DropdownMenuSubContent = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(function DropdownMenuSubContent({ className, ...props }, ref) {
    return (
        <DropdownMenuPortal>
            <DropdownMenuPrimitive.SubContent
                ref={ref}
                data-slot="dropdown-menu-sub-content"
                className={cn(
                    'z-50 min-w-[10rem] overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md',
                    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
                    className,
                )}
                {...props}
            />
        </DropdownMenuPortal>
    );
});
DropdownMenuSubContent.displayName = 'DropdownMenuSubContent';

/** A shortcut hint at the right end of an item. Hidden from screen readers — aria-keyshortcuts carries it. */
function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="dropdown-menu-shortcut"
            aria-hidden="true"
            className={cn('ml-auto pl-4 text-xs text-muted-foreground', className)}
            {...props}
        />
    );
}

/** A non-interactive, uppercase heading for a group of items. */
const DropdownMenuLabel = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(function DropdownMenuLabel({ className, ...props }, ref) {
    return (
        <DropdownMenuPrimitive.Label
            ref={ref}
            data-slot="dropdown-menu-label"
            className={cn(
                'px-2 py-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase',
                className,
            )}
            {...props}
        />
    );
});
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

/** A thin divider between groups of items. */
const DropdownMenuSeparator = React.forwardRef<
    React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
    return (
        <DropdownMenuPrimitive.Separator
            ref={ref}
            data-slot="dropdown-menu-separator"
            className={cn('-mx-1 my-1 h-px bg-border', className)}
            {...props}
        />
    );
});
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
};
