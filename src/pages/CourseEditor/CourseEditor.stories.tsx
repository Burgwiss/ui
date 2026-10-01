import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
    ArrowLeft,
    ArrowRight,
    Award,
    Ban,
    Archive,
    BookOpen,
    Bot,
    CalendarDays,
    CalendarRange,
    Check,
    ChevronsUpDown,
    CircleAlert,
    CirclePlay,
    Copy,
    CreditCard,
    DoorOpen,
    Download,
    EllipsisVertical,
    Euro,
    ExternalLink,
    Eye,
    FileText,
    GraduationCap,
    GripVertical,
    HandCoins,
    Hash,
    ImageUp,
    Info,
    LayoutDashboard,
    LayoutGrid,
    ListChecks,
    Lock,
    Mail,
    MapPin,
    Megaphone,
    MessagesSquare,
    PanelsTopLeft,
    Paperclip,
    Pencil,
    Plus,
    Settings2,
    ShieldCheck,
    Trash2,
    TriangleAlert,
    Undo2,
    Upload,
    UserPlus,
    UserRound,
    Users,
    Video,
    X,
    type LucideIcon,
} from 'lucide-react';
import {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type MouseEvent,
    type ReactNode,
} from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
import { CopyLinkButton } from '../../atoms/CopyLinkButton';
import { IconButton } from '../../atoms/IconButton';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { Input } from '../../atoms/Input';
import { IntegerInput } from '../../atoms/IntegerInput';
import { Label } from '../../atoms/Label';
import { RadioGroup, RadioGroupItem } from '../../atoms/RadioGroup';
import { Switch } from '../../atoms/Switch';
import { Textarea } from '../../atoms/Textarea';
import type { GridColumn } from '../../hooks/grid/types';
import type { GridActionItem, RowId } from '../../hooks/gridActions';
import { useGrid } from '../../hooks/useGrid';
import { usePageDraft, type PageDraftApi, type PageDraftChange } from '../../hooks/usePageDraft';
import { cn } from '../../lib/cn';
import { Combobox } from '../../molecules/Combobox';
import { CompletionChecklist } from '../../molecules/CompletionChecklist';
import { ConfirmActionDialog } from '../../molecules/ConfirmActionDialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../molecules/Dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';
import { EmptyState } from '../../molecules/EmptyState';
import { GridFilterChips } from '../../molecules/GridFilterChips';
import { GridFilterEditor } from '../../molecules/GridFilterEditor';
import { GridFooter } from '../../molecules/GridFooter';
import { GridOptions } from '../../molecules/GridOptions';
import { InlineText } from '../../molecules/InlineText';
import { LanguageSelect } from '../../molecules/LanguageSelect';
import {
    GermanyFlag,
    UnitedKingdomFlag,
} from '../../molecules/LanguageSelect/LanguageSelect.fixtures';
import { SegmentedChoice, SegmentedChoiceItem } from '../../molecules/SegmentedChoice';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../molecules/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../molecules/Tabs';
import { AppRail, AppRailItem, AppRailSpacer } from '../../organisms/AppRail';
import { DataGrid } from '../../organisms/DataGrid';
import {
    DATA_GRID_LABELS,
    FILTER_CHIPS_LABELS,
    FILTER_EDITOR_LABELS,
    VIEWS_LABELS,
} from '../../organisms/DataGrid/DataGrid.fixtures';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '../../organisms/Sidebar';
import { AdminLayout } from '../../templates/AdminLayout';
import { GridPage } from '../../templates/GridPage';
import { PageEditor, type PageEditorDevice } from '../../templates/PageEditor';

/**
 * PAGE PROTOTYPE — the course editor of the admin (`/admin/courses/{kurs}` and
 * `/admin/courses/{kurs}/{ausführung}` in Burgwiss): what opens when you click
 * a course in the course list. Non-functional: example content, no server.
 *
 * Two levels, each with its own menu in the area sidebar:
 *
 *  - **Kurs** owns what the thing IS: its public page (edited in place, as
 *    visitors see it), its catalogue card, how a student sees it after booking
 *    (as seen in one run you pick), the list of its runs, and its settings.
 *    Text and images go through drafts and "Veröffentlichen", like the
 *    Website-Editor: nothing reaches visitors until published.
 *  - **Ausführung** owns how ONE run works: dates, place, prices, seats and
 *    access, team, its own copy of the lessons, its participants, live,
 *    certificate, communication. Changes there save and are live on save.
 *    Participants and certificates exist ONLY here.
 *
 * Opening a run swaps the course menu for the run's menu; its header names the
 * course (the way back) above the run's label, so the level is never in doubt.
 *
 * One visibility switch per course and per run — Entwurf / Veröffentlicht —
 * replaces today's `status` × `is_public` pair. Its guards stay, and the switch
 * says which one blocks it.
 *
 * Grounded in `app/Domain/Courses` (ADR-0149, epic #1665). Anything here with
 * no backend behind it today carries a `MOCK-ONLY` comment.
 */

// ---------------------------------------------------------------------------
// Example data — the course and its runs
// ---------------------------------------------------------------------------

const TODAY = '2026-10-01';
const HOST = 'alnur-akademie.de';

type Lang = 'de' | 'en';
const LANGS: Lang[] = ['de', 'en'];
const LANG_NAME: Record<Lang, string> = { de: 'Deutsch', en: 'Englisch' };

type Fields = {
    title: string;
    summary: string;
    description: string;
    outcomes: string[];
    audience: string;
    prerequisites: string;
    faq: { q: string; a: string }[];
    hero: string;
    icon: string;
    video: string;
    seoTitle: string;
    seoDescription: string;
};
type FieldKey = keyof Fields;

const FIELD_NAMES: Record<FieldKey, string> = {
    title: 'Titel',
    summary: 'Kurzbeschreibung',
    description: 'Über den Kurs',
    outcomes: 'Das lernst du',
    audience: 'Für wen',
    prerequisites: 'Voraussetzungen',
    faq: 'Häufige Fragen',
    hero: 'Titelbild',
    icon: 'Symbol',
    video: 'Vorschau-Video',
    seoTitle: 'Titel für Suchmaschinen',
    seoDescription: 'Beschreibung für Suchmaschinen',
};
/** One value for every language — kept under `de`. */
const SHARED = new Set<FieldKey>(['hero', 'icon', 'video']);

/** Stand-ins for the uploaded images: a few letters each. */
const IMAGE_ART: Record<string, string> = {
    'alphabet-tafel.jpg': 'أ ب ت',
    'kalligrafie-feder.jpg': 'ق ل م',
    'alif.svg': 'ا',
};

type Pending = { [K in FieldKey]: { lang: Lang; key: K; value: Fields[K] } }[FieldKey];

type Visibility = 'draft' | 'published';
type Delivery = 'planned' | 'running' | 'on_demand' | 'completed' | 'cancelled';
type Format = 'online' | 'in_person' | 'hybrid';
type Weekday = 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So';
const WEEKDAYS: Weekday[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const DAY_INDEX: Record<Weekday, number> = { Mo: 1, Di: 2, Mi: 3, Do: 4, Fr: 5, Sa: 6, So: 0 };
type Slot = { days: Weekday[]; from: string; to: string };
type Teacher = { name: string; role: 'lead' | 'assistant' };
type Price = {
    id: number;
    label: string;
    kind: 'one_time' | 'installment';
    amount: number;
    count?: number;
    active: boolean;
    sold: number;
};
type Drip = 'immediate' | 'weekly' | 'daily' | 'by_date' | 'manual';
type WaitEntry = { name: string; since: string; offered: boolean };

type Run = {
    id: string;
    /** Derived from season and format (`Support/OfferingLabel.php`). */
    label: string;
    /** `label_override`; empty means the derived label. */
    labelOverride: string;
    visibility: Visibility;
    delivery: Delivery;
    startsAt: string | null;
    endsAt: string | null;
    slots: Slot[];
    format: Format;
    venue: string | null;
    teachers: Teacher[];
    capacity: number;
    enforceCapacity: boolean;
    // MOCK-ONLY: the waitlist is switched on school-wide today, not per run.
    waitlistOn: boolean;
    enrolled: number;
    completed: number;
    waitlist: WaitEntry[];
    prices: Price[];
    duration: { amount: number; unit: 'ue' | 'hours' | 'days' };
    language: string;
    certificate: boolean;
    template: string;
    lessons: number;
    quizzes: number;
    drip: Drip;
    live: {
        sessions: boolean;
        audio: boolean;
        video: boolean;
        recordings: boolean;
        recordStudents: boolean;
    };
    permissions: {
        message: boolean;
        announce: boolean;
        moderate: boolean;
        complete: boolean;
        studentsMessage: boolean;
    };
    prerequisite: string;
    restriction: string;
    note: string;
};

const LIVE_ON = {
    sessions: true,
    audio: true,
    video: false,
    recordings: true,
    recordStudents: false,
};
const LIVE_OFF = {
    sessions: false,
    audio: false,
    video: false,
    recordings: false,
    recordStudents: false,
};
const PERMISSIONS = {
    message: true,
    announce: true,
    moderate: true,
    complete: false,
    studentsMessage: true,
};

const HERBST_ONLINE: Run = {
    id: 'herbst-online',
    label: 'Herbst 2026 · Online',
    labelOverride: '',
    visibility: 'published',
    delivery: 'running',
    startsAt: '2026-09-14',
    endsAt: '2026-11-30',
    slots: [{ days: ['Mo', 'Mi'], from: '18:00', to: '19:30' }],
    format: 'online',
    venue: null,
    teachers: [
        { name: 'Layla Haddad', role: 'lead' },
        { name: 'Musa Kaya', role: 'assistant' },
    ],
    capacity: 25,
    enforceCapacity: true,
    waitlistOn: true,
    enrolled: 18,
    completed: 0,
    waitlist: [],
    prices: [
        { id: 1, label: 'Einmalzahlung', kind: 'one_time', amount: 240, active: true, sold: 9 },
        {
            id: 2,
            label: 'In drei Raten',
            kind: 'installment',
            amount: 85,
            count: 3,
            active: true,
            sold: 6,
        },
        { id: 3, label: 'Frühbucher', kind: 'one_time', amount: 199, active: false, sold: 4 },
    ],
    duration: { amount: 30, unit: 'ue' },
    language: 'de',
    certificate: true,
    template: 'Teilnahmeurkunde (Schulvorlage)',
    lessons: 24,
    quizzes: 3,
    drip: 'weekly',
    live: LIVE_ON,
    permissions: PERMISSIONS,
    prerequisite: '',
    restriction: '',
    note: 'Abendgruppe, viele Berufstätige. Musa übernimmt die Mittwoche.',
};

const HERBST_BERLIN: Run = {
    ...HERBST_ONLINE,
    id: 'herbst-berlin',
    label: 'Herbst 2026 · Berlin',
    delivery: 'planned',
    startsAt: '2026-10-10',
    endsAt: '2026-12-19',
    slots: [{ days: ['Sa'], from: '10:00', to: '12:30' }],
    format: 'in_person',
    venue: 'Al-Nur Zentrum · Raum 2',
    teachers: [{ name: 'Omar Krüger', role: 'lead' }],
    capacity: 12,
    enrolled: 12,
    waitlist: [
        { name: 'Karim Saleh', since: '2026-09-21', offered: true },
        { name: 'Lina Mansour', since: '2026-09-24', offered: false },
        { name: 'Tarek Bakri', since: '2026-09-29', offered: false },
    ],
    prices: [
        { id: 4, label: 'Einmalzahlung', kind: 'one_time', amount: 280, active: true, sold: 12 },
    ],
    live: LIVE_OFF,
    note: 'Samstagsgruppe im Zentrum. Bücher liegen im Raum 2.',
};

const FRUEHJAHR_ONLINE: Run = {
    ...HERBST_ONLINE,
    id: 'fruehjahr-online',
    label: 'Frühjahr 2027 · Online',
    visibility: 'draft',
    delivery: 'planned',
    startsAt: '2027-03-02',
    endsAt: '2027-05-11',
    slots: [{ days: ['Di', 'Do'], from: '19:00', to: '20:30' }],
    teachers: [],
    enrolled: 0,
    prices: [],
    language: 'en',
    note: 'Für Englischsprachige. Lehrkraft fragen wir noch an.',
};

const SOMMER_ONLINE: Run = {
    ...HERBST_ONLINE,
    id: 'sommer-online',
    label: 'Sommer 2026 · Online',
    delivery: 'completed',
    startsAt: '2026-06-01',
    endsAt: '2026-08-26',
    teachers: [{ name: 'Layla Haddad', role: 'lead' }],
    enrolled: 0,
    completed: 19,
    prices: [
        { id: 5, label: 'Einmalzahlung', kind: 'one_time', amount: 220, active: true, sold: 22 },
    ],
    note: '',
};

const WINTER_BERLIN: Run = {
    ...HERBST_BERLIN,
    id: 'winter-berlin',
    label: 'Winter 2026 · Berlin',
    visibility: 'draft',
    startsAt: '2026-11-07',
    endsAt: '2027-01-30',
    slots: [{ days: ['Sa'], from: '14:00', to: '15:30' }],
    venue: 'Al-Nur Zentrum · Raum 1',
    teachers: [{ name: 'Mosa Khallaf', role: 'lead' }],
    capacity: 15,
    enrolled: 0,
    waitlist: [],
    prices: [
        { id: 6, label: 'Einmalzahlung', kind: 'one_time', amount: 150, active: true, sold: 0 },
    ],
    duration: { amount: 20, unit: 'ue' },
    certificate: false,
    lessons: 0,
    quizzes: 0,
    drip: 'immediate',
    note: '',
};

type CourseKey = 'arabisch' | 'tajwid';
type Course = {
    key: CourseKey;
    status: Visibility;
    slug: string;
    code: string;
    category: string | null;
    tags: string[];
    level: string;
    funding: string[];
    featured: boolean;
    published: Record<Lang, Fields>;
    pending: Pending[];
    runs: Run[];
};

const EMPTY: Fields = {
    title: '',
    summary: '',
    description: '',
    outcomes: [],
    audience: '',
    prerequisites: '',
    faq: [],
    hero: '',
    icon: '',
    video: '',
    seoTitle: '',
    seoDescription: '',
};

const COURSES: Record<CourseKey, Course> = {
    arabisch: {
        key: 'arabisch',
        status: 'published',
        slug: 'arabisch-fuer-anfaenger',
        code: 'AR-A1',
        category: 'Sprachen › Arabisch',
        tags: ['Arabisch', 'Anfänger', 'Abendkurs'],
        level: 'A1',
        funding: ['Bildungsgutschein (AZAV)'],
        featured: true,
        published: {
            de: {
                title: 'Arabisch für Anfänger',
                summary:
                    'Lerne die arabische Schrift und erste Gespräche in zehn Wochen — ohne Vorkenntnisse.',
                description:
                    'Dieser Kurs beginnt bei null: Alphabet, Aussprache, erste Sätze. Nach zehn Wochen liest du einfache Texte und stellst dich auf Arabisch vor. Jede Woche zwei Live-Stunden und kurze Übungen für zwischendurch.',
                outcomes: [
                    'Das arabische Alphabet lesen und schreiben',
                    'Dich vorstellen und einfache Fragen stellen',
                    'Zahlen, Uhrzeit und Einkaufsgespräche',
                ],
                audience:
                    'Erwachsene und Jugendliche ab 14 ohne Vorkenntnisse — auch wenn du zuerst die Schrift brauchst, um den Koran zu lesen.',
                prerequisites: '',
                faq: [
                    {
                        q: 'Brauche ich Vorkenntnisse?',
                        a: 'Nein. Wir fangen beim ersten Buchstaben an.',
                    },
                    {
                        q: 'Was, wenn ich eine Stunde verpasse?',
                        a: 'Jede Live-Stunde wird aufgenommen. Du siehst sie danach in deinem Kurs.',
                    },
                ],
                hero: 'alphabet-tafel.jpg',
                icon: 'alif.svg',
                video: '',
                seoTitle: 'Arabisch für Anfänger — online und in Berlin | Al-Nur Akademie',
                seoDescription:
                    'Arabisch von null: Schrift, Aussprache, erste Gespräche. Zehn Wochen, live online oder vor Ort in Berlin, mit Zertifikat.',
            },
            en: {
                ...EMPTY,
                title: 'Arabic for Beginners',
                summary: 'Learn the Arabic script and your first conversations in ten weeks.',
                outcomes: [
                    'Read and write the Arabic alphabet',
                    'Introduce yourself and ask simple questions',
                ],
            },
        },
        pending: [
            {
                lang: 'de',
                key: 'summary',
                value: 'Lerne die arabische Schrift und erste Gespräche in zehn Wochen.',
            },
            { lang: 'de', key: 'hero', value: 'kalligrafie-feder.jpg' },
        ],
        runs: [HERBST_ONLINE, HERBST_BERLIN, FRUEHJAHR_ONLINE, SOMMER_ONLINE],
    },
    tajwid: {
        key: 'tajwid',
        status: 'draft',
        slug: 'tajwid-fuer-einsteiger',
        code: '',
        category: null,
        tags: [],
        level: 'Keine Angabe',
        funding: [],
        featured: false,
        published: {
            de: { ...EMPTY, title: 'Tajwid für Einsteiger' },
            en: { ...EMPTY },
        },
        pending: [],
        runs: [WINTER_BERLIN],
    },
};

const VENUES = [
    'Al-Nur Zentrum · Raum 1',
    'Al-Nur Zentrum · Raum 2',
    'Gemeindehaus Neukölln · Saal',
];
const TEACHERS = [
    'Layla Haddad',
    'Musa Kaya',
    'Omar Krüger',
    'Amina Berger',
    'Mosa Khallaf',
    'Leonie Weber',
];
const CATEGORIES = [
    'Sprachen › Arabisch',
    'Sprachen › Deutsch',
    'Religion › Koran & Tajwid',
    'Religion › Fiqh',
    'Kunst',
];
const TAGS = ['Arabisch', 'Anfänger', 'Abendkurs', 'Online', 'Berlin', 'Koran', 'Wochenende'];
const LEVELS = ['Keine Angabe', 'A1', 'A2', 'B1', 'B2', 'C1'];
const FUNDING = ['Bildungsgutschein (AZAV)', 'Bildungsprämie', 'Al-Nur Stipendium'];
const LANGUAGES: Record<string, string> = {
    de: 'Deutsch',
    en: 'Englisch',
    ar: 'Arabisch',
    tr: 'Türkisch',
};
const UNITS: Record<Run['duration']['unit'], string> = {
    ue: 'UE',
    hours: 'Stunden',
    days: 'Tage',
};
const PREREQUISITES = ['Keine', 'Arabisch: Alphabet-Kurs', 'Tajwid für Einsteiger'];

// ---------------------------------------------------------------------------
// Example data — lessons (every run has its own copy) and participants
// ---------------------------------------------------------------------------

type LessonType = 'video' | 'text' | 'attachment' | 'quiz' | 'ai';
type Lesson = { title: string; type: LessonType; minutes: number; preview?: boolean };
const LESSON_TYPE: Record<LessonType, { label: string; icon: LucideIcon }> = {
    video: { label: 'Video', icon: CirclePlay },
    text: { label: 'Text', icon: FileText },
    attachment: { label: 'Datei', icon: Paperclip },
    quiz: { label: 'Quiz', icon: ListChecks },
    ai: { label: 'KI-Gespräch', icon: Bot },
};
const l = (title: string, type: LessonType, minutes: number, preview = false): Lesson => ({
    title,
    type,
    minutes,
    preview,
});
const CHAPTERS: { title: string; lessons: Lesson[] }[] = [
    {
        title: 'Schrift & Laute',
        lessons: [
            l('Das Alphabet, Teil 1', 'video', 12, true),
            l('Das Alphabet, Teil 2', 'video', 14),
            l('Schreibübung', 'attachment', 20),
            l('Lange und kurze Vokale', 'video', 10),
            l('Sonnen- und Mondbuchstaben', 'text', 8),
            l('Quiz: Buchstaben erkennen', 'quiz', 10),
        ],
    },
    {
        title: 'Erste Gespräche',
        lessons: [
            l('Begrüßung und Vorstellung', 'video', 11),
            l('Woher kommst du?', 'video', 9),
            l('Aufgabe: Selbstvorstellung', 'text', 15),
            l('KI-Gespräch: Im Café', 'ai', 10),
            l('Familie und Freunde', 'video', 12),
            l('Quiz: Erste Sätze', 'quiz', 8),
        ],
    },
    {
        title: 'Zahlen & Zeit',
        lessons: [
            l('Zahlen von 1 bis 20', 'video', 13),
            l('Die Uhrzeit', 'video', 10),
            l('Wochentage und Monate', 'text', 8),
            l('Übung: Termine ausmachen', 'attachment', 15),
            l('KI-Gespräch: Ein Termin beim Arzt', 'ai', 10),
            l('Zahlen im Alltag', 'video', 9),
        ],
    },
    {
        title: 'Einkaufen',
        lessons: [
            l('Auf dem Markt', 'video', 12),
            l('Preise fragen', 'video', 9),
            l('Wortschatz: Lebensmittel', 'text', 10),
            l('KI-Gespräch: Beim Bäcker', 'ai', 10),
            l('Ein Einkaufszettel', 'attachment', 15),
            l('Abschlussquiz', 'quiz', 20),
        ],
    },
];
const LESSON_COUNT = CHAPTERS.reduce((n, c) => n + c.lessons.length, 0);
/** The index of each chapter's first lesson across the whole course. */
const CHAPTER_START = CHAPTERS.map((_, i) =>
    CHAPTERS.slice(0, i).reduce((n, c) => n + c.lessons.length, 0),
);

type EnrolmentStatus = 'active' | 'completed' | 'dropped' | 'class_cancelled';
const ENROLMENT_STATUS: Record<
    EnrolmentStatus,
    { label: string; tone: 'success' | 'neutral' | 'faint' | 'destructive' }
> = {
    active: { label: 'Aktiv', tone: 'success' },
    completed: { label: 'Abgeschlossen', tone: 'neutral' },
    dropped: { label: 'Abgebrochen', tone: 'faint' },
    class_cancelled: { label: 'Abgesagt', tone: 'destructive' },
};
type Payment = 'paid' | 'due' | 'sponsor';
const PAYMENT: Record<Payment, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
    paid: { label: 'Bezahlt', tone: 'success' },
    due: { label: 'Rate offen', tone: 'warning' },
    sponsor: { label: 'Gefördert', tone: 'neutral' },
};
type Enrolment = {
    id: number;
    name: string;
    email: string;
    runId: string;
    status: EnrolmentStatus;
    enrolledAt: string;
    done: number;
    payment: Payment;
};

const FIRST = [
    'Yusuf',
    'Leonie',
    'Omar',
    'Hanna',
    'Bilal',
    'Sara',
    'Jonas',
    'Maryam',
    'Elif',
    'Tobias',
    'Aisha',
    'Felix',
    'Zainab',
    'Lukas',
    'Nour',
    'Emma',
    'Ibrahim',
    'Lea',
    'Amir',
    'Mia',
    'Samir',
    'Clara',
    'Hamza',
    'Julia',
    'Fatima',
    'David',
    'Rania',
];
const LAST = [
    'Okafor',
    'Weber',
    'Yılmaz',
    'Schneider',
    'Rahman',
    'Nasser',
    'Demir',
    'Wagner',
    'Mahmoud',
    'Brandt',
    'Ali',
    'Hoffmann',
    'El-Amin',
    'Richter',
    'Fischer',
    'Becker',
    'Aziz',
    'Wolf',
    'Rashid',
    'Neumann',
    'Sadiq',
];
const person = (i: number) => `${FIRST[i % FIRST.length]!} ${LAST[(i * 5 + 3) % LAST.length]!}`;
const emailOf = (name: string) =>
    `${name
        .toLowerCase()
        .replace('ı', 'i')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '.')}@beispiel.de`;

function makeEnrolments(): Enrolment[] {
    const out: Enrolment[] = [];
    const add = (
        runId: string,
        from: number,
        count: number,
        row: (i: number) => Partial<Enrolment>,
    ) => {
        for (let i = 0; i < count; i++) {
            const name = person(from + i);
            out.push({
                id: out.length + 1,
                name,
                email: emailOf(name),
                runId,
                status: 'active',
                enrolledAt: '2026-09-01',
                done: 0,
                payment: 'paid',
                ...row(i),
            });
        }
    };
    add('herbst-online', 0, 19, (i) => ({
        status: i === 18 ? 'dropped' : 'active',
        enrolledAt: `2026-08-${String(4 + i).padStart(2, '0')}`,
        done: i === 18 ? 1 : [9, 7, 8, 4, 9, 6, 2, 9, 5, 3][i % 10]!,
        payment: i % 7 === 2 ? 'due' : i % 9 === 4 ? 'sponsor' : 'paid',
    }));
    add('herbst-berlin', 19, 12, (i) => ({
        enrolledAt: `2026-09-${String(2 + i).padStart(2, '0')}`,
    }));
    add('sommer-online', 31, 22, (i) => ({
        status: i < 19 ? 'completed' : 'dropped',
        enrolledAt: `2026-05-${String(5 + i).padStart(2, '0')}`,
        done: i < 19 ? LESSON_COUNT : 3 + i,
    }));
    return out;
}
const ENROLMENTS = makeEnrolments();

// ---------------------------------------------------------------------------
// Formatting and derived facts
// ---------------------------------------------------------------------------

const dateFmt = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
const shortFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });
const weekdayFmt = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });
const euroFmt = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
});
const day = (iso: string) => new Date(`${iso}T12:00:00`);
const fmt = (iso: string) => dateFmt.format(day(iso));
const fmtShort = (iso: string) => shortFmt.format(day(iso));
const euro = (n: number) => euroFmt.format(n);
const isoOf = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (iso: string, n: number) => isoOf(new Date(day(iso).getTime() + n * 86400000));

const runLabel = (r: Run) => r.labelOverride || r.label;
const range = (r: Run) =>
    r.startsAt && r.endsAt ? `${fmtShort(r.startsAt)}–${fmt(r.endsAt)}` : 'Ohne Termin';
const slotText = (s: Slot) => `${s.days.join(' + ')} ${s.from}–${s.to}`;
const slotsText = (r: Run) =>
    r.delivery === 'on_demand' ? 'jederzeit' : r.slots.map(slotText).join(' · ') || '—';
const placeText = (r: Run) =>
    r.format === 'online'
        ? 'Online'
        : `${r.format === 'hybrid' ? 'Hybrid' : 'Vor Ort'} · ${r.venue ?? 'Ort fehlt'}`;
