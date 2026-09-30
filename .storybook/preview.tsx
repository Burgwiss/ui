import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';

import './storybook.css';

import { applyLocale, DEFAULT_LOCALE, LocaleProvider, LOCALES, type StoryLocale } from './locale';
import { applyTheme, DEFAULT_THEME, installThemeStyles, THEMES } from './themes/themes';

/**
 * Three toolbars re-skin every story:
 *  - Language: what stories say, plus `lang` / `dir` on <html> (see locale.tsx).
 *  - Theme: Burgwiss's design presets, as its ThemeResolver renders them.
 *    Components only ever read tokens, so a theme is just a class on <html>.
 *  - Mode: light / dark (the `.dark` class, as the apps set it).
 */
function ThemeFrame({
    mode,
    theme,
    locale,
    children,
}: {
    mode: string;
    theme: string;
    locale: StoryLocale;
    children: ReactNode;
}) {
    useEffect(() => {
        installThemeStyles();
        applyTheme(document.documentElement, theme, mode === 'dark');
        applyLocale(document.documentElement, locale);
    }, [mode, theme, locale]);
    return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}

const withTheme: Decorator = (Story, context) => (
    <ThemeFrame
        mode={context.globals.mode as string}
        theme={context.globals.theme as string}
        locale={(context.globals.locale as StoryLocale) ?? DEFAULT_LOCALE}
    >
        <Story />
    </ThemeFrame>
);

const preview: Preview = {
    decorators: [withTheme],
    globalTypes: {
        locale: {
            description: 'Sprache der Beispieltexte',
            toolbar: {
                title: 'Sprache',
                icon: 'globe',
                items: LOCALES.map((l) => ({
                    value: l.id,
                    title: l.title,
                    right: l.dir === 'rtl' ? 'RTL' : undefined,
                })),
                dynamicTitle: true,
            },
        },
        mode: {
            description: 'Colour mode',
            toolbar: {
                title: 'Mode',
                icon: 'mirror',
                items: ['light', 'dark'],
                dynamicTitle: true,
            },
        },
        theme: {
            description: 'Theme',
            toolbar: {
                title: 'Theme',
                icon: 'paintbrush',
                items: THEMES.map((t) => ({ value: t.id, title: t.title })),
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { mode: 'light', theme: DEFAULT_THEME, locale: DEFAULT_LOCALE },
    parameters: {
        layout: 'centered',
        controls: { expanded: true },
        a11y: { test: 'error' },
        options: {
            storySort: {
                order: [
                    'Einführung',
                    'Tokens',
                    'Themes',
                    ['Vergleich', '*'],
                    'Richtlinien',
                    'Atoms',
                    'Molecules',
                    'Organisms',
                    'Templates',
                    'Pages',
                    ['Einleitung', '*'],
                ],
            },
        },
    },
};

export default preview;
