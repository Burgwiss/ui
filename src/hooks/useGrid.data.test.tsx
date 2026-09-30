import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { GridColumn } from './grid/types';
import { useGrid, type UseGridOptions } from './useGrid';

afterEach(() => localStorage.clear());

type Course = { id: number; title: string; category: string; price: number; status: string };
const ROWS: Course[] = [
    { id: 1, title: 'Arabisch', category: 'Sprachen', price: 120, status: 'published' },
    { id: 2, title: 'Tajweed', category: 'Religion', price: 90, status: 'draft' },
    { id: 3, title: 'Kalligrafie', category: 'Kunst', price: 60, status: 'published' },
    { id: 4, title: 'Sira', category: 'Religion', price: 150, status: 'archived' },
];
const COLUMNS: GridColumn<Course>[] = [
    { id: 'title', header: 'Kurs', hideable: false, filter: { type: 'text' } },
    { id: 'category', header: 'Kategorie', groupable: true },
    { id: 'price', header: 'Preis', aggregate: 'sum', filter: { type: 'number' } },
    {
        id: 'status',
        header: 'Status',
        filter: {
            type: 'choice',
            options: [
                { value: 'published', label: 'Veröffentlicht' },
                { value: 'draft', label: 'Entwurf' },
            ],
        },
    },
];

function setup(extra: Partial<UseGridOptions<Course>> = {}) {
    return renderHook(
        (props: Partial<UseGridOptions<Course>>) =>
            useGrid<Course>({
                id: 'courses',
                rows: ROWS,
                getRowId: (r) => r.id,
                columns: COLUMNS,
                ...props,
            }),
        { initialProps: extra },
    );
}
const rowIds = (r: { current: { visibleRows: Course[] } }) =>
    r.current.visibleRows.map((x) => x.id);

describe('useGrid — sorting', () => {
    it('cycles a column through ascending, descending and off', () => {
        const { result } = setup();
        act(() => result.current.toggleSort('price'));
        expect(rowIds(result)).toEqual([3, 2, 1, 4]);
        act(() => result.current.toggleSort('price'));
        expect(rowIds(result)).toEqual([4, 1, 2, 3]);
        act(() => result.current.toggleSort('price'));
        expect(result.current.sorting).toEqual([]);
        expect(rowIds(result)).toEqual([1, 2, 3, 4]);
    });

    it('replaces the sort on a plain toggle and adds a key on an additive one', () => {
        const { result } = setup();
        act(() => result.current.toggleSort('category'));
        act(() => result.current.toggleSort('price', true));
        expect(result.current.sorting).toEqual([
            { id: 'category', desc: false },
            { id: 'price', desc: false },
        ]);
        expect(rowIds(result)).toEqual([3, 2, 4, 1]);
        act(() => result.current.toggleSort('title'));
        expect(result.current.sorting).toEqual([{ id: 'title', desc: false }]);
    });

    it('refuses to sort a column that is not sortable', () => {
        const cols = COLUMNS.map((c) => (c.id === 'price' ? { ...c, sortable: false } : c));
        const { result } = setup({ columns: cols });
        act(() => result.current.toggleSort('price'));
        expect(result.current.sorting).toEqual([]);
    });

    it('remembers the sort for the next visit', () => {
        const first = setup();
        act(() => first.result.current.toggleSort('price'));
        first.unmount();
        const second = setup();
        expect(second.result.current.sorting).toEqual([{ id: 'price', desc: false }]);
    });
});

describe('useGrid — filters', () => {
    it('filters on the client and drops filtered rows from the selection', () => {
        const { result } = setup({ defaultSelectedIds: [2, 3] });
        act(() =>
            result.current.setFilter({ id: 'status', type: 'choice', values: ['published'] }),
        );
        expect(rowIds(result)).toEqual([1, 3]);
        expect(result.current.selectedIds).toEqual([3]);
    });

    it('replaces a column filter, removes it, and clears all', () => {
        const { result } = setup();
        act(() => result.current.setFilter({ id: 'price', type: 'number', min: 100 }));
        act(() => result.current.setFilter({ id: 'price', type: 'number', max: 90 }));
        expect(result.current.filters).toEqual([{ id: 'price', type: 'number', max: 90 }]);
        act(() =>
            result.current.setFilter({ id: 'title', type: 'text', op: 'contains', value: 'a' }),
        );
        act(() => result.current.removeFilter('price'));
        expect(result.current.filters.map((f) => f.id)).toEqual(['title']);
        act(() => result.current.clearFilters());
        expect(result.current.filters).toEqual([]);
    });
});

