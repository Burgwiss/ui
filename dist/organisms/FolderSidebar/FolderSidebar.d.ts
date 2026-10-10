import type { ReactNode } from 'react';
import type { FolderScope } from '../../lib/tree';
import { type CategoryTreeProps } from '../CategoryTree';
import { type SidebarProps } from '../Sidebar';
/** One of the two fixed entries above the folders. */
export interface FolderSidebarEntry {
    /** Visible text, already translated, e.g. "Alle Kurse". */
    label: string;
    /** Number shown at the end of the row. Omit for none. */
    count?: number;
    /** Replaces the default icon (`Inbox` for "all", `CircleSlash` for "none"). */
    icon?: ReactNode;
}
export interface FolderSidebarProps {
    /** Heading at the top and the panel's accessible name, e.g. "Kurse". */
    title: string;
    /** Makes the panel resizable; passed to `Sidebar`'s `resize`. */
    resize?: SidebarProps['resize'];
    /** The "all items" entry, e.g. "Alle Kurse". */
    all: FolderSidebarEntry;
    /** The "without folder" entry, e.g. "Ohne Kategorie". Omit to hide it. */
    none?: FolderSidebarEntry;
    /**
     * What the list shows. `null` when the current page is not the list (a settings page):
     * nothing is highlighted, but clicks still call `onScopeChange`.
     */
    scope: FolderScope | null;
    /** Called when a reader picks "all", "none" or a folder. */
    onScopeChange: (scope: FolderScope) => void;
    /** Everything `CategoryTree` takes except selection, which the sidebar owns. */
    tree: Omit<CategoryTreeProps, 'selectedId' | 'onSelect'>;
    /**
     * Remounts the tree when it changes — e.g. after the server refused an edit, so no
     * half-typed name survives it.
     */
    treeKey?: string;
    /** Formats the counts beside the entries, e.g. `(n) => n.toLocaleString('de')`. Default `String`. */
    formatCount?: (n: number) => string;
    /** Groups after the tree — the area's own links (tags, settings). Use `SidebarGroup` and `SidebarMenu`. */
    children?: ReactNode;
}
/**
 * The sidebar of a list that is sorted into folders: "all items", "without folder",
 * an editable folder tree, then the area's own links. Picking an entry tells the page
 * which `FolderScope` to filter its grid by.
 *
 * Use it beside a `DataGrid` or list whose items each sit in at most one folder. The
 * page keeps the scope, the folder tree and the counts; the sidebar only draws them.
 * Pass `tree.maxDepth={1}` for flat folders. For plain navigation without folders use
 * `Sidebar` with `SidebarMenu` directly.
 *
 * @summary Sidebar with "all", "without folder" and an editable folder tree that filters a list.
 */
export declare function FolderSidebar({ title, resize, all, none, scope, onScopeChange, tree, treeKey, formatCount, children, }: FolderSidebarProps): import("react").JSX.Element;
