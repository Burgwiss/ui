/*
 * The course list as a working example — used by the GridPage stories and
 * the page prototypes. German example content; not exported from the package.
 */
import {
    Archive,
    ClipboardCopy,
    Copy,
    Download,
    FolderInput,
    Globe,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    Upload,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { GridColumn } from '../../hooks/grid/types';
import type { GridActionItem, RowId } from '../../hooks/gridActions';
import { useGrid, type GridApi, type GridSelectionMode } from '../../hooks/useGrid';
import { downloadText } from '../../lib/download';
import type { TreeNode } from '../../lib/tree';
import { COURSE_CATEGORIES } from '../../organisms/CategoryTree/CategoryTree.fixtures';
import { GridFilterChips } from '../../molecules/GridFilterChips';
import { GridFilterEditor } from '../../molecules/GridFilterEditor';
import { GridFooter } from '../../molecules/GridFooter';
import { GridOptions } from '../../molecules/GridOptions';
import { DataGrid } from '../../organisms/DataGrid';
import {
    COURSE_COLUMNS,
    DATA_GRID_LABELS,
    FILTER_CHIPS_LABELS,
    FILTER_EDITOR_LABELS,
    VIEWS_LABELS,
    categoryOptions,
    categoryPath,
    formatDate,
    formatEuro,
    makeCourses,
    type CourseRow,
} from '../../organisms/DataGrid/DataGrid.fixtures';
import { GridPage } from './GridPage';

const OPTIONS_LABELS = {
    trigger: 'Tabellenoptionen',
    columns: 'Spalten',
    density: 'Zeilenhöhe',
    comfortable: 'Bequem',
    compact: 'Kompakt',
    selection: 'Zeilen auswählen',
    reset: 'Zurücksetzen',
};

export function CourseList({
    count = 13,
    selection = 'multiple',
    gridId = 'storybook.kursliste',
    groupBy,
    loading = false,
    error = null,
    empty = false,
    categories = COURSE_CATEGORIES,
    categoryIds = null,
}: {
    count?: number;
    selection?: GridSelectionMode;
    gridId?: string;
    groupBy?: string[];
    loading?: boolean;
    error?: string | null;
    empty?: boolean;
    /** The category tree as it is now: renames and deletes show up in the grid. */
    categories?: TreeNode[];
    /**
     * Show only courses in these categories (a folder and everything under it); null for all.
     * A null entry means "without a category" — including courses whose category was deleted.
     */
    categoryIds?: (string | null)[] | null;
}) {
    const initial = useMemo(() => (empty ? [] : makeCourses(count)), [count, empty]);
    const [rows, setRows] = useState(initial);
    const [search, setSearch] = useState('');
    const [last, setLast] = useState('');
    const gridRef = useRef<GridApi<CourseRow> | null>(null);

    // Price is editable: a short "server" delay, and 999 € is refused to show the error path.
    const columns: GridColumn<CourseRow>[] = useMemo(
        () =>
            COURSE_COLUMNS.map((c) =>
                c.id === 'price'
                    ? {
                          ...c,
                          editable: {
                              type: 'number' as const,
                              validate: (v: string | number) =>
                                  Number.isNaN(Number(v)) || Number(v) < 0
                                      ? 'Bitte einen Preis ab 0 € eingeben.'
                                      : null,
                              onCommit: async (row: CourseRow, next: string | number) => {
                                  await new Promise((r) => setTimeout(r, 400));
                                  if (Number(next) === 999)
                                      throw new Error('Der Server hat den Preis abgelehnt.');
                                  setRows((rs) =>
                                      rs.map((r) =>
                                          r.id === row.id ? { ...r, price: Number(next) } : r,
                                      ),
                                  );
                                  setLast(`Preis von „${row.title}" gespeichert`);
                              },
                          },
                      }
                    : c,
            ),
        [],
    );

    // The grid shows each course's category as a path of the tree as it is now.
    const categorised = useMemo(
        () => rows.map((r) => ({ ...r, category: categoryPath(categories, r.categoryId) })),
        [rows, categories],
    );
    const shownColumns = useMemo(
        () =>
            columns.map((c) =>
                c.id === 'category'
                    ? {
                          ...c,
                          filter: { type: 'choice' as const, options: categoryOptions(categories) },
                      }
                    : c,
            ),
        [columns, categories],
    );

    const say = (label: string) => (ids: RowId[]) =>
        setLast(ids.length ? `${label}: ${ids.length} Kurs(e)` : label);
    const actions: GridActionItem[] = [
        {
            id: 'new',
            label: 'Neuer Kurs',
            icon: <Plus aria-hidden="true" />,
            onSelect: say('Neuer Kurs'),
            tone: 'primary',
            shortcut: 'N',
        },
        {
            id: 'import',
            label: 'Importieren',
            icon: <Upload aria-hidden="true" />,
            onSelect: say('Importieren'),
            group: 'io',
        },
        {
            id: 'export',
            label: 'Als CSV exportieren',
            icon: <Download aria-hidden="true" />,
            group: 'io',
            shortcut: 'Mod+Shift+E',
            onSelect: () => {
                const grid = gridRef.current;
                if (!grid) return;
                downloadText(grid.exportCsv({ separator: ';', bom: true }), 'kurse.csv');
                setLast(`${grid.visibleRows.length} Kurse als CSV exportiert`);
            },
        },
        {
            id: 'reload',
            label: 'Neu laden',
            icon: <RefreshCw aria-hidden="true" />,
            onSelect: say('Neu laden'),
            group: 'view',
        },
        {
            id: 'edit',
            label: 'Bearbeiten',
            icon: <Pencil aria-hidden="true" />,
            onSelect: say('Bearbeiten'),
            when: ['one'],
            group: 'open',
            isDefault: true,
            shortcut: 'E',
        },
        {
            id: 'publish',
            label: 'Veröffentlichen',
            icon: <Globe aria-hidden="true" />,
            onSelect: say('Veröffentlichen'),
            when: ['one', 'many'],
            group: 'state',
            disabled: (ids) => rows.some((r) => ids.includes(r.id) && r.status === 'archived'),
            disabledReason: 'Archivierte Kurse erst wiederherstellen',
        },
        {
            id: 'duplicate',
            label: 'Duplizieren',
            icon: <Copy aria-hidden="true" />,
            onSelect: say('Duplizieren'),
            when: ['one', 'many'],
            group: 'state',
            shortcut: 'Mod+D',
        },
        {
            id: 'move',
            label: 'In Kategorie verschieben',
            icon: <FolderInput aria-hidden="true" />,
            onSelect: say('Verschieben'),
            when: ['one', 'many'],
            group: 'state',
            shortcut: 'M',
        },
        {
            id: 'copy',
            label: 'Kopieren (für Excel)',
            icon: <ClipboardCopy aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'io2',
            shortcut: 'Mod+C',
            onSelect: (ids) => {
                void gridRef.current?.copySelection();
                setLast(`${ids.length} Kurs(e) kopiert`);
            },
        },
        {
            id: 'export-selected',
            label: 'Auswahl als CSV',
            icon: <Download aria-hidden="true" />,
            when: ['many'],
            group: 'io2',
            onSelect: (ids) => {
                const grid = gridRef.current;
                if (!grid) return;
                downloadText(
                    grid.exportCsv({ scope: 'selection', separator: ';', bom: true }),
                    'kurse-auswahl.csv',
                );
                setLast(`${ids.length} Kurse als CSV exportiert`);
            },
        },
        {
            id: 'archive',
            label: 'Archivieren',
            icon: <Archive aria-hidden="true" />,
            onSelect: say('Archivieren'),
            when: ['one', 'many'],
            group: 'danger',
        },
        {
            id: 'delete',
            label: 'Löschen',
            icon: <Trash2 aria-hidden="true" />,
            onSelect: say('Löschen'),
            when: ['one', 'many'],
            group: 'danger',
            tone: 'destructive',
            shortcut: 'Delete',
        },
    ];

    const searched = useMemo(
        () =>
            categorised.filter(
                (r) =>
                    (categoryIds === null ||
                        categoryIds.includes(r.category === null ? null : r.categoryId)) &&
                    r.title.toLowerCase().includes(search.toLowerCase()),
            ),
        [categorised, categoryIds, search],
    );
    const grid = useGrid<CourseRow>({
        id: gridId,
        rows: searched,
        getRowId: (r) => r.id,
        columns: shownColumns,
        selection,
        actions,
        defaults: groupBy ? { groupBy } : undefined,
    });
    useEffect(() => {
        gridRef.current = grid;
    });

    return (
        <GridPage
            title="Kurse"
            offsetTop="0px"
            grid={grid}
            search={{ value: search, onChange: setSearch, placeholder: 'Kurse suchen …' }}
            selectionLabels={{ count: (n) => `${n} ausgewählt`, clear: 'Auswahl aufheben' }}
            shortcutLabels={{ Mod: 'Strg', Shift: 'Umschalt', Delete: 'Entf' }}
            options={
                <GridOptions
                    preferences={grid.preferences}
                    canSelect={grid.allowedMode !== 'none'}
                    columns={COURSE_COLUMNS.map((c) => ({
                        id: c.id,
                        label: c.header,
                        hideable: c.hideable,
                    }))}
                    views={{
                        views: grid.views,
                        activeViewId: grid.activeViewId,
                        isModified: grid.isViewModified,
                        onApply: grid.applyView,
                        onSave: (name) => void grid.saveView(name),
                        onUpdate: grid.updateView,
                        onRename: grid.renameView,
                        onDelete: grid.deleteView,
                        labels: VIEWS_LABELS,
                    }}
                    labels={OPTIONS_LABELS}
                />
            }
            chips={
                grid.filters.length ? (
                    <GridFilterChips
                        filters={grid.filters}
                        columns={shownColumns}
                        onRemove={grid.removeFilter}
                        onClearAll={grid.clearFilters}
                        labels={FILTER_CHIPS_LABELS}
                        formatDate={formatDate}
                        formatNumber={(n) => String(n)}
                    />
                ) : undefined
            }
            notice={
                last ? <span className="text-muted-foreground">Ausgeführt: {last}</span> : undefined
            }
            footer={
                <GridFooter
                    summary={`${grid.visibleRows.length} von ${rows.length} Kursen · Gesamt ${formatEuro(
                        grid.visibleRows.reduce((s, r) => s + (r.price ?? 0), 0),
                    )}`}
                    onPrev={null}
                    onNext={null}
                    labels={{ previous: 'Zurück', next: 'Weiter', pager: 'Seiten' }}
                />
            }
        >
            <DataGrid
                grid={grid}
                labels={DATA_GRID_LABELS}
                rowLabel={(r) => r.title}
                loading={loading}
                error={error}
                onRetry={() => setLast('Erneut versucht')}
                renderFilter={(col, close) => (
                    <GridFilterEditor
                        key={col.id}
                        columnId={col.id}
                        header={col.header}
                        def={col.filter!}
                        value={grid.filters.find((f) => f.id === col.id)}
                        onApply={(f) => {
                            if (f) grid.setFilter(f);
                            else grid.removeFilter(col.id);
                            close();
                        }}
                        labels={FILTER_EDITOR_LABELS}
                    />
                )}
            />
        </GridPage>
    );
}
