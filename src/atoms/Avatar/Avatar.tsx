import * as React from 'react';
import { Avatar as AvatarPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

// MUST be forwardRef: on React 18 a plain function component silently drops
// any ref passed to it. Radix `Trigger asChild` (Tooltip, Popover, …) clones
// the child and passes a ref it uses as the floating-ui anchor — see
// `TeacherAvatarGroup`, which wraps each `Avatar` in a `TooltipTrigger asChild`.
// Without forwardRef React logs "Function components cannot be given refs" and
// the ref never reaches the DOM node, so tooltip positioning is unreliable.

/**
 * A person's picture with a fallback for when it is missing or slow. Compose `Avatar`
 * + `AvatarImage` + `AvatarFallback`: the fallback (initials, an icon) shows until
 * the image has loaded, and stays if it never does. `size` is `sm`, `default` or `lg`.
 * Wrap several in `AvatarGroup` for an overlapping stack (add `AvatarGroupCount` for
 * "+3"), and add `AvatarBadge` for a status dot. If you only have a name and no image,
 * use `InitialsAvatar`.
 *
 * @summary Person's picture with an initials fallback; compose with AvatarImage and AvatarFallback.
 */
const Avatar = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
        /** Diameter: `sm` (24px), `default` (32px) or `lg` (40px). Sub-parts scale with it. */
        size?: 'default' | 'sm' | 'lg';
    }
>(function Avatar({ className, size = 'default', ...props }, ref) {
    return (
        <AvatarPrimitive.Root
            ref={ref}
            data-slot="avatar"
            data-size={size}
            className={cn(
                'group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6',
                className,
            )}
            {...props}
        />
    );
});
Avatar.displayName = 'Avatar';

/** The photo. Give it `src` and `alt`; while loading or on error the sibling `AvatarFallback` shows instead. */
const AvatarImage = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(function AvatarImage({ className, ...props }, ref) {
    return (
        <AvatarPrimitive.Image
            ref={ref}
            data-slot="avatar-image"
            className={cn('aspect-square size-full', className)}
            {...props}
        />
    );
});
AvatarImage.displayName = 'AvatarImage';

/** What shows until the image loads (usually 1-2 initials); the text is a child, in the app's language. */
const AvatarFallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(function AvatarFallback({ className, ...props }, ref) {
    return (
        <AvatarPrimitive.Fallback
            ref={ref}
            data-slot="avatar-fallback"
            className={cn(
                'flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs',
                className,
            )}
            {...props}
        />
    );
});
AvatarFallback.displayName = 'AvatarFallback';

/** A small status dot pinned to the bottom-right corner of the `Avatar`; may hold a tiny icon (hidden on `sm`). */
const AvatarBadge = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
    function AvatarBadge({ className, ...props }, ref) {
        return (
            <span
                ref={ref}
                data-slot="avatar-badge"
                className={cn(
                    'absolute end-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none',
                    'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
                    'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
                    'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
                    className,
                )}
                {...props}
            />
        );
    },
);
AvatarBadge.displayName = 'AvatarBadge';

/** Lays several `Avatar`s out in an overlapping row. */
const AvatarGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    function AvatarGroup({ className, ...props }, ref) {
        return (
            <div
                ref={ref}
                data-slot="avatar-group"
                className={cn(
                    'group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
                    className,
                )}
                {...props}
            />
        );
    },
);
AvatarGroup.displayName = 'AvatarGroup';

/** The trailing "+N" bubble of an `AvatarGroup`; pass the text as children. */
const AvatarGroupCount = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
    function AvatarGroupCount({ className, ...props }, ref) {
        return (
            <div
                ref={ref}
                data-slot="avatar-group-count"
                className={cn(
                    'relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
                    className,
                )}
                {...props}
            />
        );
    },
);
AvatarGroupCount.displayName = 'AvatarGroupCount';

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount };
