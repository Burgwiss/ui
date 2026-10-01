import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
    ArrowLeft,
    BookOpen,
    Check,
    CircleAlert,
    CreditCard,
    EllipsisVertical,
    Eye,
    FileChartColumn,
    Globe,
    HandCoins,
    House,
    Info,
    ListChecks,
    Lock,
    MailWarning,
    Palette,
    Pencil,
    Plus,
    RotateCcw,
    Settings2,
    ShieldCheck,
    Trash2,
    UserMinus,
    UserPlus,
    UserRound,
    UserRoundX,
    Users as UsersIcon,
    Video,
    X,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { useId, useMemo, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
import { IconButton } from '../../atoms/IconButton';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { Switch } from '../../atoms/Switch';
import { Textarea } from '../../atoms/Textarea';
import type { GridColumn } from '../../hooks/grid/types';
import type { GridActionItem, RowId } from '../../hooks/gridActions';
import { useGrid } from '../../hooks/useGrid';
import { cn } from '../../lib/cn';
import { Combobox } from '../../molecules/Combobox';
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
import { SearchField } from '../../molecules/SearchField';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../molecules/Select';
import { AppRail, AppRailItem, AppRailSpacer } from '../../organisms/AppRail';
import { DataGrid } from '../../organisms/DataGrid';
import {
    DATA_GRID_LABELS,
    FILTER_CHIPS_LABELS,
    FILTER_EDITOR_LABELS,
    VIEWS_LABELS,
} from '../../organisms/DataGrid/DataGrid.fixtures';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../../organisms/Sheet';
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
import { GridPage } from '../../templates/GridPage';

/**
 * PAGE PROTOTYPE — the Sponsoren area of the admin (`/admin/sponsors` in
 * Burgwiss): the organisations that pay for students and may read their
 * progress, one sponsor as a panel from the right, the enrolments it may see,
 * its report, and the settings with the on/off switch. Same shell as Kurse,
 * Nutzer, Live and Zahlungen. Non-functional: example content, no server.
 *
 * Grounded in `app/Domain/Sponsors` (ADR-0089, ADR-0092). Anything here with
 * no backend behind it today carries a `MOCK-ONLY` comment.
 */

// ---------------------------------------------------------------------------
// Example data
// ---------------------------------------------------------------------------

type Member = {
    id: number;
    name: string;
    email: string;
    /** Set while the invitation is not yet accepted. */
    invitedAt: string | null;
    lastSeen: string | null;
};

type Grant = {
    id: number;
    enrolmentId: number;
    grantedAt: string;
    /** The admin who granted it. */
    // MOCK-ONLY: `granted_by` is stored but SponsorshipGrantData does not carry the name.
    grantedBy: string;
    revokedAt: string | null;
};

type Sponsor = {
    id: number;
    name: string;
    contactEmail: string | null;
    notes: string;
    seesAll: boolean;
    createdAt: string;
    members: Member[];
    grants: Grant[];
};

type EnrolmentStatus = 'active' | 'completed' | 'dropped';
type Enrolment = {
    id: number;
    student: string;
    course: string;
    run: string;
    lessons: number;
    status: EnrolmentStatus;
    enrolledAt: string;
};

const TODAY = '2026-10-01';
const ADMINS = ['Amina Berger', 'Mosa Khallaf'];

const STUDENTS = [
    'Yusuf Okafor',
    'Leonie Weber',
    'Omar Krüger',
    'Hanna Haddad',
    'Bilal Rahman',
    'Sara Nasser',
    'Jonas Yılmaz',
    'Maryam Schneider',
    'Elif Demir',
    'Tobias Wagner',
    'Aisha Mahmoud',
    'Felix Brandt',
    'Zainab Ali',
    'Lukas Hoffmann',
    'Nour El-Amin',
    'Emma Richter',
    'Ibrahim Kaya',
    'Lea Fischer',
    'Karim Saleh',
    'Mia Becker',
    'Samir Aziz',
    'Clara Wolf',
    'Hamza Rashid',
    'Julia Neumann',
];

const OFFERINGS = [
    { course: 'Deutsch für den Beruf B1', run: 'Herbst 2026 · Online', lessons: 30 },
    { course: 'Arabisch für Anfänger', run: 'Herbst 2026 · Online', lessons: 24 },
    { course: 'Pflege-Fachsprache', run: 'Herbst 2026 · Potsdam', lessons: 20 },
    { course: 'Tajwid Grundlagen', run: 'Herbst 2026 · Berlin', lessons: 16 },
    { course: 'Fiqh des Alltags', run: 'Frühjahr 2026 · Online', lessons: 12 },
    { course: 'Hifz-Kreis: Juz ʿAmma', run: 'Laufend', lessons: 40 },
];
const COURSES = [...new Set(OFFERINGS.map((o) => o.course))];

/** Every student in one or two offerings; the spring run is over. */
const ENROLMENTS: Enrolment[] = STUDENTS.flatMap((student, i) => {
    const picks = [...new Set([i % 6, (i * 5 + 2) % 6])];
    return picks.map((o, k) => {
        const off = OFFERINGS[o]!;
        return {
            id: i * 2 + k + 1,
            student,
            course: off.course,
            run: off.run,
            lessons: off.lessons,
            status: (off.run.startsWith('Frühjahr')
                ? 'completed'
                : i === 9 && k === 1
                  ? 'dropped'
                  : 'active') as EnrolmentStatus,
            enrolledAt: off.run.startsWith('Frühjahr') ? '2026-02-12' : '2026-09-02',
        };
    });
});
const enrolment = (id: number) => ENROLMENTS.find((e) => e.id === id)!;

let grantSeq = 1;
function grants(ids: number[], revoked: number[] = [], grantedAt = '2026-09-03'): Grant[] {
    return [
        ...ids.map((enrolmentId, i) => ({
            id: grantSeq++,
            enrolmentId,
            grantedAt,
            grantedBy: ADMINS[i % 2]!,
            revokedAt: null,
        })),
        ...revoked.map((enrolmentId) => ({
            id: grantSeq++,
            enrolmentId,
            grantedAt: '2026-07-15',
            grantedBy: ADMINS[0]!,
            revokedAt: '2026-09-01',
        })),
    ];
}
const pick = (from: number, count: number) => ENROLMENTS.slice(from, from + count).map((e) => e.id);

const SPONSORS: Sponsor[] = [
    {
        id: 1,
        name: 'Stiftung Bildungsbrücke',
        contactEmail: 'kontakt@bildungsbruecke.example',
        notes: 'Zahlt quartalsweise auf Rechnung. Ansprechpartnerin wechselt zum 01.11. — Herr Seidel übernimmt.',
        seesAll: false,
        createdAt: '2026-07-14',
        members: [
            {
                id: 1,
                name: 'Dr. Katrin Vogel',
                email: 'k.vogel@bildungsbruecke.example',
                invitedAt: null,
                lastSeen: '2026-09-29',
            },
            {
                id: 2,
                name: 'Martin Seidel',
                email: 'm.seidel@bildungsbruecke.example',
                invitedAt: null,
                lastSeen: '2026-09-12',
            },
        ],
        grants: grants(pick(0, 14), pick(14, 2)),
    },
    {
        id: 2,
        name: 'Müller Logistik GmbH',
        contactEmail: 'personal@mueller-logistik.example',
        notes: '',
        seesAll: false,
        createdAt: '2026-08-03',
        members: [
            {
                id: 3,
                name: 'Sabine Krause',
                email: 's.krause@mueller-logistik.example',
                invitedAt: '2026-09-27',
                lastSeen: null,
            },
        ],
        grants: grants(pick(16, 6), [], '2026-08-05'),
    },
    {
        id: 3,
        name: 'Jobcenter Berlin-Mitte',
        contactEmail: 'bildung@jobcenter-mitte.example',
        notes: 'Bildungsgutscheine. Fragt die Anwesenheit monatlich ab — der Bericht reicht ihnen.',
        seesAll: false,
        createdAt: '2026-07-21',
        members: [
            {
                id: 4,
                name: 'Thomas Brenner',
                email: 't.brenner@jobcenter-mitte.example',
                invitedAt: null,
                lastSeen: '2026-09-30',
            },
            {
                id: 5,
                name: 'Aylin Öztürk',
                email: 'a.oeztuerk@jobcenter-mitte.example',
                invitedAt: '2026-09-25',
                lastSeen: null,
            },
        ],
        grants: grants(pick(22, 18), pick(40, 3)),
    },
    {
        id: 4,
        name: 'Familie Haddad',
        contactEmail: 'r.haddad@mail.example',
        notes: '',
        seesAll: false,
        createdAt: '2026-09-01',
        members: [
            {
                id: 6,
                name: 'Rami Haddad',
                email: 'r.haddad@mail.example',
                invitedAt: null,
                lastSeen: '2026-09-28',
            },
        ],
        grants: grants(
            ENROLMENTS.filter((e) => e.student === 'Hanna Haddad').map((e) => e.id),
            [],
            '2026-09-02',
        ),
    },
    {
        id: 5,
        name: 'Al-Nur Förderverein e.V.',
        contactEmail: 'vorstand@alnur-verein.example',
        notes: 'Trägt die ganze Schule mit — Zugriff auf alles, so im Vorstand beschlossen (Protokoll vom 28.06.).',
        seesAll: true,
        createdAt: '2026-06-30',
        members: [
            {
                id: 7,
                name: 'Yasin Çelik',
                email: 'y.celik@alnur-verein.example',
                invitedAt: null,
                lastSeen: '2026-09-30',
            },
        ],
        grants: grants(pick(4, 3), [], '2026-07-01'),
    },
    {
        id: 6,
        name: 'Kaufmann & Söhne Bau',
        contactEmail: null,
        notes: 'Telefonisch zugesagt, Kontaktperson kommt noch.',
        seesAll: false,
        createdAt: '2026-09-18',
        members: [],
        grants: grants(pick(30, 4), [], '2026-09-19'),
    },
    {
        id: 7,
        name: 'Agentur für Arbeit Potsdam',
        contactEmail: 'weiterbildung@aa-potsdam.example',
        notes: '',
        seesAll: false,
        createdAt: '2026-09-29',
        members: [
            {
                id: 8,
                name: 'Jana Lehmann',
                email: 'j.lehmann@aa-potsdam.example',
                invitedAt: '2026-09-29',
                lastSeen: null,
            },
        ],
        grants: [],
    },
    {
        id: 8,
        name: 'Hanse Pflegedienste GmbH',
        contactEmail: 'ausbildung@hanse-pflege.example',
        notes: '',
        seesAll: false,
        createdAt: '2026-07-02',
        members: [
            {
                id: 9,
                name: 'Petra Schulz',
                email: 'p.schulz@hanse-pflege.example',
                invitedAt: null,
                lastSeen: '2026-09-22',
            },
            {
                id: 10,
                name: 'Ole Jansen',
                email: 'o.jansen@hanse-pflege.example',
                invitedAt: null,
                lastSeen: '2026-08-30',
            },
        ],
        grants: grants(
            ENROLMENTS.filter((e) => e.course === 'Pflege-Fachsprache').map((e) => e.id),
            pick(8, 1),
            '2026-09-04',
        ),
    },
    {
        id: 9,
        name: 'Familie Okafor',
        contactEmail: null,
        notes: '',
        seesAll: false,
        createdAt: '2026-09-20',
        members: [
            {
                id: 11,
                name: 'Grace Okafor',
                email: 'grace.okafor@mail.example',
                invitedAt: null,
                lastSeen: null,
            },
        ],
        grants: grants([1], [], '2026-09-20'),
    },
];

/** Sponsor-role accounts not yet a contact anywhere — for "add an existing account". */
const FREE_SPONSOR_ACCOUNTS = [
    'Heike Brandt · h.brandt@stadtwerke.example',
    'Markus Roth · m.roth@roth-it.example',
    'Selin Arslan · s.arslan@bildungswerk.example',
];

const dateFmt = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
const shortFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });
const fmt = (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00`));
const fmtShort = (iso: string) => shortFmt.format(new Date(`${iso}T12:00:00`));
const hours = (seconds: number) =>
    `${(seconds / 3600).toLocaleString('de-DE', { maximumFractionDigits: 1 })} Std.`;

const active = (s: Sponsor) => s.grants.filter((g) => !g.revokedAt);
const pending = (s: Sponsor) => s.members.filter((m) => m.invitedAt);

const OPTIONS_LABELS = {
    trigger: 'Tabellenoptionen',
    columns: 'Spalten',
    density: 'Zeilenhöhe',
    comfortable: 'Bequem',
    compact: 'Kompakt',
    selection: 'Zeilen auswählen',
    reset: 'Zurücksetzen',
};

// ---------------------------------------------------------------------------
// The report: exactly what a sponsor sees, one row per enrolment
// ---------------------------------------------------------------------------

type ReportRow = {
    enrolmentId: number;
    student: string;
    course: string;
    run: string;
    status: EnrolmentStatus;
    lessonsDone: number;
    lessonsTotal: number;
    progress: number;
    quizzesPassed: number;
    quizzesTotal: number;
    quizAvg: number | null;
    attendanceSeconds: number;
    sessions: number;
    certificate: boolean;
    lastActivity: string | null;
};

/** Stable pseudo-random numbers from an id, so the example report never jumps. */
const noise = (id: number, salt: number) => ((id * 9301 + salt * 49297) % 233280) / 233280;

function reportRow(e: Enrolment): ReportRow {
    const done =
        e.status === 'completed'
            ? e.lessons
            : Math.round(e.lessons * (e.status === 'dropped' ? 0.15 : 0.08 + noise(e.id, 1) * 0.6));
    const quizzesTotal = Math.ceil(e.lessons / 6);
    const reached = Math.floor((done / e.lessons) * quizzesTotal);
    const passed = Math.max(0, reached - (noise(e.id, 2) > 0.75 ? 1 : 0));
    const sessions = Math.round(done / 3);
    const lastDay = Math.floor(noise(e.id, 3) * 20);
    return {
        enrolmentId: e.id,
        student: e.student,
        course: e.course,
        run: e.run,
        status: e.status,
        lessonsDone: done,
        lessonsTotal: e.lessons,
        progress: Math.round((done / e.lessons) * 100),
        quizzesPassed: passed,
        quizzesTotal,
        quizAvg: reached > 0 ? Math.round(58 + noise(e.id, 4) * 40) : null,
        attendanceSeconds: sessions * (4200 + Math.round(noise(e.id, 5) * 1200)),
        sessions,
        certificate: e.status === 'completed',
        lastActivity:
            done === 0
                ? null
                : e.status === 'completed'
                  ? '2026-05-30'
                  : `2026-09-${String(30 - lastDay).padStart(2, '0')}`,
    };
}

/** Whole-school sponsors see every enrolment; everyone else only their active grants. */
function reportFor(s: Sponsor): ReportRow[] {
    const enrolments = s.seesAll ? ENROLMENTS : active(s).map((g) => enrolment(g.enrolmentId));
    return enrolments.map(reportRow);
}

const ENROLMENT_STATUS: Record<
    EnrolmentStatus,
    { label: string; tone: 'success' | 'neutral' | 'muted' }
> = {
    active: { label: 'Aktiv', tone: 'success' },
    completed: { label: 'Abgeschlossen', tone: 'neutral' },
    dropped: { label: 'Abgebrochen', tone: 'muted' },
};

function ProgressCell({ row }: { row: ReportRow }) {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
                <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={row.progress}
                    aria-label={`Fortschritt ${row.student}`}
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                >
                    <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${row.progress}%` }}
                    />
                </div>
                <span className="w-9 text-end text-xs tabular-nums">{row.progress} %</span>
            </div>
            <span className="text-xs text-muted-foreground">
                {row.lessonsDone} von {row.lessonsTotal} Lektionen
            </span>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Shell and menu
