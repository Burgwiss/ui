import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '../../lib/cn';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';

const buttonVariants = cva(
    "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring active:not-aria-[haspopup]:not-aria-disabled:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
        /** Render the child element instead of a `<button>` (e.g. an `<a>` styled as a button), keeping the styling and tooltip. */
        asChild?: boolean;
        /**
         * Shown on hover and on keyboard focus. Say what a click does, or why the
         * button is disabled — never repeat the visible label. Icon-only sizes
         * always get one: they fall back to `aria-label`, and a string tooltip
         * becomes their `aria-label` when none is given.
         */
        tooltip?: React.ReactNode;
        /** Which side of the button the tooltip opens on. Defaults to `top`. */
        tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
    };

const ICON_ONLY_SIZES = new Set(['icon', 'icon-xs', 'icon-sm', 'icon-lg']);

function cancel(event: React.SyntheticEvent) {
    event.preventDefault();
}

/** A disabled button that can still be focused: no handlers, no activation. */
function inertProps(props: React.ComponentProps<'button'>): React.ComponentProps<'button'> {
    const inert: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
        if (key === 'disabled' || /^on[A-Z]/.test(key)) continue;
        inert[key] = value;
    }
    return { ...inert, 'aria-disabled': true, onClick: cancel };
}

// MUST be forwardRef: on React 18 a plain function component silently drops
// any ref passed to it. Radix `Trigger asChild` (DropdownMenu, Popover,
// Tooltip, …) clones this Button and passes a ref it uses as the floating-ui
// anchor — without forwardRef that ref is null, the popper never measures an
// anchor, and the menu renders off-screen at its unpositioned fallback
// (`translate(0, -200%)`). That was the "Add block dropdown does nothing" bug.

/**
 * The one button for every action. `variant` sets the emphasis (`default` = the
 * primary action, `outline`, `secondary`, `ghost`, `destructive`, `link`); `size`
 * sets the density (`default`, `xs`, `sm`, `lg`, plus the square icon-only `icon`,
 * `icon-xs`, `icon-sm`, `icon-lg`). Every Button can carry a `tooltip`, shown on hover
 * and on keyboard focus: say what a click does, or why the button is disabled
 * (a disabled button with a tooltip stays focusable so the reason can be read).
 * Icon-only sizes always show one, taken from `aria-label` when `tooltip` is absent,
 * so give them at least one of the two. To render a link or other element as a
 * button use `asChild`. For a standalone icon-only button with a required label
 * you can also use `IconButton`. When to write a tooltip and what to put in it: see
 * **Tooltips** under Einführung. The label is `children`: pass it in the app's language.
 *
 * @summary The one button: pick a `variant` and `size`, and give it a `tooltip` (icon-only sizes always need one).
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
        className,
        variant = 'default',
        size = 'default',
        asChild = false,
        tooltip,
        tooltipSide = 'top',
        'aria-label': ariaLabel,
        ...props
    },
    ref,
) {
    const Comp = asChild ? Slot.Root : 'button';
    const iconOnly = ICON_ONLY_SIZES.has(size ?? 'default');
    const hint = tooltip ?? (iconOnly ? ariaLabel : undefined);
    const label = ariaLabel ?? (iconOnly && typeof tooltip === 'string' ? tooltip : undefined);
    const hasHint = hint !== undefined && hint !== null && hint !== '';

    // A natively disabled button gets no pointer or focus events, so its
    // tooltip could never open — yet "why can't I click this?" is the tooltip
    // most worth showing. With a reason to show, the button stays focusable and
    // says it is disabled via aria-disabled; every handler it was given (its
    // own, and any from an outer `asChild` trigger) is dropped, and the click
    // is cancelled so a submit button cannot submit.
    const explainDisabled = hasHint && props.disabled === true;
    const buttonProps = explainDisabled ? inertProps(props) : props;

    const button = (
        <Comp
            ref={ref}
            data-slot="button"
            data-variant={variant}
            data-size={size}
            aria-label={label}
            className={cn(buttonVariants({ variant, size, className }))}
            {...buttonProps}
        />
    );

    if (!hasHint) return button;

    return (
        // Own provider, like IconButton: Radix allows nesting, so this works
        // under an app-wide provider and without one (tests, other apps).
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side={tooltipSide}>{hint}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
});

Button.displayName = 'Button';

export { Button, buttonVariants };
