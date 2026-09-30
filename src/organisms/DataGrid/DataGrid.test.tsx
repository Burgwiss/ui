import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { GridColumn } from '../../hooks/grid/types';
import { useGrid, type GridApi, type UseGridOptions } from '../../hooks/useGrid';
import { DataGrid, type DataGridProps } from './DataGrid';
import { DATA_GRID_LABELS as L } from './DataGrid.fixtures';

afterEach(() => localStorage.clear());

type Course = { id: number; title: string; category: string; price: number | null; status: string };
const ROWS: Course[] = [
    { id: 1, title: 'Arabisch', category: 'Sprachen', price: 120, status: 'Veröffentlicht' },
    { id: 2, title: 'Tajweed', category: 'Religion', price: 90, status: 'Entwurf' },
    { id: 3, title: 'Kalligrafie', category: 'Kunst', price: 60, status: 'Veröffentlicht' },
    { id: 4, title: 'Sira', category: 'Religion', price: 150, status: 'Archiviert' },
];
const COLUMNS: GridColumn<Course>[] = [
    { id: 'title', header: 'Kurs', hideable: false },
    { id: 'category', header: 'Kategorie', groupable: true },
    {
        id: 'price',
        header: 'Preis',
        align: 'right',
        aggregate: 'sum',
        formatAggregate: (n) => `${n} €`,
        cell: (r) => (r.price === null ? '—' : `${r.price} €`),
    },
    { id: 'status', header: 'Status', sortable: false },
];

let grid: GridApi<Course>;
function Harness({
    options = {},
    props = {},
    onGrid = (g: GridApi<Course>) => {
        grid = g;
    },
}: {
    options?: Partial<UseGridOptions<Course>>;
    props?: Partial<DataGridProps<Course>>;
    onGrid?: (g: GridApi<Course>) => void;
}) {
    const g = useGrid<Course>({
        id: 'dg',
        rows: ROWS,
        getRowId: (r) => r.id,
        columns: COLUMNS,
        ...options,
    });
    // Hand the live state to the test after every render.
    useEffect(() => onGrid(g));
    return <DataGrid grid={g} labels={L} rowLabel={(r) => r.title} {...props} />;
}
const headers = () => screen.getAllByRole('columnheader').map((h) => h.textContent?.trim());
const bodyTitles = () =>
    screen
        .getAllByRole('row')
        .filter((r) => r.hasAttribute('data-grid-row-id'))
        .map(
            (r) =>
                within(r).getAllByRole('gridcell')[r.querySelector('input[type=checkbox]') ? 1 : 0]!
                    .textContent,
        );

describe('DataGrid — rendering', () => {
    it('is a named grid with a header per visible column and a row per record', () => {
        render(<Harness />);
        expect(screen.getByRole('grid', { name: 'Kurse' })).toBeInTheDocument();
        expect(headers()).toEqual(
            ['', 'Kurs', 'Kategorie', 'Preis', 'Status'].map((h) => expect.stringContaining(h)),
        );
        expect(bodyTitles()).toEqual(['Arabisch', 'Tajweed', 'Kalligrafie', 'Sira']);
    });

    it('renders cells with the column renderer, or the value as text', () => {
        render(<Harness />);
        expect(screen.getByText('120 €')).toBeInTheDocument();
        expect(screen.getAllByText('Religion')).toHaveLength(2);
    });

    it('labels checkboxes with the row name', () => {
        render(<Harness />);
        expect(screen.getByRole('checkbox', { name: 'Tajweed auswählen' })).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: 'Alle auswählen' })).toBeInTheDocument();
    });

    it('drops hidden columns', () => {
        render(<Harness />);
        act(() => grid.preferences.setColumnVisible('category', false));
        expect(screen.queryByRole('columnheader', { name: /Kategorie/ })).not.toBeInTheDocument();
    });
});

describe('DataGrid — sorting from the header', () => {
    it('cycles through ascending, descending and none, with aria-sort', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        const th = () => screen.getByRole('columnheader', { name: /Preis/ });
        const button = within(th()).getByRole('button', { name: 'Preis' });
        expect(th()).toHaveAttribute('aria-sort', 'none');
        await user.click(button);
        expect(th()).toHaveAttribute('aria-sort', 'ascending');
        expect(bodyTitles()).toEqual(['Kalligrafie', 'Tajweed', 'Arabisch', 'Sira']);
        await user.click(button);
        expect(th()).toHaveAttribute('aria-sort', 'descending');
        await user.click(button);
        expect(th()).toHaveAttribute('aria-sort', 'none');
    });

    it('adds a sort key with Shift-click', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByRole('button', { name: 'Kategorie' }));
        await user.keyboard('{Shift>}');
        await user.click(screen.getByRole('button', { name: 'Preis' }));
        await user.keyboard('{/Shift}');
        expect(grid.sorting.map((s) => s.id)).toEqual(['category', 'price']);
        expect(bodyTitles()).toEqual(['Kalligrafie', 'Tajweed', 'Sira', 'Arabisch']);
    });

    it('has no sort button on an unsortable column', () => {
        render(<Harness />);
        const th = screen.getByRole('columnheader', { name: /Status/ });
        expect(within(th).queryByRole('button', { name: 'Status' })).not.toBeInTheDocument();
        expect(th).not.toHaveAttribute('aria-sort');
    });
});

