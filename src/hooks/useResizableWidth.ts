import { useEffect, useState } from 'react';

export interface ResizableWidthOptions {
    /** Remember the width under this name. Omit to forget it on reload. */
    storageKey?: string;
    defaultWidth: number;
    minWidth: number;
    maxWidth: number;
}

export interface ResizableWidth {
    width: number;
    minWidth: number;
    maxWidth: number;
    /** Clamped to min/max; stored when a `storageKey` is set. */
    setWidth: (width: number) => void;
    reset: () => void;
}

const VERSION = 1;

export function resizableWidthKey(storageKey: string): string {
    return `burgwiss-ui:width:${storageKey}`;
}

function clamp(width: number, min: number, max: number): number {
    return Math.round(Math.min(max, Math.max(min, width)));
}

function read(options: ResizableWidthOptions): number {
    const { storageKey, defaultWidth, minWidth, maxWidth } = options;
    const fallback = clamp(defaultWidth, minWidth, maxWidth);
    if (!storageKey || typeof window === 'undefined') return fallback;
    try {
        const data: unknown = JSON.parse(
            window.localStorage.getItem(resizableWidthKey(storageKey)) ?? 'null',
        );
        const width = (data as { v?: unknown; width?: unknown } | null)?.width;
        if ((data as { v?: unknown } | null)?.v !== VERSION || typeof width !== 'number') {
            return fallback;
        }
        // A stored width from a wider screen or an older min/max is pulled back in range.
        return Number.isFinite(width) ? clamp(width, minWidth, maxWidth) : fallback;
    } catch {
        return fallback;
    }
}

/**
 * A panel width the person can change and the browser remembers — the state
 * half of a resizable sidebar. Stored as `{ v, width }` under
 * `burgwiss-ui:width:<storageKey>`; unreadable entries fall back to the default.
 */
export function useResizableWidth(options: ResizableWidthOptions): ResizableWidth {
    const { storageKey, defaultWidth, minWidth, maxWidth } = options;
    const [width, setState] = useState(() => read(options));

    // Another panel instance under the same key, or another tab: follow it.
    useEffect(() => {
        if (!storageKey || typeof window === 'undefined') return;
        const onStorage = (event: StorageEvent) => {
            if (event.key === resizableWidthKey(storageKey)) {
                setState(read({ storageKey, defaultWidth, minWidth, maxWidth }));
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [storageKey, defaultWidth, minWidth, maxWidth]);

    const store = (next: number | null) => {
        if (!storageKey) return;
        try {
            const key = resizableWidthKey(storageKey);
            if (next === null) window.localStorage.removeItem(key);
            else window.localStorage.setItem(key, JSON.stringify({ v: VERSION, width: next }));
        } catch {
            // Storage blocked or full: the width holds for this visit.
        }
    };

    return {
        width,
        minWidth,
        maxWidth,
        setWidth: (next) => {
            const clamped = clamp(next, minWidth, maxWidth);
            setState(clamped);
            store(clamped);
        },
        reset: () => {
            setState(clamp(defaultWidth, minWidth, maxWidth));
            store(null);
        },
    };
}
