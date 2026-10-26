import { type RefObject } from 'react';
import type { GridView } from '../../hooks/useGridPreferences';
export interface GridViewsLabels {
    /** Name of the entry in the ⋮ menu that opens the views submenu, e.g. "Ansichten". */
    trigger: string;
    /** Submenu entry that opens the save dialog, e.g. "Aktuelle Ansicht speichern …". */
    save: string;
    /** Heading of the save dialog, e.g. "Ansicht speichern". */
    saveTitle: string;
    /** Label of the name input in the save and rename dialogs, e.g. "Name der Ansicht". */
    name: string;
    /** Submit button of the save and rename dialogs, e.g. "Speichern". */
    confirm: string;
    /** Submenu entry that overwrites the active view with the current setup, e.g. "Aktive Ansicht aktualisieren". */
    update: string;
    /** Submenu entry that opens the rename dialog, e.g. "Ansicht umbenennen …". */
    rename: string;
    /** Heading of the rename dialog, e.g. "Ansicht umbenennen". */
    renameTitle: string;
    /** Submenu entry that starts deleting the active view, e.g. "Ansicht löschen …". Also the confirmation dialog's heading. */
    delete: string;
    /** The confirmation dialog's destructive button, e.g. "Löschen". */
    deleteConfirm: string;
    /** The confirmation dialog's warning, from the view's name, e.g. `Die Ansicht „${name}“ wird gelöscht.` */
    confirmDelete: (name: string) => string;
    /** Cancel button of every dialog, e.g. "Abbrechen". */
    cancel: string;
    /** Shown in the submenu while there are no saved views, e.g. "Noch keine Ansichten gespeichert.". */
    empty: string;
    /** Read out by screen readers on the views entry while the setup differs from the active view (the dot on the ⋮ button is decorative), e.g. "geändert". */
    modified: string;
    /** Error under the name input when it is empty, e.g. "Bitte einen Namen eingeben.". */
    nameRequired: string;
    /** Accessible name of the save and rename dialogs' corner close button, e.g. "Schließen". */
    closeLabel: string;
}
export interface GridOptionsViews {
    /** The saved views, in menu order. */
    views: GridView[];
    /** The view currently applied, or null. An id that is not in `views` counts as null. */
    activeViewId: string | null;
    /** The current setup differs from the active view: shows a dot on the ⋮ button and offers "update". */
    isModified: boolean;
    /** Called with the id of the view the person picked. */
    onApply: (id: string) => void;
    /** Called with the trimmed, non-empty name of a new view to save from the current setup. */
    onSave: (name: string) => void;
    /** Called with the active view's id to overwrite it with the current setup. Without it, "update" is not offered. */
    onUpdate?: (id: string) => void;
    /** Called with the active view's id and its new trimmed, non-empty name. Not called when the name is unchanged. */
    onRename: (id: string, name: string) => void;
    /** Called with the active view's id once the person confirmed deleting it. */
    onDelete: (id: string) => void;
    /** All visible text, in the app's language. */
    labels: GridViewsLabels;
}
type Dialogs = {
    kind: 'save';
} | {
    kind: 'rename';
    id: string;
    name: string;
} | {
    kind: 'delete';
    id: string;
    name: string;
};
/**
 * What the views submenu asks the ⋮ menu to open once it has closed. Menu items only record
 * the request; `onCloseAutoFocus` (below) opens the dialog after the menu is fully gone.
 */
export type GridViewsRequest = Dialogs;
/**
 * Owns the save / rename / delete dialogs of the views submenu and the focus hand-off from
 * the ⋮ menu. The dialogs render OUTSIDE the dropdown (its content unmounts on close), so the
 * caller renders `dialogs` beside the menu and passes `onCloseAutoFocus` to the root
 * `DropdownMenuContent`. Focus returns to `triggerRef` after the menu or a dialog closes.
 * Works without views: nothing is ever requested, so nothing opens.
 */
export declare function useGridViewsDialogs(views: GridOptionsViews | undefined, triggerRef: RefObject<HTMLElement | null>): {
    request: (next: GridViewsRequest) => void;
    onCloseAutoFocus: (event: Event) => void;
    dialogs: import("react").JSX.Element | undefined;
};
/**
 * The "Ansichten" submenu at the top of the ⋮ menu: the entry shows the active view's name
 * (muted, truncated) and, while the setup has drifted from it, a dot plus screen-reader text.
 * Its panel lists the views as radios, then save, update, rename and delete.
 */
export declare function GridViewsSubmenu({ views: { views, activeViewId, isModified, onApply, onUpdate, labels }, request, }: {
    views: GridOptionsViews;
    request: (next: GridViewsRequest) => void;
}): import("react").JSX.Element;
export {};
