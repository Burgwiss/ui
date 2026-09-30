import type { TreeNode } from '../../lib/tree';
import type { CategoryTreeLabels } from './CategoryTree';

/*
 * German example labels and a course-category tree for stories, tests and
 * page prototypes. Not exported from the package: an app brings its own.
 */

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const CATEGORY_TREE_LABELS: CategoryTreeLabels = {
    heading: 'Kategorien',
    empty: 'Noch keine Kategorien.',
    add: 'Neue Kategorie',
    newName: 'Neue Kategorie',
    nameInput: 'Name der Kategorie',
    edit: 'Bearbeiten',
    addChild: 'Unterkategorie anlegen',
    rename: 'Umbenennen',
    moveTo: 'Verschieben nach',
    topLevel: 'Oberste Ebene',
    moveUp: 'Nach oben',
    moveDown: 'Nach unten',
    outdent: 'Eine Ebene höher',
    indent: 'In die Kategorie darüber',
    delete: 'Löschen …',
    count: (n) => count(n, 'Kurs', 'Kurse'),
    confirmDeleteTitle: (name) => `„${name}" löschen?`,
    confirmDelete: (name, subcategories, items) => {
        const parts = [
            subcategories && count(subcategories, 'Unterkategorie', 'Unterkategorien'),
            items && count(items, 'Kurs', 'Kurse'),
        ].filter(Boolean);
        return `„${name}" enthält ${parts.join(' und ')}. Die Unterkategorien werden mitgelöscht; die Kurse bleiben und sind danach ohne Kategorie.`;
    },
    deleteConfirm: 'Löschen',
    cancel: 'Abbrechen',
    moved: (name, parent) =>
        parent === null
            ? `„${name}" auf die oberste Ebene verschoben.`
            : `„${name}" nach „${parent}" verschoben.`,
    deleted: (name) => `„${name}" gelöscht.`,
};

/** The course categories of an Islamic school — one tree, used by the tree, the grid and the page. */
export const COURSE_CATEGORIES: TreeNode[] = [
    {
        id: 'arabisch',
        label: 'Arabisch',
        children: [
            { id: 'arabisch-grundstufe', label: 'Grundstufe' },
            { id: 'arabisch-aufbaustufe', label: 'Aufbaustufe' },
            { id: 'arabisch-grammatik', label: 'Grammatik' },
        ],
    },
    {
        id: 'koran',
        label: 'Koran',
        children: [
            { id: 'koran-tajwid', label: 'Tajwid' },
            { id: 'koran-hifz', label: 'Hifz' },
        ],
    },
    {
        id: 'islamwissenschaften',
        label: 'Islamwissenschaften',
        children: [
            { id: 'fiqh', label: 'Fiqh' },
            { id: 'hadith', label: 'Hadith' },
            { id: 'sira', label: 'Sira & Geschichte' },
        ],
    },
    { id: 'kinder', label: 'Kinder & Jugend' },
    { id: 'kunst', label: 'Kunst & Kultur' },
];