const priceText = (r: Run) =>
    r.prices
        .filter((p) => p.active)
        .map((p) => (p.kind === 'installment' ? `${p.count} × ${euro(p.amount)}` : euro(p.amount)))
        .join(' oder ');
const lead = (r: Run) => r.teachers.find((t) => t.role === 'lead')?.name ?? null;
const ENDED = new Set<Delivery>(['completed', 'cancelled']);

/** Every session the weekly slots produce between start and end. */
function sessionsOf(r: Run): { date: string; from: string; to: string }[] {
    if (!r.startsAt || !r.endsAt) return [];
    const out: { date: string; from: string; to: string }[] = [];
    for (let d = r.startsAt; d <= r.endsAt; d = addDays(d, 1))
        for (const s of r.slots)
            if (s.days.some((w) => DAY_INDEX[w] === day(d).getDay()))
                out.push({ date: d, from: s.from, to: s.to });
    return out;
}
const sessionDay = (iso: string) => `${weekdayFmt.format(day(iso))} ${fmtShort(iso)}`;

/** When a lesson is released in this run, by its drip rule; null = by hand. */
function releaseOf(r: Run, index: number): string | null {
    if (!r.startsAt) return null;
    if (r.drip === 'immediate') return r.startsAt;
    if (r.drip === 'weekly') return addDays(r.startsAt, Math.floor(index / 3) * 7);
    if (r.drip === 'daily') return addDays(r.startsAt, index);
    return null;
}

/** On the public page: published, its course published, not over. */
const listed = (c: { status: Visibility }, r: Run) =>
    c.status === 'published' && r.visibility === 'published' && !ENDED.has(r.delivery);

const DELIVERY: Record<
    Delivery,
    { label: string; tone: 'success' | 'neutral' | 'faint' | 'destructive' }
> = {
    planned: { label: 'geplant', tone: 'neutral' },
    running: { label: 'läuft', tone: 'success' },
    on_demand: { label: 'auf Abruf', tone: 'neutral' },
    completed: { label: 'beendet', tone: 'faint' },
    cancelled: { label: 'abgesagt', tone: 'destructive' },
};
const FORMAT: Record<Format, string> = { online: 'Online', in_person: 'Vor Ort', hybrid: 'Hybrid' };

/** What a run needs before people can book it — the Überblick's checklist. */
function readiness(r: Run) {
    return [
        { id: 'dates', label: 'Termine', done: !!r.startsAt || r.delivery === 'on_demand' },
        { id: 'price', label: 'Preis', done: r.prices.some((p) => p.active) },
        { id: 'teacher', label: 'Leitende Lehrkraft', done: !!lead(r) },
        { id: 'content', label: 'Lektionen', done: r.lessons > 0 },
        { id: 'venue', label: 'Ort', done: r.format === 'online' || !!r.venue },
        { id: 'certificate', label: 'Zertifikat', done: r.certificate, optional: true },
    ];
}
const READINESS_WHY: Record<string, string> = {
    dates: 'Ohne Termine weiß niemand, wann es losgeht.',
    price: 'Ohne Preis lässt sie sich nicht veröffentlichen.',
    teacher: 'Ohne leitende Lehrkraft kann sie nicht starten.',
    content: 'Teilnehmende fänden einen leeren Kurs vor.',
    venue: 'Vor Ort braucht einen Ort.',
    certificate: '',
};
const READINESS_TAB: Record<string, RunTab> = {
    dates: 'schedule',
    price: 'prices',
    teacher: 'team',
    content: 'content',
    venue: 'schedule',
    certificate: 'certificate',
};

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

type CourseTab = 'page' | 'card' | 'student' | 'runs' | 'settings';
type RunTab =
    | 'overview'
    | 'schedule'
    | 'prices'
    | 'access'
    | 'team'
    | 'content'
    | 'people'
    | 'live'
    | 'certificate'
    | 'communication'
    | 'settings';
type View = { level: 'course'; tab: CourseTab } | { level: 'run'; runId: string; tab: RunTab };

const RUN_TABS: { tab: RunTab; label: string; icon: LucideIcon; group: string | null }[] = [
    { tab: 'overview', label: 'Überblick', icon: LayoutDashboard, group: null },
    { tab: 'schedule', label: 'Termine & Ort', icon: CalendarDays, group: 'Einrichten' },
    { tab: 'prices', label: 'Preise', icon: Euro, group: 'Einrichten' },
    { tab: 'access', label: 'Plätze & Zugang', icon: DoorOpen, group: 'Einrichten' },
    { tab: 'team', label: 'Team', icon: UserRound, group: 'Einrichten' },
    { tab: 'content', label: 'Inhalte', icon: BookOpen, group: 'Einrichten' },
    { tab: 'people', label: 'Teilnehmende', icon: Users, group: 'Betreuen' },
    { tab: 'live', label: 'Live & Aufnahmen', icon: Video, group: 'Betreuen' },
    { tab: 'certificate', label: 'Zertifikat', icon: Award, group: 'Betreuen' },
    { tab: 'communication', label: 'Kommunikation', icon: MessagesSquare, group: 'Betreuen' },
    { tab: 'settings', label: 'Einstellungen', icon: Settings2, group: null },
];
const runTabLabel = (t: RunTab) => RUN_TABS.find((x) => x.tab === t)!.label;

// ---------------------------------------------------------------------------
// Small parts
// ---------------------------------------------------------------------------

const OPTIONS_LABELS = {
    trigger: 'Tabellenoptionen',
    columns: 'Spalten',
    density: 'Zeilenhöhe',
    comfortable: 'Bequem',
    compact: 'Kompakt',
    selection: 'Zeilen auswählen',
    reset: 'Zurücksetzen',
};

function VisibilityBadge({ v }: { v: Visibility }) {
    return v === 'published' ? (
        <Badge tone="success" dot>
            Veröffentlicht
        </Badge>
    ) : (
        <Badge tone="neutral" dot>
            Entwurf
        </Badge>
    );
}

function DeliveryBadge({ d }: { d: Delivery }) {
    return (
        <Badge tone={DELIVERY[d].tone} dot>
            {DELIVERY[d].label}
        </Badge>
    );
}

/** The dot a run carries in menus: filled = on the page, ring = draft, grey = over. */
function RunDot({ run }: { run: Run }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'size-2 shrink-0 rounded-full',
                ENDED.has(run.delivery)
                    ? 'bg-muted-foreground/40'
                    : run.visibility === 'draft'
                      ? 'border border-muted-foreground'
                      : 'bg-success',
            )}
        />
    );
}

type Timing = 'live' | 'publish' | 'save';
/** When a change reaches visitors — the Website-Editor's three badges. */
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

/** One block of a form page: a heading, when it goes live, a line under it. */
function Block({
    title,
    text,
    timing,
    action,
    children,
}: {
    title: string;
    text?: ReactNode;
    timing?: Timing;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{title}</h2>
                        {timing && <TimingBadge timing={timing} />}
                    </div>
                    {text && <p className="text-sm text-muted-foreground">{text}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
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
                'flex gap-3 rounded-lg border p-3 text-sm',
                tone === 'warning' &&
                    'border-warning/40 bg-warning/10 text-warning-tint-foreground',
                tone === 'success' &&
                    'border-success/30 bg-success/10 text-success-tint-foreground',
                tone === 'destructive' &&
                    'border-destructive/30 bg-destructive/10 text-destructive-tint-foreground',
                tone === 'muted' && 'border-border bg-muted/40 text-muted-foreground',
            )}
        >
            <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-col gap-0.5">
                {title && <p className="font-medium">{title}</p>}
                <div>{children}</div>
            </div>
        </div>
    );
}

function Field({
    id,
    label,
    hint,
    children,
    className,
}: {
    id: string;
    label: string;
    hint?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
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
    disabled,
}: {
    id: string;
    label: string;
    hint?: ReactNode;
    checked: boolean;
    onCheckedChange: (on: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
                <Label htmlFor={id} className="text-sm font-medium">
                    {label}
                </Label>
                {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
            </div>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onCheckedChange}
                disabled={disabled}
            />
        </div>
    );
}

/** A link to another page prototype. */
function StoryLink({
    label,
    href,
    story,
    className,
}: {
    label: string;
    href: string;
    story: readonly [string, string];
    className?: string;
}) {
    return (
        <a
            href={href}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                linkTo(story[0], story[1])(e);
            }}
            className={cn(
                'inline-flex shrink-0 items-center gap-1 text-sm font-medium whitespace-nowrap underline-offset-4 hover:underline',
                className,
            )}
        >
            {label}
            <ArrowRight className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
        </a>
    );
}

/** A text button that reads as a link and stays inside the prototype. */
function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
        >
            {children}
            <ArrowRight className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
        </button>
    );
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-fit max-w-full items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:text-foreground"
        >
            <ArrowLeft className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
            <span className="truncate">{label}</span>
        </button>
    );
}

/** A form page: eyebrow with where you are, the title, a line, the content, the unsaved bar. */
function PageFrame({
    eyebrow,
    title,
    text,
    actions,
    wide = false,
    bar,
    children,
}: {
    eyebrow?: string;
    title: string;
    text?: ReactNode;
    actions?: ReactNode;
    wide?: boolean;
    bar?: ReactNode;
    children: ReactNode;
}) {
    return (
        // The unsaved bar is sticky inside the page's own scroll area, so it
        // spans the page only — never the rail or the menu beside it.
        <div className="flex min-h-svh flex-col">
            <div
                className={cn(
                    'mx-auto flex w-full flex-1 flex-col gap-8 px-8 py-8',
                    wide ? 'max-w-5xl' : 'max-w-3xl',
                )}
            >
                <header className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                        {eyebrow && <p className="text-xs text-muted-foreground">{eyebrow}</p>}
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        {text && <p className="text-sm text-muted-foreground">{text}</p>}
                    </div>
                    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </header>
                {children}
            </div>
            {bar}
        </div>
    );
}

function UnsavedBar({
    message,
    extra,
    onDiscard,
    onSave,
    wide = false,
}: {
    message: ReactNode;
    extra?: ReactNode;
    onDiscard: () => void;
    onSave: () => void;
    wide?: boolean;
}) {
    return (
        <div
            role="region"
            aria-label="Ungespeicherte Änderungen"
            className="sticky bottom-0 z-20 border-t border-border bg-background px-8 py-3 shadow-lg"
        >
            <div
                className={cn(
                    'mx-auto flex items-center justify-between gap-4',
                    wide ? 'max-w-5xl' : 'max-w-3xl',
                )}
            >
                <div className="flex flex-col gap-1 text-sm">
                    <p>
                        <span className="font-medium">Nicht gespeichert.</span>{' '}
                        <span className="text-muted-foreground">{message}</span>
                    </p>
                    {extra}
                </div>
                <div className="flex shrink-0 gap-2">
                    <Button variant="outline" onClick={onDiscard}>
                        Verwerfen
                    </Button>
                    <Button onClick={onSave}>Speichern</Button>
                </div>
            </div>
        </div>
    );
}

/** Marks a part of the page whose draft differs from what visitors see. */
function Changed({ on, children }: { on: boolean; children: ReactNode }) {
    if (!on) return <>{children}</>;
    return (
        <div className="flex flex-col items-start gap-1 rounded-md border-2 border-dashed border-warning p-2">
            <Badge variant="warning">Noch nicht live</Badge>
            <div className="w-full">{children}</div>
        </div>
    );
}

/** Admin chrome around a part of the page that comes from the runs and is not edited here. */
function FromRuns({
    label,
    action,
    children,
}: {
    label: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="rounded-lg border border-dashed border-border">
            <div className="flex items-center justify-between gap-2 border-b border-dashed border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                    {label}
                </span>
                {action}
            </div>
            {children}
        </div>
    );
}

/** The uploaded image, as a block of letters. */
function ImageArt({ file, className }: { file: string; className?: string }) {
    return (
        <div
            role="img"
            aria-label={file ? `Bild: ${file}` : 'Kein Bild'}
            className={cn('flex items-center justify-center', className)}
        >
            <span aria-hidden="true" className="text-4xl font-bold">
                {file ? (IMAGE_ART[file] ?? '•') : ''}
            </span>
        </div>
    );
}

function Toast({ message }: { message: string | null }) {
    if (!message) return null;
    return (
        <div
            role="status"
            className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 animate-in items-center gap-3 rounded-lg bg-foreground px-4 py-2.5 text-sm text-background shadow-lg fade-in-0 slide-in-from-bottom-2"
        >
            {message}
        </div>
    );
}

/** The ⋮ menu of a row or a part. */
function RowMenu({ label, children }: { label: string; children: ReactNode }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <IconButton
                    label={label}
                    icon={<EllipsisVertical aria-hidden="true" />}
                    className="size-8"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">{children}</DropdownMenuContent>
        </DropdownMenu>
    );
}

// ---------------------------------------------------------------------------
// The course draft: usePageDraft, plus the changes waiting when the page opens
// and publishing a selection
// ---------------------------------------------------------------------------

type Draft = PageDraftApi<Fields, Lang>;
type Change = PageDraftChange<Fields, Lang>;
const changeId = (c: Change) => `${c.lang}:${c.key}`;

