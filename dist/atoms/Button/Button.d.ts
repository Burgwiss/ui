import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const buttonVariants: (props?: ({
    variant?: "link" | "default" | "destructive" | "secondary" | "outline" | "ghost" | null | undefined;
    size?: "default" | "sm" | "lg" | "xs" | "icon" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
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
declare const Button: React.ForwardRefExoticComponent<Omit<ButtonProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { Button, buttonVariants };
