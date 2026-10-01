import { Direction } from 'radix-ui';
import type { ReactNode } from 'react';

/**
 * Right-to-left support.
 *
 * Layout is direction-agnostic by construction: components use logical classes
 * (`ms-*`, `ps-*`, `start-*`, `border-e`, `text-start`), which follow the
 * `dir` attribute on any ancestor. Two things do not follow it on their own:
 *
 * - **Radix primitives** (menus, select, tabs, radio group…) ignore the `dir`
 *   attribute and default to LTR — submenus open the wrong way and the arrow
 *   keys run backwards. Wrap the app once in `DirectionProvider`, with the
 *   same value the app puts on `<html dir>`.
 * - **Our own pointer and arrow-key maths** (resize handles, roving focus)
 *   asks `isRtl(element)` at the moment of the event.
 */
export type Dir = 'ltr' | 'rtl';

/** Tells every Radix primitive inside it which way the app reads. Wrap the app root once, with the value of `<html dir>`. */
export function DirectionProvider({ dir, children }: { dir: Dir; children?: ReactNode }) {
    return <Direction.DirectionProvider dir={dir}>{children}</Direction.DirectionProvider>;
}

/** The direction from the nearest `DirectionProvider` (`'ltr'` without one); a `local` value wins. */
export function useDirection(local?: Dir): Dir {
    return Direction.useDirection(local);
}

/**
 * Whether `el` lays out right-to-left: the NEAREST ancestor with a `dir`
 * attribute decides, so an island marked `dir="ltr"` (a video timeline, a code
 * sample) inside an RTL page answers `false`.
 */
export function isRtl(el: Element | null | undefined): boolean {
    return el?.closest('[dir]')?.getAttribute('dir') === 'rtl';
}

/**
 * The arrow key that moves FORWARD (to the next item, or to grow) in `el`'s
 * reading direction, and the one that moves back.
 */
export function inlineArrows(el: Element | null | undefined): { forward: string; back: string } {
    return isRtl(el)
        ? { forward: 'ArrowLeft', back: 'ArrowRight' }
        : { forward: 'ArrowRight', back: 'ArrowLeft' };
}
