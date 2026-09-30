import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
    ArchiveRestore,
    BookOpen,
    CircleAlert,
    Copy,
    CreditCard,
    Download,
    GraduationCap,
    House,
    Inbox,
    ListPlus,
    MailPlus,
    Palette,
    Pencil,
    RefreshCw,
    Settings2,
    Shield,
    SlidersHorizontal,
    Trash2,
    Upload,
    UserCheck,
    UserCog,
    UserPlus,
    UserRound,
    Users as UsersIcon,
    HandCoins,
    Hourglass,
    MailX,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import type { GridColumn } from '../../hooks/grid/types';
import type { GridActionItem, RowId } from '../../hooks/gridActions';
import { useGrid, type GridApi } from '../../hooks/useGrid';
import { downloadText } from '../../lib/download';
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
import { GridFilterChips } from '../../molecules/GridFilterChips';
import { GridFilterEditor } from '../../molecules/GridFilterEditor';
import { GridFooter } from '../../molecules/GridFooter';
import { GridOptions } from '../../molecules/GridOptions';
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
 * PAGE PROTOTYPE — the admin user list (`/admin/users` in Burgwiss), in the
 * same shell as the course list: rail, the Nutzer area's menu, the grid.
 * Every feature of today's list is here: search, filters (role, status,
 * payment, activity), inline role change, invite, import, export, profile
 * fields as optional columns, and the bulk actions with their result.
 * Non-functional: example content, no server.
 */

type Role = 'student' | 'teacher' | 'admin' | 'sponsor';
type Status = 'active' | 'invited' | 'expired' | 'pending' | 'deleted';
type Payment = 'paid' | 'pending' | 'none';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: Role;
    status: Status;
    lastSeen: string | null;
    invitedAt: string | null;
    enrolments: number;
    paidOrders: number;
    payment: Payment;
    phone: string;
    city: string;
    isSelf: boolean;
};

const ROLE_LABEL: Record<Role, string> = {
    student: 'Lernende',
    teacher: 'Lehrkraft',
    admin: 'Admin',
    sponsor: 'Sponsor',
};
const STATUS_LABEL: Record<Status, string> = {
    active: 'Aktiv',
    invited: 'Eingeladen',
    expired: 'Einladung abgelaufen',
    pending: 'Wartet auf Freigabe',
    deleted: 'Entfernt',
};
const STATUS_TONE = {
    active: 'success',
    invited: 'neutral',
    expired: 'warning',
    pending: 'warning',
    deleted: 'muted',
} as const;
const PAYMENT_LABEL: Record<Payment, string> = {
    paid: 'Bezahlt',
    pending: 'Offen',
    none: 'Keine Zahlung',
};

const FIRST = [
    'Amina',
    'Yusuf',
    'Leonie',
    'Omar',
    'Hanna',
    'Bilal',
    'Sara',
    'Jonas',
    'Maryam',
    'Emre',
    'Lea',
    'Karim',
    'Fatima',
    'Noah',
    'Aisha',
    'Tobias',
];
const LAST = [
    'Berger',
    'Yılmaz',
    'Haddad',
    'Okafor',
    'Schneider',
    'Rahman',
    'Weber',
    'Demir',
    'Nasser',
    'Krüger',
];
const CITIES = ['Berlin', 'Köln', 'Hamburg', 'München', 'Frankfurt', 'Wien'];
const TODAY = new Date('2026-09-30T12:00:00');

