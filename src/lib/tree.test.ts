import { describe, expect, it } from 'vitest';

import {
    allIds,
    canMove,
    depthOf,
    descendantIds,
    diffTree,
    findNode,
    flattenVisible,
    inFolderScope,
    indentNode,
    insertNode,
    locate,
    moveNode,
    moveSibling,
    outdentNode,
    pathTo,
    removeNode,
    renameNode,
    subtreeCounts,
    subtreeHeight,
    type TreeNode,
} from './tree';

/*
 *  arabisch
 *    grund
 *    aufbau
 *  koran
 *    tajwid
 *      regeln
 *  kunst
 */
const TREE: TreeNode[] = [
    {
        id: 'arabisch',
        label: 'Arabisch',
        children: [
            { id: 'grund', label: 'Grundstufe' },
            { id: 'aufbau', label: 'Aufbaustufe' },
        ],
    },
    {
        id: 'koran',
        label: 'Koran',
        children: [
            { id: 'tajwid', label: 'Tajwid', children: [{ id: 'regeln', label: 'Regeln' }] },
        ],
    },
    { id: 'kunst', label: 'Kunst' },
];

/** The tree as `id(child,child)` — compact enough to compare whole shapes. */
function shape(nodes: TreeNode[]): string {
    return nodes
        .map((n) => (n.children?.length ? `${n.id}(${shape(n.children)})` : n.id))
        .join(',');
}

describe('reading a tree', () => {
    it('finds a node at any depth, or null', () => {
        expect(findNode(TREE, 'regeln')?.label).toBe('Regeln');
        expect(findNode(TREE, 'kunst')?.label).toBe('Kunst');
        expect(findNode(TREE, 'nope')).toBeNull();
    });

    it('locates a node: its parent, its index and its siblings', () => {
        expect(locate(TREE, 'aufbau')).toMatchObject({ parentId: 'arabisch', index: 1 });
        expect(locate(TREE, 'aufbau')?.siblings.map((n) => n.id)).toEqual(['grund', 'aufbau']);
        expect(locate(TREE, 'kunst')).toMatchObject({ parentId: null, index: 2 });
        expect(locate(TREE, 'nope')).toBeNull();
    });

    it('gives the path from the root down to a node', () => {
        expect(pathTo(TREE, 'regeln').map((n) => n.label)).toEqual(['Koran', 'Tajwid', 'Regeln']);
        expect(pathTo(TREE, 'kunst').map((n) => n.id)).toEqual(['kunst']);
        expect(pathTo(TREE, 'nope')).toEqual([]);
    });

    it('lists a node and everything under it', () => {
        expect(descendantIds(TREE, 'koran')).toEqual(['koran', 'tajwid', 'regeln']);
        expect(descendantIds(TREE, 'kunst')).toEqual(['kunst']);
        expect(descendantIds(TREE, 'nope')).toEqual([]);
    });
});

describe('flattenVisible', () => {
    it('lists only the top level while nothing is expanded', () => {
        const lines = flattenVisible(TREE, new Set());
        expect(lines.map((l) => l.node.id)).toEqual(['arabisch', 'koran', 'kunst']);
        expect(lines[0]).toMatchObject({
            level: 1,
            parentId: null,
            posInSet: 1,
            setSize: 3,
            hasChildren: true,
            expanded: false,
        });
        expect(lines[2]).toMatchObject({ hasChildren: false, expanded: false, posInSet: 3 });
    });

    it('opens expanded nodes in order, with level, position and set size', () => {
        const lines = flattenVisible(TREE, new Set(['koran', 'tajwid']));
        expect(lines.map((l) => `${l.node.id}@${l.level}`)).toEqual([
            'arabisch@1',
            'koran@1',
            'tajwid@2',
            'regeln@3',
            'kunst@1',
        ]);
        expect(lines[2]).toMatchObject({ parentId: 'koran', posInSet: 1, setSize: 1 });
        expect(lines[3]).toMatchObject({ parentId: 'tajwid', level: 3 });
    });

    it('hides the children of a collapsed parent even when they are marked expanded', () => {
        const lines = flattenVisible(TREE, new Set(['tajwid']));
        expect(lines.map((l) => l.node.id)).not.toContain('regeln');
    });

    it('treats an empty children array as a leaf', () => {
        const lines = flattenVisible([{ id: 'a', label: 'A', children: [] }], new Set(['a']));
        expect(lines[0]).toMatchObject({ hasChildren: false, expanded: false });
    });
});

