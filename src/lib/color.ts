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

function srgbToLinear(c: number): number {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToSrgb(c: number): number {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
    const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
    if (!m || !m[1]) return null;
    const n = parseInt(m[1], 16);
    return {
        r: ((n >> 16) & 0xff) / 255,
        g: ((n >> 8) & 0xff) / 255,
        b: (n & 0xff) / 255,
    };
}

function toHex(r: number, g: number, b: number): string {
    const ch = (v: number) =>
        Math.round(clamp01(v) * 255)
            .toString(16)
            .padStart(2, '0');
    return `#${ch(r)}${ch(g)}${ch(b)}`;
}

interface OklchParts {
    L: number;
    C: number;
    H: number;
}

export function parseOklch(input: string): OklchParts | null {
    const m = input
        .trim()
        .match(
            /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+([0-9.]+(?:deg)?)\s*(?:\/\s*[0-9.]+%?\s*)?\)$/i,
        );
    if (!m || !m[1] || !m[2] || !m[3]) return null;
    const lRaw: string = m[1];
    const cRaw: string = m[2];
    const hRaw: string = m[3];
    const L = lRaw.endsWith('%') ? Number(lRaw.slice(0, -1)) / 100 : Number(lRaw);
    const C = cRaw.endsWith('%') ? (Number(cRaw.slice(0, -1)) / 100) * 0.4 : Number(cRaw);
    const H = Number(hRaw.replace(/deg$/i, ''));
    if (!Number.isFinite(L) || !Number.isFinite(C) || !Number.isFinite(H)) return null;
    return { L, C, H };
}

function oklabToLinearSrgb(L: number, a: number, b: number): { r: number; g: number; bl: number } {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ ** 3;
    const m = m_ ** 3;
    const s = s_ ** 3;
    return {
        r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        bl: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    };
}

function linearSrgbToOklab(r: number, g: number, b: number): { L: number; a: number; b: number } {
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);
    return {
        L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
        a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
        b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
    };
}

export function oklchToHex(oklch: string): string | null {
    const parts = parseOklch(oklch);
    if (!parts) return null;
    const rad = (parts.H * Math.PI) / 180;
    const a = parts.C * Math.cos(rad);
    const b = parts.C * Math.sin(rad);
    const linear = oklabToLinearSrgb(parts.L, a, b);
    return toHex(
        linearToSrgb(clamp01(linear.r)),
        linearToSrgb(clamp01(linear.g)),
        linearToSrgb(clamp01(linear.bl)),
    );
}

export function hexToOklch(hex: string): string {
    const rgb = parseHex(hex);
    if (!rgb) return 'oklch(0 0 0)';
    const lab = linearSrgbToOklab(srgbToLinear(rgb.r), srgbToLinear(rgb.g), srgbToLinear(rgb.b));
    const C = Math.hypot(lab.a, lab.b);
    let H = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
    if (H < 0) H += 360;
    const round = (n: number, d = 3) => Number(n.toFixed(d));
    return `oklch(${round(lab.L)} ${round(C)} ${round(H, 2)})`;
}

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
export function wcagLuminance(oklch: string): number | null {
    const hex = oklchToHex(oklch);
    if (hex === null) return null;
    const rgb = parseHex(hex);
    if (rgb === null) return null;

    const r = srgbToLinear(rgb.r);
    const g = srgbToLinear(rgb.g);
    const b = srgbToLinear(rgb.b);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * WCAG contrast ratio between two OKLCH colours: 1.0 (identical) to 21.0
 * (black on white). Null when either colour cannot be parsed.
 */
export function contrastRatio(a: string, b: string): number | null {
    const la = wcagLuminance(a);
    const lb = wcagLuminance(b);
    if (la === null || lb === null) return null;

    const lighter = Math.max(la, lb);
    const darker = Math.min(la, lb);

    return (lighter + 0.05) / (darker + 0.05);
}
