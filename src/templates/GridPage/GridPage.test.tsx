import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useGrid, type GridActionItem, type GridApi, type RowId } from '../../hooks';
import { GridPage, type GridPageProps } from './GridPage';

afterEach(() => localStorage.clear());

const icon = <svg aria-hidden="true" />;
const ROWS = [
    { id: 1, name: 'Eins' },
    { id: 2, name: 'Zwei' },
    { id: 3, name: 'Drei' },
];
function actions(onDelete = vi.fn()): GridActionItem[] {
    return [
        { id: 'new', label: 'Neu', icon, onSelect: () => {}, tone: 'primary' },
        { id: 'edit', label: 'Bearbeiten', icon, onSelect: () => {}, when: ['one'] },
        {
            id: 'delete',
            label: 'Löschen',
            icon,
            onSelect: onDelete,
            when: ['one', 'many'],
            shortcut: 'Delete',
        },
    ];
}

type Row = { id: number; name: string };
const current: { api?: GridApi<Row> } = {};
function Page({
    items = actions(),
    selected = [],
    onGrid = (grid: GridApi<Row>) => {
        current.api = grid;
    },
    ...props
}: Partial<GridPageProps<Row>> & {
    items?: GridActionItem[];
    selected?: RowId[];
    onGrid?: (grid: GridApi<Row>) => void;
}) {
    const grid = useGrid({
        id: 'test',
        rows: ROWS,
        getRowId: (r) => r.id,
        columns: [{ id: 'name', header: 'Name' }],
        actions: items,
        defaultSelectedIds: selected,
    });
    useEffect(() => onGrid(grid));
    return (
        <GridPage
            title="Kurse"
            actionsLabel="Kurs-Aktionen"
            grid={grid}
            search={{ value: '', onChange: () => {}, placeholder: 'Kurse suchen' }}
            selectionLabels={{ count: (n) => `${n} ausgewählt`, clear: 'Auswahl aufheben' }}
            {...props}
        >
            <table aria-label="Kurse" {...grid.getTableProps()}>
                <tbody>
                    {ROWS.map((r) => (
                        <tr key={r.id} {...grid.getRowProps(r.id)}>
                            <td>{r.name}</td>
                            <td>x</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </GridPage>
    );
}

describe('GridPage', () => {
    it('keeps a page heading for screen readers without showing one', () => {
        render(<Page />);
        expect(screen.getByRole('heading', { level: 1, name: 'Kurse' })).toHaveClass('sr-only');
    });

    it('puts the actions, the search and the options menu in the toolbar row', () => {
        render(<Page options={<button type="button">Optionen</button>} />);
        expect(screen.getByRole('toolbar', { name: 'Kurs-Aktionen' })).toBeInTheDocument();
        expect(screen.getByRole('searchbox', { name: 'Kurse suchen' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Optionen' })).toBeInTheDocument();
    });

    it('names the toolbar after the page when no actionsLabel is given', () => {
        render(<Page actionsLabel={undefined} />);
        expect(screen.getByRole('toolbar', { name: 'Kurse' })).toBeInTheDocument();
    });

    it('shows the list actions and no count with nothing selected', () => {
        render(<Page />);
        expect(screen.getByRole('button', { name: 'Neu' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Bearbeiten' })).not.toBeInTheDocument();
        expect(screen.queryByText(/ausgewählt/)).not.toBeInTheDocument();
    });

    it('follows a row click: count, single-row actions, list actions gone', async () => {
        render(<Page />);
        await userEvent.click(screen.getByText('Zwei'));
        expect(screen.getByText('1 ausgewählt')).toHaveAttribute('aria-live', 'polite');
        expect(screen.getByRole('button', { name: 'Bearbeiten' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Neu' })).not.toBeInTheDocument();
    });

    it('clears the selection from the toolbar', async () => {
        render(<Page selected={[1, 2]} />);
        await userEvent.click(screen.getByRole('button', { name: 'Auswahl aufheben' }));
        expect(current.api?.selectedIds).toEqual([]);
    });

    it('runs action shortcuts anywhere in the page, not only on a row', async () => {
        const onDelete = vi.fn();
        const user = userEvent.setup();
        render(<Page items={actions(onDelete)} selected={[3]} />);
        screen.getByRole('button', { name: 'Löschen' }).focus();
        await user.keyboard('{Delete}');
        expect(onDelete).toHaveBeenCalledWith([3]);
    });

    it('jumps to the search with /', async () => {
        const user = userEvent.setup();
        render(<Page />);
        screen.getByText('Eins').closest('tr')?.focus();
        expect(screen.getByRole('searchbox').parentElement).not.toHaveAttribute('data-expanded');
        await user.keyboard('/');
        expect(screen.getByRole('searchbox')).toHaveFocus();
        // The search waits as a magnifier and opens when it is used.
        expect(screen.getByRole('searchbox').parentElement).toHaveAttribute('data-expanded');
    });

    it('opens the same actions on right-click, for the row under the pointer', async () => {
        const onDelete = vi.fn();
        const user = userEvent.setup();
        render(<Page items={actions(onDelete)} />);
        await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Drei') });
        const menu = await screen.findByRole('menu');
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((m) => m.textContent),
        ).toEqual(['Bearbeiten', 'LöschenDel']);
        await user.click(within(menu).getByRole('menuitem', { name: /Löschen/ }));
        expect(onDelete).toHaveBeenCalledWith([3]);
    });

    it('offers the list actions on right-click in empty space', async () => {
        const user = userEvent.setup();
        const { container } = render(<Page selected={[1]} />);
        const body = container.querySelector('[data-density]') as HTMLElement;
        await user.pointer({ keys: '[MouseRight]', target: body });
        const menu = await screen.findByRole('menu');
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((m) => m.textContent),
        ).toEqual(['Neu']);
    });

    it('has no right-click menu of its own when the grid has no actions', async () => {
        const user = userEvent.setup();
        render(<Page items={[]} />);
        await user.pointer({ keys: '[MouseRight]', target: screen.getByText('Eins') });
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('takes its row density from the remembered preference', () => {
        const { container } = render(<Page />);
        const body = () => container.querySelector('[data-density]');
        expect(body()).toHaveAttribute('data-density', 'comfortable');
        act(() => current.api?.preferences.setDensity('compact'));
        expect(body()).toHaveAttribute('data-density', 'compact');
    });

    it('draws lines between columns', () => {
        const { container } = render(<Page />);
        expect(container.querySelector('[data-density]')?.className).toContain(
            '[&_td:not(:last-child)]:border-r',
        );
    });

    it.each([[[]], [[1]], [[1, 2]]])('has no axe violations with %j selected', async (selected) => {
        const { container } = render(<Page selected={selected} footer={<span>1–3 von 3</span>} />);
        expect(await axe(container)).toHaveNoViolations();
    });
});
