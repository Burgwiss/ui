import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import local from './tools/eslint-rules/index.js';

/**
 * The package-level guards live here. The one that matters most is
 * `no-restricted-imports`: a component in @burgwiss/ui may not know which app
 * it runs in. No router, no translation system, no app types, no HTTP — text
 * and links come in as props. That is what keeps components general instead of
 * fitted to one page.
 */
export default tseslint.config(
    { ignores: ['dist', 'storybook-static', 'node_modules'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    jsxA11y.flatConfigs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: { globals: { ...globals.browser } },
        plugins: { 'react-hooks': reactHooks, local },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'local/no-raw-tailwind-colors': 'error',
            'local/no-tint-on-tint-foreground': 'error',
            'local/icon-button-needs-label': 'error',
            'local/no-title-on-controls': 'error',
        },
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        // Example content lives in stories, tests and fixtures; components carry none.
        ignores: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/**/*.fixtures.{ts,tsx}'],
        rules: {
            'local/no-untranslated-jsx-text': 'error',
            'local/no-physical-direction': 'error',
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: [
                                '@inertiajs/*',
                                'ziggy-js',
                                'react-router*',
                                '@tanstack/react-router',
                            ],
                            message:
                                'No router in @burgwiss/ui — take an href or onClick as a prop.',
                        },
                        {
                            group: ['@/*'],
                            message:
                                'No app aliases — this package is not an app. Import relatively.',
                        },
                        {
                            group: ['axios', 'ky'],
                            message:
                                'No HTTP in @burgwiss/ui — components receive data, they do not fetch it.',
                        },
                        {
                            group: ['**/useTranslation', 'i18next', 'react-i18next'],
                            message: 'No translation system — take the text as a prop.',
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ['tools/**/*.js', 'scripts/**/*.mjs', '*.config.{js,ts}'],
        languageOptions: { globals: { ...globals.node } },
    },
    ...storybook.configs['flat/recommended'],
);
