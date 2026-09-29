import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

import { GridActions } from '../../organisms/GridActions';
import { GridPage } from './GridPage';

const base = {
    title: 'Kurse',
    actions: (
        <GridActions label="Kurs-Aktionen">
            <button type="button">Neu</button>
        </GridActions>
    ),
    search: { value: '', onChange: () => {}, placeholder: 'Kurse suchen' },
    children: <p>grid</p>,
};

describe('GridPage', () => {
    it('keeps a page heading for screen readers without showing one', () => {
        render(<GridPage {...base} />);
        const h1 = screen.getByRole('heading', { level: 1, name: 'Kurse' });
        expect(h1).toHaveClass('sr-only');
    });

    it('puts the actions and the search in the toolbar', () => {
        render(<GridPage {...base} />);
        expect(screen.getByRole('toolbar', { name: 'Kurs-Aktionen' })).toBeInTheDocument();
        expect(screen.getByRole('searchbox', { name: 'Kurse suchen' })).toBeInTheDocument();
    });

    it('swaps the actions for the selection toolbar while rows are selected', async () => {
        const onClear = vi.fn();
        render(
            <GridPage
                {...base}
                selection={{
                    count: 2,
                    label: '2 ausgewählt',
                    clearLabel: 'Auswahl aufheben',
                    onClear,
                    actions: <button type="button">Löschen</button>,
                }}
            />,
        );
        expect(screen.queryByRole('toolbar', { name: 'Kurs-Aktionen' })).not.toBeInTheDocument();
        expect(screen.getByRole('toolbar', { name: '2 ausgewählt' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Auswahl aufheben' }));
        expect(onClear).toHaveBeenCalledOnce();
    });

    it('shows the normal actions again when the selection is empty', () => {
        render(
            <GridPage
                {...base}
                selection={{
                    count: 0,
                    label: '',
                    clearLabel: 'x',
                    onClear: () => {},
                    actions: null,
                }}
            />,
        );
        expect(screen.getByRole('toolbar', { name: 'Kurs-Aktionen' })).toBeInTheDocument();
    });

    it('has no axe violations', async () => {
        const { container } = render(<GridPage {...base} footer={<span>1–3 von 3</span>} />);
        expect(await axe(container)).toHaveNoViolations();
    });
});
