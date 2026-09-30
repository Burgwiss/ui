import type { GridColumn } from '../../hooks/grid/types';
import { flattenVisible, pathTo, type TreeNode } from '../../lib/tree';
import { COURSE_CATEGORIES } from '../CategoryTree/CategoryTree.fixtures';
import type { GridFilterChipsLabels } from '../../molecules/GridFilterChips';
import type { GridFilterEditorLabels } from '../../molecules/GridFilterEditor';
import type { GridViewsLabels } from '../../molecules/GridOptions';
import type { DataGridLabels } from './DataGrid';

/*
 * German example labels and data for stories, tests and page prototypes.
 * Not exported from the package: an app brings its own words and data.
 */

export const DATA_GRID_LABELS: DataGridLabels = {
    table: 'Kurse',
    selectAll: 'Alle auswählen',
    selectRow: (name) => `${name} auswählen`,
    detailsColumn: 'Details',
    expand: (name) => `${name} aufklappen`,
    collapse: (name) => `${name} zuklappen`,
    columnMenu: (header) => `Optionen für ${header}`,
    sortAscending: 'Aufsteigend sortieren',
    sortDescending: 'Absteigend sortieren',
    clearSort: 'Sortierung aufheben',
    filter: 'Filtern …',
    pinLeft: 'Links anheften',
    pinRight: 'Rechts anheften',
    unpin: 'Lösen',
    groupBy: 'Danach gruppieren',
    ungroup: 'Gruppierung aufheben',
    autosize: 'Breite anpassen',
    moveLeft: 'Nach links verschieben',
    moveRight: 'Nach rechts verschieben',
    hide: 'Ausblenden',
    resize: (header) => `Breite von ${header} ändern`,
    group: (header, value, count) => `${header}: ${value} (${count})`,
    emptyGroupValue: '(leer)',
    loading: 'Lädt …',
    empty: 'Keine Einträge.',
    errorTitle: 'Die Liste konnte nicht geladen werden.',
    retry: 'Erneut versuchen',
    edit: (header, value) => `${header} bearbeiten: ${value}`,
    save: 'Speichern',
    cancel: 'Abbrechen',
    saving: 'Speichert …',
};

export const FILTER_EDITOR_LABELS: GridFilterEditorLabels = {
    apply: 'Anwenden',
    clear: 'Zurücksetzen',
    contains: 'enthält',
    equals: 'ist genau',
    startsWith: 'beginnt mit',
    operator: 'Vergleich',
    value: 'Wert',
    selectAll: 'Alle',
    selectNone: 'Keine',
    min: 'Von',
    max: 'Bis',
    from: 'Ab',
    to: 'Bis',
    invalidRange: 'Der Anfang liegt nach dem Ende.',
};

export const FILTER_CHIPS_LABELS: GridFilterChipsLabels = {
    remove: (chip) => `Filter „${chip}" entfernen`,
    clearAll: 'Alle Filter entfernen',
    region: 'Aktive Filter',
    contains: (h, v) => `${h} enthält „${v}"`,
    equals: (h, v) => `${h} ist „${v}"`,
    startsWith: (h, v) => `${h} beginnt mit „${v}"`,
    choice: (h, values) =>
        `${h}: ${new Intl.ListFormat('de', { type: 'disjunction' }).format(values)}`,
    between: (h, a, b) => `${h} ${a}–${b}`,
    from: (h, v) => `${h} ab ${v}`,
    to: (h, v) => `${h} bis ${v}`,
    min: (h, v) => `${h} ab ${v}`,
    max: (h, v) => `${h} bis ${v}`,
};

export const VIEWS_LABELS: GridViewsLabels = {
    trigger: 'Ansichten',
    save: 'Aktuelle Ansicht speichern …',
    saveTitle: 'Ansicht speichern',
    name: 'Name',
    confirm: 'Speichern',
    update: 'Ansicht aktualisieren',
    rename: 'Umbenennen …',
    renameTitle: 'Ansicht umbenennen',
    delete: 'Ansicht löschen',
    deleteConfirm: 'Löschen',
    confirmDelete: (name) => `„${name}" wird gelöscht. Deine Kurse bleiben, wie sie sind.`,
    cancel: 'Abbrechen',
    empty: 'Noch keine gespeicherten Ansichten.',
    modified: 'geändert',
    nameRequired: 'Bitte einen Namen eingeben.',
    closeLabel: 'Schließen',
};

export type CourseRow = {
    id: number;
    title: string;
    /** Where the course sits in the category tree; null for none. */
    categoryId: string | null;
    /** The category's path, e.g. "Arabisch › Grundstufe" — what the grid shows, sorts and groups by. */
    category: string | null;
    status: 'published' | 'draft' | 'archived';
    price: number | null;
    starts: string | null;
    enrolled: number;
    teacher: string;
};