/** Deterministic example people — the same every render, so screenshots stay stable. */
function makeUsers(count: number): UserRow[] {
    return Array.from({ length: count }, (_, i) => {
        const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`;
        const role: Role =
            i === 0
                ? 'admin'
                : i % 11 === 0
                  ? 'teacher'
                  : i % 17 === 0
                    ? 'sponsor'
                    : i % 29 === 0
                      ? 'admin'
                      : 'student';
        const status: Status =
            i % 13 === 5
                ? 'pending'
                : i % 13 === 7
                  ? 'invited'
                  : i % 19 === 9
                    ? 'expired'
                    : i % 23 === 11
                      ? 'deleted'
                      : 'active';
        const days = (i * 7) % 140;
        const seen = new Date(TODAY);
        seen.setDate(seen.getDate() - days);
        const invited = new Date(TODAY);
        invited.setDate(invited.getDate() - ((i * 3) % 20));
        return {
            id: i + 1,
            name,
            email: `${name.toLowerCase().replace(/ı/g, 'i').replace(/ü/g, 'ue').replace(/\s+/g, '.')}@example.de`,
            role,
            status,
            lastSeen:
                status === 'active' || status === 'deleted'
                    ? i % 9 === 4
                        ? null
                        : seen.toISOString().slice(0, 10)
                    : null,
            invitedAt:
                status === 'invited' || status === 'expired'
                    ? invited.toISOString().slice(0, 10)
                    : null,
            enrolments: role === 'student' ? (i * 5) % 4 : 0,
            paidOrders: role === 'student' ? (i * 7) % 3 : 0,
            payment:
                role !== 'student'
                    ? 'none'
                    : i % 8 === 3
                      ? 'pending'
                      : (i * 7) % 3
                        ? 'paid'
                        : 'none',
            phone: `+49 151 ${String(1000000 + i * 7919).slice(0, 7)}`,
            city: CITIES[i % CITIES.length]!,
            isSelf: i === 0,
        };
    });
}

const date = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
const formatDate = (iso: string) => date.format(new Date(`${iso}T00:00:00`));
const daysSince = (iso: string) =>
    Math.round((TODAY.getTime() - new Date(`${iso}T00:00:00`).getTime()) / 86_400_000);
/** Dormant: not seen for 60 days or more (or never, once active). */
const isDormant = (u: UserRow) =>
    u.status === 'active' && (u.lastSeen === null || daysSince(u.lastSeen) >= 60);

const OFFERINGS = [
    'Arabisch für Anfänger · Herbst 2026 (Berlin)',
    'Arabisch für Anfänger · Online, Abends',
    'Tajwid Grundlagen · Winter 2026',
    'Hifz-Kreis: Juz ʿAmma · Samstags',
    'Fiqh des Alltags · Online',
];

const OPTIONS_LABELS = {
    trigger: 'Tabellenoptionen',
    columns: 'Spalten',
    density: 'Zeilenhöhe',
    comfortable: 'Bequem',
    compact: 'Kompakt',
    selection: 'Zeilen auswählen',
    reset: 'Zurücksetzen',
};

/** What the list shows, picked in the Nutzer menu. */
type Scope = { kind: 'all' } | { kind: 'role'; role: Role } | { kind: 'status'; status: Status };

const PAGE_SIZE = 25;
const COUNT = 64;

function inScope(u: UserRow, scope: Scope) {
    if (scope.kind === 'all') return u.status !== 'deleted';
    if (scope.kind === 'role') return u.role === scope.role && u.status !== 'deleted';
    return u.status === scope.status;
}

function UsersPage({ openInvite = false }: { openInvite?: boolean }) {
    const [users, setUsers] = useState(() => makeUsers(COUNT));
    const [scope, setScope] = useState<Scope>({ kind: 'all' });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [notice, setNotice] = useState<string | null>(null);
    const [inviting, setInviting] = useState(openInvite);
    const [roleFor, setRoleFor] = useState<RowId[] | null>(null);
    const [enrolFor, setEnrolFor] = useState<RowId[] | null>(null);
    const [removeFor, setRemoveFor] = useState<RowId[] | null>(null);
    const gridRef = useRef<GridApi<UserRow> | null>(null);

    const count = (pred: (u: UserRow) => boolean) => users.filter(pred).length;
    const pick = (s: Scope) => {
        setScope(s);
        setPage(0);
    };

    // Server-driven in the real page: search, scope and paging go to the
    // server, which answers with one page. Here the same, in memory.
    const matching = users.filter(
        (u) =>
            inScope(u, scope) &&
            `${u.name} ${u.email}`.toLowerCase().includes(search.trim().toLowerCase()),
    );
    const pages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
    const shown = matching.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    const byIds = (ids: RowId[]) => users.filter((u) => ids.includes(u.id));
    /** A bulk action: applies where it can, reports what it skipped and why. */
    const bulk = (
        label: string,
        ids: RowId[],
        can: (u: UserRow) => string | null,
        apply: (u: UserRow) => UserRow,
    ) => {
        const picked = byIds(ids);
        const skipped = picked
            .map((u) => ({ u, why: can(u) }))
            .filter((x): x is { u: UserRow; why: string } => x.why !== null);
        const done = picked.filter((u) => can(u) === null);
        setUsers((all) => all.map((u) => (done.some((d) => d.id === u.id) ? apply(u) : u)));
        gridRef.current?.clear();
        setNotice(
            `${label}: ${done.length} erledigt` +
                (skipped.length
                    ? ` · ${skipped.length} übersprungen (${skipped
                          .slice(0, 3)
                          .map((s) => `${s.u.name}: ${s.why}`)
                          .join('; ')}${skipped.length > 3 ? ' …' : ''})`
                    : ''),
        );
    };

    const columns: GridColumn<UserRow>[] = useMemo(
        () => [
            {
                id: 'name',
                header: 'Name',
                hideable: false,
                pinned: 'left',
                width: 240,
                filter: { type: 'text' },
                cell: (u) => (
                    <a
                        href={`#/admin/users/${u.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            linkTo('Pages/Nutzer', 'Nutzerseite')();
                        }}
                        className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:underline"
                    >
                        {u.name}
                        {u.isSelf && (
                            <span className="ms-1.5 text-xs text-muted-foreground">(du)</span>
                        )}
                    </a>
                ),
            },
            { id: 'email', header: 'E-Mail', width: 260, filter: { type: 'text' } },
            {
                id: 'role',
                header: 'Rolle',
                width: 140,
                groupable: true,
                cell: (u) => ROLE_LABEL[u.role],
                exportValue: (u) => ROLE_LABEL[u.role],
                filter: {
                    type: 'choice',
                    options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
                },
                editable: {
                    type: 'choice',
                    options: Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label })),
                    validate: (_, u) =>
                        u.isSelf ? 'Deine eigene Rolle kannst du nicht ändern.' : null,
                    onCommit: async (u, next) => {
                        await new Promise((r) => setTimeout(r, 300));
                        setUsers((all) =>
                            all.map((x) => (x.id === u.id ? { ...x, role: next as Role } : x)),
                        );
                        setNotice(`Rolle von ${u.name}: ${ROLE_LABEL[next as Role]}`);
                    },
                },
            },
            {
                id: 'status',
                header: 'Status',
                width: 200,
                groupable: true,
                cell: (u) => (
                    <Badge tone={STATUS_TONE[u.status]} dot>
                        {STATUS_LABEL[u.status]}
                    </Badge>
                ),
                exportValue: (u) => STATUS_LABEL[u.status],
                filter: {
                    type: 'choice',
                    options: Object.entries(STATUS_LABEL).map(([value, label]) => ({
                        value,
                        label,
                    })),
                },
            },
            {
                id: 'lastSeen',
                header: 'Zuletzt aktiv',
                width: 170,
                cell: (u) =>
                    u.lastSeen === null ? (
                        <span className="text-muted-foreground">
                            {u.status === 'active' ? 'nie' : '—'}
                        </span>
                    ) : (
                        <span className={isDormant(u) ? 'text-warning-tint-foreground' : undefined}>
                            {formatDate(u.lastSeen)}
                            {isDormant(u) && (
                                <span className="ms-1.5 text-xs">
                                    · seit {daysSince(u.lastSeen)} T.
                                </span>
                            )}
                        </span>
                    ),
                filter: { type: 'date' },
            },
            {
                id: 'enrolments',
                header: 'Kurse',
                align: 'right',
                width: 110,
                aggregate: 'sum',
                filter: { type: 'number' },
            },
            {
                id: 'paidOrders',
                header: 'Bestellungen',
                align: 'right',
                width: 150,
                aggregate: 'sum',
                filter: { type: 'number' },
            },
            {
                id: 'payment',
                header: 'Zahlung',
                width: 150,
                groupable: true,
                cell: (u) => PAYMENT_LABEL[u.payment],
                exportValue: (u) => PAYMENT_LABEL[u.payment],
                filter: {
                    type: 'choice',
                    options: Object.entries(PAYMENT_LABEL).map(([value, label]) => ({
                        value,
                        label,
                    })),
                },
            },
            {
                id: 'invitedAt',
                header: 'Eingeladen am',
                width: 160,
                cell: (u) => (u.invitedAt ? formatDate(u.invitedAt) : '—'),
                filter: { type: 'date' },
            },
            // Profile fields the school defined (Nutzer › Profilfelder) — hidden until picked.
            { id: 'phone', header: 'Telefon', width: 170, filter: { type: 'text' } },
            { id: 'city', header: 'Stadt', width: 140, groupable: true, filter: { type: 'text' } },
        ],
        [],
    );

    const actions: GridActionItem[] = [
        {
            id: 'invite',
            label: 'Einladen',
            icon: <UserPlus aria-hidden="true" />,
            tone: 'primary',
            shortcut: 'N',
            onSelect: () => setInviting(true),
        },
        {
            id: 'import',
            label: 'Aus CSV importieren',
            icon: <Upload aria-hidden="true" />,
            group: 'io',
            onSelect: () => setNotice('Import: öffnet den Import-Assistenten'),
        },
        {
            id: 'export',
            label: 'Liste als CSV exportieren',
            icon: <Download aria-hidden="true" />,
            group: 'io',
            shortcut: 'Mod+Shift+E',
            onSelect: () => {
                const grid = gridRef.current;
                if (!grid) return;
                downloadText(grid.exportCsv({ separator: ';', bom: true }), 'nutzer.csv');
                setNotice(`${matching.length} Nutzer als CSV exportiert (alle Seiten)`);
            },
        },
        {
            id: 'reload',
            label: 'Neu laden',
            icon: <RefreshCw aria-hidden="true" />,
            group: 'view',
            onSelect: () => setNotice('Neu geladen'),
        },
        {
            id: 'open',
            label: 'Öffnen',
            icon: <Pencil aria-hidden="true" />,
            when: ['one'],
            group: 'open',
            isDefault: true,
            shortcut: 'E',
            onSelect: () => linkTo('Pages/Nutzer', 'Nutzerseite')(),
        },
        {
            id: 'approve',
            label: 'Freigeben',
            icon: <UserCheck aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'state',
            disabled: (ids) => !byIds(ids).some((u) => u.status === 'pending'),
            disabledReason: 'Nur für Nutzer, die auf Freigabe warten',
            onSelect: (ids) =>
                bulk(
                    'Freigegeben',
                    ids,
                    (u) => (u.status === 'pending' ? null : 'wartet nicht'),
                    (u) => ({
                        ...u,
                        status: 'active',
                    }),
                ),
        },
        {
            id: 'resend',
            label: 'Einladung erneut senden',
            icon: <MailPlus aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'state',
            disabled: (ids) =>
                !byIds(ids).some((u) => u.status === 'invited' || u.status === 'expired'),
            disabledReason: 'Nur für offene oder abgelaufene Einladungen',
            onSelect: (ids) =>
                bulk(
                    'Einladung erneut gesendet',
                    ids,
                    (u) =>
                        u.status === 'invited' || u.status === 'expired'
                            ? null
                            : 'keine offene Einladung',
                    (u) => ({ ...u, status: 'invited', invitedAt: '2026-09-30' }),
                ),
        },
        {
            id: 'role',
            label: 'Rolle ändern …',
            icon: <UserCog aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'state',
            shortcut: 'R',
            onSelect: (ids) => setRoleFor(ids),
        },
        {
            id: 'enrol',
            label: 'In einen Kurs einschreiben …',
            icon: <ListPlus aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'state',
            onSelect: (ids) => setEnrolFor(ids),
        },
        {
            id: 'copy',
            label: 'Kopieren (für Excel)',
            icon: <Copy aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'io2',
            shortcut: 'Mod+C',
            onSelect: (ids) => {
                void gridRef.current?.copySelection();
                setNotice(`${ids.length} Nutzer kopiert`);
            },
        },
        {
            id: 'restore',
            label: 'Wiederherstellen',
            icon: <ArchiveRestore aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'danger',
            disabled: (ids) => !byIds(ids).some((u) => u.status === 'deleted'),
            disabledReason: 'Nur für entfernte Nutzer',
            onSelect: (ids) =>
                bulk(
                    'Wiederhergestellt',
                    ids,
                    (u) => (u.status === 'deleted' ? null : 'nicht entfernt'),
                    (u) => ({
                        ...u,
                        status: 'active',
                    }),
                ),
        },
        {
            id: 'remove',
            label: 'Entfernen …',
            icon: <Trash2 aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'danger',
            tone: 'destructive',
            shortcut: 'Delete',
            disabled: (ids) => byIds(ids).every((u) => u.status === 'deleted'),
            disabledReason: 'Schon entfernt',
            onSelect: (ids) => setRemoveFor(ids),
        },
    ];

    const grid = useGrid<UserRow>({
        id: 'storybook.page.users.grid',
        rows: shown,
        getRowId: (u) => u.id,
        columns,
        selection: 'multiple',
        actions,
        defaults: { hiddenColumns: ['invitedAt', 'phone', 'city'] },
    });
    useEffect(() => {
        gridRef.current = grid;
    });

    const scopeButton = (
        s: Scope,
        icon: React.ReactNode,
        label: string,
        n: number,
        attention = false,
    ) => {
        const active = JSON.stringify(s) === JSON.stringify(scope);
        return (
            <SidebarMenuItem>
                <SidebarMenuButton active={active} onClick={() => pick(s)}>
                    {icon}
                    <span className="flex-1">{label}</span>
                    {attention && n > 0 ? (
                        <Badge tone="warning">{n}</Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground tabular-nums">{n}</span>
                    )}
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    };

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
                    <AppRailItem icon={UsersIcon} label="Nutzer" active />
                    <AppRailItem icon={CreditCard} label="Zahlungen" onClick={() => {}} />
                    <AppRailItem icon={Palette} label="Design" onClick={() => {}} />
                    <AppRailSpacer />
                    <AppRailItem icon={Settings2} label="Betrieb" onClick={() => {}} />
                    <AppRailItem icon={UserRound} label="Konto" onClick={() => {}} />
                </AppRail>
            }
            sidebar={
                <Sidebar
                    label="Nutzer"
                    resize={{
                        label: 'Menü verbreitern oder verschmälern',
                        storageKey: 'storybook.page.users',
                    }}
                >
                    <SidebarHeader>
                        <div className="px-2 text-lg font-semibold tracking-tight">Nutzer</div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarMenu>
                                {scopeButton(
                                    { kind: 'all' },
                                    <Inbox aria-hidden="true" />,
                                    'Alle Nutzer',
                                    count((u) => u.status !== 'deleted'),
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup label="Braucht dich">
                            <SidebarMenu>
                                {scopeButton(
                                    { kind: 'status', status: 'pending' },
                                    <Hourglass aria-hidden="true" />,
                                    'Wartet auf Freigabe',
                                    count((u) => u.status === 'pending'),
                                    true,
                                )}
                                {scopeButton(
                                    { kind: 'status', status: 'expired' },
                                    <MailX aria-hidden="true" />,
                                    'Einladung abgelaufen',
                                    count((u) => u.status === 'expired'),
                                    true,
                                )}
                                {scopeButton(
                                    { kind: 'status', status: 'invited' },
                                    <MailPlus aria-hidden="true" />,
                                    'Eingeladen',
                                    count((u) => u.status === 'invited'),
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup label="Rollen">
                            <SidebarMenu>
                                {scopeButton(
                                    { kind: 'role', role: 'student' },
                                    <GraduationCap aria-hidden="true" />,
                                    'Lernende',
                                    count((u) => u.role === 'student' && u.status !== 'deleted'),
                                )}
                                {scopeButton(
                                    { kind: 'role', role: 'teacher' },
                                    <BookOpen aria-hidden="true" />,
                                    'Lehrkräfte',
                                    count((u) => u.role === 'teacher' && u.status !== 'deleted'),
                                )}
                                {scopeButton(
                                    { kind: 'role', role: 'admin' },
                                    <Shield aria-hidden="true" />,
                                    'Admins',
                                    count((u) => u.role === 'admin' && u.status !== 'deleted'),
                                )}
                                {scopeButton(
                                    { kind: 'role', role: 'sponsor' },
                                    <HandCoins aria-hidden="true" />,
                                    'Sponsoren',
                                    count((u) => u.role === 'sponsor' && u.status !== 'deleted'),
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup>
                            <SidebarMenu>
                                {scopeButton(
                                    { kind: 'status', status: 'deleted' },
                                    <Trash2 aria-hidden="true" />,
                                    'Entfernt',
                                    count((u) => u.status === 'deleted'),
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup label="Einrichten">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        onClick={() =>
                                            setNotice(
                                                'Profilfelder: eigene Felder wie Telefon oder Stadt, die jede Person ausfüllt',
                                            )
                                        }
                                    >
                                        <SlidersHorizontal aria-hidden="true" />
                                        <span className="flex-1">Profilfelder</span>
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            2
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        onClick={() =>
                                            setNotice('Importe: alle CSV-Importe und ihr Stand')
                                        }
                                    >
                                        <Upload aria-hidden="true" />
                                        <span className="flex-1">Importe</span>
                                        <Badge tone="neutral" dot>
                                            1 läuft
                                        </Badge>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            }
        >
            <GridPage
                title="Nutzer"
                offsetTop="0px"
                grid={grid}
                search={{
                    value: search,
                    onChange: (v) => {
                        setSearch(v);
                        setPage(0);
                    },
                    placeholder: 'Name oder E-Mail suchen …',
                }}
                moreActionsLabel="Weitere Aktionen"
                selectionLabels={{ count: (n) => `${n} ausgewählt`, clear: 'Auswahl aufheben' }}
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
                            labels: {
                                ...VIEWS_LABELS,
                                confirmDelete: (n) =>
                                    `„${n}" wird gelöscht. Die Nutzer bleiben, wie sie sind.`,
                            },
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
                            formatDate={formatDate}
                            formatNumber={(n) => String(n)}
                        />
                    ) : undefined
                }
                notice={
                    notice ? (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <CircleAlert className="size-3.5" aria-hidden="true" />
                            {notice}
                        </span>
                    ) : undefined
                }
                footer={
                    <GridFooter
                        summary={`${matching.length ? page * PAGE_SIZE + 1 : 0}–${Math.min((page + 1) * PAGE_SIZE, matching.length)} von ${matching.length} Nutzern · Seite ${page + 1} von ${pages}`}
                        onPrev={page > 0 ? () => setPage(page - 1) : null}
                        onNext={page < pages - 1 ? () => setPage(page + 1) : null}
                        labels={{ previous: 'Zurück', next: 'Weiter', pager: 'Seiten' }}
                    />
                }
            >
                <DataGrid
                    grid={grid}
                    labels={{
                        ...DATA_GRID_LABELS,
                        table: 'Nutzer',
                        empty: 'Niemand passt zu dieser Auswahl.',
                    }}
                    rowLabel={(u) => u.name}
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

            <InviteDialog
                open={inviting}
                onOpenChange={setInviting}
                onInvite={(u) => {
                    setUsers((all) => [
                        {
                            ...makeUsers(1)[0]!,
                            ...u,
                            id: all.length + 1,
                            status: 'invited',
                            invitedAt: '2026-09-30',
                            lastSeen: null,
                            enrolments: 0,
                            paidOrders: 0,
                            payment: 'none',
                            isSelf: false,
                        },
                        ...all,
                    ]);
                    setNotice(`Einladung an ${u.email} gesendet`);
                }}
            />
            <RoleDialog
                key={roleFor?.join() ?? 'none'}
                ids={roleFor}
                onClose={() => setRoleFor(null)}
                onConfirm={(role) => {
                    const ids = roleFor ?? [];
                    setRoleFor(null);
                    bulk(
                        `Rolle „${ROLE_LABEL[role]}"`,
                        ids,
                        (u) => (u.isSelf ? 'du selbst' : u.role === role ? 'hat sie schon' : null),
                        (u) => ({ ...u, role }),
                    );
                }}
            />
            <EnrolDialog
                key={enrolFor?.join() ?? 'none'}
                ids={enrolFor}
                onClose={() => setEnrolFor(null)}
                onConfirm={(offering) => {
                    const ids = enrolFor ?? [];
                    setEnrolFor(null);
                    bulk(
                        `Eingeschrieben in „${offering}"`,
                        ids,
                        (u) =>
                            u.role !== 'student'
                                ? 'keine Lernende'
                                : u.status !== 'active'
                                  ? STATUS_LABEL[u.status]
                                  : null,
                        (u) => ({ ...u, enrolments: u.enrolments + 1 }),
                    );
                }}
            />
            <ConfirmActionDialog
                open={removeFor !== null}
                onOpenChange={(o) => !o && setRemoveFor(null)}
                title={
                    removeFor?.length === 1
                        ? `${byIds(removeFor)[0]?.name} entfernen?`
                        : `${removeFor?.length ?? 0} Nutzer entfernen?`
                }
                description="Entfernte Nutzer können sich nicht mehr anmelden. Ihre Kurse, Zahlungen und Zertifikate bleiben erhalten, und du kannst sie jederzeit wiederherstellen. Endgültig löschen (DSGVO) geht einzeln auf der Nutzerseite."
                confirmLabel="Entfernen"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={() => {
                    const ids = removeFor ?? [];
                    setRemoveFor(null);
                    bulk(
                        'Entfernt',
                        ids,
                        (u) =>
                            u.isSelf
                                ? 'du selbst'
                                : u.status === 'deleted'
                                  ? 'schon entfernt'
                                  : null,
                        (u) => ({ ...u, status: 'deleted' }),
                    );
                }}
            />
        </AdminLayout>
    );
}

function RoleSelect({
    id,
    value,
    onChange,
}: {
    id: string;
    value: Role;
    onChange: (r: Role) => void;
}) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as Role)}>
            <SelectTrigger id={id}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                    <SelectItem key={r} value={r}>
                        {ROLE_LABEL[r]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

/** Invite one person: name, e-mail, role. Afterwards the link to share by hand if the mail does not arrive. */
function InviteDialog({
    open,
    onOpenChange,
    onInvite,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInvite: (u: { name: string; email: string; role: Role }) => void;
}) {
    const id = useId();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('student');
    const [sent, setSent] = useState(false);
    const [copied, setCopied] = useState(false);
    const valid = name.trim() !== '' && /.+@.+\..+/.test(email);
    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) {
                    setSent(false);
                    setName('');
                    setEmail('');
                }
            }}
        >
            <DialogContent closeLabel="Schließen">
                <DialogHeader>
                    <DialogTitle>{sent ? 'Einladung gesendet' : 'Jemanden einladen'}</DialogTitle>
                    <DialogDescription>
                        {sent
                            ? `${name} bekommt eine E-Mail mit einem Link, um ein Passwort zu setzen. Der Link gilt 7 Tage.`
                            : 'Die Person bekommt eine E-Mail mit einem Link, um ein Passwort zu setzen.'}
                    </DialogDescription>
                </DialogHeader>
                {sent ? (
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-link`}>
                            Kommt die E-Mail nicht an? Teile diesen Link direkt:
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id={`${id}-link`}
                                readOnly
                                value="https://akademie.example.de/einladung/7f3c…"
                            />
                            <Button variant="outline" onClick={() => setCopied(true)}>
                                <Copy aria-hidden="true" />
                                {copied ? 'Kopiert' : 'Kopieren'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-name`}>Vollständiger Name</Label>
                            <Input
                                id={`${id}-name`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-email`}>E-Mail</Label>
                            <Input
                                id={`${id}-email`}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-role`}>Rolle</Label>
                            <RoleSelect id={`${id}-role`} value={role} onChange={setRole} />
                        </div>
                    </div>
                )}
                <DialogFooter>
                    {sent ? (
                        <Button onClick={() => onOpenChange(false)}>Fertig</Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Abbrechen
                            </Button>
                            <Button
                                disabled={!valid}
                                onClick={() => {
                                    onInvite({ name, email, role });
                                    setSent(true);
                                }}
                            >
                                Einladung senden
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** Pick one role for everyone selected; making someone admin says what that means first. */
function RoleDialog({
    ids,
    onClose,
    onConfirm,
}: {
    ids: RowId[] | null;
    onClose: () => void;
    onConfirm: (r: Role) => void;
}) {
    const id = useId();
    const [role, setRole] = useState<Role>('student');
    return (
        <Dialog open={ids !== null} onOpenChange={(o) => !o && onClose()}>
            <DialogContent closeLabel="Schließen">
                <DialogHeader>
                    <DialogTitle>Rolle ändern</DialogTitle>
                    <DialogDescription>
                        {ids?.length === 1
                            ? 'Welche Rolle soll die Person haben?'
                            : `Welche Rolle sollen die ${ids?.length ?? 0} Personen haben?`}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor={id}>Rolle</Label>
                    <RoleSelect id={id} value={role} onChange={setRole} />
                </div>
                {role === 'admin' && (
                    <p className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning-tint-foreground">
                        Admins sehen und ändern alles: alle Nutzer, Zahlungen und Einstellungen der
                        Schule.
                    </p>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Abbrechen
                    </Button>
                    <Button onClick={() => onConfirm(role)}>
                        {role === 'admin' ? 'Ja, zu Admins machen' : 'Rolle ändern'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** Enrol everyone selected into one Ausführung, searchable by name. */
function EnrolDialog({
    ids,
    onClose,
    onConfirm,
}: {
    ids: RowId[] | null;
    onClose: () => void;
    onConfirm: (o: string) => void;
}) {
    const id = useId();
    const [offering, setOffering] = useState('');
    return (
        <Dialog open={ids !== null} onOpenChange={(o) => !o && onClose()}>
            <DialogContent closeLabel="Schließen">
                <DialogHeader>
                    <DialogTitle>In einen Kurs einschreiben</DialogTitle>
                    <DialogDescription>
                        Ohne Bezahlung, wie von Hand eingetragen. Wer kein Lernender ist oder nicht
                        aktiv, wird übersprungen.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor={id}>Ausführung</Label>
                    <Combobox
                        id={id}
                        value={offering}
                        options={OFFERINGS}
                        onChange={setOffering}
                        placeholder="Kurs und Termin wählen …"
                        searchPlaceholder="Suchen …"
                        emptyLabel="Keine Ausführung gefunden."
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Abbrechen
                    </Button>
                    <Button disabled={!offering} onClick={() => onConfirm(offering)}>
                        {ids?.length === 1 ? 'Einschreiben' : `${ids?.length ?? 0} einschreiben`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/**
 * The admin user list as it could look: the same shell as the course list,
 * with the Nutzer menu on the left (who needs you, by role, removed, and
 * the setup pages), the grid on the right. Click around — it responds, but
 * saves nothing.
 */
const meta: Meta<typeof UsersPage> = {
    title: 'Pages/Nutzerverwaltung',
    component: UsersPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.users')) localStorage.removeItem(k);
    },
};
export default meta;

export const Nutzerliste: StoryObj<typeof UsersPage> = {
    render: () => <UsersPage />,
};

/** The list at work: the pager, then approving everyone who waits (this story runs itself). */
export const FreigabeAblauf: StoryObj<typeof UsersPage> = {
    render: () => <UsersPage />,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const rows = () => canvasElement.querySelectorAll('tr[data-grid-row-id]').length;

        await step(
            'The first page holds 25 people, the pager says how many there are',
            async () => {
                await waitFor(() => expect(rows()).toBe(25));
                await expect(canvas.getByText(/^1–25 von \d+ Nutzern/)).toBeVisible();
            },
        );

        await step(
            '"Wartet auf Freigabe" narrows to them, and approving them empties it',
            async () => {
                await userEvent.click(canvas.getByRole('button', { name: /Wartet auf Freigabe/ }));
                await waitFor(() => expect(rows()).toBeGreaterThan(0));
                await userEvent.click(canvas.getByRole('checkbox', { name: 'Alle auswählen' }));
                await userEvent.click(canvas.getByRole('button', { name: 'Freigeben' }));
                await waitFor(() =>
                    expect(canvas.getByText(/^Freigegeben: \d+ erledigt/)).toBeVisible(),
                );
                await waitFor(() => expect(rows()).toBe(0));
            },
        );
    },
};

/** The invite dialog, open. After "Einladung senden" it shows the link to share by hand. */
export const Einladen: StoryObj<typeof UsersPage> = {
    render: () => <UsersPage openInvite />,
};
