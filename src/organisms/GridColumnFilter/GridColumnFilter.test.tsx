import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { GridColumnFilter } from './GridColumnFilter';

const props = {
    title: 'Status',
    filterLabel: 'Status filtern',
    allLabel: 'Alle',
    options: [
        { value: 'published', label: 'Veröffentlicht' },
        { value: 'draft', label: 'Entwurf' },
    ],
};

describe('GridColumnFilter', () => {
    it('reports the chosen option', async () => {
        const onChange = vi.fn();
        render(<GridColumnFilter {...props} value="" onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'Status filtern' }));
        await userEvent.click(screen.getByRole('menuitem', { name: 'Entwurf' }));
        expect(onChange).toHaveBeenCalledWith('draft');
    });

    it('offers "all" first, which clears the filter', async () => {
        const onChange = vi.fn();
        render(<GridColumnFilter {...props} value="draft" onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: 'Status filtern' }));
        const items = screen.getAllByRole('menuitem');
        expect(items[0]).toHaveTextContent('Alle');
        await userEvent.click(items[0]!);
        expect(onChange).toHaveBeenCalledWith('');
    });

    it('marks only the active choice', async () => {
        render(<GridColumnFilter {...props} value="draft" onChange={() => {}} />);
        await userEvent.click(screen.getByRole('button', { name: 'Status filtern' }));
        const visibleChecks = screen
            .getAllByRole('menuitem')
            .filter((item) => item.querySelector('svg.opacity-100') !== null)
            .map((item) => item.textContent);
        expect(visibleChecks).toEqual(['Entwurf']);
    });
});