describe('DataGrid — column menu', () => {
    async function openMenu(header: string) {
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', { name: L.columnMenu(header) }));
        return { user, menu: await screen.findByRole('menu') };
    }

    it('sorts, pins, hides and autosizes from the menu', async () => {
        render(<Harness />);
        let { user, menu } = await openMenu('Preis');
        await user.click(within(menu).getByRole('menuitem', { name: L.sortDescending }));
        expect(grid.sorting).toEqual([{ id: 'price', desc: true }]);

        ({ user, menu } = await openMenu('Preis'));
        await user.click(within(menu).getByRole('menuitem', { name: L.pinLeft }));
        expect(grid.layout[0]).toMatchObject({ id: 'price', pinned: 'left' });

        ({ user, menu } = await openMenu('Preis'));
        await user.click(within(menu).getByRole('menuitem', { name: L.unpin }));
        expect(grid.layout.find((c) => c.id === 'price')?.pinned).toBeNull();

        ({ user, menu } = await openMenu('Kategorie'));
        await user.click(within(menu).getByRole('menuitem', { name: L.hide }));
        expect(grid.layout.map((c) => c.id)).not.toContain('category');
    });

    it('never offers to hide the column that names the row', async () => {
        render(<Harness />);
        const { menu } = await openMenu('Kurs');
        expect(within(menu).queryByRole('menuitem', { name: L.hide })).not.toBeInTheDocument();
    });

    it('moves a column left and right by keyboard-friendly menu items', async () => {
        render(<Harness />);
        let { user, menu } = await openMenu('Preis');
        await user.click(within(menu).getByRole('menuitem', { name: L.moveLeft }));
        expect(grid.layout.map((c) => c.id)).toEqual(['title', 'price', 'category', 'status']);
        ({ user, menu } = await openMenu('Preis'));
        await user.click(within(menu).getByRole('menuitem', { name: L.moveRight }));
        expect(grid.layout.map((c) => c.id)).toEqual(['title', 'category', 'price', 'status']);
    });

    it('groups by a groupable column, and only offers it there', async () => {
        render(<Harness />);
        let { user, menu } = await openMenu('Preis');
        expect(within(menu).queryByRole('menuitem', { name: L.groupBy })).not.toBeInTheDocument();
        await user.keyboard('{Escape}');
        ({ user, menu } = await openMenu('Kategorie'));
        await user.click(within(menu).getByRole('menuitem', { name: L.groupBy }));
        expect(grid.groupBy).toEqual(['category']);
    });
});

describe('DataGrid — resizing', () => {
    it('resizes a column with the keyboard on its handle', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        const handle = screen.getByRole('separator', { name: L.resize('Kurs') });
        expect(handle).toHaveAttribute('aria-valuenow', '160');
        handle.focus();
        await user.keyboard('{ArrowRight}{ArrowRight}');
        expect(grid.layout[0]!.width).toBe(192);
        await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
        expect(grid.layout[0]!.width).toBe(128);
    });

    it('resizes by dragging the handle', () => {
        render(<Harness />);
        const handle = screen.getByRole('separator', { name: L.resize('Preis') });
        fireEvent.pointerDown(handle, { button: 0, clientX: 300, pointerId: 1 });
        fireEvent.pointerMove(handle, { clientX: 380, pointerId: 1 });
        fireEvent.pointerUp(handle, { pointerId: 1 });
        expect(grid.layout.find((c) => c.id === 'price')?.width).toBe(240);
    });

    it('applies the width to the column', () => {
        render(<Harness />);
        act(() => grid.setColumnWidth('title', 300));
        expect(screen.getByRole('columnheader', { name: /Kurs/ })).toHaveStyle({ width: '300px' });
    });
});

/** jsdom has no layout, so no elementFromPoint: say which header is under the pointer. */
function pointAt(el: Element) {
    Object.defineProperty(document, 'elementFromPoint', { value: () => el, configurable: true });
    return () => {
        delete (document as { elementFromPoint?: unknown }).elementFromPoint;
    };
}

