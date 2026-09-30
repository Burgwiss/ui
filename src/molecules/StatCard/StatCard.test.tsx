import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatCard } from './StatCard';

describe('StatCard', () => {
    it('renders the label, value and hint', () => {
        render(<StatCard label="Teilnehmende" value={1284} hint="12 neu diese Woche" />);
        expect(screen.getByText('Teilnehmende')).toBeInTheDocument();
        expect(screen.getByText('1284')).toBeInTheDocument();
        expect(screen.getByText('12 neu diese Woche')).toBeInTheDocument();
    });

    it('accepts a node as the value', () => {
        render(<StatCard label="Umsatz" value={<strong>1.234 €</strong>} />);
        expect(screen.getByText('1.234 €').tagName).toBe('STRONG');
    });

    it('omits the hint when not given', () => {
        const { container } = render(<StatCard label="Aktive Kurse" value={48} />);
        expect(container.querySelectorAll('p')).toHaveLength(1);
    });

    it('a zero value still renders (it is a real number, not "nothing")', () => {
        render(<StatCard label="Offen" value={0} />);
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('marks a decorative icon aria-hidden', () => {
        render(<StatCard label="x" value={1} icon={<svg data-testid="i" />} />);
        expect(screen.getByTestId('i').closest('[aria-hidden="true"]')).not.toBeNull();
    });

    it('renders no icon wrapper without an icon', () => {
        const { container } = render(<StatCard label="x" value={1} />);
        expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
    });

    it('merges a caller className onto the card', () => {
        const { container } = render(<StatCard label="x" value={1} className="w-64" />);
        expect((container.firstChild as HTMLElement).className).toContain('w-64');
    });
});