// ---------------------------------------------------------------------------

type Scope = 'all' | 'seesAll' | 'selected' | 'noContact' | 'pending';
type View =
    { kind: 'list'; scope: Scope } | { kind: 'report'; sponsorId: number } | { kind: 'settings' };

function inScope(s: Sponsor, scope: Scope) {
    return scope === 'all'
        ? true
        : scope === 'seesAll'
          ? s.seesAll
          : scope === 'selected'
            ? !s.seesAll
            : scope === 'noContact'
              ? s.members.length === 0
              : pending(s).length > 0;
}

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
                    <AppRailItem icon={House} label="Start" href="#start" />
                    <AppRailItem
                        icon={BookOpen}
                        label="Kurse"
                        onClick={linkTo('Pages/Kursverwaltung', 'Kursliste')}
                    />
                    <AppRailItem
                        icon={UsersIcon}
                        label="Nutzer"
                        onClick={linkTo('Pages/Nutzerverwaltung', 'Nutzerliste')}
                    />
                    <AppRailItem
                        icon={Video}
                        label="Live"
                        onClick={linkTo('Pages/Live', 'Sitzungen')}
                    />
                    <AppRailItem
                        icon={CreditCard}
                        label="Zahlungen"
                        onClick={linkTo('Pages/Zahlungen', 'Bestellungen')}
                    />
                    {/* MOCK-ONLY: today the Sponsoren nav entry is hidden while the feature is off; here it stays so the switch is always one click away. */}
                    <AppRailItem icon={HandCoins} label="Sponsoren" active />
                    <AppRailItem icon={Palette} label="Design" onClick={() => {}} />
                    <AppRailSpacer />
                    <AppRailItem icon={Settings2} label="Betrieb" onClick={() => {}} />
                    <AppRailItem icon={UserRound} label="Konto" onClick={() => {}} />
                </AppRail>
            }
            sidebar={menu}
        >
            {children}
        </AdminLayout>
    );
}