describe('useGrid — server mode', () => {
    it('leaves the rows alone and reports the query instead', () => {
        const onQueryChange = vi.fn();
        const { result } = setup({ mode: 'server', onQueryChange });
        act(() => result.current.toggleSort('price'));
        act(() => result.current.setFilter({ id: 'status', type: 'choice', values: ['draft'] }));
        expect(rowIds(result)).toEqual([1, 2, 3, 4]);
        expect(onQueryChange).toHaveBeenLastCalledWith({
            sorting: [{ id: 'price', desc: false }],
            filters: [{ id: 'status', type: 'choice', values: ['draft'] }],
        });
    });

    it('does not group in server mode', () => {
        const { result } = setup({ mode: 'server' });
        act(() => result.current.setGroupBy(['category']));
        expect(result.current.groupBy).toEqual([]);
        expect(result.current.canGroup).toBe(false);
    });

    it('starts with the filters it is given — the address is the truth in server mode', () => {
        const onQueryChange = vi.fn();
        const status = { id: 'status', type: 'choice' as const, values: ['draft'] };
        const { result } = setup({ mode: 'server', onQueryChange, initialFilters: [status] });
        expect(result.current.filters).toEqual([status]);
        // Starting from them is not a change: nothing is fetched on mount.
        expect(onQueryChange).not.toHaveBeenCalled();
        act(() => result.current.removeFilter('status'));
        expect(onQueryChange).toHaveBeenLastCalledWith({ sorting: [], filters: [] });
    });

    it('exposes the current query for the first request', () => {
        const first = setup({ mode: 'server' });
        act(() => first.result.current.toggleSort('title'));
        first.unmount();
        const second = setup({ mode: 'server' });
        expect(second.result.current.query).toEqual({
            sorting: [{ id: 'title', desc: false }],
            filters: [],
        });
    });
});

describe('useGrid — grouping', () => {
    it('groups visible rows with aggregates and collapsible groups', () => {
        const { result } = setup();
        act(() => result.current.setGroupBy(['category']));
        const groups = result.current.lines.filter((l) => l.kind === 'group');
        expect(
            groups.map((l) => l.kind === 'group' && [l.group.value, l.group.aggregates.price]),
        ).toEqual([
            ['Kunst', 60],
            ['Religion', 240],
            ['Sprachen', 120],
        ]);
        expect(result.current.lines.every((l) => l.kind === 'group')).toBe(true);
        act(() => result.current.toggleGroup('category:Religion'));
        expect(
            result.current.lines
                .filter((l) => l.kind === 'row')
                .map((l) => l.kind === 'row' && l.id),
        ).toEqual([2, 4]);
        act(() => result.current.expandAllGroups());
        expect(result.current.lines.filter((l) => l.kind === 'row')).toHaveLength(4);
        act(() => result.current.collapseAllGroups());
        expect(result.current.lines.filter((l) => l.kind === 'row')).toHaveLength(0);
    });

    it('only groups by groupable columns', () => {
        const { result } = setup();
        act(() => result.current.setGroupBy(['price', 'category']));
        expect(result.current.groupBy).toEqual(['category']);
    });
});

describe('useGrid — expandable rows', () => {
    it('opens and closes the detail of expandable rows only', () => {
        const { result } = setup({ isExpandable: (r) => r.id !== 3 });
        expect(result.current.canExpand(ROWS[0]!)).toBe(true);
        expect(result.current.canExpand(ROWS[2]!)).toBe(false);
        act(() => result.current.toggleRowExpanded(1));
        expect(result.current.isRowExpanded(1)).toBe(true);
        act(() => result.current.toggleRowExpanded(3));
        expect(result.current.isRowExpanded(3)).toBe(false);
        act(() => result.current.toggleRowExpanded(1));
        expect(result.current.isRowExpanded(1)).toBe(false);
    });

    it('has no expandable rows without isExpandable', () => {
        const { result } = setup();
        expect(result.current.canExpand(ROWS[0]!)).toBe(false);
        expect(result.current.hasExpandableRows).toBe(false);
    });
});

describe('useGrid — columns', () => {
    it('lays out columns and remembers width, order and pinning', () => {
        const first = setup();
        act(() => first.result.current.setColumnWidth('title', 300));
        act(() => first.result.current.moveColumn('status', 1));
        act(() => first.result.current.pinColumn('price', 'left'));
        first.unmount();
        const { result } = setup();
        expect(result.current.layout.map((c) => [c.id, c.width, c.pinned])).toEqual([
            ['price', 160, 'left'],
            ['title', 300, null],
            ['status', 160, null],
            ['category', 160, null],
        ]);
    });

    it('hides a column but never the one that names the row', () => {
        const { result } = setup();
        act(() => result.current.preferences.setColumnVisible('category', false));
        act(() => result.current.preferences.setColumnVisible('title', false));
        expect(result.current.layout.map((c) => c.id)).toEqual(['title', 'price', 'status']);
    });

    it('offsets pinned columns after the checkbox and expander columns', () => {
        const { result } = setup({ isExpandable: () => true });
        act(() => result.current.pinColumn('title', 'left'));
        expect(result.current.layout[0]).toMatchObject({ id: 'title', offset: 80 });
    });
});

