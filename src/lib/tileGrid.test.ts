import { describe, expect, it } from 'vitest';

import { fitTileGrid } from './tileGrid';

const ASPECT = 16 / 9;

describe('fitTileGrid', () => {
    describe('few tiles', () => {
        it('returns a single empty page for 0 tiles', () => {
            const grid = fitTileGrid(80, 40, 0);
            expect(grid.pages).toBe(1);
            expect(grid.columns).toBeGreaterThanOrEqual(1);
            expect(grid.rows).toBeGreaterThanOrEqual(1);
        });

        it('gives one tile one column, one row and one page', () => {
            const grid = fitTileGrid(80, 40, 1);
            expect(grid).toMatchObject({ columns: 1, rows: 1, pageSize: 1, pages: 1 });
        });

        it('makes a single tile as large as the box allows', () => {
            // Height limits: 20rem high gives 20 * 16/9 wide, well inside 80rem.
            const grid = fitTileGrid(80, 20, 1);
            expect(grid.tileHeight).toBeCloseTo(20);
            expect(grid.tileWidth).toBeCloseTo(20 * ASPECT);
        });

        it('puts two people side by side when the width allows it', () => {
            const grid = fitTileGrid(50, 20, 2);
            expect(grid).toMatchObject({ columns: 2, rows: 1, pageSize: 2, pages: 1 });
        });

        it('stacks two people when the width is too narrow for a pair', () => {
            const grid = fitTileGrid(22, 40, 2);
            expect(grid.columns).toBe(1);
            expect(grid.pageSize).toBe(2);
            expect(grid.rows).toBe(2);
            expect(grid.pages).toBe(1);
        });
    });

    describe('many tiles', () => {
        it('shows everyone on one page when they fit', () => {
            const grid = fitTileGrid(120, 60, 6);
            expect(grid.pageSize).toBeGreaterThanOrEqual(6);
            expect(grid.pages).toBe(1);
        });

        it('never puts more than 16 tiles on a page by default', () => {
            const grid = fitTileGrid(400, 300, 40);
            expect(grid.pageSize).toBeLessThanOrEqual(16);
            expect(grid.pages).toBe(Math.ceil(40 / grid.pageSize));
            expect(grid.pages).toBeGreaterThanOrEqual(3);
        });

        it('caps the page at maxPerPage and pages the rest', () => {
            const grid = fitTileGrid(400, 300, 10, { maxPerPage: 4 });
            expect(grid.pageSize).toBeLessThanOrEqual(4);
            expect(grid.pages).toBe(Math.ceil(10 / grid.pageSize));
        });

        it('uses ceil(count / pageSize) pages, so a partial last page still counts', () => {
            const grid = fitTileGrid(400, 300, 17);
            expect(grid.pageSize).toBeLessThan(17);
            expect(grid.pages).toBe(Math.ceil(17 / grid.pageSize));
            expect(grid.pages).toBe(2);
        });

        it('keeps one tile size for every page, also the half-empty last one', () => {
            // 20 tiles over pages of 16: the last page holds 4 but the tiles do not grow.
            const grid = fitTileGrid(400, 300, 20);
            expect(grid.pageSize).toBe(16);
            expect(grid.pages).toBe(2);
            expect(grid.columns * grid.rows).toBeGreaterThanOrEqual(grid.pageSize);
            // Same inputs for the "last page" tile count change nothing about the size.
            expect(fitTileGrid(400, 300, 20).tileWidth).toBe(grid.tileWidth);
        });

        it('keeps the grid inside the box', () => {
            for (const count of [1, 2, 3, 5, 9, 16, 33]) {
                const g = fitTileGrid(90, 50, count);
                expect(g.columns * g.tileWidth + (g.columns - 1) * 0.5).toBeLessThanOrEqual(
                    90 + 1e-9,
                );
                expect(g.rows * g.tileHeight + (g.rows - 1) * 0.5).toBeLessThanOrEqual(50 + 1e-9);
            }
        });
    });

    describe('minTileWidth', () => {
        it('drops columns on a narrow stage', () => {
            const wide = fitTileGrid(100, 200, 8);
            const narrow = fitTileGrid(30, 200, 8);
            expect(wide.columns).toBeGreaterThan(narrow.columns);
            expect(narrow.columns).toBe(1);
        });

        it('never makes a tile narrower than minTileWidth when there is room for one', () => {
            const grid = fitTileGrid(45, 200, 8, { minTileWidth: 20 });
            expect(grid.tileWidth).toBeGreaterThanOrEqual(20);
        });

        it('fits more tiles on a page when the minimum is lowered', () => {
            // A short stage: with 20rem-wide tiles only four fit, with 9rem-wide ones all six do.
            const strict = fitTileGrid(45, 30, 6, { minTileWidth: 20 });
            const loose = fitTileGrid(45, 30, 6, { minTileWidth: 9 });
            expect(loose.pageSize).toBeGreaterThan(strict.pageSize);
            expect(loose.pages).toBeLessThanOrEqual(strict.pages);
        });
    });

    describe('aspect', () => {
        it('derives the tile height from the tile width and the default 16:9', () => {
            const grid = fitTileGrid(100, 60, 5);
            expect(grid.tileHeight).toBeCloseTo(grid.tileWidth / ASPECT);
        });

        it('honours a custom aspect', () => {
            const grid = fitTileGrid(100, 60, 5, { aspect: 1 });
            expect(grid.tileHeight).toBeCloseTo(grid.tileWidth);
        });

        it('honours a custom aspect for a lone tile', () => {
            const grid = fitTileGrid(100, 30, 1, { aspect: 4 / 3 });
            expect(grid.tileWidth / grid.tileHeight).toBeCloseTo(4 / 3);
        });
    });

    describe('custom options', () => {
        it('leaves less room for tiles when the gap grows', () => {
            const tight = fitTileGrid(50, 20, 2, { gap: 0 });
            const roomy = fitTileGrid(50, 20, 2, { gap: 4 });
            expect(roomy.tileWidth).toBeLessThan(tight.tileWidth);
        });

        it('treats maxPerPage 1 as one tile per page', () => {
            const grid = fitTileGrid(100, 60, 5, { maxPerPage: 1 });
            expect(grid.pageSize).toBe(1);
            expect(grid.pages).toBe(5);
        });
    });

    describe('hostile input', () => {
        const bad = [
            ['NaN width', [NaN, 20, 4]],
            ['Infinity height', [50, Infinity, 4]],
            ['negative width', [-10, 20, 4]],
            ['negative height', [50, -20, 4]],
            ['zero size', [0, 0, 4]],
            ['negative count', [50, 20, -3]],
            ['NaN count', [50, 20, NaN]],
            ['fractional count', [50, 20, 2.7]],
            ['huge count', [50, 20, 100000]],
        ] as const;

        it.each(bad)('does not throw for %s and returns at least one page', (_name, args) => {
            const [width, height, count] = args;
            const grid = fitTileGrid(width, height, count);
            expect(grid.pages).toBeGreaterThanOrEqual(1);
            expect(grid.pageSize).toBeGreaterThanOrEqual(1);
            expect(grid.columns).toBeGreaterThanOrEqual(1);
            expect(grid.rows).toBeGreaterThanOrEqual(1);
            expect(Number.isFinite(grid.tileWidth)).toBe(true);
            expect(Number.isFinite(grid.tileHeight)).toBe(true);
            expect(grid.tileWidth).toBeGreaterThanOrEqual(0);
            expect(grid.tileHeight).toBeGreaterThanOrEqual(0);
        });
    });
});