describe('changing a tree', () => {
    it('never mutates the tree it was given', () => {
        const before = JSON.stringify(TREE);
        insertNode(TREE, 'koran', { id: 'x', label: 'X' });
        removeNode(TREE, 'tajwid');
        renameNode(TREE, 'grund', 'Anfänger');
        moveNode(TREE, 'kunst', 'arabisch', 0);
        expect(JSON.stringify(TREE)).toBe(before);
    });

    it('inserts at the root or under a parent, at the end by default', () => {
        expect(shape(insertNode(TREE, null, { id: 'x', label: 'X' }))).toBe(
            'arabisch(grund,aufbau),koran(tajwid(regeln)),kunst,x',
        );
        expect(shape(insertNode(TREE, 'kunst', { id: 'x', label: 'X' }))).toBe(
            'arabisch(grund,aufbau),koran(tajwid(regeln)),kunst(x)',
        );
        expect(shape(insertNode(TREE, 'arabisch', { id: 'x', label: 'X' }, 1))).toBe(
            'arabisch(grund,x,aufbau),koran(tajwid(regeln)),kunst',
        );
    });

    it('clamps an insert index to the list', () => {
        expect(shape(insertNode(TREE, 'arabisch', { id: 'x', label: 'X' }, 99))).toBe(
            'arabisch(grund,aufbau,x),koran(tajwid(regeln)),kunst',
        );
        expect(shape(insertNode(TREE, 'arabisch', { id: 'x', label: 'X' }, -3))).toBe(
            'arabisch(x,grund,aufbau),koran(tajwid(regeln)),kunst',
        );
    });

    it('does nothing when inserting under a parent that does not exist', () => {
        expect(shape(insertNode(TREE, 'nope', { id: 'x', label: 'X' }))).toBe(shape(TREE));
    });

    it('removes a node with everything under it', () => {
        expect(shape(removeNode(TREE, 'tajwid'))).toBe('arabisch(grund,aufbau),koran,kunst');
        expect(shape(removeNode(TREE, 'arabisch'))).toBe('koran(tajwid(regeln)),kunst');
        expect(shape(removeNode(TREE, 'nope'))).toBe(shape(TREE));
    });

    it('renames only the node asked for', () => {
        const next = renameNode(TREE, 'regeln', 'Makharij');
        expect(findNode(next, 'regeln')?.label).toBe('Makharij');
        expect(findNode(next, 'tajwid')?.label).toBe('Tajwid');
    });
});

describe('moveNode', () => {
    it('moves a node, with its children, under another parent', () => {
        expect(shape(moveNode(TREE, 'tajwid', 'arabisch', 0))).toBe(
            'arabisch(tajwid(regeln),grund,aufbau),koran,kunst',
        );
    });

    it('moves to the root', () => {
        expect(shape(moveNode(TREE, 'grund', null, 0))).toBe(
            'grund,arabisch(aufbau),koran(tajwid(regeln)),kunst',
        );
    });

    it('reads the index as a position among the destination siblings as they are now', () => {
        // Down within the same list: "before kunst" is index 2 before the move.
        expect(shape(moveNode(TREE, 'arabisch', null, 2))).toBe(
            'koran(tajwid(regeln)),arabisch(grund,aufbau),kunst',
        );
        expect(shape(moveNode(TREE, 'arabisch', null, 3))).toBe(
            'koran(tajwid(regeln)),kunst,arabisch(grund,aufbau)',
        );
        // Up within the same list.
        expect(shape(moveNode(TREE, 'kunst', null, 0))).toBe(
            'kunst,arabisch(grund,aufbau),koran(tajwid(regeln))',
        );
    });

    it('leaves the tree as it is for a move onto the same place', () => {
        expect(shape(moveNode(TREE, 'koran', null, 1))).toBe(shape(TREE));
        expect(shape(moveNode(TREE, 'koran', null, 2))).toBe(shape(TREE));
    });

    it('refuses to move a node into itself or anything under it', () => {
        expect(canMove(TREE, 'koran', 'koran')).toBe(false);
        expect(canMove(TREE, 'koran', 'regeln')).toBe(false);
        expect(canMove(TREE, 'koran', 'arabisch')).toBe(true);
        expect(canMove(TREE, 'regeln', null)).toBe(true);
        expect(canMove(TREE, 'nope', null)).toBe(false);
        expect(canMove(TREE, 'kunst', 'nope')).toBe(false);
        expect(shape(moveNode(TREE, 'koran', 'regeln', 0))).toBe(shape(TREE));
        expect(shape(moveNode(TREE, 'koran', 'koran', 0))).toBe(shape(TREE));
    });
});

