import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import { useFitScale } from '../../hooks/useFitScale';
import { cn } from '../../lib/cn';

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
export function PageViewer({
    src,
    srcDoc,
    title,
    deviceWidth,
    interactive = false,
    timeoutMs = 10_000,
    labels,
    overlay,
    onStatusChange,
    className,
}: PageViewerProps) {
    const { ref, available, scale } = useFitScale<HTMLDivElement>(deviceWidth);
    const [visible, setVisible] = useState(false);
    const [phase, setPhase] = useState<'idle' | 'loaded' | 'failed'>('idle');
    // Bumped by Retry: a fresh iframe is a real reload, not a src swap.
    const [attempt, setAttempt] = useState(0);
    const cell = useRef<HTMLDivElement | null>(null);

    // Mount when near the screen. Fails open without IntersectionObserver: a
    // frame that never mounts is worse than one that mounts early.
    useEffect(() => {
        const el = cell.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const status: PageViewerStatus = !visible ? 'waiting' : phase === 'idle' ? 'loading' : phase;

    useEffect(() => {
        onStatusChange?.(status);
    }, [status, onStatusChange]);

    useEffect(() => {
        if (status !== 'loading') return;
        const timer = window.setTimeout(() => setPhase('failed'), timeoutMs);
        return () => window.clearTimeout(timer);
    }, [status, timeoutMs, attempt]);

    const retry = () => {
        setPhase('idle');
        setAttempt((n) => n + 1);
    };

    return (
        <div
            ref={(node) => {
                cell.current = node;
                ref.current = node;
            }}
            data-status={status}
            className={cn(
                'relative min-h-0 overflow-hidden rounded-lg border border-border bg-background',
                className,
            )}
        >
            {status === 'failed' ? (
                <div
                    role="alert"
                    className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center"
                >
                    <p className="text-sm font-semibold">{labels.failedTitle}</p>
                    <p className="text-xs text-muted-foreground">{labels.failedBody}</p>
                    <Button type="button" size="sm" variant="outline" onClick={retry}>
                        {labels.retry}
                    </Button>
                </div>
            ) : (
                visible && (
                    // Laid out at the TRUE device width and only then scaled.
                    // `transform` does not change layout, so the box is sized to
                    // the pre-scale height that fills the cell once scaled.
                    <div
                        className="relative origin-top-left"
                        style={{
                            width: deviceWidth,
                            height: available === null ? '100%' : available.height / scale,
                            transform: `scale(${scale})`,
                        }}
                    >
                        <iframe
                            key={attempt}
                            src={src}
                            srcDoc={srcDoc}
                            title={title}
                            loading="lazy"
                            inert={interactive ? undefined : true}
                            onLoad={() => setPhase((p) => (p === 'idle' ? 'loaded' : p))}
                            className="h-full w-full border-0 bg-background"
                        />
                        {overlay !== undefined && (
                            <div className="pointer-events-none absolute inset-0">{overlay}</div>
                        )}
                    </div>
                )
            )}
            {status === 'loading' && (
                <div
                    role="status"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70 text-xs text-muted-foreground"
                >
                    {labels.loading}
                </div>
            )}
        </div>
    );
}
