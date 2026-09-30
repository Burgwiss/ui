import { describe, expect, it } from 'vitest';

import {
    columnValue,
    filterRows,
    flattenLines,
    groupRows,
    layoutColumns,
    moveColumn,
    normaliseOrder,
    sortRows,
    toCsv,
    toTsv,
} from './engine';
import type { GridColumn } from './types';

type Course = {
    id: number;
    title: string;
    category: string | null;
    level: string;
    price: number | null;
    starts: string | null;
    enrolled: number;
};

const COURSES: Course[] = [
    {
        id: 1,
        title: 'Arabisch für Anfänger',
        category: 'Sprachen',
        level: 'A1',
        price: 120,
        starts: '2026-10-01',
        enrolled: 18,
    },
    {
        id: 2,
        title: 'Tajweed Grundlagen',
        category: 'Religion',
        level: 'A1',
        price: 90,
        starts: '2026-09-15',
        enrolled: 7,
    },
    {
        id: 3,
        title: 'Kalligrafie-Werkstatt',
        category: 'Kunst',
        level: 'B1',
        price: null,
        starts: null,
        enrolled: 0,
    },
    {
        id: 4,
        title: 'Äsop auf Arabisch',
        category: 'Sprachen',
        level: 'B1',
        price: 150,
        starts: '2026-11-03',
        enrolled: 7,
    },
    {
        id: 5,
        title: 'Lektion 10',
        category: null,
        level: 'A2',
        price: 60,
        starts: '2026-10-01',
        enrolled: 3,
    },
    {
        id: 6,
        title: 'Lektion 2',
        category: 'Sprachen',
        level: 'A2',
        price: 60,
        starts: '2026-09-01',
        enrolled: 12,
    },
];

const COLUMNS: GridColumn<Course>[] = [
    { id: 'title', header: 'Kurs', hideable: false },
    {
        id: 'category',
        header: 'Kategorie',
        groupable: true,
        filter: { type: 'choice', options: [] },
    },
    { id: 'level', header: 'Niveau', groupable: true },
    { id: 'price', header: 'Preis', aggregate: 'sum', filter: { type: 'number' } },
    { id: 'starts', header: 'Beginn', filter: { type: 'date' } },
    { id: 'enrolled', header: 'Angemeldet', aggregate: 'sum' },
];

const ids = (rows: Course[]) => rows.map((r) => r.id);

describe('columnValue', () => {
    it('reads row[id] by default', () => {
        expect(columnValue(COLUMNS[0]!, COURSES[0]!)).toBe('Arabisch für Anfänger');
    });

    it('uses the column accessor when given', () => {
        const col: GridColumn<Course> = { id: 'x', header: 'X', value: (r) => r.enrolled * 2 };
        expect(columnValue(col, COURSES[0]!)).toBe(36);
    });
});

describe('sortRows', () => {
    it('sorts ascending and descending', () => {
        expect(ids(sortRows(COURSES, [{ id: 'enrolled', desc: false }], COLUMNS))).toEqual([
            3, 5, 2, 4, 6, 1,
        ]);
        expect(ids(sortRows(COURSES, [{ id: 'enrolled', desc: true }], COLUMNS))).toEqual([
            1, 6, 2, 4, 5, 3,
        ]);
    });

    it('keeps equal rows in their original order (stable)', () => {
        const sorted = sortRows(COURSES, [{ id: 'level', desc: false }], COLUMNS);
        expect(ids(sorted)).toEqual([1, 2, 5, 6, 3, 4]);
    });

    it('breaks ties with the next sort key', () => {
        const sorted = sortRows(
            COURSES,
            [
                { id: 'enrolled', desc: true },
                { id: 'title', desc: false },
            ],
            COLUMNS,
        );
        // 2 and 4 both have 7 enrolled: "Äsop …" sorts before "Tajweed …"
        expect(ids(sorted)).toEqual([1, 6, 4, 2, 5, 3]);
    });

    it('sorts text the way people read it: numbers numerically, umlauts with their letter', () => {
        const sorted = sortRows(COURSES, [{ id: 'title', desc: false }], COLUMNS);
        expect(sorted.map((r) => r.title)).toEqual([
            'Arabisch für Anfänger',
            'Äsop auf Arabisch',
            'Kalligrafie-Werkstatt',
            'Lektion 2',
            'Lektion 10',
            'Tajweed Grundlagen',
        ]);
    });

    it('puts empty values last in both directions', () => {
        expect(ids(sortRows(COURSES, [{ id: 'price', desc: false }], COLUMNS)).at(-1)).toBe(3);
        expect(ids(sortRows(COURSES, [{ id: 'price', desc: true }], COLUMNS)).at(-1)).toBe(3);
        expect(ids(sortRows(COURSES, [{ id: 'starts', desc: true }], COLUMNS)).at(-1)).toBe(3);
    });

    it('sorts ISO dates chronologically', () => {
        const sorted = sortRows(COURSES, [{ id: 'starts', desc: false }], COLUMNS);
        expect(sorted.map((r) => r.starts)).toEqual([
            '2026-09-01',
            '2026-09-15',
            '2026-10-01',
            '2026-10-01',
            '2026-11-03',
            null,
        ]);
    });

    it('uses a column comparator when given', () => {
        const order = ['B1', 'A2', 'A1'];
        const cols: GridColumn<Course>[] = [
            {
                id: 'level',
                header: 'Niveau',
                compare: (a, b) => order.indexOf(String(a)) - order.indexOf(String(b)),
            },
        ];
        expect(sortRows(COURSES, [{ id: 'level', desc: false }], cols).map((r) => r.level)).toEqual(
            ['B1', 'B1', 'A2', 'A2', 'A1', 'A1'],
        );
    });

    it('ignores unknown columns and never mutates its input', () => {
        const copy = [...COURSES];
        expect(sortRows(COURSES, [{ id: 'nope', desc: false }], COLUMNS)).toEqual(COURSES);
        sortRows(COURSES, [{ id: 'title', desc: true }], COLUMNS);
        expect(COURSES).toEqual(copy);
    });
});

