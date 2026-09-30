import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Pages are prototypes: stories only, never part of the package. An app that
 * imported one would ship example content as its real page.
 */
const root = resolve(__dirname, '..');
const pagesDir = join(root, 'src/pages');

describe('src/pages', () => {
    const pages = readdirSync(pagesDir).filter((n) => statSync(join(pagesDir, n)).isDirectory());

    it('has at least one page', () => {
        expect(pages.length).toBeGreaterThan(0);
    });

    it.each(pages)('%s holds only stories', (page) => {
        const files = readdirSync(join(pagesDir, page));
        expect(files.filter((f) => !f.endsWith('.stories.tsx'))).toEqual([]);
    });

    it('is never exported from the package', () => {
        const index = readFileSync(join(root, 'src/index.ts'), 'utf8');
        expect(index).not.toMatch(/['"]\.\/pages/);
    });
});
