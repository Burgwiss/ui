import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
    AlarmClock,
    BadgePercent,
    BookOpen,
    CalendarClock,
    ChartColumn,
    CircleAlert,
    Copy,
    CreditCard,
    Download,
    EllipsisVertical,
    FileText,
    Gift,
    HandCoins,
    House,
    Inbox,
    Landmark,
    Palette,
    Plus,
    ReceiptEuro,
    RefreshCw,
    RotateCcw,
    Settings2,
    SlidersHorizontal,
    Trash2,
    Undo2,
    UserRound,
    Users as UsersIcon,
    Wallet,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import type { GridColumn } from '../../hooks/grid/types';
import type { GridActionItem, RowId } from '../../hooks/gridActions';
import { useGrid, type GridApi } from '../../hooks/useGrid';
import { cn } from '../../lib/cn';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../organisms/Table';
import { AdminLayout } from '../../templates/AdminLayout';
import { GridPage } from '../../templates/GridPage';

/**
 * PAGE PROTOTYPE — the Zahlungen area of the admin (`/admin/payments` in
 * Burgwiss), in the same shell as Kurse and Nutzer: the rail, the area's menu,
 * then the page. Orders are the heart of it; one order opens as a wide panel
 * from the right, like a person does. Withdrawals, coupons and the revenue
 * report sit in the same menu. Non-functional: example content, no server.
 */

// ---------------------------------------------------------------------------
// Example data
// ---------------------------------------------------------------------------

type Status =
    | 'paid'
    | 'awaiting_payment'
    | 'committed'
    | 'past_due'
    | 'refunded'
    | 'partially_refunded'
    | 'cancelled';
type Provider = 'stripe' | 'paypal' | 'mollie' | 'offline';
type Plan = 'once' | 'installments' | 'subscription';

type Order = {
    id: number;
    number: string;
    createdAt: string;
    buyer: string;
    email: string;
    company: string | null;
    course: string;
    offering: string;
    /** In cents. */
    amount: number;
    refunded: number;
    discount: number;
    coupon: string | null;
    voucher: string | null;
    status: Status;
    provider: Provider;
    plan: Plan;
    cyclesCharged: number;
    cyclesTotal: number;
    seats: number;
    invoice: string | null;
};

const STATUS: Record<
    Status,
    { label: string; tone: 'success' | 'warning' | 'neutral' | 'muted' | 'destructive' }
> = {
    paid: { label: 'Bezahlt', tone: 'success' },
    awaiting_payment: { label: 'Wartet auf Zahlung', tone: 'warning' },
    committed: { label: 'Verbindlich reserviert', tone: 'neutral' },
    past_due: { label: 'Zahlung überfällig', tone: 'destructive' },
    refunded: { label: 'Erstattet', tone: 'muted' },
    partially_refunded: { label: 'Teilweise erstattet', tone: 'muted' },
    cancelled: { label: 'Storniert', tone: 'muted' },
};
const PROVIDER: Record<Provider, string> = {
    stripe: 'Stripe',
    paypal: 'PayPal',
    mollie: 'Mollie',
    offline: 'Auf Rechnung',
};
const PLAN: Record<Plan, string> = {
    once: 'Einmalzahlung',
    installments: 'Raten',
    subscription: 'Abo',
};

const BUYERS = [
    'Amina Berger',
    'Yusuf Okafor',
    'Leonie Weber',
    'Omar Krüger',
    'Hanna Haddad',
    'Bilal Rahman',
    'Sara Nasser',
    'Jonas Yılmaz',
    'Maryam Schneider',
    'Emre Demir',
    'Lea Berger',
    'Karim Weber',
];
const COURSES: [string, string, number][] = [
    ['Arabisch für Anfänger', 'Herbst 2026 · Berlin', 24000],
    ['Tajwid Grundlagen', 'Winter 2026 · Online', 18000],
    ['Hifz-Kreis: Juz ʿAmma', 'Samstags · Köln', 9000],
    ['Fiqh des Alltags', 'Online, Abends', 12000],
    ['Arabische Grammatik intensiv', 'Frühjahr 2027 · Berlin', 36000],
];
const STATUSES: Status[] = [
    'paid',
    'paid',
    'paid',
    'awaiting_payment',
    'paid',
    'committed',
    'past_due',
    'paid',
    'partially_refunded',
    'paid',
    'refunded',
    'cancelled',
];
const PROVIDERS: Provider[] = ['stripe', 'stripe', 'paypal', 'offline', 'mollie'];
const TODAY = new Date('2026-09-30T12:00:00');

