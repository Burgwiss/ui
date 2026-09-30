import { describe, expect, it } from 'vitest';

import { addWatched, chapterAt, formatTime, keyToCommand, watchedFraction } from './videoMath';

describe('formatTime', () => {
    it.each([
        [0, '0:00'],
        [5.9, '0:05'],
        [65, '1:05'],
        [600, '10:00'],
        [3725, '1:02:05'],
        [Number.NaN, '0:00'],
        [-3, '0:00'],
        [Number.POSITIVE_INFINITY, '0:00'],
    ])('%s s → %s', (s, text) => {
        expect(formatTime(s)).toBe(text);
    });

    it('pads minutes when the video is an hour or longer', () => {
        expect(formatTime(65, 3700)).toBe('0:01:05');
    });
});

describe('watched ranges', () => {
    it('merges overlapping and touching ranges', () => {
        let r = addWatched([], [0, 10]);
        r = addWatched(r, [5, 20]);
        r = addWatched(r, [30, 40]);
        r = addWatched(r, [20, 25]);
        expect(r).toEqual([
            [0, 25],
            [30, 40],
        ]);
    });

    it('ignores empty and backwards ranges', () => {
        expect(addWatched([[0, 5]], [7, 7])).toEqual([[0, 5]]);
        expect(addWatched([[0, 5]], [9, 7])).toEqual([[0, 5]]);
    });

    it('counts only what was seen: jumping to the end is not watching', () => {
        const ranges = addWatched(addWatched([], [0, 30]), [590, 600]);
        expect(watchedFraction(ranges, 600)).toBeCloseTo(40 / 600);
    });

    it('is 0 without a duration and never above 1', () => {
        expect(watchedFraction([[0, 10]], 0)).toBe(0);
        expect(watchedFraction([[0, 700]], 600)).toBe(1);
    });
});

describe('chapterAt', () => {
    const chapters = [
        { start: 0, title: 'Einführung' },
        { start: 60, title: 'Alif' },
        { start: 180, title: 'Ba' },
    ];

    it('finds the chapter a time falls in', () => {
        expect(chapterAt(chapters, 0)?.title).toBe('Einführung');
        expect(chapterAt(chapters, 59.9)?.title).toBe('Einführung');
        expect(chapterAt(chapters, 60)?.title).toBe('Alif');
        expect(chapterAt(chapters, 9999)?.title).toBe('Ba');
    });

    it('works with unsorted chapters and none before the first', () => {
        expect(chapterAt([...chapters].reverse(), 200)?.title).toBe('Ba');
        expect(chapterAt([{ start: 30, title: 'X' }], 10)).toBeNull();
        expect(chapterAt([], 10)).toBeNull();
    });
});

describe('keyToCommand', () => {
    const k = (key: string, extra: Partial<KeyboardEvent> = {}) =>
        ({
            key,
            shiftKey: false,
            ctrlKey: false,
            metaKey: false,
            altKey: false,
            ...extra,
        }) as KeyboardEvent;

    it.each([
        [' ', { type: 'toggle' }],
        ['k', { type: 'toggle' }],
        ['j', { type: 'seekBy', seconds: -10 }],
        ['l', { type: 'seekBy', seconds: 10 }],
        ['ArrowLeft', { type: 'seekBy', seconds: -5 }],
        ['ArrowRight', { type: 'seekBy', seconds: 5 }],
        ['ArrowUp', { type: 'volumeBy', delta: 0.1 }],
        ['ArrowDown', { type: 'volumeBy', delta: -0.1 }],
        ['m', { type: 'mute' }],
        ['f', { type: 'fullscreen' }],
        ['c', { type: 'captions' }],
        ['0', { type: 'seekTo', fraction: 0 }],
        ['5', { type: 'seekTo', fraction: 0.5 }],
        ['Home', { type: 'seekTo', fraction: 0 }],
        ['End', { type: 'seekTo', fraction: 1 }],
        ['>', { type: 'speedBy', step: 1 }],
        ['<', { type: 'speedBy', step: -1 }],
    ])('%s', (key, command) => {
        expect(keyToCommand(k(key))).toEqual(command);
    });

    it('reads K, J, L in upper case too (Caps Lock)', () => {
        expect(keyToCommand(k('K'))).toEqual({ type: 'toggle' });
    });

    it('leaves browser and system shortcuts alone', () => {
        expect(keyToCommand(k('k', { ctrlKey: true }))).toBeNull();
        expect(keyToCommand(k('f', { metaKey: true }))).toBeNull();
        expect(keyToCommand(k('ArrowLeft', { altKey: true }))).toBeNull();
        expect(keyToCommand(k('x'))).toBeNull();
    });
});
