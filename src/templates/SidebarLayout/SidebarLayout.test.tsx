import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SidebarLayout } from './SidebarLayout';

describe('SidebarLayout', () => {
    it('puts the sidebar before main on the left', () => {
        const { container } = render(
            <SidebarLayout sidebar={<aside aria-label="Seite">s</aside>}>m</SidebarLayout>,
        );
        const [first, second] = Array.from(container.firstElementChild?.children ?? []);
        expect(first?.tagName).toBe('ASIDE');
        expect(second?.tagName).toBe('MAIN');
    });

    it('puts main first on the right, so reading and Tab order match the screen', () => {
        const { container } = render(
            <SidebarLayout side="right" sidebar={<aside aria-label="Seite">s</aside>}>
                m
            </SidebarLayout>,
        );
        const [first, second] = Array.from(container.firstElementChild?.children ?? []);
        expect(first?.tagName).toBe('MAIN');
        expect(second?.tagName).toBe('ASIDE');
    });

    it('renders the content in a main landmark', () => {
        render(<SidebarLayout sidebar={null}>Inhalt</SidebarLayout>);
        expect(screen.getByRole('main')).toHaveTextContent('Inhalt');
    });
});