/** Deterministic example orders — the same every render, so screenshots stay stable. */
function makeOrders(count: number): Order[] {
    return Array.from({ length: count }, (_, i) => {
        const [course, offering, price] = COURSES[i % COURSES.length]!;
        const status = STATUSES[i % STATUSES.length]!;
        const provider =
            status === 'awaiting_payment' ? 'offline' : PROVIDERS[i % PROVIDERS.length]!;
        const plan: Plan =
            provider === 'offline'
                ? 'once'
                : i % 7 === 3
                  ? 'installments'
                  : i % 11 === 6
                    ? 'subscription'
                    : 'once';
        const coupon = i % 6 === 2 ? 'HERBST10' : null;
        const discount = coupon ? price / 10 : i % 9 === 4 ? 2000 : 0;
        const amount = price - discount;
        const date = new Date(TODAY);
        date.setDate(date.getDate() - Math.floor(i * 1.3));
        const company = i % 8 === 3 ? 'Moschee-Verein Köln e. V.' : null;
        return {
            id: i + 1,
            number: `B-2026-${String(300 - i).padStart(4, '0')}`,
            createdAt: date.toISOString().slice(0, 10),
            buyer: BUYERS[i % BUYERS.length]!,
            email: `${BUYERS[i % BUYERS.length]!.toLowerCase().replace(/ı/g, 'i').replace(/ü/g, 'ue').replace(/\s+/g, '.')}@example.de`,
            company,
            course,
            offering,
            amount,
            refunded:
                status === 'refunded'
                    ? amount
                    : status === 'partially_refunded'
                      ? Math.round(amount / 2)
                      : 0,
            discount,
            coupon,
            voucher: i % 10 === 7 ? 'Bildungsgutschein · Agentur für Arbeit' : null,
            status,
            provider,
            plan,
            cyclesCharged: plan === 'once' ? 1 : status === 'past_due' ? 2 : 3,
            cyclesTotal: plan === 'once' ? 1 : plan === 'installments' ? 6 : 12,
            seats: company ? 3 : 1,
            invoice:
                status === 'committed' || status === 'cancelled'
                    ? null
                    : `R-2026-${String(900 - i).padStart(5, '0')}`,
        };
    });
}

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const money = (cents: number) => euro.format(cents / 100);
const dateFmt = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
const formatDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00`));

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
// The shell and the area's menu
// ---------------------------------------------------------------------------

type View =
    | { kind: 'orders'; status: Status | 'all' }
    | { kind: 'withdrawals' }
    | { kind: 'coupons' }
    | { kind: 'rules' }
    | { kind: 'funding' }
    | { kind: 'reports' }
    | { kind: 'settings' };

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
                        onClick={linkTo('Pages/Admin/Kursverwaltung', 'Kursliste')}
                    />
                    <AppRailItem
                        icon={UsersIcon}
                        label="Nutzer"
                        onClick={linkTo('Pages/Admin/Nutzerverwaltung', 'Nutzerliste')}
                    />
                    <AppRailItem icon={CreditCard} label="Zahlungen" active />
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

function PaymentsMenu({
    view,
    onView,
    orders,
}: {
    view: View;
    onView: (v: View) => void;
    orders: Order[];
}) {
    const n = (s: Status) => orders.filter((o) => o.status === s).length;
    const same = (v: View) => JSON.stringify(v) === JSON.stringify(view);
    const item = (v: View, icon: ReactNode, label: string, count?: number, attention = false) => (
        <SidebarMenuItem key={JSON.stringify(v)}>
            <SidebarMenuButton active={same(v)} onClick={() => onView(v)}>
                {icon}
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
            label="Zahlungen"
            resize={{
                label: 'Menü verbreitern oder verschmälern',
                storageKey: 'storybook.page.payments',
            }}
        >
            <SidebarHeader>
                <div className="px-2 text-lg font-semibold tracking-tight">Zahlungen</div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {item(
                            { kind: 'orders', status: 'all' },
                            <Inbox aria-hidden="true" />,
                            'Alle Bestellungen',
                            orders.length,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Braucht dich">
                    <SidebarMenu>
                        {item(
                            { kind: 'orders', status: 'past_due' },
                            <AlarmClock aria-hidden="true" />,
                            'Zahlung überfällig',
                            n('past_due'),
                            true,
                        )}
                        {item(
                            { kind: 'orders', status: 'awaiting_payment' },
                            <Landmark aria-hidden="true" />,
                            'Wartet auf Überweisung',
                            n('awaiting_payment'),
                            true,
                        )}
                        {item(
                            { kind: 'withdrawals' },
                            <Undo2 aria-hidden="true" />,
                            'Widerrufe & Stornos',
                            WITHDRAWALS.filter((w) => w.state === 'open').length,
                            true,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Bestellungen">
                    <SidebarMenu>
                        {item(
                            { kind: 'orders', status: 'paid' },
                            <ReceiptEuro aria-hidden="true" />,
                            'Bezahlt',
                            n('paid'),
                        )}
                        {item(
                            { kind: 'orders', status: 'committed' },
                            <CalendarClock aria-hidden="true" />,
                            'Reserviert',
                            n('committed'),
                        )}
                        {item(
                            { kind: 'orders', status: 'refunded' },
                            <RotateCcw aria-hidden="true" />,
                            'Erstattet',
                            n('refunded') + n('partially_refunded'),
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Preise">
                    <SidebarMenu>
                        {item(
                            { kind: 'coupons' },
                            <BadgePercent aria-hidden="true" />,
                            'Gutscheine',
                            COUPONS.length,
                        )}
                        {item(
                            { kind: 'rules' },
                            <SlidersHorizontal aria-hidden="true" />,
                            'Preisregeln',
                            3,
                        )}
                        {item(
                            { kind: 'funding' },
                            <HandCoins aria-hidden="true" />,
                            'Förderung',
                            2,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Auswerten & einrichten">
                    <SidebarMenu>
                        {item({ kind: 'reports' }, <ChartColumn aria-hidden="true" />, 'Umsatz')}
                        {item(
                            { kind: 'settings' },
                            <Settings2 aria-hidden="true" />,
                            'Einstellungen',
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

function OrdersView({
    orders,
    status,
    onChange,
    openOrder,
    onOpen,
}: {
    orders: Order[];
    status: Status | 'all';
    onChange: (o: Order) => void;
    openOrder: number | null;
    onOpen: (id: number | null) => void;
}) {
    const [search, setSearch] = useState('');
    const [notice, setNotice] = useState<string | null>(null);
    const [refundFor, setRefundFor] = useState<Order | null>(null);
    const gridRef = useRef<GridApi<Order> | null>(null);

    const shown = orders.filter(
        (o) =>
            (status === 'all' ||
                o.status === status ||
                (status === 'refunded' && o.status === 'partially_refunded')) &&
            `${o.number} ${o.buyer} ${o.email} ${o.course} ${o.company ?? ''}`
                .toLowerCase()
                .includes(search.trim().toLowerCase()),
    );
    const byIds = (ids: RowId[]) => orders.filter((o) => ids.includes(o.id));

    const columns: GridColumn<Order>[] = useMemo(
        () => [
            {
                id: 'number',
                header: 'Bestellung',
                pinned: 'left',
                hideable: false,
                width: 175,
                cell: (o) => (
                    <a
                        href={`#/admin/payments/orders/${o.number}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(o.id);
                        }}
                        className="font-mono text-[13px] font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        {o.number}
                    </a>
                ),
            },
            {
                id: 'createdAt',
                header: 'Datum',
                width: 130,
                cell: (o) => formatDate(o.createdAt),
                filter: { type: 'date' },
            },
            {
                id: 'buyer',
                header: 'Käufer',
                width: 230,
                cell: (o) => (
                    <span className="flex min-w-0 flex-col">
                        <span className="truncate">{o.buyer}</span>
                        {o.company && (
                            <span className="truncate text-xs text-muted-foreground">
                                {o.company}
                            </span>
                        )}
                    </span>
                ),
                exportValue: (o) => (o.company ? `${o.buyer} (${o.company})` : o.buyer),
                filter: { type: 'text' },
            },
            {
                id: 'course',
                header: 'Kurs',
                width: 260,
                groupable: true,
                cell: (o) => (
                    <span className="flex min-w-0 flex-col">
                        <span className="truncate">{o.course}</span>
                        <span className="truncate text-xs text-muted-foreground">{o.offering}</span>
                    </span>
                ),
                filter: { type: 'choice', options: COURSES.map(([c]) => ({ value: c, label: c })) },
            },
            {
                id: 'amount',
                header: 'Betrag',
                align: 'right',
                width: 130,
                aggregate: 'sum',
                formatAggregate: (n) => money(n),
                cell: (o) => (
                    <span className="tabular-nums">
                        {money(o.amount)}
                        {o.refunded > 0 && (
                            <span className="block text-xs text-muted-foreground">
                                − {money(o.refunded)}
                            </span>
                        )}
                    </span>
                ),
                exportValue: (o) => (o.amount / 100).toFixed(2),
                filter: { type: 'number' },
            },
            {
                id: 'status',
                header: 'Status',
                width: 210,
                groupable: true,
                cell: (o) => (
                    <Badge tone={STATUS[o.status].tone} dot>
                        {STATUS[o.status].label}
                    </Badge>
                ),
                exportValue: (o) => STATUS[o.status].label,
                filter: {
                    type: 'choice',
                    options: Object.entries(STATUS).map(([value, s]) => ({
                        value,
                        label: s.label,
                    })),
                },
            },
            {
                id: 'plan',
                header: 'Zahlweise',
                width: 150,
                groupable: true,
                cell: (o) =>
                    o.plan === 'once' ? (
                        PLAN.once
                    ) : (
                        <span>
                            {PLAN[o.plan]}{' '}
                            <span className="text-muted-foreground tabular-nums">
                                {o.cyclesCharged}/{o.cyclesTotal}
                            </span>
                        </span>
                    ),
                exportValue: (o) => PLAN[o.plan],
                filter: {
                    type: 'choice',
                    options: Object.entries(PLAN).map(([value, label]) => ({ value, label })),
                },
            },
            {
                id: 'provider',
                header: 'Über',
                width: 140,
                groupable: true,
                cell: (o) => PROVIDER[o.provider],
                exportValue: (o) => PROVIDER[o.provider],
                filter: {
                    type: 'choice',
                    options: Object.entries(PROVIDER).map(([value, label]) => ({ value, label })),
                },
            },
            { id: 'coupon', header: 'Gutschein', width: 130, cell: (o) => o.coupon ?? '—' },
            { id: 'invoice', header: 'Rechnung', width: 150, cell: (o) => o.invoice ?? '—' },
        ],
        [onOpen],
    );

    const actions: GridActionItem[] = [
        {
            id: 'export',
            label: 'Als CSV exportieren',
            icon: <Download aria-hidden="true" />,
            group: 'io',
            shortcut: 'Mod+Shift+E',
            onSelect: () => setNotice(`${shown.length} Bestellungen als CSV exportiert`),
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
            icon: <FileText aria-hidden="true" />,
            when: ['one'],
            group: 'open',
            isDefault: true,
            shortcut: 'E',
            onSelect: (ids) => onOpen(Number(ids[0])),
        },
        {
            id: 'settle',
            label: 'Als bezahlt markieren',
            icon: <Landmark aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'state',
            disabled: (ids) => !byIds(ids).some((o) => o.status === 'awaiting_payment'),
            disabledReason: 'Nur für Bestellungen auf Rechnung, die auf die Überweisung warten',
            onSelect: (ids) => {
                const hit = byIds(ids).filter((o) => o.status === 'awaiting_payment');
                hit.forEach((o) => onChange({ ...o, status: 'paid' }));
                gridRef.current?.clear();
                setNotice(
                    `Als bezahlt markiert: ${hit.length} · übersprungen: ${ids.length - hit.length}`,
                );
            },
        },
        {
            id: 'refund',
            label: 'Erstatten …',
            icon: <RotateCcw aria-hidden="true" />,
            when: ['one'],
            group: 'state',
            disabled: (ids) =>
                !byIds(ids).some((o) => o.status === 'paid' || o.status === 'partially_refunded'),
            disabledReason: 'Nur bezahlte Bestellungen lassen sich erstatten',
            onSelect: (ids) => setRefundFor(byIds(ids)[0] ?? null),
        },
        {
            id: 'invoice',
            label: 'Rechnungen herunterladen (ZIP)',
            icon: <FileText aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'io2',
            disabled: (ids) => !byIds(ids).some((o) => o.invoice),
            disabledReason: 'Für diese Bestellungen gibt es noch keine Rechnung',
            onSelect: (ids) =>
                setNotice(
                    `${byIds(ids).filter((o) => o.invoice).length} Rechnungen heruntergeladen`,
                ),
        },
        {
            id: 'copy',
            label: 'Kopieren (für Excel)',
            icon: <Copy aria-hidden="true" />,
            when: ['one', 'many'],
            group: 'io2',
            shortcut: 'Mod+C',
            onSelect: (ids) => setNotice(`${ids.length} Bestellungen kopiert`),
        },
    ];

    const grid = useGrid<Order>({
        id: 'storybook.page.payments.orders',
        rows: shown,
        getRowId: (o) => o.id,
        columns,
        selection: 'multiple',
        actions,
        defaults: { hiddenColumns: ['coupon', 'invoice'] },
    });
    useEffect(() => {
        gridRef.current = grid;
    });

    // What came in this month, in one line — not a wall of cards.
    const month = orders.filter((o) => o.createdAt.startsWith('2026-09'));
    const inMonth = month
        .filter((o) => ['paid', 'partially_refunded'].includes(o.status))
        .reduce((s, o) => s + o.amount - o.refunded, 0);
    const open = orders
        .filter((o) => o.status === 'awaiting_payment' || o.status === 'past_due')
        .reduce((s, o) => s + o.amount, 0);
    const refunded = month.reduce((s, o) => s + o.refunded, 0);
    const summary = (
        <span className="flex flex-wrap items-center gap-x-5 gap-y-1 text-muted-foreground">
            <span>
                September:{' '}
                <span className="font-medium text-foreground tabular-nums">{money(inMonth)}</span>{' '}
                eingenommen
            </span>
            <span>
                <span className="font-medium text-foreground tabular-nums">{money(open)}</span>{' '}
                offen
            </span>
            <span>
                <span className="font-medium text-foreground tabular-nums">{money(refunded)}</span>{' '}
                erstattet
            </span>
            <span>
                <span className="font-medium text-foreground tabular-nums">{month.length}</span>{' '}
                Bestellungen
            </span>
        </span>
    );

    const order = orders.find((o) => o.id === openOrder) ?? null;
    return (
        <>
            <GridPage
                title="Bestellungen"
                offsetTop="0px"
                grid={grid}
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: 'Nummer, Name, E-Mail oder Kurs …',
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
                    ) : (
                        summary
                    )
                }
                footer={
                    <GridFooter
                        summary={`1–${grid.visibleRows.length} von ${shown.length} Bestellungen · Summe ${money(grid.visibleRows.reduce((s, o) => s + o.amount, 0))}`}
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
                        table: 'Bestellungen',
                        empty: 'Keine Bestellung passt dazu.',
                    }}
                    rowLabel={(o) => o.number}
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

            {order && (
                <OrderSheet
                    key={order.id}
                    order={order}
                    onClose={() => onOpen(null)}
                    onChange={onChange}
                    onRefund={() => setRefundFor(order)}
                />
            )}
            <RefundDialog
                key={refundFor?.id ?? 'none'}
                order={refundFor}
                onClose={() => setRefundFor(null)}
                onRefund={(o, cents) => {
                    const total = o.refunded + cents;
                    onChange({
                        ...o,
                        refunded: total,
                        status: total >= o.amount ? 'refunded' : 'partially_refunded',
                    });
                    setRefundFor(null);
                    setNotice(`${money(cents)} an ${o.buyer} erstattet — Stornorechnung erstellt`);
                }}
            />
        </>
    );
}