describe('filterRows', () => {
    it('filters text by contains, case-insensitively', () => {
        const rows = filterRows(
            COURSES,
            [{ id: 'title', type: 'text', op: 'contains', value: 'arab' }],
            COLUMNS,
        );
        expect(ids(rows)).toEqual([1, 4]);
    });

    it('filters text by equals and startsWith', () => {
        expect(
            ids(
                filterRows(
                    COURSES,
                    [{ id: 'level', type: 'text', op: 'equals', value: 'a1' }],
                    COLUMNS,
                ),
            ),
        ).toEqual([1, 2]);
        expect(
            ids(
                filterRows(
                    COURSES,
                    [{ id: 'title', type: 'text', op: 'startsWith', value: 'lek' }],
                    COLUMNS,
                ),
            ),
        ).toEqual([5, 6]);
    });

    it('treats an empty text value as no filter', () => {
        expect(
            filterRows(
                COURSES,
                [{ id: 'title', type: 'text', op: 'contains', value: '  ' }],
                COLUMNS,
            ),
        ).toHaveLength(6);
    });

    it('filters choices by a set of values, and an empty set as no filter', () => {
        expect(
            ids(
                filterRows(
                    COURSES,
                    [{ id: 'category', type: 'choice', values: ['Kunst', 'Religion'] }],
                    COLUMNS,
                ),
            ),
        ).toEqual([2, 3]);
        expect(
            filterRows(COURSES, [{ id: 'category', type: 'choice', values: [] }], COLUMNS),
        ).toHaveLength(6);
    });

    it('filters numbers by an inclusive range and drops rows without a number', () => {
        expect(
            ids(filterRows(COURSES, [{ id: 'price', type: 'number', min: 90, max: 120 }], COLUMNS)),
        ).toEqual([1, 2]);
        expect(
            ids(filterRows(COURSES, [{ id: 'price', type: 'number', min: 100 }], COLUMNS)),
        ).toEqual([1, 4]);
        expect(
            ids(filterRows(COURSES, [{ id: 'price', type: 'number', max: 60 }], COLUMNS)),
        ).toEqual([5, 6]);
    });

    it('filters dates by an inclusive range', () => {
        expect(
            ids(
                filterRows(
                    COURSES,
                    [{ id: 'starts', type: 'date', from: '2026-10-01', to: '2026-10-31' }],
                    COLUMNS,
                ),
            ),
        ).toEqual([1, 5]);
        expect(
            ids(filterRows(COURSES, [{ id: 'starts', type: 'date', to: '2026-09-15' }], COLUMNS)),
        ).toEqual([2, 6]);
    });

    it('keeps the whole last day of a date range, times included', () => {
        const rows = [
            { ...COURSES[0]!, starts: '2026-10-31T15:00:00Z' },
            { ...COURSES[1]!, starts: '2026-11-01T00:00:00Z' },
        ];
        expect(
            ids(filterRows(rows, [{ id: 'starts', type: 'date', to: '2026-10-31' }], COLUMNS)),
        ).toEqual([1]);
    });

    it('combines filters with AND', () => {
        const rows = filterRows(
            COURSES,
            [
                { id: 'category', type: 'choice', values: ['Sprachen'] },
                { id: 'price', type: 'number', min: 100 },
            ],
            COLUMNS,
        );
        expect(ids(rows)).toEqual([1, 4]);
    });

    it('ignores filters on unknown columns', () => {
        expect(
            filterRows(COURSES, [{ id: 'nope', type: 'choice', values: ['x'] }], COLUMNS),
        ).toHaveLength(6);
    });
});