describe('useGrid — saved views', () => {
    it('saves the current setup under a name, and applies it later', () => {
        const { result } = setup();
        act(() => result.current.toggleSort('price'));
        act(() =>
            result.current.setFilter({ id: 'status', type: 'choice', values: ['published'] }),
        );
        let id = '';
        act(() => {
            id = result.current.saveView('Veröffentlicht, günstig zuerst')!.id;
        });
        expect(result.current.activeViewId).toBe(id);
        expect(result.current.isViewModified).toBe(false);

        act(() => result.current.clearFilters());
        act(() => result.current.toggleSort('title'));
        expect(result.current.isViewModified).toBe(true);

        act(() => result.current.applyView(id));
        expect(result.current.sorting).toEqual([{ id: 'price', desc: false }]);
        expect(rowIds(result)).toEqual([3, 1]);
        expect(result.current.isViewModified).toBe(false);
    });

    it('restores the active view’s filters on the next visit', () => {
        const first = setup();
        act(() =>
            first.result.current.setFilter({ id: 'status', type: 'choice', values: ['draft'] }),
        );
        act(() => void first.result.current.saveView('Entwürfe'));
        first.unmount();
        const { result } = setup();
        expect(rowIds(result)).toEqual([2]);
    });

    it('renames and deletes views; deleting the active one clears it', () => {
        const { result } = setup();
        let id = '';
        act(() => {
            id = result.current.saveView('A')!.id;
        });
        act(() => result.current.renameView(id, 'B'));
        expect(result.current.views.map((v) => v.name)).toEqual(['B']);
        act(() => result.current.deleteView(id));
        expect(result.current.views).toEqual([]);
        expect(result.current.activeViewId).toBeNull();
    });

    it('ignores a blank view name', () => {
        const { result } = setup();
        act(() => void result.current.saveView('   '));
        expect(result.current.views).toEqual([]);
    });
});

describe('useGrid — copy and export', () => {
    it('exports the visible rows and columns as CSV', () => {
        const { result } = setup();
        act(() => result.current.preferences.setColumnVisible('category', false));
        act(() => result.current.setFilter({ id: 'price', type: 'number', min: 100 }));
        expect(result.current.exportCsv()).toBe(
            'Kurs,Preis,Status\r\nArabisch,120,published\r\nSira,150,archived',
        );
    });

    it('exports only the selection when asked', () => {
        const { result } = setup({ defaultSelectedIds: [3] });
        expect(result.current.exportCsv({ scope: 'selection' }).split('\r\n')).toEqual([
            'Kurs,Kategorie,Preis,Status',
            'Kalligrafie,Kunst,60,published',
        ]);
    });

    it('copies the selected rows to the clipboard as TSV', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.assign(navigator, { clipboard: { writeText } });
        const { result } = setup({ defaultSelectedIds: [1, 2] });
        await act(async () => {
            await result.current.copySelection();
        });
        expect(writeText).toHaveBeenCalledWith(
            'Kurs\tKategorie\tPreis\tStatus\nArabisch\tSprachen\t120\tpublished\nTajweed\tReligion\t90\tdraft',
        );
    });
});

