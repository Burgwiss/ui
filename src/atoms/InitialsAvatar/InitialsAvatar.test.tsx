import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InitialsAvatar } from './InitialsAvatar';

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
