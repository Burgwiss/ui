import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    Archive,
    Copy,
    Download,
    Eye,
    FolderInput,
    Globe,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { useGrid, type GridActionItem, type GridSelectionMode, type RowId } from '../../hooks';
import { GridColumnFilter } from '../../molecules/GridColumnFilter';
import { GridFooter } from '../../molecules/GridFooter';
import { GridOptions } from '../../molecules/GridOptions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../organisms/Table';
import { GridPage } from './GridPage';

type Row = {
    id: number;
    title: string;
    code: string;
    status: 'published' | 'draft' | 'archived';
    enrolled: number;
};
const ROWS: Row[] = [
    { id: 1, title: 'Arabisch für Anfänger', code: 'SPR-AR-A', status: 'published', enrolled: 18 },
    { id: 2, title: 'Tajweed Grundlagen', code: 'REL-TJ-I', status: 'published', enrolled: 7 },
    { id: 3, title: 'Kalligrafie-Werkstatt', code: 'KUN-KA-B', status: 'draft', enrolled: 0 },
    {
        id: 4,
        title: 'Sira — Das Leben des Propheten',
        code: 'GES-SI-A',
        status: 'published',
        enrolled: 7,
    },
    { id: 5, title: 'Medina Buch 1', code: 'SPR-MB-1', status: 'archived', enrolled: 12 },
];
const STATUS = { published: 'Veröffentlicht', draft: 'Entwurf', archived: 'Archiviert' } as const;
const COLUMNS = [
    { id: 'title', label: 'Kurs', hideable: false },
    { id: 'code', label: 'Kürzel' },
    { id: 'status', label: 'Status' },
    { id: 'enrolled', label: 'Angemeldet' },
];

/**
 * Every action the course list offers, described once. `when` decides where
 * each appears: nothing selected, one row, many rows. The toolbar, the
 * right-click menu and the keyboard all read this one list.
 */
function courseActions(log: (text: string) => void): GridActionItem[] {
    const say = (label: string) => (ids: RowId[]) =>
        log(ids.length ? `${label}: ${ids.length} Kurs(e)` : label);
    const archived = (ids: RowId[]) =>
        ROWS.some((r) => ids.includes(r.id) && r.status === 'archived');
    return [
        // Nothing selected — the whole list.
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
            label: 'Alle exportieren',
            icon: <Download aria-hidden="true" />,
            onSelect: say('Alle exportieren'),
            group: 'io',
            shortcut: 'Mod+Shift+E',
        },
        {
            id: 'reload',
            label: 'Neu laden',
            icon: <RefreshCw aria-hidden="true" />,
            onSelect: say('Neu laden'),
            group: 'view',
            shortcut: 'Shift+R',
        },
        // Exactly one — things that open a single course.
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
            id: 'preview',
            label: 'Vorschau',
            icon: <Eye aria-hidden="true" />,
            onSelect: say('Vorschau'),
            when: ['one'],
            group: 'open',
            shortcut: 'P',
        },
        // One or many — things that work on a set.
        {
            id: 'publish',
            label: 'Veröffentlichen',
            icon: <Globe aria-hidden="true" />,
            onSelect: say('Veröffentlichen'),
            when: ['one', 'many'],
            group: 'state',
            disabled: archived,
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
            label: 'In Ordner verschieben',
            icon: <FolderInput aria-hidden="true" />,
            onSelect: say('Verschieben'),
            when: ['one', 'many'],
            group: 'state',
            shortcut: 'M',
        },
        {
            id: 'export-selected',
            label: 'Auswahl exportieren',
            icon: <Download aria-hidden="true" />,
            onSelect: say('Auswahl exportieren'),
            when: ['many'],
            group: 'state',
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
}

