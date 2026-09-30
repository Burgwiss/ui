import { Bookmark, BookmarkPlus, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { useId, useRef, useState, type RefObject } from 'react';

import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import type { GridView } from '../../hooks/useGridPreferences';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../AlertDialog';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import {
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '../DropdownMenu';

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

type Dialogs =
    | { kind: 'save' }
    | { kind: 'rename'; id: string; name: string }
    | { kind: 'delete'; id: string; name: string };

/** A small modal asking for a view's name: required, trimmed, Enter submits. Mounted only while open, so it always starts fresh. */
function NameDialog({
    title,
    initial,
    labels,
    onSubmit,
    onClose,
    onCloseAutoFocus,
}: {
    title: string;
    initial: string;
    labels: GridViewsLabels;
    onSubmit: (name: string) => void;
    onClose: () => void;
    onCloseAutoFocus: (event: Event) => void;
}) {
    const [name, setName] = useState(initial);
    const [failed, setFailed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputId = useId();

    const submit = () => {
        const trimmed = name.trim();
        if (trimmed === '') {
            setFailed(true);
            inputRef.current?.focus();
            return;
        }
        onSubmit(trimmed);
        onClose();
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                closeLabel={labels.closeLabel}
                aria-describedby={undefined}
                className="max-w-sm"
                onCloseAutoFocus={onCloseAutoFocus}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor={inputId}>{labels.name}</Label>
                    <Input
                        id={inputId}
                        ref={inputRef}
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            setFailed(false);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                                event.preventDefault();
                                submit();
                            }
                        }}
                        aria-invalid={failed || undefined}
                        aria-describedby={failed ? `${inputId}-error` : undefined}
                    />
                    {failed && (
                        <p
                            id={`${inputId}-error`}
                            role="alert"
                            className="text-sm text-destructive"
                        >
                            {labels.nameRequired}
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        {labels.cancel}
                    </Button>
                    <Button type="button" onClick={submit}>
                        {labels.confirm}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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
export function useGridViewsDialogs(
    views: GridOptionsViews | undefined,
    triggerRef: RefObject<HTMLElement | null>,
) {
    const [dialog, setDialog] = useState<Dialogs | null>(null);
    // A dialog opened from a menu item waits for the menu to finish closing; the item only
    // records what it wants.
    const pending = useRef<Dialogs | null>(null);

    const restoreFocus = (event: Event) => {
        event.preventDefault();
        triggerRef.current?.focus();
    };

    const onCloseAutoFocus = (event: Event) => {
        // Take focus back ourselves, then open the dialog the item asked for: the menu is
        // fully gone by now, so the dialog does not fight it for focus, and on close it
        // returns focus to the trigger.
        restoreFocus(event);
        if (pending.current) {
            setDialog(pending.current);
            pending.current = null;
        }
    };

    const request = (next: GridViewsRequest) => {
        pending.current = next;
    };

    const dialogs = views && (
        <>
            {dialog?.kind === 'save' && (
                <NameDialog
                    title={views.labels.saveTitle}
                    initial=""
                    labels={views.labels}
                    onSubmit={views.onSave}
                    onClose={() => setDialog(null)}
                    onCloseAutoFocus={restoreFocus}
                />
            )}
            {dialog?.kind === 'rename' && (
                <NameDialog
                    title={views.labels.renameTitle}
                    initial={dialog.name}
                    labels={views.labels}
                    onSubmit={(name) => {
                        if (name !== dialog.name) views.onRename(dialog.id, name);
                    }}
                    onClose={() => setDialog(null)}
                    onCloseAutoFocus={restoreFocus}
                />
            )}
            {dialog?.kind === 'delete' && (
                <AlertDialog open onOpenChange={(open) => !open && setDialog(null)}>
                    <AlertDialogContent onCloseAutoFocus={restoreFocus}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{views.labels.delete}</AlertDialogTitle>
                            <AlertDialogDescription>
                                {views.labels.confirmDelete(dialog.name)}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{views.labels.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => views.onDelete(dialog.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {views.labels.deleteConfirm}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );

    return { request, onCloseAutoFocus, dialogs };
}

/**
 * The "Ansichten" submenu at the top of the ⋮ menu: the entry shows the active view's name
 * (muted, truncated) and, while the setup has drifted from it, a dot plus screen-reader text.
 * Its panel lists the views as radios, then save, update, rename and delete.
 */
export function GridViewsSubmenu({
    views: { views, activeViewId, isModified, onApply, onUpdate, labels },
    request,
}: {
    views: GridOptionsViews;
    request: (next: GridViewsRequest) => void;
}) {
    const active = views.find((view) => view.id === activeViewId);

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Bookmark className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{labels.trigger}</span>
                {/* Text nodes between the spans: flex drops them visually, but they keep the
                    accessible name readable ("Ansichten Nur Arabisch geändert"). */}{' '}
                {active && (
                    <span className="max-w-28 truncate text-xs text-muted-foreground">
                        {active.name}
                    </span>
                )}{' '}
                {isModified && (
                    <>
                        <span
                            data-modified-dot=""
                            aria-hidden="true"
                            className="size-2 shrink-0 rounded-full bg-primary"
                        />{' '}
                        <span className="sr-only">{labels.modified}</span>
                    </>
                )}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64">
                {views.length === 0 ? (
                    <DropdownMenuLabel className="font-normal text-muted-foreground">
                        {labels.empty}
                    </DropdownMenuLabel>
                ) : (
                    <DropdownMenuRadioGroup value={active?.id ?? ''} onValueChange={onApply}>
                        {views.map((view) => (
                            <DropdownMenuRadioItem key={view.id} value={view.id}>
                                {view.name}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => request({ kind: 'save' })}>
                    <BookmarkPlus className="size-4 text-muted-foreground" aria-hidden="true" />
                    {labels.save}
                </DropdownMenuItem>
                {active && isModified && onUpdate && (
                    <DropdownMenuItem onSelect={() => onUpdate(active.id)}>
                        <RefreshCw className="size-4 text-muted-foreground" aria-hidden="true" />
                        {labels.update}
                    </DropdownMenuItem>
                )}
                {active && (
                    <>
                        <DropdownMenuItem
                            onSelect={() =>
                                request({ kind: 'rename', id: active.id, name: active.name })
                            }
                        >
                            <Pencil className="size-4 text-muted-foreground" aria-hidden="true" />
                            {labels.rename}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() =>
                                request({ kind: 'delete', id: active.id, name: active.name })
                            }
                        >
                            <Trash2 className="size-4 text-muted-foreground" aria-hidden="true" />
                            {labels.delete}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuSubContent>
        </DropdownMenuSub>
    );
}