describe('keyboard moves', () => {
    it('moves up and down among siblings, stopping at the ends', () => {
        expect(shape(moveSibling(TREE, 'aufbau', -1))).toBe(
            'arabisch(aufbau,grund),koran(tajwid(regeln)),kunst',
        );
        expect(shape(moveSibling(TREE, 'arabisch', 1))).toBe(
            'koran(tajwid(regeln)),arabisch(grund,aufbau),kunst',
        );
        expect(shape(moveSibling(TREE, 'grund', -1))).toBe(shape(TREE));
        expect(shape(moveSibling(TREE, 'kunst', 1))).toBe(shape(TREE));
    });

    it('indents into the sibling above, as its last child', () => {
        expect(shape(indentNode(TREE, 'koran'))).toBe(
            'arabisch(grund,aufbau,koran(tajwid(regeln))),kunst',
        );
        expect(shape(indentNode(TREE, 'kunst'))).toBe(
            'arabisch(grund,aufbau),koran(tajwid(regeln),kunst)',
        );
    });

    it('cannot indent the first of its siblings', () => {
        expect(shape(indentNode(TREE, 'arabisch'))).toBe(shape(TREE));
        expect(shape(indentNode(TREE, 'grund'))).toBe(shape(TREE));
    });

    it('outdents to just after its parent', () => {
        expect(shape(outdentNode(TREE, 'grund'))).toBe(
            'arabisch(aufbau),grund,koran(tajwid(regeln)),kunst',
        );
        expect(shape(outdentNode(TREE, 'regeln'))).toBe(
            'arabisch(grund,aufbau),koran(tajwid,regeln),kunst',
        );
    });

    it('cannot outdent a top-level node', () => {
        expect(shape(outdentNode(TREE, 'kunst'))).toBe(shape(TREE));
    });
});

describe('diffTree', () => {
    it('reports nothing for the same tree, or an equal copy', () => {
        expect(diffTree(TREE, TREE)).toBeNull();
        expect(diffTree(TREE, structuredClone(TREE))).toBeNull();
    });

    it('reports an addition with its parent and position', () => {
        const next = insertNode(TREE, 'arabisch', { id: 'neu', label: 'Neu' }, 1);
        expect(diffTree(TREE, next)).toEqual({
            type: 'add',
            id: 'neu',
            label: 'Neu',
            parentId: 'arabisch',
            index: 1,
        });
        expect(diffTree(TREE, insertNode(TREE, null, { id: 'x', label: 'X' }))).toMatchObject({
            parentId: null,
            index: 3,
        });
    });

    it('reports a rename', () => {
        expect(diffTree(TREE, renameNode(TREE, 'regeln', 'Die Regeln'))).toEqual({
            type: 'rename',
            id: 'regeln',
            label: 'Die Regeln',
        });
    });

    it('reports only the top-most node of a removed branch', () => {
        expect(diffTree(TREE, removeNode(TREE, 'koran'))).toEqual({ type: 'remove', id: 'koran' });
        expect(diffTree(TREE, removeNode(TREE, 'regeln'))).toEqual({
            type: 'remove',
            id: 'regeln',
        });
    });

    // Every move, replayed with moveNode, must give the same tree back — that is the contract.
    const moves: [string, string, string | null, number][] = [
        ['down within a parent', 'arabisch', null, 3],
        ['up within a parent', 'kunst', null, 0],
        ['into another parent', 'kunst', 'arabisch', 1],
        ['to the end of another parent', 'grund', 'koran', 1],
        ['to the top level', 'regeln', null, 1],
        ['a branch, with everything under it', 'tajwid', 'arabisch', 0],
        ['one step down (adjacent swap)', 'grund', 'arabisch', 2],
    ];
    it.each(moves)('reports a move %s that replays to the same tree', (_, id, parentId, index) => {
        const next = moveNode(TREE, id, parentId, index);
        const change = diffTree(TREE, next);
        expect(change?.type).toBe('move');
        if (change?.type !== 'move') return;
        expect(shape(moveNode(TREE, change.id, change.parentId, change.index))).toBe(shape(next));
    });

    it('names the moved node itself when siblings only shifted around it', () => {
        expect(diffTree(TREE, moveNode(TREE, 'arabisch', null, 3))).toEqual({
            type: 'move',
            id: 'arabisch',
            parentId: null,
            index: 3,
        });
        expect(diffTree(TREE, moveNode(TREE, 'kunst', 'koran', 0))).toEqual({
            type: 'move',
            id: 'kunst',
            parentId: 'koran',
            index: 0,
        });
    });
});

describe('diffTree — a swap of neighbours', () => {
    it('names the node the reader moved when a swap could be read either way', () => {
        const next = moveNode(TREE, 'arabisch', null, 2); // arabisch one down: koran,arabisch,kunst
        expect(diffTree(TREE, next)).toMatchObject({ type: 'move', id: 'koran' });
        expect(diffTree(TREE, next, 'arabisch')).toEqual({
            type: 'move',
            id: 'arabisch',
            parentId: null,
            index: 2,
        });
    });

    it('ignores a hint that does not explain the change', () => {
        const next = moveNode(TREE, 'kunst', 'arabisch', 0);
        expect(diffTree(TREE, next, 'koran')).toMatchObject({ type: 'move', id: 'kunst' });
    });
});

