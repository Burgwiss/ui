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
export declare function resizableWidthKey(storageKey: string): string;
/**
 * A panel width the person can change and the browser remembers — the state
 * half of a resizable sidebar. Stored as `{ v, width }` under
 * `burgwiss-ui:width:<storageKey>`; unreadable entries fall back to the default.
 */
export declare function useResizableWidth(options: ResizableWidthOptions): ResizableWidth;
