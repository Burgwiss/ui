import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { resizableWidthKey, useResizableWidth } from './useResizableWidth';

afterEach(() => localStorage.clear());
const opts = { storageKey: 'panel', defaultWidth: 280, minWidth: 200, maxWidth: 560 };

describe('useResizableWidth', () => {
    it('starts at the default', () => {
        const { result } = renderHook(() => useResizableWidth(opts));
        expect(result.current.width).toBe(280);
    });

    it('clamps to min and max', () => {
        const { result } = renderHook(() => useResizableWidth(opts));
        act(() => result.current.setWidth(50));
        expect(result.current.width).toBe(200);
        act(() => result.current.setWidth(9000));
        expect(result.current.width).toBe(560);
    });

    it('remembers the width across mounts', () => {
        const first = renderHook(() => useResizableWidth(opts));
        act(() => first.result.current.setWidth(333.6));
        first.unmount();
        expect(JSON.parse(localStorage.getItem(resizableWidthKey('panel')) ?? '{}')).toEqual({
            v: 1,
            width: 334,
        });
        const second = renderHook(() => useResizableWidth(opts));
        expect(second.result.current.width).toBe(334);
    });

    it('reset goes back to the default and forgets', () => {
        const { result } = renderHook(() => useResizableWidth(opts));
        act(() => result.current.setWidth(400));
        act(() => result.current.reset());
        expect(result.current.width).toBe(280);
        expect(localStorage.getItem(resizableWidthKey('panel'))).toBeNull();
    });

    it('pulls a stored width that is now out of range back in', () => {
        localStorage.setItem(resizableWidthKey('panel'), JSON.stringify({ v: 1, width: 900 }));
        const { result } = renderHook(() => useResizableWidth(opts));
        expect(result.current.width).toBe(560);
    });

    it.each(['{bad', JSON.stringify({ v: 2, width: 300 }), JSON.stringify({ v: 1, width: 'x' })])(
        'ignores an unreadable entry: %s',
        (raw) => {
            localStorage.setItem(resizableWidthKey('panel'), raw);
            const { result } = renderHook(() => useResizableWidth(opts));
            expect(result.current.width).toBe(280);
        },
    );

    it('stores nothing without a storageKey', () => {
        const { result } = renderHook(() => useResizableWidth({ ...opts, storageKey: undefined }));
        act(() => result.current.setWidth(400));
        expect(result.current.width).toBe(400);
        expect(localStorage.length).toBe(0);
    });

    it('follows another tab', () => {
        const { result } = renderHook(() => useResizableWidth(opts));
        act(() => {
            localStorage.setItem(resizableWidthKey('panel'), JSON.stringify({ v: 1, width: 444 }));
            window.dispatchEvent(new StorageEvent('storage', { key: resizableWidthKey('panel') }));
        });
        expect(result.current.width).toBe(444);
    });
});