function SponsorsMenu({
    view,
    onView,
    sponsors,
    enabled,
}: {
    view: View;
    onView: (v: View) => void;
    sponsors: Sponsor[];
    enabled: boolean;
}) {
    const same = (v: View) =>
        JSON.stringify(v) === JSON.stringify(view) ||
        // The report belongs to the list it was opened from.
        (view.kind === 'report' && v.kind === 'list' && v.scope === 'all');
    const n = (scope: Scope) => sponsors.filter((s) => inScope(s, scope)).length;
    const item = (v: View, Icon: LucideIcon, label: string, count?: number, attention = false) => (
        <SidebarMenuItem key={JSON.stringify(v)}>
            <SidebarMenuButton active={same(v)} onClick={() => onView(v)}>
                <Icon aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {count !== undefined &&
                    (attention && count > 0 ? (
                        <Badge tone="warning">{count}</Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
                    ))}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
    return (
        <Sidebar
            label="Sponsoren"
            resize={{
                label: 'Menü verbreitern oder verschmälern',
                storageKey: 'storybook.page.sponsors',
            }}
        >
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 text-lg font-semibold tracking-tight">
                    Sponsoren
                    {!enabled && <Badge tone="muted">Aus</Badge>}
                </div>
            </SidebarHeader>
            <SidebarContent>
                {enabled && (
                    <>
                        {/* MOCK-ONLY: the list has no filters today, only a search; the counts come from data the index already loads. */}
                        <SidebarGroup>
                            <SidebarMenu>
                                {item(
                                    { kind: 'list', scope: 'all' },
                                    HandCoins,
                                    'Alle Sponsoren',
                                    sponsors.length,
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup label="Braucht dich">
                            <SidebarMenu>
                                {item(
                                    { kind: 'list', scope: 'noContact' },
                                    UserRoundX,
                                    'Ohne Kontaktperson',
                                    n('noContact'),
                                    true,
                                )}
                                {item(
                                    { kind: 'list', scope: 'pending' },
                                    MailWarning,
                                    'Einladung offen',
                                    n('pending'),
                                    true,
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup label="Sichtbarkeit">
                            <SidebarMenu>
                                {item(
                                    { kind: 'list', scope: 'selected' },
                                    ListChecks,
                                    'Ausgewählte Einschreibungen',
                                    n('selected'),
                                )}
                                {item(
                                    { kind: 'list', scope: 'seesAll' },
                                    Globe,
                                    'Sieht alles',
                                    n('seesAll'),
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                    </>
                )}
                <SidebarGroup>
                    <SidebarMenu>
                        {item({ kind: 'settings' }, Settings2, 'Einstellungen')}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

function ScopeBadge({ seesAll }: { seesAll: boolean }) {
    return seesAll ? (
        <Badge tone="warning" dot>
            Alle Einschreibungen
        </Badge>
    ) : (
        <Badge tone="neutral" dot>
            Ausgewählte Einschreibungen
        </Badge>
    );
}

// ---------------------------------------------------------------------------
// The list
// ---------------------------------------------------------------------------

function SponsorsListView({
    sponsors,
    scope,
    onOpen,
    onGrant,
    onReport,
    onCreate,
    onEdit,
    onDelete,
    notice,
}: {
    sponsors: Sponsor[];
    scope: Scope;
    onOpen: (id: number) => void;
    onGrant: (id: number) => void;
    onReport: (id: number) => void;
    onCreate: () => void;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    notice: string | null;
}) {
    const [search, setSearch] = useState('');
    const shown = sponsors
        .filter((s) => inScope(s, scope))
        .filter((s) =>
            `${s.name} ${s.contactEmail ?? ''}`.toLowerCase().includes(search.toLowerCase()),
        );

    const columns: GridColumn<Sponsor>[] = useMemo(
        () => [
            {
                id: 'name',
                header: 'Sponsor',
                pinned: 'left',
                hideable: false,
                width: 235,
                filter: { type: 'text' },
                cell: (s) => (
                    <a
                        href={`#/admin/sponsors/${s.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(s.id);
                        }}
                        className="flex min-w-0 items-center gap-3 underline-offset-4 hover:underline"
                    >
                        <InitialsAvatar name={s.name} size="sm" colored />
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate font-medium text-foreground">{s.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                                {s.contactEmail ?? 'Keine Kontakt-E-Mail'}
                            </span>
                        </span>
                    </a>
                ),
            },
            {
                id: 'members',
                header: 'Kontaktpersonen',
                width: 200,
                value: (s) => s.members.length,
                cell: (s) =>
                    s.members.length === 0 ? (
                        <Badge tone="warning" dot>
                            Keine Kontaktperson
                        </Badge>
                    ) : (
                        <span className="flex items-center gap-2">
                            <span className="tabular-nums">{s.members.length}</span>
                            {pending(s).length > 0 && (
                                <Badge tone="faint">
                                    {pending(s).length === 1
                                        ? 'Einladung offen'
                                        : `${pending(s).length} Einladungen offen`}
                                </Badge>
                            )}
                        </span>
                    ),
                exportValue: (s) => String(s.members.length),
            },
            {
                id: 'grants',
                header: 'Freigaben',
                align: 'right',
                width: 145,
                value: (s) => active(s).length,
                cell: (s) =>
                    s.seesAll ? (
                        <span className="text-muted-foreground">alle</span>
                    ) : (
                        <span className="tabular-nums">{active(s).length}</span>
                    ),
            },
            {
                id: 'scope',
                header: 'Sichtbarkeit',
                width: 225,
                groupable: true,
                value: (s) => (s.seesAll ? 'Alle Einschreibungen' : 'Ausgewählte Einschreibungen'),
                cell: (s) => <ScopeBadge seesAll={s.seesAll} />,
                filter: {
                    type: 'choice',
                    options: [
                        {
                            value: 'Ausgewählte Einschreibungen',
                            label: 'Ausgewählte Einschreibungen',
                        },
                        { value: 'Alle Einschreibungen', label: 'Alle Einschreibungen' },
                    ],
                },
            },
            {
                id: 'createdAt',
                header: 'Angelegt',
                width: 135,
                cell: (s) => fmt(s.createdAt),
                filter: { type: 'date' },
            },
            {
                id: 'actions',
                header: 'Aktionen',
                hideable: false,
                sortable: false,
                width: 130,
                cell: (s) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <IconButton
                                label={`Aktionen für ${s.name}`}
                                icon={<EllipsisVertical aria-hidden="true" />}
                                className="size-8"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onOpen(s.id)}>
                                <Eye aria-hidden="true" /> Öffnen
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onReport(s.id)}>
                                <FileChartColumn aria-hidden="true" /> Bericht ansehen
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={s.seesAll} onSelect={() => onGrant(s.id)}>
                                <ListChecks aria-hidden="true" /> Einschreibungen freigeben …
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onEdit(s.id)}>
                                <Pencil aria-hidden="true" /> Bearbeiten …
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive-tint-foreground"
                                onSelect={() => onDelete(s.id)}
                            >
                                <Trash2 aria-hidden="true" /> Löschen …
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [onOpen, onGrant, onReport, onEdit, onDelete],
    );

    const first = (ids: RowId[]) => Number(ids[0]);
    const actions: GridActionItem[] = [
        {
            id: 'new',
            label: 'Neuer Sponsor',
            icon: <Plus aria-hidden="true" />,
            tone: 'primary',
            shortcut: 'N',
            onSelect: onCreate,
        },
        {
            id: 'open',
            label: 'Öffnen',
            icon: <Eye aria-hidden="true" />,
            when: ['one'],
            group: 'open',
            isDefault: true,
            shortcut: 'E',
            onSelect: (ids) => onOpen(first(ids)),
        },
        {
            id: 'report',
            label: 'Bericht ansehen',
            icon: <FileChartColumn aria-hidden="true" />,
            when: ['one'],
            group: 'open',
            onSelect: (ids) => onReport(first(ids)),
        },
        {
            id: 'delete',
            label: 'Löschen …',
            icon: <Trash2 aria-hidden="true" />,
            when: ['one'],
            group: 'danger',
            tone: 'destructive',
            shortcut: 'Delete',
            onSelect: (ids) => onDelete(first(ids)),
        },
    ];
    const grid = useGrid<Sponsor>({
        id: 'storybook.page.sponsors.list',
        rows: shown,
        getRowId: (s) => s.id,
        columns,
        selection: 'single',
        actions,
    });

    return (
        <GridPage
            title="Sponsoren"
            offsetTop="0px"
            grid={grid}
            search={{
                value: search,
                onChange: setSearch,
                placeholder: 'Name oder Kontakt-E-Mail …',
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
                        <CircleAlert className="size-3.5" aria-hidden="true" />
                        {notice}
                    </span>
                ) : (
                    <span className="text-muted-foreground">
                        Ein Sponsor sieht nur die Einschreibungen, die du freigibst — und die
                        Lernenden erfahren es jedes Mal.
                    </span>
                )
            }
            footer={
                <GridFooter
                    summary={`${shown.length} Sponsoren`}
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
                    table: 'Sponsoren',
                    empty: 'Kein Sponsor passt dazu.',
                }}
                rowLabel={(s) => s.name}
                renderFilter={(col, close) => (
                    <GridFilterEditor
                        key={col.id}
                        columnId={col.id}
                        header={col.header}
                        def={col.filter!}
                        value={grid.filters.find((f) => f.id === col.id)}
                        onApply={(f) => {
                            if (f) grid.setFilter(f);
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
// One sponsor, as a panel from the right
// ---------------------------------------------------------------------------

function Part({
    title,
    text,
    action,
    children,
}: {
    title: string;
    text?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3 border-t border-border py-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-semibold">{title}</h3>
                    {text && <p className="text-sm text-muted-foreground">{text}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

/** The grants of one sponsor as a small grid: who, which course, since when, still active. */
function GrantsGrid({
    sponsor,
    onRevoke,
    onRegrant,
}: {
    sponsor: Sponsor;
    onRevoke: (g: Grant) => void;
    onRegrant: (g: Grant) => void;
}) {
    const rows = useMemo(
        () =>
            [...sponsor.grants].sort(
                (a, b) =>
                    Number(!!a.revokedAt) - Number(!!b.revokedAt) ||
                    enrolment(a.enrolmentId).student.localeCompare(
                        enrolment(b.enrolmentId).student,
                    ),
            ),
        [sponsor.grants],
    );
    const columns: GridColumn<Grant>[] = useMemo(
        () => [
            {
                id: 'student',
                header: 'Lernende:r',
                pinned: 'left',
                hideable: false,
                width: 210,
                value: (g) => enrolment(g.enrolmentId).student,
                cell: (g) => (
                    <span className="flex items-center gap-2">
                        <InitialsAvatar name={enrolment(g.enrolmentId).student} size="sm" colored />
                        <span className="truncate">{enrolment(g.enrolmentId).student}</span>
                    </span>
                ),
            },
            {
                id: 'course',
                header: 'Kurs',
                width: 260,
                groupable: true,
                value: (g) => enrolment(g.enrolmentId).course,
                cell: (g) => (
                    <span className="flex min-w-0 flex-col">
                        <span className="truncate">{enrolment(g.enrolmentId).course}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {enrolment(g.enrolmentId).run}
                        </span>
                    </span>
                ),
            },
            {
                id: 'state',
                header: 'Freigabe',
                width: 250,
                value: (g) => (g.revokedAt ? 1 : 0),
                cell: (g) =>
                    g.revokedAt ? (
                        <span className="flex flex-col gap-0.5">
                            <Badge tone="faint" className="w-fit">
                                Widerrufen
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                sichtbar {fmtShort(g.grantedAt)}–{fmt(g.revokedAt)}
                            </span>
                        </span>
                    ) : (
                        <span className="flex flex-col gap-0.5">
                            <Badge tone="success" dot className="w-fit">
                                Aktiv
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                seit {fmt(g.grantedAt)} · {g.grantedBy}
                            </span>
                        </span>
                    ),
            },
            {
                id: 'actions',
                header: 'Aktionen',
                pinned: 'right',
                hideable: false,
                sortable: false,
                width: 120,
                cell: (g) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <IconButton
                                label={`Aktionen für ${enrolment(g.enrolmentId).student}`}
                                icon={<EllipsisVertical aria-hidden="true" />}
                                className="size-8"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {g.revokedAt ? (
                                <DropdownMenuItem onSelect={() => onRegrant(g)}>
                                    <RotateCcw aria-hidden="true" /> Wieder freigeben
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    className="text-destructive-tint-foreground"
                                    onSelect={() => onRevoke(g)}
                                >
                                    <XCircle aria-hidden="true" /> Widerrufen …
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [onRevoke, onRegrant],
    );
    const grid = useGrid<Grant>({
        id: `storybook.page.sponsors.grants`,
        rows,
        getRowId: (g) => g.id,
        columns,
        selection: 'none',
    });
    return (
        <div
            data-density="compact"
            className={cn(
                'max-h-96 overflow-auto rounded-lg border border-border',
                '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-muted',
                'data-[density=compact]:[&_td]:py-1.5 [&_td:first-child]:pl-4 data-[density=compact]:[&_th]:h-8 [&_th:first-child]:pl-4',
                '[&_[data-slot=table-container]]:overflow-visible',
            )}
        >
            <DataGrid
                grid={grid}
                labels={{
                    ...DATA_GRID_LABELS,
                    table: 'Geförderte Einschreibungen',
                    empty: 'Noch keine Einschreibung freigegeben.',
                }}
                rowLabel={(g) => enrolment(g.enrolmentId).student}
            />
        </div>
    );
}

type SheetConfirm =
    | null
    | { kind: 'removeMember'; member: Member }
    | { kind: 'revoke'; grant: Grant }
    | { kind: 'seesAll' };

/**
 * One sponsor in a wide panel: who it is, who can sign in for it, which
 * enrolments it may see, whether it sees the whole school, a glance at its
 * report, and the admin's private notes.
 */
function SponsorPanel({
    sponsor,
    onClose,
    onChange,
    onEdit,
    onDelete,
    onReport,
    grantOnOpen = false,
}: {
    sponsor: Sponsor;
    onClose: () => void;
    onChange: (s: Sponsor) => void;
    onEdit: () => void;
    onDelete: () => void;
    onReport: () => void;
    grantOnOpen?: boolean;
}) {
    const id = useId();
    const s = sponsor;
    const [note, setNote] = useState<string | null>(null);
    const [notes, setNotes] = useState(s.notes);
    const [confirm, setConfirm] = useState<SheetConfirm>(null);
    const [adding, setAdding] = useState(false);
    const [granting, setGranting] = useState(grantOnOpen);
    const report = reportFor(s);
    const first = (name: string) => name.split(' ')[0];

    const regrant = (g: Grant) => {
        onChange({
            ...s,
            grants: s.grants.map((x) =>
                x.id === g.id
                    ? { ...x, revokedAt: null, grantedAt: TODAY, grantedBy: ADMINS[0]! }
                    : x,
            ),
        });
        setNote(`Wieder freigegeben — ${enrolment(g.enrolmentId).student} bekommt eine Nachricht.`);
    };

    return (
        <Sheet open onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(56rem,92vw)] max-w-none gap-0 p-0"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement)
                        .querySelector<HTMLElement>('[data-sheet-title]')
                        ?.focus();
                }}
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <InitialsAvatar name={s.name} size="lg" colored />
                        <div className="min-w-0 flex-1">
                            <SheetTitle
                                data-sheet-title
                                tabIndex={-1}
                                className="text-2xl tracking-tight outline-none"
                            >
                                {s.name}
                            </SheetTitle>
                            <SheetDescription>
                                {s.contactEmail ?? 'Keine Kontakt-E-Mail hinterlegt'}
                            </SheetDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <ScopeBadge seesAll={s.seesAll} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={onReport}>
                                <FileChartColumn aria-hidden="true" /> Bericht ansehen
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <IconButton
                                        label="Weitere Aktionen"
                                        icon={<EllipsisVertical aria-hidden="true" />}
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={onEdit}>
                                        <Pencil aria-hidden="true" /> Bearbeiten …
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive-tint-foreground"
                                        onSelect={onDelete}
                                    >
                                        <Trash2 aria-hidden="true" /> Löschen …
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        {[
                            ['Kontaktpersonen', String(s.members.length)],
                            [
                                'Sieht',
                                s.seesAll
                                    ? `alle ${ENROLMENTS.length} Einschreibungen`
                                    : `${active(s).length} Einschreibungen`,
                            ],
                            ['Angelegt', fmt(s.createdAt)],
                        ].map(([label, value]) => (
                            <div key={label} className="flex gap-1.5">
                                <dt className="text-muted-foreground">{label}</dt>
                                <dd className="font-medium">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    {s.members.length === 0 && (
                        <div
                            role="status"
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-tint-foreground"
                        >
                            <span>
                                Noch keine Kontaktperson — niemand kann sich für {s.name} anmelden
                                und den Bericht sehen.
                            </span>
                            <Button size="sm" onClick={() => setAdding(true)}>
                                <UserPlus aria-hidden="true" /> Kontakt hinzufügen
                            </Button>
                        </div>
                    )}
                    {s.seesAll && (
                        <div
                            role="status"
                            className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-tint-foreground"
                        >
                            <Globe className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            <span>
                                <strong className="font-medium">Sieht die ganze Schule.</strong> Der
                                Bericht umfasst jede Einschreibung — einzelne Freigaben werden
                                ignoriert, solange das an ist.
                            </span>
                        </div>
                    )}
                    {note && (
                        <p role="status" className="text-sm text-muted-foreground">
                            {note}
                        </p>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <Part
                        title={`Kontaktpersonen (${s.members.length})`}
                        text="Sie melden sich mit eigenem Konto an und sehen nur den Bericht — keine Kursinhalte, keine Verwaltung."
                        action={
                            <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
                                <UserPlus aria-hidden="true" /> Kontakt hinzufügen
                            </Button>
                        }
                    >
                        {s.members.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Lade jemanden per E-Mail ein oder wähle ein bestehendes
                                Sponsorenkonto.
                            </p>
                        ) : (
                            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                                {s.members.map((m) => (
                                    <li key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                                        <InitialsAvatar name={m.name} size="sm" colored />
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-sm font-medium">
                                                {m.name}
                                            </div>
                                            <div className="truncate text-xs text-muted-foreground">
                                                {m.email}
                                            </div>
                                        </div>
                                        {m.invitedAt ? (
                                            <Badge tone="warning" dot>
                                                Einladung offen seit {fmtShort(m.invitedAt)}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                {m.lastSeen
                                                    ? `Zuletzt aktiv ${fmt(m.lastSeen)}`
                                                    : 'Noch nie angemeldet'}
                                            </span>
                                        )}
                                        <IconButton
                                            label={`Kontakt ${m.name} entfernen`}
                                            icon={<UserMinus aria-hidden="true" />}
                                            onClick={() =>
                                                setConfirm({ kind: 'removeMember', member: m })
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Part>

                    <Part
                        title={`Geförderte Einschreibungen (${active(s).length} aktiv)`}
                        text={
                            s.seesAll
                                ? 'Werden gerade ignoriert: der Sponsor sieht ohnehin alles. Sie gelten wieder, sobald „Sieht alle Einschreibungen“ aus ist.'
                                : 'Jede Freigabe gilt für eine Einschreibung — einen Kurs eines Menschen, nie seine anderen Kurse. Widerrufene bleiben stehen, damit die Lernenden sehen, wer wann mitlesen konnte.'
                        }
                        action={
                            <Button size="sm" variant="outline" onClick={() => setGranting(true)}>
                                <ListChecks aria-hidden="true" /> Einschreibungen freigeben …
                            </Button>
                        }
                    >
                        {s.grants.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Noch nichts freigegeben — der Bericht von {s.name} ist leer.
                            </p>
                        ) : (
                            <GrantsGrid
                                sponsor={s}
                                onRevoke={(g) => setConfirm({ kind: 'revoke', grant: g })}
                                onRegrant={regrant}
                            />
                        )}
                    </Part>

                    <Part title="Sichtbarkeit">
                        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <Label htmlFor={`${id}-all`} className="text-sm font-medium">
                                        Sieht alle Einschreibungen
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Für einen Förderer, der die ganze Schule trägt.
                                    </p>
                                </div>
                                <Switch
                                    id={`${id}-all`}
                                    checked={s.seesAll}
                                    onCheckedChange={(on) => {
                                        // Widening needs a yes; narrowing is always safe.
                                        if (on) setConfirm({ kind: 'seesAll' });
                                        else {
                                            onChange({ ...s, seesAll: false });
                                            setNote(
                                                'Sieht wieder nur die freigegebenen Einschreibungen.',
                                            );
                                        }
                                    }}
                                />
                            </div>
                            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                                {[
                                    'Der Bericht umfasst dann jede Einschreibung der Schule — vergangene, laufende und künftige.',
                                    'Einzelne Freigaben sind wirkungslos, solange das an ist; sie bleiben aber gespeichert.',
                                    'Lernende sehen den Sponsor auf ihrer Seite „Wer kann meinen Fortschritt sehen?“ unter „Schulweite Sponsoren“.',
                                    'Jedes Ein- und Ausschalten steht im Protokoll.',
                                ].map((t) => (
                                    <li key={t} className="flex gap-2">
                                        <Info
                                            className="mt-0.5 size-4 shrink-0"
                                            aria-hidden="true"
                                        />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Part>

                    <Part
                        title="So sieht es der Sponsor"
                        text="Genau das, was die Kontaktpersonen auf ihrer Berichtsseite sehen — nicht mehr."
                        action={
                            <Button size="sm" variant="outline" onClick={onReport}>
                                <FileChartColumn aria-hidden="true" /> Ganzen Bericht ansehen
                            </Button>
                        }
                    >
                        {report.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Für diesen Sponsor gibt es derzeit nichts anzuzeigen.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-muted/40">
                                    {report.slice(0, 4).map((r) => (
                                        <li
                                            key={r.enrolmentId}
                                            className="grid grid-cols-3 items-center gap-4 px-3 py-2.5 text-sm"
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate font-medium">
                                                    {r.student}
                                                </span>
                                                <span className="block truncate text-xs text-muted-foreground">
                                                    {r.course}
                                                </span>
                                            </span>
                                            <ProgressCell row={r} />
                                            <span className="text-end text-xs text-muted-foreground">
                                                {r.lastActivity
                                                    ? `aktiv ${fmtShort(r.lastActivity)}`
                                                    : 'noch nicht aktiv'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                {report.length > 4 && (
                                    <p className="text-sm text-muted-foreground">
                                        und {report.length - 4} weitere Zeilen
                                    </p>
                                )}
                            </div>
                        )}
                    </Part>

                    <Part
                        title="Notizen"
                        text={
                            <span className="flex items-center gap-1.5">
                                <Lock className="size-3.5" aria-hidden="true" />
                                Nur für Admins — der Sponsor sieht sie nie, auch nicht im Quelltext
                                seiner Seite.
                            </span>
                        }
                        action={
                            <Button
                                size="sm"
                                disabled={notes === s.notes}
                                onClick={() => {
                                    onChange({ ...s, notes });
                                    setNote('Notizen gespeichert');
                                }}
                            >
                                Speichern
                            </Button>
                        }
                    >
                        <Label htmlFor={`${id}-notes`} className="sr-only">
                            Notizen
                        </Label>
                        <Textarea
                            id={`${id}-notes`}
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="z. B. Zahlungsweise, Absprachen, wer Ansprechperson ist"
                        />
                    </Part>
                </div>

                <AddMemberDialog
                    open={adding}
                    onOpenChange={setAdding}
                    sponsorName={s.name}
                    onAdd={(m) => {
                        onChange({ ...s, members: [...s.members, m] });
                        setNote(
                            m.invitedAt
                                ? `Einladung an ${m.email} verschickt.`
                                : `${m.name} ist jetzt Kontaktperson.`,
                        );
                    }}
                />
                <GrantDialog
                    open={granting}
                    onOpenChange={setGranting}
                    sponsor={s}
                    onGrant={(ids) => {
                        const fresh = grants(ids, [], TODAY);
                        onChange({ ...s, grants: [...s.grants, ...fresh] });
                        setNote(
                            `${ids.length} ${ids.length === 1 ? 'Einschreibung' : 'Einschreibungen'} freigegeben — die Lernenden bekommen eine Nachricht.`,
                        );
                    }}
                />
                <ConfirmActionDialog
                    open={confirm?.kind === 'removeMember'}
                    onOpenChange={(o) => !o && setConfirm(null)}
                    title={
                        confirm?.kind === 'removeMember'
                            ? `${confirm.member.name} entfernen?`
                            : 'Kontakt entfernen?'
                    }
                    description={`${confirm?.kind === 'removeMember' ? first(confirm.member.name) : 'Die Person'} sieht den Bericht von ${s.name} ab sofort nicht mehr. Das Konto selbst bleibt bestehen.`}
                    confirmLabel="Entfernen"
                    cancelLabel="Abbrechen"
                    variant="destructive"
                    onConfirm={() => {
                        if (confirm?.kind !== 'removeMember') return;
                        onChange({
                            ...s,
                            members: s.members.filter((m) => m.id !== confirm.member.id),
                        });
                        setNote(`${confirm.member.name} entfernt.`);
                        setConfirm(null);
                    }}
                />
                <ConfirmActionDialog
                    open={confirm?.kind === 'revoke'}
                    onOpenChange={(o) => !o && setConfirm(null)}
                    title="Freigabe widerrufen?"
                    description={
                        confirm?.kind === 'revoke'
                            ? `${s.name} sieht ${enrolment(confirm.grant.enrolmentId).student} in „${enrolment(confirm.grant.enrolmentId).course}“ ab sofort nicht mehr. ${first(enrolment(confirm.grant.enrolmentId).student)} bekommt eine Nachricht; der Zeitraum bleibt auf der Transparenzseite stehen.`
                            : ''
                    }
                    confirmLabel="Widerrufen"
                    cancelLabel="Abbrechen"
                    variant="destructive"
                    onConfirm={() => {
                        if (confirm?.kind !== 'revoke') return;
                        onChange({
                            ...s,
                            grants: s.grants.map((g) =>
                                g.id === confirm.grant.id ? { ...g, revokedAt: TODAY } : g,
                            ),
                        });
                        setNote('Freigabe widerrufen.');
                        setConfirm(null);
                    }}
                />
                <ConfirmActionDialog
                    open={confirm?.kind === 'seesAll'}
                    onOpenChange={(o) => !o && setConfirm(null)}
                    title={`${s.name} alles sehen lassen?`}
                    description={`Der Sponsor sieht dann den Fortschritt jedes Lernenden der Schule — alle ${ENROLMENTS.length} Einschreibungen und jede künftige, nicht nur die freigegebenen. Die Lernenden bekommen dazu keine einzelne Nachricht; sie sehen den Sponsor auf ihrer Transparenzseite.`}
                    confirmLabel="Ja, alles sichtbar machen"
                    cancelLabel="Abbrechen"
                    onConfirm={() => {
                        onChange({ ...s, seesAll: true });
                        setNote('Sieht jetzt alle Einschreibungen.');
                        setConfirm(null);
                    }}
                />
            </SheetContent>
        </Sheet>
    );
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

/** Name, contact address and private notes — the same form to create and to edit. */
function SponsorDialog({
    open,
    onOpenChange,
    initial,
    onSave,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    initial: Sponsor | null;
    onSave: (v: {
        name: string;
        contactEmail: string;
        notes: string;
        invite: { name: string; email: string } | null;
    }) => void;
}) {
    const id = useId();
    const [name, setName] = useState(initial?.name ?? '');
    const [email, setEmail] = useState(initial?.contactEmail ?? '');
    const [notes, setNotes] = useState(initial?.notes ?? '');
    const [invite, setInvite] = useState(true);
    const [personName, setPersonName] = useState('');
    const [personEmail, setPersonEmail] = useState('');
    const emailOk = (v: string) => /.+@.+\..+/.test(v);
    const valid =
        name.trim() !== '' &&
        (email === '' || emailOk(email)) &&
        (initial || !invite || (personName.trim() !== '' && emailOk(personEmail)));
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent closeLabel="Schließen" className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{initial ? 'Sponsor bearbeiten' : 'Neuer Sponsor'}</DialogTitle>
                    <DialogDescription>
                        Eine Firma, ein Förderträger oder eine Familie, die Kurse bezahlt. Danach
                        gibst du frei, welche Einschreibungen sie sehen darf.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-name`}>Name der Organisation</Label>
                        <Input
                            id={`${id}-name`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="z. B. Stiftung Bildungsbrücke"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-email`}>Kontakt-E-Mail (optional)</Label>
                        <Input
                            id={`${id}-email`}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-describedby={`${id}-email-hint`}
                        />
                        <p id={`${id}-email-hint`} className="text-xs text-muted-foreground">
                            Die Adresse der Organisation — kein Login. Wer sich anmelden darf, legst
                            du unter Kontaktpersonen fest.
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-notes`}>Interne Notizen</Label>
                        <Textarea
                            id={`${id}-notes`}
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            aria-describedby={`${id}-notes-hint`}
                        />
                        <p
                            id={`${id}-notes-hint`}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                            <Lock className="size-3" aria-hidden="true" />
                            Nur für Admins sichtbar — dem Sponsor nie angezeigt.
                        </p>
                    </div>
                    {/* MOCK-ONLY: creating a sponsor and inviting its first contact in one step; today that is two steps (create, then "Kontakt hinzufügen"). */}
                    {!initial && (
                        <div className="flex flex-col gap-3 rounded-lg bg-muted/40 p-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Switch
                                    id={`${id}-invite`}
                                    checked={invite}
                                    onCheckedChange={setInvite}
                                />
                                <Label htmlFor={`${id}-invite`} className="font-normal">
                                    Gleich eine Kontaktperson einladen
                                </Label>
                            </div>
                            {invite && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-2">
                                        <Label htmlFor={`${id}-pname`}>Vollständiger Name</Label>
                                        <Input
                                            id={`${id}-pname`}
                                            value={personName}
                                            onChange={(e) => setPersonName(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor={`${id}-pemail`}>E-Mail</Label>
                                        <Input
                                            id={`${id}-pemail`}
                                            type="email"
                                            value={personEmail}
                                            onChange={(e) => setPersonEmail(e.target.value)}
                                        />
                                    </div>
                                    <p className="col-span-2 text-xs text-muted-foreground">
                                        Bekommt eine Einladung mit der Rolle „Sponsor“: nur den
                                        Bericht lesen, keine Kursinhalte.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Abbrechen
                    </Button>
                    <Button
                        disabled={!valid}
                        onClick={() => {
                            onSave({
                                name: name.trim(),
                                contactEmail: email.trim(),
                                notes,
                                invite:
                                    !initial && invite
                                        ? { name: personName.trim(), email: personEmail.trim() }
                                        : null,
                            });
                            onOpenChange(false);
                        }}
                    >
                        {initial ? 'Speichern' : 'Anlegen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** A new contact: invite by name and email, or attach an existing sponsor account. */
function AddMemberDialog({
    open,
    onOpenChange,
    sponsorName,
    onAdd,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    sponsorName: string;
    onAdd: (m: Member) => void;
}) {
    const id = useId();
    const [mode, setMode] = useState<'invite' | 'existing'>('invite');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [account, setAccount] = useState('');
    const valid =
        mode === 'invite' ? name.trim() !== '' && /.+@.+\..+/.test(email) : account !== '';
    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) {
                    setName('');
                    setEmail('');
                    setAccount('');
                }
            }}
        >
            <DialogContent closeLabel="Schließen">
                <DialogHeader>
                    <DialogTitle>Kontakt hinzufügen</DialogTitle>
                    <DialogDescription>
                        Die Person kann sich danach anmelden und den Bericht von {sponsorName} lesen
                        — sonst nichts.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div role="radiogroup" aria-label="Wie" className="grid grid-cols-2 gap-2">
                        {(
                            [
                                ['invite', 'Per E-Mail einladen', 'Neues Konto mit Rolle Sponsor'],
                                ['existing', 'Bestehendes Konto', 'Hat die Rolle Sponsor schon'],
                            ] as const
                        ).map(([value, label, hint]) => (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={mode === value}
                                onClick={() => setMode(value)}
                                className={cn(
                                    'rounded-lg border px-3 py-2 text-start',
                                    mode === value
                                        ? 'border-primary ring-1 ring-primary'
                                        : 'border-border hover:bg-muted',
                                )}
                            >
                                <div className="text-sm font-medium">{label}</div>
                                <div className="text-xs text-muted-foreground">{hint}</div>
                            </button>
                        ))}
                    </div>
                    {mode === 'invite' ? (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor={`${id}-name`}>Vollständiger Name</Label>
                                <Input
                                    id={`${id}-name`}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor={`${id}-email`}>E-Mail-Adresse</Label>
                                <Input
                                    id={`${id}-email`}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Bekommt eine Einladung mit Link; der Link gilt 7 Tage.
                            </p>
                        </>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-account`}>Sponsorenkonto</Label>
                            <Combobox
                                id={`${id}-account`}
                                value={account}
                                options={FREE_SPONSOR_ACCOUNTS}
                                onChange={setAccount}
                                placeholder="Konto wählen …"
                                searchPlaceholder="Name oder E-Mail …"
                                emptyLabel="Kein passendes Sponsorenkonto."
                            />
                            <p className="text-xs text-muted-foreground">
                                Es erscheinen nur Konten mit der Rolle Sponsor — Lernende oder
                                Lehrkräfte werden nie still zu Sponsoren.
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Abbrechen
                    </Button>
                    <Button
                        disabled={!valid}
                        onClick={() => {
                            const [accName, accEmail] = account.split(' · ');
                            onAdd(
                                mode === 'invite'
                                    ? {
                                          id: Date.now(),
                                          name: name.trim(),
                                          email: email.trim(),
                                          invitedAt: TODAY,
                                          lastSeen: null,
                                      }
                                    : {
                                          id: Date.now(),
                                          name: accName ?? account,
                                          email: accEmail ?? '',
                                          invitedAt: null,
                                          lastSeen: '2026-09-15',
                                      },
                            );
                            onOpenChange(false);
                        }}
                    >
                        {mode === 'invite' ? 'Einladung senden' : 'Hinzufügen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * Pick the enrolments a sponsor may see: search by student or course, tick,
 * confirm. Only running enrolments not already granted are offered.
 */
function GrantDialog({
    open,
    onOpenChange,
    sponsor,
    onGrant,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    sponsor: Sponsor;
    onGrant: (ids: number[]) => void;
}) {
    const id = useId();
    const [q, setQ] = useState('');
    const [course, setCourse] = useState('all');
    const [picked, setPicked] = useState<Set<number>>(new Set());
    const granted = new Set(active(sponsor).map((g) => g.enrolmentId));
    const revoked = new Set(sponsor.grants.filter((g) => g.revokedAt).map((g) => g.enrolmentId));
    const candidates = ENROLMENTS.filter((e) => e.status === 'active' && !granted.has(e.id));
    const shown = candidates
        .filter((e) => course === 'all' || e.course === course)
        .filter((e) => `${e.student} ${e.course}`.toLowerCase().includes(q.trim().toLowerCase()));
    const allShown = shown.length > 0 && shown.every((e) => picked.has(e.id));
    const toggle = (eid: number) =>
        setPicked((prev) => {
            const next = new Set(prev);
            if (next.has(eid)) next.delete(eid);
            else next.add(eid);
            return next;
        });
    const reset = () => {
        setQ('');
        setCourse('all');
        setPicked(new Set());
    };
    const n = picked.size;
    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) reset();
            }}
        >
            <DialogContent closeLabel="Schließen" className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Einschreibungen freigeben</DialogTitle>
                    <DialogDescription>
                        {sponsor.name} sieht für die ausgewählten Einschreibungen Fortschritt,
                        Quiz-Ergebnisse, Anwesenheit und Zertifikat — sonst nichts.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                    <div className="flex gap-2">
                        <SearchField
                            value={q}
                            onValueChange={setQ}
                            placeholder="Lernende oder Kurse suchen …"
                            className="flex-1"
                        />
                        {/* MOCK-ONLY: the course filter; today the picker has the text search only. */}
                        <Select value={course} onValueChange={setCourse}>
                            <SelectTrigger className="w-60" aria-label="Kurs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Alle Kurse</SelectItem>
                                {COURSES.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-1 text-sm">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`${id}-all`}
                                checked={allShown}
                                disabled={shown.length === 0}
                                onCheckedChange={(v) =>
                                    setPicked((prev) => {
                                        const next = new Set(prev);
                                        for (const e of shown)
                                            if (v) next.add(e.id);
                                            else next.delete(e.id);
                                        return next;
                                    })
                                }
                            />
                            <Label htmlFor={`${id}-all`} className="font-normal">
                                Alle {shown.length} angezeigten auswählen
                            </Label>
                        </div>
                        <span aria-live="polite" className="font-medium tabular-nums">
                            {n} ausgewählt
                        </span>
                    </div>
                    <ul
                        aria-label="Einschreibungen"
                        className="flex max-h-80 flex-col divide-y divide-border overflow-auto rounded-lg border border-border"
                    >
                        {shown.length === 0 ? (
                            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                                {candidates.length === 0
                                    ? 'Keine freigebbaren Einschreibungen — alle laufenden sind schon freigegeben.'
                                    : 'Nichts passt zu deiner Suche.'}
                            </li>
                        ) : (
                            shown.map((e) => (
                                <li key={e.id}>
                                    <label
                                        htmlFor={`${id}-e${e.id}`}
                                        className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-muted"
                                    >
                                        <Checkbox
                                            id={`${id}-e${e.id}`}
                                            checked={picked.has(e.id)}
                                            onCheckedChange={() => toggle(e.id)}
                                        />
                                        <InitialsAvatar name={e.student} size="sm" colored />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium">
                                                {e.student}
                                            </span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {e.course} · {e.run}
                                            </span>
                                        </span>
                                        {revoked.has(e.id) && (
                                            <Badge tone="faint">War schon freigegeben</Badge>
                                        )}
                                    </label>
                                </li>
                            ))
                        )}
                    </ul>
                    <p className="flex items-start gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        Jede:r ausgewählte Lernende bekommt eine Nachricht in der App und per
                        E-Mail: „{sponsor.name} kann jetzt deinen Fortschritt in … sehen“.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Abbrechen
                    </Button>
                    <Button
                        disabled={n === 0}
                        onClick={() => {
                            onGrant([...picked]);
                            onOpenChange(false);
                            reset();
                        }}
                    >
                        {n === 1 ? '1 Einschreibung freigeben' : `${n} Einschreibungen freigeben`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// The report
// ---------------------------------------------------------------------------

function ReportView({ sponsor, onBack }: { sponsor: Sponsor; onBack: () => void }) {
    const [search, setSearch] = useState('');
    const rows = reportFor(sponsor).filter((r) =>
        `${r.student} ${r.course}`.toLowerCase().includes(search.toLowerCase()),
    );
    const columns: GridColumn<ReportRow>[] = useMemo(
        () => [
            {
                id: 'student',
                header: 'Lernende:r',
                pinned: 'left',
                hideable: false,
                width: 200,
                filter: { type: 'text' },
                cell: (r) => (
                    <span className="flex items-center gap-2">
                        <InitialsAvatar name={r.student} size="sm" colored />
                        <span className="truncate font-medium">{r.student}</span>
                    </span>
                ),
            },
            {
                id: 'course',
                header: 'Kurs',
                width: 230,
                groupable: true,
                cell: (r) => (
                    <span className="flex min-w-0 flex-col">
                        <span className="truncate">{r.course}</span>
                        <span className="truncate text-xs text-muted-foreground">{r.run}</span>
                    </span>
                ),
            },
            {
                id: 'status',
                header: 'Status',
                width: 140,
                groupable: true,
                cell: (r) => (
                    <Badge tone={ENROLMENT_STATUS[r.status].tone} dot>
                        {ENROLMENT_STATUS[r.status].label}
                    </Badge>
                ),
                exportValue: (r) => ENROLMENT_STATUS[r.status].label,
                filter: {
                    type: 'choice',
                    options: Object.entries(ENROLMENT_STATUS).map(([value, v]) => ({
                        value,
                        label: v.label,
                    })),
                },
            },
            {
                id: 'progress',
                header: 'Fortschritt',
                width: 200,
                cell: (r) => <ProgressCell row={r} />,
                aggregate: 'avg',
                formatAggregate: (v) => `Ø ${Math.round(v)} %`,
            },
            {
                id: 'quizzes',
                header: 'Quizze',
                width: 170,
                value: (r) => r.quizAvg ?? -1,
                cell: (r) =>
                    r.quizzesPassed === 0 && r.quizAvg === null ? (
                        <span className="text-muted-foreground">—</span>
                    ) : (
                        <span className="flex flex-col">
                            <span>
                                {r.quizzesPassed} von {r.quizzesTotal} bestanden
                            </span>
                            {r.quizAvg !== null && (
                                <span className="text-xs text-muted-foreground">
                                    Ø {r.quizAvg} %
                                </span>
                            )}
                        </span>
                    ),
            },
            {
                id: 'attendance',
                header: 'Anwesenheit',
                width: 130,
                align: 'right',
                value: (r) => r.attendanceSeconds,
                cell: (r) => (
                    <span className="flex flex-col items-end">
                        <span className="tabular-nums">{hours(r.attendanceSeconds)}</span>
                        <span className="text-xs text-muted-foreground">
                            {r.sessions} {r.sessions === 1 ? 'Termin' : 'Termine'}
                        </span>
                    </span>
                ),
            },
            {
                id: 'certificate',
                header: 'Zertifikat',
                width: 120,
                groupable: true,
                value: (r) => (r.certificate ? 'Ausgestellt' : '—'),
                cell: (r) =>
                    r.certificate ? (
                        <Badge tone="success">Ausgestellt</Badge>
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
            {
                id: 'lastActivity',
                header: 'Letzte Aktivität',
                width: 150,
                value: (r) => r.lastActivity ?? '',
                cell: (r) =>
                    r.lastActivity ? (
                        fmt(r.lastActivity)
                    ) : (
                        <span className="text-muted-foreground">Noch keine Aktivität</span>
                    ),
            },
        ],
        [],
    );
    const grid = useGrid<ReportRow>({
        id: 'storybook.page.sponsors.report',
        rows,
        getRowId: (r) => r.enrolmentId,
        columns,
        selection: 'none',
    });
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-3">
                <IconButton
                    label="Zurück zu den Sponsoren"
                    icon={<ArrowLeft aria-hidden="true" />}
                    onClick={onBack}
                />
                <InitialsAvatar name={sponsor.name} size="sm" colored />
                <div className="min-w-0">
                    <div className="truncate font-semibold">Bericht · {sponsor.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                        {sponsor.seesAll
                            ? 'Sieht alle Einschreibungen der Schule'
                            : `${active(sponsor).length} freigegebene Einschreibungen`}
                    </div>
                </div>
                <div className="ms-auto">
                    <ScopeBadge seesAll={sponsor.seesAll} />
                </div>
            </div>
            <GridPage
                title={`Bericht für ${sponsor.name}`}
                offsetTop="4rem"
                grid={grid}
                search={{ value: search, onChange: setSearch, placeholder: 'Lernende oder Kurs …' }}
                options={
                    <GridOptions
                        preferences={grid.preferences}
                        canSelect={false}
                        columns={columns.map((c) => ({
                            id: c.id,
                            label: c.header,
                            hideable: c.hideable,
                        }))}
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
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                        Genau das, was {sponsor.name} sieht — nicht mehr. „Letzte Aktivität“ zählt
                        nur im geförderten Kurs; Antworten auf Quizfragen sieht der Sponsor nie.
                    </span>
                }
                footer={
                    <GridFooter
                        summary={`${rows.length} Einschreibungen`}
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
                        table: `Bericht für ${sponsor.name}`,
                        empty: 'Für diesen Sponsor gibt es derzeit nichts anzuzeigen.',
                    }}
                    rowLabel={(r) => `${r.student}, ${r.course}`}
                    renderFilter={(col, close) => (
                        <GridFilterEditor
                            key={col.id}
                            columnId={col.id}
                            header={col.header}
                            def={col.filter!}
                            value={grid.filters.find((f) => f.id === col.id)}
                            onApply={(f) => {
                                if (f) grid.setFilter(f);
                                else grid.removeFilter(col.id);
                                close();
                            }}
                            labels={FILTER_EDITOR_LABELS}
                        />
                    )}
                />
            </GridPage>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Settings, and the area while it is off
// ---------------------------------------------------------------------------

const SEES = [
    ['Status der Einschreibung', 'aktiv, abgeschlossen, abgebrochen'],
    ['Lektionsfortschritt', 'wie viele Lektionen erledigt, in Prozent'],
    ['Quiz-Ergebnisse', 'bestanden/nicht bestanden und der Durchschnitt'],
    ['Anwesenheit', 'Stunden und Termine in Live-Sitzungen des Kurses'],
    ['Zertifikat', 'ob es ausgestellt ist'],
    ['Letzte Aktivität', 'nur im geförderten Kurs'],
] as const;
const NEVER = [
    ['Antworten auf Quizfragen', 'nur das Ergebnis, nie der Inhalt'],
    ['Andere Kurse', 'auch nicht, dass es sie gibt'],
    ['Wann jemand sonst online war', 'Aktivität außerhalb des Kurses bleibt privat'],
    ['Nachrichten und Profildaten', 'Adresse, Telefon, Unterhaltungen'],
    ['Deine Notizen zum Sponsor', 'nicht einmal im Quelltext seiner Seite'],
] as const;

function SettingsSection({
    title,
    text,
    children,
}: {
    title: string;
    text?: string;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-4">
            <div>
                <h2 className="font-semibold">{title}</h2>
                {text && <p className="text-sm text-muted-foreground">{text}</p>}
            </div>
            {children}
        </section>
    );
}

function SettingsView({
    enabled,
    onSave,
    sponsors,
}: {
    enabled: boolean;
    onSave: (enabled: boolean) => void;
    sponsors: Sponsor[];
}) {
    const id = useId();
    const [draft, setDraft] = useState(enabled);
    const [saved, setSaved] = useState<string | null>(null);
    const dirty = draft !== enabled;
    const contacts = sponsors.reduce((n, s) => n + s.members.length, 0);
    return (
        // The unsaved bar is sticky inside the page's own scroll area, so it
        // spans the page only — never the rail or the menu beside it.
        <div className="flex min-h-svh flex-col">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-8 py-8">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Sponsoren-Einstellungen
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Ob es Sponsoren an deiner Schule gibt, und was sie sehen dürfen.
                    </p>
                </header>

                {/* The switch lives on /admin/settings today; here it moves into the area it switches. */}
                <SettingsSection title="Sponsoren">
                    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <Label htmlFor={`${id}-on`} className="text-sm font-medium">
                                    Sponsoren aktivieren
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Für Schulen, deren Kurse von Firmen, Förderträgern oder Familien
                                    bezahlt werden.
                                </p>
                            </div>
                            <Switch id={`${id}-on`} checked={draft} onCheckedChange={setDraft} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div
                                className={cn(
                                    'flex flex-col gap-1.5 rounded-md p-3',
                                    draft ? 'bg-success/10' : 'bg-muted/40',
                                )}
                            >
                                <div
                                    className={cn(
                                        'font-medium',
                                        draft && 'text-success-tint-foreground',
                                    )}
                                >
                                    Eingeschaltet
                                </div>
                                <p
                                    className={
                                        draft
                                            ? 'text-success-tint-foreground'
                                            : 'text-muted-foreground'
                                    }
                                >
                                    Der Bereich Sponsoren erscheint hier im Admin. Kontaktpersonen
                                    melden sich an und sehen ihren Bericht. Lernende finden in ihrem
                                    Konto „Wer kann meinen Fortschritt sehen?“.
                                </p>
                            </div>
                            <div
                                className={cn(
                                    'flex flex-col gap-1.5 rounded-md p-3',
                                    !draft ? 'bg-warning/10' : 'bg-muted/40',
                                )}
                            >
                                <div
                                    className={cn(
                                        'font-medium',
                                        !draft && 'text-warning-tint-foreground',
                                    )}
                                >
                                    Ausgeschaltet
                                </div>
                                <p
                                    className={
                                        !draft
                                            ? 'text-warning-tint-foreground'
                                            : 'text-muted-foreground'
                                    }
                                >
                                    Jede Sponsoren-Seite — Verwaltung, Bericht, Transparenzseite —
                                    gibt es dann nicht (404). Gelöscht wird nichts: Sponsoren,
                                    Kontakte und Freigaben sind wieder da, sobald du einschaltest.
                                </p>
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection
                    title="Was Sponsoren sehen"
                    text="Fest eingebaut, nicht einstellbar — damit keine Schule aus Versehen mehr preisgibt. Es gilt pro freigegebener Einschreibung."
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg border border-border p-4">
                            <h3 className="mb-3 text-sm font-medium">Sieht</h3>
                            <ul className="flex flex-col gap-3 text-sm">
                                {SEES.map(([what, how]) => (
                                    <li key={what} className="flex gap-2">
                                        <Check
                                            className="mt-0.5 size-4 shrink-0 text-success-tint-foreground"
                                            aria-hidden="true"
                                        />
                                        <span>
                                            {what}
                                            <span className="block text-muted-foreground">
                                                {how}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-lg border border-border bg-muted/40 p-4">
                            <h3 className="mb-3 text-sm font-medium">Sieht nie</h3>
                            <ul className="flex flex-col gap-3 text-sm">
                                {NEVER.map(([what, how]) => (
                                    <li key={what} className="flex gap-2">
                                        <X
                                            className="mt-0.5 size-4 shrink-0 text-destructive-tint-foreground"
                                            aria-hidden="true"
                                        />
                                        <span>
                                            {what}
                                            <span className="block text-muted-foreground">
                                                {how}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <p className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        Jedes Mal, wenn ein Sponsor einen Bericht öffnet, steht das im Protokoll.
                    </p>
                </SettingsSection>

                <SettingsSection
                    title="Lernende informieren"
                    text="Immer an — Lernende sollen nie zufällig herausfinden müssen, dass jemand mitliest."
                >
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
                        <li className="flex items-start gap-3 p-4">
                            <ListChecks className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            <span>
                                <span className="font-medium">
                                    Bei jeder Freigabe und jedem Widerruf
                                </span>
                                <span className="block text-muted-foreground">
                                    bekommt die:der Lernende eine Nachricht mit dem Namen des
                                    Sponsors und dem Kurs — in der App immer, per E-Mail, solange
                                    sie:er die nicht im Profil abbestellt hat.
                                </span>
                            </span>
                        </li>
                        <li className="flex items-start gap-3 p-4">
                            <Globe className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            <span>
                                <span className="font-medium">
                                    Bei „Sieht alle Einschreibungen“
                                </span>
                                <span className="block text-muted-foreground">
                                    geht keine einzelne Nachricht raus. Der Sponsor steht dann auf
                                    der Transparenzseite jedes Lernenden unter „Schulweite
                                    Sponsoren“.
                                </span>
                            </span>
                        </li>
                    </ul>
                </SettingsSection>

                <SettingsSection
                    title="Transparenz"
                    text="Was Lernende in ihrem Konto unter „Wer kann meinen Fortschritt sehen?“ finden."
                >
                    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
                        <div className="flex flex-col gap-2 rounded-md border border-border bg-background p-3">
                            <div className="text-xs font-medium text-muted-foreground">
                                Beispiel: Hanna Haddad sieht
                            </div>
                            {[
                                ['Familie Haddad', 'Tajwid Grundlagen', 'seit 02.09.2026', 'Aktiv'],
                                [
                                    'Al-Nur Förderverein e.V.',
                                    'alle Kurse',
                                    'seit 30.06.2026',
                                    'Schulweit',
                                ],
                                [
                                    'Stiftung Bildungsbrücke',
                                    'Arabisch für Anfänger',
                                    '15.07.–01.09.2026',
                                    'Beendet',
                                ],
                            ].map(([who, what, when, state]) => (
                                <div key={who} className="grid grid-cols-4 items-center gap-3">
                                    <span className="font-medium">{who}</span>
                                    <span className="text-muted-foreground">{what}</span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {when}
                                    </span>
                                    <Badge
                                        tone={
                                            state === 'Aktiv'
                                                ? 'success'
                                                : state === 'Schulweit'
                                                  ? 'warning'
                                                  : 'faint'
                                        }
                                    >
                                        {state}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <p className="text-muted-foreground">
                            Aktive und beendete Freigaben mit ihrem Zeitraum, dazu was ein Sponsor
                            sieht und was nie.
                        </p>
                        <Button variant="outline" size="sm" className="w-fit" asChild>
                            <a href="#/my/sponsors">
                                <Eye aria-hidden="true" /> Transparenzseite ansehen
                            </a>
                        </Button>
                    </div>
                </SettingsSection>
                {saved && (
                    <p role="status" className="text-sm text-muted-foreground">
                        {saved}
                    </p>
                )}
            </div>

            {dirty && (
                <div
                    role="region"
                    aria-label="Ungespeicherte Änderungen"
                    className="sticky bottom-0 z-20 border-t border-border bg-background px-8 py-3 shadow-lg"
                >
                    <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                        <p className="text-sm">
                            <span className="font-medium">Nicht gespeichert.</span>{' '}
                            <span className="text-muted-foreground">
                                {draft
                                    ? 'Sponsoren werden eingeschaltet — der Bereich und die Transparenzseite erscheinen.'
                                    : `Sponsoren werden ausgeschaltet — ${contacts} Kontaktpersonen von ${sponsors.length} Sponsoren sehen sofort keinen Bericht mehr.`}
                            </span>
                        </p>
                        <div className="flex shrink-0 gap-2">
                            <Button variant="outline" onClick={() => setDraft(enabled)}>
                                Verwerfen
                            </Button>
                            <Button
                                onClick={() => {
                                    onSave(draft);
                                    setSaved(
                                        draft
                                            ? 'Gespeichert — Sponsoren sind eingeschaltet.'
                                            : 'Gespeichert — Sponsoren sind ausgeschaltet. Nichts wurde gelöscht.',
                                    );
                                }}
                            >
                                Speichern
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function OffView({ onSettings }: { onSettings: () => void }) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-8 px-8 py-12">
            <EmptyState
                icon={HandCoins}
                title="Sponsoren sind ausgeschaltet"
                description="Mit Sponsoren gibst du Firmen, Förderträgern oder Familien, die Kurse bezahlen, Lesezugriff auf den Fortschritt genau der Einschreibungen, die sie fördern."
                action={
                    <Button onClick={onSettings}>
                        <Settings2 aria-hidden="true" /> In den Einstellungen einschalten
                    </Button>
                }
                className="max-w-xl"
            />
            <ul className="grid max-w-3xl grid-cols-3 gap-4 text-sm">
                {[
                    [
                        ListChecks,
                        'Du entscheidest pro Einschreibung',
                        'Ein Sponsor sieht nur die Kurse, die du freigibst — nie den ganzen Menschen.',
                    ],
                    [
                        ShieldCheck,
                        'Nur lesen, nur das Nötige',
                        'Fortschritt, Quiz-Ergebnisse, Anwesenheit, Zertifikat. Keine Antworten, keine Nachrichten.',
                    ],
                    [
                        Eye,
                        'Lernende wissen Bescheid',
                        'Sie bekommen bei jeder Freigabe eine Nachricht und sehen jederzeit, wer mitliest.',
                    ],
                ].map(([Icon, title, text]) => {
                    const I = Icon as LucideIcon;
                    return (
                        <li
                            key={title as string}
                            className="flex flex-col gap-1.5 rounded-lg border border-border p-4"
                        >
                            <I className="size-5 text-muted-foreground" aria-hidden="true" />
                            <span className="font-medium">{title as string}</span>
                            <span className="text-muted-foreground">{text as string}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

function SponsorsPage({
    initialView = { kind: 'list', scope: 'all' },
    openSponsor = null,
    enabled: initiallyEnabled = true,
}: {
    initialView?: View;
    openSponsor?: number | null;
    enabled?: boolean;
}) {
    const [sponsors, setSponsors] = useState(SPONSORS);
    const [enabled, setEnabled] = useState(initiallyEnabled);
    const [view, setView] = useState<View>(initialView);
    const [open, setOpen] = useState<number | null>(openSponsor);
    const [grantOnOpen, setGrantOnOpen] = useState(false);
    const [editing, setEditing] = useState<number | 'new' | null>(null);
    const [remove, setRemove] = useState<Sponsor | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const change = (s: Sponsor) => setSponsors((all) => all.map((x) => (x.id === s.id ? s : x)));
    const sponsor = sponsors.find((s) => s.id === open) ?? null;
    const reportSponsor =
        view.kind === 'report' ? sponsors.find((s) => s.id === view.sponsorId) : undefined;
    const openSheet = (sid: number, grant = false) => {
        setGrantOnOpen(grant);
        setOpen(sid);
    };
    const toReport = (sid: number) => {
        setOpen(null);
        setView({ kind: 'report', sponsorId: sid });
    };
    const edited = typeof editing === 'number' ? sponsors.find((s) => s.id === editing) : null;

    return (
        <Shell
            menu={
                <SponsorsMenu view={view} onView={setView} sponsors={sponsors} enabled={enabled} />
            }
        >
            {view.kind === 'settings' ? (
                <SettingsView enabled={enabled} onSave={setEnabled} sponsors={sponsors} />
            ) : !enabled ? (
                <OffView onSettings={() => setView({ kind: 'settings' })} />
            ) : view.kind === 'report' && reportSponsor ? (
                <ReportView
                    sponsor={reportSponsor}
                    onBack={() => setView({ kind: 'list', scope: 'all' })}
                />
            ) : (
                <SponsorsListView
                    key={view.kind === 'list' ? view.scope : 'all'}
                    sponsors={sponsors}
                    scope={view.kind === 'list' ? view.scope : 'all'}
                    onOpen={(sid) => openSheet(sid)}
                    onGrant={(sid) => openSheet(sid, true)}
                    onReport={toReport}
                    onCreate={() => setEditing('new')}
                    onEdit={(sid) => setEditing(sid)}
                    onDelete={(sid) => setRemove(sponsors.find((s) => s.id === sid) ?? null)}
                    notice={notice}
                />
            )}

            {sponsor && enabled && (
                <SponsorPanel
                    key={sponsor.id}
                    sponsor={sponsor}
                    grantOnOpen={grantOnOpen}
                    onClose={() => setOpen(null)}
                    onChange={change}
                    onEdit={() => setEditing(sponsor.id)}
                    onDelete={() => setRemove(sponsor)}
                    onReport={() => toReport(sponsor.id)}
                />
            )}
            <SponsorDialog
                key={String(editing)}
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
                initial={edited ?? null}
                onSave={(v) => {
                    if (edited) {
                        change({
                            ...edited,
                            name: v.name,
                            contactEmail: v.contactEmail || null,
                            notes: v.notes,
                        });
                        setNotice('Sponsor gespeichert.');
                        return;
                    }
                    const sid = Math.max(...sponsors.map((s) => s.id)) + 1;
                    setSponsors((all) => [
                        ...all,
                        {
                            id: sid,
                            name: v.name,
                            contactEmail: v.contactEmail || null,
                            notes: v.notes,
                            seesAll: false,
                            createdAt: TODAY,
                            members: v.invite
                                ? [
                                      {
                                          id: Date.now(),
                                          ...v.invite,
                                          invitedAt: TODAY,
                                          lastSeen: null,
                                      },
                                  ]
                                : [],
                            grants: [],
                        },
                    ]);
                    setNotice(
                        `„${v.name}“ angelegt${v.invite ? ` — Einladung an ${v.invite.email} verschickt` : ''}. Jetzt Einschreibungen freigeben.`,
                    );
                    openSheet(sid);
                }}
            />
            <ConfirmActionDialog
                open={remove !== null}
                onOpenChange={(o) => !o && setRemove(null)}
                title={`„${remove?.name}“ löschen?`}
                description="Seine Kontaktpersonen verlieren sofort den Zugang, und keine seiner Freigaben wird mehr angezeigt. Gespeichert bleibt alles — der Support kann den Sponsor wiederherstellen."
                confirmLabel="Löschen"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={() => {
                    setSponsors((all) => all.filter((x) => x.id !== remove?.id));
                    setNotice(`„${remove?.name}“ gelöscht.`);
                    setRemove(null);
                    setOpen(null);
                }}
            />
        </Shell>
    );
}

/**
 * The Sponsoren area as it could look: the sponsors as a list with what needs
 * you first, one sponsor as a panel from the right, the enrolments it may
 * see, its report, and the settings with the on/off switch. Click around — it
 * responds, but saves nothing.
 */
const meta: Meta<typeof SponsorsPage> = {
    title: 'Pages/Sponsoren',
    component: SponsorsPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.sponsors')) localStorage.removeItem(k);
    },
};
export default meta;

const rowsShown = (el: HTMLElement) =>
    waitFor(() => expect(el.querySelectorAll('tr[data-grid-row-id]').length).toBeGreaterThan(0));

/** All sponsors; the menu counts the ones without a contact or with an open invitation. */
export const Sponsoren: StoryObj<typeof SponsorsPage> = {
    render: () => <SponsorsPage />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** One sponsor as a wide panel: contacts, the enrolments it sees, visibility, report preview, notes. */
export const SponsorSheet: StoryObj<typeof SponsorsPage> = {
    render: () => <SponsorsPage openSponsor={1} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const panel = await body.findByRole('dialog', { name: 'Stiftung Bildungsbrücke' });
        await waitFor(() =>
            expect(panel.ownerDocument.activeElement).toHaveTextContent('Stiftung Bildungsbrücke'),
        );
        await rowsShown(panel);
    },
};

/** A whole-school sponsor: the panel leads with what that means. */
export const SponsorSiehtAlles: StoryObj<typeof SponsorsPage> = {
    render: () => <SponsorsPage openSponsor={5} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        await body.findByRole('dialog', { name: 'Al-Nur Förderverein e.V.' });
    },
};

export const NeuerSponsor: StoryObj<typeof SponsorsPage> = {
    render: () => <SponsorsPage />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Neuer Sponsor' }));
        const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
            name: 'Neuer Sponsor',
        });
        await expect(within(dialog).getByRole('button', { name: 'Anlegen' })).toBeDisabled();
    },
};

/** Pick enrolments for a sponsor; the students are told. */
export const EinschreibungenFreigeben: StoryObj<typeof SponsorsPage> = {
    render: () => <SponsorsPage openSponsor={2} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const panel = await body.findByRole('dialog', { name: 'Müller Logistik GmbH' });
        await rowsShown(panel);
        await userEvent.click(
            within(panel).getByRole('button', { name: /Einschreibungen freigeben/ }),
        );
        const dialog = await body.findByRole('dialog', { name: 'Einschreibungen freigeben' });
        const boxes = within(dialog).getAllByRole('checkbox');
        await userEvent.click(boxes[1]!);
        await userEvent.click(boxes[2]!);
        await userEvent.click(boxes[4]!);
        await expect(
            within(dialog).getByRole('button', { name: '3 Einschreibungen freigeben' }),
        ).toBeEnabled();
    },
};

/** The report a sponsor sees, opened by the admin. */
export const Bericht: StoryObj<typeof SponsorsPage> = {
    render: () => <SponsorsPage initialView={{ kind: 'report', sponsorId: 3 }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

export const Einstellungen: StoryObj<typeof SponsorsPage> = {
    render: () => <SponsorsPage initialView={{ kind: 'settings' }} />,
};

/** Switching sponsors off, not yet saved: the bar says what it will do. */
export const EinstellungenUngespeichert: StoryObj<typeof SponsorsPage> = {
    render: () => <SponsorsPage initialView={{ kind: 'settings' }} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('switch', { name: 'Sponsoren aktivieren' }));
        await canvas.findByRole('region', { name: 'Ungespeicherte Änderungen' });
    },
};

/** The area while the feature is off: what it is, and the way to switch it on. */
export const Aus: StoryObj<typeof SponsorsPage> = {
    render: () => <SponsorsPage enabled={false} />,
};