/** "Arabisch › Grundstufe" for a category id, from whatever the tree looks like now. */
export function categoryPath(tree: TreeNode[], id: string | null): string | null {
    const path = id ? pathTo(tree, id) : [];
    return path.length ? path.map((n) => n.label).join(' › ') : null;
}

export const STATUS_LABEL: Record<CourseRow['status'], string> = {
    published: 'Veröffentlicht',
    draft: 'Entwurf',
    archived: 'Archiviert',
};

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const date = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
export const formatEuro = (n: number) => euro.format(n);
export const formatDate = (iso: string) => date.format(new Date(`${iso}T00:00:00`));

const TITLES: [string, string | null][] = [
    ['Arabisch für Anfänger', 'arabisch-grundstufe'],
    ['Arabisch Aufbaukurs', 'arabisch-aufbaustufe'],
    ['Tajwid Grundlagen', 'koran-tajwid'],
    ['Sira — Das Leben des Propheten', 'sira'],
    ['Kalligrafie-Werkstatt', 'kunst'],
    ['Medina-Buch 1', 'arabisch-grundstufe'],
    ['Fiqh des Alltags', 'fiqh'],
    ['Einführung in die Hadithwissenschaften', 'hadith'],
    ['Arabische Grammatik intensiv', 'arabisch-grammatik'],
    ['Islamische Kunstgeschichte', 'kunst'],
    ['Koranrezitation für Kinder', 'kinder'],
    ['Hifz-Kreis: Juz ʿAmma', 'koran-hifz'],
    ['Andalusien — eine Reise', 'sira'],
    ['Offene Sprechstunde', null],
];
const TEACHERS = ['Frau Berger', 'Herr Yılmaz', 'Frau Haddad', 'Herr Okafor'];
const STATUSES: CourseRow['status'][] = [
    'published',
    'published',
    'draft',
    'published',
    'archived',
];

/** Deterministic example courses — the same every render, so screenshots stay stable. */
export function makeCourses(count = TITLES.length): CourseRow[] {
    return Array.from({ length: count }, (_, i) => {
        const [title, categoryId] = TITLES[i % TITLES.length]!;
        const n = Math.floor(i / TITLES.length);
        const day = 1 + ((i * 7) % 27);
        const month = 9 + (i % 4);
        return {
            id: i + 1,
            title: n ? `${title} (${n + 1})` : title,
            categoryId,
            category: categoryPath(COURSE_CATEGORIES, categoryId),
            status: STATUSES[i % STATUSES.length]!,
            price: i % 6 === 4 ? null : 60 + ((i * 30) % 150),
            starts:
                i % 6 === 4
                    ? null
                    : `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            enrolled: (i * 7) % 25,
            teacher: TEACHERS[i % TEACHERS.length]!,
        };
    });
}

/** Every category as a filter choice, by its path. */
export function categoryOptions(tree: TreeNode[]) {
    const all = new Set(
        tree.flatMap(function ids(n): string[] {
            return [n.id, ...(n.children ?? []).flatMap(ids)];
        }),
    );
    return flattenVisible(tree, all).map((line) => {
        const path = categoryPath(tree, line.node.id)!;
        return { value: path, label: path };
    });
}

export const COURSE_COLUMNS: GridColumn<CourseRow>[] = [
    {
        id: 'title',
        header: 'Kurs',
        hideable: false,
        pinned: 'left',
        width: 280,
        filter: { type: 'text' },
    },
    {
        id: 'category',
        header: 'Kategorie',
        width: 220,
        groupable: true,
        filter: { type: 'choice', options: categoryOptions(COURSE_CATEGORIES) },
    },
    {
        id: 'status',
        header: 'Status',
        groupable: true,
        cell: (r) => STATUS_LABEL[r.status],
        exportValue: (r) => STATUS_LABEL[r.status],
        filter: {
            type: 'choice',
            options: Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
        },
    },
    {
        id: 'price',
        header: 'Preis',
        align: 'right',
        width: 120,
        aggregate: 'sum',
        formatAggregate: formatEuro,
        cell: (r) => (r.price === null ? '—' : formatEuro(r.price)),
        exportValue: (r) => (r.price === null ? '' : String(r.price)),
        filter: { type: 'number' },
    },
    {
        id: 'starts',
        header: 'Beginn',
        width: 130,
        cell: (r) => (r.starts ? formatDate(r.starts) : '—'),
        filter: { type: 'date' },
    },
    {
        id: 'enrolled',
        header: 'Angemeldet',
        align: 'right',
        width: 130,
        aggregate: 'sum',
        filter: { type: 'number' },
    },
    { id: 'teacher', header: 'Lehrkraft', groupable: true },
];