describe('groupRows', () => {
    it('groups by one column, in value order, with empty values last', () => {
        const groups = groupRows(COURSES, ['category'], COLUMNS);
        expect(groups.map((g) => [g.value, ids(g.rows)])).toEqual([
            ['Kunst', [3]],
            ['Religion', [2]],
            ['Sprachen', [1, 4, 6]],
            [null, [5]],
        ]);
        expect(groups[0]!.key).toBe('category:Kunst');
        expect(groups.every((g) => g.depth === 0)).toBe(true);
    });

    it('nests groups for several columns', () => {
        const groups = groupRows(COURSES, ['category', 'level'], COLUMNS);
        const sprachen = groups.find((g) => g.value === 'Sprachen')!;
        expect(sprachen.children.map((c) => [c.value, ids(c.rows), c.depth])).toEqual([
            ['A1', [1], 1],
            ['A2', [6], 1],
            ['B1', [4], 1],
        ]);
        expect(sprachen.children[0]!.key).toBe('category:Sprachen>level:A1');
    });

    it('aggregates numeric columns over every row in the group', () => {
        const sprachen = groupRows(COURSES, ['category'], COLUMNS).find(
            (g) => g.value === 'Sprachen',
        )!;
        expect(sprachen.aggregates).toEqual({ price: 330, enrolled: 37 });
    });

    it.each([
        ['count', 3],
        ['sum', 330],
        ['avg', 110],
        ['min', 60],
        ['max', 150],
    ] as const)('supports %s', (aggregate, expected) => {
        const cols = COLUMNS.map((c) => (c.id === 'price' ? { ...c, aggregate } : c));
        const sprachen = groupRows(COURSES, ['category'], cols).find(
            (g) => g.value === 'Sprachen',
        )!;
        expect(sprachen.aggregates.price).toBe(expected);
    });

    it('skips non-numbers when aggregating', () => {
        const kunst = groupRows(COURSES, ['category'], COLUMNS).find((g) => g.value === 'Kunst')!;
        expect(kunst.aggregates.price).toBe(0);
    });
});

describe('flattenLines', () => {
    const getId = (r: Course) => r.id;

    it('without grouping, lists rows at depth 0', () => {
        const lines = flattenLines(COURSES.slice(0, 2), [], new Set(), getId);
        expect(lines).toEqual([
            { kind: 'row', row: COURSES[0], id: 1, depth: 0 },
            { kind: 'row', row: COURSES[1], id: 2, depth: 0 },
        ]);
    });

    it('shows only group headers while groups are collapsed', () => {
        const groups = groupRows(COURSES, ['category'], COLUMNS);
        const lines = flattenLines(COURSES, groups, new Set(), getId);
        expect(lines.map((l) => l.kind)).toEqual(['group', 'group', 'group', 'group']);
    });

    it('opens an expanded group with its rows one level deeper', () => {
        const groups = groupRows(COURSES, ['category', 'level'], COLUMNS);
        const lines = flattenLines(
            COURSES,
            groups,
            new Set(['category:Sprachen', 'category:Sprachen>level:A2']),
            getId,
        );
        const summary = lines.map((l) =>
            l.kind === 'group' ? `g:${l.group.key}` : `r:${l.id}@${l.depth}`,
        );
        expect(summary).toEqual([
            'g:category:Kunst',
            'g:category:Religion',
            'g:category:Sprachen',
            'g:category:Sprachen>level:A1',
            'g:category:Sprachen>level:A2',
            'r:6@2',
            'g:category:Sprachen>level:B1',
            'g:category:',
        ]);
    });
});

