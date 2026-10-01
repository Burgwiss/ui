import { describe, expect, it } from 'vitest';

import { inlineArrows, isRtl } from './direction';

function tree(html: string): HTMLElement {
    document.body.innerHTML = html;
    return document.getElementById('t')!;
}

describe('isRtl', () => {
    it('is false with no dir anywhere', () => {
        expect(isRtl(tree('<div><span id="t"></span></div>'))).toBe(false);
    });

    it('is true under an rtl ancestor', () => {
        expect(isRtl(tree('<div dir="rtl"><span id="t"></span></div>'))).toBe(true);
    });

    it('lets the nearest dir win: an ltr island inside an rtl page is ltr', () => {
        expect(isRtl(tree('<div dir="rtl"><div dir="ltr"><span id="t"></span></div></div>'))).toBe(
            false,
        );
    });

    it('reads the element itself', () => {
        expect(isRtl(tree('<span id="t" dir="rtl"></span>'))).toBe(true);
    });

    it('is false for null', () => {
        expect(isRtl(null)).toBe(false);
    });
});

describe('inlineArrows', () => {
    it('runs right in ltr and left in rtl', () => {
        expect(inlineArrows(tree('<span id="t"></span>'))).toEqual({
            forward: 'ArrowRight',
            back: 'ArrowLeft',
        });
        expect(inlineArrows(tree('<p dir="rtl"><span id="t"></span></p>'))).toEqual({
            forward: 'ArrowLeft',
            back: 'ArrowRight',
        });
    });
});