describe('useGrid — inline editing', () => {
    const editable = (
        onCommit: (row: Course, next: string | number, prev: unknown) => Promise<void> | void,
    ) =>
        COLUMNS.map((c) =>
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

    it('saves a value, shows it at once, and reports the previous value', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);
        const { result } = setup({ columns: editable(onCommit) });
        act(() => result.current.startEdit(1, 'price'));
        expect(result.current.editing).toEqual({ rowId: 1, columnId: 'price' });
        await act(async () => {
            expect(await result.current.commitEdit(99)).toBe(true);
        });
        expect(onCommit).toHaveBeenCalledWith(ROWS[0], 99, 120);
        expect(result.current.cellValue(ROWS[0]!, 'price')).toBe(99);
        expect(result.current.editing).toBeNull();
    });

    it('refuses an invalid value without saving', async () => {
        const onCommit = vi.fn();
        const { result } = setup({ columns: editable(onCommit) });
        act(() => result.current.startEdit(1, 'price'));
        await act(async () => {
            expect(await result.current.commitEdit(-5)).toBe(false);
        });
        expect(onCommit).not.toHaveBeenCalled();
        expect(result.current.editError).toBe('Kein negativer Preis');
        expect(result.current.editing).toEqual({ rowId: 1, columnId: 'price' });
    });

    it('puts the old value back when saving fails, and shows why', async () => {
        const onCommit = vi.fn().mockRejectedValue(new Error('Server nicht erreichbar'));
        const { result } = setup({ columns: editable(onCommit) });
        act(() => result.current.startEdit(1, 'price'));
        await act(async () => {
            expect(await result.current.commitEdit(99)).toBe(false);
        });
        expect(result.current.cellValue(ROWS[0]!, 'price')).toBe(120);
        expect(result.current.editError).toBe('Server nicht erreichbar');
    });

    it('cancels without saving, and never edits a read-only column', () => {
        const onCommit = vi.fn();
        const { result } = setup({ columns: editable(onCommit) });
        act(() => result.current.startEdit(1, 'title'));
        expect(result.current.editing).toBeNull();
        act(() => result.current.startEdit(1, 'price'));
        act(() => result.current.cancelEdit());
        expect(result.current.editing).toBeNull();
        expect(onCommit).not.toHaveBeenCalled();
    });

    it('forgets optimistic values when fresh rows arrive', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);
        const { result, rerender } = setup({ columns: editable(onCommit) });
        act(() => result.current.startEdit(1, 'price'));
        await act(async () => void (await result.current.commitEdit(99)));
        const fresh = ROWS.map((r) => (r.id === 1 ? { ...r, price: 101 } : r));
        rerender({ columns: editable(onCommit), rows: fresh });
        expect(result.current.cellValue(fresh[0]!, 'price')).toBe(101);
    });
});

describe('useGrid — rows rebuilt on every render', () => {
    it('does not loop when the app passes a new rows array each render', () => {
        // Regression: optimistic edits used to reset on a new rows array by
        // setting state during render, which looped forever for
        // `rows={data.map(…)}`.
        const { result } = renderHook(() =>
            useGrid<Course>({
                id: 'fresh',
                rows: ROWS.map((r) => ({ ...r })),
                getRowId: (r) => r.id,
                columns: COLUMNS,
            }),
        );
        expect(result.current.visibleRows).toHaveLength(4);
    });
});

describe('useGrid — several changes in one handler', () => {
    it('keeps every change, not just the last one', () => {
        // Regression: each setter wrote the settings as they were at render
        // time, so a handler that pinned, sorted and resized kept only the resize.
        const { result } = setup();
        act(() => {
            result.current.pinColumn('price', 'left');
            result.current.toggleSort('title');
            result.current.setColumnWidth('title', 300);
            result.current.moveColumn('status', 0);
            result.current.preferences.setDensity('compact');
            result.current.setColumnWidth('price', 220);
            result.current.toggleSort('price', true);
        });
        expect(result.current.layout.find((c) => c.id === 'price')?.width).toBe(220);
        expect(result.current.layout.find((c) => c.id === 'price')?.pinned).toBe('left');
        expect(result.current.sorting).toEqual([
            { id: 'title', desc: false },
            { id: 'price', desc: false },
        ]);
        expect(result.current.layout.find((c) => c.id === 'title')?.width).toBe(300);
        expect(result.current.preferences.values.columnOrder[0]).toBe('status');
        expect(result.current.preferences.values.density).toBe('compact');
    });
});

describe('useGrid — updating a saved view', () => {
    it('overwrites the view with the current setup and clears "modified"', () => {
        const { result } = setup();
        let id = '';
        act(() => {
            id = result.current.saveView('Meine Ansicht')!.id;
        });
        act(() => result.current.toggleSort('price'));
        expect(result.current.isViewModified).toBe(true);
        act(() => result.current.updateView(id));
        expect(result.current.isViewModified).toBe(false);
        expect(result.current.views[0]!.state.sorting).toEqual([{ id: 'price', desc: false }]);
    });
});

describe('useGrid — gaps found by breaking the code on purpose', () => {
    it('never reports a query in client mode', () => {
        const onQueryChange = vi.fn();
        const { result } = setup({ onQueryChange });
        act(() => result.current.toggleSort('price'));
        act(() => result.current.setFilter({ id: 'price', type: 'number', min: 1 }));
        expect(onQueryChange).not.toHaveBeenCalled();
    });

    it('ignores remembered grouping in server mode and for columns that cannot group', () => {
        const server = setup({ mode: 'server', defaults: { groupBy: ['category'] } });
        expect(server.result.current.groupBy).toEqual([]);
        server.unmount();
        const client = setup({ defaults: { groupBy: ['price', 'category'] } });
        expect(client.result.current.groupBy).toEqual(['category']);
    });

    it('forgets the active view in storage when it is deleted', () => {
        const { result } = setup();
        let id = '';
        act(() => {
            id = result.current.saveView('A')!.id;
        });
        act(() => result.current.deleteView(id));
        expect(result.current.preferences.values.activeView).toBeNull();
    });
});
