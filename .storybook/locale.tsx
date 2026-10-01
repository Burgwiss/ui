import { createContext, useContext, type ReactNode } from 'react';

/**
 * The Language toolbar: which language the stories speak. The package itself
 * has no copy — every text is a prop — so this only changes what stories and
 * page prototypes pass in, plus `lang` and `dir` on <html>.
 *
 * Arabic is here for its direction: a layout that only works left-to-right
 * shows it the moment you pick العربية.
 */
export const LOCALES = [
    { id: 'de', title: 'Deutsch', dir: 'ltr' },
    { id: 'en', title: 'English', dir: 'ltr' },
    { id: 'ar', title: 'العربية', dir: 'rtl' },
    { id: 'tr', title: 'Türkçe', dir: 'ltr' },
] as const;

export type StoryLocale = (typeof LOCALES)[number]['id'];
export const DEFAULT_LOCALE: StoryLocale = 'de';

const LocaleContext = createContext<StoryLocale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: StoryLocale; children: ReactNode }) {
    return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

/** The toolbar's language, inside a story. */
export function useStoryLocale(): StoryLocale {
    return useContext(LocaleContext);
}

/** Example copy in several languages; German is the fallback for a missing one. */
export type Localized<T> = { de: T } & Partial<Record<StoryLocale, T>>;

export function pick<T>(texts: Localized<T>, locale: StoryLocale): T {
    return texts[locale] ?? texts.de;
}

/** Shorthand inside a story: `const t = useStoryText(); t({ de: 'Hallo', en: 'Hello' })`. */
export function useStoryText() {
    const locale = useStoryLocale();
    return <T,>(texts: Localized<T>) => pick(texts, locale);
}

/** The writing direction of a toolbar language. */
export function localeDir(locale: StoryLocale): 'ltr' | 'rtl' {
    return (LOCALES.find((l) => l.id === locale) ?? LOCALES[0]).dir;
}

export function applyLocale(el: HTMLElement, locale: StoryLocale): void {
    const entry = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];
    el.lang = entry.id;
    el.dir = entry.dir;
}
