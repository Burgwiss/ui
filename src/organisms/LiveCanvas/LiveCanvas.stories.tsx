import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';

import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Sidebar, SidebarContent, SidebarHeader } from '../Sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { SidebarLayout } from '../../templates/SidebarLayout';
import { LiveCanvas, LiveCanvasGroup, LiveCanvasTarget } from './LiveCanvas';

const LABELS: Record<string, string> = {
    'heading.h1': 'Seitentitel',
    'heading.h2': 'Abschnittstitel',
    body: 'Fließtext',
    'button.primary': 'Hauptknopf',
    'button.secondary': 'Zweiter Knopf',
    field: 'Eingabefeld',
    table: 'Tabelle',
};

function Samples() {
    return (
        <div className="space-y-10">
            <div className="space-y-4">
                <LiveCanvasTarget id="heading.h1" label={LABELS['heading.h1']!}>
                    <h2 className="text-3xl font-semibold">Arabisch für Anfänger</h2>
                </LiveCanvasTarget>
                <LiveCanvasTarget id="heading.h2" label={LABELS['heading.h2']!}>
                    <h3 className="text-xl font-semibold">Was du lernst</h3>
                </LiveCanvasTarget>
                <LiveCanvasTarget id="body" label={LABELS.body!}>
                    <p className="max-w-xl text-muted-foreground">
                        In zwölf Wochen liest und schreibst du die arabische Schrift und führst
                        einfache Gespräche.
                    </p>
                </LiveCanvasTarget>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <LiveCanvasGroup caption="Knöpfe">
                    <div className="flex flex-wrap gap-3">
                        <LiveCanvasTarget id="button.primary" label={LABELS['button.primary']!}>
                            <Button>Jetzt anmelden</Button>
                        </LiveCanvasTarget>
                        <LiveCanvasTarget id="button.secondary" label={LABELS['button.secondary']!}>
                            <Button variant="outline">Mehr erfahren</Button>
                        </LiveCanvasTarget>
                    </div>
                </LiveCanvasGroup>
                <LiveCanvasGroup caption="Formular">
                    <LiveCanvasTarget id="field" label={LABELS.field!} wide>
                        <Input readOnly value="name@beispiel.de" aria-label="E-Mail" />
                    </LiveCanvasTarget>
                </LiveCanvasGroup>
            </div>
            <LiveCanvasGroup caption="Tabelle">
                <LiveCanvasTarget id="table" label={LABELS.table!} wide>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Person</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Amina K.</TableCell>
                                <TableCell>Angemeldet</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Yusuf B.</TableCell>
                                <TableCell>Warteliste</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </LiveCanvasTarget>
            </LiveCanvasGroup>
        </div>
    );
}

function Editor() {
    const [selected, setSelected] = useState<string | null>(null);
    const [primary, setPrimary] = useState('#1f6f8b');
    const [radius, setRadius] = useState(0.625);
    const [dark, setDark] = useState(false);
    const style = {
        '--primary': primary,
        '--ring': primary,
        '--radius': `${radius}rem`,
    } as CSSProperties;

    return (
        <div className="h-[640px] border border-border">
            <SidebarLayout
                side="right"
                sidebar={
                    <Sidebar
                        label="Eigenschaften"
                        side="right"
                        resize={{
                            label: 'Eigenschaften verbreitern oder verschmälern',
                            storageKey: 'storybook.livecanvas',
                        }}
                    >
                        <SidebarHeader>
                            <p className="px-2 text-xs text-muted-foreground">
                                {selected ? 'Ausgewählt' : 'Ganzes Thema'}
                            </p>
                            <p className="px-2 font-semibold">
                                {selected ? LABELS[selected] : 'Stil'}
                            </p>
                        </SidebarHeader>
                        <SidebarContent className="gap-4 px-4">
                            <label className="flex items-center justify-between gap-3 text-sm">
                                Primärfarbe
                                <input
                                    type="color"
                                    value={primary}
                                    onChange={(e) => setPrimary(e.target.value)}
                                    className="h-8 w-12 cursor-pointer rounded border border-input"
                                />
                            </label>
                            <label className="flex flex-col gap-1 text-sm">
                                Rundung: {radius.toFixed(2)} rem
                                <input
                                    type="range"
                                    min={0}
                                    max={1.5}
                                    step={0.125}
                                    value={radius}
                                    onChange={(e) => setRadius(Number(e.target.value))}
                                />
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={dark}
                                    onChange={(e) => setDark(e.target.checked)}
                                />
                                Dunkel
                            </label>
                        </SidebarContent>
                    </Sidebar>
                }
            >
                <div className="flex h-full flex-col">
                    <LiveCanvas
                        label="Stilbuch"
                        caption="Stilbuch — klicke einen Baustein an"
                        selected={selected}
                        onSelect={setSelected}
                        artboardStyle={style}
                        dark={dark}
                    >
                        <Samples />
                    </LiveCanvas>
                </div>
            </SidebarLayout>
        </div>
    );
}

const meta: Meta<typeof LiveCanvas> = {
    title: 'Organisms/LiveCanvas',
    component: LiveCanvas,
    parameters: { layout: 'fullscreen' },
};
export default meta;

/** Canvas plus inspector: pick a block, then change colour, rounding or dark mode and watch the artboard repaint. */
export const LiveEditor: StoryObj<typeof LiveCanvas> = { render: () => <Editor /> };
