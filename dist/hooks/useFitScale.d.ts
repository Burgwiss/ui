/** True CSS widths, so the breakpoints a real device fires actually fire. */
export declare const DEVICE_WIDTHS: {
    readonly mobile: 390;
    readonly tablet: 834;
    readonly desktop: 1280;
};
export type DeviceName = keyof typeof DEVICE_WIDTHS;
export interface FitScale<E extends HTMLElement = HTMLDivElement> {
    ref: React.RefObject<E | null>;
    /** The element's content box, or null before the first measurement. */
    available: {
        width: number;
        height: number;
    } | null;
    /** `min(1, availableWidth / deviceWidth)`; 1 before the first measurement. */
    scale: number;
}
/**
 * Measure a box so something laid out at a true device width can be scaled
 * down to fit it. Never scales UP: a 390px phone stays 390px on a wide screen
 * rather than lying about the text size.
 */
export declare function useFitScale<E extends HTMLElement = HTMLDivElement>(deviceWidth: number): FitScale<E>;
