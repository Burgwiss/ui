import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

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
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
        css: false,
    },
});
