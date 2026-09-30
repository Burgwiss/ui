import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { gridPreferencesKey, useGridPreferences } from './useGridPreferences';

afterEach(() => localStorage.clear());
const KEY = gridPreferencesKey('g');
const stored = () => JSON.parse(localStorage.getItem(KEY) ?? 'null');

describe('useGridPreferences — layout, sorting, grouping, views', () => {
    it('starts with empty layout state', () => {
        const { result } = renderHook(() => useGridPreferences('g'));
        expect(result.current.values).toMatchObject({
            columnOrder: [],
            columnWidths: {},
            pinned: {},
            sorting: [],
            groupBy: [],
            views: [],
            activeView: null,
        });
    });

    it('stores a patch and reads it back on the next visit', () => {
        const first = renderHook(() => useGridPreferences('g'));
        act(() =>
            first.result.current.set({
                columnOrder: ['price', 'title'],
                columnWidths: { title: 320 },
                pinned: { title: 'left', price: null },
                sorting: [{ id: 'price', desc: true }],
                groupBy: ['category'],
            }),
        );
        first.unmount();
        const second = renderHook(() => useGridPreferences('g'));
        expect(second.result.current.values).toMatchObject({
            columnOrder: ['price', 'title'],
            columnWidths: { title: 320 },
            pinned: { title: 'left', price: null },
            sorting: [{ id: 'price', desc: true }],
            groupBy: ['category'],
        });
        expect(second.result.current.isDefault).toBe(false);
    });

    it('keeps views and the active view', () => {
        const { result } = renderHook(() => useGridPreferences('g'));
        const view = { id: 'v1', name: 'Unbezahlt', state: { filters: [], sorting: [] } };
        act(() => result.current.set({ views: [view], activeView: 'v1' }));
        expect(stored().views).toEqual([view]);
        expect(stored().activeView).toBe('v1');
    });

    it('drops malformed entries field by field instead of trusting them', () => {
        localStorage.setItem(
            KEY,
            JSON.stringify({
                v: 1,
                columnOrder: ['a', 3, 'b'],
                columnWidths: { a: 200, b: 'wide', c: -5, d: Number.NaN },
                pinned: { a: 'left', b: 'top', c: null },
                sorting: [{ id: 'a', desc: true }, { id: 3 }, { id: 'b', desc: 'yes' }, 'x'],
                groupBy: ['a', {}],
                views: [
                    { id: 'v1', name: 'Gut', state: {} },
                    { id: 'v2', state: {} },
                    { id: 'v3', name: 'Ohne Zustand' },
                    null,
                ],
                activeView: 7,
            }),
        );
        const { result } = renderHook(() => useGridPreferences('g'));
        expect(result.current.values).toMatchObject({
            columnOrder: ['a', 'b'],
            columnWidths: { a: 200 },
            pinned: { a: 'left', c: null },
            sorting: [{ id: 'a', desc: true }],
            groupBy: ['a'],
            views: [{ id: 'v1', name: 'Gut', state: {} }],
            activeView: null,
        });
    });

    it('reset forgets layout too', () => {
        const { result } = renderHook(() => useGridPreferences('g'));
        act(() => result.current.set({ columnWidths: { a: 300 } }));
        act(() => result.current.reset());
        expect(result.current.values.columnWidths).toEqual({});
        expect(localStorage.getItem(KEY)).toBeNull();
    });

    it('treats the same hidden columns in another order as unchanged', () => {
        const { result } = renderHook(() =>
            useGridPreferences('g', { defaults: { hiddenColumns: ['a', 'b'] } }),
        );
        act(() => result.current.set({ hiddenColumns: ['b', 'a'] }));
        expect(result.current.isDefault).toBe(true);
    });
});
