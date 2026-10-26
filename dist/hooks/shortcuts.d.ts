/**
 * Keyboard shortcuts written as plain strings: `'Mod+D'`, `'Shift+Delete'`,
 * `'Mod+Shift+E'`, `'N'`. `Mod` is ⌘ on a Mac and Ctrl everywhere else, so one
 * string works on both.
 */
export type ShortcutKeyName = 'Mod' | 'Shift' | 'Alt' | 'Delete' | 'Enter' | 'Escape';
/** How key names are written. The app passes its own language, e.g. `{ Mod: 'Strg', Delete: 'Entf' }`. */
export type ShortcutLabels = Partial<Record<ShortcutKeyName, string>>;
export declare function isMacPlatform(): boolean;
/** Does this key press match the shortcut? Modifiers must match exactly. */
export declare function matchShortcut(event: Pick<KeyboardEvent, 'key' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>, shortcut: string, mac?: boolean): boolean;
/** `'Mod+Shift+E'` → `⇧⌘E` on a Mac, `Ctrl+Shift+E` elsewhere (names overridable). */
export declare function formatShortcut(shortcut: string, labels?: ShortcutLabels, mac?: boolean): string;
