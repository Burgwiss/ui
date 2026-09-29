import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '../../lib/cn';

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
                outline:
                    'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
                ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
                // Full destructive bg + foreground — `bg-destructive/10 text-destructive`
                // fails WCAG AA (3.7:1). Canonical shadcn destructive Button uses solid red
                // with white text for accessible contrast at every state.
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                // `pointer-coarse:min-h-11` (and `min-w-11` for the square icon
                // variants) lifts the compact small sizes to the 44px WCAG touch
                // floor — but ONLY on coarse pointers (touch). On a mouse the
                // dense desktop/admin density is untouched (`min-*` only grows).
                default:
                    'h-8 gap-1.5 px-2.5 pointer-coarse:min-h-11 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
                xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs pointer-coarse:min-h-11 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
                sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] pointer-coarse:min-h-11 in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
                lg: 'h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
                icon: 'size-8 pointer-coarse:min-h-11 pointer-coarse:min-w-11',
                'icon-xs':
                    "size-6 rounded-[min(var(--radius-md),10px)] pointer-coarse:min-h-11 pointer-coarse:min-w-11 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
                'icon-sm':
                    'size-7 rounded-[min(var(--radius-md),12px)] pointer-coarse:min-h-11 pointer-coarse:min-w-11 in-data-[slot=button-group]:rounded-lg',
                'icon-lg': 'size-9 pointer-coarse:min-h-11 pointer-coarse:min-w-11',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

type ButtonProps = React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    };

// MUST be forwardRef: on React 18 a plain function component silently drops
// any ref passed to it. Radix `Trigger asChild` (DropdownMenu, Popover,
// Tooltip, …) clones this Button and passes a ref it uses as the floating-ui
// anchor — without forwardRef that ref is null, the popper never measures an
// anchor, and the menu renders off-screen at its unpositioned fallback
// (`translate(0, -200%)`). That was the "Add block dropdown does nothing" bug.
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { className, variant = 'default', size = 'default', asChild = false, ...props },
    ref,
) {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            ref={ref}
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
