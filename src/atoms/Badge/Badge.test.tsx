import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Badge } from './Badge';

describe('Badge', () => {
    it('renders its label in a span with the badge slot', () => {
        render(<Badge>Neu</Badge>);
        const badge = screen.getByText('Neu');
        expect(badge.tagName).toBe('SPAN');
        expect(badge).toHaveAttribute('data-slot', 'badge');
    });

    it('applies the solid variant classes', () => {
        render(<Badge variant="destructive">Gelöscht</Badge>);
        expect(screen.getByText('Gelöscht').className).toContain('bg-destructive');
    });

    it('a tone overrides the variant and uses the on-tint foreground token', () => {
        render(
            <Badge variant="destructive" tone="success">
                Bezahlt
            </Badge>,
        );
        const cls = screen.getByText('Bezahlt').className;
        expect(cls).toContain('bg-success/10');
        expect(cls).toContain('text-success-tint-foreground');
        expect(cls).not.toContain('bg-destructive ');
    });

    it('renders an aria-hidden dot only with a tone AND dot', () => {
        const { container, rerender } = render(<Badge tone="success">Bezahlt</Badge>);
        expect(container.querySelector('span[aria-hidden="true"]')).toBeNull();

        rerender(
            <Badge tone="success" dot>
                Bezahlt
            </Badge>,
        );
        expect(container.querySelector('span[aria-hidden="true"]')).not.toBeNull();

        rerender(<Badge dot>Bezahlt</Badge>);
        expect(container.querySelector('span[aria-hidden="true"]')).toBeNull();
    });

    it('merges a caller className', () => {
        render(<Badge className="uppercase">Neu</Badge>);
        expect(screen.getByText('Neu').className).toContain('uppercase');
    });

    it('asChild renders the child element without throwing and merges props onto it', () => {
        render(
            <Badge asChild tone="success" dot>
                <a href="#x">Zur Rechnung</a>
            </Badge>,
        );
        const link = screen.getByRole('link', { name: 'Zur Rechnung' });
        expect(link).toHaveAttribute('data-slot', 'badge');
        // Under asChild there is nothing but the caller's own child.
        expect(link.querySelector('[aria-hidden="true"]')).toBeNull();
    });

    it('forwards the ref, also through asChild', () => {
        const spanRef = createRef<HTMLSpanElement>();
        const linkRef = createRef<HTMLAnchorElement>();
        render(
            <>
                <Badge ref={spanRef}>Neu</Badge>
                <Badge asChild ref={linkRef as never}>
                    <a href="#x">Link</a>
                </Badge>
            </>,
        );
        expect(spanRef.current?.tagName).toBe('SPAN');
        expect(linkRef.current?.tagName).toBe('A');
    });
});