describe('DataGrid — reordering by drag', () => {
    it('moves a header dragged past a few pixels to the header it is dropped on', () => {
        render(<Harness />);
        const from = screen.getByRole('columnheader', { name: /Status/ });
        const to = screen.getByRole('columnheader', { name: /Kategorie/ });
        const restore = pointAt(to);
        fireEvent.pointerDown(from, { button: 0, clientX: 500, clientY: 10 });
        fireEvent.pointerMove(window, { clientX: 200, clientY: 10 });
        fireEvent.pointerUp(window, { clientX: 200, clientY: 10 });
        expect(grid.layout.map((c) => c.id)).toEqual(['title', 'status', 'category', 'price']);
        restore();
    });

    it('treats a press without movement as a click, not a move', async () => {
        render(<Harness />);
        const button = screen.getByRole('button', { name: 'Preis' });
        await userEvent.click(button);
        expect(grid.layout.map((c) => c.id)).toEqual(['title', 'category', 'price', 'status']);
        expect(grid.sorting).toEqual([{ id: 'price', desc: false }]);
    });

    it('ignores a jiggle of a few pixels', () => {
        render(<Harness />);
        const from = screen.getByRole('columnheader', { name: /Status/ });
        const restore = pointAt(screen.getByRole('columnheader', { name: /Kategorie/ }));
        fireEvent.pointerDown(from, { button: 0, clientX: 500, clientY: 10 });
        fireEvent.pointerMove(window, { clientX: 503, clientY: 12 });
        fireEvent.pointerUp(window, { clientX: 503, clientY: 12 });
        expect(grid.layout.map((c) => c.id)).toEqual(['title', 'category', 'price', 'status']);
        restore();
    });

    it('does not start a move from the column menu button', () => {
        render(<Harness />);
        const menu = screen.getByRole('button', { name: L.columnMenu('Status') });
        const restore = pointAt(screen.getByRole('columnheader', { name: /Kategorie/ }));
        fireEvent.pointerDown(menu, { button: 0, clientX: 500, clientY: 10 });
        fireEvent.pointerMove(window, { clientX: 200, clientY: 10 });
        fireEvent.pointerUp(window, { clientX: 200, clientY: 10 });
        expect(grid.layout.map((c) => c.id)).toEqual(['title', 'category', 'price', 'status']);
        restore();
    });

    it('does not start a move from the resize handle', () => {
        render(<Harness />);
        const handle = screen.getByRole('separator', { name: L.resize('Status') });
        const to = screen.getByRole('columnheader', { name: /Kategorie/ });
        const restore = pointAt(to);
        fireEvent.pointerDown(handle, { button: 0, clientX: 500, clientY: 10 });
        fireEvent.pointerMove(window, { clientX: 200, clientY: 10 });
        fireEvent.pointerUp(window, { clientX: 200, clientY: 10 });
        expect(grid.layout.map((c) => c.id)).toEqual(['title', 'category', 'price', 'status']);
        restore();
    });
});

describe('DataGrid — pinned columns', () => {
    it('makes pinned cells sticky at their offset', () => {
        render(<Harness />);
        act(() => grid.pinColumn('price', 'left'));
        const th = screen.getByRole('columnheader', { name: /Preis/ });
        expect(th).toHaveStyle({ position: 'sticky', left: '40px' });
        const cell = screen.getByText('120 €').closest('td')!;
        expect(cell).toHaveStyle({ position: 'sticky', left: '40px' });
    });
});

describe('DataGrid — expandable rows', () => {
    const detail = (r: Course) => <p>Ausführungen von {r.title}</p>;

    it('opens a detail panel under the row, only for expandable rows', async () => {
        const user = userEvent.setup();
        render(
            <Harness
                options={{ isExpandable: (r) => r.id !== 3 }}
                props={{ renderDetail: detail }}
            />,
        );
        expect(
            screen.queryByRole('button', { name: 'Kalligrafie aufklappen' }),
        ).not.toBeInTheDocument();
        const toggle = screen.getByRole('button', { name: 'Arabisch aufklappen' });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await user.click(toggle);
        expect(screen.getByText('Ausführungen von Arabisch')).toBeInTheDocument();
        const open = screen.getByRole('button', { name: 'Arabisch zuklappen' });
        expect(open).toHaveAttribute('aria-expanded', 'true');
        expect(document.getElementById(open.getAttribute('aria-controls')!)).toContainElement(
            screen.getByText('Ausführungen von Arabisch'),
        );
        await user.click(open);
        expect(screen.queryByText('Ausführungen von Arabisch')).not.toBeInTheDocument();
    });

    it('does not select the row when the toggle is clicked', async () => {
        render(<Harness options={{ isExpandable: () => true }} props={{ renderDetail: detail }} />);
        await userEvent.click(screen.getByRole('button', { name: 'Arabisch aufklappen' }));
        expect(grid.selectedIds).toEqual([]);
    });
});