function Demo({
    selection = 'multiple',
    defaultSelectedIds,
    gridId = 'storybook.kursliste',
}: {
    selection?: GridSelectionMode;
    defaultSelectedIds?: RowId[];
    gridId?: string;
}) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [last, setLast] = useState('');
    const rows = useMemo(
        () =>
            ROWS.filter(
                (r) =>
                    (!status || r.status === status) &&
                    r.title.toLowerCase().includes(search.toLowerCase()),
            ),
        [search, status],
    );
    const grid = useGrid({
        id: gridId,
        rowIds: rows.map((r) => r.id),
        selection,
        defaultSelectedIds,
        actions: courseActions(setLast),
    });
    const show = grid.preferences.isColumnVisible;

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
                    columns={COLUMNS}
                    labels={{
                        trigger: 'Tabellenoptionen',
                        columns: 'Spalten',
                        density: 'Zeilenhöhe',
                        comfortable: 'Bequem',
                        compact: 'Kompakt',
                        selection: 'Zeilen auswählen',
                        reset: 'Zurücksetzen',
                    }}
                />
            }
            notice={
                last ? <span className="text-muted-foreground">Ausgeführt: {last}</span> : undefined
            }
            chips={
                status ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs">
                        Status: {STATUS[status as keyof typeof STATUS]}
                        <button
                            type="button"
                            aria-label="Filter entfernen"
                            onClick={() => setStatus('')}
                        >
                            <X className="size-3" aria-hidden="true" />
                        </button>
                    </span>
                ) : undefined
            }
            footer={
                <GridFooter
                    summary={`Zeige 1–${rows.length} von ${rows.length}`}
                    onPrev={null}
                    onNext={null}
                    labels={{ previous: 'Zurück', next: 'Weiter', pager: 'Seiten' }}
                />
            }
        >
            <Table aria-label="Kurse" {...grid.getTableProps()}>
                <TableHeader>
                    <TableRow>
                        {grid.showCheckboxes && (
                            <TableHead className="w-10">
                                <input {...grid.getSelectAllProps('Alle auswählen')} />
                            </TableHead>
                        )}
                        <TableHead>Kurs</TableHead>
                        {show('code') && <TableHead>Kürzel</TableHead>}
                        {show('status') && (
                            <TableHead>
                                <GridColumnFilter
                                    title="Status"
                                    filterLabel="Status filtern"
                                    allLabel="Alle"
                                    value={status}
                                    onChange={setStatus}
                                    options={Object.entries(STATUS).map(([value, label]) => ({
                                        value,
                                        label,
                                    }))}
                                />
                            </TableHead>
                        )}
                        {show('enrolled') && (
                            <TableHead className="text-right">Angemeldet</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r) => (
                        <TableRow key={r.id} {...grid.getRowProps(r.id)}>
                            {grid.showCheckboxes && (
                                <TableCell>
                                    <input
                                        {...grid.getRowCheckboxProps(r.id, `${r.title} auswählen`)}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="font-medium">{r.title}</TableCell>
                            {show('code') && (
                                <TableCell className="text-muted-foreground">{r.code}</TableCell>
                            )}
                            {show('status') && <TableCell>{STATUS[r.status]}</TableCell>}
                            {show('enrolled') && (
                                <TableCell className="text-right tabular-nums">
                                    {r.enrolled}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </GridPage>
    );
}

const meta: Meta<typeof GridPage> = {
    title: 'Templates/GridPage',
    component: GridPage,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Wie jede Liste aussieht und sich bedient. Klick wählt eine Zeile, ⌘/Strg-Klick ergänzt, Umschalt-Klick wählt einen Bereich. Rechtsklick öffnet dieselben Aktionen als Menü. Pfeiltasten, Leertaste, Enter, ⌘/Strg+A, Esc und die Kürzel der Aktionen funktionieren im Grid. Spalten, Zeilenhöhe und Auswahl merkt sich jede Tabelle im Browser.',
            },
        },
    },
};
export default meta;

type Story = StoryObj<typeof GridPage>;

/** Nothing selected: create, import, export, reload. Click, right-click, use the keys. */
export const Kursliste: Story = { render: () => <Demo /> };

/** One row: open it (edit, preview) plus everything that works on a set. */
export const EineZeile: Story = {
    name: 'Eine Zeile ausgewählt',
    render: () => <Demo defaultSelectedIds={[1]} gridId="storybook.kursliste.one" />,
};

/**
 * Many rows: no edit or preview — those open one course. Publish is disabled
 * because an archived course is in the set; its tooltip says so.
 */
export const MehrereZeilen: Story = {
    name: 'Mehrere Zeilen ausgewählt',
    render: () => <Demo defaultSelectedIds={[2, 3, 5]} gridId="storybook.kursliste.many" />,
};

/** `selection: 'single'` — no checkboxes; a click picks one row, "many" never happens. */
export const Einzelauswahl: Story = {
    render: () => <Demo selection="single" gridId="storybook.kursliste.single" />,
};

/** `selection: 'none'` — a read-only list: only the list actions, no selection at all. */
export const OhneAuswahl: Story = {
    render: () => <Demo selection="none" gridId="storybook.kursliste.none" />,
};
