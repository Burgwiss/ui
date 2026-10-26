import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const badgeVariants: (props?: ({
    variant?: "default" | "destructive" | "accent" | "secondary" | "outline" | "muted" | "warning" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
/**
 * Tonal status look (the lifecycle-pill). A tint background with the dedicated
 * on-tint foreground token — never the solid `text-{tone}` fill, which fails
 * WCAG AA on its own tint.
 */
export type BadgeTone = 'success' | 'warning' | 'destructive' | 'neutral' | 'muted' | 'faint';
type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & {
    /** Render the child element instead of a `<span>` (e.g. to make the badge a link), keeping the badge styling. */
    asChild?: boolean;
    /** Tonal status look (tint + on-tint token). Overrides `variant`. */
    tone?: BadgeTone;
    /** Leading status dot — the lifecycle-pill look. Only with `tone`. */
    dot?: boolean;
};
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
declare const Badge: React.ForwardRefExoticComponent<Omit<BadgeProps, "ref"> & React.RefAttributes<HTMLSpanElement>>;
export { Badge, badgeVariants };