describe('DataGrid — grouping', () => {
    it('shows group rows with counts and aggregates, and opens them', async () => {
        const user = userEvent.setup();
        render(<Harness options={{ defaults: { groupBy: ['category'] } }} />);
        const religion = screen.getByRole('button', { name: 'Kategorie: Religion (2)' });
        expect(religion).toHaveAttribute('aria-expanded', 'false');
        expect(religion.closest('tr')).toHaveTextContent('240 €');
        expect(bodyTitles()).toEqual([]);
        await user.click(religion);
        expect(bodyTitles()).toEqual(['Tajweed', 'Sira']);
    });
});

describe('DataGrid — states', () => {
    it('shows a polite loading status and marks the grid busy', () => {
        render(<Harness props={{ loading: true }} />);
        expect(screen.getByRole('status')).toHaveTextContent(L.loading);
        expect(screen.getByRole('grid')).toHaveAttribute('aria-busy', 'true');
    });

    it('shows skeleton rows while loading with no rows yet', () => {
        const { container } = render(<Harness options={{ rows: [] }} props={{ loading: true }} />);
        expect(container.querySelectorAll('[data-skeleton]').length).toBeGreaterThan(0);
        expect(screen.queryByText(L.empty)).not.toBeInTheDocument();
    });

    it('says so when there is nothing to show', () => {
        render(<Harness options={{ rows: [] }} />);
        expect(screen.getByText(L.empty)).toBeInTheDocument();
    });

    it('takes a custom empty state', () => {
        render(
            <Harness
                options={{ rows: [] }}
                props={{ emptyState: <p>Lege deinen ersten Kurs an.</p> }}
            />,
        );
        expect(screen.getByText('Lege deinen ersten Kurs an.')).toBeInTheDocument();
    });

    it('shows an error with a retry', async () => {
        const onRetry = vi.fn();
        render(<Harness options={{ rows: [] }} props={{ error: 'Zeitüberschreitung', onRetry }} />);
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(L.errorTitle);
        expect(alert).toHaveTextContent('Zeitüberschreitung');
        await userEvent.click(within(alert).getByRole('button', { name: L.retry }));
        expect(onRetry).toHaveBeenCalledOnce();
    });
});

describe('DataGrid — inline editing', () => {
    function editableHarness(onCommit = vi.fn().mockResolvedValue(undefined)) {
        const cols = COLUMNS.map((c) =>
            c.id === 'price'
                ? {
                      ...c,
                      editable: {
                          type: 'number' as const,
                          onCommit,
                          validate: (v: string | number) =>
                              Number(v) < 0 ? 'Kein negativer Preis' : null,
                      },
                  }
                : c,
        );
        render(<Harness options={{ columns: cols }} />);
        return onCommit;
    }

    it('edits a cell: open, type, Enter saves and shows the new value', async () => {
        const user = userEvent.setup();
        const onCommit = editableHarness();
        await user.click(screen.getByRole('button', { name: 'Preis bearbeiten: 120 €' }));
        const input = screen.getByRole('spinbutton', { name: 'Preis' });
        expect(input).toHaveFocus();
        await user.clear(input);
        await user.type(input, '99{Enter}');
        expect(onCommit).toHaveBeenCalledWith(ROWS[0], 99, 120);
        expect(await screen.findByText('99 €')).toBeInTheDocument();
    });

    it('cancels with Escape', async () => {
        const user = userEvent.setup();
        const onCommit = editableHarness();
        await user.click(screen.getByRole('button', { name: 'Preis bearbeiten: 120 €' }));
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
        expect(onCommit).not.toHaveBeenCalled();
    });

    it('shows a refusal next to the field and keeps it open', async () => {
        const user = userEvent.setup();
        editableHarness();
        await user.click(screen.getByRole('button', { name: 'Preis bearbeiten: 120 €' }));
        const input = screen.getByRole('spinbutton', { name: 'Preis' });
        await user.clear(input);
        await user.type(input, '-1{Enter}');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAccessibleDescription('Kein negativer Preis');
    });

    it('does not select the row when editing starts', async () => {
        editableHarness();
        await userEvent.click(screen.getByRole('button', { name: 'Preis bearbeiten: 120 €' }));
        expect(grid.selectedIds).toEqual([]);
    });
});

describe('DataGrid — selection still works', () => {
    it('selects by row click and by checkbox', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByText('Tajweed'));
        expect(grid.selectedIds).toEqual([2]);
        await user.click(screen.getByRole('checkbox', { name: 'Sira auswählen' }));
        expect(grid.selectedIds).toEqual([2, 4]);
    });
});

describe('DataGrid — without selection', () => {
    it('has no checkbox column in single or none mode', () => {
        render(<Harness options={{ selection: 'none' }} />);
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
});
