/*
 * Pure helpers for a nested tree of `{ id, label, children }` nodes — the
 * data behind `CategoryTree`. Every change returns a new tree and leaves the
 * one it was given untouched, so a tree can live in React state as it is.
 */

/** One node of a tree. `children` absent or empty means a leaf. */
export interface TreeNode {
    /** Stable and unique across the whole tree. */
    id: string;
    /** The visible name, already translated. */
    label: string;
    /** Nodes under this one, in order. */
    children?: TreeNode[];
}

/** A visible line of a flattened tree, with what ARIA's tree pattern needs. */
export interface TreeLine {
    node: TreeNode;
    /** 1 for the top level. */
    level: number;
    parentId: string | null;
    /** 1-based position among its siblings. */
    posInSet: number;
    setSize: number;
    hasChildren: boolean;
    expanded: boolean;
}

/** Where a node sits: its parent (null for the top level), its index and its siblings. */
export interface TreeLocation {
    parentId: string | null;
    index: number;
    siblings: TreeNode[];
}

const hasKids = (node: TreeNode) => (node.children?.length ?? 0) > 0;

export function findNode(nodes: TreeNode[], id: string): TreeNode | null {
    for (const node of nodes) {
        if (node.id === id) return node;
        const found = node.children ? findNode(node.children, id) : null;
        if (found) return found;
    }
    return null;
}

export function locate(
    nodes: TreeNode[],
    id: string,
    parentId: string | null = null,
): TreeLocation | null {
    const index = nodes.findIndex((n) => n.id === id);
    if (index >= 0) return { parentId, index, siblings: nodes };
    for (const node of nodes) {
        const found = node.children ? locate(node.children, id, node.id) : null;
        if (found) return found;
    }
    return null;
}

/** The nodes from the top level down to `id`, inclusive; empty when absent. */
export function pathTo(nodes: TreeNode[], id: string): TreeNode[] {
    for (const node of nodes) {
        if (node.id === id) return [node];
        const below = node.children ? pathTo(node.children, id) : [];
        if (below.length) return [node, ...below];
    }
    return [];
}

/** `id` and every id under it, depth first; empty when absent. */
export function descendantIds(nodes: TreeNode[], id: string): string[] {
    const node = findNode(nodes, id);
    if (!node) return [];
    const out: string[] = [];
    const walk = (n: TreeNode) => {
        out.push(n.id);
        n.children?.forEach(walk);
    };
    walk(node);
    return out;
}

/** The lines a person can see: top level, plus the children of every expanded, visible parent. */
export function flattenVisible(
    nodes: TreeNode[],
    expanded: ReadonlySet<string>,
    level = 1,
    parentId: string | null = null,
): TreeLine[] {
    return nodes.flatMap((node, i) => {
        const open = hasKids(node) && expanded.has(node.id);
        const line: TreeLine = {
            node,
            level,
            parentId,
            posInSet: i + 1,
            setSize: nodes.length,
            hasChildren: hasKids(node),
            expanded: open,
        };
        return open
            ? [line, ...flattenVisible(node.children!, expanded, level + 1, node.id)]
            : [line];
    });
}

/** Rebuilds the list that holds `parentId`'s children (the top level for null). */
function updateChildren(
    nodes: TreeNode[],
    parentId: string | null,
    update: (children: TreeNode[]) => TreeNode[],
): TreeNode[] {
    if (parentId === null) return update(nodes);
    return nodes.map((node) => {
        if (node.id === parentId) return { ...node, children: update(node.children ?? []) };
        return node.children
            ? { ...node, children: updateChildren(node.children, parentId, update) }
            : node;
    });
}

const clamp = (n: number, max: number) => Math.min(Math.max(n, 0), max);

/** Adds `node` under `parentId` (null: top level) at `index`, default the end. */
export function insertNode(
    nodes: TreeNode[],
    parentId: string | null,
    node: TreeNode,
    index?: number,
): TreeNode[] {
    if (parentId !== null && !findNode(nodes, parentId)) return nodes;
    return updateChildren(nodes, parentId, (children) => {
        const at = clamp(index ?? children.length, children.length);
        return [...children.slice(0, at), node, ...children.slice(at)];
    });
}

/** Removes `id` and everything under it. */
export function removeNode(nodes: TreeNode[], id: string): TreeNode[] {
    const where = locate(nodes, id);
    if (!where) return nodes;
    return updateChildren(nodes, where.parentId, (children) => children.filter((n) => n.id !== id));
}

export function renameNode(nodes: TreeNode[], id: string, label: string): TreeNode[] {
    return nodes.map((node) => {
        if (node.id === id) return { ...node, label };
        return node.children ? { ...node, children: renameNode(node.children, id, label) } : node;
    });
}

