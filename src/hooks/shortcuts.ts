/**
 * Keyboard shortcuts written as plain strings: `'Mod+D'`, `'Shift+Delete'`,
 * `'Mod+Shift+E'`, `'N'`. `Mod` is ⌘ on a Mac and Ctrl everywhere else, so one
 * string works on both.
 */

export type ShortcutKeyName = 'Mod' | 'Shift' | 'Alt' | 'Delete' | 'Enter' | 'Escape';

/** How key names are written. The app passes its own language, e.g. `{ Mod: 'Strg', Delete: 'Entf' }`. */
export type ShortcutLabels = Partial<Record<ShortcutKeyName, string>>;

export function isMacPlatform(): boolean {
    if (typeof navigator === 'undefined') return false;
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

interface ParsedShortcut {
    mod: boolean;
    shift: boolean;
    alt: boolean;
    key: string;
}

function parse(shortcut: string): ParsedShortcut {
    const parts = shortcut.split('+').map((p) => p.trim());
    const key = parts.pop() ?? '';
    const has = (name: string) => parts.some((p) => p.toLowerCase() === name);
    return { mod: has('mod'), shift: has('shift'), alt: has('alt'), key };
}

/** Does this key press match the shortcut? Modifiers must match exactly. */
export function matchShortcut(
    event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>,
    shortcut: string,
    mac: boolean = isMacPlatform(),
): boolean {
    const want = parse(shortcut);
    const mod = mac ? event.metaKey : event.ctrlKey;
    // The other platform's modifier must not be down: Ctrl+D on a Mac is not ⌘D.
    const otherMod = mac ? event.ctrlKey : event.metaKey;
    if (
        mod !== want.mod ||
        otherMod ||
        event.shiftKey !== want.shift ||
        event.altKey !== want.alt
    ) {
        return false;
    }
    const key = want.key.toLowerCase();
    const pressed = event.key.toLowerCase();
    // A Mac keyboard's "delete" key sends Backspace.
    if (key === 'delete') return pressed === 'delete' || pressed === 'backspace';
    return pressed === key;
}

const MAC: Record<ShortcutKeyName, string> = {
    Mod: '⌘',
    Shift: '⇧',
    Alt: '⌥',
    Delete: '⌫',
    Enter: '↩',
    Escape: 'esc',
};
const OTHER: Record<ShortcutKeyName, string> = {
    Mod: 'Ctrl',
    Shift: 'Shift',
    Alt: 'Alt',
    Delete: 'Del',
    Enter: 'Enter',
    Escape: 'Esc',
};

/** `'Mod+Shift+E'` → `⇧⌘E` on a Mac, `Ctrl+Shift+E` elsewhere (names overridable). */
export function formatShortcut(
    shortcut: string,
    labels: ShortcutLabels = {},
    mac: boolean = isMacPlatform(),
): string {
    const names = { ...(mac ? MAC : OTHER), ...labels };
    const { mod, shift, alt, key } = parse(shortcut);
    const named = (k: string) =>
        (names as Record<string, string>)[k] ?? (k.length === 1 ? k.toUpperCase() : k);
    const parts = [
        ...(mac ? [] : mod ? [names.Mod] : []),
        ...(alt ? [names.Alt] : []),
        ...(shift ? [names.Shift] : []),
        ...(mac && mod ? [names.Mod] : []),
        named(key),
    ];
    return parts.join(mac ? '' : '+');
}
