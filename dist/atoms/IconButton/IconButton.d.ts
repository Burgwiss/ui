import { ButtonHTMLAttributes, ReactNode } from 'react';
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Accessible name — required. Also rendered as tooltip content. Pass a
     *  translated string (a `t('domain.area.key')` value), never a literal. */
    label: string;
    /** Lucide (or other) icon element. Give it `aria-hidden`; the `label` names the button. */
    icon: ReactNode;
    /** When true, the button turns solid destructive (red) on hover. Use for delete-style actions. */
    destructive?: boolean;
}
/**
 * A standalone icon-only button with a required `label`. Use it wherever the visible UI
 * is just an icon (edit, delete, close); for a button that also has text use `Button`,
 * and for an icon item inside a toggle group use `IconToggle`. It is the canonical
 * icon-only button per `docs/ux-conventions.md`: it
 * wraps a shadcn `Tooltip`, sets `aria-label` (so the accessible name resolves
 * even when the tooltip is suppressed on touch), and ships the 44px WCAG touch
 * floor via `pointer-coarse:min-*` — the hit area grows on touch devices while
 * dense desktop UIs keep their compact 32px footprint.
 *
 * Use this anywhere the visible UI is just an icon — never roll your own
 * `<button><Icon/></button>` without an accessible name + tooltip.
 *
 * @summary Icon-only button whose required `label` is both its aria-label and its tooltip.
 */
export declare const IconButton: import("react").ForwardRefExoticComponent<IconButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export {};
