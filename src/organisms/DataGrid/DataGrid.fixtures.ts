import type { GridColumn } from '../../hooks/grid/types';
import type { GridFilterChipsLabels } from '../../molecules/GridFilterChips';
import type { GridFilterEditorLabels } from '../../molecules/GridFilterEditor';
import type { GridViewsMenuLabels } from '../../molecules/GridViewsMenu';
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

export const VIEWS_LABELS: GridViewsMenuLabels = {
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

export type Offering = {
    id: string;
    label: string;
    starts: string;
    place: string;
    seats: number;
    enrolled: number;
};

export type CourseRow = {
    id: number;
    title: string;
    category: string | null;
    level: string;
    status: 'published' | 'draft' | 'archived';
    price: number | null;
    starts: string | null;
    enrolled: number;
    teacher: string;
    offerings: Offering[];
};

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

const TITLES: [string, string | null, string][] = [
    ['Arabisch für Anfänger', 'Sprachen', 'A1'],
    ['Arabisch Aufbaukurs', 'Sprachen', 'A2'],
    ['Tajweed Grundlagen', 'Religion', 'A1'],
    ['Sira — Das Leben des Propheten', 'Geschichte', 'B1'],
    ['Kalligrafie-Werkstatt', 'Kunst', 'A1'],
    ['Medina Buch 1', 'Sprachen', 'A1'],
    ['Fiqh des Alltags', 'Religion', 'B1'],
    ['Hadith-Wissenschaften', 'Religion', 'C1'],
    ['Arabische Grammatik intensiv', 'Sprachen', 'B2'],
    ['Islamische Kunstgeschichte', 'Kunst', 'B1'],
    ['Koran-Rezitation für Kinder', 'Religion', 'A1'],
    ['Andalusien — Eine Reise', 'Geschichte', 'A2'],
    ['Offene Sprechstunde', null, 'A1'],
];
const TEACHERS = ['Frau Berger', 'Herr Yılmaz', 'Frau Haddad', 'Herr Okafor'];
const PLACES = ['Online', 'Raum 2', 'Moschee Süd', 'Online'];
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
        const [title, category, level] = TITLES[i % TITLES.length]!;
        const n = Math.floor(i / TITLES.length);
        const day = 1 + ((i * 7) % 27);
        const month = 9 + (i % 4);
        return {
            id: i + 1,
            title: n ? `${title} (${n + 1})` : title,
            category,
            level,
            status: STATUSES[i % STATUSES.length]!,
            price: i % 6 === 4 ? null : 60 + ((i * 30) % 150),
            starts:
                i % 6 === 4
                    ? null
                    : `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            enrolled: (i * 7) % 25,
            teacher: TEACHERS[i % TEACHERS.length]!,
            offerings: Array.from({ length: i % 3 }, (_, k) => ({
                id: `${i + 1}-${k + 1}`,
                label: k === 0 ? 'Herbst 2026' : 'Frühjahr 2027',
                starts: k === 0 ? '2026-10-05' : '2027-03-01',
                place: PLACES[(i + k) % PLACES.length]!,
                seats: 20,
                enrolled: (i * 3 + k * 5) % 21,
            })),
        };
    });
}

export const COURSE_COLUMNS: GridColumn<CourseRow>[] = [
    { id: 'title', header: 'Kurs', hideable: false, width: 280, filter: { type: 'text' } },
    {
        id: 'category',
        header: 'Kategorie',
        groupable: true,
        filter: {
            type: 'choice',
            options: ['Sprachen', 'Religion', 'Geschichte', 'Kunst'].map((v) => ({
                value: v,
                label: v,
            })),
        },
    },
    { id: 'level', header: 'Niveau', width: 100, groupable: true },
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
