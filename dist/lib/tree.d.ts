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
export declare function findNode(nodes: TreeNode[], id: string): TreeNode | null;
export declare function locate(nodes: TreeNode[], id: string, parentId?: string | null): TreeLocation | null;
/** The nodes from the top level down to `id`, inclusive; empty when absent. */
export declare function pathTo(nodes: TreeNode[], id: string): TreeNode[];
/** `id` and every id under it, depth first; empty when absent. */
export declare function descendantIds(nodes: TreeNode[], id: string): string[];
/** The lines a person can see: top level, plus the children of every expanded, visible parent. */
export declare function flattenVisible(nodes: TreeNode[], expanded: ReadonlySet<string>, level?: number, parentId?: string | null): TreeLine[];
/** Adds `node` under `parentId` (null: top level) at `index`, default the end. */
export declare function insertNode(nodes: TreeNode[], parentId: string | null, node: TreeNode, index?: number): TreeNode[];
/** Removes `id` and everything under it. */
export declare function removeNode(nodes: TreeNode[], id: string): TreeNode[];
export declare function renameNode(nodes: TreeNode[], id: string, label: string): TreeNode[];
/** False when `id` is missing, `parentId` is missing, or `parentId` is `id` itself or under it. */
export declare function canMove(nodes: TreeNode[], id: string, parentId: string | null): boolean;
/**
 * Moves `id`, with everything under it, to `parentId` at `index`. The index
 * counts the destination's children as they are BEFORE the move — the slot a
 * drop indicator points at — so "before the third sibling" is always 2.
 */
export declare function moveNode(nodes: TreeNode[], id: string, parentId: string | null, index: number): TreeNode[];
/** One step up (-1) or down (+1) among its siblings; nothing at either end. */
export declare function moveSibling(nodes: TreeNode[], id: string, delta: -1 | 1): TreeNode[];
/** Into the sibling just above, as its last child; nothing for the first sibling. */
export declare function indentNode(nodes: TreeNode[], id: string): TreeNode[];
/** Out of its parent, to just after it; nothing at the top level. */
export declare function outdentNode(nodes: TreeNode[], id: string): TreeNode[];
/**
 * The one thing that changed between two trees, in terms a server can apply:
 * a node added, renamed, moved or removed. A move's `index` uses the same
 * before-the-move counting as `moveNode`, so `moveNode(prev, id, parentId,
 * index)` gives `next` back. A removal names only the top-most removed node;
 * everything under it went with it.
 */
export type TreeChange = {
    type: 'add';
    id: string;
    label: string;
    parentId: string | null;
    index: number;
} | {
    type: 'rename';
    id: string;
    label: string;
} | {
    type: 'move';
    id: string;
    parentId: string | null;
    index: number;
} | {
    type: 'remove';
    id: string;
};
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
export declare function diffTree(prev: TreeNode[], next: TreeNode[], moved?: string): TreeChange | null;
