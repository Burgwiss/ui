import * as React from 'react';
type ChipSingleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    /** Selection mode: leave unset (or `false`) for a single-select `aria-pressed` button. */
    multi?: false;
    /** Active state for the single-select button (drives `aria-pressed`). */
    selected?: boolean;
};
type ChipMultiProps = {
    /** Multi-select: a real checkbox (space toggles), for free-form tag pickers. */
    multi: true;
    /** Stable id so the visually-hidden checkbox + label associate. */
    id: string;
    /** Whether the chip is ticked (controlled). */
    checked: boolean;
    /** Called with the new checked state when the user toggles the chip. */
    onChange: (next: boolean) => void;
    /** Accessible name override; defaults to `children` when it is text. */
    ariaLabel?: string;
    /** The chip text, in the app's language. */
    children?: React.ReactNode;
    /** Extra classes merged onto the chip. */
    className?: string;
};
export type ChipProps = ChipSingleProps | ChipMultiProps;
/**
 * A selectable pill for filters and tag pickers. Use it to narrow a list (a
 * category row) or to pick free-form tags. For a non-interactive label use `Badge`. One
 * component, two selection modes that
 * share the exact same pill look + leading check glyph (non-colour-alone, so the
 * active state survives forced-colors):
 *
 *  - single (default): an `aria-pressed` `<button>`. Compose inside `<ChipRow>`
 *    for a scrollable, keyboard-navigable row. `<Chip selected onClick={…}>`.
 *  - multi (`multi`): a real `<input type="checkbox">` (space toggles) inside a
 *    `<label>`, for free-form multi-select. `<Chip multi id checked onChange>`.
 *
 * (`ToggleChip` is now a thin back-compat alias of `<Chip multi>`.)
 *
 * @summary Selectable filter pill: a single-select button, or a multi-select checkbox with `multi`.
 */
export declare function Chip(props: ChipProps): React.JSX.Element;
interface ChipRowProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Accessible group name (a translated string supplied by the caller). */
    ariaLabel?: string;
}
/**
 * Horizontal, scroll-snapping row of single-select `<Chip>`s with a hidden
 * scrollbar and roving keyboard navigation (arrow keys, Home and End move focus; only one
 * chip is in the tab order at a time). Use it as the container for a mobile-first
 * filter row; it needs single-select chips (not `multi`).
 */
export declare function ChipRow({ children, ariaLabel, className, ...props }: ChipRowProps): React.JSX.Element;
export {};
