/**
 * OKLCH ↔ sRGB-hex conversion.
 *
 * The branding page stores theme tokens as OKLCH strings (e.g.
 * `oklch(0.205 0 0)`) but the native HTML5 `<input type="color">`
 * picker only speaks `#rrggbb`. These helpers bridge the two so users
 * can pick visually while we persist the colour-space-correct OKLCH.
 *
 * Matrices come from Björn Ottosson's OKLab reference
 * (https://bottosson.github.io/posts/oklab/).
 */
interface OklchParts {
    L: number;
    C: number;
    H: number;
}
export declare function parseOklch(input: string): OklchParts | null;
export declare function oklchToHex(oklch: string): string | null;
export declare function hexToOklch(hex: string): string;
/**
 * WCAG 2.1 relative luminance (0..1) for an OKLCH colour string.
 *
 * #993 / admin-atlas D48 — the branding badge used `Math.pow(L, 2.4)` on the
 * OKLCH lightness as a luminance proxy. That is chroma-blind: a saturated
 * colour carries far less luminance than its lightness implies, so the number
 * was wrong in BOTH directions — it passed illegible pairs and failed
 * compliant ones (blue on white measured 3.64 where the truth is 5.13).
 *
 * The identical formula was corrected in the PHP `ContrastChecker` in #971, and
 * that fix never reached this copy. Routing through `oklchToHex` — the same
 * conversion the theme resolver uses to produce what the browser actually
 * renders — means the two implementations agree by construction rather than by
 * being edited together.
 */
export declare function wcagLuminance(oklch: string): number | null;
/**
 * WCAG contrast ratio between two OKLCH colours: 1.0 (identical) to 21.0
 * (black on white). Null when either colour cannot be parsed.
 */
export declare function contrastRatio(a: string, b: string): number | null;
export {};
