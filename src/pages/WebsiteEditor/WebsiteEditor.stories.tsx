import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    ArrowDown,
    ArrowUp,
    AtSign,
    Bold,
    BookOpen,
    Check,
    ChevronDown,
    ChevronRight,
    CircleAlert,
    Cookie,
    EllipsisVertical,
    EyeOff,
    FileText,
    GripVertical,
    Heading2,
    History,
    House,
    Image as ImageIcon,
    Info,
    Italic,
    LayoutDashboard,
    Library,
    Link as LinkIcon,
    List,
    Lock,
    Mail,
    Newspaper,
    Palette,
    PanelBottom,
    PanelTop,
    Pencil,
    Plus,
    Quote,
    Redo2,
    Scale,
    Search,
    Settings2,
    ShieldCheck,
    Sparkles,
    Trash2,
    Type,
    Undo2,
    Users,
    X,
    type LucideIcon,
} from 'lucide-react';
import { createContext, useContext, useEffect, useId, useState, type ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { Input } from '../../atoms/Input';
import { IntegerInput } from '../../atoms/IntegerInput';
import { Label } from '../../atoms/Label';
import { Switch } from '../../atoms/Switch';
import { Textarea } from '../../atoms/Textarea';
import { cn } from '../../lib/cn';
import { Combobox } from '../../molecules/Combobox';
import { ConfirmActionDialog } from '../../molecules/ConfirmActionDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';
import { InlineText } from '../../molecules/InlineText';
import { LanguageSelect } from '../../molecules/LanguageSelect';
import { nativeSelectClass } from '../../molecules/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../molecules/Tabs';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '../../organisms/Sidebar';
import { PageEditor, type PageEditorDevice } from '../../templates/PageEditor';

/**
 * PAGE PROTOTYPE — the Website-Editor (`/admin/design/studio` in Burgwiss, the
 * former "Design Studio"; rail label "Website") after step 3 of dissolving the
 * admin's "Website-Inhalte" menu. It shows WHERE everything that was left in
 * that menu lands inside the editor, and how it is edited there:
 *
 *  - Website-Einstellungen (the grab bag at `/admin/marketing/settings`) is
 *    split by section: the main switches, SEO defaults and the seat display
 *    become the editor's site settings (navigator footer); contact e-mail,
 *    social links, form fields and spam protection go onto the Kontakt page;
 *    the catalogue / knowledge / contact headings onto their own pages; the
 *    featured courses onto the home page's featured-courses block. The Hero
 *    fields are deleted; student self-enrolment goes to Kurse (not shown).
 *  - Artikel get their own navigator group next to "Deine Seiten".
 *  - Über uns becomes an ordinary page with blocks.
 *  - Rechtliches (Impressum, Datenschutz, Barrierefreiheit) is a group of
 *    fixed pages: editable, never deletable or hideable.
 *  - The cookie banner is a part "auf jeder Seite", next to header and footer.
 *
 * Same frame as the real editor (`resources/js/Components/Design/Studio/**`):
 * navigator left with "Website-Editor" and an X, the page in the middle with a
 * floating viewport bar, the inspector right with its own title row, undo /
 * redo / "Keine unveröffentlichten Änderungen" / "Veröffentlichen" on top,
 * "Verlauf" at the navigator's foot. Full-screen — the real editor does not use
 * the admin rail. Non-functional: example content, no server.
 *
 * ## Three ways a change reaches visitors
 *
 * Every inspector section carries one of three badges, decided per field from
 * how the real code treats it today and from the #1630 / ADR-0142 drafts model
 * ("nothing an admin changes in the Design area is live until Publish", with
 * the documented exceptions: brand assets, and a page's title / slug / SEO /
 * visibility, which are content and save live):
 *
 *  - **Sofort live** — switches that open or close whole routes (they 404 when
 *    off), and routing data the server reads at request time. A draft of a
 *    route gate cannot be previewed honestly: the frame would show a search box
 *    whose endpoint still 404s.
 *  - **Mit Veröffentlichen** — anything that only changes how a page LOOKS or
 *    what it SAYS on the canvas. Previewed in the frame, applied by Publish.
 *  - **Mit Speichern** — content with a lifecycle of its own (articles have a
 *    publication date; legal pages are a legal obligation that must never wait
 *    behind an unrelated design draft). An explicit save, live on save — today's
 *    behaviour, kept.
 *
 * Anything here with no backend behind it today carries a `MOCK-ONLY` comment.
 */

// ---------------------------------------------------------------------------
// Example data
// ---------------------------------------------------------------------------

type Lang = 'de' | 'en';
type Tr = Record<Lang, string>;
const LANGS: Lang[] = ['de', 'en'];
const LANG_NAME: Record<Lang, string> = { de: 'Deutsch', en: 'Englisch' };
const tr = (de: string, en: string): Tr => ({ de, en });

const SCHOOL = 'Al-Nur Akademie';

type BlockType =
    | 'hero'
    | 'featured_courses'
    | 'text'
    | 'latest_articles'
    | 'image_text'
    | 'instructors'
    | 'contact_form'
    | 'quote';

type Block = { id: string; type: BlockType; visible: boolean };

const BLOCK_LABEL: Record<BlockType, string> = {
    hero: 'Hero',
    featured_courses: 'Hervorgehobene Kurse',
    text: 'Text',
    latest_articles: 'Neueste Artikel',
    image_text: 'Bild und Text',
    instructors: 'Lehrkräfte',
    contact_form: 'Kontaktformular',
    quote: 'Zitat',
};

const BLOCK_ICON: Record<BlockType, LucideIcon> = {
    hero: Sparkles,
    featured_courses: BookOpen,
    text: Type,
    latest_articles: Newspaper,
    image_text: ImageIcon,
    instructors: Users,
    contact_form: Mail,
    quote: Quote,
};

type PageKind = 'home' | 'about' | 'contact' | 'custom';
type SitePage = {
    id: string;
    title: string;
    path: string;
    kind: PageKind;
    blocks: Block[];
    published: boolean;
    /** Has unpublished block changes. */
    draft: boolean;
    /** Moved in from "Website-Inhalte" in this step. */
    moved: boolean;
};

const PAGES: SitePage[] = [
    {
        id: 'home',
        title: 'Startseite',
        path: '/',
        kind: 'home',
        published: true,
        draft: true,
        moved: false,
        blocks: [
            { id: 'h-hero', type: 'hero', visible: true },
            { id: 'h-featured', type: 'featured_courses', visible: true },
            { id: 'h-text', type: 'text', visible: true },
            { id: 'h-articles', type: 'latest_articles', visible: true },
        ],
    },
    {
        // MOCK-ONLY: today Über uns is one rich-text column (`about_body`) on
        // its own admin screen. Here it is converted once into a page whose
        // first Text block holds the old text.
        id: 'about',
        title: 'Über uns',
        path: '/about',
        kind: 'about',
        published: true,
        draft: false,
        moved: true,
        blocks: [
            { id: 'a-hero', type: 'hero', visible: true },
            { id: 'a-text', type: 'text', visible: true },
            { id: 'a-image', type: 'image_text', visible: true },
            { id: 'a-team', type: 'instructors', visible: true },
            { id: 'a-quote', type: 'quote', visible: false },
        ],
    },
    {
        // MOCK-ONLY: /contact is a built-in page with no blocks; the editor has
        // no entry for it today. Its heading, intro, contact data, form fields
        // and spam switch move here from Website-Einstellungen.
        id: 'contact',
        title: 'Kontakt',
        path: '/contact',
        kind: 'contact',
        published: true,
        draft: false,
        moved: true,
        blocks: [],
    },
    {
        id: 'firmenkurse',
        title: 'Firmenkurse',
        path: '/firmenkurse',
        kind: 'custom',
        published: true,
        draft: false,
        moved: false,
        blocks: [
            { id: 'f-hero', type: 'hero', visible: true },
            { id: 'f-text', type: 'text', visible: true },
            { id: 'f-form', type: 'contact_form', visible: true },
        ],
    },
    {
        id: 'ramadan',
        title: 'Ramadan-Programm 2027',
        path: '/ramadan-2027',
        kind: 'custom',
        published: false,
        draft: true,
        moved: false,
        blocks: [
            { id: 'r-hero', type: 'hero', visible: true },
            { id: 'r-text', type: 'text', visible: true },
        ],
    },
];

type Course = {
    id: number;
    title: string;
    run: string;
    price: string;
    /** Null: no seat limit. */
    seatsLeft: number | null;
};

const COURSES: Course[] = [
    {
        id: 1,
        title: 'Arabisch für Anfänger',
        run: 'Herbst 2026 · Online',
        price: '240 €',
        seatsLeft: 3,
    },
    {
        id: 2,
        title: 'Deutsch für den Beruf B1',
        run: 'Herbst 2026 · Online',
        price: '320 €',
        seatsLeft: 12,
    },
    {
        id: 3,
        title: 'Tajwid Grundlagen',
        run: 'Herbst 2026 · Berlin',
        price: '180 €',
        seatsLeft: 0,
    },
    {
        id: 4,
        title: 'Pflege-Fachsprache',
        run: 'Herbst 2026 · Potsdam',
        price: '290 €',
        seatsLeft: 5,
    },
    {
        id: 5,
        title: 'Fiqh des Alltags',
        run: 'Frühjahr 2027 · Online',
        price: '120 €',
        seatsLeft: null,
    },
    {
        id: 6,
        title: 'Hifz-Kreis: Juz ʿAmma',
        run: 'Laufend',
        price: 'Kostenlos',
        seatsLeft: 8,
    },
    {
        id: 7,
        title: 'Quran lesen für Kinder',
        run: 'Herbst 2026 · Berlin',
        price: '150 €',
        seatsLeft: 2,
    },
];
const course = (id: number) => COURSES.find((c) => c.id === id)!;

type ArticleStatus = 'live' | 'scheduled' | 'draft';
type Article = {
    id: number;
    title: Tr;
    slug: string;
    status: ArticleStatus;
    /** Publication date, `TT.MM.JJJJ`, or null for a draft. */
    date: string | null;
    updated: string;
    author: string | null;
    topic: string | null;
    excerpt: Tr;
    blocks: Block[];
};

const ARTICLES: Article[] = [
    {
        id: 1,
        title: tr('Das arabische Alphabet in vier Wochen', 'The Arabic alphabet in four weeks'),
        slug: 'arabisches-alphabet',
        status: 'live',
        date: '12.09.2026',
        updated: 'vor 2 Tagen',
        author: 'Amina Berger',
        topic: 'Arabisch',
        excerpt: tr(
            'Achtundzwanzig Buchstaben, vier Formen, ein Plan: So lernst du die Schrift Schritt für Schritt — mit zehn Minuten am Tag.',
            'Twenty-eight letters, four forms, one plan: learn the script step by step, ten minutes a day.',
        ),
        blocks: [
            { id: 'ar-1', type: 'text', visible: true },
            { id: 'ar-2', type: 'image_text', visible: true },
            { id: 'ar-3', type: 'quote', visible: true },
            { id: 'ar-4', type: 'text', visible: true },
        ],
    },
    {
        id: 2,
        title: tr('Tajwid: die fünf häufigsten Fehler', 'Tajwid: the five most common mistakes'),
        slug: 'tajwid-fehler',
        status: 'live',
        date: '28.08.2026',
        updated: 'vor 3 Wo.',
        author: 'Mosa Khallaf',
        topic: 'Quran',
        excerpt: tr('', ''),
        blocks: [{ id: 'tj-1', type: 'text', visible: true }],
    },
    {
        id: 3,
        title: tr('Was die B1-Prüfung wirklich verlangt', ''),
        slug: 'b1-pruefung',
        status: 'scheduled',
        date: '15.10.2026',
        updated: 'gestern',
        author: 'Leonie Weber',
        topic: 'Deutsch',
        excerpt: tr('', ''),
        blocks: [{ id: 'b1-1', type: 'text', visible: true }],
    },
    {
        id: 4,
        title: tr('Pflege-Deutsch: 30 Wörter für die erste Schicht', ''),
        slug: 'pflege-deutsch-erste-schicht',
        status: 'draft',
        date: null,
        updated: 'vor 5 Min.',
        author: null,
        topic: 'Pflege',
        excerpt: tr('', ''),
        blocks: [],
    },
];
const article = (id: number) => ARTICLES.find((a) => a.id === id)!;

const ARTICLE_STATUS: Record<
    ArticleStatus,
    { label: string; tone: 'success' | 'warning' | 'muted' }
> = {
    live: { label: 'Veröffentlicht', tone: 'success' },
    scheduled: { label: 'Geplant', tone: 'warning' },
    draft: { label: 'Entwurf', tone: 'muted' },
};

type LegalId = 'impressum' | 'datenschutz' | 'barrierefreiheit';
type LegalPage = {
    id: LegalId;
    title: string;
    path: string;
    /** Must hold real content before the public site may be switched on. */
    requiredForPublicSite: boolean;
    basis: string;
    body: Tr;
};

const IMPRESSUM_DE = `Angaben gemäß § 5 DDG

Al-Nur Akademie gGmbH
Sonnenallee 112
12045 Berlin

Vertreten durch: Amina Berger (Geschäftsführerin)

Kontakt
Telefon: 030 1234567
E-Mail: kontakt@al-nur-akademie.de

Registereintrag
Amtsgericht Charlottenburg, HRB 234567 B

Umsatzsteuer-ID gemäß § 27a UStG: DE 312345678`;

const LEGAL: LegalPage[] = [
    {
        id: 'impressum',
        title: 'Impressum',
        path: '/impressum',
        requiredForPublicSite: true,
        basis: 'Anbieterkennzeichnung nach § 5 DDG.',
        body: { de: IMPRESSUM_DE, en: '' },
    },
    {
        id: 'datenschutz',
        title: 'Datenschutzerklärung',
        path: '/datenschutz',
        requiredForPublicSite: true,
        basis: 'Datenschutzinformationen nach Art. 13/14 DSGVO.',
        body: tr(
            'Verantwortlich für die Verarbeitung deiner Daten ist die Al-Nur Akademie gGmbH …',
            'The controller responsible for processing your data is Al-Nur Akademie gGmbH …',
        ),
    },
    {
        id: 'barrierefreiheit',
        title: 'Barrierefreiheit',
        path: '/barrierefreiheit',
        requiredForPublicSite: false,
        basis: 'Erklärung nach dem Barrierefreiheitsstärkungsgesetz. Keine Voraussetzung für die öffentliche Website.',
        body: tr('', ''),
    },
];
const legal = (id: LegalId) => LEGAL.find((l) => l.id === id)!;

type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'consent';
const FIELD_TYPE: Record<FieldType, string> = {
    text: 'Einzeilig',
    email: 'E-Mail-Adresse',
    tel: 'Telefonnummer',
    textarea: 'Lange Nachricht',
    select: 'Auswahlliste',
    consent: 'Einwilligung',
};
type FormField = {
    key: string;
    type: FieldType;
    label: string;
    required: boolean;
    options?: string[];
};
const CONTACT_FIELDS: FormField[] = [
    { key: 'name', type: 'text', label: 'Dein Name', required: true },
    { key: 'email', type: 'email', label: 'Deine E-Mail-Adresse', required: true },
    {
        key: 'anliegen',
        type: 'select',
        label: 'Worum geht es?',
        required: true,
        options: ['Kursberatung', 'Firmenkurse', 'Rechnung', 'Etwas anderes'],
    },
    { key: 'nachricht', type: 'textarea', label: 'Deine Nachricht', required: true },
    {
        key: 'datenschutz',
        type: 'consent',
        label: 'Ich habe die Datenschutzerklärung gelesen.',
        required: true,
    },
];

const SOCIAL = [
    { key: 'instagram', label: 'Instagram', value: 'https://instagram.com/alnur.akademie' },
    { key: 'youtube', label: 'YouTube', value: 'https://youtube.com/@alnurakademie' },
    { key: 'facebook', label: 'Facebook', value: '' },
    { key: 'linkedin', label: 'LinkedIn', value: '' },
    { key: 'x', label: 'X (Twitter)', value: '' },
] as const;

type ConsentService = { name: string; provider: string; domain: string; cookies: string };
type ConsentCategory = {
    key: string;
    name: string;
    essential: boolean;
    services: ConsentService[];
};
const CONSENT: ConsentCategory[] = [
    { key: 'necessary', name: 'Unbedingt erforderlich', essential: true, services: [] },
    {
        key: 'media',
        name: 'Videos und Karten',
        essential: false,
        services: [
            {
                name: 'YouTube-Videos',
                provider: 'Google Ireland Ltd.',
                domain: 'www.youtube-nocookie.com',
                cookies: 'VISITOR_INFO1_LIVE, YSC',
            },
            {
                name: 'Vimeo-Videos',
                provider: 'Vimeo.com, Inc.',
                domain: 'player.vimeo.com',
                cookies: 'vuid',
            },
        ],
    },
];

const TEACHERS = ['Amina Berger', 'Mosa Khallaf', 'Leonie Weber', 'Omar Krüger'];
const TOPICS = ['Arabisch', 'Deutsch', 'Quran', 'Pflege', 'Fiqh'];

// ---------------------------------------------------------------------------
// Selection and editor state
// ---------------------------------------------------------------------------

type SystemId = 'catalog' | 'course' | 'dashboard';
type PartId = 'header' | 'footer' | 'cookie';

type Sel =
    | { kind: 'theme' }
    | { kind: 'page'; id: string; block?: string }
    | { kind: 'knowledge' }
    | { kind: 'article'; id: number; block?: string }
    | { kind: 'system'; id: SystemId }
    | { kind: 'legal'; id: LegalId }
    | { kind: 'part'; id: PartId }
    | { kind: 'settings' };

type GroupId = 'theme' | 'pages' | 'articles' | 'system' | 'legal' | 'parts';

/** How a change reaches visitors — see the file comment. */
type Timing = 'live' | 'publish' | 'save';

type Editor = {
    lang: Lang;
    setLang: (l: Lang) => void;
    device: PageEditorDevice;
    /** A drafted field changed: counts towards "Veröffentlichen". */
    draft: (key: string) => void;
    /** A live field changed: saved now, says so in the top bar. */
    live: (what: string) => void;
};
const EditorContext = createContext<Editor | null>(null);
function useEditor(): Editor {
    const ctx = useContext(EditorContext);
    if (!ctx) throw new Error('useEditor outside WebsiteEditor');
    return ctx;
}

const SYSTEM_PAGES: { id: SystemId; label: string; icon: LucideIcon }[] = [
    { id: 'catalog', label: 'Kurskatalog', icon: Library },
    { id: 'course', label: 'Kursseite', icon: BookOpen },
    { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
];
const PARTS: { id: PartId; label: string; icon: LucideIcon; moved: boolean }[] = [
    { id: 'header', label: 'Kopfzeile', icon: PanelTop, moved: false },
    { id: 'footer', label: 'Fußzeile', icon: PanelBottom, moved: false },
    { id: 'cookie', label: 'Cookie-Banner', icon: Cookie, moved: true },
];

const page = (id: string) => PAGES.find((p) => p.id === id)!;

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------

function TimingBadge({ timing }: { timing: Timing }) {
    if (timing === 'live')
        return (
            <Badge tone="success" dot>
                Sofort live
            </Badge>
        );
    if (timing === 'save')
        return (
            <Badge tone="neutral" dot>
                Mit Speichern
            </Badge>
        );
    return (
        <Badge tone="muted" dot>
            Mit Veröffentlichen
        </Badge>
    );
}

/** One inspector section: a small heading, when its changes reach visitors, a hint. */
function Section({
    title,
    timing,
    hint,
    children,
}: {
    title: string;
    timing?: Timing;
    hint?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3 border-b border-border px-4 py-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {title}
                </h3>
                {timing && <TimingBadge timing={timing} />}
            </div>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            {children}
        </section>
    );
}

function Field({
    id,
    label,
    hint,
    children,
}: {
    id: string;
    label: string;
    hint?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

function SwitchRow({
    id,
    label,
    hint,
    checked,
    onCheckedChange,
}: {
    id: string;
    label: string;
    hint?: ReactNode;
    checked: boolean;
    onCheckedChange: (on: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
                {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}

/** A note on a tint. Text on a tint uses the tint-foreground token. */
function Note({
    tone,
    icon: Icon,
    title,
    children,
}: {
    tone: 'warning' | 'success' | 'muted' | 'destructive';
    icon: LucideIcon;
    title?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'flex gap-2 rounded-md border p-3 text-xs',
                tone === 'warning' &&
                    'border-warning/40 bg-warning/10 text-warning-tint-foreground',
                tone === 'success' &&
                    'border-success/30 bg-success/10 text-success-tint-foreground',
                tone === 'destructive' &&
                    'border-destructive/30 bg-destructive/10 text-destructive-tint-foreground',
                tone === 'muted' && 'border-border bg-muted/40 text-muted-foreground',
            )}
        >
            <Icon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <div className="flex flex-col gap-0.5">
                {title && <p className="font-semibold">{title}</p>}
                <div>{children}</div>
            </div>
        </div>
    );
}

/** Per-language fields. The language is the editor's — switching it also switches the canvas. */
function LangTabs({
    label,
    filled,
    children,
}: {
    label: string;
    filled: Record<Lang, boolean>;
    children: (lang: Lang) => ReactNode;
}) {
    const { lang, setLang } = useEditor();
    return (
        <Tabs value={lang} onValueChange={(v) => setLang(v as Lang)} className="gap-3">
            <TabsList aria-label={label}>
                {LANGS.map((l) => (
                    <TabsTrigger key={l} value={l} className="px-3">
                        {LANG_NAME[l]}
                        {!filled[l] && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                leer
                            </span>
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>
            {LANGS.map((l) => (
                <TabsContent key={l} value={l} className="flex flex-col gap-3">
                    {children(l)}
                </TabsContent>
            ))}
        </Tabs>
    );
}

/** The few formatting buttons of the rich-text field (mock). */
function RichTextToolbar({ label }: { label: string }) {
    return (
        <div
            role="toolbar"
            aria-label={label}
            className="mb-1 flex items-center gap-0.5 rounded-lg border border-input bg-muted/40 p-1"
        >
            <IconButton label="Zwischenüberschrift" icon={<Heading2 aria-hidden="true" />} />
            <IconButton label="Fett" icon={<Bold aria-hidden="true" />} />
            <IconButton label="Kursiv" icon={<Italic aria-hidden="true" />} />
            <IconButton label="Liste" icon={<List aria-hidden="true" />} />
            <IconButton label="Link" icon={<LinkIcon aria-hidden="true" />} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// The navigator (left)
// ---------------------------------------------------------------------------

function NavGroup({
    id,
    label,
    count,
    open,
    onToggle,
    children,
}: {
    id: GroupId;
    label: string;
    count?: number;
    open: boolean;
    onToggle: (id: GroupId) => void;
    children: ReactNode;
}) {
    const contentId = `nav-group-${id}`;
    return (
        <div className="flex flex-col gap-0.5">
            <button
                type="button"
                aria-expanded={open}
                aria-controls={contentId}
                onClick={() => onToggle(id)}
                className="flex h-8 w-full items-center gap-1.5 rounded-md px-2 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
            >
                {open ? (
                    <ChevronDown aria-hidden="true" className="size-3.5" />
                ) : (
                    <ChevronRight aria-hidden="true" className="size-3.5" />
                )}
                <span className="flex-1">{label}</span>
                {count !== undefined && <span className="font-normal tabular-nums">{count}</span>}
            </button>
            {open && (
                <div id={contentId} className="flex flex-col gap-0.5">
                    {children}
                </div>
            )}
        </div>
    );
}

function NewMark({ show }: { show: boolean }) {
    // Only in the review story: marks what moved in from Website-Inhalte.
    return show ? <Badge tone="faint">neu</Badge> : null;
}

function DraftDot({ show }: { show: boolean }) {
    return show ? (
        <span className="flex size-2 shrink-0 rounded-full bg-warning">
            <span className="sr-only">Nicht veröffentlichte Änderungen</span>
        </span>
    ) : null;
}

function NavigatorPanel({
    sel,
    onSelect,
    open,
    onToggle,
    showMoved,
    articlesOn,
    onArticlesOn,
    emptyLegal,
}: {
    sel: Sel;
    onSelect: (s: Sel) => void;
    open: Record<GroupId, boolean>;
    onToggle: (id: GroupId) => void;
    showMoved: boolean;
    articlesOn: boolean;
    onArticlesOn: (on: boolean) => void;
    emptyLegal: LegalId[];
}) {
    const id = useId();
    const [notice, setNotice] = useState(showMoved);
    const is = (s: Sel) =>
        s.kind === sel.kind &&
        ('id' in s && 'id' in sel ? s.id === sel.id : !('id' in s) && !('id' in sel));

    const blockOwner =
        sel.kind === 'page'
            ? { blocks: page(sel.id).blocks, block: sel.block, kind: 'page' as const }
            : sel.kind === 'article'
              ? { blocks: article(sel.id).blocks, block: sel.block, kind: 'article' as const }
              : null;

    return (
        <Sidebar
            label="Seiten und Bereiche"
            defaultWidth={268}
            resize={{
                label: 'Navigator verbreitern oder verschmälern',
                storageKey: 'storybook.page.website-editor.nav',
                minWidth: 230,
            }}
        >
            <SidebarHeader className="h-12 flex-row items-center gap-2 border-b border-sidebar-border px-2 py-0">
                <IconButton label="Editor schließen" icon={<X aria-hidden="true" />} />
                <span className="font-semibold">Website-Editor</span>
            </SidebarHeader>
            <SidebarContent>
                {notice && (
                    // MOCK-ONLY: a one-time hint after the move; nothing records "seen" today.
                    <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                        <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold">„Website-Inhalte“ ist jetzt hier</p>
                            <p className="text-muted-foreground">
                                Artikel, Rechtliches, Cookie-Banner und die Website-Einstellungen
                                bearbeitest du jetzt im Editor.
                            </p>
                        </div>
                        <IconButton
                            label="Hinweis schließen"
                            icon={<X aria-hidden="true" />}
                            className="size-6"
                            onClick={() => setNotice(false)}
                        />
                    </div>
                )}

                <NavGroup id="theme" label="Theme" count={1} open={open.theme} onToggle={onToggle}>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                active={is({ kind: 'theme' })}
                                onClick={() => onSelect({ kind: 'theme' })}
                            >
                                <Palette aria-hidden="true" />
                                <span className="flex-1">Dein Theme</span>
                                <Badge tone="success">LIVE</Badge>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </NavGroup>

                <NavGroup
                    id="pages"
                    label="Deine Seiten"
                    count={PAGES.length}
                    open={open.pages}
                    onToggle={onToggle}
                >
                    <SidebarMenu>
                        {PAGES.map((p) => (
                            <SidebarMenuItem key={p.id}>
                                <SidebarMenuButton
                                    active={is({ kind: 'page', id: p.id })}
                                    onClick={() => onSelect({ kind: 'page', id: p.id })}
                                >
                                    {p.kind === 'home' ? (
                                        <House aria-hidden="true" />
                                    ) : p.kind === 'contact' ? (
                                        <Mail aria-hidden="true" />
                                    ) : (
                                        <FileText aria-hidden="true" />
                                    )}
                                    <span className="flex-1 truncate">{p.title}</span>
                                    <NewMark show={showMoved && p.moved} />
                                    {!p.published && (
                                        <span className="text-xs text-muted-foreground">
                                            nicht veröffentlicht
                                        </span>
                                    )}
                                    <DraftDot show={p.draft} />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        <SidebarMenuItem>
                            <SidebarMenuButton className="text-muted-foreground">
                                <Plus aria-hidden="true" />
                                Seite hinzufügen
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </NavGroup>

                <NavGroup
                    id="articles"
                    label="Artikel"
                    count={ARTICLES.length}
                    open={open.articles}
                    onToggle={onToggle}
                >
                    {/* The section's own on/off switch, at the top of its group.
                        `articles_enabled` gates /knowledge (404 when off), so it is
                        live at once, like the other main switches. */}
                    <div className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1.5">
                        <div className="min-w-0">
                            <Label htmlFor={`${id}-articles`} className="text-sm">
                                Wissen auf der Website
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {articlesOn
                                    ? 'An · sofort live'
                                    : 'Aus · /knowledge ist nicht erreichbar'}
                            </p>
                        </div>
                        <Switch
                            id={`${id}-articles`}
                            checked={articlesOn}
                            onCheckedChange={onArticlesOn}
                        />
                    </div>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                active={is({ kind: 'knowledge' })}
                                onClick={() => onSelect({ kind: 'knowledge' })}
                            >
                                <Library aria-hidden="true" />
                                <span className="flex-1">Übersicht „Wissen“</span>
                                <NewMark show={showMoved} />
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {ARTICLES.map((a) => (
                            <SidebarMenuItem key={a.id}>
                                <SidebarMenuButton
                                    active={is({ kind: 'article', id: a.id })}
                                    onClick={() => onSelect({ kind: 'article', id: a.id })}
                                    // `h-8` fits one line; the status line needs two.
                                    style={{ height: 'auto' }}
                                    className="items-start py-1.5"
                                >
                                    <Newspaper aria-hidden="true" className="mt-0.5" />
                                    <span className="flex min-w-0 flex-1 flex-col">
                                        <span className="truncate">{a.title.de}</span>
                                        <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    'size-1.5 rounded-full',
                                                    a.status === 'live' && 'bg-success',
                                                    a.status === 'scheduled' && 'bg-warning',
                                                    a.status === 'draft' && 'bg-muted-foreground',
                                                )}
                                            />
                                            <span className="truncate">
                                                {ARTICLE_STATUS[a.status].label}
                                                {a.status === 'scheduled'
                                                    ? ` ab ${a.date}`
                                                    : ''} ·{' '}
                                                <span className="sr-only">geändert </span>
                                                {a.updated}
                                            </span>
                                        </span>
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                        <SidebarMenuItem>
                            <SidebarMenuButton className="text-muted-foreground">
                                <Plus aria-hidden="true" />
                                Neuer Artikel
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </NavGroup>

                <NavGroup
                    id="system"
                    label="Aus deinen Daten erzeugt"
                    count={SYSTEM_PAGES.length}
                    open={open.system}
                    onToggle={onToggle}
                >
                    <SidebarMenu>
                        {SYSTEM_PAGES.map((s) => (
                            <SidebarMenuItem key={s.id}>
                                <SidebarMenuButton
                                    active={is({ kind: 'system', id: s.id })}
                                    onClick={() => onSelect({ kind: 'system', id: s.id })}
                                >
                                    <s.icon aria-hidden="true" />
                                    <span className="flex-1">{s.label}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </NavGroup>

                <NavGroup
                    id="legal"
                    label="Rechtliches"
                    count={LEGAL.length}
                    open={open.legal}
                    onToggle={onToggle}
                >
                    <p className="px-2 text-xs text-muted-foreground">
                        Pflichtseiten: bearbeitbar, aber sie können nicht gelöscht oder ausgeblendet
                        werden.
                    </p>
                    <SidebarMenu>
                        {LEGAL.map((l) => (
                            <SidebarMenuItem key={l.id}>
                                <SidebarMenuButton
                                    active={is({ kind: 'legal', id: l.id })}
                                    onClick={() => onSelect({ kind: 'legal', id: l.id })}
                                >
                                    <Scale aria-hidden="true" />
                                    <span className="flex-1 truncate">{l.title}</span>
                                    <NewMark show={showMoved} />
                                    {emptyLegal.includes(l.id) && (
                                        <Badge tone={l.requiredForPublicSite ? 'warning' : 'muted'}>
                                            leer
                                        </Badge>
                                    )}
                                    <Lock aria-hidden="true" className="text-muted-foreground" />
                                    <span className="sr-only">, kann nicht gelöscht werden</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </NavGroup>

                {/* MOCK-ONLY: the real group is "Kopf- und Fußzeile" with two
                    entries; renamed because the cookie banner joins it. */}
                <NavGroup
                    id="parts"
                    label="Auf jeder Seite"
                    count={PARTS.length}
                    open={open.parts}
                    onToggle={onToggle}
                >
                    <SidebarMenu>
                        {PARTS.map((p) => (
                            <SidebarMenuItem key={p.id}>
                                <SidebarMenuButton
                                    active={is({ kind: 'part', id: p.id })}
                                    onClick={() => onSelect({ kind: 'part', id: p.id })}
                                >
                                    <p.icon aria-hidden="true" />
                                    <span className="flex-1">{p.label}</span>
                                    <NewMark show={showMoved && p.moved} />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </NavGroup>

                {blockOwner && blockOwner.blocks.length > 0 && (
                    <Layers
                        blocks={blockOwner.blocks}
                        selected={blockOwner.block}
                        onSelect={(block) =>
                            onSelect(
                                sel.kind === 'page'
                                    ? { kind: 'page', id: sel.id, block }
                                    : sel.kind === 'article'
                                      ? { kind: 'article', id: sel.id, block }
                                      : sel,
                            )
                        }
                    />
                )}
            </SidebarContent>
            <SidebarFooter className="gap-0.5 px-2 py-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        {/* MOCK-ONLY: the editor has no site-settings entry today. */}
                        <SidebarMenuButton
                            active={sel.kind === 'settings'}
                            onClick={() => onSelect({ kind: 'settings' })}
                        >
                            <Settings2 aria-hidden="true" />
                            <span className="flex-1">Website-Einstellungen</span>
                            <NewMark show={showMoved} />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <History aria-hidden="true" />
                            Verlauf
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

/** The sections of the selected page or article, as in the real editor's layer list. */
function Layers({
    blocks,
    selected,
    onSelect,
}: {
    blocks: Block[];
    selected?: string;
    onSelect: (id: string) => void;
}) {
    return (
        <div
            role="group"
            aria-label="Abschnitte dieser Seite"
            className="flex flex-col gap-1 border-t border-sidebar-border pt-2"
        >
            <div className="flex items-center justify-between px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Abschnitte
                <span className="font-normal tabular-nums">{blocks.length}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-2 py-1.5 text-sm text-muted-foreground">
                <PanelTop aria-hidden="true" className="size-4" />
                <span className="flex-1">Kopfbereich</span>
                <Lock aria-hidden="true" className="size-3.5" />
            </div>
            <ul className="flex flex-col gap-1">
                {blocks.map((b) => {
                    const Icon = BLOCK_ICON[b.type];
                    return (
                        <li key={b.id}>
                            <button
                                type="button"
                                aria-pressed={selected === b.id}
                                onClick={() => onSelect(b.id)}
                                className={cn(
                                    'flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                                    selected === b.id
                                        ? 'border-primary bg-card font-medium'
                                        : 'border-border bg-card hover:bg-sidebar-accent',
                                )}
                            >
                                <GripVertical
                                    aria-hidden="true"
                                    className="size-4 text-muted-foreground"
                                />
                                <Icon aria-hidden="true" className="size-4" />
                                <span
                                    className={cn(
                                        'flex-1 truncate',
                                        !b.visible && 'text-muted-foreground',
                                    )}
                                >
                                    {BLOCK_LABEL[b.type]}
                                </span>
                                {!b.visible && (
                                    <>
                                        <EyeOff
                                            aria-hidden="true"
                                            className="size-3.5 text-muted-foreground"
                                        />
                                        <span className="sr-only">(ausgeblendet)</span>
                                    </>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
            <Button variant="outline" size="sm" className="justify-start">
                <Plus aria-hidden="true" />
                Abschnitt hinzufügen
            </Button>
            <div className="flex items-center gap-2 rounded-md border border-dashed border-border px-2 py-1.5 text-sm text-muted-foreground">
                <PanelBottom aria-hidden="true" className="size-4" />
                <span className="flex-1">Fußbereich</span>
                <Lock aria-hidden="true" className="size-3.5" />
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// The site on the canvas (middle) — a lookalike, not the real frame
// ---------------------------------------------------------------------------

type SiteState = {
    search: boolean;
    articlesOn: boolean;
    threshold: number;
    cardLayout: 'standard' | 'split';
    social: Record<string, string>;
    cookieBanner: boolean;
    bannerHeading: Tr;
    bannerBody: Tr;
};

const BANNER_DEFAULT = tr('Deine Entscheidung über Cookies', 'Your choice about cookies');
const BANNER_BODY_DEFAULT = tr(
    'Wir speichern nur das, was diese Seite zum Funktionieren braucht. Manche Inhalte stammen von anderen Unternehmen und würden eigene Cookies setzen — deshalb fragen wir dich vorher.',
    'We only store what this site needs to work. Some content comes from other companies that would set their own cookies — so we ask you first.',
);

function SiteHeader({ site }: { site: SiteState }) {
    const { device, lang } = useEditor();
    const phone = device === 'phone';
    return (
        <header className="flex items-center gap-4 border-b border-border px-6 py-3 text-sm">
            <span className="font-semibold">{SCHOOL}</span>
            {site.search && !phone && (
                <span className="flex h-8 max-w-sm flex-1 items-center gap-2 rounded-md border border-border px-2 text-xs text-muted-foreground">
                    <Search aria-hidden="true" className="size-3.5" />
                    <span className="flex-1">
                        {lang === 'de'
                            ? 'Kurse, Lehrkräfte, Seiten …'
                            : 'Courses, teachers, pages …'}
                    </span>
                    <kbd className="font-mono">⌘K</kbd>
                </span>
            )}
            <nav
                aria-label="Website-Navigation (Vorschau)"
                className="ml-auto flex items-center gap-4 text-xs"
            >
                {!phone && (
                    <>
                        <span>{lang === 'de' ? 'Kurse' : 'Courses'}</span>
                        {site.articlesOn && <span>{lang === 'de' ? 'Wissen' : 'Knowledge'}</span>}
                        <span>{lang === 'de' ? 'Über uns' : 'About us'}</span>
                        <span>{lang === 'de' ? 'Kontakt' : 'Contact'}</span>
                    </>
                )}
                {phone && site.search && <Search aria-hidden="true" className="size-4" />}
                <span className="rounded-md bg-foreground px-2.5 py-1 text-background">
                    {lang === 'de' ? 'Anmelden' : 'Sign in'}
                </span>
            </nav>
        </header>
    );
}

function SiteFooter({ site }: { site: SiteState }) {
    const { device, lang } = useEditor();
    const socials = SOCIAL.filter((s) => site.social[s.key]);
    return (
        <footer
            className={cn(
                'grid gap-6 border-t border-border bg-muted/40 px-6 py-6 text-xs',
                device === 'phone' ? 'grid-cols-1' : 'grid-cols-3',
            )}
        >
            <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">{SCHOOL}</span>
                <span className="text-muted-foreground">
                    {lang === 'de'
                        ? 'Lernen mit Struktur, Begleitung und einer Gemeinschaft.'
                        : 'Learning with structure, guidance and a community.'}
                </span>
                {socials.length > 0 && (
                    <span className="flex flex-wrap gap-1.5">
                        {socials.map((s) => (
                            <span
                                key={s.key}
                                className="rounded border border-border px-1.5 py-0.5"
                            >
                                {s.label}
                            </span>
                        ))}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-1">
                <span className="font-semibold tracking-wide text-muted-foreground uppercase">
                    Navigation
                </span>
                <span>{lang === 'de' ? 'Kurse' : 'Courses'}</span>
                {site.articlesOn && <span>{lang === 'de' ? 'Wissen' : 'Knowledge'}</span>}
                <span>{lang === 'de' ? 'Über uns' : 'About us'}</span>
                <span>{lang === 'de' ? 'Kontakt' : 'Contact'}</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="font-semibold tracking-wide text-muted-foreground uppercase">
                    {lang === 'de' ? 'Rechtliches' : 'Legal'}
                </span>
                <span>Impressum</span>
                <span>{lang === 'de' ? 'Datenschutz' : 'Privacy'}</span>
                <span>{lang === 'de' ? 'Barrierefreiheit' : 'Accessibility'}</span>
                {site.cookieBanner && (
                    <span>{lang === 'de' ? 'Cookie-Einstellungen' : 'Cookie settings'}</span>
                )}
            </div>
        </footer>
    );
}

function Scarcity({ c, threshold }: { c: Course; threshold: number }) {
    const { lang } = useEditor();
    if (c.seatsLeft === null) return null;
    if (c.seatsLeft === 0)
        return <Badge tone="muted">{lang === 'de' ? 'Ausgebucht' : 'Fully booked'}</Badge>;
    if (c.seatsLeft <= threshold)
        return (
            <Badge tone="warning">
                {lang === 'de'
                    ? `Nur noch ${c.seatsLeft} ${c.seatsLeft === 1 ? 'Platz' : 'Plätze'}`
                    : `Only ${c.seatsLeft} left`}
            </Badge>
        );
    return <Badge tone="faint">{lang === 'de' ? 'Plätze frei' : 'Places available'}</Badge>;
}

function CourseCard({ c, site }: { c: Course; site: SiteState }) {
    return (
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
            {site.cardLayout === 'standard' && (
                <div aria-hidden="true" className="aspect-video bg-muted" />
            )}
            <div className="flex flex-1 flex-col gap-1 p-3">
                <span className="text-xs text-muted-foreground">{c.run}</span>
                <span className="text-sm font-semibold">{c.title}</span>
                <span className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="text-sm font-medium">{c.price}</span>
                    <Scarcity c={c} threshold={site.threshold} />
                </span>
            </div>
        </div>
    );
}

/** A block on the canvas: click selects it; the selected one is outlined and named. */
function CanvasBlock({
    block,
    selected,
    onSelect,
    children,
}: {
    block: Block;
    selected: boolean;
    onSelect?: () => void;
    children: ReactNode;
}) {
    if (!block.visible) return null;
    return (
        <div
            data-block={block.id}
            className={cn('relative', selected && 'ring-2 ring-primary ring-inset')}
        >
            {children}
            {/* Over the block, like a click into the real frame; the layer list
                on the left is the keyboard way to the same selection. */}
            {onSelect && !selected && (
                <button
                    type="button"
                    aria-label={`Abschnitt „${BLOCK_LABEL[block.type]}“ bearbeiten`}
                    onClick={onSelect}
                    className="absolute inset-0 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                />
            )}
            {selected && (
                <span className="absolute top-2 left-2 z-10 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                    {BLOCK_LABEL[block.type]}
                </span>
            )}
        </div>
    );
}

function Hero({ title, text }: { title: string; text: string }) {
    return (
        <section className="flex flex-col gap-3 bg-muted/40 px-8 py-12">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="max-w-prose text-muted-foreground">{text}</p>
        </section>
    );
}

function Prose({ heading, children }: { heading?: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3 px-8 py-8">
            {heading && <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>}
            <div className="flex max-w-prose flex-col gap-3 leading-relaxed text-muted-foreground">
                {children}
            </div>
        </section>
    );
}

function CourseGrid({ heading, ids, site }: { heading: string; ids: number[]; site: SiteState }) {
    const { device } = useEditor();
    return (
        <section className="flex flex-col gap-4 px-8 py-8">
            <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
            <div className={cn('grid gap-3', device === 'phone' ? 'grid-cols-1' : 'grid-cols-3')}>
                {ids.map((id) => (
                    <CourseCard key={id} c={course(id)} site={site} />
                ))}
            </div>
        </section>
    );
}

function ArticleCards({ site }: { site: SiteState }) {
    const { lang, device } = useEditor();
    if (!site.articlesOn)
        return (
            <section className="px-8 py-6">
                <p className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Dieser Abschnitt erscheint nicht, solange „Wissen auf der Website“ aus ist.
                </p>
            </section>
        );
    return (
        <section className="flex flex-col gap-4 px-8 py-8">
            <h2 className="text-xl font-semibold tracking-tight">
                {lang === 'de' ? 'Aus unserem Wissen' : 'From our knowledge base'}
            </h2>
            <div className={cn('grid gap-3', device === 'phone' ? 'grid-cols-1' : 'grid-cols-2')}>
                {ARTICLES.filter((a) => a.status === 'live').map((a) => (
                    <div
                        key={a.id}
                        className="flex flex-col gap-1 rounded-lg border border-border p-3"
                    >
                        <span className="text-xs text-muted-foreground">{a.topic}</span>
                        <span className="text-sm font-semibold">{a.title[lang] || a.title.de}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function HomeBody({
    site,
    featured,
    featuredHeading,
    selected,
    onSelectBlock,
}: {
    site: SiteState;
    featured: number[];
    featuredHeading: Tr;
    selected?: string;
    onSelectBlock: (id: string) => void;
}) {
    const { lang } = useEditor();
    const blocks = page('home').blocks;
    const render = (b: Block) => {
        switch (b.type) {
            case 'hero':
                return (
                    <Hero
                        title={lang === 'de' ? 'Lernen, das bleibt.' : 'Learning that lasts.'}
                        text={
                            lang === 'de'
                                ? 'Arabisch, Quran, Deutsch für den Beruf — in kleinen Gruppen, online und in Berlin.'
                                : 'Arabic, Quran, German for work — in small groups, online and in Berlin.'
                        }
                    />
                );
            case 'featured_courses':
                return (
                    <CourseGrid
                        heading={featuredHeading[lang] || featuredHeading.de}
                        ids={featured}
                        site={site}
                    />
                );
            case 'text':
                return (
                    <Prose heading={lang === 'de' ? 'Warum Al-Nur?' : 'Why Al-Nur?'}>
                        <p>
                            {lang === 'de'
                                ? 'Seit 2014 lernen bei uns Kinder und Erwachsene in festen Gruppen mit derselben Lehrkraft — damit jemand merkt, wenn du hängen bleibst.'
                                : 'Since 2014 children and adults have learned with us in steady groups with the same teacher — so someone notices when you get stuck.'}
                        </p>
                    </Prose>
                );
            case 'latest_articles':
                return <ArticleCards site={site} />;
            default:
                return null;
        }
    };
    return (
        <>
            {blocks.map((b) => (
                <CanvasBlock
                    key={b.id}
                    block={b}
                    selected={selected === b.id}
                    onSelect={() => onSelectBlock(b.id)}
                >
                    {render(b)}
                </CanvasBlock>
            ))}
        </>
    );
}

function CookieBannerPreview({ site }: { site: SiteState }) {
    const { lang } = useEditor();
    if (!site.cookieBanner) return null;
    return (
        <div className="absolute inset-x-0 bottom-0 p-4">
            <div
                role="group"
                aria-label="Cookie-Banner (Vorschau)"
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-lg ring-2 ring-primary"
            >
                <span className="self-start rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                    Cookie-Banner
                </span>
                <p className="font-semibold">{site.bannerHeading[lang] || BANNER_DEFAULT[lang]}</p>
                <p className="text-sm text-muted-foreground">
                    {site.bannerBody[lang] || BANNER_BODY_DEFAULT[lang]}
                </p>
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded-md bg-foreground px-3 py-1.5 text-background">
                        {lang === 'de' ? 'Alle akzeptieren' : 'Accept all'}
                    </span>
                    <span className="rounded-md border border-border px-3 py-1.5">
                        {lang === 'de' ? 'Nur das Nötigste' : 'Essentials only'}
                    </span>
                    <span className="rounded-md px-3 py-1.5 underline">
                        {lang === 'de' ? 'Einzeln auswählen' : 'Choose individually'}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Inspectors (right) and their canvases, one per kind of selection
// ---------------------------------------------------------------------------

type Pane = {
    title: string;
    badge: string;
    canvas: ReactNode;
    inspector: ReactNode;
    footer?: ReactNode;
    path?: string;
};

/** Website-Einstellungen: the main switches, SEO defaults, the seat display. */
function useSettingsPane(site: SiteState, setSite: (p: Partial<SiteState>) => void): Pane {
    const id = useId();
    const { lang, live, draft, device } = useEditor();
    const [publicOn, setPublicOn] = useState(true);
    const [confirmOff, setConfirmOff] = useState(false);
    const [discover, setDiscover] = useState(true);
    const [seoTitle, setSeoTitle] = useState(
        tr('Al-Nur Akademie — Arabisch, Quran und Deutsch in Berlin', ''),
    );
    const [seoDesc, setSeoDesc] = useState(
        tr(
            'Kurse in kleinen Gruppen, online und in Berlin-Neukölln. Für Kinder und Erwachsene, mit fester Lehrkraft.',
            '',
        ),
    );

    const canvas = (
        <div className="flex flex-col gap-8 px-8 py-8">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Wo diese Einstellungen wirken
            </p>
            <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                    So erscheint eine Seite ohne eigene Angaben in Suchmaschinen
                </p>
                <div className="flex flex-col gap-1 rounded-lg border border-border p-4">
                    <span className="text-xs text-muted-foreground">al-nur-akademie.de</span>
                    <span className="text-lg font-medium underline">
                        {seoTitle[lang] || seoTitle.de}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {seoDesc[lang] || seoDesc.de}
                    </span>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                    Kopfzeile — {site.search ? 'mit' : 'ohne'} Suchleiste
                </p>
                <div className="overflow-hidden rounded-lg border border-border">
                    <SiteHeader site={site} />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                    Kurskarten — im Katalog, auf der Startseite und auf jeder Seite mit Kursen
                </p>
                <div
                    className={cn('grid gap-3', device === 'phone' ? 'grid-cols-1' : 'grid-cols-3')}
                >
                    {[1, 4, 2].map((c) => (
                        <CourseCard key={c} c={course(c)} site={site} />
                    ))}
                </div>
            </div>
        </div>
    );

    const inspector = (
        <>
            {/* LIVE AT ONCE. All three gate whole routes today and 404 when off
                (`public_site_enabled` the marketing site, `discover_enabled` via
                EnsureDiscoverEnabled, `search_bar_enabled` the /search routes),
                and the public render path reads live columns only (ADR-0142).
                A drafted gate would preview a search box whose endpoint still
                404s. Same as today: an immediate save on the settings form. */}
            <Section
                title="Hauptschalter"
                timing="live"
                hint="Diese Schalter öffnen oder schließen ganze Bereiche. Sie gelten sofort, nicht erst beim Veröffentlichen."
            >
                <SwitchRow
                    id={`${id}-public`}
                    label="Website öffentlich"
                    hint="Besucher:innen erreichen deine öffentlichen Seiten."
                    checked={publicOn}
                    onCheckedChange={(on) => {
                        if (!on) return setConfirmOff(true);
                        setPublicOn(true);
                        live('Website ist öffentlich');
                    }}
                />
                {/* The guard in UpdateMarketingSettings: the site cannot go public
                    while Impressum or Datenschutz is empty. Shown, not just refused. */}
                <ul className="flex flex-col gap-1 rounded-md bg-muted/40 px-3 py-2 text-xs">
                    <li className="text-muted-foreground">
                        Voraussetzung, damit die Website öffentlich sein kann:
                    </li>
                    {LEGAL.filter((l) => l.requiredForPublicSite).map((l) => (
                        <li key={l.id} className="flex items-center gap-1.5">
                            <Check aria-hidden="true" className="size-3.5" />
                            {l.title} ausgefüllt
                        </li>
                    ))}
                </ul>
                <SwitchRow
                    id={`${id}-discover`}
                    label="Entdecken"
                    hint="Angemeldete Schüler:innen sehen in ihrer Übersicht den Katalog „Entdecken“. Betrifft nicht die öffentliche Website."
                    checked={discover}
                    onCheckedChange={(on) => {
                        setDiscover(on);
                        live(on ? 'Entdecken ist an' : 'Entdecken ist aus');
                    }}
                />
                <SwitchRow
                    id={`${id}-search`}
                    label="Suchleiste"
                    hint="Besucher:innen durchsuchen Kurse, Lehrkräfte, Seiten und Rechtstexte — auch mit ⌘K."
                    checked={site.search}
                    onCheckedChange={(on) => {
                        setSite({ search: on });
                        live(on ? 'Suchleiste ist an' : 'Suchleiste ist aus');
                    }}
                />
            </Section>

            {/* LIVE AT ONCE. Text metadata, not something the canvas shows; the
                Design AGENTS.md lists "a page's title, slug, SEO text and
                visibility" as content that saves live, and the site-wide
                defaults are the same kind of thing. */}
            <Section
                title="SEO-Standardwerte"
                timing="live"
                hint="Gelten für jede Seite ohne eigenen Titel oder eigene Beschreibung."
            >
                <LangTabs
                    label="Sprache der SEO-Standardwerte"
                    filled={{ de: !!seoTitle.de, en: !!seoTitle.en }}
                >
                    {(l) => (
                        <>
                            <Field
                                id={`${id}-seo-title-${l}`}
                                label="Seitentitel"
                                hint={`${seoTitle[l].length} von 60 Zeichen`}
                            >
                                <Input
                                    id={`${id}-seo-title-${l}`}
                                    value={seoTitle[l]}
                                    onChange={(e) =>
                                        setSeoTitle({ ...seoTitle, [l]: e.target.value })
                                    }
                                    onBlur={() => live('SEO-Titel gespeichert')}
                                />
                            </Field>
                            <Field
                                id={`${id}-seo-desc-${l}`}
                                label="Beschreibung"
                                hint={`${seoDesc[l].length} von 160 Zeichen`}
                            >
                                <Textarea
                                    id={`${id}-seo-desc-${l}`}
                                    rows={3}
                                    value={seoDesc[l]}
                                    onChange={(e) =>
                                        setSeoDesc({ ...seoDesc, [l]: e.target.value })
                                    }
                                    onBlur={() => live('SEO-Beschreibung gespeichert')}
                                />
                            </Field>
                        </>
                    )}
                </LangTabs>
            </Section>

            {/* WITH PUBLISH. Both only change how a card LOOKS, everywhere a
                course card renders — exactly what the canvas previews.
                `course_card_layout` is already a drafted `layouts` key today.
                MOCK-ONLY: `seat_scarcity_threshold` is an immediate save on the
                settings form today; here it joins the `layouts` surface (one
                more key in LayoutsSurface::keys()) so it sits next to the card
                layout dial and is previewed before it changes every card. */}
            <Section
                title="Kurskarte"
                timing="publish"
                hint="Wie ein Kurs auf jeder Karte erscheint."
            >
                <Field id={`${id}-card`} label="Layout der Kurskarte">
                    <select
                        id={`${id}-card`}
                        className={nativeSelectClass}
                        value={site.cardLayout}
                        onChange={(e) => {
                            setSite({ cardLayout: e.target.value as SiteState['cardLayout'] });
                            draft('card_layout');
                        }}
                    >
                        <option value="standard">Standard (Bildkarte)</option>
                        <option value="split">Geteilt (Infofeld, ohne Bild)</option>
                    </select>
                </Field>
                <Field
                    id={`${id}-seats`}
                    label="Genaue Platzzahl zeigen ab"
                    hint={`Bei ${site.threshold} oder weniger freien Plätzen steht „Nur noch 3 Plätze“. Darüber steht „Plätze frei“ ohne Zahl — so bleiben deine Anmeldezahlen privat. Zwischen 1 und 100.`}
                >
                    <IntegerInput
                        id={`${id}-seats`}
                        min={1}
                        max={100}
                        value={site.threshold}
                        onValueChange={(v) => {
                            setSite({ threshold: Math.max(1, Math.min(100, v)) });
                            draft('seat_threshold');
                        }}
                        className="w-24"
                    />
                </Field>
            </Section>
            <ConfirmActionDialog
                open={confirmOff}
                onOpenChange={setConfirmOff}
                title="Website offline nehmen?"
                description="Besucher:innen erreichen deine öffentlichen Seiten dann nicht mehr — ab sofort, nicht erst beim Veröffentlichen. Angemeldete Nutzer:innen arbeiten normal weiter."
                confirmLabel="Offline nehmen"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={() => {
                    setPublicOn(false);
                    live('Website ist offline');
                }}
            />
        </>
    );
    return { title: 'Website-Einstellungen', badge: 'Website', canvas, inspector };
}

/** The Kontakt page: heading and intro in place, contact data, form fields, spam protection. */
function useContactPane(site: SiteState, setSite: (p: Partial<SiteState>) => void): Pane {
    const id = useId();
    const { lang, live, draft, device } = useEditor();
    const [heading, setHeading] = useState(tr('Schreib uns', 'Write to us'));
    const [intro, setIntro] = useState(
        tr(
            'Fragen zu einem Kurs, zu Firmenkursen oder zu deiner Rechnung? Wir antworten innerhalb von zwei Werktagen.',
            '',
        ),
    );
    const [email, setEmail] = useState('kontakt@al-nur-akademie.de');
    const [captcha, setCaptcha] = useState(true);
    const [fields, setFields] = useState(CONTACT_FIELDS);
    const [openField, setOpenField] = useState<string | null>('anliegen');

    const move = (i: number, by: -1 | 1) => {
        const next = [...fields];
        const [f] = next.splice(i, 1);
        next.splice(i + by, 0, f!);
        setFields(next);
        draft('contact_fields');
    };

    const canvas = (
        <>
            <SiteHeader site={site} />
            <section className="flex flex-col gap-3 px-8 pt-10 pb-6">
                {/* WITH PUBLISH, edited in place. MOCK-ONLY: `contact_heading` and
                    `contact_intro` save live on the settings form today; here they
                    are drafted page copy, like every heading on the home page. */}
                <InlineText
                    as="h1"
                    label="Überschrift der Kontaktseite"
                    placeholder="Wie heißt deine Kontaktseite?"
                    value={heading[lang]}
                    onChange={(v) => {
                        setHeading({ ...heading, [lang]: v });
                        draft('contact_heading');
                    }}
                    className="text-3xl font-semibold tracking-tight"
                />
                <InlineText
                    multiline
                    label="Einleitungssatz der Kontaktseite"
                    placeholder="Ein Satz unter der Überschrift (leer: eingebaute Formulierung)"
                    value={intro[lang]}
                    onChange={(v) => {
                        setIntro({ ...intro, [lang]: v });
                        draft('contact_intro');
                    }}
                    className="max-w-prose text-muted-foreground"
                />
            </section>
            <section
                className={cn(
                    'grid gap-8 px-8 pb-8',
                    device === 'phone' ? 'grid-cols-1' : 'grid-cols-3',
                )}
            >
                <div
                    aria-hidden="true"
                    className={cn(
                        'flex flex-col gap-4 rounded-lg border border-border p-5',
                        device !== 'phone' && 'col-span-2',
                    )}
                >
                    {fields.map((f) => (
                        <div key={f.key} className="flex flex-col gap-1.5 text-sm">
                            {f.type === 'consent' ? (
                                <span className="flex items-center gap-2">
                                    <span className="size-4 rounded border border-input" />
                                    {f.label}
                                </span>
                            ) : (
                                <>
                                    <span className="font-medium">
                                        {f.label}
                                        {f.required && ' *'}
                                    </span>
                                    <span
                                        className={cn(
                                            'rounded-md border border-input',
                                            f.type === 'textarea' ? 'min-h-24' : 'h-8',
                                        )}
                                    />
                                </>
                            )}
                        </div>
                    ))}
                    <span className="flex items-center justify-between gap-2">
                        <span className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background">
                            {lang === 'de' ? 'Nachricht senden' : 'Send message'}
                        </span>
                        {captcha && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ShieldCheck aria-hidden="true" className="size-3.5" />
                                {lang === 'de' ? 'Spam-Schutz aktiv' : 'Spam protection on'}
                            </span>
                        )}
                    </span>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                    <span className="font-semibold">
                        {lang === 'de' ? 'Direkt erreichen' : 'Reach us directly'}
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                        <AtSign aria-hidden="true" className="size-4" />
                        {email}
                    </span>
                    <span className="flex flex-wrap gap-1.5 text-xs">
                        {SOCIAL.filter((s) => site.social[s.key]).map((s) => (
                            <span
                                key={s.key}
                                className="rounded border border-border px-1.5 py-0.5"
                            >
                                {s.label}
                            </span>
                        ))}
                    </span>
                </div>
            </section>
            <SiteFooter site={site} />
        </>
    );

    const inspector = (
        <>
            <Section title="Überschrift und Einleitung" timing="publish">
                <Note tone="muted" icon={Pencil}>
                    Klick auf der Seite auf die Überschrift oder den Satz darunter, um sie direkt
                    dort zu ändern. Leer lassen für die eingebaute Formulierung.
                </Note>
            </Section>

            {/* WITH PUBLISH. The schema is what the form LOOKS like on /contact and
                in every contact-form block, so it is previewed on the canvas and
                applied by Publish; the submit endpoint validates against the LIVE
                schema until then, which is the ADR-0142 rule (public path reads
                live only). MOCK-ONLY: `contact_form_fields` is an immediate save
                today and would become a key of a new `contact` surface. */}
            <Section
                title="Formularfelder"
                timing="publish"
                hint="Dieselben Felder erscheinen in jedem Kontaktformular-Abschnitt deiner Seiten."
            >
                <ul className="flex flex-col gap-1.5">
                    {fields.map((f, i) => {
                        const isOpen = openField === f.key;
                        return (
                            <li key={f.key} className="rounded-md border border-border bg-card">
                                <div className="flex items-center gap-1 py-1 pr-1 pl-2">
                                    <button
                                        type="button"
                                        aria-expanded={isOpen}
                                        onClick={() => setOpenField(isOpen ? null : f.key)}
                                        className="flex min-w-0 flex-1 flex-col items-start rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <span className="w-full truncate text-sm font-medium">
                                            {f.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {FIELD_TYPE[f.type]}
                                            {f.required ? ' · Pflicht' : ''}
                                        </span>
                                    </button>
                                    <IconButton
                                        label={`„${f.label}“ nach oben`}
                                        icon={<ArrowUp aria-hidden="true" />}
                                        disabled={i === 0}
                                        onClick={() => move(i, -1)}
                                    />
                                    <IconButton
                                        label={`„${f.label}“ nach unten`}
                                        icon={<ArrowDown aria-hidden="true" />}
                                        disabled={i === fields.length - 1}
                                        onClick={() => move(i, 1)}
                                    />
                                    <IconButton
                                        label={`„${f.label}“ entfernen`}
                                        icon={<Trash2 aria-hidden="true" />}
                                        destructive
                                        disabled={f.type === 'email'}
                                        onClick={() => {
                                            setFields(fields.filter((x) => x.key !== f.key));
                                            draft('contact_fields');
                                        }}
                                    />
                                </div>
                                {isOpen && (
                                    <div className="flex flex-col gap-3 border-t border-border p-3">
                                        <Field id={`${id}-f-${f.key}-label`} label="Beschriftung">
                                            <Input
                                                id={`${id}-f-${f.key}-label`}
                                                value={f.label}
                                                onChange={(e) => {
                                                    setFields(
                                                        fields.map((x) =>
                                                            x.key === f.key
                                                                ? { ...x, label: e.target.value }
                                                                : x,
                                                        ),
                                                    );
                                                    draft('contact_fields');
                                                }}
                                            />
                                        </Field>
                                        <Field id={`${id}-f-${f.key}-type`} label="Art">
                                            <select
                                                id={`${id}-f-${f.key}-type`}
                                                className={nativeSelectClass}
                                                value={f.type}
                                                onChange={() => draft('contact_fields')}
                                            >
                                                {Object.entries(FIELD_TYPE).map(([v, l]) => (
                                                    <option key={v} value={v}>
                                                        {l}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                        {f.options && (
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-sm font-medium">
                                                    Auswahlmöglichkeiten
                                                </span>
                                                {f.options.map((o, n) => (
                                                    <Input
                                                        key={o}
                                                        aria-label={`Auswahl ${n + 1}`}
                                                        defaultValue={o}
                                                    />
                                                ))}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start"
                                                >
                                                    <Plus aria-hidden="true" />
                                                    Auswahl hinzufügen
                                                </Button>
                                            </div>
                                        )}
                                        <SwitchRow
                                            id={`${id}-f-${f.key}-req`}
                                            label="Pflichtfeld"
                                            checked={f.required}
                                            onCheckedChange={() => draft('contact_fields')}
                                        />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
                <Button variant="outline" size="sm" className="justify-start">
                    <Plus aria-hidden="true" />
                    Feld hinzufügen
                </Button>
            </Section>

            {/* LIVE AT ONCE. A defence on an unauthenticated endpoint
                (ContactCaptchaHealthCheck); switching it must never wait behind
                an unrelated draft, and switching it back on must never be
                "pending". Today's immediate save, kept. */}
            <Section title="Spam-Schutz" timing="live">
                <SwitchRow
                    id={`${id}-captcha`}
                    label="Spam-Schutz im Kontaktformular"
                    hint="Der Browser löst vor dem Absenden eine kleine Rechenaufgabe — auf deiner eigenen Seite, ohne Dritte. Fallenfeld und Anfragelimit bleiben immer aktiv."
                    checked={captcha}
                    onCheckedChange={(on) => {
                        setCaptcha(on);
                        live(on ? 'Spam-Schutz ist an' : 'Spam-Schutz ist aus');
                    }}
                />
            </Section>

            {/* LIVE AT ONCE. Where enquiries are DELIVERED — routing the server
                reads per request (ContactRecipient, ContactRecipientHealthCheck),
                not something the canvas shows. A drafted address would mean
                mail still goes to the old one while the admin sees the new. */}
            <Section title="Empfang" timing="live">
                <Field
                    id={`${id}-email`}
                    label="Öffentliche Kontakt-E-Mail"
                    hint="Hierhin gehen die Nachrichten aus dem Formular. Sie steht auch auf der Seite."
                >
                    <Input
                        id={`${id}-email`}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => live('Kontakt-E-Mail gespeichert')}
                    />
                </Field>
            </Section>

            {/* WITH PUBLISH. Shown in the footer and on this page — chrome-like
                content, the same kind as `footer_links`, which #1630 phase C
                moved into the drafted `chrome` surface. MOCK-ONLY: `social_links`
                is an immediate save today. */}
            <Section
                title="Social Media"
                timing="publish"
                hint="Erscheinen hier und in der Fußzeile."
            >
                {SOCIAL.map((s) => (
                    <Field key={s.key} id={`${id}-social-${s.key}`} label={s.label}>
                        <Input
                            id={`${id}-social-${s.key}`}
                            type="url"
                            placeholder="https://"
                            value={site.social[s.key] ?? ''}
                            onChange={(e) => {
                                setSite({ social: { ...site.social, [s.key]: e.target.value } });
                                draft(`social_${s.key}`);
                            }}
                        />
                    </Field>
                ))}
            </Section>
        </>
    );
    return { title: 'Kontakt', badge: 'Seite', canvas, inspector, path: '/contact' };
}

/** One knowledge article: the article on the canvas, its settings in the inspector. */
function useArticlePane(site: SiteState, articleId: number, onDeleted: () => void): Pane {
    const id = useId();
    const { lang } = useEditor();
    const a = article(articleId);
    const [date, setDate] = useState(a.date ? '2026-09-12T09:00' : '');
    const [slug, setSlug] = useState(a.slug);
    const [excerpt, setExcerpt] = useState(a.excerpt);
    const [author, setAuthor] = useState(a.author ?? '');
    const [topic, setTopic] = useState(a.topic ?? '');
    const [dirty, setDirty] = useState(false);
    const [saved, setSaved] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const change = () => {
        setDirty(true);
        setSaved(false);
    };

    const canvas = (
        <>
            <SiteHeader site={site} />
            <article className="flex flex-col gap-4 px-8 py-10">
                <span className="text-xs text-muted-foreground">
                    {lang === 'de' ? 'Wissen' : 'Knowledge'} · {topic}
                </span>
                <h1 className="text-3xl font-semibold tracking-tight">
                    {a.title[lang] || a.title.de}
                </h1>
                <span className="text-sm text-muted-foreground">
                    {author && (lang === 'de' ? `Von ${author} · ` : `By ${author} · `)}
                    {lang === 'de' ? `Veröffentlicht am ${a.date}` : `Published ${a.date}`}
                </span>
                <div aria-hidden="true" className="h-44 rounded-lg bg-muted" />
                <div className="flex max-w-prose flex-col gap-3 leading-relaxed text-muted-foreground">
                    <p>
                        Die arabische Schrift sieht am Anfang aus wie ein einziger langer Schnörkel.
                        Dabei sind es nur achtundzwanzig Buchstaben — und die meisten unterscheiden
                        sich nur durch ein paar Punkte.
                    </p>
                    <p>
                        Wir lernen sie in vier Gruppen: Woche eins die Buchstaben, die du schon aus
                        dem Unterricht kennst, Woche zwei die mit Punkten darüber …
                    </p>
                    <blockquote className="border-l-2 border-border pl-4 italic">
                        „Zehn Minuten am Tag schlagen zwei Stunden am Wochenende.“
                    </blockquote>
                </div>
            </article>
            <section className="flex flex-col gap-3 border-t border-border px-8 py-8">
                <h2 className="text-xl font-semibold tracking-tight">
                    {lang === 'de' ? 'Seminare zu diesem Thema' : 'Courses on this topic'}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <CourseCard c={course(1)} site={site} />
                    <CourseCard c={course(7)} site={site} />
                </div>
            </section>
            <SiteFooter site={site} />
        </>
    );

    // SAVE. Articles keep their own lifecycle (#1366, ADR-0125): Entwurf →
    // Geplant → Veröffentlicht, driven by `published_at`, saved with an
    // explicit "Artikel speichern" — today's behaviour. Putting them behind the
    // editor's Publish as well would give an unpublished article two different
    // "not public yet" states. So nothing in this panel counts towards
    // "Veröffentlichen" at the top, and the panel says so.
    const inspector = (
        <>
            <Section title="Veröffentlichung" timing="save">
                <Note tone="muted" icon={Info}>
                    Artikel haben ihr eigenes Veröffentlichungsdatum. „Veröffentlichen“ oben
                    betrifft sie nicht.
                </Note>
                <div className="flex items-center gap-2 text-sm">
                    Status
                    <Badge tone={ARTICLE_STATUS[a.status].tone} dot>
                        {ARTICLE_STATUS[a.status].label}
                    </Badge>
                </div>
                <Field
                    id={`${id}-date`}
                    label="Veröffentlichungsdatum"
                    hint="Leer: bleibt Entwurf. Ein Datum in der Zukunft plant den Artikel ein."
                >
                    <Input
                        id={`${id}-date`}
                        type="datetime-local"
                        value={date}
                        onChange={(e) => {
                            setDate(e.target.value);
                            change();
                        }}
                    />
                </Field>
                <Field
                    id={`${id}-slug`}
                    label="Adresse"
                    hint={`al-nur-akademie.de/knowledge/${slug}`}
                >
                    <Input
                        id={`${id}-slug`}
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            change();
                        }}
                    />
                </Field>
            </Section>
            <Section title="Darstellung" timing="save">
                <LangTabs
                    label="Sprache der Zusammenfassung"
                    filled={{ de: !!excerpt.de, en: !!excerpt.en }}
                >
                    {(l) => (
                        <Field
                            id={`${id}-excerpt-${l}`}
                            label="Zusammenfassung"
                            hint="Ein bis zwei Sätze. Erscheint auf der Übersichtskarte und in Suchmaschinen."
                        >
                            <Textarea
                                id={`${id}-excerpt-${l}`}
                                rows={3}
                                value={excerpt[l]}
                                onChange={(e) => {
                                    setExcerpt({ ...excerpt, [l]: e.target.value });
                                    change();
                                }}
                            />
                        </Field>
                    )}
                </LangTabs>
                <Field
                    id={`${id}-author`}
                    label="Autor:in"
                    hint="Nur Lehrkräfte mit öffentlichem Profil."
                >
                    <select
                        id={`${id}-author`}
                        className={nativeSelectClass}
                        value={author}
                        onChange={(e) => {
                            setAuthor(e.target.value);
                            change();
                        }}
                    >
                        <option value="">Keine Autorenzeile</option>
                        {TEACHERS.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </Field>
                <Field
                    id={`${id}-topic`}
                    label="Thema"
                    hint="Seminare dieser Kurskategorie erscheinen unter dem Artikel."
                >
                    <select
                        id={`${id}-topic`}
                        className={nativeSelectClass}
                        value={topic}
                        onChange={(e) => {
                            setTopic(e.target.value);
                            change();
                        }}
                    >
                        <option value="">Kein Thema</option>
                        {TOPICS.map((t) => (
                            <option key={t}>{t}</option>
                        ))}
                    </select>
                </Field>
            </Section>
            <Section title="Abschnitte" timing="save">
                <p className="text-xs text-muted-foreground">
                    Den Artikeltext bearbeitest du links unter „Abschnitte“ oder direkt auf der
                    Seite.
                </p>
            </Section>
            <ConfirmActionDialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                title="Diesen Artikel löschen?"
                description="Der Artikel verschwindet von deiner öffentlichen Website. Das lässt sich nur von einer Entwicklerin rückgängig machen, nicht hier."
                confirmLabel="Artikel löschen"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={onDeleted}
            />
        </>
    );
    const footer = (
        <div className="flex items-center gap-2">
            <Button
                className="flex-1"
                disabled={!dirty}
                onClick={() => {
                    setDirty(false);
                    setSaved(true);
                }}
            >
                Artikel speichern
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <IconButton
                        label="Weitere Aktionen"
                        icon={<EllipsisVertical aria-hidden="true" />}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Öffentlichen Artikel öffnen</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive-tint-foreground"
                        onSelect={() => setConfirmDelete(true)}
                    >
                        Artikel löschen
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <span role="status" className="sr-only">
                {saved ? 'Artikel gespeichert' : ''}
            </span>
        </div>
    );
    return {
        title: a.title.de,
        badge: 'Artikel',
        canvas,
        inspector,
        footer,
        path: `/knowledge/${slug}`,
    };
}

/** A legal page: text per language, fixed — editable, never deletable or hideable. */
function useLegalPane(site: SiteState, legalId: LegalId): Pane {
    const id = useId();
    const { lang, setLang } = useEditor();
    const l = legal(legalId);
    const [body, setBody] = useState(l.body);
    const [dirty, setDirty] = useState(false);

    const canvas = (
        <>
            <SiteHeader site={site} />
            <section className="flex flex-col gap-4 px-8 py-12">
                <h1 className="text-3xl font-semibold tracking-tight">{l.title}</h1>
                {body[lang] ? (
                    <div className="flex max-w-prose flex-col gap-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                        {body[lang]}
                    </div>
                ) : (
                    // The public page's placeholder for an empty locale.
                    <p className="max-w-prose rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                        {lang === 'de'
                            ? 'Dieser Inhalt wird gerade vorbereitet.'
                            : 'This content is being prepared.'}{' '}
                        <span className="font-medium">(Platzhalter — die Seite ist leer)</span>
                    </p>
                )}
            </section>
            <SiteFooter site={site} />
        </>
    );

    // SAVE. A legal obligation, not a design: a corrected address must go out
    // when it is saved, never wait behind someone's half-finished page draft.
    // The public-site guard and LegalPagesHealthCheck also read the LIVE body,
    // so a drafted Impressum would be "written" in the editor and "missing" to
    // the guard. Today's explicit save, kept.
    const missingHere = LANGS.filter((x) => !body[x]);
    const inspector = (
        <>
            <Section title="Pflichtseite">
                <Note tone="muted" icon={Lock}>
                    Du kannst diese Seite bearbeiten, aber nicht löschen, umbenennen oder
                    ausblenden. Sie ist immer in der Fußzeile verlinkt. {l.basis}
                </Note>
                {missingHere.length === LANGS.length && l.requiredForPublicSite && (
                    <Note tone="destructive" icon={CircleAlert} title="Seite ist leer">
                        Solange sie leer ist, kann deine Website nicht öffentlich geschaltet werden.
                    </Note>
                )}
                {missingHere.length > 0 && missingHere.length < LANGS.length && (
                    <Note
                        tone="warning"
                        icon={CircleAlert}
                        title={`${missingHere.map((x) => LANG_NAME[x]).join(', ')}e Fassung fehlt`}
                    >
                        Wer die Seite auf {missingHere.map((x) => LANG_NAME[x]).join(', ')} öffnet,
                        sieht nur einen Platzhalter.{' '}
                        <button
                            type="button"
                            className="font-semibold underline"
                            onClick={() => setLang(missingHere[0]!)}
                        >
                            Jetzt ausfüllen
                        </button>
                    </Note>
                )}
            </Section>
            <Section title="Text" timing="save">
                <LangTabs label={`Sprache: ${l.title}`} filled={{ de: !!body.de, en: !!body.en }}>
                    {(x) => (
                        <div className="flex flex-col">
                            <Label htmlFor={`${id}-body-${x}`} className="sr-only">
                                {l.title} ({LANG_NAME[x]})
                            </Label>
                            <RichTextToolbar label={`Formatierung: ${l.title}`} />
                            <Textarea
                                id={`${id}-body-${x}`}
                                rows={16}
                                className="font-mono text-xs"
                                placeholder="Leer lassen zeigt den Platzhalter."
                                value={body[x]}
                                onChange={(e) => {
                                    setBody({ ...body, [x]: e.target.value });
                                    setDirty(true);
                                }}
                            />
                        </div>
                    )}
                </LangTabs>
            </Section>
        </>
    );
    const footer = (
        <div className="flex items-center gap-2">
            <Button className="flex-1" disabled={!dirty} onClick={() => setDirty(false)}>
                {l.title} speichern
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <IconButton
                        label="Weitere Aktionen"
                        icon={<EllipsisVertical aria-hidden="true" />}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Öffentliche Seite öffnen</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>Ausblenden — Pflichtseite</DropdownMenuItem>
                    <DropdownMenuItem disabled>Löschen — Pflichtseite</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
    return { title: l.title, badge: 'Rechtliches', canvas, inspector, footer, path: l.path };
}

/** The cookie banner as a part on every page. */
function useCookiePane(site: SiteState, setSite: (p: Partial<SiteState>) => void): Pane {
    const id = useId();
    const { draft, live } = useEditor();
    const [revision, setRevision] = useState(3);
    const [confirmBump, setConfirmBump] = useState(false);

    const canvas = (
        <div className="relative">
            <SiteHeader site={site} />
            <Hero
                title="Lernen, das bleibt."
                text="Arabisch, Quran, Deutsch für den Beruf — in kleinen Gruppen, online und in Berlin."
            />
            <CourseGrid heading="Beliebte Kurse" ids={[1, 4, 2]} site={site} />
            <SiteFooter site={site} />
            <CookieBannerPreview site={site} />
        </div>
    );

    const inspector = (
        <>
            {/* WITH PUBLISH. The banner's on/off and its wording are a visible part
                of every page, the same kind as the announcement bar that #1630
                phase C moved into the drafted `chrome` surface; the canvas shows
                it before visitors do. MOCK-ONLY: `banner_enabled`,
                `banner_heading`, `banner_body` save immediately on the Consent
                screen today and would join the `chrome` surface. */}
            <Section title="Banner" timing="publish">
                <SwitchRow
                    id={`${id}-on`}
                    label="Einwilligungs-Banner anzeigen"
                    hint="Lass es aus, solange die Seite nur das Sitzungs-Cookie setzt. Eingebettete Videos bleiben so oder so gesperrt, bis jemand zustimmt."
                    checked={site.cookieBanner}
                    onCheckedChange={(on) => {
                        setSite({ cookieBanner: on });
                        draft('cookie_banner');
                    }}
                />
                <LangTabs label="Sprache des Banners" filled={{ de: true, en: true }}>
                    {(l) => (
                        <>
                            <Field id={`${id}-h-${l}`} label="Überschrift">
                                <Input
                                    id={`${id}-h-${l}`}
                                    placeholder={BANNER_DEFAULT[l]}
                                    value={site.bannerHeading[l]}
                                    onChange={(e) => {
                                        setSite({
                                            bannerHeading: {
                                                ...site.bannerHeading,
                                                [l]: e.target.value,
                                            },
                                        });
                                        draft('cookie_heading');
                                    }}
                                />
                            </Field>
                            <Field
                                id={`${id}-b-${l}`}
                                label="Text"
                                hint="Leer lassen für die mitgelieferte Formulierung."
                            >
                                <Textarea
                                    id={`${id}-b-${l}`}
                                    rows={4}
                                    placeholder={BANNER_BODY_DEFAULT[l]}
                                    value={site.bannerBody[l]}
                                    onChange={(e) => {
                                        setSite({
                                            bannerBody: { ...site.bannerBody, [l]: e.target.value },
                                        });
                                        draft('cookie_body');
                                    }}
                                />
                            </Field>
                        </>
                    )}
                </LangTabs>
            </Section>

            {/* LIVE AT ONCE. Categories and services are the consent REGISTRY,
                not looks: they decide which embeds stay blocked
                (ConsentEmbedGateHealthCheck) and stored consents refer to their
                keys. A drafted service would preview an embed the live gate does
                not know. They are their own rows with their own CRUD today
                (ConsentCategoryController, ConsentServiceController) — kept. */}
            <Section
                title="Kategorien und Dienste"
                timing="live"
                hint="Besucher:innen entscheiden pro Kategorie. Erforderliches ist immer aktiv."
            >
                <ul className="flex flex-col gap-2">
                    {CONSENT.map((c) => (
                        <li key={c.key} className="rounded-md border border-border bg-card">
                            <div className="flex items-center gap-2 py-1 pr-1 pl-2.5">
                                <span className="flex-1 text-sm font-medium">{c.name}</span>
                                {c.essential ? (
                                    <Badge tone="muted">
                                        <Lock aria-hidden="true" className="size-3" />
                                        Immer aktiv
                                    </Badge>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        {c.services.length} Dienste
                                    </span>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <IconButton
                                            label={`Aktionen für ${c.name}`}
                                            icon={<EllipsisVertical aria-hidden="true" />}
                                        />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Kategorie bearbeiten</DropdownMenuItem>
                                        <DropdownMenuItem>Dienst hinzufügen</DropdownMenuItem>
                                        {!c.essential && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive-tint-foreground">
                                                    Kategorie löschen
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            {c.services.length > 0 && (
                                <ul className="flex flex-col divide-y divide-border border-t border-border">
                                    {c.services.map((s) => (
                                        <li
                                            key={s.name}
                                            className="flex items-center gap-2 py-1.5 pr-1 pl-2.5"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm">{s.name}</p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {s.provider} · {s.domain}
                                                </p>
                                            </div>
                                            <IconButton
                                                label={`${s.name} bearbeiten`}
                                                icon={<Pencil aria-hidden="true" />}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
                <Button variant="outline" size="sm" className="justify-start">
                    <Plus aria-hidden="true" />
                    Kategorie hinzufügen
                </Button>
                <Note tone="success" icon={ShieldCheck}>
                    Alle 2 erlaubten Einbettungs-Quellen sind abgesichert.
                </Note>
            </Section>

            {/* LIVE AT ONCE. An action, not a state: it invalidates every stored
                consent at once. Nothing to preview. */}
            <Section
                title="Stand der Einwilligung"
                timing="live"
                hint="Erhöhe den Stand, wenn du einen Dienst hinzufügst — eine Einwilligung in eine Liste, die jemand nie gesehen hat, ist keine."
            >
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm">
                        Aktueller Stand:{' '}
                        <span className="font-semibold tabular-nums">{revision}</span>
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setConfirmBump(true)}>
                        Alle noch einmal fragen
                    </Button>
                </div>
            </Section>
            <ConfirmActionDialog
                open={confirmBump}
                onOpenChange={setConfirmBump}
                title="Alle noch einmal fragen?"
                description="Alle, die schon geantwortet haben, sehen das Banner beim nächsten Besuch erneut. Das gilt sofort."
                confirmLabel={`Stand auf ${revision + 1} erhöhen`}
                cancelLabel="Abbrechen"
                onConfirm={() => {
                    setRevision(revision + 1);
                    live(`Einwilligung auf Stand ${revision + 1}`);
                }}
            />
        </>
    );
    return { title: 'Cookie-Banner', badge: 'Teil', canvas, inspector };
}

/** Über uns: an ordinary page with blocks; the old single text is its first Text block. */
function useAboutPane(
    site: SiteState,
    block: string | undefined,
    onSelectBlock: (id: string) => void,
): Pane {
    const id = useId();
    const { lang, draft, device } = useEditor();
    const [heading, setHeading] = useState(tr('Wer wir sind', 'Who we are'));
    const [text, setText] = useState(
        tr(
            'Die Al-Nur Akademie wurde 2014 von drei Lehrerinnen in Neukölln gegründet. Heute lernen bei uns über 400 Kinder und Erwachsene — in festen Gruppen, mit derselben Lehrkraft, online und vor Ort.\n\nWir glauben, dass Lernen Beziehung braucht: Wer weiß, dass jemand auf ihn wartet, kommt wieder.',
            'Al-Nur Akademie was founded in 2014 by three teachers in Neukölln.',
        ),
    );
    const blocks = page('about').blocks;
    const sel = blocks.find((b) => b.id === block);

    const render = (b: Block) => {
        switch (b.type) {
            case 'hero':
                return (
                    <Hero
                        title={lang === 'de' ? 'Über uns' : 'About us'}
                        text={
                            lang === 'de'
                                ? 'Eine Schule aus der Nachbarschaft.'
                                : 'A school from the neighbourhood.'
                        }
                    />
                );
            case 'text':
                return (
                    <Prose heading={heading[lang]}>
                        {text[lang].split('\n\n').map((p) => (
                            <p key={p}>{p}</p>
                        ))}
                    </Prose>
                );
            case 'image_text':
                return (
                    <section
                        className={cn(
                            'grid gap-6 px-8 py-8',
                            device === 'phone' ? 'grid-cols-1' : 'grid-cols-2',
                        )}
                    >
                        <div aria-hidden="true" className="h-44 rounded-lg bg-muted" />
                        <div className="flex flex-col gap-2">
                            <h2 className="text-xl font-semibold tracking-tight">
                                {lang === 'de'
                                    ? 'Unser Haus in der Sonnenallee'
                                    : 'Our home on Sonnenallee'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {lang === 'de'
                                    ? 'Sechs Räume, eine Bibliothek und eine Teeküche, in der nach dem Unterricht keiner allein sitzt.'
                                    : 'Six rooms, a library and a tea kitchen.'}
                            </p>
                        </div>
                    </section>
                );
            case 'instructors':
                return (
                    <section className="flex flex-col gap-4 px-8 py-8">
                        <h2 className="text-xl font-semibold tracking-tight">
                            {lang === 'de' ? 'Unsere Lehrkräfte' : 'Our teachers'}
                        </h2>
                        <div
                            className={cn(
                                'grid gap-3',
                                device === 'phone' ? 'grid-cols-2' : 'grid-cols-4',
                            )}
                        >
                            {TEACHERS.map((t) => (
                                <div
                                    key={t}
                                    className="flex flex-col items-center gap-2 text-center text-sm"
                                >
                                    <span
                                        aria-hidden="true"
                                        className="size-12 rounded-full bg-muted"
                                    />
                                    {t}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            default:
                return null;
        }
    };

    const canvas = (
        <>
            <SiteHeader site={site} />
            {blocks.map((b) => (
                <CanvasBlock
                    key={b.id}
                    block={b}
                    selected={block === b.id}
                    onSelect={() => onSelectBlock(b.id)}
                >
                    {render(b)}
                </CanvasBlock>
            ))}
            <SiteFooter site={site} />
        </>
    );

    const inspector =
        sel?.type === 'text' ? (
            <Tabs defaultValue="content" className="gap-0">
                <TabsList aria-label="Abschnitt bearbeiten" className="px-4 pt-2">
                    <TabsTrigger value="content">Inhalt</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                </TabsList>
                <TabsContent value="content">
                    <Section title="Text" timing="publish">
                        {/* MOCK-ONLY: the one-time conversion of `about_body` into
                            this block, and the note saying so. */}
                        <Note tone="muted" icon={Info}>
                            Dein bisheriger Über-uns-Text steht jetzt in diesem Abschnitt. Du kannst
                            weitere Abschnitte hinzufügen — wie auf jeder anderen Seite.
                        </Note>
                        <LangTabs
                            label="Sprache des Abschnitts"
                            filled={{ de: !!text.de, en: !!text.en }}
                        >
                            {(l) => (
                                <>
                                    <Field id={`${id}-h-${l}`} label="Überschrift">
                                        <Input
                                            id={`${id}-h-${l}`}
                                            value={heading[l]}
                                            onChange={(e) => {
                                                setHeading({ ...heading, [l]: e.target.value });
                                                draft('about_heading');
                                            }}
                                        />
                                    </Field>
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor={`${id}-t-${l}`}>Text</Label>
                                        <div className="flex flex-col">
                                            <RichTextToolbar label="Formatierung des Texts" />
                                            <Textarea
                                                id={`${id}-t-${l}`}
                                                rows={10}
                                                value={text[l]}
                                                onChange={(e) => {
                                                    setText({ ...text, [l]: e.target.value });
                                                    draft('about_text');
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </LangTabs>
                    </Section>
                </TabsContent>
                <TabsContent value="design">
                    <Section title="Design" timing="publish">
                        <p className="text-xs text-muted-foreground">Wie im heutigen Editor.</p>
                    </Section>
                </TabsContent>
            </Tabs>
        ) : (
            <Section title="Abschnitt">
                <p className="text-sm text-muted-foreground">
                    Wähle einen Abschnitt auf der Seite oder links in der Liste.
                </p>
            </Section>
        );

    return {
        title: sel ? BLOCK_LABEL[sel.type] : 'Über uns',
        badge: sel ? 'Abschnitt' : 'Seite',
        canvas,
        inspector,
        path: '/about',
    };
}

/** The home page, optionally with the featured-courses block selected. */
function useHomePane(
    site: SiteState,
    block: string | undefined,
    onSelectBlock: (id: string) => void,
): Pane {
    const id = useId();
    const { draft } = useEditor();
    const [featured, setFeatured] = useState<number[]>([1, 4, 2]);
    const [heading, setHeading] = useState(tr('Beliebte Kurse', 'Popular courses'));
    const [pinCatalogue, setPinCatalogue] = useState(true);
    const sel = page('home').blocks.find((b) => b.id === block);
    const MAX = 12;

    const move = (i: number, by: -1 | 1) => {
        const next = [...featured];
        const [f] = next.splice(i, 1);
        next.splice(i + by, 0, f!);
        setFeatured(next);
        draft('featured');
    };

    const canvas = (
        <>
            <SiteHeader site={site} />
            <HomeBody
                site={site}
                featured={featured}
                featuredHeading={heading}
                selected={block}
                onSelectBlock={onSelectBlock}
            />
            <SiteFooter site={site} />
        </>
    );

    const available = COURSES.filter((c) => !featured.includes(c.id));
    const inspector =
        sel?.type === 'featured_courses' ? (
            <Tabs defaultValue="content" className="gap-0">
                <TabsList aria-label="Abschnitt bearbeiten" className="px-4 pt-2">
                    <TabsTrigger value="content">Inhalt</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                </TabsList>
                <TabsContent value="content">
                    {/* WITH PUBLISH — the block's `heading` and `courseIds` are
                        already drafted `landing` payload today. */}
                    <Section title="Überschrift" timing="publish">
                        <LangTabs
                            label="Sprache der Überschrift"
                            filled={{ de: !!heading.de, en: !!heading.en }}
                        >
                            {(l) => (
                                <Field id={`${id}-h-${l}`} label="Überschrift">
                                    <Input
                                        id={`${id}-h-${l}`}
                                        value={heading[l]}
                                        onChange={(e) => {
                                            setHeading({ ...heading, [l]: e.target.value });
                                            draft('featured_heading');
                                        }}
                                    />
                                </Field>
                            )}
                        </LangTabs>
                    </Section>
                    <Section
                        title={`Kurse (${featured.length} von ${MAX})`}
                        timing="publish"
                        hint="Nur öffentliche, veröffentlichte Kurse. Die Reihenfolge hier ist die Reihenfolge auf der Seite."
                    >
                        <ol className="flex flex-col gap-1.5">
                            {featured.map((cid, i) => {
                                const c = course(cid);
                                return (
                                    <li
                                        key={cid}
                                        className="flex items-center gap-1 rounded-md border border-border bg-card py-1 pr-1 pl-2"
                                    >
                                        <span className="w-4 text-xs text-muted-foreground tabular-nums">
                                            {i + 1}
                                        </span>
                                        <span className="flex min-w-0 flex-1 flex-col">
                                            <span className="truncate text-sm font-medium">
                                                {c.title}
                                            </span>
                                            <span className="truncate text-xs text-muted-foreground">
                                                {c.run}
                                            </span>
                                        </span>
                                        <IconButton
                                            label={`„${c.title}“ nach oben`}
                                            icon={<ArrowUp aria-hidden="true" />}
                                            disabled={i === 0}
                                            onClick={() => move(i, -1)}
                                        />
                                        <IconButton
                                            label={`„${c.title}“ nach unten`}
                                            icon={<ArrowDown aria-hidden="true" />}
                                            disabled={i === featured.length - 1}
                                            onClick={() => move(i, 1)}
                                        />
                                        <IconButton
                                            label={`„${c.title}“ entfernen`}
                                            icon={<X aria-hidden="true" />}
                                            onClick={() => {
                                                setFeatured(featured.filter((x) => x !== cid));
                                                draft('featured');
                                            }}
                                        />
                                    </li>
                                );
                            })}
                        </ol>
                        <Field id={`${id}-add`} label="Kurs hinzufügen">
                            <Combobox
                                id={`${id}-add`}
                                value=""
                                options={available.map((c) => c.title)}
                                placeholder="Kurs suchen …"
                                emptyLabel="Kein passender Kurs."
                                onChange={(title) => {
                                    const c = COURSES.find((x) => x.title === title);
                                    if (c && featured.length < MAX) {
                                        setFeatured([...featured, c.id]);
                                        draft('featured');
                                    }
                                }}
                            />
                        </Field>
                        {/* MOCK-ONLY: one list instead of two. Today
                            `featured_course_ids` (max 6, Website-Einstellungen)
                            is a SEPARATE list that pins courses to the top of
                            the public CATALOGUE (CourseCatalogue::build) and is
                            only a fallback for an EMPTY featured block on the
                            landing page (BlockResolver). This switch makes the
                            block's list also the catalogue pin, so the old
                            setting can go. */}
                        <SwitchRow
                            id={`${id}-pin`}
                            label="Auch oben im Kurskatalog zeigen"
                            hint="Diese Kurse stehen dann im Katalog an erster Stelle, in derselben Reihenfolge (höchstens 6)."
                            checked={pinCatalogue}
                            onCheckedChange={(on) => {
                                setPinCatalogue(on);
                                draft('featured_pin');
                            }}
                        />
                    </Section>
                </TabsContent>
                <TabsContent value="design">
                    <Section title="Design" timing="publish">
                        <p className="text-xs text-muted-foreground">Wie im heutigen Editor.</p>
                    </Section>
                </TabsContent>
            </Tabs>
        ) : (
            <Section title="Startseite">
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Wähle einen Abschnitt auf der Seite oder links in der Liste.
                </p>
            </Section>
        );
    return {
        title: sel ? BLOCK_LABEL[sel.type] : 'Startseite',
        badge: sel ? 'Abschnitt' : 'Seite',
        canvas,
        inspector,
        path: '/',
    };
}

/** A custom page with nothing selected: its own settings, now in the editor. */
function usePagePane(site: SiteState, pageId: string, onSelectBlock: (id: string) => void): Pane {
    const id = useId();
    const { live } = useEditor();
    const p = page(pageId);
    const [title, setTitle] = useState(p.title);
    const [slug, setSlug] = useState(p.path.slice(1));
    const [visible, setVisible] = useState(p.published);
    const [seo, setSeo] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);

    const canvas = (
        <>
            <SiteHeader site={site} />
            {p.blocks.map((b) => (
                <CanvasBlock
                    key={b.id}
                    block={b}
                    selected={false}
                    onSelect={() => onSelectBlock(b.id)}
                >
                    {b.type === 'hero' ? (
                        <Hero
                            title={title}
                            text="Deutsch und Arabisch für Ihr Team — bei Ihnen vor Ort oder online."
                        />
                    ) : b.type === 'text' ? (
                        <Prose heading="So läuft ein Firmenkurs">
                            <p>
                                Einstufung, ein fester Termin pro Woche, Abschlussbericht für die
                                Personalabteilung.
                            </p>
                        </Prose>
                    ) : (
                        <section className="px-8 py-8">
                            <div className="flex h-44 items-center justify-center rounded-lg border border-border text-sm text-muted-foreground">
                                Kontaktformular
                            </div>
                        </section>
                    )}
                </CanvasBlock>
            ))}
            <SiteFooter site={site} />
        </>
    );

    // LIVE AT ONCE — title, address, SEO and visibility are content and save
    // live (Design AGENTS.md, "What is NOT drafted"). MOCK-ONLY: today the
    // studio links OUT to Website-Inhalte for them (`metadataUrl`, #1551);
    // with that menu gone they have to live here.
    const inspector = (
        <>
            <Section title="Seite" timing="live">
                <Field id={`${id}-title`} label="Titel">
                    <Input
                        id={`${id}-title`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => live('Seitentitel gespeichert')}
                    />
                </Field>
                <Field id={`${id}-slug`} label="Adresse" hint={`al-nur-akademie.de/${slug}`}>
                    <Input
                        id={`${id}-slug`}
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        onBlur={() => live('Adresse gespeichert')}
                    />
                </Field>
                <SwitchRow
                    id={`${id}-visible`}
                    label="Seite ist öffentlich"
                    hint="Aus: die Adresse meldet „nicht gefunden“, Navigation und Sitemap lassen sie weg."
                    checked={visible}
                    onCheckedChange={(on) => {
                        setVisible(on);
                        live(on ? 'Seite ist öffentlich' : 'Seite ist ausgeblendet');
                    }}
                />
            </Section>
            <Section title="Suchmaschinen" timing="live">
                <Field
                    id={`${id}-seo`}
                    label="Beschreibung"
                    hint="Leer: die Standardbeschreibung aus den Website-Einstellungen."
                >
                    <Textarea
                        id={`${id}-seo`}
                        rows={3}
                        value={seo}
                        onChange={(e) => setSeo(e.target.value)}
                        onBlur={() => live('Beschreibung gespeichert')}
                    />
                </Field>
            </Section>
            <Section title="Abschnitte" timing="publish">
                <p className="text-xs text-muted-foreground">
                    Wähle links oder auf der Seite einen Abschnitt, um ihn zu bearbeiten.
                </p>
            </Section>
            <section className="px-4 py-4">
                <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}>
                    <Trash2 aria-hidden="true" />
                    Seite löschen
                </Button>
            </section>
            <ConfirmActionDialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                title={`„${title}“ löschen?`}
                description="Die Seite verschwindet sofort von deiner Website, Links darauf führen ins Leere."
                confirmLabel="Seite löschen"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={() => {}}
            />
        </>
    );
    return { title, badge: 'Seite', canvas, inspector, path: `/${slug}` };
}

/** The knowledge index: heading in place, and the articles. */
function useKnowledgePane(site: SiteState, onOpen: (id: number) => void): Pane {
    const { lang, draft } = useEditor();
    const [heading, setHeading] = useState(tr('Wissen', 'Knowledge'));
    const [intro, setIntro] = useState(tr('Artikel zu den Themen, die wir unterrichten.', ''));
    const canvas = (
        <>
            <SiteHeader site={site} />
            <section className="flex flex-col gap-3 px-8 pt-10 pb-8">
                {/* WITH PUBLISH. MOCK-ONLY: `knowledge_heading`/`knowledge_intro`
                    save live on the settings form today. */}
                <InlineText
                    as="h1"
                    label="Überschrift der Wissensseite"
                    placeholder="Überschrift (leer: „Wissen“)"
                    value={heading[lang]}
                    onChange={(v) => {
                        setHeading({ ...heading, [lang]: v });
                        draft('knowledge_heading');
                    }}
                    className="text-3xl font-semibold tracking-tight"
                />
                <InlineText
                    label="Einleitungssatz der Wissensseite"
                    placeholder="Ein Satz unter der Überschrift"
                    value={intro[lang]}
                    onChange={(v) => {
                        setIntro({ ...intro, [lang]: v });
                        draft('knowledge_intro');
                    }}
                    className="text-muted-foreground"
                />
            </section>
            <ArticleCards site={site} />
            <SiteFooter site={site} />
        </>
    );
    const inspector = (
        <Section title="Artikel" hint="Entwürfe und geplante Artikel sehen nur Admins.">
            <ul className="flex flex-col gap-1.5">
                {ARTICLES.map((a) => (
                    <li key={a.id}>
                        <button
                            type="button"
                            onClick={() => onOpen(a.id)}
                            className="flex w-full flex-col items-start gap-1 rounded-md border border-border bg-card p-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <span className="text-sm font-medium">{a.title.de}</span>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge tone={ARTICLE_STATUS[a.status].tone} dot>
                                    {ARTICLE_STATUS[a.status].label}
                                </Badge>
                                geändert {a.updated}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </Section>
    );
    return { title: 'Übersicht „Wissen“', badge: 'Seite', canvas, inspector, path: '/knowledge' };
}

/** Everything that does not change in this step: shown as today, so the frame is complete. */
function unchangedPane(site: SiteState, sel: Sel): Pane {
    const label =
        sel.kind === 'theme'
            ? 'Theme'
            : sel.kind === 'system'
              ? SYSTEM_PAGES.find((s) => s.id === sel.id)!.label
              : sel.kind === 'part'
                ? PARTS.find((p) => p.id === sel.id)!.label
                : 'Seite';
    const catalogue = sel.kind === 'system' && sel.id === 'catalog';
    return {
        title: label,
        badge: sel.kind === 'part' ? 'Teil' : sel.kind === 'theme' ? 'Stil' : 'Seite',
        canvas: (
            <>
                <SiteHeader site={site} />
                {catalogue ? (
                    <>
                        <section className="flex flex-col gap-2 px-8 pt-10 pb-2">
                            <h1 className="text-3xl font-semibold tracking-tight">
                                Unser Kursangebot
                            </h1>
                            <p className="text-muted-foreground">
                                Finde den Kurs, der zu dir passt.
                            </p>
                        </section>
                        <CourseGrid heading="Alle Kurse" ids={[1, 4, 2, 3, 5, 6]} site={site} />
                    </>
                ) : (
                    <Hero
                        title="Lernen, das bleibt."
                        text="Arabisch, Quran, Deutsch für den Beruf."
                    />
                )}
                <SiteFooter site={site} />
            </>
        ),
        inspector: (
            <Section title={label}>
                <p className="text-sm text-muted-foreground">
                    Unverändert — wie im heutigen Editor.
                    {catalogue &&
                        ' Neu ist nur: Überschrift und Einleitungssatz des Katalogs bearbeitest du direkt auf der Seite.'}
                </p>
            </Section>
        ),
    };
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

const ALL_OPEN: Record<GroupId, boolean> = {
    theme: true,
    pages: true,
    articles: true,
    system: true,
    legal: true,
    parts: true,
};

function WebsiteEditor({
    initial,
    showMoved = false,
    openGroups,
    pendingChanges = 2,
    cookieBanner = false,
}: {
    initial: Sel;
    /** Review aid: mark what moved in from "Website-Inhalte". */
    showMoved?: boolean;
    /** Which navigator groups start open; default: the one holding the selection. */
    openGroups?: Partial<Record<GroupId, boolean>>;
    /** Unpublished design changes before anything is touched. */
    pendingChanges?: number;
    cookieBanner?: boolean;
}) {
    const [sel, setSel] = useState<Sel>(initial);
    const [lang, setLang] = useState<Lang>('de');
    const [device, setDevice] = useState<PageEditorDevice>('desktop');
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const [note, setNote] = useState<string | null>(null);
    const [articlesOn, setArticlesOn] = useState(true);
    const [site, setSiteState] = useState<SiteState>({
        search: true,
        articlesOn: true,
        threshold: 5,
        cardLayout: 'standard',
        social: Object.fromEntries(SOCIAL.map((s) => [s.key, s.value])),
        cookieBanner,
        bannerHeading: tr('', ''),
        bannerBody: tr('', ''),
    });
    const setSite = (p: Partial<SiteState>) => setSiteState((s) => ({ ...s, ...p }));

    const groupOf = (s: Sel): GroupId | null =>
        s.kind === 'theme'
            ? 'theme'
            : s.kind === 'page'
              ? 'pages'
              : s.kind === 'article' || s.kind === 'knowledge'
                ? 'articles'
                : s.kind === 'system'
                  ? 'system'
                  : s.kind === 'legal'
                    ? 'legal'
                    : s.kind === 'part'
                      ? 'parts'
                      : null;
    const [open, setOpen] = useState<Record<GroupId, boolean>>(() => {
        const base: Record<GroupId, boolean> = {
            theme: false,
            pages: false,
            articles: false,
            system: false,
            legal: false,
            parts: false,
            ...openGroups,
        };
        const g = groupOf(initial);
        if (g) base[g] = true;
        return base;
    });

    useEffect(() => {
        if (!note) return;
        const t = setTimeout(() => setNote(null), 4000);
        return () => clearTimeout(t);
    }, [note]);

    const editor: Editor = {
        lang,
        setLang,
        device,
        draft: (key) => setTouched((t) => (t.has(key) ? t : new Set(t).add(key))),
        live: (what) => setNote(what),
    };
    const changes = pendingChanges + touched.size;

    const select = (s: Sel) => {
        setSel(s);
        const g = groupOf(s);
        if (g) setOpen((o) => ({ ...o, [g]: true }));
    };

    return (
        <EditorContext.Provider value={editor}>
            <div className="flex h-svh bg-background text-foreground">
                <NavigatorPanel
                    sel={sel}
                    onSelect={select}
                    open={open}
                    onToggle={(g) => setOpen((o) => ({ ...o, [g]: !o[g] }))}
                    showMoved={showMoved}
                    articlesOn={articlesOn}
                    onArticlesOn={(on) => {
                        setArticlesOn(on);
                        setSite({ articlesOn: on });
                        setNote(on ? 'Wissen ist auf der Website' : 'Wissen ist ausgeblendet');
                    }}
                    emptyLegal={LEGAL.filter((l) => !l.body.de).map((l) => l.id)}
                />
                <Workspace
                    key={`${sel.kind}:${'id' in sel ? sel.id : ''}`}
                    sel={sel}
                    onSelect={select}
                    site={site}
                    setSite={setSite}
                    device={device}
                    onDevice={setDevice}
                    changes={changes}
                    note={note}
                />
            </div>
        </EditorContext.Provider>
    );
}

/** Canvas + inspector for the current selection. Remounted per selection, so panes keep no stale state. */
function Workspace({
    sel,
    onSelect,
    site,
    setSite,
    device,
    onDevice,
    changes,
    note,
}: {
    sel: Sel;
    onSelect: (s: Sel) => void;
    site: SiteState;
    setSite: (p: Partial<SiteState>) => void;
    device: PageEditorDevice;
    onDevice: (d: PageEditorDevice) => void;
    changes: number;
    note: string | null;
}) {
    const { lang, setLang } = useEditor();
    const pane = usePane(sel, onSelect, site, setSite);

    return (
        <>
            <div className="flex min-w-0 flex-1 flex-col">
                <PageEditor
                    device={device}
                    onDeviceChange={onDevice}
                    labels={{
                        preview: `${pane.title} (Vorschau zum Bearbeiten)`,
                        tools: 'Vorschau',
                        desktop: 'Desktop',
                        phone: 'Handy',
                        aside: 'Eigenschaften',
                        resizeAside: 'Eigenschaften verbreitern oder verschmälern',
                    }}
                    previewTools={
                        <LanguageSelect
                            languages={[
                                { code: 'de', label: 'Deutsch', done: 7, total: 7 },
                                { code: 'en', label: 'Englisch', done: 5, total: 7 },
                            ]}
                            value={lang}
                            onValueChange={(v) => setLang(v as Lang)}
                            labels={{
                                label: 'Vorschausprache',
                                progress: (d, t) => `${d} von ${t} ausgefüllt`,
                            }}
                        />
                    }
                    toolbar={<TopBar path={pane.path} changes={changes} note={note} />}
                >
                    <div className="relative">{pane.canvas}</div>
                </PageEditor>
            </div>
            <Sidebar
                label="Eigenschaften"
                side="right"
                defaultWidth={340}
                resize={{
                    label: 'Eigenschaften verbreitern oder verschmälern',
                    storageKey: 'storybook.page.website-editor.inspector',
                    minWidth: 300,
                }}
            >
                <SidebarHeader className="h-12 flex-row items-center justify-between gap-2 border-b border-sidebar-border px-4 py-0">
                    <h2 className="truncate font-semibold">{pane.title}</h2>
                    <Badge tone="neutral">{pane.badge}</Badge>
                </SidebarHeader>
                <SidebarContent className="gap-0 px-0 py-0">{pane.inspector}</SidebarContent>
                {pane.footer && <SidebarFooter>{pane.footer}</SidebarFooter>}
            </Sidebar>
        </>
    );
}

function usePane(
    sel: Sel,
    onSelect: (s: Sel) => void,
    site: SiteState,
    setSite: (p: Partial<SiteState>) => void,
): Pane {
    // Hooks run unconditionally; the selection picks which pane is shown.
    const block = sel.kind === 'page' || sel.kind === 'article' ? sel.block : undefined;
    const pageBlock = (pageId: string) => (b: string) =>
        onSelect({ kind: 'page', id: pageId, block: b });
    const settings = useSettingsPane(site, setSite);
    const contact = useContactPane(site, setSite);
    const art = useArticlePane(site, sel.kind === 'article' ? sel.id : 1, () =>
        onSelect({ kind: 'knowledge' }),
    );
    const lg = useLegalPane(site, sel.kind === 'legal' ? sel.id : 'impressum');
    const cookie = useCookiePane(site, setSite);
    const about = useAboutPane(site, block, pageBlock('about'));
    const home = useHomePane(site, block, pageBlock('home'));
    const custom = usePagePane(
        site,
        sel.kind === 'page' ? sel.id : 'firmenkurse',
        pageBlock(sel.kind === 'page' ? sel.id : 'firmenkurse'),
    );
    const knowledge = useKnowledgePane(site, (id) => onSelect({ kind: 'article', id }));

    switch (sel.kind) {
        case 'settings':
            return settings;
        case 'article':
            return art;
        case 'legal':
            return lg;
        case 'knowledge':
            return knowledge;
        case 'part':
            return sel.id === 'cookie' ? cookie : unchangedPane(site, sel);
        case 'page':
            if (sel.id === 'home') return home;
            if (sel.id === 'about') return about;
            if (sel.id === 'contact') return contact;
            return custom;
        default:
            return unchangedPane(site, sel);
    }
}

function TopBar({ path, changes, note }: { path?: string; changes: number; note: string | null }) {
    return (
        <>
            {path && <span className="font-mono text-xs text-muted-foreground">{path}</span>}
            <span className="flex-1" />
            <span role="status" className="flex items-center">
                {note && (
                    <Badge tone="success">
                        <Check aria-hidden="true" className="size-3" />
                        {note} · sofort live
                    </Badge>
                )}
            </span>
            <IconButton
                label="Rückgängig (Strg+Z)"
                icon={<Undo2 aria-hidden="true" />}
                disabled={changes === 0}
            />
            <IconButton
                label="Wiederherstellen (Umschalt+Strg+Z)"
                icon={<Redo2 aria-hidden="true" />}
                disabled
            />
            <span className="text-sm text-muted-foreground">
                {changes === 0
                    ? 'Keine unveröffentlichten Änderungen'
                    : changes === 1
                      ? '1 unveröffentlichte Änderung'
                      : `${changes} unveröffentlichte Änderungen`}
            </span>
            <Button size="sm" disabled={changes === 0}>
                {changes === 0 ? 'Veröffentlichen' : `Veröffentlichen · ${changes}`}
            </Button>
        </>
    );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

const meta: Meta<typeof WebsiteEditor> = {
    title: 'Pages/Admin/Website-Editor',
    component: WebsiteEditor,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.website-editor')) localStorage.removeItem(k);
    },
};
export default meta;

type Story = StoryObj<typeof WebsiteEditor>;

/**
 * The navigator after the move, every group open, what moved in marked "neu
 * hier". A custom page is selected: its title, address, SEO and visibility now
 * sit in the inspector, because "Website-Inhalte" — where they live today — is
 * gone.
 */
export const Navigator: Story = {
    render: () => (
        <WebsiteEditor
            initial={{ kind: 'page', id: 'firmenkurse' }}
            showMoved
            openGroups={ALL_OPEN}
        />
    ),
    play: async ({ canvasElement }) => {
        const nav = within(
            within(canvasElement).getByRole('complementary', { name: 'Seiten und Bereiche' }),
        );
        await expect(nav.getByRole('button', { name: /Website-Einstellungen/ })).toBeVisible();
        await expect(
            nav.getByRole('button', { name: /Impressum.*kann nicht gelöscht werden/ }),
        ).toBeVisible();
        await expect(nav.getByRole('button', { name: /Cookie-Banner/ })).toBeVisible();
    },
};

/** Site settings: main switches and SEO live at once, the card dials with Publish. */
export const WebsiteEinstellungen: Story = {
    render: () => <WebsiteEditor initial={{ kind: 'settings' }} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('switch', { name: 'Suchleiste' }));
        await canvas.findByText(/Suchleiste ist aus · sofort live/);
    },
};

/** The Kontakt page: heading in place, form fields, spam protection, contact data. */
export const Kontaktseite: Story = {
    render: () => <WebsiteEditor initial={{ kind: 'page', id: 'contact' }} pendingChanges={0} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: '„Worum geht es?“ nach oben' }));
        await expect(canvas.getByRole('button', { name: 'Veröffentlichen · 1' })).toBeEnabled();
    },
};

/** Articles: the section's switch, the list with status, one article open. */
export const Artikel: Story = {
    render: () => <WebsiteEditor initial={{ kind: 'article', id: 1 }} />,
};

/** A legal page: fixed, editable per language; the English version is empty. */
export const Impressum: Story = {
    render: () => (
        <WebsiteEditor initial={{ kind: 'legal', id: 'impressum' }} openGroups={{ legal: true }} />
    ),
};

/** The cookie banner as a part: the banner drafted, the registry live. */
export const CookieBanner: Story = {
    render: () => <WebsiteEditor initial={{ kind: 'part', id: 'cookie' }} cookieBanner />,
};

/** Über uns as an ordinary page; the old text is its Text block. */
export const UeberUns: Story = {
    render: () => (
        <WebsiteEditor
            initial={{ kind: 'page', id: 'about', block: 'a-text' }}
            pendingChanges={0}
        />
    ),
};

/** The home page's featured-courses block: pick and order courses. */
export const HervorgehobeneKurse: Story = {
    render: () => <WebsiteEditor initial={{ kind: 'page', id: 'home', block: 'h-featured' }} />,
};
