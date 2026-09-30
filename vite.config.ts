import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/*
 * Two test projects:
 *  - unit       jsdom: behaviour tests + every story rendered and axe-checked
 *               (tests/stories.test.tsx). Fast; `npm test`, part of `npm run check`.
 *  - storybook  the same stories in a REAL Chromium via @storybook/addon-vitest.
 *               Sees what jsdom cannot — layout, real colour contrast — and is
 *               what the Storybook MCP's `test-run` tool runs. `npm run test:browser`.
 */
/**
 * Library build: ESM + one JS file per entry, every peer and runtime dependency
 * left external so the consuming app has exactly one React, one Radix, one
 * lucide. Types come from `tsc -p tsconfig.build.json`; the CSS files are copied
 * as SOURCE (scripts/copy-css.mjs) because the consuming app's Tailwind must
 * compile them together with its own classes.
 */
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: 'index',
        },
        rollupOptions: {
            external: (id) => !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0'),
        },
        sourcemap: true,
        emptyOutDir: true,
    },
    test: {
        // Coverage for the Storybook "Run tests" widget and `vitest --coverage`:
        // component source only.
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.stories.tsx',
                'src/**/*.test.{ts,tsx}',
                'src/**/*.fixtures.ts',
                'src/pages/**',
            ],
        },
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    environment: 'jsdom',
                    globals: true,
                    setupFiles: ['./tests/setup.ts'],
                    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
                    css: false,
                },
            },
            {
                extends: true,
                plugins: [
                    storybookTest({
                        configDir: path.join(dirname, '.storybook'),
                    }),
                ],
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        instances: [
                            {
                                browser: 'chromium',
                            },
                        ],
                    },
                },
            },
        ],
    },
});
