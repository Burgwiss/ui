import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AudioLevelMeter } from './AudioLevelMeter';

const segments = () => Array.from(screen.getByRole('meter').children) as HTMLElement[];
const lit = () => segments().filter((s) => s.className.includes('bg-success')).length;

describe('AudioLevelMeter', () => {
    it('is a meter named by its label, from 0 to 100', () => {
        render(<AudioLevelMeter level={0.5} label="Mikrofonpegel" />);
        const meter = screen.getByRole('meter', { name: 'Mikrofonpegel' });
        expect(meter).toHaveAttribute('aria-valuemin', '0');
        expect(meter).toHaveAttribute('aria-valuemax', '100');
    });

    it('reports the level as a percentage', () => {
        render(<AudioLevelMeter level={0.42} label="Pegel" />);
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '42');
    });

    it.each([
        [-1, '0'],
        [-0.001, '0'],
        [2, '100'],
        [Infinity, '0'],
        [NaN, '0'],
    ])('clamps level %s to %s', (level, expected) => {
        render(<AudioLevelMeter level={level} label="Pegel" />);
        expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', expected);
    });

    it('renders 12 segments by default, all decorative', () => {
        render(<AudioLevelMeter level={0.5} label="Pegel" />);
        const all = segments();
        expect(all).toHaveLength(12);
        for (const s of all) expect(s).toHaveAttribute('aria-hidden', 'true');
    });

    it('lights no segment in silence and all at full level', () => {
        const { rerender } = render(<AudioLevelMeter level={0} label="Pegel" />);
        expect(lit()).toBe(0);
        rerender(<AudioLevelMeter level={1} label="Pegel" />);
        expect(lit()).toBe(12);
    });

    it('lights a share of the segments proportional to the level', () => {
        render(<AudioLevelMeter level={0.5} label="Pegel" />);
        expect(lit()).toBe(6);
    });

    it('lights the first segments, not scattered ones', () => {
        render(<AudioLevelMeter level={0.25} label="Pegel" />);
        const states = segments().map((s) => s.className.includes('bg-success'));
        expect(states.slice(0, 3)).toEqual([true, true, true]);
        expect(states.slice(3).some(Boolean)).toBe(false);
    });

    it('honours a custom segment count', () => {
        render(<AudioLevelMeter level={0.5} label="Pegel" segments={4} />);
        expect(segments()).toHaveLength(4);
        expect(lit()).toBe(2);
    });

    it('merges a caller className', () => {
        render(<AudioLevelMeter level={0.5} label="Pegel" className="flex-1" />);
        expect(screen.getByRole('meter').className).toContain('flex-1');
    });
});
