import { type ShortcutLabels } from '../../hooks/shortcuts';
import { type TreeNode } from '../../lib/tree';
export interface CategoryTreeLabels {
    /** Heading above the tree; also the tree's accessible name, e.g. "Kategorien". */
    heading: string;
    /** Shown instead of the tree while there are no categories, e.g. "Noch keine Kategorien.". */
    empty: string;
    /** The + button's name and tooltip, e.g. "Neue Kategorie". */
    add: string;
    /** The name a new category starts with, pre-selected so typing replaces it. */
    newName: string;
    /** Accessible name of the inline name field, e.g. "Name der Kategorie". */
    nameInput: string;
    /** The pencil's tooltip and the first menu entry, when `onEdit` is given, e.g. "Bearbeiten". */
    edit?: string;
    /** Menu entry, e.g. "Unterkategorie anlegen". */
    addChild: string;
    /** Menu entry (F2), e.g. "Umbenennen". */
    rename: string;
    /** Submenu listing every place the category can go, e.g. "Verschieben nach". */
    moveTo: string;
    /** First destination in that submenu, and the drop zone while dragging, e.g. "Oberste Ebene". */
    topLevel: string;
    /** Menu entry (Alt+↑), e.g. "Nach oben". */
    moveUp: string;
    /** Menu entry (Alt+↓), e.g. "Nach unten". */
    moveDown: string;
    /** Menu entry (Alt+←): out of its parent, e.g. "Eine Ebene höher". */
    outdent: string;
    /** Menu entry (Alt+→): into the category above, e.g. "In die Kategorie darüber". */
    indent: string;
    /** Menu entry (Delete), e.g. "Löschen …". */
    delete: string;
    /** Read after the name when `counts` has the category, e.g. `(n) => \`${n} Kurse\``. */
    count: (count: number) => string;
    /** Heading of the delete confirmation, e.g. `(name) => \`„${name}" löschen?\``. */
    confirmDeleteTitle: (name: string) => string;
    /** Body of the delete confirmation: what goes with it. Either number may be 0. */
    confirmDelete: (name: string, subcategories: number, items: number) => string;
    /** The confirmation's destructive button, e.g. "Löschen". */
    deleteConfirm: string;
    /** The confirmation's cancel button, e.g. "Abbrechen". */
    cancel: string;
    /** Announced after a move into another parent; `parent` is null for the top level. */
    moved: (name: string, parent: string | null) => string;
    /** Announced after a delete, e.g. `(name) => \`„${name}" gelöscht.\``. */
    deleted: (name: string) => string;
}
export interface CategoryTreeProps {
    /** The categories, nested. Controlled: pass the tree you keep in state. */
    nodes: TreeNode[];
    /**
     * Called with the whole new tree after an add, rename, move or delete. Without it the
     * tree is read-only: no + button, no menu, no dragging, no F2/Delete/Alt+arrows.
     */
    onNodesChange?: (nodes: TreeNode[]) => void;
    /** The selected category, or null for none (e.g. "Alle Kurse" is active). */
    selectedId: string | null;
    /** Called on click, Enter or Space — and with null when the selected category is deleted. */
    onSelect: (id: string | null) => void;
    /**
     * Open a category's own page (its editor). Adds a pencil beside ⋮ on hover and
     * "Bearbeiten" at the top of the menu — also in a read-only tree.
     */
    onEdit?: (id: string) => void;
    /**
     * A number after each name, e.g. courses per category. Shown as given, so pass totals
     * that include subcategories if that is what the page means. Missing ids show none.
     */
    counts?: Record<string, number>;
    /** Makes the id of a new category. Default `crypto.randomUUID()`. */
    createId?: () => string;
    /** Categories open on first render, when nothing is remembered. */
    defaultExpandedIds?: string[];
    /** Remember which categories are open under this name (localStorage `burgwiss-ui:tree:<key>`). */
    storageKey?: string;
    /** Key names in the menu's shortcut hints, e.g. `{ Delete: 'Entf' }`. */
    shortcutLabels?: ShortcutLabels;
    /** All visible text, in the app's language. */
    labels: CategoryTreeLabels;
    className?: string;
}
/**
 * A tree of categories (folders) for a sidebar: pick one to filter a list,
 * and — when `onNodesChange` is given — add, rename, delete and move them.
 * Moving works four ways: drag a category onto another (into it) or between
 * two (beside them), Alt + arrow keys, the "Verschieben nach" submenu, or the
 * up/down/indent/outdent menu entries. Right-click, ⋮ or Shift+F10 opens the
 * menu. A category with subcategories or items asks before it is deleted.
 *
 * Keyboard (ARIA tree pattern): ↑ ↓ Home End to walk, → to open or step in,
 * ← to close or step out (swapped right-to-left), Enter/Space to select,
 * typing jumps by name, F2 renames, Delete deletes, Alt+↑↓ reorders, Alt+→
 * indents into the category above, Alt+← outdents. Every move is announced.
 *
 * It holds the open/closed state only (remembered per `storageKey`); the tree,
 * the selection and the counts belong to the page. For flat navigation use
 * `SidebarMenu`.
 *
 * @summary Editable folder tree: select, add, rename, delete and move categories by drag, keys or menu.
 */
export declare function CategoryTree({ nodes, onNodesChange, selectedId, onSelect, onEdit, counts, createId, defaultExpandedIds, storageKey, shortcutLabels, labels, className, }: CategoryTreeProps): import("react").JSX.Element;
