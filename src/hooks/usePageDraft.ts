import { useState } from 'react';

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

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The state of a page edited in place: a draft per language beside what is
 * live, the list of unpublished changes (for a "Veröffentlichen · 3" button
 * and a "Noch nicht live" list), undo, publish and discard. Values are
 * compared by content, so a change typed back to the live value is no
 * change. Pair it with `PageEditor` and `InlineText`.
 */
export function usePageDraft<T extends object, L extends string>(
    initial: Record<L, T>,
): PageDraftApi<T, L> {
    const [published, setPublished] = useState(initial);
    const [draft, setDraft] = useState(initial);
    const [history, setHistory] = useState<
        { lang: L; key: keyof T & string; value: unknown }[]
    >([]);

    const set: PageDraftApi<T, L>['set'] = (lang, key, value) => {
        setHistory((h) => [...h, { lang, key, value: draft[lang][key] }]);
        setDraft((d) => ({ ...d, [lang]: { ...d[lang], [key]: value } }));
    };

    const langs = Object.keys(initial) as L[];
    const keys = Object.keys(initial[langs[0]!]) as (keyof T & string)[];
    const changes = keys.flatMap((key) =>
        langs
            .filter((lang) => !same(draft[lang][key], published[lang][key]))
            .map((lang) => ({ lang, key })),
    );

    return {
        draft,
        published,
        set,
        changes,
        canUndo: history.length > 0,
        undo: () => {
            const last = history.at(-1);
            if (!last) return null;
            setHistory((h) => h.slice(0, -1));
            setDraft((d) => ({ ...d, [last.lang]: { ...d[last.lang], [last.key]: last.value } }));
            return { lang: last.lang, key: last.key };
        },
        publish: () => {
            setPublished(draft);
            setHistory([]);
        },
        discard: () => {
            setDraft(published);
            setHistory([]);
        },
    };
}
