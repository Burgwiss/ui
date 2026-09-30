import { useEffect, useRef, useState } from 'react';

/** True CSS widths, so the breakpoints a real device fires actually fire. */
export const DEVICE_WIDTHS = { mobile: 390, tablet: 834, desktop: 1280 } as const;
export type DeviceName = keyof typeof DEVICE_WIDTHS;

export interface FitScale<E extends HTMLElement = HTMLDivElement> {
    ref: React.RefObject<E | null>;
    /** The element's content box, or null before the first measurement. */
    available: { width: number; height: number } | null;
    /** `min(1, availableWidth / deviceWidth)`; 1 before the first measurement. */
    scale: number;
}

/**
 * Measure a box so something laid out at a true device width can be scaled
 * down to fit it. Never scales UP: a 390px phone stays 390px on a wide screen
 * rather than lying about the text size.
 */
export function useFitScale<E extends HTMLElement = HTMLDivElement>(
    deviceWidth: number,
): FitScale<E> {
    const ref = useRef<E | null>(null);
    const [available, setAvailable] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (el === null) return;
        // One measurement for the first read and every later one: the content
        // box, padding excluded. Mixing clientWidth (padding included) with
        // contentRect scaled against the wrong width and clipped the frame.
        const measure = () => {
            const style = window.getComputedStyle(el);
            const width =
                el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
            const height =
                el.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
            if (width > 0 && height > 0) {
                setAvailable((prev) =>
                    prev?.width === width && prev.height === height ? prev : { width, height },
                );
            }
        };
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
        observer?.observe(el);
        // Also on window resize, and once now: a layout that re-scales only
        // when ResizeObserver happens to fire silently stops re-scaling where
        // it does not, and an unmeasured first paint would render full size.
        window.addEventListener('resize', measure);
        measure();
        return () => {
            observer?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    const scale = available === null ? 1 : Math.min(1, available.width / deviceWidth);
    return { ref, available, scale };
}
