import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../src/lib/color';

/**
 * WCAG 1.4.11 Non-text Contrast: the focus indicator (`--ring`) needs 3:1
 * against every surface a focusable control sits on — issue
 * Burgwiss/burgwiss#1271. theme.css used to say "nothing automated will catch
 * a regression here … this comment IS the test". This is the test.
 *
 * It reads the token values straight from theme.css, so editing a surface or
 * the ring in either mode re-measures the pair. Since #1558 the ring is also
 * drawn INSIDE a highlighted menu item, on `--muted`, so muted is a surface too.
 */
const css = readFileSync(resolve(__dirname, '../src/tokens/theme.css'), 'utf8');

function tokens(marker: string): Map<string, string> {
    const start = css.indexOf(marker);
    expect(start, `${marker} not found`).toBeGreaterThanOrEqual(0);
    const block = css.slice(start, css.indexOf('\n}', start));
    const out = new Map<string, string>();
    for (const m of block.matchAll(/^\s*(--[\w-]+):\s*(oklch\([^)]*\));/gm)) out.set(m[1]!, m[2]!);
    return out;
}

const SURFACES = ['--background', '--card', '--popover', '--muted'] as const;
const MODES = { light: tokens(':root {'), dark: tokens('.dark {') };

describe('--ring clears 3:1 against every surface it sits on', () => {
    for (const [mode, t] of Object.entries(MODES)) {
        for (const surface of SURFACES) {
            it(`${mode}: ring on ${surface}`, () => {
                const ring = t.get('--ring');
                const bg = t.get(surface);
                expect(ring, `${mode} --ring`).toBeDefined();
                expect(bg, `${mode} ${surface}`).toBeDefined();
                expect(contrastRatio(ring!, bg!)).toBeGreaterThanOrEqual(3);
            });
        }
    }

    it('light: ring on the input border colour too', () => {
        // The ring replaces the input's border on focus; theme.css measures it
        // here (3.38) and it is the tightest light pair.
        expect(
            contrastRatio(MODES.light.get('--ring')!, MODES.light.get('--input')!),
        ).toBeGreaterThanOrEqual(3);
    });

    it('can go red: the old light ring (0.708) fails', () => {
        expect(contrastRatio('oklch(0.708 0 0)', MODES.light.get('--muted')!)).toBeLessThan(3);
    });
});
