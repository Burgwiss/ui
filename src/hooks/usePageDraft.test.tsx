import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { usePageDraft } from './usePageDraft';

type Page = { title: string; points: string[] };
const INITIAL = {
    de: { title: 'Arabisch', points: ['Alphabet'] },
    en: { title: 'Arabic', points: [] as string[] },
};

const setup = () => renderHook(() => usePageDraft<Page, 'de' | 'en'>(INITIAL));

describe('usePageDraft', () => {
    it('starts with the draft equal to what is live, and no changes', () => {
        const { result } = setup();
        expect(result.current.draft).toEqual(INITIAL);
        expect(result.current.changes).toEqual([]);
        expect(result.current.canUndo).toBe(false);
    });

    it('lists a change per field and language until it is published', () => {
        const { result } = setup();
        act(() => result.current.set('de', 'title', 'Arabisch 1'));
        act(() => result.current.set('en', 'points', ['Alphabet']));
        expect(result.current.draft.de.title).toBe('Arabisch 1');
        expect(result.current.published.de.title).toBe('Arabisch');
        expect(result.current.changes).toEqual([
            { lang: 'de', key: 'title' },
            { lang: 'en', key: 'points' },
        ]);
        act(() => result.current.publish());
        expect(result.current.published.de.title).toBe('Arabisch 1');
        expect(result.current.changes).toEqual([]);
        expect(result.current.canUndo).toBe(false);
    });

    it('drops a change that was put back by hand', () => {
        const { result } = setup();
        act(() => result.current.set('de', 'title', 'X'));
        act(() => result.current.set('de', 'title', 'Arabisch'));
        expect(result.current.changes).toEqual([]);
    });

    it('undoes the last change, one at a time, and says which it was', () => {
        const { result } = setup();
        act(() => result.current.set('de', 'title', 'A'));
        act(() => result.current.set('de', 'title', 'B'));
        let undone: unknown;
        act(() => {
            undone = result.current.undo();
        });
        expect(undone).toEqual({ lang: 'de', key: 'title' });
        expect(result.current.draft.de.title).toBe('A');
        act(() => {
            result.current.undo();
        });
        expect(result.current.draft.de.title).toBe('Arabisch');
        act(() => {
            undone = result.current.undo();
        });
        expect(undone).toBeNull();
    });

    it('undoes only the field it changed, leaving later edits elsewhere alone', () => {
        const { result } = setup();
        act(() => result.current.set('de', 'title', 'A'));
        act(() => result.current.set('en', 'title', 'B'));
        act(() => {
            result.current.undo();
        });
        expect(result.current.draft.en.title).toBe('Arabic');
        expect(result.current.draft.de.title).toBe('A');
    });

    it('discards every change back to what is live', () => {
        const { result } = setup();
        act(() => result.current.set('de', 'title', 'A'));
        act(() => result.current.discard());
        expect(result.current.draft).toEqual(INITIAL);
        expect(result.current.canUndo).toBe(false);
    });
});
