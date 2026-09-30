import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    ArrowLeft,
    BookOpen,
    Check,
    CreditCard,
    ExternalLink,
    FileText,
    Folder,
    House,
    ImageUp,
    Palette,
    Pencil,
    Plus,
    Settings2,
    Trash2,
    Undo2,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { usePageDraft } from '../../hooks/usePageDraft';
import { cn } from '../../lib/cn';
import { CompletionChecklist } from '../../molecules/CompletionChecklist';
import { InlineText } from '../../molecules/InlineText';
import { LanguageSelect } from '../../molecules/LanguageSelect';
import {
    GermanyFlag,
    UnitedKingdomFlag,
} from '../../molecules/LanguageSelect/LanguageSelect.fixtures';
import { AppRail, AppRailItem, AppRailSpacer } from '../../organisms/AppRail';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '../../organisms/Sidebar';
import { AdminLayout } from '../../templates/AdminLayout';
import { PageEditor, type PageEditorDevice } from '../../templates/PageEditor';

/**
 * PAGE PROTOTYPE — what opens from the category tree's pencil (or
 * "Bearbeiten" in its menu): the category's own page, edited in place.
 *
 * A category is a folder for courses AND a page in the public catalogue
 * ("/kurse/arabisch"): a header, its subcategories as tiles, its courses as
 * cards, and an introduction. The tiles and cards come from the tree and the
 * courses and are not edited here; the words around them are.
 */

type Lang = 'de' | 'en';
type Fields = { title: string; tagline: string; cover: string; about: string; faq: string };
const FIELDS: Record<keyof Fields, string> = {
    title: 'Titel',
    tagline: 'Kurzbeschreibung',
    cover: 'Titelbild',
    about: 'Über die Kategorie',
    faq: 'Häufige Fragen',
};

const START: Record<Lang, Fields> = {
    de: {
        title: 'Arabisch',
        tagline: 'Vom ersten Buchstaben bis zur freien Rede — Kurse für jede Stufe.',
        cover: 'arabisch.jpg',
        about: '',
        faq: '',
    },
    en: { title: 'Arabic', tagline: '', cover: 'arabisch.jpg', about: '', faq: '' },
};

const SUBCATEGORIES = [
    { id: 'grundstufe', label: 'Grundstufe', courses: 6 },
    { id: 'aufbaustufe', label: 'Aufbaustufe', courses: 5 },
    { id: 'grammatik', label: 'Grammatik', courses: 3 },
];
const COURSES = [
    { title: 'Arabisch für Anfänger', sub: 'Grundstufe', next: 'ab 05.10.', price: '240 €' },
    { title: 'Medina-Buch 1', sub: 'Grundstufe', next: 'ab 09.10.', price: '60 €' },
    { title: 'Arabisch Aufbaukurs', sub: 'Aufbaustufe', next: 'ab 08.10.', price: '90 €' },
    {
        title: 'Arabische Grammatik intensiv',
        sub: 'Grammatik',
        next: 'Termin auf Anfrage',
        price: '150 €',
    },
];

