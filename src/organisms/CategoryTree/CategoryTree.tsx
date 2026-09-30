import {
    ArrowDown,
    ArrowUp,
    ChevronRight,
    EllipsisVertical,
    Folder,
    FolderInput,
    FolderOpen,
    FolderPlus,
    IndentDecrease,
    IndentIncrease,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent as ReactPointerEvent,
} from 'react';

import { IconButton } from '../../atoms/IconButton';
import { formatShortcut, type ShortcutLabels } from '../../hooks/shortcuts';
import { cn } from '../../lib/cn';
import {
    canMove,
    descendantIds,
    findNode,
    flattenVisible,
    indentNode,
    insertNode,
    locate,
    moveNode,
    moveSibling,
    outdentNode,
    pathTo,
    removeNode,
    renameNode,
    type TreeLine,
    type TreeNode,
} from '../../lib/tree';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../molecules/AlertDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';

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

type Editing = { kind: 'rename'; id: string } | { kind: 'new'; parentId: string | null } | null;
type Zone = 'before' | 'after' | 'inside' | 'end';
type DropTarget = { lineId: string | null; zone: Zone; parentId: string | null; index: number };
type Line = TreeLine & { draft?: boolean };

const INDENT = 16;
const DRAG_THRESHOLD = 6;
const AUTO_EXPAND_MS = 600;
const TYPEAHEAD_MS = 700;
const DRAFT_ID = '\u0000draft';

function readExpanded(storageKey: string | undefined): string[] | null {
    if (!storageKey || typeof localStorage === 'undefined') return null;
    try {
        const value: unknown = JSON.parse(
            localStorage.getItem(`burgwiss-ui:tree:${storageKey}`) ?? 'null',
        );
        return Array.isArray(value) && value.every((v) => typeof v === 'string') ? value : null;
    } catch {
        return null;
    }
}

