import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToOklch, oklchToHex, parseOklch } from './color';

/**
 * The branding badge's `approxContrast` used
 * `Math.pow(L, 2.4)` on OKLCH lightness, which ignores chroma. The same formula
 * was corrected in a server-side checker and that fix never reached the
 * TypeScript copy, so the number the admin actually reads stayed wrong.
 *
 * These expectations are independently-known WCAG values, not outputs captured
 * from the implementation — a test calibrated against a broken ruler is how the
 * first attempt at this fix  made the page worse.
 */
describe('contrastRatio', () => {
    it('gives the canonical 21:1 for black on white', () => {
        const ratio = contrastRatio('oklch(0 0 0)', 'oklch(1 0 0)');

        expect(ratio).not.toBeNull();
        expect(ratio!).toBeGreaterThan(20.9);
        expect(ratio!).toBeLessThan(21.1);
    });

    it('gives 1:1 for a colour against itself', () => {
        expect(contrastRatio('oklch(0.5 0.2 250)', 'oklch(0.5 0.2 250)')!).toBeCloseTo(1, 5);
    });

    it('is symmetric', () => {
        const a = contrastRatio('oklch(0.2 0.05 30)', 'oklch(0.95 0 0)')!;
        const b = contrastRatio('oklch(0.95 0 0)', 'oklch(0.2 0.05 30)')!;

        expect(a).toBeCloseTo(b, 10);
    });

    /**
     * The bug in one assertion: pale yellow is very light (L≈0.95) but highly
     * chromatic, so near-white text on it is illegible. The chroma-blind proxy
     * reported a comfortable pass here.
     */
    it('fails near-white text on a pale saturated yellow', () => {
        const ratio = contrastRatio('oklch(0.985 0 0)', 'oklch(0.95 0.19 105)')!;

        expect(ratio).toBeLessThan(2);
    });

    it('passes white text on a genuinely dark primary', () => {
        // The control: a real, compliant pair must still pass, or the fix would
        // just be "fail everything".
        const ratio = contrastRatio('oklch(0.985 0 0)', 'oklch(0.205 0 0)')!;

        expect(ratio).toBeGreaterThan(4.5);
    });

    it('returns null for unparseable input rather than a misleading number', () => {
        expect(contrastRatio('not-a-colour', 'oklch(1 0 0)')).toBeNull();
        expect(contrastRatio('oklch(1 0 0)', '')).toBeNull();
    });
});

describe('parseOklch', () => {
    it('parses plain, percent and deg forms', () => {
        expect(parseOklch('oklch(0.5 0.2 250)')).toEqual({ L: 0.5, C: 0.2, H: 250 });
        expect(parseOklch('oklch(50% 50% 250deg)')).toEqual({ L: 0.5, C: 0.2, H: 250 });
    });

    it('ignores an alpha channel', () => {
        expect(parseOklch('oklch(0.5 0.2 250 / 0.5)')).toEqual({ L: 0.5, C: 0.2, H: 250 });
    });

    it('rejects anything that is not an oklch() string', () => {
        expect(parseOklch('#ffffff')).toBeNull();
        expect(parseOklch('oklch(a b c)')).toBeNull();
        expect(parseOklch('')).toBeNull();
    });
});

describe('oklchToHex / hexToOklch', () => {
    it('maps the achromatic extremes', () => {
        expect(oklchToHex('oklch(0 0 0)')).toBe('#000000');
        expect(oklchToHex('oklch(1 0 0)')).toBe('#ffffff');
    });

    it('returns null for an unparseable oklch string', () => {
        expect(oklchToHex('nope')).toBeNull();
    });

    it('falls back to black for an invalid hex', () => {
        expect(hexToOklch('not-a-hex')).toBe('oklch(0 0 0)');
    });

    it('round-trips a hex colour to within one channel step', () => {
        for (const hex of ['#3493b0', '#ff0000', '#00ff00', '#0000ff', '#808080']) {
            const back = oklchToHex(hexToOklch(hex));
            expect(back).not.toBeNull();
            for (let i = 1; i < 7; i += 2) {
                const a = parseInt(hex.slice(i, i + 2), 16);
                const b = parseInt((back as string).slice(i, i + 2), 16);
                expect(Math.abs(a - b)).toBeLessThanOrEqual(2);
            }
        }
    });

    it('accepts a hex without the leading #', () => {
        expect(hexToOklch('ffffff')).toBe(hexToOklch('#ffffff'));
    });
});
