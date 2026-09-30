import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Registry guard: every variable-backed entry of the @theme block must be
 * re-declared in `.theme-scope`, or a scoped theme silently fails to repaint
 * that one token — the button stays the old colour while everything else
 * changes, and nothing else would notice.
 */
const css = readFileSync(resolve(__dirname, '../src/tokens/theme.css'), 'utf8');

function declarations(block: string): Map<string, string> {
    const out = new Map<string, string>();
    for (const m of block.matchAll(/^\s*(--[\w-]+):\s*((?:var|calc)\([^;]*\));/gm)) {
        out.set(m[1]!, m[2]!);
    }
    return out;
}

function blockAfter(marker: string): string {
    const start = css.indexOf(marker);
    expect(start, `${marker} not found`).toBeGreaterThanOrEqual(0);
    return css.slice(start, css.indexOf('\n}\n', start));
}

describe('.theme-scope', () => {
    const theme = declarations(blockAfter('@theme {'));
    const scope = declarations(blockAfter('.theme-scope {'));

    it('bridges tokens at all', () => {
        expect(theme.size).toBeGreaterThan(20);
    });

    it('re-declares every variable-backed @theme entry, identically', () => {
        const missing = [...theme].filter(([k, v]) => scope.get(k) !== v).map(([k]) => k);
        expect(missing).toEqual([]);
    });
});