/** Refund all or part of an order; the payment provider pays it back and a credit note is written. */
function RefundDialog({
    order,
    onClose,
    onRefund,
}: {
    order: Order | null;
    onClose: () => void;
    onRefund: (o: Order, cents: number) => void;
}) {
    const id = useId();
    const left = order ? order.amount - order.refunded : 0;
    const [value, setValue] = useState((left / 100).toFixed(2).replace('.', ','));
    const cents = Math.round(Number(value.replace(',', '.')) * 100);
    const valid = Number.isFinite(cents) && cents > 0 && cents <= left;
    return (
        <Dialog open={order !== null} onOpenChange={(o) => !o && onClose()}>
            <DialogContent closeLabel="Schließen">
                <DialogHeader>
                    <DialogTitle>{order?.number} erstatten</DialogTitle>
                    <DialogDescription>
                        {order &&
                            `${PROVIDER[order.provider]} zahlt das Geld an ${order.buyer} zurück. Für die Buchhaltung entsteht eine Stornorechnung; die ursprüngliche Rechnung bleibt.`}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor={id}>Betrag (noch erstattbar: {money(left)})</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id={id}
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-40 tabular-nums"
                            aria-invalid={!valid || undefined}
                        />
                        <span className="text-sm text-muted-foreground">€</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setValue((left / 200).toFixed(2).replace('.', ','))}
                        >
                            Hälfte
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setValue((left / 100).toFixed(2).replace('.', ','))}
                        >
                            Alles
                        </Button>
                    </div>
                    {!valid && (
                        <p className="text-sm text-destructive-tint-foreground">
                            Zwischen 0,01 € und {money(left)}.
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Abbrechen
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={!valid}
                        onClick={() => order && onRefund(order, cents)}
                    >
                        {valid ? `${money(cents)} erstatten` : 'Erstatten'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Part({
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

/**
 * One order, in a wide panel over the list: what it is, what its status
 * needs from you, the lines with discounts and tax, the seats of a group
 * booking, every payment and refund, and the invoices.
 */
function OrderSheet({
    order,
    onClose,
    onChange,
    onRefund,
}: {
    order: Order;
    onClose: () => void;
    onChange: (o: Order) => void;
    onRefund: () => void;
}) {
    const [confirm, setConfirm] = useState<null | 'commitment' | 'subscription' | 'settle'>(null);
    const [note, setNote] = useState<string | null>(null);
    const net = Math.round(order.amount / 1.19);
    const vat = order.amount - net;
    const perCycle = Math.round(order.amount / order.cyclesTotal);

    const banner = (() => {
        switch (order.status) {
            case 'past_due':
                return {
                    warn: true,
                    text: `Rate ${order.cyclesCharged + 1} von ${order.cyclesTotal} (${money(perCycle)}) ist seit 5 Tagen überfällig. ${PROVIDER[order.provider]} versucht es am 03.10. noch einmal; nach dem dritten Fehlversuch endet der Zugang.`,
                    actions: (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    setNote(`Zahlungserinnerung an ${order.email} gesendet`)
                                }
                            >
                                Erinnerung senden
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirm('subscription')}
                            >
                                Ratenplan beenden
                            </Button>
                        </>
                    ),
                };
            case 'awaiting_payment':
                return {
                    warn: true,
                    text: `Auf Rechnung — wartet auf die Überweisung von ${money(order.amount)}. Fällig am 14.10.2026, Verwendungszweck ${order.invoice}.`,
                    actions: (
                        <Button size="sm" onClick={() => setConfirm('settle')}>
                            Als bezahlt markieren
                        </Button>
                    ),
                };
            case 'committed':
                return {
                    warn: false,
                    text: 'Verbindlich reserviert — abgebucht wird zum Kursstart am 12.10.2026. Bis dahin kann die Reservierung kostenlos storniert werden.',
                    actions: (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirm('commitment')}
                        >
                            Reservierung stornieren
                        </Button>
                    ),
                };
            case 'partially_refunded':
            case 'refunded':
                return {
                    warn: false,
                    text: `${money(order.refunded)} erstattet am 28.09.2026 — Stornorechnung ${order.invoice?.replace('R-', 'S-')}.`,
                    actions: null,
                };
            case 'cancelled':
                return {
                    warn: false,
                    text: 'Storniert, bevor etwas abgebucht wurde. Kein Platz, keine Rechnung.',
                    actions: null,
                };
            default:
                return null;
        }
    })();

    const payments = [
        ...Array.from(
            {
                length:
                    order.status === 'committed' ||
                    order.status === 'cancelled' ||
                    order.status === 'awaiting_payment'
                        ? 0
                        : order.cyclesCharged,
            },
            (_, i) => ({
                when: `${String(2 + i * 30 > 28 ? 1 : 2 + i).padStart(2, '0')}.${String(9 - order.cyclesCharged + 1 + i).padStart(2, '0')}.2026`,
                what: order.plan === 'once' ? 'Zahlung' : `Rate ${i + 1} von ${order.cyclesTotal}`,
                amount: order.plan === 'once' ? order.amount : perCycle,
                state: 'Eingegangen',
                tone: 'success' as const,
            }),
        ),
        ...(order.status === 'past_due'
            ? [
                  {
                      when: '25.09.2026',
                      what: `Rate ${order.cyclesCharged + 1} von ${order.cyclesTotal}`,
                      amount: perCycle,
                      state: 'Fehlgeschlagen (Karte abgelehnt)',
                      tone: 'destructive' as const,
                  },
              ]
            : []),
        ...(order.refunded
            ? [
                  {
                      when: '28.09.2026',
                      what: 'Erstattung',
                      amount: -order.refunded,
                      state: 'Zurückgezahlt',
                      tone: 'neutral' as const,
                  },
              ]
            : []),
    ];

    return (
        <Sheet open onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(52rem,92vw)] max-w-none gap-0 p-0"
                // Start on the order's number, not on the first button (whose tooltip would pop up).
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement)
                        .querySelector<HTMLElement>('[data-sheet-title]')
                        ?.focus();
                }}
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
                            <ReceiptEuro
                                className="size-6 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <SheetTitle
                                data-sheet-title
                                tabIndex={-1}
                                className="font-mono text-2xl tracking-tight outline-none"
                            >
                                {order.number}
                            </SheetTitle>
                            <SheetDescription>
                                {order.course} · {order.offering}
                            </SheetDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge tone={STATUS[order.status].tone} dot>
                                    {STATUS[order.status].label}
                                </Badge>
                                <Badge tone="faint">{PROVIDER[order.provider]}</Badge>
                                {order.plan !== 'once' && (
                                    <Badge tone="faint">
                                        {PLAN[order.plan]} · {order.cyclesCharged}/
                                        {order.cyclesTotal}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="text-end">
                            <div className="text-2xl font-semibold tabular-nums">
                                {money(order.amount)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                am {formatDate(order.createdAt)}
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <IconButton
                                    label="Weitere Aktionen"
                                    icon={<EllipsisVertical aria-hidden="true" />}
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    disabled={!order.invoice}
                                    onSelect={() =>
                                        setNote(`Rechnung ${order.invoice} heruntergeladen`)
                                    }
                                >
                                    <Download aria-hidden="true" /> Rechnung herunterladen (PDF)
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onSelect={() =>
                                        setNote(`Beleg erneut an ${order.email} gesendet`)
                                    }
                                >
                                    <FileText aria-hidden="true" /> Beleg erneut senden
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    disabled={
                                        !['paid', 'partially_refunded'].includes(order.status)
                                    }
                                    onSelect={onRefund}
                                >
                                    <RotateCcw aria-hidden="true" /> Erstatten …
                                </DropdownMenuItem>
                                {order.plan !== 'once' && (
                                    <DropdownMenuItem
                                        className="text-destructive-tint-foreground"
                                        onSelect={() => setConfirm('subscription')}
                                    >
                                        <XCircle aria-hidden="true" />{' '}
                                        {order.plan === 'subscription'
                                            ? 'Abo kündigen'
                                            : 'Ratenplan beenden'}
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                        <InitialsAvatar name={order.buyer} size="sm" colored />
                        <div className="min-w-0 flex-1 text-sm">
                            <a
                                href="#/admin/users/1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    linkTo('Pages/Admin/Nutzerverwaltung', 'NutzerOffen')();
                                }}
                                className="font-medium underline-offset-4 hover:underline"
                            >
                                {order.buyer}
                            </a>
                            <div className="truncate text-muted-foreground">
                                {order.email}
                                {order.company && ` · Rechnung an ${order.company}`}
                            </div>
                        </div>
                    </div>

                    {banner && (
                        <div
                            role="status"
                            className={cn(
                                'flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
                                banner.warn
                                    ? 'border-warning/40 bg-warning/10 text-warning-tint-foreground'
                                    : 'border-border bg-muted',
                            )}
                        >
                            <span className="max-w-prose">{banner.text}</span>
                            {banner.actions && <span className="flex gap-2">{banner.actions}</span>}
                        </div>
                    )}
                    {note && (
                        <p role="status" className="text-sm text-muted-foreground">
                            {note}
                        </p>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <Part title="Positionen">
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <div className="font-medium">{order.course}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {order.offering}
                                            {order.seats > 1 && ` · ${order.seats} Plätze`}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-end tabular-nums">
                                        {money(order.amount + order.discount)}
                                    </TableCell>
                                </TableRow>
                                {order.discount > 0 && (
                                    <TableRow>
                                        <TableCell className="text-muted-foreground">
                                            {order.coupon ? (
                                                <>
                                                    Gutschein{' '}
                                                    <span className="font-mono">
                                                        {order.coupon}
                                                    </span>
                                                </>
                                            ) : (
                                                'Preisregel „Frühbucher"'
                                            )}
                                        </TableCell>
                                        <TableCell className="text-end text-muted-foreground tabular-nums">
                                            − {money(order.discount)}
                                        </TableCell>
                                    </TableRow>
                                )}
                                {order.voucher && (
                                    <TableRow>
                                        <TableCell className="text-muted-foreground">
                                            {order.voucher}
                                        </TableCell>
                                        <TableCell className="text-end text-muted-foreground">
                                            übernimmt 100 %
                                        </TableCell>
                                    </TableRow>
                                )}
                                <TableRow>
                                    <TableCell className="text-muted-foreground">
                                        darin 19 % MwSt.
                                    </TableCell>
                                    <TableCell className="text-end text-muted-foreground tabular-nums">
                                        {money(vat)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-semibold">Summe</TableCell>
                                    <TableCell className="text-end font-semibold tabular-nums">
                                        {money(order.amount)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Part>

                    {order.seats > 1 && (
                        <Part
                            title="Plätze"
                            text={`${order.company} hat ${order.seats} Plätze gebucht und verteilt sie selbst.`}
                        >
                            <ul className="flex flex-col divide-y divide-border text-sm">
                                {(
                                    [
                                        ['Yusuf Okafor', 'Im Kurs', 'success'],
                                        ['Sara Nasser', 'Einladung verschickt', 'neutral'],
                                        ['—', 'Freier Platz', 'faint'],
                                    ] as const
                                ).map(([who, state, tone]) => (
                                    <li
                                        key={who + state}
                                        className="flex items-center justify-between py-2"
                                    >
                                        <span>{who}</span>
                                        <Badge tone={tone} dot>
                                            {state}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        </Part>
                    )}

                    <Part
                        title="Zahlungen"
                        text={
                            order.plan === 'once'
                                ? undefined
                                : `${PLAN[order.plan]}: ${order.cyclesTotal} × ${money(perCycle)}, monatlich.`
                        }
                    >
                        {payments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Noch nichts eingegangen.
                            </p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Datum</TableHead>
                                        <TableHead>Was</TableHead>
                                        <TableHead>Stand</TableHead>
                                        <TableHead className="text-end">Betrag</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.map((p, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="tabular-nums">{p.when}</TableCell>
                                            <TableCell>{p.what}</TableCell>
                                            <TableCell>
                                                <Badge tone={p.tone} dot>
                                                    {p.state}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-end tabular-nums">
                                                {money(p.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Part>

                    <Part
                        title="Rechnungen"
                        text="Fortlaufend nummeriert und unveränderlich; eine Erstattung schreibt eine Stornorechnung dazu."
                    >
                        {order.invoice ? (
                            <ul className="flex flex-col divide-y divide-border text-sm">
                                <li className="flex items-center justify-between py-2">
                                    <span className="font-mono">{order.invoice}</span>
                                    <span className="text-muted-foreground">
                                        {formatDate(order.createdAt)}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            setNote(`Rechnung ${order.invoice} heruntergeladen`)
                                        }
                                    >
                                        <Download aria-hidden="true" /> PDF
                                    </Button>
                                </li>
                                {order.refunded > 0 && (
                                    <li className="flex items-center justify-between py-2">
                                        <span className="font-mono">
                                            {order.invoice.replace('R-', 'S-')}
                                        </span>
                                        <span className="text-muted-foreground">
                                            28.09.2026 · Storno
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                setNote('Stornorechnung heruntergeladen')
                                            }
                                        >
                                            <Download aria-hidden="true" /> PDF
                                        </Button>
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Noch keine — die Rechnung entsteht mit der ersten Zahlung.
                            </p>
                        )}
                    </Part>
                </div>

                <ConfirmActionDialog
                    open={confirm !== null}
                    onOpenChange={(o) => !o && setConfirm(null)}
                    title={
                        confirm === 'settle'
                            ? 'Als bezahlt markieren?'
                            : confirm === 'commitment'
                              ? 'Reservierung stornieren?'
                              : order.plan === 'subscription'
                                ? 'Abo kündigen?'
                                : 'Ratenplan beenden?'
                    }
                    description={
                        confirm === 'settle'
                            ? `Nur, wenn ${money(order.amount)} wirklich auf dem Konto eingegangen sind. Die Bestellung gilt dann als bezahlt; die Rechnung bleibt, wie sie ist.`
                            : confirm === 'commitment'
                              ? 'Es wurde noch nichts abgebucht. Der Platz wird frei, und es entsteht keine Rechnung.'
                              : 'Es wird nichts mehr abgebucht. Bereits gezahlte Raten bleiben; der Zugang endet mit dem bezahlten Zeitraum.'
                    }
                    confirmLabel={
                        confirm === 'settle'
                            ? 'Ja, Geld ist da'
                            : confirm === 'commitment'
                              ? 'Stornieren'
                              : 'Beenden'
                    }
                    cancelLabel="Abbrechen"
                    variant={confirm === 'settle' ? 'default' : 'destructive'}
                    onConfirm={() => {
                        const c = confirm;
                        setConfirm(null);
                        if (c === 'settle') onChange({ ...order, status: 'paid' });
                        if (c === 'commitment') onChange({ ...order, status: 'cancelled' });
                        if (c === 'subscription')
                            setNote('Ratenplan beendet — keine weiteren Abbuchungen');
                    }}
                />
            </SheetContent>
        </Sheet>
    );
}

// ---------------------------------------------------------------------------
// Withdrawals, coupons, report
// ---------------------------------------------------------------------------

type Withdrawal = {
    id: number;
    kind: 'withdrawal' | 'orphaned';
    buyer: string;
    course: string;
    amount: number;
    refund: 'pending' | 'done';
    requested: string;
    state: 'open' | 'done';
};
const WITHDRAWALS: Withdrawal[] = [
    {
        id: 1,
        kind: 'withdrawal',
        buyer: 'Hanna Haddad',
        course: 'Arabisch für Anfänger',
        amount: 24000,
        refund: 'pending',
        requested: '2026-09-28',
        state: 'open',
    },
    {
        id: 2,
        kind: 'orphaned',
        buyer: 'Emre Demir',
        course: 'Tajwid Grundlagen',
        amount: 18000,
        refund: 'pending',
        requested: '2026-09-27',
        state: 'open',
    },
    {
        id: 3,
        kind: 'withdrawal',
        buyer: 'Lea Berger',
        course: 'Fiqh des Alltags',
        amount: 12000,
        refund: 'done',
        requested: '2026-09-12',
        state: 'done',
    },
];

function WithdrawalsView() {
    const [items, setItems] = useState(WITHDRAWALS);
    const [done, setDone] = useState<Withdrawal | null>(null);
    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-8 py-8">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">Widerrufe & Stornos</h1>
                <p className="text-sm text-muted-foreground">
                    Wer innerhalb von 14 Tagen widerruft, bekommt sein Geld zurück. Hier landen auch
                    Zahlungen, zu denen kein Kursplatz gehört.
                </p>
            </header>
            <ul className="flex flex-col gap-3">
                {items.map((w) => (
                    <li
                        key={w.id}
                        className={cn(
                            'flex items-center gap-4 rounded-lg border border-border px-5 py-4',
                            w.state === 'done' && 'bg-muted/40',
                        )}
                    >
                        <div
                            className={cn(
                                'flex size-10 shrink-0 items-center justify-center rounded-full',
                                w.kind === 'withdrawal' ? 'bg-muted' : 'bg-warning/10',
                            )}
                        >
                            {w.kind === 'withdrawal' ? (
                                <Undo2
                                    className="size-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            ) : (
                                <CircleAlert
                                    className="size-5 text-warning-tint-foreground"
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                {w.kind === 'withdrawal'
                                    ? 'Gesetzlicher Widerruf'
                                    : 'Zahlung erhalten, kein Zugang'}
                                <Badge tone={w.state === 'open' ? 'warning' : 'success'} dot>
                                    {w.state === 'open' ? 'Offen' : 'Erledigt'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {w.buyer} · {w.course} · beantragt am {formatDate(w.requested)}
                            </p>
                        </div>
                        <div className="text-end">
                            <div className="font-semibold tabular-nums">{money(w.amount)}</div>
                            <div className="text-xs text-muted-foreground">
                                {w.refund === 'done' ? 'erstattet' : 'Erstattung läuft'}
                            </div>
                        </div>
                        {w.state === 'open' && (
                            <Button size="sm" variant="outline" onClick={() => setDone(w)}>
                                Erledigt
                            </Button>
                        )}
                    </li>
                ))}
            </ul>
            <ConfirmActionDialog
                open={done !== null}
                onOpenChange={(o) => !o && setDone(null)}
                title="Als erledigt markieren?"
                description="Nur, wenn die Erstattung angekommen und der Platz freigegeben ist."
                confirmLabel="Erledigt"
                cancelLabel="Abbrechen"
                onConfirm={() => {
                    setItems((all) =>
                        all.map((w) =>
                            w.id === done?.id ? { ...w, state: 'done', refund: 'done' } : w,
                        ),
                    );
                    setDone(null);
                }}
            />
        </div>
    );
}

type Coupon = {
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    scope: string;
    used: number;
    max: number | null;
    perUser: number;
    from: string;
    until: string | null;
    active: boolean;
};
const COUPONS: Coupon[] = [
    {
        code: 'HERBST10',
        type: 'percent',
        value: 10,
        scope: 'Alle Kurse',
        used: 18,
        max: 50,
        perUser: 1,
        from: '2026-09-01',
        until: '2026-10-31',
        active: true,
    },
    {
        code: 'GESCHWISTER',
        type: 'fixed',
        value: 3000,
        scope: 'Alle Kurse',
        used: 7,
        max: null,
        perUser: 3,
        from: '2026-01-01',
        until: null,
        active: true,
    },
    {
        code: 'TAJWID25',
        type: 'percent',
        value: 25,
        scope: 'Tajwid Grundlagen',
        used: 12,
        max: 12,
        perUser: 1,
        from: '2026-06-01',
        until: '2026-08-31',
        active: false,
    },
    {
        code: 'RAMADAN',
        type: 'percent',
        value: 15,
        scope: 'Alle Kurse',
        used: 41,
        max: 100,
        perUser: 1,
        from: '2026-02-18',
        until: '2026-03-19',
        active: false,
    },
];

function CouponsView() {
    const [coupons, setCoupons] = useState(COUPONS);
    const [creating, setCreating] = useState(false);
    const [remove, setRemove] = useState<Coupon | null>(null);
    const id = useId();
    const [code, setCode] = useState('');
    const [type, setType] = useState<'percent' | 'fixed'>('percent');
    const [value, setValue] = useState('');
    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-8 py-8">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Gutscheine</h1>
                    <p className="text-sm text-muted-foreground">
                        Codes, die Käufer an der Kasse eingeben. Für automatische Rabatte
                        (Frühbucher, Geschwister) gibt es Preisregeln.
                    </p>
                </div>
                <Button onClick={() => setCreating(true)}>
                    <Plus aria-hidden="true" /> Neuer Gutschein
                </Button>
            </header>
            <div className="grid grid-cols-2 gap-4">
                {coupons.map((c) => (
                    <div
                        key={c.code}
                        className={cn(
                            'flex flex-col gap-3 rounded-xl border border-border p-5',
                            !c.active && 'bg-muted/40',
                        )}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="font-mono text-lg font-semibold tracking-wide">
                                    {c.code}
                                </div>
                                <div className="text-sm text-muted-foreground">{c.scope}</div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-semibold tabular-nums">
                                    {c.type === 'percent' ? `−${c.value} %` : `−${money(c.value)}`}
                                </span>
                                <IconButton
                                    label={`${c.code} deaktivieren`}
                                    icon={<Trash2 aria-hidden="true" />}
                                    onClick={() => setRemove(c)}
                                    disabled={!c.active}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                                <span>
                                    {c.used} eingelöst{c.max ? ` von ${c.max}` : ''}
                                </span>
                                <span>{c.perUser}× pro Person</span>
                            </div>
                            <div
                                className="h-1.5 overflow-hidden rounded-full bg-muted"
                                role="progressbar"
                                aria-label={`${c.code} eingelöst`}
                                aria-valuemin={0}
                                aria-valuemax={c.max ?? c.used}
                                aria-valuenow={c.used}
                            >
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{
                                        width: `${c.max ? Math.min(100, (c.used / c.max) * 100) : 100}%`,
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                {formatDate(c.from)} –{' '}
                                {c.until ? formatDate(c.until) : 'unbefristet'}
                            </span>
                            <Badge tone={c.active ? 'success' : 'muted'} dot>
                                {c.active ? 'Aktiv' : 'Beendet'}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent closeLabel="Schließen">
                    <DialogHeader>
                        <DialogTitle>Neuer Gutschein</DialogTitle>
                        <DialogDescription>
                            Gilt ab sofort; Grenzen und Laufzeit lassen sich später ändern.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor={`${id}-code`}>Code</Label>
                            <Input
                                id={`${id}-code`}
                                value={code}
                                onChange={(e) =>
                                    setCode(e.target.value.toUpperCase().replace(/\s/g, ''))
                                }
                                className="font-mono"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-type`}>Art</Label>
                            <Select
                                value={type}
                                onValueChange={(v) => setType(v as 'percent' | 'fixed')}
                            >
                                <SelectTrigger id={`${id}-type`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percent">Prozent</SelectItem>
                                    <SelectItem value="fixed">Fester Betrag</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-value`}>
                                {type === 'percent' ? 'Rabatt in %' : 'Rabatt in €'}
                            </Label>
                            <Input
                                id={`${id}-value`}
                                inputMode="decimal"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreating(false)}>
                            Abbrechen
                        </Button>
                        <Button
                            disabled={!code || !value}
                            onClick={() => {
                                setCoupons((all) => [
                                    {
                                        code,
                                        type,
                                        value:
                                            type === 'percent'
                                                ? Number(value)
                                                : Number(value.replace(',', '.')) * 100,
                                        scope: 'Alle Kurse',
                                        used: 0,
                                        max: null,
                                        perUser: 1,
                                        from: '2026-09-30',
                                        until: null,
                                        active: true,
                                    },
                                    ...all,
                                ]);
                                setCreating(false);
                                setCode('');
                                setValue('');
                            }}
                        >
                            Anlegen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <ConfirmActionDialog
                open={remove !== null}
                onOpenChange={(o) => !o && setRemove(null)}
                title={`${remove?.code} deaktivieren?`}
                description="Der Code gilt ab sofort nicht mehr. Bestellungen, die ihn schon nutzen, bleiben, wie sie sind."
                confirmLabel="Deaktivieren"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={() => {
                    setCoupons((all) =>
                        all.map((c) => (c.code === remove?.code ? { ...c, active: false } : c)),
                    );
                    setRemove(null);
                }}
            />
        </div>
    );
}

const MONTHS = ['Okt', 'Nov', 'Dez', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep'];
const REVENUE = [2140, 3380, 1920, 4460, 3910, 5820, 4230, 3650, 2980, 1840, 3120, 4230].map(
    (e) => e * 100,
);

function ReportsView() {
    const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
    const max = Math.max(...REVENUE);
    const gross = 423000;
    const coupon = 14800;
    const rule = 9000;
    const net = Math.round((gross - coupon - rule) / 1.19);
    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-8 py-8">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Umsatz</h1>
                    <p className="text-sm text-muted-foreground">
                        Was eingenommen wurde, nach Rabatten, Steuer und Erstattungen — so, wie es
                        die Buchhaltung braucht.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div
                        role="radiogroup"
                        aria-label="Zeitraum"
                        className="flex rounded-lg border border-border p-0.5"
                    >
                        {(['month', 'quarter', 'year'] as const).map((p) => (
                            <button
                                key={p}
                                type="button"
                                role="radio"
                                aria-checked={period === p}
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    'rounded-md px-3 py-1 text-sm whitespace-nowrap',
                                    period === p
                                        ? 'bg-muted font-medium'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {{ month: 'September', quarter: 'Q3 2026', year: '2026' }[p]}
                            </button>
                        ))}
                    </div>
                    <Button variant="outline">
                        <Download aria-hidden="true" /> CSV für die Buchhaltung
                    </Button>
                </div>
            </header>

            <section aria-label="Umsatz der letzten 12 Monate" className="flex flex-col gap-3">
                <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-semibold tracking-tight tabular-nums">
                        {money(gross)}
                    </span>
                    <span className="text-sm text-success-tint-foreground">+ 35 % zum August</span>
                </div>
                <div className="flex h-44 items-end gap-2" aria-hidden="true">
                    {REVENUE.map((v, i) => (
                        <div
                            key={MONTHS[i]}
                            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                        >
                            <div
                                className={cn(
                                    'w-full rounded-t-md',
                                    i === REVENUE.length - 1 ? 'bg-primary' : 'bg-primary/25',
                                )}
                                style={{ height: `${(v / max) * 100}%` }}
                            />
                            <span className="text-xs text-muted-foreground">{MONTHS[i]}</span>
                        </div>
                    ))}
                </div>
                <p className="sr-only">
                    {REVENUE.map((v, i) => `${MONTHS[i]}: ${money(v)}`).join(', ')}
                </p>
            </section>

            <section className="flex flex-col gap-3">
                <h2 className="font-semibold">September 2026, in Euro</h2>
                <Table>
                    <TableBody>
                        {[
                            ['Brutto (38 Bestellungen)', gross, false],
                            ['Gutscheinrabatt', -coupon, true],
                            ['Regelrabatt (Frühbucher, Geschwister)', -rule, true],
                            ['darin MwSt.', -(gross - coupon - rule - net), true],
                            ['Erstattet', -24000, true],
                        ].map(([label, v, muted]) => (
                            <TableRow key={label as string}>
                                <TableCell className={muted ? 'text-muted-foreground' : undefined}>
                                    {label as string}
                                </TableCell>
                                <TableCell
                                    className={cn(
                                        'text-end tabular-nums',
                                        muted && 'text-muted-foreground',
                                    )}
                                >
                                    {money(v as number)}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell className="font-semibold">Netto nach Erstattungen</TableCell>
                            <TableCell className="text-end font-semibold tabular-nums">
                                {money(net - 24000)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="size-4" aria-hidden="true" />2 Rechnungen in US-Dollar warten
                    noch auf den Wechselkurs des Buchungstags und sind noch nicht enthalten.
                </p>
            </section>

            <section className="flex flex-col gap-3">
                <h2 className="font-semibold">Nach Kurs</h2>
                <ul className="flex flex-col gap-2">
                    {COURSES.map(([c], i) => {
                        const v = [168000, 108000, 54000, 48000, 45000][i]!;
                        return (
                            <li
                                key={c}
                                className="grid grid-cols-[14rem_1fr_7rem] items-center gap-4 text-sm"
                            >
                                <span className="truncate">{c}</span>
                                <div
                                    className="h-2 overflow-hidden rounded-full bg-muted"
                                    aria-hidden="true"
                                >
                                    <div
                                        className="h-full rounded-full bg-primary/70"
                                        style={{ width: `${(v / 168000) * 100}%` }}
                                    />
                                </div>
                                <span className="text-end tabular-nums">{money(v)}</span>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
}

function Later({ title, text, icon }: { title: string; text: string; icon: LucideIcon }) {
    return (
        <div className="flex h-full items-center justify-center px-8">
            <EmptyState icon={icon} title={title} description={text} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

function PaymentsPage({
    initialView = { kind: 'orders', status: 'all' },
    openOrder = null,
}: {
    initialView?: View;
    openOrder?: number | null;
}) {
    const [orders, setOrders] = useState(() => makeOrders(48));
    const [view, setView] = useState<View>(initialView);
    const [open, setOpen] = useState<number | null>(openOrder);
    const change = (o: Order) => setOrders((all) => all.map((x) => (x.id === o.id ? o : x)));
    return (
        <Shell menu={<PaymentsMenu view={view} onView={setView} orders={orders} />}>
            {view.kind === 'orders' && (
                <OrdersView
                    key={view.status}
                    orders={orders}
                    status={view.status}
                    onChange={change}
                    openOrder={open}
                    onOpen={setOpen}
                />
            )}
            {view.kind === 'withdrawals' && <WithdrawalsView />}
            {view.kind === 'coupons' && <CouponsView />}
            {view.kind === 'reports' && <ReportsView />}
            {view.kind === 'rules' && (
                <Later
                    icon={SlidersHorizontal}
                    title="Preisregeln"
                    text="Automatische Rabatte wie Frühbucher oder Geschwister — das nächste Mockup."
                />
            )}
            {view.kind === 'funding' && (
                <Later
                    icon={Gift}
                    title="Förderung"
                    text="Förderprogramme und Bildungsgutscheine mit Nachweis — das nächste Mockup."
                />
            )}
            {view.kind === 'settings' && (
                <Later
                    icon={Settings2}
                    title="Einstellungen"
                    text="Zahlungsanbieter, Steuer und Rechnungssteller — das nächste Mockup."
                />
            )}
        </Shell>
    );
}

/**
 * The Zahlungen area as it could look: orders with what needs you first,
 * one order as a panel from the right, withdrawals, coupons and the revenue
 * report. Click around — it responds, but saves nothing.
 */
const meta: Meta<typeof PaymentsPage> = {
    title: 'Pages/Admin/Zahlungen',
    component: PaymentsPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.payments')) localStorage.removeItem(k);
    },
};
export default meta;

export const Bestellungen: StoryObj<typeof PaymentsPage> = {
    render: () => <PaymentsPage />,
};

/** An order paid in instalments whose latest one bounced: the panel leads with it. */
export const BestellungUeberfaellig: StoryObj<typeof PaymentsPage> = {
    render: () => <PaymentsPage openOrder={7} />,
};

/** A company's group booking on invoice, waiting for the bank transfer. */
export const BestellungAufRechnung: StoryObj<typeof PaymentsPage> = {
    render: () => <PaymentsPage openOrder={4} />,
};

/** A paid order: refund part of it, and a credit note is written. */
export const Erstatten: StoryObj<typeof PaymentsPage> = {
    render: () => <PaymentsPage openOrder={1} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const panel = await body.findByRole('dialog');
        await userEvent.click(within(panel).getByRole('button', { name: 'Weitere Aktionen' }));
        await userEvent.click(await body.findByRole('menuitem', { name: /Erstatten/ }));
        const dialog = await body.findByRole('dialog', { name: /erstatten/ });
        await userEvent.click(within(dialog).getByRole('button', { name: 'Hälfte' }));
        await userEvent.click(within(dialog).getByRole('button', { name: /€ erstatten/ }));
        await waitFor(() => expect(body.getByText(/Stornorechnung erstellt/)).toBeInTheDocument());
    },
};

export const WiderrufeUndStornos: StoryObj<typeof PaymentsPage> = {
    render: () => <PaymentsPage initialView={{ kind: 'withdrawals' }} />,
};

export const Gutscheine: StoryObj<typeof PaymentsPage> = {
    render: () => <PaymentsPage initialView={{ kind: 'coupons' }} />,
};

export const Umsatz: StoryObj<typeof PaymentsPage> = {
    render: () => <PaymentsPage initialView={{ kind: 'reports' }} />,
};
