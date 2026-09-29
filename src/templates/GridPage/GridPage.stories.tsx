import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { IconButton } from '../../molecules/IconButton';
import {
    GridActions,
    GridActionsSeparator,
    GridColumnsAction,
    GridCreateAction,
    GridDensityAction,
} from '../../organisms/GridActions';
import { GridColumnFilter } from '../../organisms/GridColumnFilter';
import { GridFooter } from '../../organisms/GridFooter';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../organisms/Table';
import { GridPage } from './GridPage';

type Row = {
    id: number;
    title: string;
    code: string;
    status: 'published' | 'draft' | 'archived';
    enrolled: number;
};
const ROWS: Row[] = [
    { id: 1, title: 'Arabisch für Anfänger', code: 'SPR-AR-A', status: 'published', enrolled: 18 },
    { id: 2, title: 'Tajweed Grundlagen', code: 'REL-TJ-I', status: 'published', enrolled: 7 },
    { id: 3, title: 'Kalligrafie-Werkstatt', code: 'KUN-KA-B', status: 'draft', enrolled: 0 },
    {
        id: 4,
        title: 'Sira — Das Leben des Propheten',
        code: 'GES-SI-A',
        status: 'published',
        enrolled: 7,
    },
    { id: 5, title: 'Medina Buch 1', code: 'SPR-MB-1', status: 'archived', enrolled: 12 },
];
const STATUS = { published: 'Veröffentlicht', draft: 'Entwurf', archived: 'Archiviert' } as const;

function Demo() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [compact, setCompact] = useState(false);
    const [visibility, setVisibility] = useState<Record<string, boolean>>({});
    const [selected, setSelected] = useState<number[]>([]);
    const rows = useMemo(
        () =>
            ROWS.filter(
                (r) =>
                    (!status || r.status === status) &&
                    r.title.toLowerCase().includes(search.toLowerCase()),
            ),
        [search, status],
    );
    const show = (id: string) => visibility[id] !== false;
    const pad = compact ? 'py-1.5' : 'py-3';

    return (
        <GridPage
            title="Kurse"
            offsetTop="0px"
            actions={
                <GridActions label="Kurse">
                    <GridCreateAction
                        label="Neuer Kurs"
                        icon={<Plus className="size-4" aria-hidden="true" />}
                        onClick={() => {}}
                    />
                    <GridActionsSeparator />
                    <GridDensityAction
                        compact={compact}
                        onChange={setCompact}
                        labels={{ compact: 'Kompakt', comfortable: 'Bequem' }}
                    />
                    <GridColumnsAction
                        label="Spalten"
                        columns={[
                            { id: 'code', label: 'Kürzel' },
                            { id: 'enrolled', label: 'Angemeldet' },
                        ]}
                        visibility={visibility}
                        onToggle={(id, v) => setVisibility((s) => ({ ...s, [id]: v }))}
                    />
                    <GridActionsSeparator />
                    <IconButton
                        label="Neu laden"
                        icon={<RefreshCw className="size-4" aria-hidden="true" />}
                    />
                </GridActions>
            }
            search={{ value: search, onChange: setSearch, placeholder: 'Kurse suchen …' }}
            selection={{
                count: selected.length,
                label: `${selected.length} ausgewählt`,
                clearLabel: 'Auswahl aufheben',
                onClear: () => setSelected([]),
                actions: (
                    <IconButton
                        label="Archivieren"
                        destructive
                        icon={<Trash2 className="size-4" aria-hidden="true" />}
                    />
                ),
            }}
            chips={
                status ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs">
                        Status: {STATUS[status as keyof typeof STATUS]}
                        <button
                            type="button"
                            aria-label="Filter entfernen"
                            onClick={() => setStatus('')}
                        >
                            <X className="size-3" aria-hidden="true" />
                        </button>
                    </span>
                ) : undefined
            }
            footer={
                <GridFooter
                    summary={`Zeige 1–${rows.length} von ${rows.length}`}
                    onPrev={null}
                    onNext={null}
                    labels={{ previous: 'Zurück', next: 'Weiter', pager: 'Seiten' }}
                />
            }
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <span className="sr-only">Auswahl</span>
                        </TableHead>
                        <TableHead>Kurs</TableHead>
                        {show('code') && <TableHead>Kürzel</TableHead>}
                        <TableHead>
                            <GridColumnFilter
                                title="Status"
                                filterLabel="Status filtern"
                                allLabel="Alle"
                                value={status}
                                onChange={setStatus}
                                options={Object.entries(STATUS).map(([value, label]) => ({
                                    value,
                                    label,
                                }))}
                            />
                        </TableHead>
                        {show('enrolled') && (
                            <TableHead className="text-right">Angemeldet</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((r) => (
                        <TableRow
                            key={r.id}
                            data-state={selected.includes(r.id) ? 'selected' : undefined}
                        >
                            <TableCell className={pad}>
                                <input
                                    type="checkbox"
                                    aria-label={`${r.title} auswählen`}
                                    checked={selected.includes(r.id)}
                                    onChange={(e) =>
                                        setSelected((s) =>
                                            e.target.checked
                                                ? [...s, r.id]
                                                : s.filter((x) => x !== r.id),
                                        )
                                    }
                                />
                            </TableCell>
                            <TableCell className={`${pad} font-medium`}>{r.title}</TableCell>
                            {show('code') && (
                                <TableCell className={`${pad} text-muted-foreground`}>
                                    {r.code}
                                </TableCell>
                            )}
                            <TableCell className={pad}>{STATUS[r.status]}</TableCell>
                            {show('enrolled') && (
                                <TableCell className={`${pad} text-right tabular-nums`}>
                                    {r.enrolled}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </GridPage>
    );
}

const meta: Meta<typeof GridPage> = {
    title: 'Templates/GridPage',
    component: GridPage,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Wie jede Liste aussieht: randlos, kein sichtbarer Titel, links die Aktionsleiste, rechts die Suche, Filter in den Spaltenköpfen, aktive Filter als Chips, unten Anzahl und Blättern. Eine markierte Zeile tauscht die Aktionen gegen die Auswahl-Leiste.',
            },
        },
    },
};
export default meta;

export const Kursliste: StoryObj<typeof GridPage> = { render: () => <Demo /> };