describe('depth limits', () => {
    it('measures depth and subtree height', () => {
        expect(depthOf(TREE, 'kunst')).toBe(1);
        expect(depthOf(TREE, 'regeln')).toBe(3);
        expect(depthOf(TREE, 'nope')).toBe(0);
        expect(subtreeHeight(findNode(TREE, 'kunst')!)).toBe(1);
        expect(subtreeHeight(findNode(TREE, 'koran')!)).toBe(3);
    });

    it('canMove refuses a move that would exceed maxDepth, counting the moved subtree', () => {
        // koran spans 3 levels: under arabisch it would reach level 4.
        expect(canMove(TREE, 'koran', 'arabisch', 3)).toBe(false);
        expect(canMove(TREE, 'koran', 'arabisch', 4)).toBe(true);
        expect(canMove(TREE, 'kunst', 'tajwid', 2)).toBe(false);
        expect(canMove(TREE, 'kunst', 'tajwid', 3)).toBe(true);
        expect(canMove(TREE, 'kunst', 'koran', 3)).toBe(true);
        expect(canMove(TREE, 'regeln', null, 1)).toBe(true);
        expect(canMove(TREE, 'kunst', 'arabisch', 1)).toBe(false);
        expect(canMove(TREE, 'kunst', 'arabisch')).toBe(true);
    });

    it('moveNode and indentNode return the same tree when maxDepth forbids it', () => {
        expect(moveNode(TREE, 'kunst', 'arabisch', 0, 1)).toBe(TREE);
        expect(indentNode(TREE, 'kunst', 1)).toBe(TREE);
        expect(shape(indentNode(TREE, 'kunst', 2))).toBe(
            'arabisch(grund,aufbau),koran(tajwid(regeln),kunst)',
        );
        expect(indentNode(TREE, 'koran', 3)).toBe(TREE);
    });
});

describe('folder helpers', () => {
    it('lists every id in the tree', () => {
        expect(allIds(TREE)).toEqual(
            new Set(['arabisch', 'grund', 'aufbau', 'koran', 'tajwid', 'regeln', 'kunst']),
        );
        expect(allIds([])).toEqual(new Set());
    });

    it('counts items under a node, including everything below it', () => {
        const counts = subtreeCounts(TREE, [
            'grund',
            'grund',
            'aufbau',
            'regeln',
            'tajwid',
            'kunst',
            'arabisch',
            null,
            'gibt-es-nicht',
        ]);
        expect(counts).toEqual({
            arabisch: 4,
            grund: 2,
            aufbau: 1,
            koran: 2,
            tajwid: 2,
            regeln: 1,
            kunst: 1,
        });
    });

    it('counts zero for nodes without items and for an empty list', () => {
        expect(subtreeCounts(TREE, []).arabisch).toBe(0);
        expect(subtreeCounts([], ['x', null])).toEqual({});
    });

    it('a folder with two subfolders of three items each holds six', () => {
        const nodes: TreeNode[] = [
            {
                id: 'p',
                label: 'P',
                children: [
                    { id: 'x', label: 'X' },
                    { id: 'y', label: 'Y' },
                ],
            },
        ];
        expect(subtreeCounts(nodes, ['x', 'x', 'x', 'y', 'y', 'y']).p).toBe(6);
    });

    it('scopes: all takes everything', () => {
        for (const id of [null, 'kunst', 'ghost'])
            expect(inFolderScope(TREE, { kind: 'all' }, id)).toBe(true);
    });

    it('scopes: none takes items without a folder or in a folder that is gone', () => {
        const none = { kind: 'none' } as const;
        expect(inFolderScope(TREE, none, null)).toBe(true);
        expect(inFolderScope(TREE, none, 'ghost')).toBe(true);
        expect(inFolderScope(TREE, none, 'kunst')).toBe(false);
    });

    it('scopes: a folder takes itself and its descendants only', () => {
        const koran = { kind: 'folder', id: 'koran' } as const;
        expect(inFolderScope(TREE, koran, 'koran')).toBe(true);
        expect(inFolderScope(TREE, koran, 'regeln')).toBe(true);
        expect(inFolderScope(TREE, koran, 'kunst')).toBe(false);
        expect(inFolderScope(TREE, koran, null)).toBe(false);
        expect(inFolderScope(TREE, { kind: 'folder', id: 'ghost' }, 'ghost')).toBe(false);
        expect(inFolderScope(TREE, { kind: 'folder', id: 'regeln' }, 'koran')).toBe(false);
    });
});
