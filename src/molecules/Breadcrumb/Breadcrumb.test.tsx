import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from './Breadcrumb';

function Trail() {
    return (
        <Breadcrumb aria-label="Brotkrumen">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/kurse">Kurse</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbEllipsis srLabel="Weitere Ebenen" />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Lektionen</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}

describe('Breadcrumb', () => {
    it('is a navigation landmark named by the caller (no baked-in English label)', () => {
        render(<Trail />);
        expect(screen.getByRole('navigation', { name: 'Brotkrumen' })).toBeInTheDocument();
    });

    it('has no accessible name unless the caller supplies one', () => {
        render(
            <Breadcrumb>
                <BreadcrumbList />
            </Breadcrumb>,
        );
        expect(screen.getByRole('navigation')).not.toHaveAttribute('aria-label');
    });

    it('renders an ordered list of items with a real link', () => {
        render(<Trail />);
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Kurse' })).toHaveAttribute('href', '/kurse');
    });

    it('marks the current page with aria-current, as plain text rather than a disabled link', () => {
        render(<Trail />);
        const page = screen.getByText('Lektionen');
        expect(page).toHaveAttribute('aria-current', 'page');
        expect(page).not.toHaveAttribute('role');
        expect(page).not.toHaveAttribute('aria-disabled');
    });

    it('hides separators from assistive tech', () => {
        const { container } = render(<Trail />);
        const separators = container.querySelectorAll('[data-slot="breadcrumb-separator"]');
        expect(separators).toHaveLength(2);
        for (const s of separators) {
            expect(s).toHaveAttribute('aria-hidden', 'true');
        }
    });

    it('lets a separator carry custom content', () => {
        render(
            <Breadcrumb aria-label="x">
                <BreadcrumbList>
                    <BreadcrumbSeparator>/</BreadcrumbSeparator>
                </BreadcrumbList>
            </Breadcrumb>,
        );
        expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('announces the ellipsis through srLabel, without hiding the wrapper', () => {
        render(<Trail />);
        const label = screen.getByText('Weitere Ebenen');
        expect(label).toHaveClass('sr-only');
        expect(label.closest('[aria-hidden="true"]')).toBeNull();
    });

    it("asChild renders the caller's own element and merges the link styling onto it", () => {
        render(
            <Breadcrumb aria-label="x">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild className="font-bold">
                            <a href="/router" className="eigene-klasse">
                                Start
                            </a>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>,
        );
        const link = screen.getByRole('link', { name: 'Start' });
        expect(link.className).toContain('eigene-klasse');
        expect(link.className).toContain('font-bold');
        expect(link.className).toContain('hover:text-foreground');
    });

    it('links get the 44px touch floor on coarse pointers only', () => {
        render(<Trail />);
        const cls = screen.getByRole('link', { name: 'Kurse' }).className;
        expect(cls).toContain('pointer-coarse:min-h-11');
    });
});
