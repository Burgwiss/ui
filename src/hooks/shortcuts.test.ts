import { describe, expect, it } from 'vitest';

import { formatShortcut, matchShortcut } from './shortcuts';

const key = (
    k: string,
    mods: Partial<Record<'meta' | 'ctrl' | 'shift' | 'alt', boolean>> = {},
) => ({
    key: k,
    metaKey: !!mods.meta,
    ctrlKey: !!mods.ctrl,
    shiftKey: !!mods.shift,
    altKey: !!mods.alt,
});

describe('matchShortcut', () => {
    it('reads Mod as ⌘ on a Mac and Ctrl elsewhere', () => {
        expect(matchShortcut(key('d', { meta: true }), 'Mod+D', true)).toBe(true);
        expect(matchShortcut(key('d', { ctrl: true }), 'Mod+D', false)).toBe(true);
        expect(matchShortcut(key('d', { ctrl: true }), 'Mod+D', true)).toBe(false);
        expect(matchShortcut(key('d', { meta: true }), 'Mod+D', false)).toBe(false);
    });

    it('needs the modifiers exactly — no more, no fewer', () => {
        expect(matchShortcut(key('d'), 'Mod+D', false)).toBe(false);
        expect(matchShortcut(key('D', { ctrl: true, shift: true }), 'Mod+D', false)).toBe(false);
        expect(matchShortcut(key('E', { ctrl: true, shift: true }), 'Mod+Shift+E', false)).toBe(
            true,
        );
        expect(matchShortcut(key('n', { alt: true }), 'N', false)).toBe(false);
        expect(matchShortcut(key('n', { ctrl: true }), 'N', false)).toBe(false);
    });

    it('ignores letter case', () => {
        expect(matchShortcut(key('N'), 'n', false)).toBe(true);
        expect(matchShortcut(key('R', { shift: true }), 'Shift+R', false)).toBe(true);
    });

    it('lets Delete match the Mac delete key, which sends Backspace', () => {
        expect(matchShortcut(key('Backspace'), 'Delete', true)).toBe(true);
        expect(matchShortcut(key('Delete'), 'Delete', false)).toBe(true);
        expect(matchShortcut(key('Backspace', { shift: true }), 'Delete', true)).toBe(false);
    });

    it('does not match a different key', () => {
        expect(matchShortcut(key('e'), 'N', false)).toBe(false);
    });
});

describe('formatShortcut', () => {
    it('writes Mac symbols in Mac order', () => {
        expect(formatShortcut('Mod+Shift+E', {}, true)).toBe('⇧⌘E');
        expect(formatShortcut('Delete', {}, true)).toBe('⌫');
    });

    it('writes named keys joined by + elsewhere', () => {
        expect(formatShortcut('Mod+Shift+E', {}, false)).toBe('Ctrl+Shift+E');
        expect(formatShortcut('n', {}, false)).toBe('N');
    });

    it('takes key names in the app language', () => {
        expect(formatShortcut('Mod+D', { Mod: 'Strg' }, false)).toBe('Strg+D');
        expect(formatShortcut('Delete', { Delete: 'Entf' }, false)).toBe('Entf');
    });
});
