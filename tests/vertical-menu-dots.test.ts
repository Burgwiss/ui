import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * House rule (founder, 2026-09-30): a "more actions" menu is always the
 * VERTICAL three dots (lucide `EllipsisVertical`), never the horizontal ones.
 * The one exception is the breadcrumb, where "…" stands for crumbs left out
 * rather than for a menu.
 */
const root = resolve(__dirname, '../src');
const ALLOWED = new Set(['molecules/Breadcrumb/Breadcrumb.tsx']);
const HORIZONTAL = /\b(Ellipsis|MoreHorizontal|EllipsisIcon|MoreHorizontalIcon)\b(?!Vertical)/;

function files(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? files(path) : /\.tsx?$/.test(name) ? [path] : [];
    });
}

/** The names a file imports from lucide-react. */
function lucideImports(source: string): string[] {
    return [...source.matchAll(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/g)].flatMap((m) =>
        m[1]!.split(',').map((n) => n.trim().split(/\s+as\s+/)[0]!),
    );
}

describe('menu dots', () => {
    const all = files(root);

    it('finds the files it guards', () => {
        expect(all.length).toBeGreaterThan(50);
    });

    it.each(all.map((f) => f.slice(root.length + 1)).filter((f) => !ALLOWED.has(f)))(
        '%s uses the vertical dots for a menu',
        (file) => {
            const horizontal = lucideImports(readFileSync(join(root, file), 'utf8')).filter((n) =>
                HORIZONTAL.test(n),
            );
            expect(horizontal, 'use EllipsisVertical').toEqual([]);
        },
    );

    it('catches the horizontal dots, so the rule is not vacuous', () => {
        expect(
            lucideImports("import { Ellipsis, X } from 'lucide-react';").filter((n) =>
                HORIZONTAL.test(n),
            ),
        ).toEqual(['Ellipsis']);
        expect(
            lucideImports("import { EllipsisVertical } from 'lucide-react';").filter((n) =>
                HORIZONTAL.test(n),
            ),
        ).toEqual([]);
    });
});
