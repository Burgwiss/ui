/** One field in one language that differs from what is live. */
export interface PageDraftChange<T, L extends string> {
    lang: L;
    key: keyof T & string;
}
export interface PageDraftApi<T, L extends string> {
    /** What the editor shows: the page per language, with unpublished changes. */
    draft: Record<L, T>;
    /** What visitors see. */
    published: Record<L, T>;
    /** Change one field in one language. */
    set: <K extends keyof T & string>(lang: L, key: K, value: T[K]) => void;
    /** Every field that differs from what is live, in field order, per language. */
    changes: PageDraftChange<T, L>[];
    /** Put the last change back; returns which field it was, or null when there is nothing to undo. */
    undo: () => PageDraftChange<T, L> | null;
    canUndo: boolean;
    /** Make the draft live. Clears the undo history. */
    publish: () => void;
    /** Throw every change away. */
    discard: () => void;
}
/**
 * The state of a page edited in place: a draft per language beside what is
 * live, the list of unpublished changes (for a "Veröffentlichen · 3" button
 * and a "Noch nicht live" list), undo, publish and discard. Values are
 * compared by content, so a change typed back to the live value is no
 * change. Pair it with `PageEditor` and `InlineText`.
 */
export declare function usePageDraft<T extends object, L extends string>(initial: Record<L, T>): PageDraftApi<T, L>;