/** False when `id` is missing, `parentId` is missing, or `parentId` is `id` itself or under it. */
export function canMove(nodes: TreeNode[], id: string, parentId: string | null): boolean {
    if (!findNode(nodes, id)) return false;
    if (parentId === null) return true;
    if (!findNode(nodes, parentId)) return false;
    return !descendantIds(nodes, id).includes(parentId);
}

/**
 * Moves `id`, with everything under it, to `parentId` at `index`. The index
 * counts the destination's children as they are BEFORE the move — the slot a
 * drop indicator points at — so "before the third sibling" is always 2.
 */
export function moveNode(
    nodes: TreeNode[],
    id: string,
    parentId: string | null,
    index: number,
): TreeNode[] {
    if (!canMove(nodes, id, parentId)) return nodes;
    const from = locate(nodes, id)!;
    const node = from.siblings[from.index]!;
    const at = from.parentId === parentId && from.index < index ? index - 1 : index;
    if (from.parentId === parentId && at === from.index) return nodes;
    return insertNode(removeNode(nodes, id), parentId, node, at);
}

/** One step up (-1) or down (+1) among its siblings; nothing at either end. */
export function moveSibling(nodes: TreeNode[], id: string, delta: -1 | 1): TreeNode[] {
    const where = locate(nodes, id);
    if (!where) return nodes;
    const target = where.index + delta;
    if (target < 0 || target >= where.siblings.length) return nodes;
    return moveNode(nodes, id, where.parentId, delta === 1 ? where.index + 2 : target);
}

/** Into the sibling just above, as its last child; nothing for the first sibling. */
export function indentNode(nodes: TreeNode[], id: string): TreeNode[] {
    const where = locate(nodes, id);
    if (!where || where.index === 0) return nodes;
    const above = where.siblings[where.index - 1]!;
    return moveNode(nodes, id, above.id, above.children?.length ?? 0);
}

/** Out of its parent, to just after it; nothing at the top level. */
export function outdentNode(nodes: TreeNode[], id: string): TreeNode[] {
    const where = locate(nodes, id);
    if (!where || where.parentId === null) return nodes;
    const parent = locate(nodes, where.parentId)!;
    return moveNode(nodes, id, parent.parentId, parent.index + 1);
}

/**
 * The one thing that changed between two trees, in terms a server can apply:
 * a node added, renamed, moved or removed. A move's `index` uses the same
 * before-the-move counting as `moveNode`, so `moveNode(prev, id, parentId,
 * index)` gives `next` back. A removal names only the top-most removed node;
 * everything under it went with it.
 */
export type TreeChange =
    | { type: 'add'; id: string; label: string; parentId: string | null; index: number }
    | { type: 'rename'; id: string; label: string }
    | { type: 'move'; id: string; parentId: string | null; index: number }
    | { type: 'remove'; id: string };

function allIds(nodes: TreeNode[]): string[] {
    return nodes.flatMap((n) => [n.id, ...(n.children ? allIds(n.children) : [])]);
}

/**
 * What one edit did to a tree — for saving each add, rename, move or delete
 * as it happens. Null when nothing changed. When more than one thing changed
 * it reports the first it finds (removals, then additions, renames, moves);
 * a `CategoryTree` edit is always exactly one.
 *
 * Swapping two neighbours reads as either one moving down or the other
 * moving up. Pass `moved`, the node the reader actually moved, and the
 * change names that one, so "Koran moved" is not reported as "Arabisch moved".
 */
export function diffTree(prev: TreeNode[], next: TreeNode[], moved?: string): TreeChange | null {
    if (prev === next) return null;
    const before = new Set(allIds(prev));
    const after = new Set(allIds(next));

    const removed = [...before].filter((id) => !after.has(id));
    const top = removed.find((id) => {
        const parent = locate(prev, id)!.parentId;
        return parent === null || after.has(parent);
    });
    if (top !== undefined) return { type: 'remove', id: top };

    for (const id of after) {
        if (before.has(id)) continue;
        const where = locate(next, id)!;
        const node = where.siblings[where.index]!;
        return { type: 'add', id, label: node.label, parentId: where.parentId, index: where.index };
    }

    for (const id of after) {
        const was = findNode(prev, id)!;
        const now = findNode(next, id)!;
        if (was.label !== now.label) return { type: 'rename', id, label: now.label };
    }

    const candidates = moved !== undefined && after.has(moved) ? [moved, ...after] : after;
    for (const id of candidates) {
        const was = locate(prev, id)!;
        const now = locate(next, id)!;
        if (was.parentId === now.parentId && was.index === now.index) continue;
        // A sibling that only shifted because another node moved is not the mover:
        // the mover is the node whose own move reproduces the new order.
        const index =
            was.parentId === now.parentId && was.index < now.index ? now.index + 1 : now.index;
        if (JSON.stringify(moveNode(prev, id, now.parentId, index)) === JSON.stringify(next))
            return { type: 'move', id, parentId: now.parentId, index };
    }
    return null;
}
