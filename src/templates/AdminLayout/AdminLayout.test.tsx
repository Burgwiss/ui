import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminLayout } from './AdminLayout';

describe('AdminLayout', () => {
    it('puts rail, sidebar and main in reading order', () => {
        const { container } = render(
            <AdminLayout
                rail={<nav aria-label="Apps">r</nav>}
                sidebar={<aside aria-label="Kurse">s</aside>}
            >
                Seite
            </AdminLayout>,
        );
        const order = Array.from(container.querySelectorAll('nav, aside, main')).map(
            (e) => e.tagName,
        );
        expect(order).toEqual(['NAV', 'ASIDE', 'MAIN']);
        expect(screen.getByRole('main')).toHaveTextContent('Seite');
    });

    it('gives the page the full width without a sidebar', () => {
        render(<AdminLayout rail={<nav aria-label="Apps">r</nav>}>Seite</AdminLayout>);
        expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
        expect(screen.getByRole('main')).toHaveTextContent('Seite');
    });
});
