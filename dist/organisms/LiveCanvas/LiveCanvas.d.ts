import { type CSSProperties, type ReactNode } from 'react';
export interface LiveCanvasProps {
    /** The canvas's accessible name, e.g. "Stilbuch". */
    label: string;
    /** The selected target's id, or null for "the whole thing". */
    selected: string | null;
    /** Called with the clicked or keyboard-chosen target's id, or `null` to select nothing (click on the artboard, Escape, or toggling the selected target off). */
    onSelect: (id: string | null) => void;
    /** A small caption above the artboard. */
    caption?: ReactNode;
    /** Styles for the artboard — CSS variables here repaint everything inside, live. */
    artboardStyle?: CSSProperties;
    /** Classes for the artboard, e.g. a theme scope. */
    artboardClassName?: string;
    /** Render the artboard in dark mode. */
    dark?: boolean;
    /** Dim the artboard while a change is being applied, rather than blanking it. */
    pending?: boolean;
    /** The samples: `LiveCanvasTarget`s, optionally grouped in `LiveCanvasGroup`s, laid out however you like. */
    children: ReactNode;
}
/**
 * A canvas you SELECT in: real components laid out on an artboard, each
 * wrapped in a `LiveCanvasTarget`. Clicking a target selects it; clicking the
 * artboard around them selects nothing. Pair it with an inspector that edits
 * what is selected — styles given in `artboardStyle` repaint the artboard live.
 *
 * Nothing on the canvas drags, resizes or edits in place, and the samples
 * inside a target are `inert`: they are shown, not used.
 *
 * Keyboard: the canvas is one tab stop (a listbox). Arrows move between
 * targets, Enter or Space selects, Escape selects nothing.
 *
 * Use it to pick a building block to edit next to an inspector (a design
 * studio, a style book). It is not a free-form editor and not a preview.
 *
 * @summary Selectable artboard of real components (`LiveCanvasTarget`) for pairing with an inspector, with live restyling.
 */
export declare function LiveCanvas({ label, selected, onSelect, caption, artboardStyle, artboardClassName, dark, pending, children, }: LiveCanvasProps): import("react").JSX.Element;
export interface LiveCanvasTargetProps {
    /** Stable id, e.g. `'button.primary'`. */
    id: string;
    /** Its name: shown on the tag when selected, and read to screen readers. */
    label: string;
    /** Stretch to the full width instead of hugging the sample. */
    wide?: boolean;
    /** The sample component to show; it is rendered `inert`. */
    children: ReactNode;
}
/**
 * One selectable thing on a LiveCanvas. Its sample is `inert` — no pointer,
 * no tab stop — so a real input or button can be shown without being a
 * control inside a control.
 */
export declare function LiveCanvasTarget({ id, label, wide, children }: LiveCanvasTargetProps): import("react").JSX.Element;
/** A captioned group of targets. */
export declare function LiveCanvasGroup({ caption, children, }: {
    /** The group's heading, shown small in capitals and used as the group's accessible name. */
    caption: string;
    /** The `LiveCanvasTarget`s in this group. */
    children: ReactNode;
}): import("react").JSX.Element;
