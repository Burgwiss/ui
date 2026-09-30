import { act, cleanup, render, screen, within } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { GridColumn } from '../../hooks/grid/types';
import { useGrid, type GridApi, type UseGridOptions } from '../../hooks/useGrid';
import { DataGrid } from './DataGrid';
import { DATA_GRID_LABELS as L } from './DataGrid.fixtures';

/*
 * What jsdom cannot tell us: real layout. Sticky pinned columns while
 * scrolling sideways, dragging a resize handle, dragging a header to reorder,
 * rendering only the rows in view — and how it looks.
 */

afterEach(() => {
    cleanup();
    localStorage.clear();
});

type Row = {
    id: number;
    title: string;
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    f: string;
};
const make = (n: number): Row[] =>
    Array.from({ length: n }, (_, i) => ({
        id: i + 1,
        title: `Kurs ${i + 1}`,
        a: 'Sprachen',
        b: 'A1',
        c: 'Online',
        d: '120 €',
        e: 'Veröffentlicht',
        f: 'Frau Berger',
    }));
const COLUMNS: GridColumn<Row>[] = [
    { id: 'title', header: 'Kurs', hideable: false },
    { id: 'a', header: 'Kategorie' },
    { id: 'b', header: 'Niveau' },
    { id: 'c', header: 'Ort' },
    { id: 'd', header: 'Preis' },
    { id: 'e', header: 'Status' },
    { id: 'f', header: 'Lehrkraft' },
];

let grid: GridApi<Row>;
function Harness({
    rows = make(5),
    options = {},
    height = 400,
    width = 600,
}: {
    rows?: Row[];
    options?: Partial<UseGridOptions<Row>>;
    height?: number;
    width?: number;
}) {
    const g = useGrid<Row>({
        id: 'browser',
        rows,
        getRowId: (r) => r.id,
        columns: COLUMNS,
        ...options,
    });
    useEffect(() => {
        grid = g;
    });
    return (
        <div data-grid-scroll="" data-testid="scroller" style={{ width, height, overflow: 'auto' }}>
            <DataGrid grid={g} labels={L} />
        </div>
    );
}
const frame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
const header = (name: string) => screen.getByRole('columnheader', { name: new RegExp(name) });

describe('DataGrid in a real browser', () => {
    it('keeps a pinned column in place while the rest scrolls sideways', async () => {
        render(<Harness />);
        act(() => grid.pinColumn('title', 'left'));
        const scroller = screen.getByTestId('scroller');
        const before = header('Kurs').getBoundingClientRect().left;
        const niveauBefore = header('Niveau').getBoundingClientRect().left;
        scroller.scrollLeft = 300;
        await frame();
        expect(header('Kurs').getBoundingClientRect().left).toBeCloseTo(before, 0);
        expect(header('Niveau').getBoundingClientRect().left).toBeCloseTo(niveauBefore - 300, 0);
        // The pinned column sits right after the checkbox column.
        expect(before - scroller.getBoundingClientRect().left).toBeCloseTo(40, 0);
    });

    it('resizes a column by dragging its handle', async () => {
        render(<Harness />);
        const handle = screen.getByRole('separator', { name: L.resize('Kategorie') });
        const box = handle.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;
        const fire = (type: string, clientX: number) =>
            handle.dispatchEvent(
                new PointerEvent(type, {
                    bubbles: true,
                    button: 0,
                    pointerId: 1,
                    clientX,
                    clientY: y,
                }),
            );
        fire('pointerdown', x);
        fire('pointermove', x + 90);
        fire('pointerup', x + 90);
        await frame();
        expect(header('Kategorie').getBoundingClientRect().width).toBeCloseTo(250, 0);
    });

    it('reorders columns by dragging a header onto another', async () => {
        render(<Harness />);
        await userEvent.dragAndDrop(
            page.getByRole('columnheader', { name: /Status/ }),
            page.getByRole('columnheader', { name: /Kategorie/ }),
        );
        expect(grid.layout.map((c) => c.id).slice(0, 3)).toEqual(['title', 'e', 'a']);
    });

    it('fits a column to its content', async () => {
        const rows = make(3).map((r, i) =>
            i === 1 ? { ...r, title: 'Sira — Das Leben des Propheten, ausführlich erzählt' } : r,
        );
        render(<Harness rows={rows} />);
        await userEvent.click(screen.getByRole('button', { name: L.columnMenu('Kurs') }));
        await userEvent.click(await screen.findByRole('menuitem', { name: L.autosize }));
        await frame();
        // Query the cell directly: the closing menu may still hide the rest from role queries.
        const th = document.querySelector<HTMLElement>('th[data-col="title"]')!;
        expect(th.getBoundingClientRect().width).toBeGreaterThan(300);
    });

    it('renders only the rows in view for a long list, and the rest on scroll', async () => {
        render(<Harness rows={make(5000)} />);
        await frame();
        const rendered = () => document.querySelectorAll('tr[data-grid-row-id]').length;
        expect(rendered()).toBeGreaterThan(5);
        expect(rendered()).toBeLessThan(80);
        const scroller = screen.getByTestId('scroller');
        scroller.scrollTop = scroller.scrollHeight;
        await frame();
        await frame();
        expect(within(scroller).getByText('Kurs 5000')).toBeInTheDocument();
        expect(rendered()).toBeLessThan(80);
    });

    it('keeps the filter open after choosing it from the column menu', async () => {
        // Regression: the closing menu handed focus back to its button, which the
        // popover took for an outside click — it opened and closed at once.
        const cols = COLUMNS.map((c) =>
            c.id === 'e' ? { ...c, filter: { type: 'text' as const } } : c,
        );
        function WithFilter() {
            const g = useGrid<Row>({
                id: 'browser-filter',
                rows: make(3),
                getRowId: (r) => r.id,
                columns: cols,
            });
            return <DataGrid grid={g} labels={L} renderFilter={() => <p>Filter-Editor</p>} />;
        }
        render(<WithFilter />);
        await userEvent.click(page.getByRole('button', { name: L.columnMenu('Status') }));
        await userEvent.click(page.getByRole('menuitem', { name: L.filter }));
        await new Promise((r) => setTimeout(r, 600));
        await expect.element(page.getByText('Filter-Editor')).toBeVisible();
    });

    it('looks right: default, and with a pinned, sorted, compact setup', async () => {
        render(
            <>
                <Harness width={900} height={320} />
                <p data-testid="away">·</p>
            </>,
        );
        // No hover tint from wherever an earlier test left the pointer.
        await userEvent.hover(page.getByTestId('away'));
        await expect.element(page.getByTestId('scroller')).toMatchScreenshot('datagrid-default');
        act(() => {
            grid.pinColumn('title', 'left');
            grid.toggleSort('title');
            grid.preferences.setDensity('compact');
        });
        await expect
            .element(page.getByTestId('scroller'))
            .toMatchScreenshot('datagrid-pinned-sorted');
    });
});
