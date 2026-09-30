import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
    gridPreferencesKey,
    useGridPreferences,
    type GridPreferenceStorage,
} from './useGridPreferences';

afterEach(() => localStorage.clear());

const KEY = gridPreferencesKey('admin.courses');

describe('useGridPreferences', () => {
    it('starts from the defaults when nothing is stored', () => {
        const { result } = renderHook(() => useGridPreferences('admin.courses'));
        expect(result.current.values).toMatchObject({
            hiddenColumns: [],
            density: 'comfortable',
            selection: true,
        });
        expect(result.current.isDefault).toBe(true);
        expect(result.current.isColumnVisible('code')).toBe(true);
    });

    it('honours app defaults, e.g. a column hidden until asked for', () => {
        const { result } = renderHook(() =>
            useGridPreferences('admin.courses', { defaults: { hiddenColumns: ['code'] } }),
        );
        expect(result.current.isColumnVisible('code')).toBe(false);
        expect(result.current.isDefault).toBe(true);
    });

    it('stores a hidden column under the grid key and brings it back on the next visit', () => {
        const first = renderHook(() => useGridPreferences('admin.courses'));
        act(() => first.result.current.setColumnVisible('code', false));
        expect(JSON.parse(localStorage.getItem(KEY) ?? '{}')).toMatchObject({
            v: 1,
            hiddenColumns: ['code'],
            density: 'comfortable',
            selection: true,
        });
        first.unmount();

        const second = renderHook(() => useGridPreferences('admin.courses'));
        expect(second.result.current.isColumnVisible('code')).toBe(false);
    });

    it('remembers density', () => {
        const first = renderHook(() => useGridPreferences('admin.courses'));
        act(() => first.result.current.setDensity('compact'));
        first.unmount();
        const second = renderHook(() => useGridPreferences('admin.courses'));
        expect(second.result.current.values.density).toBe('compact');
    });

    it('shows a column again, without duplicates when hidden twice', () => {
        const { result } = renderHook(() => useGridPreferences('admin.courses'));
        act(() => result.current.setColumnVisible('code', false));
        act(() => result.current.setColumnVisible('code', false));
        expect(result.current.values.hiddenColumns).toEqual(['code']);
        act(() => result.current.setColumnVisible('code', true));
        expect(result.current.isColumnVisible('code')).toBe(true);
    });

    it('keeps two grids apart', () => {
        const courses = renderHook(() => useGridPreferences('admin.courses'));
        act(() => courses.result.current.setColumnVisible('code', false));
        const users = renderHook(() => useGridPreferences('admin.users'));
        expect(users.result.current.isColumnVisible('code')).toBe(true);
    });

    it('loads the new grid at once when the id changes', () => {
        localStorage.setItem(
            gridPreferencesKey('b'),
            JSON.stringify({ v: 1, hiddenColumns: ['x'], density: 'compact' }),
        );
        const { result, rerender } = renderHook(({ id }) => useGridPreferences(id), {
            initialProps: { id: 'a' },
        });
        expect(result.current.isColumnVisible('x')).toBe(true);
        rerender({ id: 'b' });
        expect(result.current.isColumnVisible('x')).toBe(false);
        expect(result.current.values.density).toBe('compact');
    });

    it('remembers turning selection off', () => {
        const first = renderHook(() => useGridPreferences('admin.courses'));
        act(() => first.result.current.setSelectionEnabled(false));
        first.unmount();
        const second = renderHook(() => useGridPreferences('admin.courses'));
        expect(second.result.current.values.selection).toBe(false);
        expect(second.result.current.isDefault).toBe(false);
    });

    it('reads an entry written before selection existed, with selection on', () => {
        localStorage.setItem(
            KEY,
            JSON.stringify({ v: 1, hiddenColumns: ['code'], density: 'compact' }),
        );
        const { result } = renderHook(() => useGridPreferences('admin.courses'));
        expect(result.current.values).toMatchObject({
            hiddenColumns: ['code'],
            density: 'compact',
            selection: true,
        });
    });

    it('reset returns to the defaults and removes the stored entry', () => {
        const { result } = renderHook(() => useGridPreferences('admin.courses'));
        act(() => result.current.setDensity('compact'));
        expect(result.current.isDefault).toBe(false);
        act(() => result.current.reset());
        expect(result.current.isDefault).toBe(true);
        expect(localStorage.getItem(KEY)).toBeNull();
    });

    it('does not store anything when a change lands back on the defaults', () => {
        const { result } = renderHook(() => useGridPreferences('admin.courses'));
        act(() => result.current.setDensity('compact'));
        act(() => result.current.setDensity('comfortable'));
        expect(localStorage.getItem(KEY)).toBeNull();
    });

    it.each([
        ['corrupt JSON', '{nope'],
        ['another version', JSON.stringify({ v: 99, hiddenColumns: ['code'], density: 'compact' })],
        ['no version', JSON.stringify({ hiddenColumns: ['code'] })],
        ['null', 'null'],
    ])('ignores %s and uses the defaults', (_, raw) => {
        localStorage.setItem(KEY, raw);
        const { result } = renderHook(() => useGridPreferences('admin.courses'));
        expect(result.current.values).toMatchObject({
            hiddenColumns: [],
            density: 'comfortable',
            selection: true,
        });
    });

    it('drops junk inside a valid entry field by field', () => {
        localStorage.setItem(
            KEY,
            JSON.stringify({ v: 1, hiddenColumns: ['code', 7, null], density: 'huge' }),
        );
        const { result } = renderHook(() => useGridPreferences('admin.courses'));
        expect(result.current.values).toMatchObject({
            hiddenColumns: ['code'],
            density: 'comfortable',
            selection: true,
        });
    });

    it('keeps working when storage throws (privacy mode, quota full)', () => {
        const broken: GridPreferenceStorage = {
            getItem: () => {
                throw new Error('blocked');
            },
            setItem: () => {
                throw new Error('quota');
            },
            removeItem: () => {
                throw new Error('blocked');
            },
        };
        const { result } = renderHook(() =>
            useGridPreferences('admin.courses', { storage: broken }),
        );
        act(() => result.current.setDensity('compact'));
        expect(result.current.values.density).toBe('compact');
    });

    it('keeps settings for this visit only with storage: null', () => {
        const { result } = renderHook(() => useGridPreferences('admin.courses', { storage: null }));
        act(() => result.current.setDensity('compact'));
        expect(result.current.values.density).toBe('compact');
        expect(localStorage.length).toBe(0);
    });

    it('follows a change made in another tab', () => {
        const { result } = renderHook(() => useGridPreferences('admin.courses'));
        const value = JSON.stringify({ v: 1, hiddenColumns: ['code'], density: 'compact' });
        act(() => {
            localStorage.setItem(KEY, value);
            window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: value }));
        });
        expect(result.current.isColumnVisible('code')).toBe(false);
    });

    it('ignores another grid changing in another tab', () => {
        const { result } = renderHook(() => useGridPreferences('admin.courses'));
        const other = gridPreferencesKey('admin.users');
        act(() => {
            localStorage.setItem(
                other,
                JSON.stringify({ v: 1, hiddenColumns: ['code'], density: 'compact' }),
            );
            window.dispatchEvent(new StorageEvent('storage', { key: other }));
        });
        expect(result.current.isColumnVisible('code')).toBe(true);
    });

    it('does not treat a fresh defaults object each render as a change', () => {
        const { result, rerender } = renderHook(() =>
            useGridPreferences('admin.courses', { defaults: { density: 'compact' } }),
        );
        act(() => result.current.setColumnVisible('code', false));
        rerender();
        expect(result.current.isColumnVisible('code')).toBe(false);
    });
});
