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
    EllipsisVertical,
    Eye,
    Hourglass,
    KeyRound,
    ShieldCheck,
    MailX,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { Textarea } from '../../atoms/Textarea';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';
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
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../../organisms/Sheet';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../organisms/Table';
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

function UsersPage({
    openInvite = false,
    openUser = null,
}: {
    openInvite?: boolean;
    /** Opens this person's panel on first render. */
    openUser?: number | null;
}) {
    const [users, setUsers] = useState(() => makeUsers(COUNT));
    const [scope, setScope] = useState<Scope>({ kind: 'all' });
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [notice, setNotice] = useState<string | null>(null);
    const [inviting, setInviting] = useState(openInvite);
    const [openId, setOpenId] = useState<number | null>(openUser);
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
                            setOpenId(u.id);
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
            onSelect: (ids) => setOpenId(Number(ids[0])),
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

            <UserSheet
                key={openId ?? 'none'}
                user={users.find((u) => u.id === openId) ?? null}
                onClose={() => setOpenId(null)}
                onChange={(next) =>
                    setUsers((all) => all.map((u) => (u.id === next.id ? next : u)))
                }
            />
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

type Enrolment = {
    id: number;
    course: string;
    offering: string;
    status: 'active' | 'completed' | 'dropped';
    enrolledAt: string;
    doneAt: string | null;
    payment: string;
};
const ENROLMENT_STATUS = {
    active: ['Läuft', 'success'],
    completed: ['Abgeschlossen', 'neutral'],
    dropped: ['Abgemeldet', 'muted'],
} as const;
const EXAMPLE_ENROLMENTS: Enrolment[] = [
    {
        id: 1,
        course: 'Arabisch für Anfänger',
        offering: 'Herbst 2026 · Berlin',
        status: 'active',
        enrolledAt: '02.09.2026',
        doneAt: null,
        payment: '120,00 € bezahlt',
    },
    {
        id: 2,
        course: 'Tajwid Grundlagen',
        offering: 'Frühjahr 2026 · Online',
        status: 'completed',
        enrolledAt: '12.02.2026',
        doneAt: '30.05.2026',
        payment: '90,00 € bezahlt',
    },
    {
        id: 3,
        course: 'Offene Sprechstunde',
        offering: 'Laufend',
        status: 'dropped',
        enrolledAt: '08.01.2026',
        doneAt: '20.01.2026',
        payment: 'kostenlos',
    },
];

/** A titled part of the panel: a heading, one line on what it is, an optional action. */
function PanelSection({
    title,
    text,
    action,
    children,
}: {
    title: string;
    text?: string;
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

/** A setting with its explanation on the left and its button on the right. */
function PanelRow({
    title,
    text,
    badge,
    action,
}: {
    title: string;
    text: string;
    badge?: ReactNode;
    action: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium">
                    {title}
                    {badge}
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
            </div>
            <div className="shrink-0">{action}</div>
        </div>
    );
}

type Confirm = null | 'remove' | 'password' | 'twofactor' | { drop: number } | { note: number };

/**
 * One person, in a wide panel from the right over the list: who they are,
 * what their status needs from you, and everything else below — profile,
 * courses, notes, history, sign-in security, the GDPR corner. Closing it
 * leaves the list exactly as it was.
 */
function UserSheet({
    user,
    onClose,
    onChange,
}: {
    user: UserRow | null;
    onClose: () => void;
    onChange: (u: UserRow) => void;
}) {
    const id = useId();
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [phone, setPhone] = useState(user?.phone ?? '');
    const [city, setCity] = useState(user?.city ?? '');
    const [saved, setSaved] = useState({ name, email, phone, city });
    const [enrolments, setEnrolments] = useState(
        user?.role === 'student' && (user.status === 'active' || user.status === 'deleted')
            ? EXAMPLE_ENROLMENTS
            : [],
    );
    const [notes, setNotes] = useState([
        {
            id: 1,
            text: 'Hat am 12.09. wegen Login-Problemen angerufen; Passwort-Link geschickt.',
            by: 'Amina Berger',
            at: '12.09.2026, 10:14',
        },
    ]);
    const [draft, setDraft] = useState('');
    const [exportState, setExportState] = useState<'none' | 'preparing' | 'ready'>('none');
    const [notice, setNotice] = useState<string | null>(null);
    const [confirm, setConfirm] = useState<Confirm>(null);
    const [erasing, setErasing] = useState(false);
    const [eraseText, setEraseText] = useState('');
    const [viewAs, setViewAs] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [offering, setOffering] = useState('');
    if (!user) return null;

    const twoFactor = user.id % 2 === 1;
    const first = user.name.split(' ')[0];
    const setStatus = (status: Status) => onChange({ ...user, status });
    const dirty = JSON.stringify(saved) !== JSON.stringify({ name, email, phone, city });

    const banner = {
        active: null,
        invited: {
            warn: false,
            text: `Eingeladen am ${user.invitedAt ? formatDate(user.invitedAt) : '—'} — noch nicht angenommen. Der Link gilt 7 Tage.`,
            actions: (
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNotice('Einladungslink kopiert')}
                    >
                        <Copy aria-hidden="true" /> Link kopieren
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNotice('Einladung erneut gesendet (neuer 7-Tage-Link)')}
                    >
                        Erneut senden
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setStatus('deleted')}>
                        Einladung abbrechen
                    </Button>
                </>
            ),
        },
        expired: {
            warn: true,
            text: 'Die Einladung ist abgelaufen, ohne angenommen zu werden.',
            actions: (
                <Button
                    size="sm"
                    onClick={() =>
                        onChange({ ...user, status: 'invited', invitedAt: '2026-09-30' })
                    }
                >
                    Neu einladen
                </Button>
            ),
        },
        pending: {
            warn: true,
            text: `${first} hat sich selbst registriert und wartet auf deine Freigabe. Bis dahin ist keine Anmeldung möglich.`,
            actions: (
                <>
                    <Button size="sm" onClick={() => setStatus('active')}>
                        Freigeben
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirm('remove')}>
                        Ablehnen
                    </Button>
                </>
            ),
        },
        deleted: {
            warn: false,
            text: 'Entfernt — kann sich nicht mehr anmelden. Kurse, Zahlungen und Zertifikate sind noch da.',
            actions: (
                <>
                    <Button size="sm" onClick={() => setStatus('active')}>
                        Wiederherstellen
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setErasing(true)}>
                        Endgültig löschen …
                    </Button>
                </>
            ),
        },
    }[user.status];

    const facts = [
        ['Mitglied seit', '08.01.2026'],
        ['Zuletzt aktiv', user.lastSeen ? formatDate(user.lastSeen) : 'nie'],
        [
            'Kurse',
            `${enrolments.filter((e) => e.status === 'active').length} laufend, ${enrolments.length} insgesamt`,
        ],
        [
            'Bezahlt',
            user.paidOrders && user.status !== 'pending'
                ? `${user.paidOrders * 105},00 € in ${user.paidOrders} Bestellungen`
                : 'nichts',
        ],
    ];

    return (
        <Sheet open onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(56rem,92vw)] max-w-none gap-0 p-0"
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <InitialsAvatar name={user.name} size="lg" colored />
                        <div className="min-w-0 flex-1">
                            <SheetTitle className="text-2xl tracking-tight">{user.name}</SheetTitle>
                            <SheetDescription>{user.email}</SheetDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge tone={STATUS_TONE[user.status]} dot>
                                    {STATUS_LABEL[user.status]}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`${id}-role`} className="sr-only">
                                Rolle
                            </Label>
                            <Select
                                value={user.role}
                                disabled={user.isSelf}
                                onValueChange={(v) => {
                                    onChange({ ...user, role: v as Role });
                                    setNotice(`Rolle geändert: ${ROLE_LABEL[v as Role]}`);
                                }}
                            >
                                <SelectTrigger id={`${id}-role`} className="w-36">
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
                            <Button
                                variant="outline"
                                disabled={user.status !== 'active' || user.isSelf}
                                onClick={() => setViewAs(true)}
                            >
                                <Eye aria-hidden="true" /> Als {first} ansehen
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <IconButton
                                        label="Weitere Aktionen"
                                        icon={<EllipsisVertical aria-hidden="true" />}
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => setConfirm('password')}>
                                        <KeyRound aria-hidden="true" /> Link zum Passwort-Setzen
                                        senden
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={!twoFactor}
                                        onSelect={() => setConfirm('twofactor')}
                                    >
                                        <ShieldCheck aria-hidden="true" /> Anmeldung in zwei
                                        Schritten zurücksetzen
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setEnrolling(true)}>
                                        <ListPlus aria-hidden="true" /> In einen Kurs einschreiben
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {user.status === 'deleted' ? (
                                        <DropdownMenuItem onSelect={() => setStatus('active')}>
                                            <ArchiveRestore aria-hidden="true" /> Wiederherstellen
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem
                                            disabled={user.isSelf}
                                            className="text-destructive-tint-foreground"
                                            onSelect={() => setConfirm('remove')}
                                        >
                                            <Trash2 aria-hidden="true" /> Entfernen …
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        {facts.map(([label, value]) => (
                            <div key={label} className="flex gap-1.5">
                                <dt className="text-muted-foreground">{label}</dt>
                                <dd className="font-medium">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    {banner && (
                        <div
                            role="status"
                            className={
                                banner.warn
                                    ? 'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-tint-foreground'
                                    : 'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm'
                            }
                        >
                            <span>{banner.text}</span>
                            <span className="flex gap-2">{banner.actions}</span>
                        </div>
                    )}
                    {notice && (
                        <p role="status" className="text-sm text-muted-foreground">
                            {notice}
                        </p>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <PanelSection
                        title="Profil"
                        text="Was die Person selbst auch sieht und ändern kann. Eine neue E-Mail-Adresse muss sie bestätigen."
                        action={
                            <Button
                                size="sm"
                                disabled={!dirty}
                                onClick={() => {
                                    setSaved({ name, email, phone, city });
                                    onChange({ ...user, name, email, phone, city });
                                    setNotice(
                                        email !== saved.email
                                            ? 'Gespeichert — Bestätigungs-Mail an die neue Adresse gesendet'
                                            : 'Gespeichert',
                                    );
                                }}
                            >
                                Speichern
                            </Button>
                        }
                    >
                        <div className="grid grid-cols-2 gap-4">
                            {(
                                [
                                    ['name', 'Name', name, setName],
                                    ['email', 'E-Mail', email, setEmail],
                                    ['phone', 'Telefon', phone, setPhone],
                                    ['city', 'Stadt', city, setCity],
                                ] as const
                            ).map(([key, label, value, set]) => (
                                <div key={key} className="grid gap-2">
                                    <Label htmlFor={`${id}-${key}`}>{label}</Label>
                                    <Input
                                        id={`${id}-${key}`}
                                        value={value}
                                        onChange={(e) => set(e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Telefon und Stadt sind Profilfelder deiner Schule (Nutzer ›
                            Profilfelder).
                        </p>
                    </PanelSection>

                    <PanelSection
                        title="Kurse"
                        text="Jede Ausführung, in der die Person war oder ist."
                        action={
                            <Button size="sm" variant="outline" onClick={() => setEnrolling(true)}>
                                <ListPlus aria-hidden="true" /> Einschreiben
                            </Button>
                        }
                    >
                        {enrolments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Noch in keinem Kurs.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kurs</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Eingeschrieben</TableHead>
                                        <TableHead>Beendet</TableHead>
                                        <TableHead>Zahlung</TableHead>
                                        <TableHead>
                                            <span className="sr-only">Aktionen</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enrolments.map((e) => (
                                        <TableRow key={e.id}>
                                            <TableCell>
                                                <a
                                                    href={`#/admin/courses/${e.id}`}
                                                    className="font-medium underline-offset-4 hover:underline"
                                                >
                                                    {e.course}
                                                </a>
                                                <div className="text-xs text-muted-foreground">
                                                    {e.offering}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge tone={ENROLMENT_STATUS[e.status][1]} dot>
                                                    {ENROLMENT_STATUS[e.status][0]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{e.enrolledAt}</TableCell>
                                            <TableCell>{e.doneAt ?? '—'}</TableCell>
                                            <TableCell>{e.payment}</TableCell>
                                            <TableCell className="text-end">
                                                {e.status === 'active' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => setConfirm({ drop: e.id })}
                                                    >
                                                        Abmelden
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </PanelSection>

                    <PanelSection title="Notizen" text="Nur für Admins. Die Person sieht sie nie.">
                        <Label htmlFor={`${id}-note`} className="sr-only">
                            Neue Notiz
                        </Label>
                        <Textarea
                            id={`${id}-note`}
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder="z. B. Hat wegen der Rechnung angerufen; Kopie per E-Mail geschickt."
                        />
                        <div>
                            <Button
                                size="sm"
                                disabled={!draft.trim()}
                                onClick={() => {
                                    setNotes((n) => [
                                        {
                                            id: n.length + 100,
                                            text: draft.trim(),
                                            by: 'Amina Berger',
                                            at: 'gerade eben',
                                        },
                                        ...n,
                                    ]);
                                    setDraft('');
                                }}
                            >
                                Notiz hinzufügen
                            </Button>
                        </div>
                        <ul className="flex flex-col divide-y divide-border">
                            {notes.map((n) => (
                                <li
                                    key={n.id}
                                    className="flex items-start justify-between gap-4 py-3"
                                >
                                    <div>
                                        <p className="text-sm">{n.text}</p>
                                        <p className="text-xs text-muted-foreground">
                                            von {n.by} · {n.at}
                                        </p>
                                    </div>
                                    <IconButton
                                        label={`Notiz von ${n.by} löschen`}
                                        icon={<Trash2 aria-hidden="true" />}
                                        onClick={() => setConfirm({ note: n.id })}
                                    />
                                </li>
                            ))}
                            {notes.length === 0 && (
                                <li className="py-3 text-sm text-muted-foreground">
                                    Noch keine Notizen.
                                </li>
                            )}
                        </ul>
                    </PanelSection>

                    <PanelSection title="Verlauf">
                        <ol className="flex flex-col gap-2 text-sm">
                            {[
                                ['Konto angelegt', '08.01.2026, 09:12'],
                                ['Eingeladen von Amina Berger', '08.01.2026, 09:12'],
                                ['E-Mail bestätigt', '08.01.2026, 18:03'],
                                ['Freigegeben', '08.01.2026, 18:03'],
                                ...(user.status === 'deleted'
                                    ? [['Entfernt von Amina Berger', '30.09.2026, 11:02']]
                                    : []),
                            ].map(([what, when]) => (
                                <li key={what} className="flex justify-between gap-4">
                                    <span>{what}</span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {when}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </PanelSection>

                    <PanelSection title="Anmeldung & Sicherheit">
                        <div className="flex flex-col divide-y divide-border">
                            <PanelRow
                                title="Anmeldung in zwei Schritten"
                                text={
                                    twoFactor
                                        ? 'Eingerichtet. Zurücksetzen, wenn das Handy verloren ist.'
                                        : 'Nicht eingerichtet.'
                                }
                                badge={
                                    <Badge tone={twoFactor ? 'success' : 'muted'} dot>
                                        {twoFactor ? 'Aktiv' : 'Aus'}
                                    </Badge>
                                }
                                action={
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={!twoFactor}
                                        onClick={() => setConfirm('twofactor')}
                                    >
                                        Zurücksetzen
                                    </Button>
                                }
                            />
                            <PanelRow
                                title="Passwort"
                                text="Du siehst es nie. Schick einen Link, mit dem ein neues gesetzt wird."
                                action={
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setConfirm('password')}
                                    >
                                        Link senden
                                    </Button>
                                }
                            />
                            <PanelRow
                                title="Als diese Person ansehen"
                                text="Die App so sehen, wie sie sie sieht — nur lesend, protokolliert, mit einem Banner, bis du aufhörst."
                                action={
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={user.status !== 'active' || user.isSelf}
                                        onClick={() => setViewAs(true)}
                                    >
                                        Ansehen
                                    </Button>
                                }
                            />
                        </div>
                    </PanelSection>

                    <PanelSection
                        title="Daten (DSGVO)"
                        text="Auskunft und Löschung nach Art. 15, 17 und 20."
                    >
                        <div className="flex flex-col divide-y divide-border">
                            <PanelRow
                                title="Datenexport"
                                text={
                                    exportState === 'none'
                                        ? 'Noch kein Export angefordert.'
                                        : exportState === 'preparing'
                                          ? 'Export wird vorbereitet …'
                                          : 'Fertig — der Download gilt bis 07.10.2026.'
                                }
                                action={
                                    exportState === 'ready' ? (
                                        <Button
                                            size="sm"
                                            onClick={() => setNotice('Export heruntergeladen')}
                                        >
                                            <Download aria-hidden="true" /> Herunterladen (ZIP)
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={exportState === 'preparing'}
                                            onClick={() => {
                                                setExportState('preparing');
                                                setTimeout(() => setExportState('ready'), 1500);
                                            }}
                                        >
                                            Daten exportieren
                                        </Button>
                                    )
                                }
                            />
                            <PanelRow
                                title="Endgültig löschen"
                                text="Name, E-Mail und alle persönlichen Angaben werden unwiderruflich gelöscht. Rechnungen bleiben (gesetzliche Aufbewahrung), aber ohne Namen."
                                action={
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        disabled={user.isSelf}
                                        onClick={() => setErasing(true)}
                                    >
                                        Endgültig löschen …
                                    </Button>
                                }
                            />
                        </div>
                    </PanelSection>
                </div>

                <ConfirmActionDialog
                    open={confirm !== null}
                    onOpenChange={(o) => !o && setConfirm(null)}
                    title={
                        confirm === 'remove'
                            ? `${user.name} entfernen?`
                            : confirm === 'password'
                              ? 'Link zum Passwort-Setzen senden?'
                              : confirm === 'twofactor'
                                ? 'Anmeldung in zwei Schritten zurücksetzen?'
                                : confirm && 'drop' in confirm
                                  ? 'Aus dem Kurs abmelden?'
                                  : 'Notiz löschen?'
                    }
                    description={
                        confirm === 'remove'
                            ? 'Keine Anmeldung mehr möglich. Kurse, Zahlungen und Zertifikate bleiben erhalten; du kannst jederzeit wiederherstellen.'
                            : confirm === 'password'
                              ? `${user.email} bekommt eine E-Mail mit einem Link, der eine Stunde gilt.`
                              : confirm === 'twofactor'
                                ? `Bis zur Neueinrichtung genügt für ${user.email} das Passwort allein. Wir schicken eine E-Mail darüber.`
                                : confirm && 'drop' in confirm
                                  ? 'Der Zugang zu den Inhalten dieser Ausführung endet. Eine Zahlung wird dadurch nicht erstattet.'
                                  : 'Die Notiz ist danach weg.'
                    }
                    confirmLabel={
                        confirm === 'password'
                            ? 'Senden'
                            : confirm === 'twofactor'
                              ? 'Zurücksetzen'
                              : confirm === 'remove'
                                ? 'Entfernen'
                                : confirm && 'drop' in confirm
                                  ? 'Abmelden'
                                  : 'Löschen'
                    }
                    cancelLabel="Abbrechen"
                    variant={confirm === 'password' ? 'default' : 'destructive'}
                    onConfirm={() => {
                        const c = confirm;
                        setConfirm(null);
                        if (c === 'remove') setStatus('deleted');
                        else if (c === 'password') setNotice('Link zum Passwort-Setzen gesendet');
                        else if (c === 'twofactor')
                            setNotice('Anmeldung in zwei Schritten zurückgesetzt');
                        else if (c && 'drop' in c)
                            setEnrolments((es) =>
                                es.map((e) =>
                                    e.id === c.drop
                                        ? { ...e, status: 'dropped', doneAt: '30.09.2026' }
                                        : e,
                                ),
                            );
                        else if (c && 'note' in c)
                            setNotes((ns) => ns.filter((n) => n.id !== c.note));
                    }}
                />

                <Dialog open={erasing} onOpenChange={setErasing}>
                    <DialogContent closeLabel="Schließen">
                        <DialogHeader>
                            <DialogTitle>{user.name} endgültig löschen?</DialogTitle>
                            <DialogDescription>
                                Das lässt sich nicht rückgängig machen. Name, E-Mail, Profilfelder,
                                Notizen und Anmeldedaten werden gelöscht. Rechnungen bleiben ohne
                                Namen erhalten.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-erase`}>
                                Tippe den Namen zur Bestätigung: {user.name}
                            </Label>
                            <Input
                                id={`${id}-erase`}
                                value={eraseText}
                                onChange={(e) => setEraseText(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setErasing(false)}>
                                Abbrechen
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={eraseText !== user.name}
                                onClick={() => {
                                    setErasing(false);
                                    onClose();
                                }}
                            >
                                Endgültig löschen
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={viewAs} onOpenChange={setViewAs}>
                    <DialogContent closeLabel="Schließen">
                        <DialogHeader>
                            <DialogTitle>Als {user.name} ansehen?</DialogTitle>
                            <DialogDescription>
                                Du siehst die App, wie diese Person sie sieht — nur lesend. Alles
                                wird protokolliert, und ein Banner bleibt oben, bis du „Beenden"
                                drückst.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-code`}>Code aus deiner App</Label>
                            <Input id={`${id}-code`} inputMode="numeric" placeholder="123 456" />
                            <p className="text-xs text-muted-foreground">
                                Dein Konto hat die Anmeldung in zwei Schritten — bestätige kurz,
                                dass du es bist.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setViewAs(false)}>
                                Abbrechen
                            </Button>
                            <Button
                                onClick={() => {
                                    setViewAs(false);
                                    setNotice(`Du siehst die App jetzt als ${user.name}`);
                                }}
                            >
                                Ansehen
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <EnrolDialog
                    ids={enrolling ? [user.id] : null}
                    onClose={() => setEnrolling(false)}
                    onConfirm={(o) => {
                        const [course, off] = o.split(' · ');
                        setEnrolments((es) => [
                            {
                                id: es.length + 10,
                                course: course!,
                                offering: off ?? '',
                                status: 'active',
                                enrolledAt: '30.09.2026',
                                doneAt: null,
                                payment: 'kostenlos',
                            },
                            ...es,
                        ]);
                        setEnrolling(false);
                        setOffering('');
                        void offering;
                    }}
                />
            </SheetContent>
        </Sheet>
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

/** A person's panel, open over the list: an active learner with courses and a note. */
export const NutzerOffen: StoryObj<typeof UsersPage> = {
    render: () => <UsersPage openUser={3} />,
};

/** Someone waiting for approval: the panel leads with "Freigeben". */
export const NutzerWartetAufFreigabe: StoryObj<typeof UsersPage> = {
    render: () => <UsersPage openUser={6} />,
};

/** A removed person: restore, or erase for good after typing the name. */
export const NutzerEntfernt: StoryObj<typeof UsersPage> = {
    render: () => <UsersPage openUser={12} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const panel = await body.findByRole('dialog');
        await expect(within(panel).getByRole('status')).toHaveTextContent(/Entfernt/);
        const name = within(panel).getByRole('heading', { level: 2 }).textContent ?? '';
        await userEvent.click(
            within(panel).getAllByRole('button', { name: /Endgültig löschen/ })[0]!,
        );
        const dialogs = await body.findAllByRole('dialog');
        const confirm = dialogs.at(-1)!;
        const erase = within(confirm).getByRole('button', { name: 'Endgültig löschen' });
        await expect(erase).toBeDisabled();
        await userEvent.type(within(confirm).getByRole('textbox'), name);
        await expect(erase).toBeEnabled();
        await userEvent.click(within(confirm).getByRole('button', { name: 'Abbrechen' }));
    },
};
