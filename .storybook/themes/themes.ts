import { GENERATED_PRESET_PREVIEWS } from './presets.generated';

/**
 * The themes the Storybook toolbar offers: Burgwiss's design presets, as the
 * Burgwiss ThemeResolver renders them (see scripts/sync-themes.mjs). Each is
 * a class; putting it on <html> re-skins every story.
 */
export interface StoryTheme {
    id: string;
    /** Toolbar and page title. */
    title: string;
    /** One line: what the theme is for. */
    summary: string;
    /** The class its CSS is scoped to. */
    scope: string;
    css: string;
}

const ABOUT: Record<string, { title: string; summary: string }> = {
    default: {
        title: 'Standard',
        summary:
            'Neutral, das Grundthema jeder neuen Schule. Schwarz-weiß, mittlere Rundung, Geist.',
    },
    institutional: {
        title: 'Burgwiss',
        summary:
            'Die Burgwiss-Marke: Navy und Messing, Source Serif / Public Sans / IBM Plex Mono, fast eckig, ohne Animation.',
    },
    modern: {
        title: 'Modern',
        summary: 'Hell, kontrastreich, großzügig: Indigo, große Überschriften, luftige Abstände.',
    },
    editorial: {
        title: 'Editorial',
        summary: 'Warmes Papier, Serifen, kompakt und ruhig — für eine Schule mit Druck-Tradition.',
    },
};

export const THEMES: StoryTheme[] = GENERATED_PRESET_PREVIEWS.map((p) => ({
    id: p.name,
    title: ABOUT[p.name]?.title ?? p.name,
    summary: ABOUT[p.name]?.summary ?? '',
    scope: p.scope,
    css: p.css,
}));

export const DEFAULT_THEME = 'default';

/** Every preset's CSS, once. Scoped by class, so all can sit in one sheet. */
export function installThemeStyles(doc: Document = document): void {
    if (doc.getElementById('bw-storybook-themes')) return;
    const style = doc.createElement('style');
    style.id = 'bw-storybook-themes';
    style.textContent = THEMES.map((t) => t.css).join('\n');
    doc.head.appendChild(style);
}

/** Put one theme (and mode) on an element, removing any other theme class. */
export function applyTheme(el: HTMLElement, themeId: string, dark: boolean): void {
    for (const t of THEMES) el.classList.remove(t.scope);
    const theme =
        THEMES.find((t) => t.id === themeId) ?? THEMES.find((t) => t.id === DEFAULT_THEME);
    if (theme) el.classList.add(theme.scope);
    el.classList.toggle('dark', dark);
}
