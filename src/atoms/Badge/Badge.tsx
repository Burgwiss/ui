import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '../../lib/cn';

const badgeBase =
    'inline-flex items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>svg]:size-3 [&>svg]:pointer-events-none';

const badgeVariants = cva(badgeBase, {
    variants: {
        variant: {
            default: 'border-transparent bg-primary text-primary-foreground',
            secondary: 'border-transparent bg-secondary text-secondary-foreground',
            destructive: 'border-transparent bg-destructive text-destructive-foreground',
            outline: 'border-border text-foreground',
            muted: 'border-transparent bg-muted text-muted-foreground',
            accent: 'border-transparent bg-accent text-accent-foreground',
            warning: 'border-transparent bg-warning text-warning-foreground',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
});

/**
 * Tonal status look (the lifecycle-pill). A tint background with the dedicated
 * on-tint foreground token — never the solid `text-{tone}` fill, which fails
 * WCAG AA on its own tint.
 */
export type BadgeTone = 'success' | 'warning' | 'destructive' | 'neutral' | 'muted' | 'faint';

const toneClass: Record<BadgeTone, string> = {
    success: 'border-success/30 bg-success/10 text-success-tint-foreground',
    warning: 'border-warning/40 bg-warning/10 text-warning-tint-foreground',
    destructive: 'border-destructive/30 bg-destructive/10 text-destructive-tint-foreground',
    neutral: 'border-border bg-card text-foreground',
    muted: 'border-border bg-muted text-muted-foreground',
    faint: 'border-border/60 bg-muted/50 text-muted-foreground',
};

const dotClass: Record<BadgeTone, string> = {
    success: 'bg-success',
    warning: 'bg-warning',
    destructive: 'bg-destructive',
    neutral: 'bg-muted-foreground',
    muted: 'bg-muted-foreground/60',
    faint: 'bg-muted-foreground/40',
};

type BadgeProps = React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants> & {
        /** Render the child element instead of a `<span>` (e.g. to make the badge a link), keeping the badge styling. */
        asChild?: boolean;
        /** Tonal status look (tint + on-tint token). Overrides `variant`. */
        tone?: BadgeTone;
        /** Leading status dot — the lifecycle-pill look. Only with `tone`. */
        dot?: boolean;
    };

// MUST be forwardRef: on React 18 a plain function component silently drops
// any ref passed to it. Radix `Trigger asChild` (Tooltip, Popover, …) clones
// this Badge and passes a ref it uses as the floating-ui anchor — without
// forwardRef that ref never reaches the DOM node.

/**
 * The one small rounded label: a status, count or tag next to other content.
 * It is non-interactive (a `<span>`); for a clickable filter use `Chip`, for a
 * person's picture `Avatar`. Two looks share one silhouette (`rounded-full`,
 * `px-2 py-0.5 text-xs`):
 *
 *  - SOLID `variant` for a filled label, count or tag: `default` (primary),
 *    `secondary`, `destructive`, `outline`, `muted`, `accent`, `warning`.
 *  - TONAL `tone` for a status pill on a `bg-{tone}/10` tint with the on-tint
 *    foreground token (WCAG AA): `success`, `warning`, `destructive`, `neutral`,
 *    `muted`, `faint`. Add `dot` for a leading status dot. `tone` overrides `variant`.
 *
 * The text is `children`, so pass it in the app's language. `StatusBadge` is a thin
 * alias of the tonal look.
 *
 * @summary Small rounded label for a status, count or tag; solid `variant` or tonal status `tone`.
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
    { className, variant, tone, dot = false, asChild = false, children, ...props },
    ref,
) {
    const Comp = asChild ? Slot.Root : 'span';
    const classes = cn(
        tone ? cn(badgeBase, toneClass[tone]) : badgeVariants({ variant }),
        className,
    );

    // asChild → Slot clones a single child; a stray leading `{null}` sibling
    // trips `React.Children.only`. The dot affordance is `!asChild`-gated
    // anyway, so under asChild there is nothing to render but the caller's own
    // child — emit it alone.
    if (asChild) {
        return (
            <Comp ref={ref} data-slot="badge" className={classes} {...props}>
                {children}
            </Comp>
        );
    }

    return (
        <Comp ref={ref} data-slot="badge" className={classes} {...props}>
            {tone && dot ? (
                <span
                    className={cn('size-1.5 shrink-0 rounded-full', dotClass[tone])}
                    aria-hidden="true"
                />
            ) : null}
            {children}
        </Comp>
    );
});

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
