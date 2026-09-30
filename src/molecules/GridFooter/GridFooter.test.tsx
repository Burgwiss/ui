import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GridFooter } from './GridFooter';

const labels = { previous: 'Zurück', next: 'Weiter', pager: 'Seiten' };

describe('GridFooter', () => {
    it('disables the direction with no page to go to', () => {
        render(<GridFooter summary="1–3 von 3" onPrev={null} onNext={null} labels={labels} />);
        expect(screen.getByRole('button', { name: 'Zurück' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Weiter' })).toBeDisabled();
    });

    it('names the pager for screen readers', () => {
        render(
            <GridFooter summary="1–25 von 60" onPrev={null} onNext={() => {}} labels={labels} />,
        );
        expect(screen.getByRole('navigation', { name: 'Seiten' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Weiter' })).toBeEnabled();
    });
});