function CategoryPage({ initial = START }: { initial?: Record<Lang, Fields> }) {
    const page = usePageDraft<Fields, Lang>(initial);
    const [lang, setLang] = useState<Lang>('de');
    const [device, setDevice] = useState<PageEditorDevice>('desktop');
    const [order, setOrder] = useState<'date' | 'manual'>('date');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const f = page.draft[lang];

    const set = (key: keyof Fields, value: string) => {
        page.set(lang, key, value);
        setSaving(true);
        setToast(`${FIELDS[key]} geändert`);
    };
    useEffect(() => {
        if (!saving) return;
        const t = setTimeout(() => setSaving(false), 700);
        return () => clearTimeout(t);
    }, [saving]);
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    const checks = (l: Lang) => {
        const x = page.draft[l];
        return [
            { id: 'title', label: FIELDS.title, done: !!x.title },
            { id: 'tagline', label: FIELDS.tagline, done: !!x.tagline },
            { id: 'cover', label: FIELDS.cover, done: !!x.cover },
            { id: 'about', label: FIELDS.about, done: !!x.about },
            { id: 'faq', label: FIELDS.faq, done: !!x.faq, optional: true },
        ];
    };
    const progress = (l: Lang) => {
        const c = checks(l);
        return { done: c.filter((i) => i.done).length, total: c.length };
    };

    return (
        <AdminLayout
            rail={
                <AppRail
                    label="Apps"
                    logo={
                        <span className="flex size-9 items-center justify-center rounded-lg bg-background text-sm font-bold text-foreground">
                            B
                        </span>
                    }
                >
                    <AppRailItem icon={House} label="Start" href="#start" />
                    <AppRailItem icon={BookOpen} label="Kurse" active href="#/admin/kurse" />
                    <AppRailItem icon={Users} label="Nutzer" onClick={() => {}} />
                    <AppRailItem icon={CreditCard} label="Zahlungen" onClick={() => {}} />
                    <AppRailItem icon={Palette} label="Design" onClick={() => {}} />
                    <AppRailSpacer />
                    <AppRailItem icon={Settings2} label="Betrieb" onClick={() => {}} />
                </AppRail>
            }
            sidebar={
                <Sidebar
                    label="Kategorie"
                    defaultWidth={264}
                    resize={{
                        label: 'Menü verbreitern oder verschmälern',
                        storageKey: 'storybook.page.category',
                    }}
                >
                    <SidebarHeader>
                        <a
                            href="#/admin/kurse"
                            className="flex w-fit items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                            Alle Kurse
                        </a>
                        <div className="flex flex-col gap-1 px-2 pt-2">
                            <div className="flex items-center gap-2 text-base font-semibold">
                                <Folder
                                    className="size-4 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                {page.draft.de.title || 'Ohne Namen'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Oberste Ebene · 14 Kurse
                            </div>
                            <Badge tone="success" dot className="mt-1 w-fit">
                                Seite live
                            </Badge>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup label="Kategorie">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton active>
                                        <FileText aria-hidden="true" />
                                        Kategorieseite
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton>
                                        <Settings2 aria-hidden="true" />
                                        Einstellungen
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center justify-between ps-2">
                                <h2 className="text-xs font-medium text-muted-foreground">
                                    Unterkategorien
                                </h2>
                                <IconButton
                                    label="Neue Unterkategorie"
                                    icon={<Plus className="size-4" aria-hidden="true" />}
                                    className="size-7"
                                />
                            </div>
                            <ul className="flex flex-col gap-0.5">
                                {SUBCATEGORIES.map((s) => (
                                    <li key={s.id}>
                                        <a
                                            href={`#/admin/kategorien/${s.id}`}
                                            className="group flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sidebar-accent"
                                        >
                                            <Folder
                                                className="size-4 text-muted-foreground"
                                                aria-hidden="true"
                                            />
                                            <span className="flex-1 truncate">{s.label}</span>
                                            <span className="text-xs text-muted-foreground tabular-nums group-hover:hidden">
                                                {s.courses}
                                            </span>
                                            <Pencil
                                                className="hidden size-3.5 text-muted-foreground group-hover:block"
                                                aria-hidden="true"
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <a
                            href="#/admin/kurse?kategorie=arabisch"
                            className="mx-2 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <BookOpen className="size-4" aria-hidden="true" />
                            Die 14 Kurse in der Liste zeigen
                        </a>
                    </SidebarContent>
                </Sidebar>
            }
        >
            <PageEditor
                device={device}
                onDeviceChange={setDevice}
                storageKey="storybook.page.category.right"
                labels={{
                    preview: 'Kategorieseite (Vorschau zum Bearbeiten)',
                    tools: 'Vorschau',
                    desktop: 'Computer',
                    phone: 'Handy',
                    aside: 'Seitenstatus',
                    resizeAside: 'Seitenleiste verbreitern oder verschmälern',
                }}
                previewTools={
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Rückgängig"
                        disabled={!page.canUndo}
                        className="text-muted-foreground"
                        onClick={() => {
                            const undone = page.undo();
                            if (undone) setToast(`${FIELDS[undone.key]} zurückgesetzt`);
                        }}
                    >
                        <Undo2 aria-hidden="true" />
                    </Button>
                }
                toolbar={
                    <>
                        <LanguageSelect
                            languages={[
                                {
                                    code: 'de',
                                    label: 'Deutsch',
                                    flag: GermanyFlag,
                                    ...progress('de'),
                                },
                                {
                                    code: 'en',
                                    label: 'Englisch',
                                    flag: UnitedKingdomFlag,
                                    ...progress('en'),
                                },
                            ]}
                            value={lang}
                            onValueChange={(code) => setLang(code as Lang)}
                            labels={{
                                label: 'Sprache der Seite',
                                progress: (d, t) => `${d} von ${t} ausgefüllt`,
                            }}
                        />
                        <span className="flex-1" />
                        <span
                            role="status"
                            className="flex w-24 items-center gap-1 text-xs whitespace-nowrap text-muted-foreground"
                        >
                            {saving ? (
                                'Speichert …'
                            ) : (
                                <>
                                    <Check className="size-3.5 text-success" aria-hidden="true" />
                                    Gespeichert
                                </>
                            )}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                            <a href="#/kurse/arabisch">
                                <ExternalLink aria-hidden="true" />
                                Ansehen
                            </a>
                        </Button>
                        <Button
                            size="sm"
                            disabled={page.changes.length === 0}
                            tooltip={
                                page.changes.length === 0
                                    ? 'Alles ist live'
                                    : 'Besucher sehen die Änderungen erst danach'
                            }
                            onClick={() => {
                                page.publish();
                                setToast('Veröffentlicht — Besucher sehen jetzt die neue Fassung');
                            }}
                        >
                            Veröffentlichen
                            {page.changes.length > 0 && (
                                <span className="rounded-full bg-primary-foreground/20 px-1.5 text-xs tabular-nums">
                                    {page.changes.length}
                                </span>
                            )}
                        </Button>
                    </>
                }
                aside={
                    <>
                        <CompletionChecklist
                            items={checks(lang)}
                            labels={{
                                heading: `Seite (${lang.toUpperCase()})`,
                                complete: 'alles Nötige da',
                                incomplete: 'Pflichtangaben fehlen',
                                optional: 'optional',
                                done: 'ausgefüllt',
                                missing: 'fehlt',
                            }}
                        />
                        <section className="flex flex-col gap-2" aria-labelledby="not-live">
                            <h2 id="not-live" className="text-xs font-medium text-muted-foreground">
                                Noch nicht live
                            </h2>
                            {page.changes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Nichts — Besucher sehen genau diese Seite.
                                </p>
                            ) : (
                                <>
                                    <ul className="flex flex-col gap-1 text-sm">
                                        {page.changes.map((c) => (
                                            <li
                                                key={`${c.lang}-${c.key}`}
                                                className="flex items-center gap-2"
                                            >
                                                <Pencil
                                                    className="size-3.5 text-muted-foreground"
                                                    aria-hidden="true"
                                                />
                                                {FIELDS[c.key]}
                                                <span className="text-xs text-muted-foreground">
                                                    {c.lang.toUpperCase()}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-fit text-muted-foreground"
                                        onClick={() => {
                                            page.discard();
                                            setToast('Änderungen verworfen');
                                        }}
                                    >
                                        <Trash2 aria-hidden="true" />
                                        Alle verwerfen
                                    </Button>
                                </>
                            )}
                        </section>
                    </>
                }
            >
                {/* ——— the public category page ——— */}
                <header className="relative bg-primary px-8 pt-10 pb-8 text-primary-foreground">
                    <Button variant="secondary" size="sm" className="absolute top-3 right-3">
                        <ImageUp aria-hidden="true" />
                        Titelbild ersetzen
                    </Button>
                    <span className="inline-block rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-xs font-medium">
                        Kurse › {f.title || '…'}
                    </span>
                    <div className="mt-3 flex flex-col gap-2">
                        <InlineText
                            as="h1"
                            inverse
                            label="Titel"
                            placeholder="Wie heißt die Kategorie?"
                            value={f.title}
                            onChange={(v) => set('title', v)}
                            className="text-3xl font-bold tracking-tight"
                        />
                        <InlineText
                            inverse
                            label="Kurzbeschreibung"
                            placeholder="Ein Satz, der im Katalog unter dem Namen steht"
                            value={f.tagline}
                            onChange={(v) => set('tagline', v)}
                            className="text-base opacity-90"
                        />
                    </div>
                </header>

                <section aria-labelledby="bereiche" className="flex flex-col gap-3 px-8 pt-6">
                    <div className="flex items-baseline justify-between gap-3">
                        <h2 id="bereiche" className="text-lg font-semibold">
                            Bereiche
                        </h2>
                        <span className="text-xs text-muted-foreground">
                            kommen aus dem Kategoriebaum
                        </span>
                    </div>
                    <div
                        className={cn(
                            'grid gap-3',
                            device === 'desktop' ? 'grid-cols-3' : 'grid-cols-1',
                        )}
                    >
                        {SUBCATEGORIES.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center gap-3 rounded-lg border border-border p-3"
                            >
                                <span className="flex size-9 items-center justify-center rounded-md bg-muted">
                                    <Folder className="size-4" aria-hidden="true" />
                                </span>
                                <div>
                                    <div className="text-sm font-medium">{s.label}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {s.courses} Kurse
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="kurse" className="flex flex-col gap-3 px-8 pt-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 id="kurse" className="text-lg font-semibold">
                            Kurse
                        </h2>
                        <div
                            role="radiogroup"
                            aria-label="Reihenfolge der Kurse"
                            className="flex rounded-lg bg-muted p-0.5 text-xs font-medium"
                        >
                            {(
                                [
                                    ['date', 'Nächster Termin zuerst'],
                                    ['manual', 'Eigene Reihenfolge'],
                                ] as const
                            ).map(([id, label]) => (
                                <button
                                    key={id}
                                    type="button"
                                    role="radio"
                                    aria-checked={order === id}
                                    onClick={() => setOrder(id)}
                                    className={cn(
                                        'h-7 rounded-md px-2.5 text-muted-foreground',
                                        order === id && 'bg-background text-foreground shadow-sm',
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div
                        className={cn(
                            'grid gap-3',
                            device === 'desktop' ? 'grid-cols-2' : 'grid-cols-1',
                        )}
                    >
                        {COURSES.map((c) => (
                            <div
                                key={c.title}
                                className={cn(
                                    'flex flex-col gap-1 rounded-lg border border-border p-4',
                                    order === 'manual' && 'cursor-grab',
                                )}
                            >
                                <span className="text-xs text-muted-foreground">{c.sub}</span>
                                <span className="font-medium">{c.title}</span>
                                <span className="flex items-center justify-between text-sm text-muted-foreground">
                                    {c.next}
                                    <span className="font-semibold text-foreground tabular-nums">
                                        {c.price}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {order === 'manual'
                            ? 'Ziehe die Karten in die Reihenfolge, in der Besucher sie sehen.'
                            : 'Kurse ohne Termin stehen am Ende.'}
                    </p>
                </section>

                <section aria-labelledby="ueber" className="flex flex-col gap-3 px-8 pt-8">
                    <h2 id="ueber" className="text-lg font-semibold">
                        Über {f.title || 'die Kategorie'}
                    </h2>
                    <InlineText
                        multiline
                        label="Über die Kategorie"
                        placeholder="Ein paar Sätze für Besucher und Suchmaschinen: was man hier lernt, für wen, wie"
                        value={f.about}
                        onChange={(v) => set('about', v)}
                        className="leading-relaxed"
                    />
                </section>

                <section aria-labelledby="fragen" className="flex flex-col gap-3 px-8 py-8">
                    <h2 id="fragen" className="text-lg font-semibold">
                        Häufige Fragen
                    </h2>
                    <InlineText
                        multiline
                        label="Häufige Fragen"
                        placeholder="z. B. „Welcher Kurs passt zu mir?“"
                        value={f.faq}
                        onChange={(v) => set('faq', v)}
                    />
                </section>
            </PageEditor>

            {toast && (
                <div
                    role="status"
                    className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-3 rounded-lg bg-foreground px-4 py-2.5 text-sm text-background shadow-lg fade-in-0 slide-in-from-bottom-2"
                >
                    {toast}
                </div>
            )}
        </AdminLayout>
    );
}

const meta: Meta<typeof CategoryPage> = {
    title: 'Pages/Kategorie',
    component: CategoryPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.category')) localStorage.removeItem(k);
    },
};
export default meta;

/**
 * The category's catalogue page, edited in place: click the words to change
 * them. Subcategories and courses come from the tree and the courses.
 */
export const Kategorieseite: StoryObj<typeof CategoryPage> = {
    render: () => <CategoryPage />,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Write the introduction in place', async () => {
            await userEvent.click(canvas.getByRole('button', { name: /^Über die Kategorie — / }));
            await userEvent.keyboard(
                'Hier lernst du Arabisch — lesen, schreiben, sprechen.{Control>}{Enter}{/Control}',
            );
            await expect(
                canvas.getByText('Hier lernst du Arabisch — lesen, schreiben, sprechen.'),
            ).toBeVisible();
        });
        await step('It waits to be published', async () => {
            await waitFor(() =>
                expect(canvas.getByRole('button', { name: /Veröffentlichen/ })).toBeEnabled(),
            );
        });
    },
};

/** A category just created in the tree: only its name so far. */
export const NeueKategorie: StoryObj<typeof CategoryPage> = {
    render: () => (
        <CategoryPage
            initial={{
                de: { title: 'Tafsir', tagline: '', cover: '', about: '', faq: '' },
                en: { title: '', tagline: '', cover: '', about: '', faq: '' },
            }}
        />
    ),
};