function useCourseDraft(course: Course) {
    const page = usePageDraft<Fields, Lang>(course.published);
    // MOCK-ONLY: course marketing has no draft state today — every save is live.
    const applied = useRef(false);
    useEffect(() => {
        if (applied.current) return;
        applied.current = true;
        for (const p of course.pending) page.set(p.lang, p.key, p.value as never);
        // Once, on mount: the changes somebody left unpublished.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Publishing a selection: put the rest back to live, publish on the next
    // render once the draft has settled, then restore them as drafts.
    const held = useRef<{ lang: Lang; key: FieldKey; value: unknown }[] | null>(null);
    useEffect(() => {
        const h = held.current;
        if (!h) return;
        held.current = null;
        page.publish();
        for (const x of h) page.set(x.lang, x.key, x.value as never);
    });

    return {
        page,
        revert: (c: Change) => page.set(c.lang, c.key, page.published[c.lang][c.key] as never),
        publish: (keep: Change[]) => {
            if (keep.length === 0) {
                page.publish();
                return;
            }
            held.current = keep.map((c) => ({
                lang: c.lang,
                key: c.key,
                value: page.draft[c.lang][c.key],
            }));
            for (const c of keep) page.set(c.lang, c.key, page.published[c.lang][c.key] as never);
        },
    };
}

/** What the page needs, per language — for the checklist and the language chips. */
function pageChecks(f: Fields, de: Fields) {
    return [
        { id: 'title', label: FIELD_NAMES.title, done: !!f.title },
        { id: 'summary', label: FIELD_NAMES.summary, done: !!f.summary },
        { id: 'description', label: FIELD_NAMES.description, done: !!f.description },
        { id: 'outcomes', label: FIELD_NAMES.outcomes, done: f.outcomes.length > 0 },
        { id: 'hero', label: FIELD_NAMES.hero, done: !!de.hero },
        { id: 'audience', label: FIELD_NAMES.audience, done: !!f.audience, optional: true },
        {
            id: 'prerequisites',
            label: FIELD_NAMES.prerequisites,
            done: !!f.prerequisites,
            optional: true,
        },
        { id: 'faq', label: FIELD_NAMES.faq, done: f.faq.length > 0, optional: true },
        { id: 'video', label: FIELD_NAMES.video, done: !!de.video, optional: true },
    ];
}
const CHECKLIST_LABELS = (heading: string) => ({
    heading,
    complete: 'alles Nötige da',
    incomplete: 'Pflichtangaben fehlen',
    optional: 'optional',
    done: 'ausgefüllt',
    missing: 'fehlt',
});

// ---------------------------------------------------------------------------
// Shell and the two menus
// ---------------------------------------------------------------------------

function Shell({ menu, children }: { menu: ReactNode; children: ReactNode }) {
    return (
        <AdminLayout
            rail={
                <AppRail
                    label="Bereiche"
                    logo={
                        <span className="flex size-9 items-center justify-center rounded-lg bg-background text-sm font-bold text-foreground">
                            B
                        </span>
                    }
                >
                    <AppRailItem
                        icon={BookOpen}
                        label="Kurse"
                        active
                        onClick={linkTo('Pages/Admin/Kursverwaltung', 'Kursliste')}
                    />
                    <AppRailItem
                        icon={Users}
                        label="Nutzer"
                        onClick={linkTo('Pages/Admin/Nutzerverwaltung', 'Nutzerliste')}
                    />
                    <AppRailItem
                        icon={PanelsTopLeft}
                        label="Website"
                        onClick={linkTo('Pages/Admin/Website-Editor', 'Navigator')}
                    />
                    <AppRailItem
                        icon={Video}
                        label="Live"
                        onClick={linkTo('Pages/Admin/Live', 'Sitzungen')}
                    />
                    <AppRailItem
                        icon={CreditCard}
                        label="Zahlungen"
                        onClick={linkTo('Pages/Admin/Zahlungen', 'Bestellungen')}
                    />
                    <AppRailItem
                        icon={HandCoins}
                        label="Sponsoren"
                        onClick={linkTo('Pages/Admin/Sponsoren', 'Sponsoren')}
                    />
                    <AppRailItem
                        icon={MessagesSquare}
                        label="Kommunikation"
                        onClick={linkTo('Pages/Admin/Kommunikation', 'Unterhaltungen')}
                    />
                    <AppRailSpacer />
                    <AppRailItem
                        icon={Settings2}
                        label="System"
                        onClick={linkTo('Pages/Admin/System', 'Uebersicht')}
                    />
                    <AppRailItem icon={UserRound} label="Konto" onClick={() => {}} />
                </AppRail>
            }
            sidebar={menu}
        >
            {children}
        </AdminLayout>
    );
}

function MenuItem({
    active,
    icon: Icon,
    label,
    count,
    extra,
    onClick,
}: {
    active: boolean;
    icon: LucideIcon;
    label: string;
    count?: number;
    extra?: ReactNode;
    onClick: () => void;
}) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton active={active} onClick={onClick}>
                <Icon aria-hidden="true" />
                <span className="flex-1 truncate">{label}</span>
                {extra}
                {count !== undefined && (
                    <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                )}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

function CourseMenu({
    course,
    title,
    runs,
    view,
    onView,
    changes,
}: {
    course: Course;
    title: string;
    runs: Run[];
    view: View;
    onView: (v: View) => void;
    changes: number;
}) {
    const tab = view.level === 'course' ? view.tab : null;
    const go = (t: CourseTab) => () => onView({ level: 'course', tab: t });
    return (
        <Sidebar
            label="Kurs"
            resize={{
                label: 'Menü verbreitern oder verschmälern',
                storageKey: 'storybook.page.kurs-editor.menu',
            }}
            defaultWidth={256}
        >
            <SidebarHeader>
                <BackLink
                    label="Alle Kurse"
                    onClick={linkTo('Pages/Admin/Kursverwaltung', 'Kursliste')}
                />
                <div className="flex flex-col gap-1 px-2 pt-2">
                    <span className="text-xs font-medium text-muted-foreground">Kurs</span>
                    <div className="text-base leading-tight font-semibold">
                        {title || 'Ohne Titel'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {course.category ?? 'Ohne Kategorie'}
                        {course.code && ` · ${course.code}`}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        <VisibilityBadge v={course.status} />
                        {changes > 0 && (
                            <Badge tone="warning">
                                {changes === 1
                                    ? '1 Änderung nicht live'
                                    : `${changes} Änderungen nicht live`}
                            </Badge>
                        )}
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup label="Auftritt">
                    <SidebarMenu>
                        <MenuItem
                            active={tab === 'page'}
                            icon={FileText}
                            label="Kursseite"
                            onClick={go('page')}
                        />
                        <MenuItem
                            active={tab === 'card'}
                            icon={LayoutGrid}
                            label="Katalogkarte"
                            onClick={go('card')}
                        />
                        <MenuItem
                            active={tab === 'student'}
                            icon={GraduationCap}
                            label="Teilnehmer-Ansicht"
                            onClick={go('student')}
                        />
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Verwalten">
                    <SidebarMenu>
                        <MenuItem
                            active={tab === 'runs'}
                            icon={CalendarRange}
                            label="Ausführungen"
                            count={runs.length}
                            onClick={go('runs')}
                        />
                        <MenuItem
                            active={tab === 'settings'}
                            icon={Settings2}
                            label="Einstellungen"
                            onClick={go('settings')}
                        />
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Ausführungen öffnen">
                    <SidebarMenu>
                        {runs.map((r) => (
                            <SidebarMenuItem key={r.id}>
                                <SidebarMenuButton
                                    onClick={() =>
                                        onView({ level: 'run', runId: r.id, tab: 'overview' })
                                    }
                                    className={cn(ENDED.has(r.delivery) && 'text-muted-foreground')}
                                >
                                    <RunDot run={r} />
                                    <span className="min-w-0 flex-1 truncate">{runLabel(r)}</span>
                                    <span className="text-xs text-muted-foreground tabular-nums">
                                        {r.visibility === 'draft'
                                            ? 'Entwurf'
                                            : ENDED.has(r.delivery)
                                              ? DELIVERY[r.delivery].label
                                              : `${r.enrolled}/${r.capacity}`}
                                    </span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <p className="px-2 text-xs text-muted-foreground">
                    Termine, Preise, Inhalte, Teilnehmende und Zertifikat gehören zur jeweiligen
                    Ausführung.
                </p>
            </SidebarFooter>
        </Sidebar>
    );
}

function RunMenu({
    courseTitle,
    run,
    runs,
    view,
    onView,
}: {
    courseTitle: string;
    run: Run;
    runs: Run[];
    view: View;
    onView: (v: View) => void;
}) {
    const tab = view.level === 'run' ? view.tab : null;
    const people = ENROLMENTS.filter((e) => e.runId === run.id).length;
    const item = (t: (typeof RUN_TABS)[number]) => (
        <MenuItem
            key={t.tab}
            active={tab === t.tab}
            icon={t.icon}
            label={t.label}
            count={t.tab === 'people' ? people : undefined}
            onClick={() => onView({ level: 'run', runId: run.id, tab: t.tab })}
        />
    );
    const group = (g: string | null) => RUN_TABS.filter((t) => t.group === g);
    return (
        <Sidebar
            label="Ausführung"
            resize={{
                label: 'Menü verbreitern oder verschmälern',
                storageKey: 'storybook.page.kurs-editor.menu',
            }}
            defaultWidth={256}
        >
            <SidebarHeader>
                <BackLink
                    label={courseTitle}
                    onClick={() => onView({ level: 'course', tab: 'runs' })}
                />
                <div className="flex flex-col gap-1 px-2 pt-2">
                    <span className="text-xs font-medium text-muted-foreground">
                        Ausführung von {courseTitle}
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="-mx-1 flex w-fit max-w-full items-center gap-1 rounded-md px-1 text-start text-base leading-tight font-semibold hover:bg-sidebar-accent"
                            >
                                <span className="truncate">{runLabel(run)}</span>
                                <ChevronsUpDown
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <span className="sr-only">— andere Ausführung öffnen</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {runs.map((r) => (
                                <DropdownMenuItem
                                    key={r.id}
                                    onSelect={() =>
                                        onView({
                                            level: 'run',
                                            runId: r.id,
                                            tab: tab ?? 'overview',
                                        })
                                    }
                                >
                                    <RunDot run={r} />
                                    <span className="flex-1">{runLabel(r)}</span>
                                    {r.id === run.id && <Check aria-hidden="true" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="text-xs text-muted-foreground">
                        {range(run)} · {FORMAT[run.format]}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                        <VisibilityBadge v={run.visibility} />
                        <DeliveryBadge d={run.delivery} />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>{group(null).slice(0, 1).map(item)}</SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Einrichten">
                    <SidebarMenu>{group('Einrichten').map(item)}</SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Betreuen">
                    <SidebarMenu>{group('Betreuen').map(item)}</SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarMenu>{group(null).slice(1).map(item)}</SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <p className="px-2 text-xs text-muted-foreground">
                    Gilt nur für diese Ausführung. Texte und Bilder der Kursseite bearbeitest du im
                    Kurs.
                </p>
            </SidebarFooter>
        </Sidebar>
    );
}

// ---------------------------------------------------------------------------
// Kurs › Kursseite — the real public page, edited where it stands
// ---------------------------------------------------------------------------

function DraftToolbar({
    draft,
    lang,
    onLang,
    onPublish,
    path,
}: {
    draft: Draft;
    lang: Lang;
    onLang: (l: Lang) => void;
    onPublish: () => void;
    path: string;
}) {
    const n = draft.changes.length;
    const progress = (x: Lang) => {
        const c = pageChecks(draft.draft[x], draft.draft.de);
        return { done: c.filter((i) => i.done).length, total: c.length };
    };
    return (
        <>
            <LanguageSelect
                languages={[
                    { code: 'de', label: 'Deutsch', flag: GermanyFlag, ...progress('de') },
                    { code: 'en', label: 'Englisch', flag: UnitedKingdomFlag, ...progress('en') },
                ]}
                value={lang}
                onValueChange={(code) => onLang(code as Lang)}
                labels={{
                    label: 'Sprache der Seite',
                    progress: (d, t) => `${d} von ${t} ausgefüllt`,
                }}
            />
            <span className="truncate font-mono text-xs text-muted-foreground">{path}</span>
            <span className="flex-1" />
            <span
                role="status"
                className="flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground"
            >
                {n > 0 && (
                    <>
                        <Check className="size-3.5 text-success" aria-hidden="true" />
                        Entwurf gespeichert
                    </>
                )}
            </span>
            <Button variant="outline" size="sm" asChild>
                <a href={`#/kurse/${path.split('/').at(-1) ?? ''}`}>
                    <ExternalLink aria-hidden="true" />
                    Ansehen
                </a>
            </Button>
            <Button
                size="sm"
                disabled={n === 0}
                tooltip={n === 0 ? 'Alles ist live' : 'Zeigt dir vorher, was sich ändert'}
                onClick={onPublish}
            >
                {n === 0 ? 'Veröffentlichen' : `Veröffentlichen · ${n}`}
            </Button>
        </>
    );
}

/** The list of unpublished changes, each with its own undo, and "Alle verwerfen". */
function NotLive({
    draft,
    onRevert,
    onDiscard,
}: {
    draft: Draft;
    onRevert: (c: Change) => void;
    onDiscard: () => void;
}) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-xs font-medium text-muted-foreground">Noch nicht live</h2>
            {draft.changes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    Nichts — Besucher sehen genau diese Seite.
                </p>
            ) : (
                <>
                    <ul className="flex flex-col gap-0.5 text-sm">
                        {draft.changes.map((c) => (
                            <li key={changeId(c)} className="flex items-center gap-2">
                                <Pencil
                                    className="size-3.5 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1 truncate">
                                    {FIELD_NAMES[c.key]}
                                    {!SHARED.has(c.key) && (
                                        <span className="ms-1.5 text-xs text-muted-foreground">
                                            {c.lang.toUpperCase()}
                                        </span>
                                    )}
                                </span>
                                <IconButton
                                    label={`${FIELD_NAMES[c.key]}: Änderung verwerfen`}
                                    icon={<Undo2 aria-hidden="true" />}
                                    className="size-7"
                                    onClick={() => onRevert(c)}
                                />
                            </li>
                        ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                        Besucher sehen die alte Fassung, bis du veröffentlichst.
                    </p>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-fit text-muted-foreground"
                        onClick={onDiscard}
                    >
                        <Trash2 aria-hidden="true" />
                        Alle verwerfen
                    </Button>
                </>
            )}
        </div>
    );
}

function PageSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3 px-8 py-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            {children}
        </section>
    );
}

/** "+ Lernziel hinzufügen" that becomes a field in place. */
function AddLine({ label, onAdd }: { label: string; onAdd: (value: string) => void }) {
    const [open, setOpen] = useState(false);
    if (!open)
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
                <Plus className="size-4" aria-hidden="true" />
                {label}
            </button>
        );
    return (
        <input
            // Opened by the person's own click, so focus follows it.
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            aria-label={label}
            placeholder={label}
            onBlur={(e) => {
                if (e.currentTarget.value.trim()) onAdd(e.currentTarget.value.trim());
                setOpen(false);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    e.currentTarget.value = '';
                    setOpen(false);
                }
                if (e.key === 'Enter') e.currentTarget.blur();
            }}
            className="w-full rounded-md bg-background px-2 py-1 text-sm ring-2 ring-ring outline-none"
        />
    );
}

function CoursePageView({
    course,
    runs,
    draft,
    lang,
    onLang,
    onPublish,
    onRevert,
    onDiscard,
    onView,
}: {
    course: Course;
    runs: Run[];
    draft: Draft;
    lang: Lang;
    onLang: (l: Lang) => void;
    onPublish: () => void;
    onRevert: (c: Change) => void;
    onDiscard: () => void;
    onView: (v: View) => void;
}) {
    const [device, setDevice] = useState<PageEditorDevice>('desktop');
    const f = draft.draft[lang];
    const de = draft.draft.de;
    const set = <K extends FieldKey>(key: K, value: Fields[K]) =>
        draft.set(SHARED.has(key) ? 'de' : lang, key, value);
    const changed = (key: FieldKey) =>
        draft.changes.some((c) => c.key === key && c.lang === (SHARED.has(key) ? 'de' : lang));

    const onPage = runs.filter((r) => listed(course, r));
    const offPage = runs.filter((r) => !listed(course, r));
    const facts = [
        [
            'Dauer',
            [...new Set(onPage.map((r) => `${r.duration.amount} ${UNITS[r.duration.unit]}`))].join(
                ' / ',
            ),
        ],
        ['Sprache', [...new Set(onPage.map((r) => LANGUAGES[r.language]))].join(', ')],
        [
            'Format',
            [
                ...new Set(
                    onPage.map((r) =>
                        r.format === 'online' ? 'Online' : `Vor Ort (${r.venue ?? '—'})`,
                    ),
                ),
            ].join(' oder '),
        ],
        ['Zertifikat', onPage.some((r) => r.certificate) ? 'Ja' : 'Nein'],
    ] as const;
    const teachers = [...new Set(onPage.flatMap((r) => r.teachers.map((t) => t.name)))];
    const openRun = (id: string) => onView({ level: 'run', runId: id, tab: 'overview' });

    return (
        <PageEditor
            device={device}
            onDeviceChange={setDevice}
            storageKey="storybook.page.kurs-editor.aside"
            labels={{
                preview: 'Kursseite (Vorschau zum Bearbeiten)',
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
                    disabled={!draft.canUndo}
                    className="text-muted-foreground"
                    onClick={() => draft.undo()}
                >
                    <Undo2 aria-hidden="true" />
                </Button>
            }
            toolbar={
                <DraftToolbar
                    draft={draft}
                    lang={lang}
                    onLang={onLang}
                    onPublish={onPublish}
                    path={`/kurse/${course.slug}`}
                />
            }
            aside={
                <>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-medium text-muted-foreground">Kurs</h2>
                        <VisibilityBadge v={course.status} />
                        <p className="text-sm text-muted-foreground">
                            {course.status === 'published'
                                ? 'Die Seite ist online. Veröffentlichte Änderungen sehen Besucher sofort.'
                                : 'Ein Entwurf — die Seite ist noch nicht erreichbar. Du kannst sie trotzdem fertig machen.'}
                        </p>
                        <TextLink onClick={() => onView({ level: 'course', tab: 'settings' })}>
                            Sichtbarkeit ändern
                        </TextLink>
                    </div>
                    <CompletionChecklist
                        items={pageChecks(f, de)}
                        labels={CHECKLIST_LABELS(`Seite (${lang.toUpperCase()})`)}
                    />
                    <NotLive draft={draft} onRevert={onRevert} onDiscard={onDiscard} />
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-medium text-muted-foreground">Abschnitte</h2>
                        <p className="text-sm text-muted-foreground">
                            Welche Abschnitte eine Kursseite hat und in welcher Reihenfolge, gilt
                            für alle Kurse — das legst du im Website-Editor fest.
                        </p>
                        <StoryLink
                            label="Im Website-Editor"
                            href="#/admin/design/studio"
                            story={['Pages/Admin/Website-Editor', 'Navigator']}
                        />
                    </div>
                </>
            }
        >
            <header className="bg-primary px-8 pt-10 pb-8 text-primary-foreground">
                <div className={cn('flex gap-6', device === 'phone' ? 'flex-col' : 'items-start')}>
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <span className="w-fit rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-xs font-medium">
                            {course.category ?? 'Ohne Kategorie'}
                            {course.level !== 'Keine Angabe' && ` · Stufe ${course.level}`}
                        </span>
                        <Changed on={changed('title')}>
                            <InlineText
                                as="h1"
                                label="Titel"
                                placeholder="Wie heißt der Kurs?"
                                value={f.title}
                                onChange={(v) => set('title', v)}
                                inverse
                                className="text-3xl font-bold tracking-tight"
                            />
                        </Changed>
                        <Changed on={changed('summary')}>
                            <InlineText
                                label="Kurzbeschreibung"
                                placeholder="Ein Satz, der im Katalog unter dem Titel steht"
                                value={f.summary}
                                onChange={(v) => set('summary', v)}
                                inverse
                                className="text-base"
                            />
                        </Changed>
                    </div>
                    <Changed on={changed('hero')}>
                        <div className="flex w-48 flex-col gap-2">
                            <ImageArt
                                file={de.hero}
                                className="aspect-video rounded-lg bg-primary-foreground/15"
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                    set(
                                        'hero',
                                        de.hero === 'kalligrafie-feder.jpg'
                                            ? 'alphabet-tafel.jpg'
                                            : 'kalligrafie-feder.jpg',
                                    )
                                }
                            >
                                <ImageUp aria-hidden="true" />
                                Titelbild ersetzen
                            </Button>
                        </div>
                    </Changed>
                </div>
            </header>

            <div className="flex flex-col gap-4 px-8 pt-6">
                <FromRuns label="Eckdaten · aus den buchbaren Ausführungen">
                    {/* MOCK-ONLY: the real parent page hard-codes duration, level and instructors to empty. */}
                    <dl
                        className={cn(
                            'grid gap-x-6 gap-y-2 px-4 py-3 text-sm',
                            device === 'phone' ? 'grid-cols-1' : 'grid-cols-2',
                        )}
                    >
                        {facts.map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                                <dt className="text-muted-foreground">{k}</dt>
                                <dd className="font-medium">{v || '—'}</dd>
                            </div>
                        ))}
                    </dl>
                </FromRuns>

                <FromRuns
                    label="Termine · aus den Ausführungen, hier nicht bearbeitbar"
                    action={
                        <button
                            type="button"
                            onClick={() => onView({ level: 'course', tab: 'runs' })}
                            className="font-medium text-foreground hover:underline"
                        >
                            Ausführungen verwalten
                        </button>
                    }
                >
                    {onPage.length === 0 && (
                        <p className="px-4 py-3 text-sm">
                            Nächster Termin auf Anfrage —{' '}
                            <span className="text-muted-foreground">
                                so steht es da, solange keine Ausführung buchbar ist.
                            </span>
                        </p>
                    )}
                    {onPage.map((r) => {
                        const full = r.enrolled >= r.capacity;
                        return (
                            <div
                                key={r.id}
                                className={cn(
                                    'flex gap-3 px-4 py-3 not-last:border-b not-last:border-border',
                                    device === 'phone' ? 'flex-col items-start' : 'items-center',
                                )}
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium">{runLabel(r)}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {range(r)} · {slotsText(r)} ·{' '}
                                        {full
                                            ? 'ausgebucht'
                                            : `${r.capacity - r.enrolled} Plätze frei`}
                                    </div>
                                </div>
                                <span className="text-sm font-semibold tabular-nums">
                                    {priceText(r)}
                                </span>
                                <Button
                                    size="sm"
                                    variant={full ? 'outline' : 'default'}
                                    tabIndex={-1}
                                    aria-hidden="true"
                                >
                                    {full ? 'Auf die Warteliste' : 'Buchen'}
                                </Button>
                                <IconButton
                                    label={`Ausführung „${runLabel(r)}“ öffnen`}
                                    icon={<ArrowRight aria-hidden="true" />}
                                    className="size-8"
                                    onClick={() => openRun(r.id)}
                                />
                            </div>
                        );
                    })}
                    {offPage.length > 0 && (
                        <p className="border-t border-dashed border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
                            Nicht auf der Seite:{' '}
                            {offPage
                                .map(
                                    (r) =>
                                        `${runLabel(r)} (${r.visibility === 'draft' ? 'Entwurf' : DELIVERY[r.delivery].label})`,
                                )
                                .join(', ')}
                        </p>
                    )}
                </FromRuns>
            </div>

            <PageSection title="Über den Kurs">
                <Changed on={changed('description')}>
                    <InlineText
                        multiline
                        label="Über den Kurs"
                        placeholder="Worum geht es, wie läuft er ab, was ist besonders?"
                        value={f.description}
                        onChange={(v) => set('description', v)}
                        className="leading-relaxed"
                    />
                </Changed>
            </PageSection>

            <PageSection title="Das lernst du">
                <Changed on={changed('outcomes')}>
                    <ul className="flex flex-col gap-1.5">
                        {f.outcomes.map((o, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <Check
                                    className="mt-1 size-4 shrink-0 text-success"
                                    aria-hidden="true"
                                />
                                <div className="min-w-0 flex-1">
                                    <InlineText
                                        label={`Lernziel ${i + 1}`}
                                        placeholder="Was kann man danach?"
                                        value={o}
                                        onChange={(v) =>
                                            set(
                                                'outcomes',
                                                v
                                                    ? f.outcomes.map((x, j) => (j === i ? v : x))
                                                    : f.outcomes.filter((_, j) => j !== i),
                                            )
                                        }
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <AddLine
                        label="Lernziel hinzufügen"
                        onAdd={(v) => set('outcomes', [...f.outcomes, v])}
                    />
                </Changed>
            </PageSection>

            <PageSection title="Für wen ist der Kurs?">
                <Changed on={changed('audience')}>
                    <InlineText
                        multiline
                        label="Für wen"
                        placeholder="z. B. „Erwachsene ohne Vorkenntnisse“"
                        value={f.audience}
                        onChange={(v) => set('audience', v)}
                    />
                </Changed>
            </PageSection>

            <PageSection title="Voraussetzungen">
                <Changed on={changed('prerequisites')}>
                    <InlineText
                        multiline
                        label="Voraussetzungen"
                        placeholder="Was man mitbringen sollte — oder „keine“"
                        value={f.prerequisites}
                        onChange={(v) => set('prerequisites', v)}
                    />
                </Changed>
            </PageSection>

            {teachers.length > 0 && (
                <div className="px-8 py-2">
                    <FromRuns label="Lehrkräfte · aus den buchbaren Ausführungen">
                        <ul className="flex flex-wrap gap-4 px-4 py-3 text-sm">
                            {teachers.map((t) => (
                                <li key={t} className="flex items-center gap-2">
                                    <InitialsAvatar name={t} size="sm" colored />
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </FromRuns>
                </div>
            )}

            <PageSection title="Häufige Fragen">
                <Changed on={changed('faq')}>
                    {f.faq.length > 0 && (
                        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                            {f.faq.map((item, i) => (
                                <div key={i} className="flex flex-col gap-1 px-4 py-3">
                                    <InlineText
                                        as="h3"
                                        label={`Frage ${i + 1}`}
                                        placeholder="Frage"
                                        value={item.q}
                                        onChange={(v) =>
                                            set(
                                                'faq',
                                                f.faq.map((x, j) => (j === i ? { ...x, q: v } : x)),
                                            )
                                        }
                                        className="text-sm font-medium"
                                    />
                                    <InlineText
                                        multiline
                                        label={`Antwort ${i + 1}`}
                                        placeholder="Antwort"
                                        value={item.a}
                                        onChange={(v) =>
                                            set(
                                                'faq',
                                                f.faq.map((x, j) => (j === i ? { ...x, a: v } : x)),
                                            )
                                        }
                                        className="text-sm text-muted-foreground"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <AddLine
                        label={f.faq.length ? 'Frage hinzufügen' : 'Erste Frage hinzufügen'}
                        onAdd={(q) => set('faq', [...f.faq, { q, a: '' }])}
                    />
                </Changed>
            </PageSection>

            <PageSection title="Vorschau-Video">
                <Changed on={changed('video')}>
                    <InlineText
                        label="Vorschau-Video"
                        placeholder="Link zu einem kurzen Video, das vor dem Buchen zu sehen ist"
                        value={de.video}
                        onChange={(v) => set('video', v)}
                    />
                </Changed>
            </PageSection>
        </PageEditor>
    );
}

// ---------------------------------------------------------------------------
// Kurs › "Was geht live?" — the publish dialog
// ---------------------------------------------------------------------------

function ValueText({ k, value }: { k: FieldKey; value: unknown }) {
    if (k === 'outcomes')
        return (value as string[]).length ? (
            <ul className="flex flex-col gap-0.5">
                {(value as string[]).map((x) => (
                    <li key={x}>– {x}</li>
                ))}
            </ul>
        ) : (
            <>leer</>
        );
    if (k === 'faq')
        return (value as Fields['faq']).length ? (
            <ul className="flex flex-col gap-0.5">
                {(value as Fields['faq']).map((x) => (
                    <li key={x.q}>– {x.q}</li>
                ))}
            </ul>
        ) : (
            <>leer</>
        );
    return <>{(value as string) || 'leer'}</>;
}

function PublishDialog({
    course,
    runs,
    draft,
    onOpenChange,
    onPublish,
    onOpenRun,
}: {
    course: Course;
    runs: Run[];
    draft: Draft;
    onOpenChange: (open: boolean) => void;
    onPublish: (selected: Change[]) => void;
    onOpenRun: (id: string) => void;
}) {
    const id = useId();
    // Unticked, not ticked: a change that arrives later starts ticked.
    const [skipped, setSkipped] = useState<Set<string>>(() => new Set());
    const chosen = draft.changes.filter((c) => !skipped.has(changeId(c)));
    const toggle = (cid: string, on: boolean) =>
        setSkipped((s) => {
            const n = new Set(s);
            if (on) n.delete(cid);
            else n.add(cid);
            return n;
        });
    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent closeLabel="Schließen" className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Was geht live?</DialogTitle>
                    <DialogDescription>
                        Die Texte und Bilder von „{draft.draft.de.title}“ — auf der Kursseite und
                        auf der Katalogkarte. Du siehst vorher, was sich für Besucher ändert.
                    </DialogDescription>
                </DialogHeader>

                <section aria-labelledby={`${id}-page`} className="flex flex-col gap-2">
                    <h3 id={`${id}-page`} className="flex items-center gap-2 text-sm font-medium">
                        Kursseite und Katalogkarte
                        <Badge tone="warning">
                            {draft.changes.length === 1
                                ? '1 Änderung'
                                : `${draft.changes.length} Änderungen`}
                        </Badge>
                    </h3>
                    <ul className="flex flex-col gap-2">
                        {draft.changes.map((c) => {
                            const cid = changeId(c);
                            const before = draft.published[c.lang][c.key];
                            const after = draft.draft[c.lang][c.key];
                            return (
                                <li
                                    key={cid}
                                    className="flex flex-col gap-2 rounded-lg border border-border p-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id={`${id}-${cid}`}
                                            checked={!skipped.has(cid)}
                                            onCheckedChange={(v) => toggle(cid, v === true)}
                                        />
                                        <Label htmlFor={`${id}-${cid}`} className="font-medium">
                                            {FIELD_NAMES[c.key]}
                                            {!SHARED.has(c.key) && (
                                                <span className="font-normal text-muted-foreground">
                                                    {' '}
                                                    · {LANG_NAME[c.lang]}
                                                </span>
                                            )}
                                        </Label>
                                    </div>
                                    {SHARED.has(c.key) && c.key !== 'video' ? (
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {[
                                                ['Bisher', before as string],
                                                ['Neu', after as string],
                                            ].map(([k, file]) => (
                                                <div key={k} className="flex items-center gap-3">
                                                    <ImageArt
                                                        file={file!}
                                                        className="h-16 w-24 rounded-md bg-primary text-primary-foreground"
                                                    />
                                                    <span className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">
                                                            {k}
                                                        </span>
                                                        <span className="font-mono text-xs">
                                                            {file}
                                                        </span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="rounded-md bg-destructive/10 p-2 text-destructive-tint-foreground">
                                                <div className="text-xs font-medium">Bisher</div>
                                                <ValueText k={c.key} value={before} />
                                            </div>
                                            <div className="rounded-md bg-success/10 p-2 text-success-tint-foreground">
                                                <div className="text-xs font-medium">Neu</div>
                                                <ValueText k={c.key} value={after} />
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section aria-labelledby={`${id}-runs`} className="flex flex-col gap-2">
                    <h3 id={`${id}-runs`} className="text-sm font-medium">
                        Ausführungen{' '}
                        <span className="font-normal text-muted-foreground">
                            · jede hat ihren eigenen Schalter und ist davon nicht betroffen
                        </span>
                    </h3>
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                        {runs.map((r) => (
                            <li key={r.id} className="flex items-center gap-3 px-3 py-2">
                                <RunDot run={r} />
                                <span className="min-w-0 flex-1">
                                    <span className="font-medium">{runLabel(r)}</span>
                                    <span className="block text-xs text-muted-foreground">
                                        {listed(course, r)
                                            ? r.enrolled >= r.capacity
                                                ? 'auf der Seite · ausgebucht, Warteliste offen'
                                                : 'auf der Seite · buchbar'
                                            : r.visibility === 'draft'
                                              ? 'nicht auf der Seite · Entwurf'
                                              : `nicht auf der Seite · ${DELIVERY[r.delivery].label}`}
                                    </span>
                                </span>
                                {r.visibility === 'draft' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onOpenRun(r.id)}
                                    >
                                        Öffnen
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>

                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        {chosen.length === draft.changes.length
                            ? 'Danach sehen Besucher genau das, was du gerade bearbeitest.'
                            : `${draft.changes.length - chosen.length} nicht ausgewählte Änderung${draft.changes.length - chosen.length === 1 ? '' : 'en'} bleib${draft.changes.length - chosen.length === 1 ? 't' : 'en'} Entwurf.`}{' '}
                        Suchmaschinen merken es meist innerhalb eines Tages.
                    </p>
                    <div className="flex shrink-0 gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
                        </Button>
                        <Button
                            disabled={chosen.length === 0}
                            onClick={() => {
                                onPublish(chosen);
                                onOpenChange(false);
                            }}
                        >
                            {chosen.length === 1
                                ? '1 Änderung veröffentlichen'
                                : `${chosen.length} Änderungen veröffentlichen`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Kurs › Katalogkarte
// ---------------------------------------------------------------------------

function CardView({
    course,
    runs,
    draft,
    lang,
    onLang,
    onPublish,
    onRevert,
    onDiscard,
    onView,
}: {
    course: Course;
    runs: Run[];
    draft: Draft;
    lang: Lang;
    onLang: (l: Lang) => void;
    onPublish: () => void;
    onRevert: (c: Change) => void;
    onDiscard: () => void;
    onView: (v: View) => void;
}) {
    const [device, setDevice] = useState<PageEditorDevice>('desktop');
    const f = draft.draft[lang];
    const de = draft.draft.de;
    const changed = (key: FieldKey) =>
        draft.changes.some((c) => c.key === key && c.lang === (SHARED.has(key) ? 'de' : lang));
    const onPage = runs.filter((r) => listed(course, r));
    const from = Math.min(
        ...onPage.flatMap((r) =>
            r.prices.filter((p) => p.active && p.kind === 'one_time').map((p) => p.amount),
        ),
    );
    const next = onPage
        .map((r) => r.startsAt)
        .filter((d): d is string => !!d && d >= TODAY)
        .sort()[0];
    return (
        <PageEditor
            device={device}
            onDeviceChange={setDevice}
            storageKey="storybook.page.kurs-editor.aside"
            labels={{
                preview: 'Katalog (Vorschau zum Bearbeiten)',
                tools: 'Vorschau',
                desktop: 'Computer',
                phone: 'Handy',
                aside: 'Karte',
                resizeAside: 'Seitenleiste verbreitern oder verschmälern',
            }}
            toolbar={
                <DraftToolbar
                    draft={draft}
                    lang={lang}
                    onLang={onLang}
                    onPublish={onPublish}
                    path="/kurse"
                />
            }
            aside={
                <>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-medium text-muted-foreground">
                            Woher die Karte ihre Angaben hat
                        </h2>
                        <dl className="flex flex-col gap-2 text-sm">
                            {[
                                [
                                    'Titel, Kurzbeschreibung',
                                    'von der Kursseite — hier oder dort ändern',
                                ],
                                ['Titelbild, Symbol', 'hier ändern'],
                                ['Kategorie, Schlagwörter, Code', 'Einstellungen des Kurses'],
                                [
                                    `ab ${Number.isFinite(from) ? euro(from) : '—'}`,
                                    'der kleinste Preis der buchbaren Ausführungen',
                                ],
                                [`${onPage.length} Termine`, 'die Zahl der buchbaren Ausführungen'],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <dt className="font-medium">{k}</dt>
                                    <dd className="text-muted-foreground">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xs font-medium text-muted-foreground">
                            Kurzbeschreibung
                        </h2>
                        <p
                            className={cn(
                                'text-sm tabular-nums',
                                f.summary.length > 200
                                    ? 'text-destructive-tint-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            {f.summary.length} von 200 Zeichen
                        </p>
                    </div>
                    <NotLive draft={draft} onRevert={onRevert} onDiscard={onDiscard} />
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xs font-medium text-muted-foreground">
                            Für alle Kurse
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Kartenlayout „Standard“ und{' '}
                            {course.featured
                                ? 'hervorgehoben auf der Startseite'
                                : 'nicht hervorgehoben'}{' '}
                            — beides stellst du im Website-Editor ein.
                        </p>
                        <StoryLink
                            label="Im Website-Editor"
                            href="#/admin/design/studio"
                            story={['Pages/Admin/Website-Editor', 'HervorgehobeneKurse']}
                        />
                    </div>
                </>
            }
        >
            <div className="flex flex-col gap-4 px-8 py-8">
                <p className="text-xs text-muted-foreground">Kurse › Sprachen</p>
                <h2 className="text-2xl font-semibold tracking-tight">Sprachen</h2>
                <div
                    className={cn('grid gap-4', device === 'phone' ? 'grid-cols-1' : 'grid-cols-3')}
                >
                    <OtherCard title="Arabisch B1 · Konversation" price="ab 260 €" />
                    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                        <Changed on={changed('hero')}>
                            <div className="relative bg-primary text-primary-foreground">
                                <ImageArt file={de.hero} className="aspect-video" />
                                <div className="absolute bottom-2 left-2 flex size-12 items-center justify-center rounded-lg bg-background text-foreground shadow-sm">
                                    <ImageArt file={de.icon} className="size-12" />
                                </div>
                            </div>
                        </Changed>
                        <div className="flex flex-1 flex-col gap-2 p-4">
                            <span className="text-xs text-muted-foreground">
                                {course.category ?? 'Ohne Kategorie'}
                                {course.code && ` · ${course.code}`}
                            </span>
                            <Changed on={changed('title')}>
                                <InlineText
                                    as="h3"
                                    label="Titel"
                                    placeholder="Wie heißt der Kurs?"
                                    value={f.title}
                                    onChange={(v) => draft.set(lang, 'title', v)}
                                    className="font-semibold"
                                />
                            </Changed>
                            <Changed on={changed('summary')}>
                                <InlineText
                                    multiline
                                    label="Kurzbeschreibung"
                                    placeholder="Ein Satz für den Katalog"
                                    value={f.summary}
                                    onChange={(v) => draft.set(lang, 'summary', v)}
                                    className="text-sm text-muted-foreground"
                                />
                            </Changed>
                            <div className="flex flex-wrap gap-1">
                                {course.tags.map((t) => (
                                    <Badge key={t} variant="muted">
                                        {t}
                                    </Badge>
                                ))}
                            </div>
                            <div className="mt-auto flex items-baseline justify-between gap-2 pt-2">
                                <span className="font-semibold tabular-nums">
                                    {Number.isFinite(from) ? `ab ${euro(from)}` : 'Preis folgt'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {onPage.length} Termine
                                    {next && ` · ab ${fmtShort(next)}`}
                                </span>
                            </div>
                        </div>
                    </article>
                    <OtherCard title="Tajwid Grundlagen" price="ab 150 €" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            draft.set(
                                'de',
                                'hero',
                                de.hero === 'kalligrafie-feder.jpg'
                                    ? 'alphabet-tafel.jpg'
                                    : 'kalligrafie-feder.jpg',
                            )
                        }
                    >
                        <ImageUp aria-hidden="true" />
                        Titelbild ersetzen
                    </Button>
                    <Button variant="outline" size="sm">
                        <ImageUp aria-hidden="true" />
                        Symbol ersetzen
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView({ level: 'course', tab: 'settings' })}
                    >
                        <Settings2 aria-hidden="true" />
                        Kategorie und Schlagwörter
                    </Button>
                </div>
            </div>
        </PageEditor>
    );
}

/** A neighbour in the catalogue, for context only. */
function OtherCard({ title, price }: { title: string; price: string }) {
    return (
        <div
            aria-hidden="true"
            className="flex flex-col overflow-hidden rounded-lg border border-border bg-muted/40 text-muted-foreground"
        >
            <div className="aspect-video bg-muted" />
            <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="text-xs">Sprachen › Arabisch</span>
                <span className="font-semibold">{title}</span>
                <span className="text-sm">Ein anderer Kurs im selben Katalog.</span>
                <span className="mt-auto pt-2 text-sm font-semibold">{price}</span>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Kurs › Teilnehmer-Ansicht — as seen in one run
// ---------------------------------------------------------------------------

type Stage = 'start' | 'middle' | 'end';

function StudentView({
    runs,
    draft,
    initialRun,
    onView,
}: {
    runs: Run[];
    draft: Draft;
    initialRun?: string;
    onView: (v: View) => void;
}) {
    const id = useId();
    const [device, setDevice] = useState<PageEditorDevice>('desktop');
    const [runId, setRunId] = useState(initialRun ?? runs[0]!.id);
    const [stage, setStage] = useState<Stage>('middle');
    const run = runs.find((r) => r.id === runId) ?? runs[0]!;
    const live = draft.published.de;
    const all = CHAPTERS.flatMap((c) => c.lessons);
    const released = all.filter((_, i) => {
        const at = releaseOf(run, i);
        return at !== null && at <= TODAY;
    }).length;
    const done =
        run.lessons === 0
            ? 0
            : stage === 'start'
              ? 0
              : stage === 'end'
                ? all.length
                : Math.min(7, released);
    const nextSession = sessionsOf(run).find((s) => s.date >= TODAY);

    return (
        <PageEditor
            device={device}
            onDeviceChange={setDevice}
            storageKey="storybook.page.kurs-editor.aside"
            labels={{
                preview: 'Teilnehmer-Ansicht (Vorschau)',
                tools: 'Vorschau',
                desktop: 'Computer',
                phone: 'Handy',
                aside: 'Ansicht',
                resizeAside: 'Seitenleiste verbreitern oder verschmälern',
            }}
            toolbar={
                <>
                    <span className="truncate text-sm">
                        <span className="font-medium">Vorschau</span>{' '}
                        <span className="text-muted-foreground">
                            · so sieht jemand aus „{runLabel(run)}“ den Kurs nach der Buchung
                        </span>
                    </span>
                    <span className="flex-1" />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView({ level: 'run', runId: run.id, tab: 'content' })}
                    >
                        <Pencil aria-hidden="true" />
                        Inhalte bearbeiten
                    </Button>
                </>
            }
            aside={
                <>
                    <div className="flex flex-col gap-2">
                        <h2 id={`${id}-run`} className="text-xs font-medium text-muted-foreground">
                            Ansicht aus der Ausführung
                        </h2>
                        <RadioGroup
                            aria-labelledby={`${id}-run`}
                            value={runId}
                            onValueChange={setRunId}
                        >
                            {runs.map((r) => (
                                <div key={r.id} className="flex items-center gap-2">
                                    <RadioGroupItem value={r.id} id={`${id}-${r.id}`} />
                                    <Label htmlFor={`${id}-${r.id}`} className="font-normal">
                                        {runLabel(r)}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2
                            id={`${id}-stage`}
                            className="text-xs font-medium text-muted-foreground"
                        >
                            Als Teilnehmer:in bei
                        </h2>
                        <RadioGroup
                            aria-labelledby={`${id}-stage`}
                            value={stage}
                            onValueChange={(v) => setStage(v as Stage)}
                        >
                            {(
                                [
                                    ['start', 'Beginn · noch nichts gemacht'],
                                    ['middle', 'Mitte · ein paar Lektionen erledigt'],
                                    ['end', 'Ende · alles erledigt'],
                                ] as const
                            ).map(([v, label]) => (
                                <div key={v} className="flex items-center gap-2">
                                    <RadioGroupItem value={v} id={`${id}-${v}`} />
                                    <Label htmlFor={`${id}-${v}`} className="font-normal">
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                    <Note tone="muted" icon={Info}>
                        Titel und Bild kommen vom Kurs (die veröffentlichte Fassung). Lektionen,
                        Termine und Lehrkräfte kommen aus der gewählten Ausführung — jede hat ihre
                        eigene Kopie.
                    </Note>
                    {/* MOCK-ONLY: there is no admin preview of the student course page, nor a "progress" simulation. */}
                </>
            }
        >
            <header className="bg-primary px-8 pt-8 pb-6 text-primary-foreground">
                <p className="text-xs">Meine Kurse ›</p>
                <h1 className="text-3xl font-bold tracking-tight">{live.title}</h1>
                <p className="text-sm">
                    {runLabel(run)} · {lead(run) ?? 'Lehrkraft folgt'} · {slotsText(run)}
                </p>
            </header>
            <div className="flex flex-col gap-6 px-8 py-6">
                {run.lessons === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="Hier ist noch nichts"
                        description="Diese Ausführung hat noch keine Lektionen. Teilnehmende sähen nur diese leere Seite."
                    />
                ) : (
                    <>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-baseline justify-between gap-2">
                                <h2 className="font-semibold">Dein Fortschritt</h2>
                                <span className="text-sm text-muted-foreground tabular-nums">
                                    {done} von {all.length} Lektionen
                                </span>
                            </div>
                            <div
                                role="progressbar"
                                aria-label="Dein Fortschritt"
                                aria-valuemin={0}
                                aria-valuemax={all.length}
                                aria-valuenow={done}
                                className="h-2 overflow-hidden rounded-full bg-muted"
                            >
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${(done / all.length) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border p-4">
                            <CirclePlay className="size-8 shrink-0" aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-muted-foreground">
                                    {done === all.length ? 'Geschafft' : 'Weiter mit'}
                                </div>
                                <div className="font-medium">
                                    {done === all.length
                                        ? 'Dein Zertifikat ist bereit'
                                        : all[done]!.title}
                                </div>
                            </div>
                            {nextSession && (
                                <div className="text-end text-sm">
                                    <div className="text-xs text-muted-foreground">
                                        Nächste Sitzung
                                    </div>
                                    <div className="font-medium">
                                        {sessionDay(nextSession.date)}, {nextSession.from}
                                    </div>
                                </div>
                            )}
                        </div>
                        {CHAPTERS.map((c, ci) => (
                            <section key={c.title} className="flex flex-col gap-1">
                                <h2 className="text-sm font-semibold">
                                    {ci + 1} · {c.title}
                                </h2>
                                <ul className="flex flex-col divide-y divide-border">
                                    {c.lessons.map((lesson, li) => {
                                        const index = CHAPTER_START[ci]! + li;
                                        const at = releaseOf(run, index);
                                        const open = at !== null && at <= TODAY;
                                        const isDone = index < done;
                                        return (
                                            <li
                                                key={lesson.title}
                                                className={cn(
                                                    'flex items-center gap-3 py-2 text-sm',
                                                    !open && !isDone && 'text-muted-foreground',
                                                )}
                                            >
                                                {isDone ? (
                                                    <Check
                                                        className="size-4 shrink-0 text-success"
                                                        aria-label="erledigt"
                                                    />
                                                ) : open ? (
                                                    <span
                                                        aria-hidden="true"
                                                        className="size-4 shrink-0 rounded-full border border-muted-foreground"
                                                    />
                                                ) : (
                                                    <Lock
                                                        className="size-4 shrink-0"
                                                        aria-label="noch gesperrt"
                                                    />
                                                )}
                                                <span className="flex-1">{lesson.title}</span>
                                                {!open && !isDone && (
                                                    <span className="text-xs">
                                                        {at
                                                            ? `frei ab ${fmtShort(at)}`
                                                            : 'kommt noch'}
                                                    </span>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        ))}
                    </>
                )}
            </div>
        </PageEditor>
    );
}

// ---------------------------------------------------------------------------
// Kurs › Ausführungen — the grid
// ---------------------------------------------------------------------------

function RunsView({
    course,
    runs,
    onOpen,
    onNew,
    onVisibility,
    onCancel,
    notice,
}: {
    course: Course;
    runs: Run[];
    onOpen: (id: string) => void;
    onNew: (source: string | null) => void;
    onVisibility: (id: string, v: Visibility) => void;
    onCancel: (id: string) => void;
    notice: string | null;
}) {
    const [search, setSearch] = useState('');
    const shown = runs.filter((r) =>
        `${runLabel(r)} ${r.venue ?? ''} ${r.teachers.map((t) => t.name).join(' ')}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );
    const find = (ids: RowId[]) => runs.find((r) => r.id === String(ids[0]));

    const columns: GridColumn<Run>[] = useMemo(
        () => [
            {
                id: 'label',
                header: 'Ausführung',
                pinned: 'left',
                hideable: false,
                width: 180,
                value: (r) => runLabel(r),
                filter: { type: 'text' },
                cell: (r) => (
                    <a
                        href={`#/admin/courses/${course.slug}/${r.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(r.id);
                        }}
                        className="flex min-w-0 flex-col underline-offset-4 hover:underline"
                    >
                        <span className="truncate font-medium text-foreground">{runLabel(r)}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {slotsText(r)}
                        </span>
                    </a>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                width: 135,
                groupable: true,
                value: (r) => (r.visibility === 'published' ? 'Veröffentlicht' : 'Entwurf'),
                cell: (r) => (
                    <span className="flex flex-col items-start gap-1">
                        <VisibilityBadge v={r.visibility} />
                        <DeliveryBadge d={r.delivery} />
                    </span>
                ),
                exportValue: (r) =>
                    `${r.visibility === 'published' ? 'Veröffentlicht' : 'Entwurf'}, ${DELIVERY[r.delivery].label}`,
                filter: {
                    type: 'choice',
                    options: [
                        { value: 'Veröffentlicht', label: 'Veröffentlicht' },
                        { value: 'Entwurf', label: 'Entwurf' },
                    ],
                },
            },
            {
                id: 'dates',
                header: 'Zeitraum',
                width: 150,
                value: (r) => r.startsAt ?? '',
                cell: (r) => <span className="tabular-nums">{range(r)}</span>,
                exportValue: (r) => range(r),
            },
            {
                id: 'seats',
                header: 'Plätze',
                align: 'right',
                width: 120,
                value: (r) => (ENDED.has(r.delivery) ? r.completed : r.enrolled),
                cell: (r) =>
                    ENDED.has(r.delivery) ? (
                        <span className="text-muted-foreground">{r.completed} fertig</span>
                    ) : (
                        <span className="flex flex-col items-end">
                            <span className="tabular-nums">
                                {r.enrolled} / {r.capacity}
                            </span>
                            {r.enrolled >= r.capacity && (
                                <span className="text-xs text-muted-foreground">
                                    {r.waitlist.length} warten
                                </span>
                            )}
                        </span>
                    ),
                exportValue: (r) => `${r.enrolled}/${r.capacity}`,
            },
            {
                id: 'price',
                header: 'Preis',
                width: 130,
                value: (r) => r.prices.find((p) => p.active)?.amount ?? 0,
                cell: (r) => {
                    const [first, ...rest] = priceText(r).split(' oder ');
                    return first ? (
                        <span className="flex min-w-0 flex-col tabular-nums">
                            <span className="truncate">{first}</span>
                            {rest.length > 0 && (
                                <span className="truncate text-xs text-muted-foreground">
                                    oder {rest.join(' oder ')}
                                </span>
                            )}
                        </span>
                    ) : (
                        <Badge tone="warning" dot>
                            Kein Preis
                        </Badge>
                    );
                },
                exportValue: (r) => priceText(r),
            },
            {
                id: 'teachers',
                header: 'Lehrkräfte',
                width: 150,
                value: (r) => r.teachers.map((t) => t.name).join(', '),
                cell: (r) =>
                    r.teachers.length === 0 ? (
                        <Badge tone="warning" dot>
                            Keine
                        </Badge>
                    ) : (
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate">{lead(r) ?? r.teachers[0]!.name}</span>
                            {r.teachers.length > 1 && (
                                <span className="truncate text-xs text-muted-foreground">
                                    +{' '}
                                    {r.teachers
                                        .filter((t) => t.role !== 'lead')
                                        .map((t) => t.name)
                                        .join(', ')}
                                </span>
                            )}
                        </span>
                    ),
            },
            {
                id: 'place',
                header: 'Ort',
                width: 120,
                groupable: true,
                value: (r) => placeText(r),
                cell: (r) =>
                    r.format === 'online' ? (
                        'Online'
                    ) : (
                        <span className="flex min-w-0 items-center gap-1.5">
                            <MapPin
                                className="size-3.5 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <span className="truncate">{r.venue ?? 'Ort fehlt'}</span>
                        </span>
                    ),
            },
            {
                id: 'actions',
                header: 'Aktionen',
                pinned: 'right',
                hideable: false,
                sortable: false,
                width: 130,
                cell: (r) => (
                    <RowMenu label={`Aktionen für ${runLabel(r)}`}>
                        <DropdownMenuItem onSelect={() => onOpen(r.id)}>
                            <Eye aria-hidden="true" /> Öffnen
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onNew(r.id)}>
                            <Copy aria-hidden="true" /> Kopieren …
                        </DropdownMenuItem>
                        {r.visibility === 'published' ? (
                            <DropdownMenuItem onSelect={() => onVisibility(r.id, 'draft')}>
                                <Undo2 aria-hidden="true" /> Zurück auf Entwurf
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onSelect={() => onVisibility(r.id, 'published')}>
                                <Eye aria-hidden="true" /> Veröffentlichen
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            disabled={ENDED.has(r.delivery)}
                            className="text-destructive-tint-foreground"
                            onSelect={() => onCancel(r.id)}
                        >
                            <Ban aria-hidden="true" /> Absagen …
                        </DropdownMenuItem>
                    </RowMenu>
                ),
            },
        ],
        [course.slug, onOpen, onNew, onVisibility, onCancel],
    );

    const actions: GridActionItem[] = [
        {
            id: 'new',
            label: 'Neue Ausführung',
            icon: <Plus aria-hidden="true" />,
            tone: 'primary',
            shortcut: 'N',
            onSelect: () => onNew(null),
        },
        {
            id: 'open',
            label: 'Öffnen',
            icon: <Eye aria-hidden="true" />,
            when: ['one'],
            group: 'open',
            isDefault: true,
            shortcut: 'E',
            onSelect: (ids) => onOpen(String(ids[0])),
        },
        {
            id: 'copy',
            label: 'Kopieren …',
            icon: <Copy aria-hidden="true" />,
            when: ['one'],
            group: 'open',
            shortcut: 'Mod+D',
            onSelect: (ids) => onNew(String(ids[0])),
        },
        {
            id: 'publish',
            label: 'Veröffentlichen',
            icon: <Eye aria-hidden="true" />,
            when: ['one'],
            group: 'state',
            disabled: (ids) => find(ids)?.visibility !== 'draft',
            disabledReason: 'Nur für Entwürfe',
            onSelect: (ids) => onVisibility(String(ids[0]), 'published'),
        },
        {
            id: 'unpublish',
            label: 'Zurück auf Entwurf',
            icon: <Undo2 aria-hidden="true" />,
            when: ['one'],
            group: 'state',
            disabled: (ids) => find(ids)?.visibility !== 'published',
            disabledReason: 'Nur für veröffentlichte Ausführungen',
            onSelect: (ids) => onVisibility(String(ids[0]), 'draft'),
        },
        {
            id: 'cancel',
            label: 'Absagen …',
            icon: <Ban aria-hidden="true" />,
            when: ['one'],
            group: 'danger',
            tone: 'destructive',
            disabled: (ids) => {
                const r = find(ids);
                return !r || ENDED.has(r.delivery);
            },
            disabledReason: 'Beendete und abgesagte Ausführungen bleiben, wie sie sind',
            onSelect: (ids) => onCancel(String(ids[0])),
        },
    ];

    const grid = useGrid<Run>({
        id: 'storybook.page.kurs-editor.runs',
        rows: shown,
        getRowId: (r) => r.id,
        columns,
        selection: 'single',
        actions,
    });

    return (
        <GridPage
            title="Ausführungen"
            offsetTop="0px"
            grid={grid}
            search={{
                value: search,
                onChange: setSearch,
                placeholder: 'Bezeichnung, Ort oder Lehrkraft …',
            }}
            moreActionsLabel="Weitere Aktionen"
            selectionLabels={{ count: (c) => `${c} ausgewählt`, clear: 'Auswahl aufheben' }}
            shortcutLabels={{ Mod: 'Strg', Shift: 'Umschalt', Delete: 'Entf' }}
            options={
                <GridOptions
                    preferences={grid.preferences}
                    canSelect={grid.allowedMode !== 'none'}
                    columns={columns.map((c) => ({
                        id: c.id,
                        label: c.header,
                        hideable: c.hideable,
                    }))}
                    views={{
                        views: grid.views,
                        activeViewId: grid.activeViewId,
                        isModified: grid.isViewModified,
                        onApply: grid.applyView,
                        onSave: (name) => void grid.saveView(name),
                        onUpdate: grid.updateView,
                        onRename: grid.renameView,
                        onDelete: grid.deleteView,
                        labels: VIEWS_LABELS,
                    }}
                    labels={OPTIONS_LABELS}
                />
            }
            chips={
                grid.filters.length ? (
                    <GridFilterChips
                        filters={grid.filters}
                        columns={columns}
                        onRemove={grid.removeFilter}
                        onClearAll={grid.clearFilters}
                        labels={FILTER_CHIPS_LABELS}
                        formatDate={(d) => d}
                        formatNumber={(x) => String(x)}
                    />
                ) : undefined
            }
            notice={
                notice ? (
                    <span role="status" className="flex items-center gap-1.5 text-muted-foreground">
                        <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
                        {notice}
                    </span>
                ) : (
                    <span className="text-muted-foreground">
                        Jede Ausführung hat ihre eigenen Termine, Preise, Lektionen und
                        Teilnehmenden. Eine Kopie ist danach unabhängig vom Original.
                    </span>
                )
            }
            footer={
                <GridFooter
                    summary={`${shown.length} Ausführungen · ${runs.filter((r) => listed(course, r)).length} auf der Kursseite`}
                    onPrev={null}
                    onNext={null}
                    labels={{ previous: 'Zurück', next: 'Weiter', pager: 'Seiten' }}
                />
            }
        >
            <DataGrid
                grid={grid}
                labels={{
                    ...DATA_GRID_LABELS,
                    table: 'Ausführungen',
                    empty: 'Keine Ausführung passt dazu.',
                }}
                rowLabel={(r) => runLabel(r)}
                renderFilter={(col, close) => (
                    <GridFilterEditor
                        key={col.id}
                        columnId={col.id}
                        header={col.header}
                        def={col.filter!}
                        value={grid.filters.find((x) => x.id === col.id)}
                        onApply={(x) => {
                            if (x) grid.setFilter(x);
                            else grid.removeFilter(col.id);
                            close();
                        }}
                        labels={FILTER_EDITOR_LABELS}
                    />
                )}
            />
        </GridPage>
    );
}

// ---------------------------------------------------------------------------
// Kurs › Neue Ausführung — new, or a copy of a run
// ---------------------------------------------------------------------------

const SEASON = (iso: string) => {
    const m = day(iso).getMonth() + 1;
    const y = day(iso).getFullYear();
    if (m >= 3 && m <= 5) return `Frühjahr ${y}`;
    if (m >= 6 && m <= 8) return `Sommer ${y}`;
    if (m >= 9 && m <= 11) return `Herbst ${y}`;
    return `Winter ${m === 12 ? y : y - 1}`;
};
const deriveLabel = (start: string, format: Format) =>
    `${start ? SEASON(start) : 'Ohne Termin'} · ${format === 'online' ? 'Online' : 'Berlin'}`;

function NewRunDialog({
    runs,
    source: initialSource,
    onOpenChange,
    onCreate,
}: {
    runs: Run[];
    source: string | null;
    onOpenChange: (open: boolean) => void;
    onCreate: (run: Run) => void;
}) {
    const id = useId();
    // Default: copy the most recent run that has already been published.
    const fallback =
        [...runs]
            .filter((r) => r.visibility === 'published' && r.startsAt)
            .sort((a, b) => (b.startsAt ?? '').localeCompare(a.startsAt ?? ''))[0]?.id ??
        runs[0]?.id ??
        '';
    const [mode, setMode] = useState<'copy' | 'empty'>(runs.length ? 'copy' : 'empty');
    const [source, setSource] = useState(initialSource ?? fallback);
    const src = runs.find((r) => r.id === source);
    const [label, setLabel] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [format, setFormat] = useState<Format>(src?.format ?? 'online');
    const [carryTeachers, setCarryTeachers] = useState(true);
    const derived = deriveLabel(start, format);
    const copying = mode === 'copy' && src;

    const copied: [string, string][] = src
        ? [
              [
                  'Lektionen',
                  `${src.lessons} in ${CHAPTERS.length} Kapiteln, mit Quizzen und Dateien`,
              ],
              [
                  'Preise',
                  src.prices.filter((p) => p.active).length
                      ? priceText(src)
                      : 'keine — die Vorlage hat keinen Preis',
              ],
              ['Plätze & Zugang', `${src.capacity} Plätze, Regeln, Freigabe`],
              ['Live, Team-Rechte', 'wie bisher'],
              ['Zertifikat', src.certificate ? 'an, mit Stufen' : 'aus'],
              [
                  'Sprache & Dauer',
                  `${LANGUAGES[src.language]}, ${src.duration.amount} ${UNITS[src.duration.unit]}`,
              ],
          ]
        : [];
    const notCopied = [
        'Teilnehmende und Warteliste',
        'Termine — sie entstehen neu aus deinem Zeitraum',
        'Kanäle, Ankündigungen und Nachrichten',
        'Gutscheine und Preisregeln',
        'Fortschritt und Zertifikate',
    ];

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent closeLabel="Schließen" className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Neue Ausführung</DialogTitle>
                    <DialogDescription>
                        Ein neuer Durchgang dieses Kurses — mit eigenen Terminen, Preisen und
                        Teilnehmenden. Er beginnt als Entwurf.
                    </DialogDescription>
                </DialogHeader>

                <RadioGroup
                    aria-label="Womit beginnen"
                    value={mode}
                    onValueChange={(v) => setMode(v as 'copy' | 'empty')}
                    className="grid-cols-2"
                >
                    {(
                        [
                            [
                                'copy',
                                'Kopieren von …',
                                'Lektionen, Preise und Einstellungen übernehmen.',
                            ],
                            ['empty', 'Leer beginnen', 'Alles neu anlegen, auch die Lektionen.'],
                        ] as const
                    ).map(([v, title, text]) => (
                        <Label
                            key={v}
                            htmlFor={`${id}-${v}`}
                            className={cn(
                                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal',
                                mode === v ? 'border-primary bg-muted/40' : 'border-border',
                            )}
                        >
                            <RadioGroupItem
                                value={v}
                                id={`${id}-${v}`}
                                disabled={v === 'copy' && runs.length === 0}
                                className="mt-0.5"
                            />
                            <span className="flex flex-col gap-0.5">
                                <span className="font-medium">{title}</span>
                                <span className="text-sm text-muted-foreground">{text}</span>
                            </span>
                        </Label>
                    ))}
                </RadioGroup>

                <div className="grid grid-cols-2 gap-4">
                    {mode === 'copy' && (
                        <Field id={`${id}-source`} label="Vorlage">
                            <Select
                                value={source}
                                onValueChange={(v) => {
                                    setSource(v);
                                    setFormat(runs.find((r) => r.id === v)?.format ?? format);
                                }}
                            >
                                <SelectTrigger id={`${id}-source`} className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {runs.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {runLabel(r)}
                                            {r.visibility === 'draft' ? ' (Entwurf)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                    <Field
                        id={`${id}-label`}
                        label="Bezeichnung (optional)"
                        hint="Leer: entsteht aus Zeitraum und Format."
                        className={cn(mode === 'empty' && 'col-span-2')}
                    >
                        <Input
                            id={`${id}-label`}
                            value={label}
                            placeholder={derived}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field id={`${id}-start`} label="Beginnt am">
                            <Input
                                id={`${id}-start`}
                                type="date"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                            />
                        </Field>
                        <Field id={`${id}-end`} label="Endet am">
                            <Input
                                id={`${id}-end`}
                                type="date"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                            />
                        </Field>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label id={`${id}-format`}>Format</Label>
                        <SegmentedChoice
                            aria-labelledby={`${id}-format`}
                            value={format}
                            onValueChange={(v) => setFormat(v as Format)}
                        >
                            <SegmentedChoiceItem value="online">Online</SegmentedChoiceItem>
                            <SegmentedChoiceItem value="in_person">Vor Ort</SegmentedChoiceItem>
                            <SegmentedChoiceItem value="hybrid">Hybrid</SegmentedChoiceItem>
                        </SegmentedChoice>
                    </div>
                </div>

                {copying && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                            <h3 className="font-medium">Wird kopiert</h3>
                            <ul className="flex flex-col gap-1.5">
                                {copied.map(([k, v]) => (
                                    <li key={k} className="flex gap-2">
                                        <Check
                                            className="mt-0.5 size-4 shrink-0 text-success-tint-foreground"
                                            aria-hidden="true"
                                        />
                                        <span>
                                            {k} <span className="text-muted-foreground">· {v}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-2 border-t border-border pt-2">
                                <Checkbox
                                    id={`${id}-teachers`}
                                    checked={carryTeachers}
                                    onCheckedChange={(v) => setCarryTeachers(v === true)}
                                />
                                <Label htmlFor={`${id}-teachers`} className="font-normal">
                                    <span>
                                        Lehrkräfte übernehmen
                                        {src.teachers.length > 0 && (
                                            <span className="text-muted-foreground">
                                                {' '}
                                                ({src.teachers.map((t) => t.name).join(', ')})
                                            </span>
                                        )}
                                    </span>
                                </Label>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3">
                            <h3 className="font-medium">Bleibt beim Original</h3>
                            <ul className="flex flex-col gap-1.5">
                                {notCopied.map((x) => (
                                    <li key={x} className="flex gap-2">
                                        <X
                                            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <span className="text-muted-foreground">{x}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        {copying
                            ? `Was du in der Kopie änderst, ändert „${runLabel(src)}“ nie — und umgekehrt.`
                            : 'Die Kursseite zeigt sie erst, wenn du sie veröffentlichst.'}
                    </p>
                    <div className="flex shrink-0 gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Abbrechen
                        </Button>
                        <Button
                            onClick={() => {
                                const base: Run = copying
                                    ? src
                                    : {
                                          ...HERBST_ONLINE,
                                          teachers: [],
                                          prices: [],
                                          lessons: 0,
                                          quizzes: 0,
                                          certificate: false,
                                          note: '',
                                      };
                                onCreate({
                                    ...base,
                                    id: `neu-${Date.now()}`,
                                    label: derived,
                                    labelOverride: label,
                                    visibility: 'draft',
                                    delivery: 'planned',
                                    startsAt: start || null,
                                    endsAt: end || null,
                                    slots: start ? base.slots : [],
                                    format,
                                    venue: format === 'online' ? null : base.venue,
                                    teachers: copying && carryTeachers ? base.teachers : [],
                                    enrolled: 0,
                                    completed: 0,
                                    waitlist: [],
                                });
                                onOpenChange(false);
                            }}
                        >
                            {copying ? 'Kopie anlegen' : 'Ausführung anlegen'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// The one visibility switch — for the course and for each run
// ---------------------------------------------------------------------------

type Guard = { id: string; ok: boolean; label: string; fix?: { label: string; go: () => void } };

function VisibilitySwitch({
    label,
    hint,
    value,
    onChange,
    guards,
    draftText,
    publishedText,
}: {
    label: string;
    hint: string;
    value: Visibility;
    onChange: (v: Visibility) => void;
    guards: Guard[];
    draftText: ReactNode;
    publishedText: ReactNode;
}) {
    const id = useId();
    const blocked = guards.filter((g) => !g.ok);
    const locked = value === 'draft' && blocked.length > 0;
    return (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                    <Label id={`${id}-label`} className="text-sm font-medium">
                        {label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{hint}</p>
                </div>
                <SegmentedChoice
                    aria-labelledby={`${id}-label`}
                    value={value}
                    onValueChange={(v) => onChange(v as Visibility)}
                    className="w-72 shrink-0"
                >
                    <SegmentedChoiceItem value="draft">Entwurf</SegmentedChoiceItem>
                    <SegmentedChoiceItem value="published" disabled={locked}>
                        Veröffentlicht
                    </SegmentedChoiceItem>
                </SegmentedChoice>
            </div>
            {guards.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p
                        className={cn(
                            'text-sm font-medium',
                            locked && 'text-destructive-tint-foreground',
                        )}
                    >
                        {locked
                            ? 'Veröffentlichen geht noch nicht:'
                            : 'Bedingungen fürs Veröffentlichen — alle erfüllt'}
                    </p>
                    <ul className="flex flex-col gap-1.5 text-sm">
                        {guards.map((g) => (
                            <li key={g.id} className="flex items-start gap-2">
                                {g.ok ? (
                                    <Check
                                        className="mt-0.5 size-4 shrink-0 text-success-tint-foreground"
                                        aria-label="erfüllt"
                                    />
                                ) : (
                                    <X
                                        className="mt-0.5 size-4 shrink-0 text-destructive-tint-foreground"
                                        aria-label="fehlt"
                                    />
                                )}
                                <span className={cn('flex-1', g.ok && 'text-muted-foreground')}>
                                    {g.label}
                                </span>
                                {!g.ok && g.fix && (
                                    <TextLink onClick={g.fix.go}>{g.fix.label}</TextLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
                {(
                    [
                        ['draft', 'Entwurf', draftText],
                        ['published', 'Veröffentlicht', publishedText],
                    ] as const
                ).map(([v, title, text]) => (
                    <div
                        key={v}
                        className={cn(
                            'flex flex-col gap-1.5 rounded-md p-3',
                            value === v
                                ? v === 'published'
                                    ? 'bg-success/10 text-success-tint-foreground'
                                    : 'bg-muted text-foreground'
                                : 'bg-muted/40 text-muted-foreground',
                        )}
                    >
                        <div className="font-medium">
                            {title}
                            {value === v && ' — jetzt'}
                        </div>
                        <div>{text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Kurs › Einstellungen
// ---------------------------------------------------------------------------

type CourseSaved = Pick<Course, 'slug' | 'code' | 'category' | 'tags' | 'level' | 'funding'>;

function CourseSettingsView({
    course,
    runs,
    draft,
    onSave,
    onStatus,
    onView,
}: {
    course: Course;
    runs: Run[];
    draft: Draft;
    onSave: (c: CourseSaved) => void;
    onStatus: (v: Visibility) => void;
    onView: (v: View) => void;
}) {
    const id = useId();
    const saved: CourseSaved = {
        slug: course.slug,
        code: course.code,
        category: course.category,
        tags: course.tags,
        level: course.level,
        funding: course.funding,
    };
    const [form, setForm] = useState<CourseSaved>(saved);
    const [confirm, setConfirm] = useState<'unpublish' | 'archive' | null>(null);
    const [seoLang, setSeoLang] = useState<Lang>('de');
    const [addingTag, setAddingTag] = useState(false);
    const dirty = JSON.stringify(form) !== JSON.stringify(saved);
    const patch = (p: Partial<CourseSaved>) => setForm((f) => ({ ...f, ...p }));
    const live = draft.published;
    const onPage = runs.filter((r) => listed(course, r));
    const learners = runs.reduce((n, r) => n + r.enrolled, 0);
    const active = runs.filter((r) => !ENDED.has(r.delivery) && r.visibility === 'published');

    // MOCK-ONLY: the gate today guards `is_public`; here it guards the one switch.
    const guards: Guard[] = [
        {
            id: 'title',
            ok: !!live.de.title,
            label: 'Ein Titel ist veröffentlicht',
            fix: { label: 'Zur Kursseite', go: () => onView({ level: 'course', tab: 'page' }) },
        },
        {
            id: 'category',
            ok: !!course.category,
            label: 'Eine Kategorie ist gesetzt — sonst steht der Kurs nirgends im Katalog',
            fix: {
                label: 'Kategorie wählen',
                go: () => document.getElementById(`${id}-category`)?.focus(),
            },
        },
        ...LANGS.map((x) => ({
            id: `summary-${x}`,
            ok: !!live[x].summary,
            label: `Eine Kurzbeschreibung auf ${LANG_NAME[x]} ist veröffentlicht`,
            fix: { label: 'Zur Kursseite', go: () => onView({ level: 'course', tab: 'page' }) },
        })),
    ];

    return (
        <PageFrame
            title="Einstellungen"
            text="Name, Adresse, Einordnung und ob der Kurs zu sehen ist."
            bar={
                dirty && (
                    <UnsavedBar
                        message={
                            form.slug !== saved.slug
                                ? `Neue Adresse /kurse/${form.slug} — die alte leitet weiter.`
                                : 'Einordnung und Adresse ändern sich erst beim Speichern.'
                        }
                        onDiscard={() => setForm(saved)}
                        onSave={() => onSave(form)}
                    />
                )
            }
        >
            <Block
                title="Sichtbarkeit"
                timing="live"
                text="Ein Schalter für den ganzen Kurs. Jede Ausführung hat zusätzlich ihren eigenen."
            >
                <VisibilitySwitch
                    label="Kurs"
                    hint="Gilt sofort, nicht erst beim Veröffentlichen der Texte."
                    value={course.status}
                    onChange={(v) => (v === 'draft' ? setConfirm('unpublish') : onStatus(v))}
                    guards={guards}
                    draftText="Die Kursseite gibt es nicht (404), der Kurs steht in keinem Katalog, keine Ausführung ist buchbar. Wer schon eingeschrieben ist, lernt weiter."
                    publishedText={
                        <>
                            Die Kursseite ist online und zeigt jede veröffentlichte Ausführung —
                            gerade {onPage.length}.
                        </>
                    }
                />
            </Block>

            <Block
                title="Name"
                timing="publish"
                text="Der Titel steht auf der Kursseite und der Karte — er geht mit „Veröffentlichen“ live, wie alle Texte."
            >
                <div className="grid grid-cols-2 gap-4">
                    {LANGS.map((x) => (
                        <Field key={x} id={`${id}-title-${x}`} label={`Titel (${LANG_NAME[x]})`}>
                            <Input
                                id={`${id}-title-${x}`}
                                value={draft.draft[x].title}
                                onChange={(e) => draft.set(x, 'title', e.target.value)}
                            />
                        </Field>
                    ))}
                </div>
            </Block>

            <Block title="Adresse und Code" timing="save">
                <div className="grid grid-cols-2 gap-4">
                    <Field
                        id={`${id}-slug`}
                        label="Adresse der Kursseite"
                        hint={`${HOST}/kurse/${form.slug} — änderst du sie, leitet die alte weiter.`}
                    >
                        <Input
                            id={`${id}-slug`}
                            value={form.slug}
                            onChange={(e) => patch({ slug: e.target.value })}
                        />
                    </Field>
                    <Field
                        id={`${id}-code`}
                        label="Kurs-Code"
                        hint="Für Katalog, Rechnung und Suche, z. B. AR-A1."
                    >
                        <Input
                            id={`${id}-code`}
                            value={form.code}
                            onChange={(e) => patch({ code: e.target.value })}
                        />
                    </Field>
                </div>
            </Block>

            <Block
                title="Einordnung"
                timing="save"
                text="Wo der Kurs im Katalog steht und wonach man ihn findet."
            >
                <div className="grid grid-cols-2 gap-4">
                    <Field id={`${id}-category`} label="Kategorie">
                        <Combobox
                            id={`${id}-category`}
                            value={form.category ?? ''}
                            options={CATEGORIES}
                            onChange={(v) => patch({ category: v || null })}
                            placeholder="Kategorie wählen …"
                            searchPlaceholder="Suchen …"
                            emptyLabel="Keine Kategorie gefunden."
                        />
                    </Field>
                    <Field id={`${id}-level`} label="Stufe">
                        <Select value={form.level} onValueChange={(v) => patch({ level: v })}>
                            <SelectTrigger id={`${id}-level`} className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LEVELS.map((x) => (
                                    <SelectItem key={x} value={x}>
                                        {x}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <div className="col-span-2 flex flex-col gap-1.5">
                        <Label id={`${id}-tags`}>Schlagwörter</Label>
                        <ul
                            aria-labelledby={`${id}-tags`}
                            className="flex flex-wrap items-center gap-1.5"
                        >
                            {form.tags.map((t) => (
                                <li key={t}>
                                    <Badge variant="muted" className="gap-1 pe-1">
                                        {t}
                                        <button
                                            type="button"
                                            aria-label={`${t} entfernen`}
                                            onClick={() =>
                                                patch({ tags: form.tags.filter((x) => x !== t) })
                                            }
                                            className="rounded-sm hover:bg-background"
                                        >
                                            <X className="size-3" aria-hidden="true" />
                                        </button>
                                    </Badge>
                                </li>
                            ))}
                            <li>
                                {addingTag ? (
                                    <div className="w-56">
                                        <Combobox
                                            id={`${id}-tag-add`}
                                            value=""
                                            options={TAGS.filter((t) => !form.tags.includes(t))}
                                            onChange={(v) => {
                                                patch({ tags: [...form.tags, v] });
                                                setAddingTag(false);
                                            }}
                                            placeholder="Schlagwort …"
                                            searchPlaceholder="Schlagwort suchen"
                                            emptyLabel="Nichts gefunden."
                                        />
                                    </div>
                                ) : (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setAddingTag(true)}
                                    >
                                        <Plus aria-hidden="true" /> Schlagwort
                                    </Button>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </Block>

            <Block
                title="Suchmaschinen"
                timing="publish"
                text="Was Google & Co. zeigen. Leer: Titel und Kurzbeschreibung."
            >
                <Tabs
                    value={seoLang}
                    onValueChange={(v) => setSeoLang(v as Lang)}
                    className="gap-3"
                >
                    <TabsList aria-label="Sprache">
                        {LANGS.map((x) => (
                            <TabsTrigger key={x} value={x} className="px-3">
                                {LANG_NAME[x]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {LANGS.map((x) => {
                        const f = draft.draft[x];
                        return (
                            <TabsContent key={x} value={x} className="flex flex-col gap-3">
                                <Field id={`${id}-seo-t-${x}`} label="Titel für Suchmaschinen">
                                    <Input
                                        id={`${id}-seo-t-${x}`}
                                        value={f.seoTitle}
                                        placeholder={f.title}
                                        onChange={(e) => draft.set(x, 'seoTitle', e.target.value)}
                                    />
                                </Field>
                                <Field
                                    id={`${id}-seo-d-${x}`}
                                    label="Beschreibung für Suchmaschinen"
                                >
                                    <Textarea
                                        id={`${id}-seo-d-${x}`}
                                        value={f.seoDescription}
                                        placeholder={f.summary}
                                        onChange={(e) =>
                                            draft.set(x, 'seoDescription', e.target.value)
                                        }
                                    />
                                </Field>
                                <div className="flex flex-col gap-0.5 rounded-lg border border-border p-3 text-sm">
                                    <span className="text-xs text-muted-foreground">
                                        {HOST} › kurse › {course.slug}
                                    </span>
                                    <span className="font-medium">
                                        {f.seoTitle || f.title || 'Ohne Titel'}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {f.seoDescription || f.summary || 'Keine Beschreibung.'}
                                    </span>
                                </div>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </Block>

            <Block
                title="Förderung"
                timing="save"
                text="Für welche Förderungen der Kurs anerkannt ist — gilt für alle seine Ausführungen."
            >
                <ul className="flex flex-col gap-2">
                    {FUNDING.map((x) => (
                        <li key={x} className="flex items-center gap-2">
                            <Checkbox
                                id={`${id}-f-${x}`}
                                checked={form.funding.includes(x)}
                                onCheckedChange={(v) =>
                                    patch({
                                        funding:
                                            v === true
                                                ? [...form.funding, x]
                                                : form.funding.filter((y) => y !== x),
                                    })
                                }
                            />
                            <Label htmlFor={`${id}-f-${x}`} className="font-normal">
                                {x}
                            </Label>
                        </li>
                    ))}
                </ul>
            </Block>

            <Block title="Kurs archivieren">
                <div className="flex items-start justify-between gap-6 rounded-lg border border-border p-4">
                    <p className="text-sm text-muted-foreground">
                        Der Kurs verschwindet aus der Liste und von der Website. Gelöscht wird
                        nichts — Teilnehmende behalten ihre Zertifikate.
                        {active.length > 0 &&
                            ` Geht erst, wenn keine Ausführung mehr veröffentlicht und offen ist — gerade ${active.length}.`}
                    </p>
                    {/* MOCK-ONLY: there is no course archive or restore route today (policy only). */}
                    <Button
                        variant="outline"
                        disabled={active.length > 0}
                        tooltip={
                            active.length > 0
                                ? `${active.map(runLabel).join(', ')} ${active.length === 1 ? 'ist' : 'sind'} noch offen`
                                : undefined
                        }
                        onClick={() => setConfirm('archive')}
                    >
                        <Archive aria-hidden="true" /> Archivieren …
                    </Button>
                </div>
            </Block>

            <ConfirmActionDialog
                open={confirm === 'unpublish'}
                onOpenChange={(o) => !o && setConfirm(null)}
                title="Kurs zurück auf Entwurf?"
                description={`Die Kursseite ist sofort nicht mehr erreichbar, und mit ihr verschwinden ${onPage.length} buchbare Ausführungen aus dem Katalog. ${learners} Teilnehmende lernen weiter wie bisher.`}
                confirmLabel="Auf Entwurf setzen"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={() => onStatus('draft')}
            />
            <ConfirmActionDialog
                open={confirm === 'archive'}
                onOpenChange={(o) => !o && setConfirm(null)}
                title="Kurs archivieren?"
                description="Er verschwindet aus der Kursliste und von der Website. Wiederherstellen geht über „Archiv“ in der Kursliste."
                confirmLabel="Archivieren"
                cancelLabel="Abbrechen"
                onConfirm={() => setConfirm(null)}
            />
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Überblick
// ---------------------------------------------------------------------------

function statusLine(r: Run) {
    if (r.delivery === 'completed')
        return `Beendet am ${fmt(r.endsAt!)} · ${r.completed} haben abgeschlossen.`;
    if (r.visibility === 'draft')
        return 'Entwurf — steht nicht auf der Kursseite, niemand kann buchen.';
    const sessions = sessionsOf(r);
    const past = sessions.filter((s) => s.date < TODAY).length;
    if (r.delivery === 'running')
        return `Veröffentlicht und buchbar · läuft seit ${fmt(r.startsAt!)}, Sitzung ${past} von ${sessions.length} vorbei.`;
    return `Veröffentlicht und buchbar · beginnt am ${fmt(r.startsAt!)}.`;
}

function RunOverview({
    course,
    courseTitle,
    run,
    onTab,
    onStudentView,
}: {
    course: Course;
    courseTitle: string;
    run: Run;
    onTab: (t: RunTab) => void;
    onStudentView: () => void;
}) {
    const sessions = sessionsOf(run);
    const next = sessions.filter((s) => s.date >= TODAY).slice(0, 4);
    const people = ENROLMENTS.filter((e) => e.runId === run.id);
    const activePeople = people.filter((e) => e.status === 'active');
    const avg = activePeople.length
        ? Math.round(activePeople.reduce((n, e) => n + e.done, 0) / activePeople.length)
        : 0;
    const checks = readiness(run);

    // MOCK-ONLY: no "needs you" feed exists; these are derived by hand per run.
    const todos: {
        icon: LucideIcon;
        text: string;
        detail: string;
        tab?: RunTab;
        story?: [string, string];
    }[] =
        run.visibility === 'draft'
            ? [
                  ...checks
                      .filter((c) => !c.done && !c.optional)
                      .map((c) => ({
                          icon: CircleAlert,
                          text: `${c.label} fehlt`,
                          detail: READINESS_WHY[c.id]!,
                          tab: READINESS_TAB[c.id]!,
                      })),
                  {
                      icon: Eye,
                      text: 'Veröffentlichen, sobald alles da ist',
                      detail:
                          course.status === 'draft'
                              ? 'Geht erst, wenn der Kurs veröffentlicht ist.'
                              : 'Dann steht sie auf der Kursseite.',
                      tab: 'settings',
                  },
              ]
            : run.id === 'herbst-online'
              ? [
                    {
                        icon: Euro,
                        text: 'Yusuf Okafor: zweite Rate seit 9 Tagen offen',
                        detail: 'Zwei Erinnerungen sind raus.',
                        story: ['Pages/Admin/Zahlungen', 'BestellungUeberfaellig'],
                    },
                    {
                        icon: TriangleAlert,
                        text: '3 Teilnehmende seit zwei Wochen nicht mehr da',
                        detail: 'Zuletzt bei Kapitel 1.',
                        tab: 'people',
                    },
                    {
                        icon: Lock,
                        text: 'Am 05.10. werden Lektion 10 bis 12 frei',
                        detail: 'Wöchentliche Freigabe.',
                        tab: 'content',
                    },
                ]
              : run.waitlist.length > 0
                ? [
                      {
                          icon: Users,
                          text: `Ausgebucht — ${run.waitlist.length} auf der Warteliste`,
                          detail: 'Karim Saleh hat ein Angebot, es läuft morgen ab.',
                          tab: 'access',
                      },
                  ]
                : [];

    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Überblick"
            text={statusLine(run)}
            wide
            actions={
                <Button variant="outline" size="sm" onClick={onStudentView}>
                    <GraduationCap aria-hidden="true" /> Teilnehmer-Ansicht
                </Button>
            }
        >
            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 flex flex-col gap-8">
                    <Block title="Braucht dich" text={todos.length ? undefined : 'Gerade nichts.'}>
                        {todos.length > 0 && (
                            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                                {todos.map((t) => (
                                    <li key={t.text} className="flex items-center gap-3 px-4 py-3">
                                        <t.icon
                                            className="size-4 shrink-0 text-muted-foreground"
                                            aria-hidden="true"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-medium">
                                                {t.text}
                                            </span>
                                            <span className="block text-sm text-muted-foreground">
                                                {t.detail}
                                            </span>
                                        </span>
                                        {t.tab ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onTab(t.tab!)}
                                            >
                                                {runTabLabel(t.tab)}
                                            </Button>
                                        ) : (
                                            t.story && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={linkTo(t.story[0], t.story[1])}
                                                >
                                                    Ansehen
                                                </Button>
                                            )
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Block>

                    <Block
                        title="Nächste Termine"
                        action={
                            <Button variant="ghost" size="sm" onClick={() => onTab('schedule')}>
                                Alle {sessions.length} Termine
                            </Button>
                        }
                    >
                        {next.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {sessions.length
                                    ? 'Alle Termine sind vorbei.'
                                    : 'Noch keine Termine — leg Zeitraum und Wochentage fest.'}
                            </p>
                        ) : (
                            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                                {next.map((s, i) => (
                                    <li
                                        key={s.date}
                                        className="flex items-center gap-4 px-4 py-2.5"
                                    >
                                        <span className="w-24 font-medium tabular-nums">
                                            {sessionDay(s.date)}
                                        </span>
                                        <span className="w-28 tabular-nums">
                                            {s.from}–{s.to}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate text-muted-foreground">
                                            {lead(run) ?? 'Lehrkraft fehlt'} ·{' '}
                                            {run.format === 'online' ? 'Live-Raum' : run.venue}
                                        </span>
                                        {i === 0 && run.delivery === 'running' && (
                                            <Badge tone="neutral">nächste</Badge>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Block>
                </div>

                <div className="flex flex-col gap-8">
                    <CompletionChecklist
                        items={checks}
                        onItemClick={(cid) => onTab(READINESS_TAB[cid]!)}
                        labels={{
                            ...CHECKLIST_LABELS('Bereit für Teilnehmende'),
                            incomplete: 'es fehlt noch etwas',
                        }}
                    />
                    <section className="flex flex-col gap-2">
                        <h2 className="text-xs font-medium text-muted-foreground">In Zahlen</h2>
                        {/* MOCK-ONLY: attendance and revenue per run are not computed anywhere today. */}
                        <dl className="flex flex-col gap-2 text-sm">
                            {(
                                [
                                    [
                                        'Plätze',
                                        ENDED.has(run.delivery)
                                            ? `${people.length} waren eingeschrieben`
                                            : run.enrolled >= run.capacity
                                              ? `${run.enrolled} von ${run.capacity} — ausgebucht, ${run.waitlist.length} warten`
                                              : `${run.enrolled} von ${run.capacity} belegt, ${run.capacity - run.enrolled} frei`,
                                    ],
                                    [
                                        'Fortschritt',
                                        activePeople.length
                                            ? `im Schnitt ${avg} von ${LESSON_COUNT} Lektionen`
                                            : '—',
                                    ],
                                    [
                                        'Anwesenheit',
                                        run.delivery === 'running'
                                            ? '86 % bei 6 Sitzungen'
                                            : run.delivery === 'completed'
                                              ? '81 % bei 25 Sitzungen'
                                              : '—',
                                    ],
                                    [
                                        'Einnahmen',
                                        run.prices.some((p) => p.sold)
                                            ? run.id === 'herbst-online'
                                                ? '3.690 € · 170 € offen'
                                                : `${euro(run.prices.reduce((n, p) => n + p.sold * p.amount, 0))}`
                                            : '—',
                                    ],
                                    [
                                        'Zertifikate',
                                        run.certificate
                                            ? run.completed
                                                ? `${run.completed} ausgestellt`
                                                : 'noch keins'
                                            : 'aus',
                                    ],
                                ] as const
                            ).map(([k, v]) => (
                                <div key={k} className="flex flex-col">
                                    <dt className="text-muted-foreground">{k}</dt>
                                    <dd>{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                </div>
            </div>
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Termine & Ort
// ---------------------------------------------------------------------------

type ScheduleForm = Pick<
    Run,
    'startsAt' | 'endsAt' | 'slots' | 'delivery' | 'format' | 'venue' | 'language' | 'duration'
>;

function RunSchedule({
    courseTitle,
    run,
    onSave,
}: {
    courseTitle: string;
    run: Run;
    onSave: (r: Run) => void;
}) {
    const id = useId();
    const saved: ScheduleForm = {
        startsAt: run.startsAt,
        endsAt: run.endsAt,
        slots: run.slots,
        delivery: run.delivery,
        format: run.format,
        venue: run.venue,
        language: run.language,
        duration: run.duration,
    };
    const [form, setForm] = useState<ScheduleForm>(saved);
    const [venues, setVenues] = useState(VENUES);
    const [creating, setCreating] = useState(false);
    const [newVenue, setNewVenue] = useState({ name: '', address: '' });
    const [notify, setNotify] = useState(true);
    const patch = (p: Partial<ScheduleForm>) => setForm((f) => ({ ...f, ...p }));
    const setSlot = (i: number, s: Partial<Slot>) =>
        patch({ slots: form.slots.map((x, j) => (j === i ? { ...x, ...s } : x)) });
    const dirty = JSON.stringify(form) !== JSON.stringify(saved);
    const datesMoved =
        form.startsAt !== saved.startsAt ||
        form.endsAt !== saved.endsAt ||
        JSON.stringify(form.slots) !== JSON.stringify(saved.slots);
    const count = sessionsOf({ ...run, ...form }).length;

    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Termine & Ort"
            text="Wann und wo diese Ausführung stattfindet. Gilt beim Speichern."
            bar={
                dirty && (
                    <UnsavedBar
                        message={
                            datesMoved && run.enrolled > 0
                                ? `${count} Termine statt ${sessionsOf(run).length}. Kalender-Abos folgen von selbst.`
                                : 'Termine und Ort ändern sich erst beim Speichern.'
                        }
                        extra={
                            datesMoved &&
                            run.enrolled > 0 && (
                                // MOCK-ONLY: no "Neuer Termin" notification exists today.
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={`${id}-notify`}
                                        checked={notify}
                                        onCheckedChange={(v) => setNotify(v === true)}
                                    />
                                    <Label htmlFor={`${id}-notify`} className="font-normal">
                                        {run.enrolled} Teilnehmenden „Neuer Termin“ schicken
                                    </Label>
                                </div>
                            )
                        }
                        onDiscard={() => setForm(saved)}
                        onSave={() => onSave({ ...run, ...form })}
                    />
                )
            }
        >
            <Block title="Zeitraum" timing="save">
                <div className="grid grid-cols-2 gap-4">
                    <Field id={`${id}-start`} label="Beginnt am">
                        <Input
                            id={`${id}-start`}
                            type="date"
                            value={form.startsAt ?? ''}
                            onChange={(e) => patch({ startsAt: e.target.value || null })}
                        />
                    </Field>
                    <Field id={`${id}-end`} label="Endet am">
                        <Input
                            id={`${id}-end`}
                            type="date"
                            value={form.endsAt ?? ''}
                            onChange={(e) => patch({ endsAt: e.target.value || null })}
                        />
                    </Field>
                </div>
            </Block>

            <Block
                title="Wochentermine"
                timing="save"
                text={`${count} Termine zwischen Beginn und Ende. Einzelne Ausfälle trägst du unter Live & Aufnahmen ein.`}
            >
                {/* MOCK-ONLY: the form edits only the first slot today ("extra slots" hint). */}
                <ul className="flex flex-col gap-3">
                    {form.slots.map((s, i) => (
                        <li
                            key={i}
                            className="flex flex-wrap items-end gap-4 rounded-lg border border-border p-3"
                        >
                            <div className="flex flex-col gap-1.5">
                                <span id={`${id}-days-${i}`} className="text-sm font-medium">
                                    Wochentage
                                </span>
                                <div
                                    role="group"
                                    aria-labelledby={`${id}-days-${i}`}
                                    className="flex gap-1"
                                >
                                    {WEEKDAYS.map((w) => {
                                        const on = s.days.includes(w);
                                        return (
                                            <Button
                                                key={w}
                                                size="sm"
                                                variant={on ? 'default' : 'outline'}
                                                aria-pressed={on}
                                                className="w-10"
                                                onClick={() =>
                                                    setSlot(i, {
                                                        days: on
                                                            ? s.days.filter((x) => x !== w)
                                                            : WEEKDAYS.filter(
                                                                  (x) =>
                                                                      x === w || s.days.includes(x),
                                                              ),
                                                    })
                                                }
                                            >
                                                {w}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                            <Field id={`${id}-from-${i}`} label="Von">
                                <Input
                                    id={`${id}-from-${i}`}
                                    type="time"
                                    value={s.from}
                                    className="w-28"
                                    onChange={(e) => setSlot(i, { from: e.target.value })}
                                />
                            </Field>
                            <Field id={`${id}-to-${i}`} label="Bis">
                                <Input
                                    id={`${id}-to-${i}`}
                                    type="time"
                                    value={s.to}
                                    className="w-28"
                                    onChange={(e) => setSlot(i, { to: e.target.value })}
                                />
                            </Field>
                            <IconButton
                                label={`Wochentermin ${i + 1} entfernen`}
                                icon={<X aria-hidden="true" />}
                                className="ms-auto"
                                disabled={form.slots.length === 1}
                                onClick={() =>
                                    patch({ slots: form.slots.filter((_, j) => j !== i) })
                                }
                            />
                        </li>
                    ))}
                </ul>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() =>
                        patch({
                            slots: [...form.slots, { days: ['Fr'], from: '18:00', to: '19:30' }],
                        })
                    }
                >
                    <Plus aria-hidden="true" /> Weiterer Wochentermin
                </Button>
            </Block>

            <Block
                title="Durchführung"
                timing="save"
                text="Wo die Ausführung gerade steht. Absagen geht über Einstellungen."
            >
                <Field
                    id={`${id}-delivery`}
                    label="Stand"
                    hint="„läuft“ braucht eine leitende Lehrkraft und Termine. „Beendet“ lässt sich nicht zurücknehmen."
                >
                    <Select
                        value={form.delivery}
                        onValueChange={(v) => patch({ delivery: v as Delivery })}
                        disabled={ENDED.has(run.delivery)}
                    >
                        <SelectTrigger id={`${id}-delivery`} className="w-72">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(DELIVERY) as Delivery[]).map((d) => (
                                <SelectItem
                                    key={d}
                                    value={d}
                                    disabled={d === 'cancelled' || (d === 'running' && !lead(run))}
                                >
                                    {DELIVERY[d].label}
                                    {d === 'cancelled' && ' — über Einstellungen'}
                                    {d === 'running' && !lead(run) && ' — Lehrkraft fehlt'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </Block>

            <Block title="Format und Ort" timing="save">
                <div className="flex flex-col gap-1.5">
                    <Label id={`${id}-format`}>Format</Label>
                    <SegmentedChoice
                        aria-labelledby={`${id}-format`}
                        value={form.format}
                        onValueChange={(v) => patch({ format: v as Format })}
                        className="w-96"
                    >
                        <SegmentedChoiceItem value="online">Online</SegmentedChoiceItem>
                        <SegmentedChoiceItem value="in_person">Vor Ort</SegmentedChoiceItem>
                        <SegmentedChoiceItem value="hybrid">Hybrid</SegmentedChoiceItem>
                    </SegmentedChoice>
                </div>
                {form.format === 'online' ? (
                    <Note tone="muted" icon={Video}>
                        Online heißt: im Live-Raum der Schule. Den Link finden Teilnehmende in ihrem
                        Kurs, kurz vor jedem Termin.
                    </Note>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-end gap-2">
                            <Field id={`${id}-venue`} label="Ort" className="flex-1">
                                <Combobox
                                    id={`${id}-venue`}
                                    value={form.venue ?? ''}
                                    options={venues}
                                    onChange={(v) => patch({ venue: v || null })}
                                    placeholder="Ort wählen …"
                                    searchPlaceholder="Ort suchen"
                                    emptyLabel="Kein Ort gefunden — leg ihn neu an."
                                />
                            </Field>
                            {/* MOCK-ONLY: venues are created only at /admin/venues today; the form has a plain select. */}
                            <Button
                                variant="outline"
                                onClick={() => setCreating(true)}
                                disabled={creating}
                            >
                                <Plus aria-hidden="true" /> Neuer Ort
                            </Button>
                        </div>
                        {creating && (
                            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Field id={`${id}-vn`} label="Name des Orts">
                                        <Input
                                            id={`${id}-vn`}
                                            value={newVenue.name}
                                            placeholder="z. B. Moschee Wedding · Raum 3"
                                            onChange={(e) =>
                                                setNewVenue({ ...newVenue, name: e.target.value })
                                            }
                                        />
                                    </Field>
                                    <Field id={`${id}-va`} label="Adresse">
                                        <Input
                                            id={`${id}-va`}
                                            value={newVenue.address}
                                            placeholder="Straße, PLZ Ort"
                                            onChange={(e) =>
                                                setNewVenue({
                                                    ...newVenue,
                                                    address: e.target.value,
                                                })
                                            }
                                        />
                                    </Field>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setCreating(false)}
                                    >
                                        Abbrechen
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={!newVenue.name.trim()}
                                        onClick={() => {
                                            const name = newVenue.name.trim();
                                            setVenues((v) => [...v, name]);
                                            patch({ venue: name });
                                            setNewVenue({ name: '', address: '' });
                                            setCreating(false);
                                        }}
                                    >
                                        Ort anlegen und wählen
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Block>

            <Block
                title="Sprache und Dauer"
                timing="save"
                text="Stehen auf der Kursseite als Eckdaten — zusammengefasst aus allen buchbaren Ausführungen."
            >
                <div className="flex flex-wrap items-end gap-4">
                    <Field id={`${id}-lang`} label="Unterrichtssprache">
                        <Select value={form.language} onValueChange={(v) => patch({ language: v })}>
                            <SelectTrigger id={`${id}-lang`} className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(LANGUAGES).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>
                                        {v}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field id={`${id}-dur`} label="Dauer">
                        <IntegerInput
                            id={`${id}-dur`}
                            value={form.duration.amount}
                            onValueChange={(n) =>
                                patch({ duration: { ...form.duration, amount: n } })
                            }
                            className="w-24"
                        />
                    </Field>
                    <Field id={`${id}-unit`} label="Einheit">
                        <Select
                            value={form.duration.unit}
                            onValueChange={(v) =>
                                patch({
                                    duration: {
                                        ...form.duration,
                                        unit: v as Run['duration']['unit'],
                                    },
                                })
                            }
                        >
                            <SelectTrigger id={`${id}-unit`} className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ue">Unterrichtseinheiten</SelectItem>
                                <SelectItem value="hours">Stunden</SelectItem>
                                <SelectItem value="days">Tage</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
            </Block>

            <Block
                title="Kalender"
                text="Teilnehmende können alle Termine abonnieren; Änderungen kommen von selbst an."
            >
                <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <CalendarDays
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">
                        https://{HOST}/kalender/{run.id}.ics
                    </span>
                    <CopyLinkButton
                        url={`https://${HOST}/kalender/${run.id}.ics`}
                        label="Kalender-Link kopieren"
                        copiedLabel="Kopiert"
                    />
                </div>
            </Block>
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Preise
// ---------------------------------------------------------------------------

function RunPrices({
    courseTitle,
    run,
    onChange,
    onToast,
}: {
    courseTitle: string;
    run: Run;
    onChange: (r: Run) => void;
    onToast: (m: string) => void;
}) {
    const id = useId();
    const [adding, setAdding] = useState(false);
    const [kind, setKind] = useState<Price['kind']>('one_time');
    const [amount, setAmount] = useState(260);
    const [count, setCount] = useState(3);
    const [label, setLabel] = useState('');
    const setActive = (p: Price, active: boolean) =>
        onChange({
            ...run,
            prices: run.prices.map((x) => (x.id === p.id ? { ...x, active } : x)),
        });
    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Preise"
            text="Was diese Ausführung kostet. Die anderen Ausführungen haben ihre eigenen Preise."
            actions={
                <Button onClick={() => setAdding(true)}>
                    <Plus aria-hidden="true" /> Neuer Preis
                </Button>
            }
        >
            <Block
                title="Preisoptionen"
                timing="live"
                text="Wer bucht, wählt eine davon. Ein Preis lässt sich nicht ändern — sonst stimmten bestehende Bestellungen nicht mehr. Leg einen neuen an und deaktiviere den alten."
            >
                {run.prices.length === 0 ? (
                    <Note tone="warning" icon={CircleAlert} title="Noch kein Preis">
                        Ohne Preis lässt sich die Ausführung nicht veröffentlichen.
                    </Note>
                ) : (
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                        {run.prices.map((p) => (
                            <li
                                key={p.id}
                                className={cn(
                                    'flex items-center gap-4 px-4 py-3 text-sm',
                                    !p.active && 'text-muted-foreground',
                                )}
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block font-medium">{p.label}</span>
                                    <span className="block text-muted-foreground">
                                        {p.kind === 'installment'
                                            ? `${p.count} Raten, monatlich`
                                            : 'Einmal bei der Buchung'}{' '}
                                        · {p.sold} verkauft
                                    </span>
                                </span>
                                <span className="w-32 text-end font-semibold tabular-nums">
                                    {p.kind === 'installment'
                                        ? `${p.count} × ${euro(p.amount)}`
                                        : euro(p.amount)}
                                </span>
                                <span className="w-28">
                                    {p.active ? (
                                        <Badge tone="success" dot>
                                            Aktiv
                                        </Badge>
                                    ) : (
                                        <Badge tone="faint">Deaktiviert</Badge>
                                    )}
                                </span>
                                <RowMenu label={`Aktionen für ${p.label}`}>
                                    {p.active ? (
                                        <DropdownMenuItem onSelect={() => setActive(p, false)}>
                                            <Ban aria-hidden="true" /> Deaktivieren
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem onSelect={() => setActive(p, true)}>
                                            <Undo2 aria-hidden="true" /> Wieder aktivieren
                                        </DropdownMenuItem>
                                    )}
                                </RowMenu>
                            </li>
                        ))}
                    </ul>
                )}
            </Block>

            <Block
                title="Rabatte für diese Ausführung"
                text="Gutscheine und Preisregeln legst du in Zahlungen an — hier siehst du die, die nur hier gelten."
                action={
                    <StoryLink
                        label="In Zahlungen"
                        href="#/admin/payments/coupons"
                        story={['Pages/Admin/Zahlungen', 'Gutscheine']}
                    />
                }
            >
                {/* MOCK-ONLY: coupons and price rules are scoped by offering, but not listed per run anywhere. */}
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                    <li className="flex items-center gap-4 px-4 py-3">
                        <span className="w-28 font-mono text-xs">HERBST10</span>
                        <span className="flex-1">Gutschein · 10 % · 3 eingelöst</span>
                        <Badge tone="success" dot>
                            Aktiv
                        </Badge>
                    </li>
                    <li className="flex items-center gap-4 px-4 py-3 text-muted-foreground">
                        <span className="w-28 text-xs">Frühbucher</span>
                        <span className="flex-1">Preisregel · 40 € weniger bis 31.08.</span>
                        <Badge tone="faint">Abgelaufen</Badge>
                    </li>
                </ul>
            </Block>

            <Block
                title="Zahlung von Hand"
                text="Für Teilnehmende, die überwiesen oder bar bezahlt haben. Damit sind sie eingeschrieben."
            >
                <Button
                    variant="outline"
                    className="w-fit"
                    onClick={() => onToast('Überweisung erfassen öffnet sich hier')}
                >
                    <Euro aria-hidden="true" /> Überweisung erfassen …
                </Button>
            </Block>

            <Dialog open={adding} onOpenChange={setAdding}>
                <DialogContent closeLabel="Schließen" className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Neuer Preis</DialogTitle>
                        <DialogDescription>
                            Gilt nur für „{runLabel(run)}“ und ist sofort buchbar, solange die
                            Ausführung veröffentlicht ist.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-1.5">
                        <Label id={`${id}-kind`}>Art</Label>
                        <SegmentedChoice
                            aria-labelledby={`${id}-kind`}
                            value={kind}
                            onValueChange={(v) => setKind(v as Price['kind'])}
                        >
                            <SegmentedChoiceItem value="one_time">
                                Einmalzahlung
                            </SegmentedChoiceItem>
                            <SegmentedChoiceItem value="installment">Raten</SegmentedChoiceItem>
                        </SegmentedChoice>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field
                            id={`${id}-amount`}
                            label={kind === 'installment' ? 'Betrag je Rate (€)' : 'Betrag (€)'}
                        >
                            <IntegerInput
                                id={`${id}-amount`}
                                value={amount}
                                onValueChange={setAmount}
                            />
                        </Field>
                        {kind === 'installment' ? (
                            <Field id={`${id}-count`} label="Anzahl Raten">
                                <IntegerInput
                                    id={`${id}-count`}
                                    value={count}
                                    onValueChange={setCount}
                                />
                            </Field>
                        ) : (
                            <div />
                        )}
                        <Field
                            id={`${id}-label`}
                            label="Bezeichnung"
                            hint="So steht es bei der Buchung."
                            className="col-span-2"
                        >
                            <Input
                                id={`${id}-label`}
                                value={label}
                                placeholder={kind === 'installment' ? 'In Raten' : 'Einmalzahlung'}
                                onChange={(e) => setLabel(e.target.value)}
                            />
                        </Field>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAdding(false)}>
                            Abbrechen
                        </Button>
                        <Button
                            disabled={amount <= 0}
                            onClick={() => {
                                onChange({
                                    ...run,
                                    prices: [
                                        ...run.prices,
                                        {
                                            id: Date.now(),
                                            label:
                                                label ||
                                                (kind === 'installment'
                                                    ? 'In Raten'
                                                    : 'Einmalzahlung'),
                                            kind,
                                            amount,
                                            count: kind === 'installment' ? count : undefined,
                                            active: true,
                                            sold: 0,
                                        },
                                    ],
                                });
                                setAdding(false);
                            }}
                        >
                            Preis anlegen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Plätze & Zugang
// ---------------------------------------------------------------------------

type AccessForm = Pick<
    Run,
    'capacity' | 'enforceCapacity' | 'waitlistOn' | 'prerequisite' | 'restriction' | 'drip'
>;
const DRIP: [Drip, string, string][] = [
    ['immediate', 'Alles sofort', 'Alle Lektionen sind ab Beginn offen.'],
    ['weekly', 'Wöchentlich', 'Ab Beginn jede Woche das nächste Drittel eines Kapitels.'],
    ['daily', 'Täglich', 'Jeden Tag eine Lektion.'],
    ['by_date', 'Nach Datum', 'Du legst für jede Lektion ein Datum fest — in Inhalte.'],
    ['manual', 'Von Hand', 'Lehrkräfte geben jede Lektion selbst frei.'],
];

function RunAccess({
    courseTitle,
    run,
    onSave,
    onToast,
}: {
    courseTitle: string;
    run: Run;
    onSave: (r: Run) => void;
    onToast: (m: string) => void;
}) {
    const id = useId();
    const saved: AccessForm = {
        capacity: run.capacity,
        enforceCapacity: run.enforceCapacity,
        waitlistOn: run.waitlistOn,
        prerequisite: run.prerequisite,
        restriction: run.restriction,
        drip: run.drip,
    };
    const [form, setForm] = useState(saved);
    const patch = (p: Partial<AccessForm>) => setForm((f) => ({ ...f, ...p }));
    const dirty = JSON.stringify(form) !== JSON.stringify(saved);
    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Plätze & Zugang"
            text="Wie viele dabei sein können, wer buchen darf, und wann die Lektionen frei werden."
            bar={
                dirty && (
                    <UnsavedBar
                        message={
                            form.capacity < run.enrolled
                                ? `Weniger Plätze als Eingeschriebene (${run.enrolled}) — niemand wird ausgetragen, aber keiner kommt mehr dazu.`
                                : 'Gilt beim Speichern.'
                        }
                        onDiscard={() => setForm(saved)}
                        onSave={() => onSave({ ...run, ...form })}
                    />
                )
            }
        >
            <Block
                title="Plätze"
                timing="save"
                text={`${run.enrolled} belegt${run.enrolled < form.capacity ? `, ${form.capacity - run.enrolled} frei` : ' — ausgebucht'}.`}
            >
                <Field id={`${id}-cap`} label="Anzahl Plätze">
                    <IntegerInput
                        id={`${id}-cap`}
                        value={form.capacity}
                        onValueChange={(n) => patch({ capacity: n })}
                        className="w-24"
                    />
                </Field>
                <SwitchRow
                    id={`${id}-enforce`}
                    label="Nicht mehr Plätze verkaufen"
                    hint="Aus: Die Zahl ist nur ein Richtwert, Buchen geht weiter."
                    checked={form.enforceCapacity}
                    onCheckedChange={(v) => patch({ enforceCapacity: v })}
                />
            </Block>

            <Block title="Warteliste" timing="save">
                <SwitchRow
                    id={`${id}-wait`}
                    label="Warteliste, wenn ausgebucht"
                    hint="Wird ein Platz frei, bekommt die oder der Erste ein Angebot für 48 Stunden."
                    checked={form.waitlistOn}
                    onCheckedChange={(v) => patch({ waitlistOn: v })}
                />
                {run.waitlist.length > 0 && (
                    <ol className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                        {run.waitlist.map((w, i) => (
                            <li key={w.name} className="flex items-center gap-3 px-4 py-2.5">
                                <span className="w-6 text-muted-foreground tabular-nums">
                                    {i + 1}.
                                </span>
                                <InitialsAvatar name={w.name} size="sm" colored />
                                <span className="flex-1">{w.name}</span>
                                <span className="text-muted-foreground">seit {fmt(w.since)}</span>
                                {w.offered ? (
                                    <Badge tone="warning" dot>
                                        Angebot läuft
                                    </Badge>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            onToast(`${w.name} hat ein Angebot bekommen`)
                                        }
                                    >
                                        Platz anbieten
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ol>
                )}
            </Block>

            <Block title="Wer buchen darf" timing="save">
                <div className="grid grid-cols-2 gap-4">
                    <Field
                        id={`${id}-pre`}
                        label="Voraussetzung"
                        hint="Erfüllt, wer irgendeine Ausführung dieses Kurses abgeschlossen hat."
                    >
                        <Combobox
                            id={`${id}-pre`}
                            value={form.prerequisite || 'Keine'}
                            options={PREREQUISITES}
                            onChange={(v) => patch({ prerequisite: v === 'Keine' ? '' : v })}
                            placeholder="Kurs wählen …"
                            searchPlaceholder="Kurs suchen"
                            emptyLabel="Kein Kurs gefunden."
                        />
                    </Field>
                    <Field
                        id={`${id}-restrict`}
                        label="Nur für"
                        hint="Nach einem Feld im Profil, z. B. Mitgliedschaft."
                    >
                        <Select
                            value={form.restriction || 'all'}
                            onValueChange={(v) => patch({ restriction: v === 'all' ? '' : v })}
                        >
                            <SelectTrigger id={`${id}-restrict`} className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Alle</SelectItem>
                                <SelectItem value="members">Mitglieder des Vereins</SelectItem>
                                <SelectItem value="berlin">Wohnort Berlin</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
            </Block>

            <Block title="Lektionen freigeben" timing="save">
                <RadioGroup
                    aria-label="Lektionen freigeben"
                    value={form.drip}
                    onValueChange={(v) => patch({ drip: v as Drip })}
                >
                    {DRIP.map(([v, title, text]) => (
                        <div key={v} className="flex items-start gap-3">
                            <RadioGroupItem value={v} id={`${id}-${v}`} className="mt-0.5" />
                            <Label
                                htmlFor={`${id}-${v}`}
                                className="flex flex-col items-start gap-0.5 font-normal"
                            >
                                <span className="font-medium">{title}</span>
                                <span className="text-muted-foreground">{text}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
                {/* MOCK-ONLY: per-lesson dates for "Nach Datum" exist in the backend with no UI. */}
            </Block>
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Team
// ---------------------------------------------------------------------------

const PERMISSION_ROWS: [keyof Run['permissions'], string, string][] = [
    ['message', 'Teilnehmenden schreiben', 'Direkte Nachrichten an einzelne Teilnehmende.'],
    ['announce', 'Ankündigungen schicken', 'An alle in dieser Ausführung, per App und E-Mail.'],
    ['moderate', 'Kanal moderieren', 'Nachrichten im Kanal löschen, Leute stummschalten.'],
    ['complete', 'Abschluss setzen', 'Jemanden von Hand als „abgeschlossen“ markieren.'],
];

function RunTeam({
    courseTitle,
    run,
    onSave,
}: {
    courseTitle: string;
    run: Run;
    onSave: (r: Run) => void;
}) {
    const id = useId();
    const [perms, setPerms] = useState(run.permissions);
    const [adding, setAdding] = useState(false);
    const dirty = JSON.stringify(perms) !== JSON.stringify(run.permissions);
    const setTeachers = (teachers: Teacher[]) => onSave({ ...run, teachers });
    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Team"
            text="Wer unterrichtet, und was Lehrkräfte in dieser Ausführung dürfen."
            bar={
                dirty && (
                    <UnsavedBar
                        message="Die Rechte gelten beim Speichern."
                        onDiscard={() => setPerms(run.permissions)}
                        onSave={() => onSave({ ...run, permissions: perms })}
                    />
                )
            }
        >
            <Block
                title="Lehrkräfte"
                timing="live"
                action={
                    <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                        <UserPlus aria-hidden="true" /> Lehrkraft hinzufügen
                    </Button>
                }
            >
                {!lead(run) && (
                    <Note tone="warning" icon={CircleAlert} title="Keine leitende Lehrkraft">
                        Ohne sie kann die Ausführung nicht starten („läuft“).
                    </Note>
                )}
                {adding && (
                    <div className="flex items-end gap-2 rounded-lg border border-border bg-muted/40 p-3">
                        <Field id={`${id}-add`} label="Lehrkraft" className="flex-1">
                            <Combobox
                                id={`${id}-add`}
                                value=""
                                options={TEACHERS.filter(
                                    (t) => !run.teachers.some((x) => x.name === t),
                                )}
                                onChange={(name) => {
                                    setTeachers([
                                        ...run.teachers,
                                        { name, role: lead(run) ? 'assistant' : 'lead' },
                                    ]);
                                    setAdding(false);
                                }}
                                placeholder="Name suchen …"
                                searchPlaceholder="Name suchen"
                                emptyLabel="Niemand gefunden."
                            />
                        </Field>
                        <Button variant="ghost" onClick={() => setAdding(false)}>
                            Abbrechen
                        </Button>
                    </div>
                )}
                {run.teachers.length > 0 && (
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                        {run.teachers.map((t) => (
                            <li key={t.name} className="flex items-center gap-3 px-4 py-3 text-sm">
                                <InitialsAvatar name={t.name} size="sm" colored />
                                <span className="flex-1 font-medium">{t.name}</span>
                                <Badge tone={t.role === 'lead' ? 'success' : 'neutral'}>
                                    {t.role === 'lead' ? 'Leitung' : 'Assistenz'}
                                </Badge>
                                <RowMenu label={`Aktionen für ${t.name}`}>
                                    <DropdownMenuItem
                                        disabled={t.role === 'lead'}
                                        onSelect={() =>
                                            setTeachers(
                                                run.teachers.map((x) => ({
                                                    ...x,
                                                    role: x.name === t.name ? 'lead' : 'assistant',
                                                })),
                                            )
                                        }
                                    >
                                        <UserRound aria-hidden="true" /> Zur Leitung machen
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive-tint-foreground"
                                        onSelect={() =>
                                            setTeachers(
                                                run.teachers.filter((x) => x.name !== t.name),
                                            )
                                        }
                                    >
                                        <Trash2 aria-hidden="true" /> Entfernen
                                    </DropdownMenuItem>
                                </RowMenu>
                            </li>
                        ))}
                    </ul>
                )}
            </Block>

            <Block
                title="Was Lehrkräfte hier dürfen"
                timing="save"
                text="Lektionen bearbeiten dürfen nur Admins. Freigeben, Anwesenheit und Live-Räume dürfen Lehrkräfte immer."
            >
                <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
                    {PERMISSION_ROWS.map(([k, label, hint]) => (
                        <SwitchRow
                            key={k}
                            id={`${id}-${k}`}
                            label={label}
                            hint={hint}
                            checked={perms[k]}
                            onCheckedChange={(v) => setPerms({ ...perms, [k]: v })}
                        />
                    ))}
                    <div aria-hidden="true" className="border-t border-border" />
                    <div>
                        <SwitchRow
                            id={`${id}-students`}
                            label="Teilnehmende dürfen Lehrkräften schreiben"
                            checked={perms.studentsMessage}
                            onCheckedChange={(v) => setPerms({ ...perms, studentsMessage: v })}
                        />
                    </div>
                </div>
            </Block>
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Inhalte — this run's own copy
// ---------------------------------------------------------------------------

function RunContent({
    courseTitle,
    run,
    onStudentView,
    onToast,
}: {
    courseTitle: string;
    run: Run;
    onStudentView: () => void;
    onToast: (m: string) => void;
}) {
    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Inhalte"
            text={`${run.lessons} Lektionen in ${run.lessons ? CHAPTERS.length : 0} Kapiteln — nur in dieser Ausführung.`}
            wide
            actions={
                <>
                    <Button variant="outline" size="sm" onClick={onStudentView}>
                        <GraduationCap aria-hidden="true" /> Teilnehmer-Ansicht
                    </Button>
                    <Button variant="outline" size="sm">
                        <Upload aria-hidden="true" /> Videos hochladen
                    </Button>
                    <Button size="sm">
                        <Plus aria-hidden="true" /> Lektion
                    </Button>
                </>
            }
        >
            {run.delivery === 'running' && (
                <Note tone="warning" icon={TriangleAlert} title="Läuft gerade">
                    Was du hier änderst, sehen {run.enrolled} Teilnehmende sofort.
                </Note>
            )}
            <div className="flex items-start justify-between gap-6">
                <p className="text-sm text-muted-foreground">
                    Jede Ausführung hat ihre eigene Kopie der Lektionen. Eine Änderung hier ändert
                    die anderen nicht.
                </p>
                {/* MOCK-ONLY: content can only be copied when a run is created, not pulled in later. */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => onToast('Lektionen übernehmen öffnet sich hier')}
                >
                    <Download aria-hidden="true" /> Aus anderer Ausführung übernehmen …
                </Button>
            </div>
            {run.lessons === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="Noch keine Lektionen"
                    description="Leg das erste Kapitel an — oder übernimm die Lektionen einer anderen Ausführung."
                    action={
                        <Button>
                            <Plus aria-hidden="true" /> Erstes Kapitel
                        </Button>
                    }
                />
            ) : (
                <div className="flex flex-col gap-4">
                    {CHAPTERS.map((c, ci) => (
                        <section
                            key={c.title}
                            aria-label={`Kapitel ${ci + 1}: ${c.title}`}
                            className="rounded-lg border border-border"
                        >
                            <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-2">
                                <h2 className="flex-1 text-sm font-semibold">
                                    {ci + 1} · {c.title}
                                </h2>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {c.lessons.length} Lektionen ·{' '}
                                    {c.lessons.reduce((n, x) => n + x.minutes, 0)} Min.
                                </span>
                                <RowMenu label={`Aktionen für Kapitel ${ci + 1}`}>
                                    <DropdownMenuItem>
                                        <Pencil aria-hidden="true" /> Umbenennen
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Plus aria-hidden="true" /> Lektion hier einfügen
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive-tint-foreground">
                                        <Trash2 aria-hidden="true" /> Kapitel löschen …
                                    </DropdownMenuItem>
                                </RowMenu>
                            </div>
                            <ul className="flex flex-col divide-y divide-border">
                                {c.lessons.map((lesson, li) => {
                                    const index = CHAPTER_START[ci]! + li;
                                    const T = LESSON_TYPE[lesson.type];
                                    const at = releaseOf(run, index);
                                    const open = at !== null && at <= TODAY;
                                    return (
                                        <li
                                            key={lesson.title}
                                            className="flex items-center gap-3 px-4 py-2 text-sm"
                                        >
                                            <GripVertical
                                                className="size-4 shrink-0 text-muted-foreground"
                                                aria-hidden="true"
                                            />
                                            <T.icon
                                                className="size-4 shrink-0 text-muted-foreground"
                                                aria-label={T.label}
                                            />
                                            <span className="min-w-0 flex-1 truncate">
                                                {lesson.title}
                                            </span>
                                            {lesson.preview && (
                                                <Badge tone="neutral">Gratis-Vorschau</Badge>
                                            )}
                                            {at && run.drip !== 'immediate' && (
                                                <span className="w-24 text-end text-xs text-muted-foreground">
                                                    {open ? 'frei' : `frei ab ${fmtShort(at)}`}
                                                </span>
                                            )}
                                            <span className="w-14 text-end text-xs text-muted-foreground tabular-nums">
                                                {lesson.minutes} Min.
                                            </span>
                                            <RowMenu label={`Aktionen für ${lesson.title}`}>
                                                <DropdownMenuItem>
                                                    <Pencil aria-hidden="true" /> Bearbeiten
                                                </DropdownMenuItem>
                                                {lesson.type === 'quiz' && (
                                                    <DropdownMenuItem>
                                                        <ListChecks aria-hidden="true" /> Fragen
                                                        bearbeiten
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem>
                                                    <Copy aria-hidden="true" /> Duplizieren
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive-tint-foreground">
                                                    <Trash2 aria-hidden="true" /> Löschen …
                                                </DropdownMenuItem>
                                            </RowMenu>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                    <Button variant="outline" size="sm" className="w-fit">
                        <Plus aria-hidden="true" /> Kapitel
                    </Button>
                </div>
            )}
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Teilnehmende
// ---------------------------------------------------------------------------

function RunPeople({
    run,
    runs,
    onToast,
    onTab,
}: {
    run: Run;
    runs: Run[];
    onToast: (m: string) => void;
    onTab: (t: RunTab) => void;
}) {
    const id = useId();
    const [rows, setRows] = useState(() => ENROLMENTS.filter((e) => e.runId === run.id));
    const [search, setSearch] = useState('');
    const [confirm, setConfirm] = useState<{ kind: 'drop' | 'rebook'; e: Enrolment } | null>(null);
    const siblings = runs.filter((r) => r.id !== run.id && !ENDED.has(r.delivery));
    const [target, setTarget] = useState(siblings[0]?.id ?? '');
    const shown = rows.filter((e) =>
        `${e.name} ${e.email}`.toLowerCase().includes(search.toLowerCase()),
    );
    const byId = (ids: RowId[]) => rows.find((e) => e.id === Number(ids[0]));

    const columns: GridColumn<Enrolment>[] = useMemo(
        () => [
            {
                id: 'name',
                header: 'Name',
                pinned: 'left',
                hideable: false,
                width: 260,
                filter: { type: 'text' },
                cell: (e) => (
                    <span className="flex min-w-0 items-center gap-3">
                        <InitialsAvatar name={e.name} size="sm" colored />
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate font-medium">{e.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                                {e.email}
                            </span>
                        </span>
                    </span>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                width: 150,
                groupable: true,
                value: (e) => ENROLMENT_STATUS[e.status].label,
                cell: (e) => (
                    <Badge tone={ENROLMENT_STATUS[e.status].tone} dot>
                        {ENROLMENT_STATUS[e.status].label}
                    </Badge>
                ),
            },
            {
                id: 'done',
                header: 'Fortschritt',
                align: 'right',
                width: 130,
                value: (e) => e.done,
                cell: (e) => (
                    <span className="tabular-nums">
                        {e.done} / {LESSON_COUNT}
                    </span>
                ),
            },
            {
                id: 'payment',
                header: 'Zahlung',
                width: 140,
                groupable: true,
                value: (e) => PAYMENT[e.payment].label,
                cell: (e) => (
                    <Badge tone={PAYMENT[e.payment].tone} dot>
                        {PAYMENT[e.payment].label}
                    </Badge>
                ),
            },
            {
                id: 'enrolledAt',
                header: 'Eingeschrieben',
                width: 150,
                cell: (e) => fmt(e.enrolledAt),
                filter: { type: 'date' },
            },
            {
                id: 'actions',
                header: 'Aktionen',
                pinned: 'right',
                hideable: false,
                sortable: false,
                width: 110,
                cell: (e) => (
                    <RowMenu label={`Aktionen für ${e.name}`}>
                        <DropdownMenuItem onSelect={() => onToast(`Nachricht an ${e.name}`)}>
                            <Mail aria-hidden="true" /> Nachricht schreiben
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            disabled={e.status !== 'active'}
                            onSelect={() => setConfirm({ kind: 'rebook', e })}
                        >
                            <CalendarRange aria-hidden="true" /> Umbuchen …
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            disabled={e.status !== 'active'}
                            onSelect={() => onToast(`${e.name} als abgeschlossen markiert`)}
                        >
                            <Award aria-hidden="true" /> Abschluss setzen …
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            disabled={e.status !== 'active'}
                            className="text-destructive-tint-foreground"
                            onSelect={() => setConfirm({ kind: 'drop', e })}
                        >
                            <X aria-hidden="true" /> Austragen …
                        </DropdownMenuItem>
                    </RowMenu>
                ),
            },
        ],
        [onToast],
    );

    const actions: GridActionItem[] = [
        {
            id: 'add',
            label: 'Teilnehmende hinzufügen',
            icon: <UserPlus aria-hidden="true" />,
            tone: 'primary',
            shortcut: 'N',
            onSelect: () => onToast('Hinzufügen öffnet sich hier'),
        },
        {
            // MOCK-ONLY: only the course-wide roster export exists today; no per-run CSV.
            id: 'csv',
            label: 'Als CSV herunterladen',
            icon: <Download aria-hidden="true" />,
            onSelect: () => onToast(`CSV mit ${rows.length} Zeilen wird heruntergeladen`),
        },
        {
            id: 'message',
            label: 'Nachricht schreiben',
            icon: <Mail aria-hidden="true" />,
            when: ['one'],
            group: 'one',
            isDefault: true,
            onSelect: (ids) => onToast(`Nachricht an ${byId(ids)?.name ?? ''}`),
        },
        {
            id: 'rebook',
            label: 'Umbuchen …',
            icon: <CalendarRange aria-hidden="true" />,
            when: ['one'],
            group: 'one',
            disabled: (ids) => byId(ids)?.status !== 'active',
            disabledReason: 'Nur für aktive Teilnehmende',
            onSelect: (ids) => {
                const e = byId(ids);
                if (e) setConfirm({ kind: 'rebook', e });
            },
        },
        {
            id: 'drop',
            label: 'Austragen …',
            icon: <X aria-hidden="true" />,
            when: ['one'],
            group: 'danger',
            tone: 'destructive',
            disabled: (ids) => byId(ids)?.status !== 'active',
            disabledReason: 'Nur für aktive Teilnehmende',
            onSelect: (ids) => {
                const e = byId(ids);
                if (e) setConfirm({ kind: 'drop', e });
            },
        },
    ];

    const grid = useGrid<Enrolment>({
        id: `storybook.page.kurs-editor.people`,
        rows: shown,
        getRowId: (e) => e.id,
        columns,
        selection: 'single',
        actions,
    });
    const active = rows.filter((e) => e.status === 'active').length;

    return (
        <>
            <GridPage
                title={`Teilnehmende · ${runLabel(run)}`}
                offsetTop="0px"
                grid={grid}
                search={{ value: search, onChange: setSearch, placeholder: 'Name oder E-Mail …' }}
                moreActionsLabel="Weitere Aktionen"
                selectionLabels={{ count: (c) => `${c} ausgewählt`, clear: 'Auswahl aufheben' }}
                shortcutLabels={{ Mod: 'Strg', Shift: 'Umschalt', Delete: 'Entf' }}
                options={
                    <GridOptions
                        preferences={grid.preferences}
                        canSelect={grid.allowedMode !== 'none'}
                        columns={columns.map((c) => ({
                            id: c.id,
                            label: c.header,
                            hideable: c.hideable,
                        }))}
                        views={{
                            views: grid.views,
                            activeViewId: grid.activeViewId,
                            isModified: grid.isViewModified,
                            onApply: grid.applyView,
                            onSave: (name) => void grid.saveView(name),
                            onUpdate: grid.updateView,
                            onRename: grid.renameView,
                            onDelete: grid.deleteView,
                            labels: VIEWS_LABELS,
                        }}
                        labels={OPTIONS_LABELS}
                    />
                }
                chips={
                    grid.filters.length ? (
                        <GridFilterChips
                            filters={grid.filters}
                            columns={columns}
                            onRemove={grid.removeFilter}
                            onClearAll={grid.clearFilters}
                            labels={FILTER_CHIPS_LABELS}
                            formatDate={(d) => d}
                            formatNumber={(x) => String(x)}
                        />
                    ) : undefined
                }
                notice={
                    <span className="flex flex-wrap items-center gap-x-6 text-muted-foreground">
                        <span>
                            {ENDED.has(run.delivery)
                                ? `${run.completed} von ${rows.length} haben abgeschlossen.`
                                : `${active} von ${run.capacity} Plätzen belegt${run.waitlist.length ? ` · ${run.waitlist.length} auf der Warteliste` : ''}.`}
                        </span>
                        <TextLink onClick={() => onTab('access')}>Plätze & Zugang</TextLink>
                    </span>
                }
                footer={
                    <GridFooter
                        summary={`${shown.length} Teilnehmende`}
                        onPrev={null}
                        onNext={null}
                        labels={{ previous: 'Zurück', next: 'Weiter', pager: 'Seiten' }}
                    />
                }
            >
                <DataGrid
                    grid={grid}
                    labels={{
                        ...DATA_GRID_LABELS,
                        table: 'Teilnehmende',
                        empty:
                            run.visibility === 'draft'
                                ? 'Noch niemand — die Ausführung ist ein Entwurf.'
                                : 'Niemand passt dazu.',
                    }}
                    rowLabel={(e) => e.name}
                    renderFilter={(col, close) => (
                        <GridFilterEditor
                            key={col.id}
                            columnId={col.id}
                            header={col.header}
                            def={col.filter!}
                            value={grid.filters.find((x) => x.id === col.id)}
                            onApply={(x) => {
                                if (x) grid.setFilter(x);
                                else grid.removeFilter(col.id);
                                close();
                            }}
                            labels={FILTER_EDITOR_LABELS}
                        />
                    )}
                />
            </GridPage>
            <ConfirmActionDialog
                open={confirm?.kind === 'drop'}
                onOpenChange={(o) => !o && setConfirm(null)}
                title={`${confirm?.e.name ?? ''} austragen?`}
                description="Der Platz wird frei, der Zugang zu den Lektionen endet. Eine Erstattung machst du in Zahlungen."
                confirmLabel="Austragen"
                cancelLabel="Abbrechen"
                onConfirm={() => {
                    setRows((all) =>
                        all.map((x) => (x.id === confirm?.e.id ? { ...x, status: 'dropped' } : x)),
                    );
                    onToast(`${confirm?.e.name ?? ''} ausgetragen`);
                }}
            />
            <ConfirmActionDialog
                open={confirm?.kind === 'rebook'}
                onOpenChange={(o) => !o && setConfirm(null)}
                title={`${confirm?.e.name ?? ''} umbuchen`}
                description="Fortschritt und Zahlung ziehen mit um. Die Person bekommt eine E-Mail."
                confirmLabel="Umbuchen"
                cancelLabel="Abbrechen"
                variant="default"
                onConfirm={() => {
                    setRows((all) => all.filter((x) => x.id !== confirm?.e.id));
                    onToast(
                        `${confirm?.e.name ?? ''} ist jetzt in „${runLabel(runs.find((r) => r.id === target) ?? run)}“`,
                    );
                }}
            >
                <Field id={`${id}-target`} label="In die Ausführung">
                    <Select value={target} onValueChange={setTarget}>
                        <SelectTrigger id={`${id}-target`} className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {siblings.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                    {runLabel(r)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Field>
            </ConfirmActionDialog>
        </>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Live & Aufnahmen
// ---------------------------------------------------------------------------

const LIVE_ROWS: [keyof Run['live'], string, string][] = [
    ['sessions', 'Live-Sitzungen', 'Unterricht im Live-Raum der Schule.'],
    ['audio', 'Teilnehmende dürfen sprechen', 'Sonst hören sie nur zu und schreiben im Chat.'],
    ['video', 'Teilnehmende dürfen die Kamera anmachen', ''],
    ['recordings', 'Sitzungen aufnehmen', 'Aufnahmen erscheinen danach im Kurs.'],
    ['recordStudents', 'Teilnehmende mit aufnehmen', 'Aus: Nur die Lehrkraft ist in der Aufnahme.'],
];

function RunLive({
    courseTitle,
    run,
    onSave,
}: {
    courseTitle: string;
    run: Run;
    onSave: (r: Run) => void;
}) {
    const id = useId();
    const [live, setLive] = useState(run.live);
    const dirty = JSON.stringify(live) !== JSON.stringify(run.live);
    const sessions = sessionsOf(run);
    const past = sessions.filter((s) => s.date < TODAY);
    const next = sessions.filter((s) => s.date >= TODAY).slice(0, 5);
    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Live & Aufnahmen"
            text={`${sessions.length} Sitzungen nach dem Wochenplan · ${past.length} vorbei.`}
            bar={
                dirty && (
                    <UnsavedBar
                        message="Gilt ab der nächsten Sitzung."
                        onDiscard={() => setLive(run.live)}
                        onSave={() => onSave({ ...run, live })}
                    />
                )
            }
        >
            <Block title="Einstellungen" timing="save">
                <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
                    {LIVE_ROWS.map(([k, label, hint]) => (
                        <SwitchRow
                            key={k}
                            id={`${id}-${k}`}
                            label={label}
                            hint={hint || undefined}
                            checked={live[k]}
                            disabled={k !== 'sessions' && !live.sessions}
                            onCheckedChange={(v) => setLive({ ...live, [k]: v })}
                        />
                    ))}
                </div>
            </Block>

            <Block
                title="Nächste Sitzungen"
                action={
                    <StoryLink
                        label="Im Bereich Live"
                        href="#/admin/live"
                        story={['Pages/Admin/Live', 'Sitzungen']}
                    />
                }
            >
                {next.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Keine kommenden Sitzungen.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                        {next.map((s, i) => (
                            <li key={s.date} className="flex items-center gap-4 px-4 py-2.5">
                                <span className="w-24 font-medium tabular-nums">
                                    {sessionDay(s.date)}
                                </span>
                                <span className="w-28 tabular-nums">
                                    {s.from}–{s.to}
                                </span>
                                <span className="flex-1 text-muted-foreground">
                                    Sitzung {past.length + i + 1} · {lead(run) ?? 'Lehrkraft fehlt'}
                                </span>
                                <RowMenu label={`Aktionen für ${sessionDay(s.date)}`}>
                                    <DropdownMenuItem>
                                        <Pencil aria-hidden="true" /> Bearbeiten
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive-tint-foreground">
                                        <Ban aria-hidden="true" /> Fällt aus …
                                    </DropdownMenuItem>
                                </RowMenu>
                            </li>
                        ))}
                    </ul>
                )}
            </Block>

            <Block
                title="Aufnahmen"
                action={
                    <StoryLink
                        label="Alle Aufnahmen"
                        href="#/admin/live/recordings"
                        story={['Pages/Admin/Live', 'Aufnahmen']}
                    />
                }
            >
                {!run.live.recordings || past.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Noch keine Aufnahmen.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                        {past
                            .slice(-3)
                            .reverse()
                            .map((s, i) => (
                                <li key={s.date} className="flex items-center gap-4 px-4 py-2.5">
                                    <CirclePlay
                                        className="size-4 shrink-0 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <span className="flex-1">
                                        Sitzung {past.length - i} · {sessionDay(s.date)}
                                    </span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {[88, 91, 86][i]} Min. · {[14, 16, 12][i]}× angesehen
                                    </span>
                                </li>
                            ))}
                    </ul>
                )}
            </Block>

            <Block title="Anwesenheit">
                {/* MOCK-ONLY: the attendance average per run is not computed today. */}
                <p className="text-sm">
                    {past.length
                        ? 'Im Schnitt 86 % · bei der letzten Sitzung 16 von 18.'
                        : 'Noch keine Sitzung vorbei.'}
                </p>
                <Button variant="outline" size="sm" className="w-fit">
                    <ListChecks aria-hidden="true" /> Anwesenheit öffnen
                </Button>
            </Block>
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Zertifikat
// ---------------------------------------------------------------------------

function RunCertificate({
    courseTitle,
    run,
    onSave,
}: {
    courseTitle: string;
    run: Run;
    onSave: (r: Run) => void;
}) {
    const id = useId();
    const [on, setOn] = useState(run.certificate);
    const [template, setTemplate] = useState(run.template);
    const dirty = on !== run.certificate || template !== run.template;
    const issued = ENROLMENTS.filter((e) => e.runId === run.id && e.status === 'completed');
    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Zertifikat"
            text="Was Teilnehmende dieser Ausführung am Ende bekommen."
            bar={
                dirty && (
                    <UnsavedBar
                        message={
                            on
                                ? 'Gilt für alle, die ab jetzt fertig werden.'
                                : 'Schon ausgestellte Zertifikate bleiben gültig.'
                        }
                        onDiscard={() => {
                            setOn(run.certificate);
                            setTemplate(run.template);
                        }}
                        onSave={() => onSave({ ...run, certificate: on, template })}
                    />
                )
            }
        >
            <Block title="Zertifikat" timing="save">
                <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
                    <SwitchRow
                        id={`${id}-on`}
                        label="Zertifikat ausstellen"
                        hint="Die Kursseite zeigt „mit Zertifikat“, solange eine buchbare Ausführung eins ausstellt."
                        checked={on}
                        onCheckedChange={setOn}
                    />
                    {on && (
                        <Field id={`${id}-tpl`} label="Vorlage">
                            <Select value={template} onValueChange={setTemplate}>
                                <SelectTrigger id={`${id}-tpl`} className="w-80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Teilnahmeurkunde (Schulvorlage)">
                                        Teilnahmeurkunde (Schulvorlage)
                                    </SelectItem>
                                    <SelectItem value="Urkunde mit Siegel">
                                        Urkunde mit Siegel
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    )}
                </div>
            </Block>

            {on && (
                <>
                    <Block
                        title="Wann es das gibt"
                        text="Abschlussstufen — die höchste erreichte steht auf dem Zertifikat."
                        action={
                            <Button variant="outline" size="sm">
                                <Plus aria-hidden="true" /> Stufe
                            </Button>
                        }
                    >
                        <ol className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                            {[
                                ['Teilgenommen', '80 % der Lektionen erledigt'],
                                ['Mit Auszeichnung', 'Dazu alle Quizze mit mindestens 90 %'],
                            ].map(([name, rule], i) => (
                                <li key={name} className="flex items-center gap-3 px-4 py-2.5">
                                    <span className="w-6 text-muted-foreground tabular-nums">
                                        {i + 1}.
                                    </span>
                                    <span className="w-40 font-medium">{name}</span>
                                    <span className="flex-1 text-muted-foreground">{rule}</span>
                                    <RowMenu label={`Aktionen für ${name}`}>
                                        <DropdownMenuItem>
                                            <Pencil aria-hidden="true" /> Bearbeiten
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive-tint-foreground">
                                            <Trash2 aria-hidden="true" /> Entfernen
                                        </DropdownMenuItem>
                                    </RowMenu>
                                </li>
                            ))}
                        </ol>
                    </Block>

                    <Block title="Vorschau">
                        <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-border p-8 text-center">
                            <Award className="size-8 text-muted-foreground" aria-hidden="true" />
                            <p className="text-xs tracking-wide text-muted-foreground uppercase">
                                Al-Nur Akademie
                            </p>
                            <p className="text-xl font-semibold">Teilnahmezertifikat</p>
                            <p className="text-sm text-muted-foreground">
                                Hiermit bestätigen wir, dass
                            </p>
                            <p className="text-lg font-medium">Leonie Weber</p>
                            <p className="max-w-md text-sm text-muted-foreground">
                                den Kurs „{courseTitle}“ ({runLabel(run)}, {run.duration.amount}{' '}
                                {UNITS[run.duration.unit]}) mit der Stufe „Teilgenommen“
                                abgeschlossen hat.
                            </p>
                            <p className="pt-2 text-xs text-muted-foreground">
                                Berlin, {run.endsAt ? fmt(run.endsAt) : '—'} ·{' '}
                                {lead(run) ?? 'Lehrkraft'}
                            </p>
                        </div>
                    </Block>

                    <Block title="Ausgestellt">
                        {issued.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Noch keins — sobald jemand die erste Stufe erreicht, steht es hier.
                            </p>
                        ) : (
                            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                                {issued.slice(0, 5).map((e) => (
                                    <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                                        <InitialsAvatar name={e.name} size="sm" colored />
                                        <span className="flex-1">{e.name}</span>
                                        <span className="text-muted-foreground">
                                            {fmt(run.endsAt!)}
                                        </span>
                                        <RowMenu label={`Aktionen für ${e.name}`}>
                                            <DropdownMenuItem>
                                                <Download aria-hidden="true" /> Herunterladen
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive-tint-foreground">
                                                <Ban aria-hidden="true" /> Widerrufen …
                                            </DropdownMenuItem>
                                        </RowMenu>
                                    </li>
                                ))}
                                {issued.length > 5 && (
                                    <li className="px-4 py-2.5 text-muted-foreground">
                                        und {issued.length - 5} weitere
                                    </li>
                                )}
                            </ul>
                        )}
                    </Block>
                </>
            )}
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Kommunikation — this run's slice of the Kommunikation area
// ---------------------------------------------------------------------------

function RunCommunication({
    courseTitle,
    run,
    onTab,
}: {
    courseTitle: string;
    run: Run;
    onTab: (t: RunTab) => void;
}) {
    const people = run.enrolled || run.completed;
    const quiet = run.visibility === 'draft' || people === 0;
    const p = run.permissions;
    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Kommunikation"
            text="Nur, was zu dieser Ausführung gehört. Alles zusammen findest du im Bereich Kommunikation."
            actions={
                <Button size="sm" disabled={quiet}>
                    <Megaphone aria-hidden="true" /> Ankündigung schreiben
                </Button>
            }
        >
            <Note tone="muted" icon={ShieldCheck}>
                Lehrkräfte dürfen hier:{' '}
                {[
                    p.message && 'Teilnehmenden schreiben',
                    p.announce && 'Ankündigungen schicken',
                    p.moderate && 'den Kanal moderieren',
                ]
                    .filter(Boolean)
                    .join(', ') || 'nichts davon'}
                .{' '}
                <button
                    type="button"
                    onClick={() => onTab('team')}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                    Im Team ändern
                </button>
            </Note>

            <Block
                title="Kanal"
                action={
                    <StoryLink
                        label="In Kommunikation"
                        href="#/admin/communication/channels"
                        story={['Pages/Admin/Kommunikation', 'Kanaele']}
                    />
                }
            >
                {quiet ? (
                    <p className="text-sm text-muted-foreground">
                        Der Kanal entsteht, sobald sich die erste Person einschreibt.
                    </p>
                ) : (
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                        <li className="flex items-center gap-3 px-4 py-2.5">
                            <Hash
                                className="size-4 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <span className="flex-1 font-medium">{runLabel(run)} · Allgemein</span>
                            <span className="text-muted-foreground">
                                {people + run.teachers.length} Mitglieder · 142 Nachrichten
                            </span>
                        </li>
                        <li className="flex items-center gap-3 px-4 py-2.5">
                            <Hash
                                className="size-4 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <span className="flex-1 font-medium">Fragen zu den Hausaufgaben</span>
                            <Badge tone="neutral">Anonym</Badge>
                            <span className="text-muted-foreground">38 Nachrichten</span>
                        </li>
                    </ul>
                )}
            </Block>

            <Block
                title="Ankündigungen"
                action={
                    <StoryLink
                        label="In Kommunikation"
                        href="#/admin/communication/announcements"
                        story={['Pages/Admin/Kommunikation', 'Ankuendigungen']}
                    />
                }
            >
                {quiet ? (
                    <p className="text-sm text-muted-foreground">Noch keine.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                        {[
                            [
                                'Mittwoch fällt aus — Ersatz am Freitag',
                                '29.09.2026',
                                'Layla Haddad',
                                15,
                            ],
                            ['Willkommen im Kurs!', '14.09.2026', 'Layla Haddad', 18],
                        ].map(([title, date, by, read]) => (
                            <li key={title} className="flex items-center gap-3 px-4 py-2.5">
                                <Megaphone
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1">
                                    <span className="block font-medium">{title}</span>
                                    <span className="block text-muted-foreground">
                                        {date} · {by}
                                    </span>
                                </span>
                                <span className="text-muted-foreground tabular-nums">
                                    {read} von {people} gelesen
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Block>

            <Block
                title="Unterhaltungen"
                text="Ohne Vorschau — wer eine Unterhaltung öffnet, steht im Protokoll."
                action={
                    <StoryLink
                        label="In Kommunikation"
                        href="#/admin/communication/threads"
                        story={['Pages/Admin/Kommunikation', 'Unterhaltungen']}
                    />
                }
            >
                {quiet ? (
                    <p className="text-sm text-muted-foreground">Noch keine.</p>
                ) : (
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                        {[
                            ['Layla Haddad', 'Yusuf Okafor', 'heute, 09:12', 4],
                            ['Musa Kaya', 'Hanna Schneider', 'gestern, 20:41', 2],
                            ['Layla Haddad', 'Elif Hoffmann', '28.09., 18:05', 7],
                        ].map(([a, b, when, n]) => (
                            <li key={`${a}-${b}`} className="flex items-center gap-3 px-4 py-2.5">
                                <MessagesSquare
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <span className="flex-1">
                                    {a} ↔ {b}
                                </span>
                                <span className="text-muted-foreground">
                                    {n} Nachrichten · {when}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Block>
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// Ausführung › Einstellungen
// ---------------------------------------------------------------------------

function RunSettings({
    course,
    courseTitle,
    run,
    runs,
    onSave,
    onVisibility,
    onDuplicate,
    onCancel,
    onArchive,
    onView,
}: {
    course: Course;
    courseTitle: string;
    run: Run;
    runs: Run[];
    onSave: (r: Run) => void;
    onVisibility: (v: Visibility) => void;
    onDuplicate: () => void;
    onCancel: () => void;
    onArchive: () => void;
    onView: (v: View) => void;
}) {
    const id = useId();
    const [labelOverride, setLabelOverride] = useState(run.labelOverride);
    const [note, setNote] = useState(run.note);
    const [confirm, setConfirm] = useState<'unpublish' | 'cancel' | 'archive' | null>(null);
    const dirty = labelOverride !== run.labelOverride || note !== run.note;
    const onDemandClash =
        run.delivery === 'on_demand'
            ? runs.some((r) => r.id !== run.id && r.visibility === 'published' && r.startsAt)
            : runs.some(
                  (r) =>
                      r.id !== run.id && r.visibility === 'published' && r.delivery === 'on_demand',
              );
    const guards: Guard[] = [
        {
            id: 'course',
            ok: course.status === 'published',
            label: 'Der Kurs ist veröffentlicht',
            fix: {
                label: 'Zum Kurs',
                go: () => onView({ level: 'course', tab: 'settings' }),
            },
        },
        {
            // MOCK-ONLY: publishing does not check for a price today.
            id: 'price',
            ok: run.prices.some((p) => p.active),
            label: 'Es gibt mindestens einen Preis',
            fix: {
                label: 'Preise',
                go: () => onView({ level: 'run', runId: run.id, tab: 'prices' }),
            },
        },
        {
            id: 'ondemand',
            ok: !onDemandClash,
            label: 'Nicht zugleich „auf Abruf“ und mit Terminen veröffentlicht',
        },
    ];
    return (
        <PageFrame
            eyebrow={`${courseTitle} › ${runLabel(run)}`}
            title="Einstellungen"
            text="Bezeichnung, Sichtbarkeit und was mit der Ausführung passiert."
            bar={
                dirty && (
                    <UnsavedBar
                        message="Bezeichnung und Notiz ändern sich beim Speichern."
                        onDiscard={() => {
                            setLabelOverride(run.labelOverride);
                            setNote(run.note);
                        }}
                        onSave={() => onSave({ ...run, labelOverride, note })}
                    />
                )
            }
        >
            <Block
                title="Bezeichnung"
                timing="save"
                text="So heißt die Ausführung auf der Kursseite, bei der Buchung und hier im Admin."
            >
                {/* MOCK-ONLY: label_override cannot be edited after creation today. */}
                <Field
                    id={`${id}-label`}
                    label="Eigene Bezeichnung (optional)"
                    hint={`Leer: „${run.label}“ — entsteht aus Zeitraum und Format.`}
                >
                    <Input
                        id={`${id}-label`}
                        value={labelOverride}
                        placeholder={run.label}
                        onChange={(e) => setLabelOverride(e.target.value)}
                    />
                </Field>
            </Block>

            <Block title="Sichtbarkeit" timing="live">
                <VisibilitySwitch
                    label="Ausführung"
                    hint="Gilt sofort. Steht dann auf der Kursseite und ist buchbar."
                    value={run.visibility}
                    onChange={(v) => (v === 'draft' ? setConfirm('unpublish') : onVisibility(v))}
                    guards={guards}
                    draftText="Nicht auf der Kursseite, niemand kann buchen. Wer schon eingeschrieben ist, lernt weiter."
                    publishedText={
                        course.status === 'published'
                            ? 'Auf der Kursseite unter „Termine“ und buchbar, bis sie endet.'
                            : 'Buchbar, sobald auch der Kurs veröffentlicht ist.'
                    }
                />
            </Block>

            <Block
                title="Interne Notiz"
                timing="save"
                text="Nur für das Team. Teilnehmende sehen sie nie."
            >
                <Textarea
                    aria-label="Interne Notiz"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </Block>

            <Block title="Adresse für Teilnehmende">
                <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">
                        https://{HOST}/my/courses/{course.slug}-{run.id}
                    </span>
                    <CopyLinkButton
                        url={`https://${HOST}/my/courses/${course.slug}-${run.id}`}
                        label="Adresse kopieren"
                        copiedLabel="Kopiert"
                    />
                </div>
            </Block>

            <Block title="Weitere Aktionen">
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                    {(
                        [
                            [
                                Copy,
                                'Kopieren',
                                'Eine neue Ausführung mit diesen Lektionen, Preisen und Einstellungen — als Entwurf.',
                                'Kopieren …',
                                onDuplicate,
                                false,
                                false,
                            ],
                            [
                                Ban,
                                'Absagen',
                                `${run.enrolled} Teilnehmende werden abgemeldet und benachrichtigt, die Warteliste schließt. Erstatten machst du in Zahlungen. Lässt sich nicht zurücknehmen.`,
                                'Absagen …',
                                () => setConfirm('cancel'),
                                ENDED.has(run.delivery),
                                true,
                            ],
                            [
                                Archive,
                                'Archivieren',
                                'Verschwindet aus der Liste. Laufende Sitzungen enden, aktive Einschreibungen auch.',
                                'Archivieren …',
                                () => setConfirm('archive'),
                                false,
                                true,
                            ],
                        ] as const
                    ).map(([Icon, title, text, button, go, disabled, danger]) => (
                        <li key={title} className="flex items-start gap-4 px-4 py-3">
                            <Icon
                                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <span className="min-w-0 flex-1 text-sm">
                                <span className="block font-medium">{title}</span>
                                <span className="block text-muted-foreground">{text}</span>
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={disabled}
                                className={cn(danger && 'text-destructive-tint-foreground')}
                                onClick={go}
                            >
                                {button}
                            </Button>
                        </li>
                    ))}
                </ul>
            </Block>

            <ConfirmActionDialog
                open={confirm === 'unpublish'}
                onOpenChange={(o) => !o && setConfirm(null)}
                title={`„${runLabel(run)}“ zurück auf Entwurf?`}
                description={`Sie verschwindet sofort von der Kursseite, niemand kann mehr buchen. ${run.enrolled ? `Die ${run.enrolled} Teilnehmenden lernen weiter wie bisher.` : ''}`}
                confirmLabel="Auf Entwurf setzen"
                cancelLabel="Abbrechen"
                variant="default"
                onConfirm={() => onVisibility('draft')}
            />
            <ConfirmActionDialog
                open={confirm === 'cancel'}
                onOpenChange={(o) => !o && setConfirm(null)}
                title={`„${runLabel(run)}“ absagen?`}
                description={`${run.enrolled} Teilnehmende bekommen eine Absage-E-Mail und verlieren den Zugang. Die Warteliste schließt. Das lässt sich nicht zurücknehmen.`}
                confirmLabel="Absagen"
                cancelLabel="Nicht absagen"
                onConfirm={onCancel}
            />
            <ConfirmActionDialog
                open={confirm === 'archive'}
                onOpenChange={(o) => !o && setConfirm(null)}
                title={`„${runLabel(run)}“ archivieren?`}
                description="Aktive Einschreibungen enden, geplante Sitzungen fallen aus. Gelöscht wird nichts."
                confirmLabel="Archivieren"
                cancelLabel="Abbrechen"
                onConfirm={onArchive}
            />
        </PageFrame>
    );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

function CourseEditor({
    courseKey = 'arabisch',
    initialView = { level: 'course', tab: 'page' },
    publishOpen = false,
    studentRun,
}: {
    courseKey?: CourseKey;
    initialView?: View;
    /** Open "Was geht live?" straight away. */
    publishOpen?: boolean;
    /** The run the Teilnehmer-Ansicht starts with. */
    studentRun?: string;
}) {
    const base = COURSES[courseKey];
    const [course, setCourse] = useState(base);
    const [runs, setRuns] = useState(base.runs);
    const { page: draft, revert, publish } = useCourseDraft(base);
    const [view, setView] = useState<View>(initialView);
    const [lang, setLang] = useState<Lang>('de');
    const [publishing, setPublishing] = useState(publishOpen);
    const [newRun, setNewRun] = useState<{ source: string | null } | null>(null);
    const [cancelRun, setCancelRun] = useState<string | null>(null);
    const [student, setStudent] = useState(studentRun);
    const [toast, setToast] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    const title = draft.draft.de.title;
    const updateRun = (r: Run) => setRuns((all) => all.map((x) => (x.id === r.id ? r : x)));
    const runById = (rid: string) => runs.find((r) => r.id === rid);
    const go = (v: View) => setView(v);

    /** The one switch, with its guards, also reachable from the grid. */
    // MOCK-ONLY: an offering cannot be unpublished today (only cancelled or archived),
    // and one Entwurf/Veröffentlicht switch replaces the course's status × is_public pair.
    const setVisibility = (rid: string, v: Visibility) => {
        const r = runById(rid);
        if (!r) return;
        if (v === 'published' && course.status === 'draft') {
            setNotice(
                `„${runLabel(r)}“ kann erst veröffentlicht werden, wenn der Kurs veröffentlicht ist.`,
            );
            return;
        }
        if (v === 'published' && !r.prices.some((p) => p.active)) {
            setNotice(
                `„${runLabel(r)}“ hat noch keinen Preis — erst dann lässt sie sich veröffentlichen.`,
            );
            return;
        }
        updateRun({ ...r, visibility: v });
        setNotice(null);
        setToast(
            v === 'published'
                ? `„${runLabel(r)}“ steht jetzt auf der Kursseite`
                : `„${runLabel(r)}“ ist wieder ein Entwurf`,
        );
    };

    const run = view.level === 'run' ? runById(view.runId) : undefined;
    const runTab = (t: RunTab) => run && go({ level: 'run', runId: run.id, tab: t });
    const toStudent = (rid: string) => {
        setStudent(rid);
        go({ level: 'course', tab: 'student' });
    };

    let main: ReactNode = null;
    if (view.level === 'course') {
        const pageProps = {
            course,
            runs,
            draft,
            lang,
            onLang: setLang,
            onPublish: () => setPublishing(true),
            onRevert: revert,
            onDiscard: () => {
                draft.discard();
                setToast('Änderungen verworfen');
            },
            onView: go,
        };
        if (view.tab === 'page') main = <CoursePageView {...pageProps} />;
        if (view.tab === 'card') main = <CardView {...pageProps} />;
        if (view.tab === 'student')
            main = (
                <StudentView
                    key={student}
                    runs={runs}
                    draft={draft}
                    initialRun={student}
                    onView={go}
                />
            );
        if (view.tab === 'runs')
            main = (
                <RunsView
                    course={course}
                    runs={runs}
                    onOpen={(rid) => go({ level: 'run', runId: rid, tab: 'overview' })}
                    onNew={(source) => setNewRun({ source })}
                    onVisibility={setVisibility}
                    onCancel={setCancelRun}
                    notice={notice}
                />
            );
        if (view.tab === 'settings')
            main = (
                <CourseSettingsView
                    course={course}
                    runs={runs}
                    draft={draft}
                    onSave={(c) => {
                        setCourse((x) => ({ ...x, ...c }));
                        setToast('Gespeichert');
                    }}
                    onStatus={(v) => {
                        setCourse((x) => ({ ...x, status: v }));
                        setToast(
                            v === 'published'
                                ? 'Der Kurs ist veröffentlicht — die Seite ist online'
                                : 'Der Kurs ist wieder ein Entwurf — die Seite ist offline',
                        );
                    }}
                    onView={go}
                />
            );
    } else if (run) {
        const common = {
            courseTitle: title,
            run,
            onSave: (r: Run) => {
                updateRun(r);
                setToast('Gespeichert');
            },
        };
        const k = `${run.id}:${view.tab}`;
        switch (view.tab) {
            case 'overview':
                main = (
                    <RunOverview
                        key={k}
                        course={course}
                        courseTitle={title}
                        run={run}
                        onTab={runTab}
                        onStudentView={() => toStudent(run.id)}
                    />
                );
                break;
            case 'schedule':
                main = <RunSchedule key={k} {...common} />;
                break;
            case 'prices':
                main = (
                    <RunPrices
                        key={k}
                        courseTitle={title}
                        run={run}
                        onChange={updateRun}
                        onToast={setToast}
                    />
                );
                break;
            case 'access':
                main = <RunAccess key={k} {...common} onToast={setToast} />;
                break;
            case 'team':
                main = <RunTeam key={k} {...common} />;
                break;
            case 'content':
                main = (
                    <RunContent
                        key={k}
                        courseTitle={title}
                        run={run}
                        onStudentView={() => toStudent(run.id)}
                        onToast={setToast}
                    />
                );
                break;
            case 'people':
                main = (
                    <RunPeople key={k} run={run} runs={runs} onToast={setToast} onTab={runTab} />
                );
                break;
            case 'live':
                main = <RunLive key={k} {...common} />;
                break;
            case 'certificate':
                main = <RunCertificate key={k} {...common} />;
                break;
            case 'communication':
                main = <RunCommunication key={k} courseTitle={title} run={run} onTab={runTab} />;
                break;
            case 'settings':
                main = (
                    <RunSettings
                        key={k}
                        course={course}
                        courseTitle={title}
                        run={run}
                        runs={runs}
                        onSave={common.onSave}
                        onVisibility={(v) => setVisibility(run.id, v)}
                        onDuplicate={() => setNewRun({ source: run.id })}
                        onCancel={() => {
                            updateRun({ ...run, delivery: 'cancelled', enrolled: 0 });
                            setToast(`„${runLabel(run)}“ ist abgesagt`);
                        }}
                        onArchive={() => {
                            setRuns((all) => all.filter((x) => x.id !== run.id));
                            go({ level: 'course', tab: 'runs' });
                            setToast(`„${runLabel(run)}“ ist archiviert`);
                        }}
                        onView={go}
                    />
                );
                break;
        }
    }

    const cancelling = cancelRun ? runById(cancelRun) : undefined;
    return (
        <Shell
            menu={
                run ? (
                    <RunMenu courseTitle={title} run={run} runs={runs} view={view} onView={go} />
                ) : (
                    <CourseMenu
                        course={course}
                        title={title}
                        runs={runs}
                        view={view}
                        onView={go}
                        changes={draft.changes.length}
                    />
                )
            }
        >
            {main}
            {publishing && (
                <PublishDialog
                    course={course}
                    runs={runs}
                    draft={draft}
                    onOpenChange={setPublishing}
                    onPublish={(chosen) => {
                        const ids = new Set(chosen.map(changeId));
                        publish(draft.changes.filter((c) => !ids.has(changeId(c))));
                        setToast(
                            chosen.length === 1
                                ? 'Veröffentlicht — Besucher sehen jetzt die neue Fassung'
                                : `${chosen.length} Änderungen veröffentlicht`,
                        );
                    }}
                    onOpenRun={(rid) => {
                        setPublishing(false);
                        go({ level: 'run', runId: rid, tab: 'overview' });
                    }}
                />
            )}
            {newRun && (
                <NewRunDialog
                    runs={runs}
                    source={newRun.source}
                    onOpenChange={(o) => !o && setNewRun(null)}
                    onCreate={(r) => {
                        setRuns((all) => [...all, r]);
                        go({ level: 'run', runId: r.id, tab: 'overview' });
                        setToast(`„${runLabel(r)}“ angelegt — als Entwurf`);
                    }}
                />
            )}
            <ConfirmActionDialog
                open={!!cancelling}
                onOpenChange={(o) => !o && setCancelRun(null)}
                title={`„${cancelling ? runLabel(cancelling) : ''}“ absagen?`}
                description={`${cancelling?.enrolled ?? 0} Teilnehmende bekommen eine Absage-E-Mail und verlieren den Zugang. Die Warteliste schließt. Das lässt sich nicht zurücknehmen.`}
                confirmLabel="Absagen"
                cancelLabel="Nicht absagen"
                onConfirm={() => {
                    if (cancelling) {
                        updateRun({ ...cancelling, delivery: 'cancelled', enrolled: 0 });
                        setToast(`„${runLabel(cancelling)}“ ist abgesagt`);
                    }
                    setCancelRun(null);
                }}
            />
            <Toast message={toast} />
        </Shell>
    );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * The course editor as it could look: the course with its page edited in
 * place, its catalogue card, the student's view, its runs as a grid and its
 * settings — and each run as its own place with dates, prices, seats, team,
 * lessons, participants, live, certificate and communication. Click around —
 * it responds, but saves nothing.
 */
const meta: Meta<typeof CourseEditor> = {
    title: 'Pages/Admin/Kurs-Editor',
    component: CourseEditor,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.kurs-editor')) localStorage.removeItem(k);
    },
};
export default meta;

type Story = StoryObj<typeof CourseEditor>;

const rowsShown = (el: HTMLElement) =>
    waitFor(() => expect(el.querySelectorAll('tr[data-grid-row-id]').length).toBeGreaterThan(0));
const runView = (runId: string, tab: RunTab): View => ({ level: 'run', runId, tab });

/**
 * The real course page, edited where it stands: click any text to change it.
 * Two changes wait unpublished — the short description and the title image —
 * and are marked on the page. Dates, facts and teachers come from the runs.
 */
export const Kursseite: Story = {
    render: () => <CourseEditor />,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Two changes wait, marked on the page', async () => {
            await expect(
                await canvas.findByRole('button', { name: 'Veröffentlichen · 2' }),
            ).toBeEnabled();
            await expect(canvas.getAllByText('Noch nicht live').length).toBeGreaterThan(0);
        });
        await step('Each change can be put back on its own', async () => {
            await expect(
                canvas.getByRole('button', { name: 'Titelbild: Änderung verwerfen' }),
            ).toBeVisible();
            await expect(
                canvas.getByRole('button', { name: 'Kurzbeschreibung: Änderung verwerfen' }),
            ).toBeVisible();
        });
    },
};

/** "Was geht live?": every change with before and after, a tick each, and the runs for context. */
export const KursseiteVeroeffentlichen: Story = {
    render: () => <CourseEditor publishOpen />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('dialog', { name: 'Was geht live?' });
        await waitFor(() =>
            expect(
                within(dialog).getByRole('button', { name: '2 Änderungen veröffentlichen' }),
            ).toBeEnabled(),
        );
        await userEvent.click(within(dialog).getByRole('checkbox', { name: /Titelbild/ }));
        await expect(
            within(dialog).getByRole('button', { name: '1 Änderung veröffentlichen' }),
        ).toBeEnabled();
    },
};

/** The card in the catalogue, between its neighbours: title image, symbol, short description. */
export const Katalogkarte: Story = {
    render: () => <CourseEditor initialView={{ level: 'course', tab: 'card' }} />,
};

/** How a participant sees the course after booking — as seen in the run you pick. */
export const KursTeilnehmerAnsicht: Story = {
    render: () => <CourseEditor initialView={{ level: 'course', tab: 'student' }} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(await canvas.findByRole('radio', { name: 'Herbst 2026 · Berlin' }));
        await expect(canvas.getByText(/so sieht jemand aus „Herbst 2026 · Berlin“/)).toBeVisible();
    },
};

/** Every run of the course as a grid; a row opens the run. */
export const Ausfuehrungen: Story = {
    render: () => <CourseEditor initialView={{ level: 'course', tab: 'runs' }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** A new run — here a copy of "Herbst 2026 · Online": what comes along, what stays behind. */
export const NeueAusfuehrung: Story = {
    render: () => <CourseEditor initialView={{ level: 'course', tab: 'runs' }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
        const canvas = within(canvasElement);
        await userEvent.click(
            canvas.getByRole('button', { name: 'Aktionen für Herbst 2026 · Online' }),
        );
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(await body.findByRole('menuitem', { name: /Kopieren/ }));
        const dialog = await body.findByRole('dialog', { name: 'Neue Ausführung' });
        await expect(within(dialog).getByText('Wird kopiert')).toBeVisible();
        await expect(within(dialog).getByText('Bleibt beim Original')).toBeVisible();
    },
};

/** Course settings: the one visibility switch with its conditions, name, address, filing, SEO. */
export const KursEinstellungen: Story = {
    render: () => <CourseEditor initialView={{ level: 'course', tab: 'settings' }} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            await canvas.findByText('Bedingungen fürs Veröffentlichen — alle erfüllt'),
        ).toBeVisible();
    },
};

/** A brand-new course that cannot go live yet: the switch says which conditions are missing. */
export const KursEinstellungenGesperrt: Story = {
    render: () => (
        <CourseEditor courseKey="tajwid" initialView={{ level: 'course', tab: 'settings' }} />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('Veröffentlichen geht noch nicht:')).toBeVisible();
        await expect(canvas.getByRole('radio', { name: 'Veröffentlicht' })).toBeDisabled();
    },
};

/** A running run at a glance: what needs you, the next dates, readiness, numbers in words. */
export const AusfuehrungUeberblick: Story = {
    render: () => <CourseEditor initialView={runView('herbst-online', 'overview')} />,
};

/** A draft run: the checklist says what is missing before anyone can book. */
export const AusfuehrungUeberblickEntwurf: Story = {
    render: () => <CourseEditor initialView={runView('fruehjahr-online', 'overview')} />,
};

/** Dates, several weekly slots, delivery state, format, and a place created right here. */
export const AusfuehrungTermine: Story = {
    render: () => <CourseEditor initialView={runView('herbst-berlin', 'schedule')} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(await canvas.findByRole('button', { name: /Neuer Ort/ }));
        await userEvent.type(
            canvas.getByRole('textbox', { name: 'Name des Orts' }),
            'Moschee Wedding · Raum 3',
        );
        await userEvent.click(canvas.getByRole('button', { name: 'Ort anlegen und wählen' }));
        await canvas.findByRole('region', { name: 'Ungespeicherte Änderungen' });
    },
};

export const AusfuehrungPreise: Story = {
    render: () => <CourseEditor initialView={runView('herbst-online', 'prices')} />,
};

export const AusfuehrungPlaetze: Story = {
    render: () => <CourseEditor initialView={runView('herbst-berlin', 'access')} />,
};

export const AusfuehrungTeam: Story = {
    render: () => <CourseEditor initialView={runView('herbst-online', 'team')} />,
};

/** This run's own copy of the lessons, with when each is released. */
export const AusfuehrungInhalte: Story = {
    render: () => <CourseEditor initialView={runView('herbst-online', 'content')} />,
};

export const AusfuehrungTeilnehmende: Story = {
    render: () => <CourseEditor initialView={runView('herbst-online', 'people')} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

export const AusfuehrungLive: Story = {
    render: () => <CourseEditor initialView={runView('herbst-online', 'live')} />,
};

export const AusfuehrungZertifikat: Story = {
    render: () => <CourseEditor initialView={runView('herbst-online', 'certificate')} />,
};

export const AusfuehrungKommunikation: Story = {
    render: () => <CourseEditor initialView={runView('herbst-online', 'communication')} />,
};

export const AusfuehrungEinstellungen: Story = {
    render: () => <CourseEditor initialView={runView('herbst-online', 'settings')} />,
};

/** The run of a draft course: publishing it is blocked, and the switch says why. */
export const AusfuehrungVeroeffentlichenGesperrt: Story = {
    render: () => (
        <CourseEditor courseKey="tajwid" initialView={runView('winter-berlin', 'settings')} />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('Der Kurs ist veröffentlicht')).toBeVisible();
        await expect(canvas.getByRole('radio', { name: 'Veröffentlicht' })).toBeDisabled();
    },
};
