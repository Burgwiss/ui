import { type ReactNode } from 'react';
/** Where the viewer is: `waiting` (not yet near the screen), `loading`, `loaded`, or `failed` (timed out). */
export type PageViewerStatus = 'waiting' | 'loading' | 'loaded' | 'failed';
export interface PageViewerProps {
    /** The page to show. Same-origin pages load fully; cross-origin ones need the site's permission to be framed. */
    src?: string;
    /** Or a whole HTML document to show instead of a URL. */
    srcDoc?: string;
    /** The frame's accessible name, e.g. "Vorschau: Kursseite". */
    title: string;
    /** The width the page is laid out at, in CSS px — so its breakpoints fire as on that device. */
    deviceWidth: number;
    /**
     * Let people click and tab inside the page. Off by default: a preview is
     * looked at, and without this Tab would walk through a whole second page.
     */
    interactive?: boolean;
    /** Give up and offer a retry if the page has not loaded by then. Default 10 s. */
    timeoutMs?: number;
    /** The viewer's own strings: */
    labels: {
        /** Status text shown over the page while it loads. */
        loading: string;
        /** Heading of the message shown when the page did not load in time. */
        failedTitle: string;
        /** Explanation under the heading. */
        failedBody: string;
        /** Text of the retry button, which reloads the page in a fresh frame. */
        retry: string;
    };
    /** Drawn over the page, in the page's own coordinates — it scales with it. Never takes clicks. */
    overlay?: ReactNode;
    /** Called with the new status whenever it changes. Pass a stable (memoised) function: a new one each render re-fires the call. */
    onStatusChange?: (status: PageViewerStatus) => void;
    /** Classes for the box the page is scaled into; give it a size (it fills its parent's height). */
    className?: string;
}
/**
 * A real page, shown small. The page is laid out at a true device width in an
 * iframe and the whole frame is scaled to fit its box, so what you see is the
 * page as that device renders it — not a lookalike.
 *
 * It mounts only once it scrolls near the screen, says it is loading while it
 * loads, and turns a page that never arrives into a message with a Retry
 * instead of a blank rectangle.
 *
 * Use it for previews (a page at mobile, tablet or desktop width). It is not
 * a general embed: the page is inert unless `interactive`, and the scale is
 * computed from `deviceWidth`.
 *
 * @summary Scaled iframe preview of a page at a true device width, with lazy mounting, loading state and retry.
 */
export declare function PageViewer({ src, srcDoc, title, deviceWidth, interactive, timeoutMs, labels, overlay, onStatusChange, className, }: PageViewerProps): import("react").JSX.Element;
