import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { avatarTint, InitialsAvatar } from './InitialsAvatar';

const disc = () => screen.getByTestId('initials-avatar');

describe('InitialsAvatar', () => {
    it('renders first + last initial for two-word names', () => {
        render(<InitialsAvatar name="Ada Lovelace" />);
        expect(disc()).toHaveTextContent('AL');
    });

    it('renders first + last initial across multi-word names', () => {
        render(<InitialsAvatar name="John  Quincy   Adams" />);
        expect(disc()).toHaveTextContent('JA');
    });

    it('renders a single initial for one-word names', () => {
        render(<InitialsAvatar name="Cher" />);
        expect(disc()).toHaveTextContent('C');
    });

    it('falls back to ? for empty / whitespace names', () => {
        render(<InitialsAvatar name="   " />);
        expect(disc()).toHaveTextContent('?');
    });

    it('upper-cases lowercase initials', () => {
        render(<InitialsAvatar name="ada lovelace" />);
        expect(disc()).toHaveTextContent('AL');
    });

    it('applies the size classes', () => {
        const { rerender } = render(<InitialsAvatar name="A B" size="sm" />);
        expect(disc().className).toContain('size-9');
        rerender(<InitialsAvatar name="A B" size="lg" />);
        expect(disc().className).toContain('size-12');
        rerender(<InitialsAvatar name="A B" />);
        expect(disc().className).toContain('size-10');
    });

    it('merges caller className with base classes', () => {
        render(<InitialsAvatar name="A B" className="size-20" />);
        expect(disc().className).toContain('size-20');
        expect(disc().className).toContain('rounded-full');
    });

    it('uses the muted token by default, an inline per-name tint when colored', () => {
        const { rerender } = render(<InitialsAvatar name="Ada Lovelace" />);
        expect(disc().className).toContain('bg-muted');
        expect(disc().getAttribute('style')).toBeNull();

        rerender(<InitialsAvatar name="Ada Lovelace" colored />);
        expect(disc().className).not.toContain('bg-muted');
        expect(disc().getAttribute('style')).toMatch(/background-color/i);
    });

    it('the colour is stable per name and differs between names', () => {
        const styleFor = (name: string) => {
            const { unmount } = render(<InitialsAvatar name={name} colored />);
            const style = disc().getAttribute('style');
            unmount();
            return style;
        };
        expect(styleFor('Ada Lovelace')).toBe(styleFor('Ada Lovelace'));
        expect(styleFor('Ada Lovelace')).not.toBe(styleFor('Grace Hopper'));
    });

    it('is decorative for assistive tech', () => {
        render(<InitialsAvatar name="Ada Lovelace" />);
        expect(disc()).toHaveAttribute('aria-hidden', 'true');
    });
});

// WCAG relative luminance of an `hsl(h s% l%)` colour.
function luminance(css: string): number {
    const [h, s, l] = css.match(/[\d.]+/g)!.map(Number) as [number, number, number];
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        return l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    };
    const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * lin(f(0)) + 0.7152 * lin(f(8)) + 0.0722 * lin(f(4));
}

describe('InitialsAvatar colored contrast', () => {
    it('keeps the initials at AA contrast on their tint for every hue', () => {
        // The gate once failed on "MM" at 4.34:1 (hue ~60) with 30% text.
        let worst = { ratio: Infinity, hue: -1 };
        for (let hue = 0; hue < 360; hue++) {
            const { backgroundColor, color } = avatarTint(hue);
            const [bg, fg] = [luminance(backgroundColor), luminance(color)];
            const ratio = (Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05);
            if (ratio < worst.ratio) worst = { ratio, hue };
        }
        expect(worst.ratio, `worst hue ${worst.hue}`).toBeGreaterThanOrEqual(4.5);
    });
});