/** The inline name field for a rename or a new category. Mounted per edit, so it starts fresh. */
function NameField({
    initial,
    label,
    onDone,
}: {
    initial: string;
    label: string;
    /** `value` null means cancelled. `keyboard` is false when focus simply left the field. */
    onDone: (value: string | null, keyboard: boolean) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const done = useRef(false);
    useEffect(() => {
        ref.current?.focus();
        ref.current?.select();
    }, []);
    const finish = (value: string | null, keyboard: boolean) => {
        if (done.current) return;
        done.current = true;
        onDone(value, keyboard);
    };
    return (
        <input
            ref={ref}
            aria-label={label}
            defaultValue={initial}
            onKeyDown={(event) => {
                // The tree's keys (arrows, Home, letters) belong to the field while it is open.
                event.stopPropagation();
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    finish(event.currentTarget.value, true);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    finish(null, true);
                }
            }}
            onBlur={(event) => finish(event.currentTarget.value, false)}
            onClick={(event) => event.stopPropagation()}
            className="h-6 min-w-0 flex-1 rounded-sm border border-ring bg-background px-1.5 text-sm outline-none"
        />
    );
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
export function CategoryTree({
    nodes,
    onNodesChange,
    selectedId,
    onSelect,
    counts,
    createId = () => crypto.randomUUID(),
    defaultExpandedIds = [],
    storageKey,
    shortcutLabels,
    labels,
    className,
}: CategoryTreeProps) {
    const editable = onNodesChange !== undefined;
    const headingId = useId();
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => {
        const open = new Set(readExpanded(storageKey) ?? defaultExpandedIds);
        if (selectedId)
            pathTo(nodes, selectedId)
                .slice(0, -1)
                .forEach((n) => open.add(n.id));
        return open;
    });
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [editing, setEditing] = useState<Editing>(null);
    const [menuId, setMenuId] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [announcement, setAnnouncement] = useState('');
    const [drag, setDrag] = useState<{ id: string; target: DropTarget | null } | null>(null);
    const [, bump] = useState(0);

    const lineEls = useRef(new Map<string, HTMLElement>());
    const treeRef = useRef<HTMLDivElement>(null);
    const pendingFocus = useRef<string | null>(null);
    const afterMenu = useRef<(() => void) | null>(null);
    const afterConfirm = useRef<string | null>(null);
    const suppressClick = useRef(false);
    const typeahead = useRef({ text: '', at: 0 });

    const updateExpanded = (update: (open: Set<string>) => void) =>
        setExpanded((current) => {
            const next = new Set(current);
            update(next);
            if (storageKey && typeof localStorage !== 'undefined')
                localStorage.setItem(`burgwiss-ui:tree:${storageKey}`, JSON.stringify([...next]));
            return next;
        });

    const lines: Line[] = useMemo(() => {
        const visible: Line[] = flattenVisible(nodes, expanded);
        if (editing?.kind !== 'new') return visible;
        const draft = (level: number, parentId: string | null): Line => ({
            node: { id: DRAFT_ID, label: labels.newName },
            level,
            parentId,
            posInSet: 0,
            setSize: 0,
            hasChildren: false,
            expanded: false,
            draft: true,
        });
        const at = visible.findIndex((l) => l.node.id === editing.parentId);
        if (at < 0) return [...visible, draft(1, null)];
        const parent = visible[at]!;
        let end = at + 1;
        while (end < visible.length && visible[end]!.level > parent.level) end++;
        return [
            ...visible.slice(0, end),
            draft(parent.level + 1, parent.node.id),
            ...visible.slice(end),
        ];
    }, [nodes, expanded, editing, labels.newName]);

    // What the drag listeners read: they outlive the render that created them.
    const latest = useRef({ nodes, lines });
    useEffect(() => {
        latest.current = { nodes, lines };
    });

    // Focus asked for by a handler lands once the element exists.
    useEffect(() => {
        const id = pendingFocus.current;
        const el = id ? lineEls.current.get(id) : undefined;
        if (el) {
            el.focus();
            pendingFocus.current = null;
        }
    });
    const focusLater = (id: string | null) => {
        pendingFocus.current = id;
        bump((n) => n + 1);
    };

    const tabStop =
        (focusedId && lines.some((l) => l.node.id === focusedId) && focusedId) ||
        (selectedId && lines.some((l) => l.node.id === selectedId) && selectedId) ||
        lines[0]?.node.id;

    const change = (next: TreeNode[]) => onNodesChange?.(next);

    /** Commit a move built by one of the tree helpers; they return the same tree for a no-op. */
    const applyMove = (id: string, next: TreeNode[]) => {
        if (next === nodes) return;
        const node = findNode(next, id)!;
        const before = locate(nodes, id)!;
        const after = locate(next, id)!;
        if (after.parentId !== null)
            updateExpanded((open) => pathTo(next, after.parentId!).forEach((n) => open.add(n.id)));
        change(next);
        if (after.parentId !== before.parentId)
            setAnnouncement(
                labels.moved(
                    node.label,
                    after.parentId === null ? null : findNode(next, after.parentId)!.label,
                ),
            );
        focusLater(id);
    };

    const toggle = (id: string, open?: boolean) =>
        updateExpanded((set) => {
            if (open ?? !set.has(id)) set.add(id);
            else set.delete(id);
        });

    const startNew = (parentId: string | null) => {
        if (parentId) toggle(parentId, true);
        setEditing({ kind: 'new', parentId });
    };

    const remove = (id: string) => {
        const node = findNode(nodes, id);
        if (!node) return;
        const i = lines.findIndex((l) => l.node.id === id);
        const own = lines[i];
        const nextLine = own && lines.slice(i + 1).find((l) => l.level <= own.level && !l.draft);
        const neighbour = nextLine ?? (i > 0 ? lines[i - 1] : undefined);
        if (selectedId && descendantIds(nodes, id).includes(selectedId)) onSelect(null);
        change(removeNode(nodes, id));
        setAnnouncement(labels.deleted(node.label));
        focusLater(neighbour?.node.id ?? null);
        return neighbour?.node.id ?? null;
    };

    const requestDelete = (id: string) => {
        const subcategories = descendantIds(nodes, id).length - 1;
        if (subcategories > 0 || (counts?.[id] ?? 0) > 0) setConfirmId(id);
        else remove(id);
    };

    const finishEdit = (value: string | null, keyboard: boolean) => {
        const edit = editing;
        setEditing(null);
        if (!edit) return;
        const name = value?.trim() ?? '';
        if (edit.kind === 'rename') {
            const node = findNode(nodes, edit.id);
            if (node && name && name !== node.label) change(renameNode(nodes, edit.id, name));
            if (keyboard) focusLater(edit.id);
            return;
        }
        if (!name) {
            if (keyboard) focusLater(edit.parentId ?? tabStop ?? null);
            return;
        }
        const id = createId();
        change(insertNode(nodes, edit.parentId, { id, label: name }));
        if (keyboard) focusLater(id);
    };

    const focusLine = (index: number) => {
        const line = lines[Math.max(0, Math.min(index, lines.length - 1))];
        if (line) lineEls.current.get(line.node.id)?.focus();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const row = (event.target as HTMLElement).closest<HTMLElement>('[role=treeitem]');
        const id = row?.dataset.id;
        const i = lines.findIndex((l) => l.node.id === id);
        const line = lines[i];
        if (!id || !line || line.draft) return;
        const rtl = event.currentTarget.closest('[dir=rtl]') !== null;
        const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
        const back = rtl ? 'ArrowRight' : 'ArrowLeft';
        const handled = () => {
            event.preventDefault();
            event.stopPropagation();
        };

        if (event.altKey && !event.ctrlKey && !event.metaKey) {
            const moves: Record<string, () => TreeNode[]> = {
                ArrowUp: () => moveSibling(nodes, id, -1),
                ArrowDown: () => moveSibling(nodes, id, 1),
                [forward]: () => indentNode(nodes, id),
                [back]: () => outdentNode(nodes, id),
            };
            if (editable && moves[event.key]) {
                handled();
                applyMove(id, moves[event.key]!());
            }
            return;
        }
        if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
            if (editable) {
                handled();
                setMenuId(id);
            }
            return;
        }
        switch (event.key) {
            case 'ArrowDown':
                handled();
                return focusLine(i + 1);
            case 'ArrowUp':
                handled();
                return focusLine(i - 1);
            case 'Home':
                handled();
                return focusLine(0);
            case 'End':
                handled();
                return focusLine(lines.length - 1);
            case forward:
                handled();
                if (line.hasChildren && !line.expanded) return toggle(id, true);
                if (line.expanded) return focusLine(i + 1);
                return;
            case back:
                handled();
                if (line.expanded) return toggle(id, false);
                if (line.parentId) lineEls.current.get(line.parentId)?.focus();
                return;
            case 'Enter':
            case ' ':
                handled();
                return onSelect(id);
            case 'F2':
                if (!editable) return;
                handled();
                return setEditing({ kind: 'rename', id });
            case 'Delete':
            case 'Backspace':
                if (!editable) return;
                handled();
                return requestDelete(id);
        }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            const now = event.timeStamp;
            const state = typeahead.current;
            state.text = now - state.at > TYPEAHEAD_MS ? event.key : state.text + event.key;
            state.at = now;
            const text = state.text.toLocaleLowerCase();
            // The same letter again cycles through the names starting with it.
            const cycling = [...text].every((c) => c === text[0]);
            const needle = cycling ? text[0]! : text;
            const order = [...lines.slice(i + (cycling ? 1 : 0)), ...lines.slice(0, i + 1)];
            const hit = order.find(
                (l) => !l.draft && l.node.label.toLocaleLowerCase().startsWith(needle),
            );
            if (hit) {
                handled();
                lineEls.current.get(hit.node.id)?.focus();
            }
        }
    };

    // ——— dragging ———————————————————————————————————————————————

    const dropTargetAt = (x: number, y: number, dragId: string): DropTarget | null => {
        const { nodes: tree, lines: visible } = latest.current;
        const el = document.elementFromPoint(x, y);
        const valid = (t: DropTarget) =>
            canMove(tree, dragId, t.parentId) &&
            moveNode(tree, dragId, t.parentId, t.index) !== tree
                ? t
                : null;
        if (el?.closest('[data-tree-end]') && treeRef.current?.parentElement?.contains(el))
            return valid({ lineId: null, zone: 'end', parentId: null, index: tree.length });
        const row = el?.closest<HTMLElement>('[data-tree-line]');
        if (!row || !treeRef.current?.contains(row)) return null;
        const line = visible.find((l) => l.node.id === row.dataset.id);
        if (!line || line.draft || line.node.id === dragId) return null;
        const rect = row.getBoundingClientRect();
        const at = (y - rect.top) / rect.height;
        const zone: Zone = at < 0.25 ? 'before' : at > 0.75 ? 'after' : 'inside';
        const id = line.node.id;
        if (zone === 'before')
            return valid({ lineId: id, zone, parentId: line.parentId, index: line.posInSet - 1 });
        if (zone === 'after')
            return line.expanded
                ? valid({ lineId: id, zone, parentId: id, index: 0 })
                : valid({ lineId: id, zone, parentId: line.parentId, index: line.posInSet });
        return valid({
            lineId: id,
            zone,
            parentId: id,
            index: line.node.children?.length ?? 0,
        });
    };

    const onPointerDown = (event: ReactPointerEvent<HTMLElement>, id: string) => {
        if (!editable || event.button !== 0 || event.pointerType === 'touch') return;
        if ((event.target as Element).closest('input,[data-tree-menu],[data-tree-toggle]')) return;
        const start = { x: event.clientX, y: event.clientY };
        let active = false;
        let hover: { id: string | null; timer: number } = { id: null, timer: 0 };

        const cleanup = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', cancel);
            window.removeEventListener('keydown', escape, true);
            window.clearTimeout(hover.timer);
            setDrag(null);
        };
        const move = (e: PointerEvent) => {
            if (!active) {
                if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < DRAG_THRESHOLD) return;
                active = true;
            }
            const target = dropTargetAt(e.clientX, e.clientY, id);
            setDrag({ id, target });
            // Hovering "into" a closed category opens it after a moment.
            const opens = target?.zone === 'inside' ? target.lineId : null;
            if (opens !== hover.id) {
                window.clearTimeout(hover.timer);
                hover = {
                    id: opens,
                    timer: opens ? window.setTimeout(() => toggle(opens, true), AUTO_EXPAND_MS) : 0,
                };
            }
        };
        const up = (e: PointerEvent) => {
            const target = active ? dropTargetAt(e.clientX, e.clientY, id) : null;
            cleanup();
            if (!active) return;
            // The click that follows a drag must not select the row it ends on.
            suppressClick.current = true;
            window.setTimeout(() => (suppressClick.current = false), 0);
            const tree = latest.current.nodes;
            if (target) applyMove(id, moveNode(tree, id, target.parentId, target.index));
        };
        const cancel = () => cleanup();
        const escape = (e: globalThis.KeyboardEvent) => {
            if (e.key !== 'Escape' || !active) return;
            e.preventDefault();
            e.stopPropagation();
            active = false;
            cleanup();
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', cancel);
        window.addEventListener('keydown', escape, true);
    };

    // ——— rendering ——————————————————————————————————————————————

    const allLines = useMemo(
        () =>
            menuId
                ? flattenVisible(nodes, new Set(nodes.flatMap((n) => descendantIds(nodes, n.id))))
                : [],
        [menuId, nodes],
    );
    const shortcut = (keys: string) => formatShortcut(keys, shortcutLabels);
    const confirmNode = confirmId ? findNode(nodes, confirmId) : null;

    const menuFor = (line: Line) => {
        const id = line.node.id;
        const where = locate(nodes, id)!;
        const first = where.index === 0;
        const last = where.index === where.siblings.length - 1;
        const run = (next: () => TreeNode[]) => {
            afterMenu.current = () => lineEls.current.get(id)?.focus();
            applyMove(id, next());
        };
        const later = (action: () => void) => {
            afterMenu.current = action;
        };
        return (
            <DropdownMenuContent
                align="start"
                className="w-64"
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    const action = afterMenu.current;
                    afterMenu.current = null;
                    if (action) action();
                    else lineEls.current.get(id)?.focus();
                }}
            >
                <DropdownMenuItem onSelect={() => later(() => startNew(id))}>
                    <FolderPlus aria-hidden="true" />
                    {labels.addChild}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => later(() => setEditing({ kind: 'rename', id }))}>
                    <Pencil aria-hidden="true" />
                    {labels.rename}
                    <DropdownMenuShortcut>{shortcut('F2')}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <FolderInput aria-hidden="true" />
                        {labels.moveTo}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="max-h-80 w-64 overflow-y-auto">
                        <DropdownMenuItem
                            disabled={where.parentId === null}
                            onSelect={() => run(() => moveNode(nodes, id, null, nodes.length))}
                        >
                            {labels.topLevel}
                        </DropdownMenuItem>
                        {allLines.map((dest) => (
                            <DropdownMenuItem
                                key={dest.node.id}
                                disabled={
                                    dest.node.id === where.parentId ||
                                    !canMove(nodes, id, dest.node.id)
                                }
                                style={{ paddingInlineStart: `${8 + dest.level * 12}px` }}
                                onSelect={() =>
                                    run(() =>
                                        moveNode(
                                            nodes,
                                            id,
                                            dest.node.id,
                                            dest.node.children?.length ?? 0,
                                        ),
                                    )
                                }
                            >
                                {dest.node.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                    disabled={first}
                    onSelect={() => run(() => moveSibling(nodes, id, -1))}
                >
                    <ArrowUp aria-hidden="true" />
                    {labels.moveUp}
                    <DropdownMenuShortcut>{shortcut('Alt+↑')}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={last}
                    onSelect={() => run(() => moveSibling(nodes, id, 1))}
                >
                    <ArrowDown aria-hidden="true" />
                    {labels.moveDown}
                    <DropdownMenuShortcut>{shortcut('Alt+↓')}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={where.parentId === null}
                    onSelect={() => run(() => outdentNode(nodes, id))}
                >
                    <IndentDecrease aria-hidden="true" className="rtl:-scale-x-100" />
                    {labels.outdent}
                    <DropdownMenuShortcut>{shortcut('Alt+←')}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                    disabled={first}
                    onSelect={() => run(() => indentNode(nodes, id))}
                >
                    <IndentIncrease aria-hidden="true" className="rtl:-scale-x-100" />
                    {labels.indent}
                    <DropdownMenuShortcut>{shortcut('Alt+→')}</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => later(() => requestDelete(id))}>
                    <Trash2 aria-hidden="true" />
                    {labels.delete}
                    <DropdownMenuShortcut>{shortcut('Delete')}</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        );
    };

    const renderLine = (line: Line) => {
        const id = line.node.id;
        const count = line.draft ? undefined : counts?.[id];
        const renaming = editing?.kind === 'rename' && editing.id === id;
        const target = drag?.target?.lineId === id ? drag.target.zone : null;
        const Icon = line.expanded ? FolderOpen : Folder;
        const indent = 4 + (line.level - 1) * INDENT;
        return (
            // The row is the treeitem; the tree's keys are handled once, on the tree.
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
                key={id}
                ref={(el) => {
                    if (el) lineEls.current.set(id, el);
                    else lineEls.current.delete(id);
                }}
                role="treeitem"
                data-id={line.draft ? undefined : id}
                data-tree-line=""
                data-drop={target ?? undefined}
                aria-level={line.level}
                aria-setsize={line.draft ? undefined : line.setSize}
                aria-posinset={line.draft ? undefined : line.posInSet}
                aria-expanded={line.hasChildren ? line.expanded : undefined}
                aria-selected={line.draft ? undefined : selectedId === id}
                aria-label={
                    count === undefined ? undefined : `${line.node.label}, ${labels.count(count)}`
                }
                tabIndex={!line.draft && tabStop === id ? 0 : -1}
                onFocus={(event) => {
                    if (event.target === event.currentTarget && !line.draft) setFocusedId(id);
                }}
                onClick={() => {
                    if (line.draft || suppressClick.current) return;
                    onSelect(id);
                }}
                onContextMenu={(event: MouseEvent) => {
                    if (!editable || line.draft) return;
                    event.preventDefault();
                    setMenuId(id);
                }}
                onPointerDown={(event) => !line.draft && onPointerDown(event, id)}
                style={{ paddingInlineStart: indent, ['--indent' as string]: `${indent}px` }}
                className={cn(
                    'group/line relative flex h-8 cursor-pointer items-center gap-1.5 rounded-md pe-1 text-sm outline-none select-none',
                    'animate-in duration-150 fade-in-0 slide-in-from-top-1 motion-reduce:animate-none',
                    'hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
                    'aria-selected:bg-muted aria-selected:font-medium',
                    drag?.id === id && 'opacity-50',
                    target === 'inside' && 'ring-2 ring-primary ring-inset',
                    (target === 'before' || target === 'after') &&
                        'before:pointer-events-none before:absolute before:start-(--indent) before:end-1 before:h-0.5 before:rounded-full before:bg-primary',
                    target === 'before' && 'before:-top-px',
                    target === 'after' && 'before:-bottom-px',
                )}
            >
                {/* Mouse shortcut only: → and ← do the same from the keyboard. */}
                <span
                    data-tree-toggle=""
                    aria-hidden="true"
                    onClick={(event) => {
                        event.stopPropagation();
                        if (line.hasChildren) toggle(id);
                    }}
                    className="flex size-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground"
                >
                    {line.hasChildren && (
                        <ChevronRight
                            className={cn(
                                'size-4 transition-transform duration-150 motion-reduce:transition-none',
                                line.expanded ? 'rotate-90' : 'rtl:rotate-180',
                            )}
                        />
                    )}
                </span>
                <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {line.draft || renaming ? (
                    <NameField
                        initial={line.node.label}
                        label={labels.nameInput}
                        onDone={finishEdit}
                    />
                ) : (
                    <span className="min-w-0 flex-1 truncate">{line.node.label}</span>
                )}
                {count !== undefined && !renaming && (
                    <span
                        aria-hidden="true"
                        className={cn(
                            'shrink-0 px-1 text-xs text-muted-foreground tabular-nums',
                            editable && 'group-hover/line:hidden group-focus-visible/line:hidden',
                            menuId === id && 'hidden',
                        )}
                    >
                        {count}
                    </span>
                )}
                {editable && !line.draft && !renaming && (
                    <DropdownMenu
                        open={menuId === id}
                        onOpenChange={(open) => setMenuId(open ? id : null)}
                    >
                        {/* Mouse shortcut only: right-click, Shift+F10 and the menu key open the same menu. */}
                        <DropdownMenuTrigger asChild>
                            <span
                                data-tree-menu=""
                                aria-hidden="true"
                                tabIndex={-1}
                                onClick={(event) => event.stopPropagation()}
                                className={cn(
                                    'hidden size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-background hover:text-foreground',
                                    'group-hover/line:flex group-focus-visible/line:flex data-[state=open]:flex',
                                )}
                            >
                                <EllipsisVertical className="size-4" />
                            </span>
                        </DropdownMenuTrigger>
                        {menuId === id && menuFor(line)}
                    </DropdownMenu>
                )}
            </div>
        );
    };

    return (
        <div className={cn('flex flex-col gap-1', className)}>
            <div className="flex h-8 items-center justify-between gap-2 ps-2">
                <h2 id={headingId} className="text-xs font-medium text-muted-foreground">
                    {labels.heading}
                </h2>
                {editable && (
                    <IconButton
                        label={labels.add}
                        icon={<Plus className="size-4" aria-hidden="true" />}
                        onClick={() => startNew(null)}
                        className="size-7"
                    />
                )}
            </div>
            {lines.length === 0 ? (
                <p className="px-2 py-1 text-sm text-muted-foreground">{labels.empty}</p>
            ) : (
                // Focus roves over the treeitems (APG tree pattern); the tree itself is not a tab stop.
                // eslint-disable-next-line jsx-a11y/interactive-supports-focus
                <div
                    ref={treeRef}
                    role="tree"
                    aria-labelledby={headingId}
                    onKeyDown={onKeyDown}
                    className="flex flex-col"
                >
                    {lines.map((line) => renderLine(line))}
                </div>
            )}
            {drag && (
                <div
                    data-tree-end=""
                    aria-hidden="true"
                    className={cn(
                        'mt-1 flex h-8 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground',
                        drag.target?.zone === 'end' && 'border-primary text-foreground',
                    )}
                >
                    {labels.topLevel}
                </div>
            )}
            <div aria-live="polite" className="sr-only">
                {announcement}
            </div>
            {editable && confirmNode && (
                <AlertDialog open onOpenChange={(open) => !open && setConfirmId(null)}>
                    <AlertDialogContent
                        onCloseAutoFocus={(event) => {
                            event.preventDefault();
                            const id = afterConfirm.current ?? confirmNode.id;
                            afterConfirm.current = null;
                            lineEls.current.get(id)?.focus();
                        }}
                    >
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                {labels.confirmDeleteTitle(confirmNode.label)}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                {labels.confirmDelete(
                                    confirmNode.label,
                                    descendantIds(nodes, confirmNode.id).length - 1,
                                    counts?.[confirmNode.id] ?? 0,
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    afterConfirm.current = remove(confirmNode.id) ?? null;
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {labels.deleteConfirm}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    );
}