describe('toCsv / toTsv', () => {
    const cols: GridColumn<Course>[] = [
        { id: 'title', header: 'Kurs' },
        {
            id: 'price',
            header: 'Preis',
            exportValue: (r) => (r.price === null ? '' : `${r.price} €`),
        },
    ];

    it('writes a header row and one line per row', () => {
        expect(toCsv(COURSES.slice(0, 2), cols)).toBe(
            'Kurs,Preis\r\nArabisch für Anfänger,120 €\r\nTajweed Grundlagen,90 €',
        );
    });

    it('quotes separators, quotes and line breaks (RFC 4180)', () => {
        const rows = [{ ...COURSES[0]!, title: 'A, "B"\nC' }];
        expect(toCsv(rows, cols)).toBe('Kurs,Preis\r\n"A, ""B""\nC",120 €');
    });

    it('takes another separator, and a BOM for Excel', () => {
        expect(toCsv(COURSES.slice(0, 1), cols, { separator: ';', bom: true })).toBe(
            '﻿Kurs;Preis\r\nArabisch für Anfänger;120 €',
        );
    });

    it('defuses spreadsheet formulas (CSV injection)', () => {
        const rows = ['=1+1', '+49 170', '-2', '@SUM(A1)'].map((title, i) => ({
            ...COURSES[0]!,
            id: i,
            title,
        }));
        const lines = toCsv(rows, [{ id: 'title', header: 'Kurs' }])
            .split('\r\n')
            .slice(1);
        expect(lines).toEqual(["'=1+1", "'+49 170", "'-2", "'@SUM(A1)"]);
    });

    it('writes empty cells for missing values', () => {
        expect(toCsv([COURSES[2]!], [{ id: 'price', header: 'Preis' }])).toBe('Preis\r\n');
    });

    it('writes TSV for the clipboard, flattening tabs and line breaks', () => {
        const rows = [{ ...COURSES[0]!, title: 'A\tB\nC' }];
        expect(toTsv(rows, cols)).toBe('Kurs\tPreis\nA B C\t120 €');
    });
});

describe('column layout', () => {
    it('keeps the saved order, appends new columns and drops removed ones', () => {
        expect(normaliseOrder(['price', 'gone', 'title'], ['title', 'category', 'price'])).toEqual([
            'price',
            'title',
            'category',
        ]);
    });

    it('moves a column to a new index', () => {
        expect(moveColumn(['a', 'b', 'c', 'd'], 'a', 2)).toEqual(['b', 'c', 'a', 'd']);
        expect(moveColumn(['a', 'b', 'c', 'd'], 'd', 0)).toEqual(['d', 'a', 'b', 'c']);
        expect(moveColumn(['a', 'b'], 'x', 0)).toEqual(['a', 'b']);
    });

    it('lays out visible columns: left-pinned, middle, right-pinned, with sticky offsets', () => {
        const layout = layoutColumns(COLUMNS, {
            order: ['title', 'category', 'level', 'price', 'starts', 'enrolled'],
            hidden: ['level'],
            widths: { title: 300, price: 20 },
            pinned: { title: 'left', enrolled: 'right', starts: 'right' },
            leading: 40,
        });
        expect(layout).toEqual([
            { id: 'title', width: 300, pinned: 'left', offset: 40 },
            { id: 'category', width: 160, pinned: null, offset: 0 },
            { id: 'price', width: 64, pinned: null, offset: 0 },
            { id: 'starts', width: 160, pinned: 'right', offset: 160 },
            { id: 'enrolled', width: 160, pinned: 'right', offset: 0 },
        ]);
    });

    it('uses a column’s own pinning and width unless the person changed them', () => {
        const cols: GridColumn<Course>[] = [
            { id: 'title', header: 'Kurs', pinned: 'left', width: 240, maxWidth: 260 },
            { id: 'price', header: 'Preis' },
        ];
        expect(
            layoutColumns(cols, { order: [], hidden: [], widths: { title: 999 }, pinned: {} }),
        ).toEqual([
            { id: 'title', width: 260, pinned: 'left', offset: 0 },
            { id: 'price', width: 160, pinned: null, offset: 0 },
        ]);
        expect(
            layoutColumns(cols, { order: [], hidden: [], widths: {}, pinned: { title: null } })[0],
        ).toEqual({
            id: 'title',
            width: 240,
            pinned: null,
            offset: 0,
        });
    });

    it('never hides a column that cannot be hidden', () => {
        const layout = layoutColumns(COLUMNS, {
            order: [],
            hidden: ['title'],
            widths: {},
            pinned: {},
        });
        expect(layout[0]!.id).toBe('title');
    });
});
