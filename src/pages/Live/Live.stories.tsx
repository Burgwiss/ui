import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
    CalendarDays,
    CalendarRange,
    CircleAlert,
    Clapperboard,
    Copy,
    CreditCard,
    Download,
    EllipsisVertical,
    House,
    Link2,
    List,
    Loader,
    Palette,
    Pencil,
    Plus,
    Radio,
    RefreshCw,
    Settings2,
    Share2,
    Trash2,
    UserRound,
    UserRoundX,
    Users as UsersIcon,
    BookOpen,
    Video,
    VideoOff,
    XCircle,
    CopyPlus,
    FolderInput,
    Eye,
    EyeOff,
    History,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { Switch } from '../../atoms/Switch';
import { Textarea } from '../../atoms/Textarea';
import type { GridColumn } from '../../hooks/grid/types';
import type { GridActionItem, RowId } from '../../hooks/gridActions';
import { useGrid, type GridApi } from '../../hooks/useGrid';
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
import { AdminLayout } from '../../templates/AdminLayout';
import { GridPage } from '../../templates/GridPage';

/**
 * PAGE PROTOTYPE — the Live area of the admin (`/admin/meetings` in
 * Burgwiss): sessions as a list or a week calendar, what is live right now on
 * top, one session as a panel from the right, a new session in a dialog, the
 * recordings, and the settings. Same shell as Kurse, Nutzer and Zahlungen.
 * Non-functional: example content, no server.
 */

// ---------------------------------------------------------------------------
// Example data
// ---------------------------------------------------------------------------

type Status = 'scheduled' | 'live' | 'ended';
type Kind = 'class' | 'adhoc';
type RecState = 'off' | 'none' | 'capturing' | 'processing' | 'completed' | 'failed';

type Session = {
    id: number;
    title: string;
    kind: Kind;
    course: string | null;
    host: string | null;
    /** ISO date-time, local. */
    start: string;
    minutes: number;
    status: Status;
    invitees: number;
    joined: number;
    recording: RecState;
    recDuration: number | null;
};

const NOW = new Date('2026-09-30T18:40:00');
const HOSTS = ['Ustadh Mosa Khallaf', 'Ustadha Amina Berger', 'Ustadh Abdulaziz As-Suisri'];
const COURSES = [
    'Arabisch für Anfänger',
    'Tajwid Grundlagen',
    'Hifz-Kreis: Juz ʿAmma',
    'Fiqh des Alltags',
];

function at(dayOffset: number, hour: number, minute = 0) {
    const d = new Date(NOW);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
}

const SESSIONS: Session[] = [
    {
        id: 1,
        title: 'Lektion 7: Nominalsätze',
        kind: 'class',
        course: COURSES[0]!,
        host: HOSTS[1]!,
        start: at(0, 18, 0),
        minutes: 90,
        status: 'live',
        invitees: 14,
        joined: 11,
        recording: 'capturing',
        recDuration: null,
    },
    {
        id: 2,
        title: 'Rezitation: Sure al-Mulk',
        kind: 'class',
        course: COURSES[2]!,
        host: HOSTS[0]!,
        start: at(0, 18, 30),
        minutes: 60,
        status: 'live',
        invitees: 9,
        joined: 7,
        recording: 'off',
        recDuration: null,
    },
    {
        id: 3,
        title: 'Tajwid: Madd-Regeln',
        kind: 'class',
        course: COURSES[1]!,
        host: HOSTS[0]!,
        start: at(1, 19, 0),
        minutes: 60,
        status: 'scheduled',
        invitees: 12,
        joined: 0,
        recording: 'none',
        recDuration: null,
    },
    {
        id: 4,
        title: 'Elternabend Herbst',
        kind: 'adhoc',
        course: null,
        host: null,
        start: at(1, 20, 0),
        minutes: 45,
        status: 'scheduled',
        invitees: 38,
        joined: 0,
        recording: 'off',
        recDuration: null,
    },
    {
        id: 5,
        title: 'Lektion 8: Verbalsätze',
        kind: 'class',
        course: COURSES[0]!,
        host: HOSTS[1]!,
        start: at(2, 18, 0),
        minutes: 90,
        status: 'scheduled',
        invitees: 14,
        joined: 0,
        recording: 'none',
        recDuration: null,
    },
    {
        id: 6,
        title: 'Fiqh: Gebetszeiten',
        kind: 'class',
        course: COURSES[3]!,
        host: HOSTS[2]!,
        start: at(3, 19, 30),
        minutes: 75,
        status: 'scheduled',
        invitees: 21,
        joined: 0,
        recording: 'none',
        recDuration: null,
    },
    {
        id: 7,
        title: 'Rezitation: Sure an-Naba',
        kind: 'class',
        course: COURSES[2]!,
        host: null,
        start: at(4, 10, 0),
        minutes: 60,
        status: 'scheduled',
        invitees: 9,
        joined: 0,
        recording: 'none',
        recDuration: null,
    },
    {
        id: 8,
        title: 'Lehrkräfte-Treffen',
        kind: 'adhoc',
        course: null,
        host: HOSTS[2]!,
        start: at(4, 17, 0),
        minutes: 30,
        status: 'scheduled',
        invitees: 4,
        joined: 0,
        recording: 'off',
        recDuration: null,
    },
    {
        id: 9,
        title: 'Lektion 6: Das Pronomen',
        kind: 'class',
        course: COURSES[0]!,
        host: HOSTS[1]!,
        start: at(-2, 18, 0),
        minutes: 90,
        status: 'ended',
        invitees: 14,
        joined: 13,
        recording: 'completed',
        recDuration: 5340,
    },
    {
        id: 10,
        title: 'Tajwid: Nun Sakina',
        kind: 'class',
        course: COURSES[1]!,
        host: HOSTS[0]!,
        start: at(-1, 19, 0),
        minutes: 60,
        status: 'ended',
        invitees: 12,
        joined: 10,
        recording: 'processing',
        recDuration: 3560,
    },
    {
        id: 11,
        title: 'Fiqh: Reinheit',
        kind: 'class',
        course: COURSES[3]!,
        host: HOSTS[2]!,
        start: at(-3, 19, 30),
        minutes: 75,
        status: 'ended',
        invitees: 21,
        joined: 17,
        recording: 'failed',
        recDuration: null,
    },
    {
        id: 12,
        title: 'Lektion 5: Artikel',
        kind: 'class',
        course: COURSES[0]!,
        host: HOSTS[1]!,
        start: at(-6, 18, 0),
        minutes: 90,
        status: 'ended',
        invitees: 14,
        joined: 12,
        recording: 'completed',
        recDuration: 5410,
    },
];

const STATUS: Record<
    Status,
    { label: string; tone: 'success' | 'neutral' | 'muted' | 'destructive' }
> = {
    live: { label: 'Läuft gerade', tone: 'destructive' },
    scheduled: { label: 'Geplant', tone: 'neutral' },
    ended: { label: 'Beendet', tone: 'muted' },
};
const REC: Record<
    RecState,
    { label: string; tone: 'success' | 'neutral' | 'muted' | 'warning' | 'destructive' | 'faint' }
> = {
    off: { label: 'Ohne Aufnahme', tone: 'faint' },
    none: { label: 'Wird aufgenommen', tone: 'faint' },
    capturing: { label: 'Nimmt auf', tone: 'destructive' },
    processing: { label: 'Wird verarbeitet', tone: 'warning' },
    completed: { label: 'Aufnahme fertig', tone: 'success' },
    failed: { label: 'Aufnahme fehlgeschlagen', tone: 'destructive' },
};

const time = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const dayFmt = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
});
const longDay = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
});
const when = (iso: string) => `${dayFmt.format(new Date(iso))}, ${time.format(new Date(iso))}`;
const until = (s: Session) =>
    time.format(new Date(new Date(s.start).getTime() + s.minutes * 60_000));
const mins = (seconds: number) => `${Math.round(seconds / 60)} Min.`;

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
// Shell and menu
// ---------------------------------------------------------------------------

type View =
    | { kind: 'sessions'; scope: 'all' | 'upcoming' | 'today' | 'past' | 'unhosted' }
    | { kind: 'recordings'; scope: 'all' | 'processing' | 'failed' }
    | { kind: 'settings' };

function LiveMenu({
    view,
    onView,
    sessions,
}: {
    view: View;
    onView: (v: View) => void;
    sessions: Session[];
}) {
    const same = (v: View) => JSON.stringify(v) === JSON.stringify(view);
    const recs = sessions.filter((s) => s.recording !== 'off' && s.recording !== 'none');
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
    const live = sessions.filter((s) => s.status === 'live').length;
    return (
        <Sidebar
            label="Live"
            resize={{
                label: 'Menü verbreitern oder verschmälern',
                storageKey: 'storybook.page.live',
            }}
        >
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 text-lg font-semibold tracking-tight">
                    Live
                    {live > 0 && (
                        <span className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive-tint-foreground">
                            <span
                                className="size-1.5 animate-pulse rounded-full bg-destructive motion-reduce:animate-none"
                                aria-hidden="true"
                            />
                            {live} live
                        </span>
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup label="Sitzungen">
                    <SidebarMenu>
                        {item(
                            { kind: 'sessions', scope: 'all' },
                            CalendarRange,
                            'Alle Sitzungen',
                            sessions.length,
                        )}
                        {item(
                            { kind: 'sessions', scope: 'today' },
                            Radio,
                            'Heute',
                            sessions.filter(
                                (s) => s.start.slice(0, 10) === NOW.toISOString().slice(0, 10),
                            ).length,
                        )}
                        {item(
                            { kind: 'sessions', scope: 'upcoming' },
                            CalendarDays,
                            'Geplant',
                            sessions.filter((s) => s.status === 'scheduled').length,
                        )}
                        {item(
                            { kind: 'sessions', scope: 'past' },
                            History,
                            'Vergangen',
                            sessions.filter((s) => s.status === 'ended').length,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Braucht dich">
                    <SidebarMenu>
                        {item(
                            { kind: 'sessions', scope: 'unhosted' },
                            UserRoundX,
                            'Ohne Leitung',
                            sessions.filter((s) => !s.host && s.status !== 'ended').length,
                            true,
                        )}
                        {item(
                            { kind: 'recordings', scope: 'failed' },
                            CircleAlert,
                            'Aufnahme fehlgeschlagen',
                            recs.filter((s) => s.recording === 'failed').length,
                            true,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Aufnahmen">
                    <SidebarMenu>
                        {item(
                            { kind: 'recordings', scope: 'all' },
                            Clapperboard,
                            'Alle Aufnahmen',
                            recs.length,
                        )}
                        {item(
                            { kind: 'recordings', scope: 'processing' },
                            Loader,
                            'In Verarbeitung',
                            recs.filter(
                                (s) => s.recording === 'processing' || s.recording === 'capturing',
                            ).length,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarMenu>
                        {item({ kind: 'settings' }, Settings2, 'Einstellungen')}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

// ---------------------------------------------------------------------------
// Sessions: live now, list or week
// ---------------------------------------------------------------------------

function LiveNow({ sessions, onOpen }: { sessions: Session[]; onOpen: (id: number) => void }) {
    const live = sessions.filter((s) => s.status === 'live');
    if (live.length === 0) return null;
    return (
        <section
            aria-label="Läuft gerade"
            className="flex flex-wrap gap-3 border-b border-border px-4 py-3"
        >
            {live.map((s) => (
                <div
                    key={s.id}
                    className="flex min-w-80 flex-1 items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5"
                >
                    <span className="relative flex size-2.5 shrink-0" aria-hidden="true">
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60 motion-reduce:animate-none" />
                        <span className="relative inline-flex size-2.5 rounded-full bg-destructive" />
                    </span>
                    <button
                        type="button"
                        onClick={() => onOpen(s.id)}
                        className="min-w-0 flex-1 text-start"
                    >
                        <div className="truncate text-sm font-medium">{s.title}</div>
                        <div className="truncate text-xs text-muted-foreground">
                            {s.host} · seit {time.format(new Date(s.start))} · {s.joined} von{' '}
                            {s.invitees} drin
                        </div>
                    </button>
                    {s.recording === 'capturing' && (
                        <Badge tone="destructive" dot>
                            Nimmt auf
                        </Badge>
                    )}
                    <Button size="sm">
                        <Video aria-hidden="true" /> Beitreten
                    </Button>
                </div>
            ))}
        </section>
    );
}

const HOURS = Array.from({ length: 15 }, (_, i) => 8 + i); // 08–22

/** Sessions that overlap sit side by side: each gets a lane and the number of lanes in its cluster. */
function laneOf(sessions: Session[]) {
    const out = new Map<number, { lane: number; of: number }>();
    const sorted = [...sessions].sort((a, b) => a.start.localeCompare(b.start));
    let cluster: Session[] = [];
    let clusterEnd = 0;
    const flush = () => {
        const ends: number[] = [];
        for (const s of cluster) {
            const start = new Date(s.start).getTime();
            let lane = ends.findIndex((e) => e <= start);
            if (lane === -1) lane = ends.length;
            ends[lane] = start + s.minutes * 60_000;
            out.set(s.id, { lane, of: 0 });
        }
        for (const s of cluster) out.get(s.id)!.of = ends.length;
        cluster = [];
    };
    for (const s of sorted) {
        const start = new Date(s.start).getTime();
        if (cluster.length && start >= clusterEnd) flush();
        cluster.push(s);
        clusterEnd = Math.max(clusterEnd, start + s.minutes * 60_000);
    }
    flush();
    return out;
}

/** A week at a glance: one column per day, sessions as blocks sized by length. */
function WeekView({ sessions, onOpen }: { sessions: Session[]; onOpen: (id: number) => void }) {
    const monday = new Date(NOW);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        return d;
    });
    const ROW = 44; // px per hour
    const nowTop = ((NOW.getHours() - 8) * 60 + NOW.getMinutes()) * (ROW / 60);
    // Open on the afternoon and evening, where most sessions are.
    const scroller = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scroller.current) scroller.current.scrollTop = 7 * ROW;
    }, []);
    return (
        <div ref={scroller} className="flex min-h-0 flex-1 flex-col overflow-auto">
            <div className="sticky top-0 z-10 grid grid-cols-[3.5rem_repeat(7,1fr)] border-b border-border bg-background">
                <div />
                {days.map((d) => {
                    const today = d.toDateString() === NOW.toDateString();
                    return (
                        <div key={d.toISOString()} className="px-2 py-2 text-center">
                            <div className="text-xs text-muted-foreground">
                                {new Intl.DateTimeFormat('de-DE', { weekday: 'short' }).format(d)}
                            </div>
                            <div
                                className={cn(
                                    'mx-auto mt-0.5 flex size-8 items-center justify-center rounded-full text-sm font-medium',
                                    today && 'bg-primary text-primary-foreground',
                                )}
                            >
                                {d.getDate()}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="relative grid grid-cols-[3.5rem_repeat(7,1fr)]">
                <div>
                    {HOURS.map((h) => (
                        <div
                            key={h}
                            className="pe-2 text-end text-xs text-muted-foreground tabular-nums"
                            style={{ height: ROW }}
                        >
                            {String(h).padStart(2, '0')}:00
                        </div>
                    ))}
                </div>
                {days.map((d) => {
                    const today = d.toDateString() === NOW.toDateString();
                    const mine = sessions.filter(
                        (s) => new Date(s.start).toDateString() === d.toDateString(),
                    );
                    const lanes = laneOf(mine);
                    return (
                        <div
                            key={d.toISOString()}
                            className={cn(
                                'relative border-s border-border',
                                today && 'bg-primary/[0.03]',
                            )}
                        >
                            {HOURS.map((h) => (
                                <div
                                    key={h}
                                    className="border-b border-border/60"
                                    style={{ height: ROW }}
                                />
                            ))}
                            {today && (
                                <div
                                    className="absolute inset-x-0 z-10 flex items-center"
                                    style={{ top: nowTop }}
                                    aria-hidden="true"
                                >
                                    <span className="-ms-1 size-2 rounded-full bg-destructive" />
                                    <span className="h-px flex-1 bg-destructive" />
                                </div>
                            )}
                            {mine.map((s) => {
                                const start = new Date(s.start);
                                const top =
                                    ((start.getHours() - 8) * 60 + start.getMinutes()) * (ROW / 60);
                                const height = Math.max(s.minutes * (ROW / 60) - 3, 22);
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => onOpen(s.id)}
                                        style={{
                                            top,
                                            height,
                                            insetInlineStart: `calc(${(lanes.get(s.id)!.lane / lanes.get(s.id)!.of) * 100}% + 4px)`,
                                            width: `calc(${100 / lanes.get(s.id)!.of}% - 8px)`,
                                        }}
                                        className={cn(
                                            'absolute overflow-hidden rounded-md border px-2 py-1 text-start text-xs transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                            s.status === 'live' &&
                                                'border-destructive/40 bg-destructive/10 text-destructive-tint-foreground',
                                            s.status === 'scheduled' &&
                                                (s.kind === 'adhoc'
                                                    ? 'border-border bg-muted'
                                                    : 'border-primary/30 bg-primary/10'),
                                            s.status === 'ended' &&
                                                'border-border bg-background text-muted-foreground',
                                            !s.host &&
                                                s.status !== 'ended' &&
                                                'border-dashed border-warning/60',
                                        )}
                                    >
                                        <div className="truncate font-medium">{s.title}</div>
                                        <div className="truncate">
                                            {time.format(start)}–{until(s)}
                                            {s.host
                                                ? ` · ${s.host.split(' ').slice(-1)[0]}`
                                                : ' · ohne Leitung'}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function SessionsView({
    sessions,
    scope,
    onChange,
    open,
    onOpen,
}: {
    sessions: Session[];
    scope: 'all' | 'upcoming' | 'today' | 'past' | 'unhosted';
    onChange: (s: Session) => void;
    open: number | null;
    onOpen: (id: number | null) => void;
}) {
    const [layout, setLayout] = useState<'list' | 'week'>('week');
    const [search, setSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const [cancel, setCancel] = useState<Session | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const gridRef = useRef<GridApi<Session> | null>(null);
    const today = NOW.toDateString();

    const shown = sessions
        .filter((s) =>
            scope === 'all'
                ? true
                : scope === 'today'
                  ? new Date(s.start).toDateString() === today
                  : scope === 'upcoming'
                    ? s.status === 'scheduled'
                    : scope === 'past'
                      ? s.status === 'ended'
                      : !s.host && s.status !== 'ended',
        )
        .filter((s) =>
            `${s.title} ${s.course ?? ''} ${s.host ?? ''}`
                .toLowerCase()
                .includes(search.toLowerCase()),
        )
        .sort((a, b) => a.start.localeCompare(b.start));
    const byIds = (ids: RowId[]) => sessions.filter((s) => ids.includes(s.id));

    const columns: GridColumn<Session>[] = useMemo(
        () => [
            {
                id: 'title',
                header: 'Sitzung',
                pinned: 'left',
                hideable: false,
                width: 280,
                cell: (s) => (
                    <a
                        href={`#/admin/meetings/${s.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(s.id);
                        }}
                        className="flex min-w-0 flex-col underline-offset-4 hover:underline"
                    >
                        <span className="truncate font-medium text-foreground">{s.title}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {s.course ?? 'Eigene Sitzung'}
                        </span>
                    </a>
                ),
                filter: { type: 'text' },
            },
            {
                id: 'start',
                header: 'Wann',
                width: 190,
                cell: (s) => `${when(s.start)}–${until(s)}`,
                filter: { type: 'date' },
            },
            {
                id: 'status',
                header: 'Status',
                width: 160,
                groupable: true,
                cell: (s) => (
                    <Badge tone={STATUS[s.status].tone} dot>
                        {STATUS[s.status].label}
                    </Badge>
                ),
                exportValue: (s) => STATUS[s.status].label,
                filter: {
                    type: 'choice',
                    options: Object.entries(STATUS).map(([value, v]) => ({
                        value,
                        label: v.label,
                    })),
                },
            },
            {
                id: 'host',
                header: 'Leitung',
                width: 220,
                groupable: true,
                cell: (s) =>
                    s.host ?? (
                        <Badge tone="warning" dot>
                            Ohne Leitung
                        </Badge>
                    ),
            },
            {
                id: 'invitees',
                header: 'Teilnehmende',
                align: 'right',
                width: 150,
                cell: (s) =>
                    s.status === 'scheduled' ? s.invitees : `${s.joined} / ${s.invitees}`,
            },
            {
                id: 'recording',
                header: 'Aufnahme',
                width: 210,
                groupable: true,
                cell: (s) => (
                    <Badge tone={REC[s.recording].tone} dot>
                        {REC[s.recording].label}
                    </Badge>
                ),
                exportValue: (s) => REC[s.recording].label,
            },
            {
                id: 'kind',
                header: 'Art',
                width: 140,
                groupable: true,
                cell: (s) => (s.kind === 'class' ? 'Kurstermin' : 'Eigene'),
            },
        ],
        [onOpen],
    );

    const actions: GridActionItem[] = [
        {
            id: 'new',
            label: 'Neue Sitzung',
            icon: <Plus aria-hidden="true" />,
            tone: 'primary',
            shortcut: 'N',
            onSelect: () => setCreating(true),
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
            onSelect: (ids) => onOpen(Number(ids[0])),
        },
        {
            id: 'duplicate',
            label: 'Duplizieren',
            icon: <CopyPlus aria-hidden="true" />,
            when: ['one'],
            group: 'state',
            onSelect: (ids) =>
                setNotice(`„${byIds(ids)[0]?.title}" dupliziert — eine Woche später`),
        },
        {
            id: 'link',
            label: 'Link kopieren',
            icon: <Link2 aria-hidden="true" />,
            when: ['one'],
            group: 'state',
            onSelect: () => setNotice('Einladungslink kopiert'),
        },
        {
            id: 'cancel',
            label: 'Absagen …',
            icon: <XCircle aria-hidden="true" />,
            when: ['one'],
            group: 'danger',
            tone: 'destructive',
            disabled: (ids) => byIds(ids).every((s) => s.status !== 'scheduled'),
            disabledReason: 'Nur geplante Sitzungen lassen sich absagen',
            onSelect: (ids) => setCancel(byIds(ids)[0] ?? null),
        },
    ];
    const grid = useGrid<Session>({
        id: 'storybook.page.live.sessions',
        rows: shown,
        getRowId: (s) => s.id,
        columns,
        selection: 'multiple',
        actions,
        defaults: { hiddenColumns: ['kind'] },
    });
    useEffect(() => {
        gridRef.current = grid;
    });

    const layoutToggle = (
        <div
            role="radiogroup"
            aria-label="Darstellung"
            className="flex rounded-lg border border-border p-0.5"
        >
            {(
                [
                    ['week', CalendarRange, 'Woche'],
                    ['list', List, 'Liste'],
                ] as const
            ).map(([value, Icon, label]) => (
                <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={layout === value}
                    onClick={() => setLayout(value)}
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm',
                        layout === value
                            ? 'bg-muted font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                </button>
            ))}
        </div>
    );

    const session = sessions.find((s) => s.id === open) ?? null;
    return (
        <>
            <GridPage
                title="Sitzungen"
                offsetTop="0px"
                grid={grid}
                search={{
                    value: search,
                    onChange: setSearch,
                    placeholder: 'Titel, Kurs oder Leitung …',
                }}
                moreActionsLabel="Weitere Aktionen"
                selectionLabels={{ count: (n) => `${n} ausgewählt`, clear: 'Auswahl aufheben' }}
                shortcutLabels={{ Mod: 'Strg', Shift: 'Umschalt', Delete: 'Entf' }}
                options={
                    <div className="flex items-center gap-2">
                        {layoutToggle}
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
                    </div>
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
                        <span className="text-muted-foreground">
                            {longDay.format(NOW)} ·{' '}
                            {sessions.filter((s) => s.status === 'scheduled').length} geplant diese
                            Woche
                        </span>
                    )
                }
                footer={
                    <GridFooter
                        summary={`${shown.length} Sitzungen`}
                        onPrev={null}
                        onNext={null}
                        labels={{ previous: 'Zurück', next: 'Weiter', pager: 'Seiten' }}
                    />
                }
            >
                <div className="flex h-full min-h-0 flex-col">
                    <LiveNow sessions={sessions} onOpen={(id) => onOpen(id)} />
                    {layout === 'week' ? (
                        <WeekView sessions={shown} onOpen={(id) => onOpen(id)} />
                    ) : (
                        <DataGrid
                            grid={grid}
                            labels={{
                                ...DATA_GRID_LABELS,
                                table: 'Sitzungen',
                                empty: 'Keine Sitzung passt dazu.',
                            }}
                            rowLabel={(s) => s.title}
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
                    )}
                </div>
            </GridPage>

            {session && (
                <SessionSheet
                    key={session.id}
                    session={session}
                    onClose={() => onOpen(null)}
                    onChange={onChange}
                    onCancel={() => setCancel(session)}
                />
            )}
            <NewSessionDialog
                open={creating}
                onOpenChange={setCreating}
                onCreate={(title) => setNotice(`„${title}" geplant — Einladungen verschickt`)}
            />
            <ConfirmActionDialog
                open={cancel !== null}
                onOpenChange={(o) => !o && setCancel(null)}
                title={`„${cancel?.title}" absagen?`}
                description={`Die ${cancel?.invitees ?? 0} Eingeladenen bekommen eine Absage per E-Mail und in der App. Die Sitzung verschwindet aus ihrem Kalender.`}
                confirmLabel="Absagen"
                cancelLabel="Zurück"
                variant="destructive"
                onConfirm={() => {
                    if (cancel) onChange({ ...cancel, status: 'ended', joined: 0 });
                    setCancel(null);
                    onOpen(null);
                    setNotice('Sitzung abgesagt');
                }}
            />
        </>
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

const PEOPLE = [
    'Yusuf Okafor',
    'Leonie Weber',
    'Omar Krüger',
    'Hanna Haddad',
    'Bilal Rahman',
    'Sara Nasser',
    'Jonas Yılmaz',
    'Maryam Schneider',
];

/** One session in a wide panel: when, who leads, who comes, the link, and its recording. */
function SessionSheet({
    session,
    onClose,
    onChange,
    onCancel,
}: {
    session: Session;
    onClose: () => void;
    onChange: (s: Session) => void;
    onCancel: () => void;
}) {
    const id = useId();
    const [note, setNote] = useState<string | null>(null);
    const s = session;
    const banner =
        s.status === 'live'
            ? {
                  tone: 'live' as const,
                  text: `Läuft seit ${time.format(new Date(s.start))} — ${s.joined} von ${s.invitees} sind drin.`,
              }
            : !s.host && s.status === 'scheduled'
              ? {
                    tone: 'warn' as const,
                    text: 'Noch niemand leitet diese Sitzung. Ohne Leitung kann sie nicht beginnen.',
                }
              : s.recording === 'failed'
                ? {
                      tone: 'warn' as const,
                      text: 'Die Aufnahme ist fehlgeschlagen. Die Rohdaten liegen noch vor — du kannst die Verarbeitung neu starten.',
                  }
                : null;

    return (
        <Sheet open onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(46rem,92vw)] max-w-none gap-0 p-0"
                onOpenAutoFocus={(e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement)
                        .querySelector<HTMLElement>('[data-sheet-title]')
                        ?.focus();
                }}
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <div
                            className={cn(
                                'flex size-12 shrink-0 items-center justify-center rounded-full',
                                s.status === 'live' ? 'bg-destructive/10' : 'bg-muted',
                            )}
                        >
                            <Video
                                className={cn(
                                    'size-6',
                                    s.status === 'live'
                                        ? 'text-destructive-tint-foreground'
                                        : 'text-muted-foreground',
                                )}
                                aria-hidden="true"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <SheetTitle
                                data-sheet-title
                                tabIndex={-1}
                                className="text-2xl tracking-tight outline-none"
                            >
                                {s.title}
                            </SheetTitle>
                            <SheetDescription>
                                {when(s.start)}–{until(s)} · {s.minutes} Min. ·{' '}
                                {s.course ?? 'Eigene Sitzung'}
                            </SheetDescription>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <Badge tone={STATUS[s.status].tone} dot>
                                    {STATUS[s.status].label}
                                </Badge>
                                <Badge tone={REC[s.recording].tone}>{REC[s.recording].label}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {s.status !== 'ended' && (
                                <Button>
                                    <Video aria-hidden="true" />{' '}
                                    {s.status === 'live' ? 'Beitreten' : 'Raum öffnen'}
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <IconButton
                                        label="Weitere Aktionen"
                                        icon={<EllipsisVertical aria-hidden="true" />}
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onSelect={() => setNote('Einladungslink kopiert')}
                                    >
                                        <Link2 aria-hidden="true" /> Link kopieren
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onSelect={() =>
                                            setNote(
                                                'Dupliziert — eine Woche später, gleiche Leitung und Eingeladene',
                                            )
                                        }
                                    >
                                        <CopyPlus aria-hidden="true" /> Duplizieren
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        disabled={s.status !== 'scheduled'}
                                        className="text-destructive-tint-foreground"
                                        onSelect={onCancel}
                                    >
                                        <XCircle aria-hidden="true" /> Absagen …
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {banner && (
                        <div
                            role="status"
                            className={cn(
                                'rounded-lg border px-4 py-3 text-sm',
                                banner.tone === 'live'
                                    ? 'border-destructive/30 bg-destructive/5'
                                    : 'border-warning/40 bg-warning/10 text-warning-tint-foreground',
                            )}
                        >
                            {banner.text}
                        </div>
                    )}
                    {note && (
                        <p role="status" className="text-sm text-muted-foreground">
                            {note}
                        </p>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <Part title="Leitung" text="Wer den Raum öffnet, stummschaltet und aufnimmt.">
                        <div className="flex items-center gap-3">
                            {s.host ? (
                                <InitialsAvatar name={s.host} size="sm" colored />
                            ) : (
                                <UserRoundX
                                    className="size-5 text-warning-tint-foreground"
                                    aria-hidden="true"
                                />
                            )}
                            <div className="min-w-0 flex-1">
                                <Label htmlFor={`${id}-host`} className="sr-only">
                                    Leitung
                                </Label>
                                <Combobox
                                    id={`${id}-host`}
                                    value={s.host ?? ''}
                                    options={HOSTS}
                                    onChange={(host) => onChange({ ...s, host: host || null })}
                                    placeholder="Lehrkraft wählen …"
                                    searchPlaceholder="Suchen …"
                                    emptyLabel="Niemand gefunden."
                                />
                            </div>
                        </div>
                    </Part>

                    <Part
                        title={
                            s.status === 'scheduled'
                                ? `Eingeladen (${s.invitees})`
                                : `Dabei (${s.joined} von ${s.invitees})`
                        }
                        text={
                            s.kind === 'class'
                                ? `Alle aus „${s.course}" — wer neu in den Kurs kommt, ist automatisch eingeladen.`
                                : 'Einzeln eingeladen.'
                        }
                        action={
                            s.kind === 'adhoc' && (
                                <Button size="sm" variant="outline">
                                    <Plus aria-hidden="true" /> Einladen
                                </Button>
                            )
                        }
                    >
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                            {PEOPLE.slice(0, Math.min(8, s.invitees)).map((p, i) => (
                                <li key={p} className="flex items-center gap-2">
                                    <InitialsAvatar name={p} size="sm" colored />
                                    <span className="flex-1 truncate">{p}</span>
                                    {s.status !== 'scheduled' &&
                                        (i < s.joined ? (
                                            <Badge tone="success" dot>
                                                {s.status === 'live' ? 'drin' : 'war da'}
                                            </Badge>
                                        ) : (
                                            <Badge tone="faint">fehlt</Badge>
                                        ))}
                                </li>
                            ))}
                        </ul>
                        {s.invitees > 8 && (
                            <p className="text-sm text-muted-foreground">
                                und {s.invitees - 8} weitere
                            </p>
                        )}
                    </Part>

                    <Part
                        title="Link"
                        text="Ein Link für alle: Eingeladene kommen direkt rein, alle anderen landen im Warteraum."
                    >
                        <div className="flex gap-2">
                            <Input
                                readOnly
                                value={`https://akademie.example.de/join/${(s.id * 7919).toString(36)}q4`}
                                aria-label="Einladungslink"
                                className="font-mono text-xs"
                            />
                            <Button
                                variant="outline"
                                onClick={() => setNote('Einladungslink kopiert')}
                            >
                                <Copy aria-hidden="true" /> Kopieren
                            </Button>
                        </div>
                    </Part>

                    <Part title="Aufnahme">
                        {s.recording === 'off' ? (
                            <p className="text-sm text-muted-foreground">
                                Diese Sitzung wird nicht aufgenommen.
                            </p>
                        ) : s.recording === 'none' ? (
                            <p className="text-sm text-muted-foreground">
                                Wird aufgenommen, sobald die Leitung startet. Danach erscheint sie
                                in „{s.course}".
                            </p>
                        ) : (
                            <div className="flex items-center gap-4 rounded-lg border border-border p-3">
                                <div className="flex h-16 w-28 shrink-0 items-center justify-center rounded-md bg-video-surface">
                                    {s.recording === 'completed' ? (
                                        <Clapperboard
                                            className="size-6 text-video-foreground"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <VideoOff
                                            className="size-6 text-video-foreground"
                                            aria-hidden="true"
                                        />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 text-sm">
                                    <div className="font-medium">{REC[s.recording].label}</div>
                                    <div className="text-muted-foreground">
                                        {s.recDuration
                                            ? mins(s.recDuration)
                                            : s.recording === 'capturing'
                                              ? 'läuft mit'
                                              : '—'}
                                        {s.recording === 'processing' &&
                                            ' · heute Nacht um 02:00 fertig'}
                                    </div>
                                </div>
                                {s.recording === 'failed' && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onChange({ ...s, recording: 'processing' })}
                                    >
                                        <RefreshCw aria-hidden="true" /> Neu verarbeiten
                                    </Button>
                                )}
                                {s.recording === 'completed' && (
                                    <Button size="sm" variant="outline">
                                        <Eye aria-hidden="true" /> Ansehen
                                    </Button>
                                )}
                            </div>
                        )}
                    </Part>
                </div>
            </SheetContent>
        </Sheet>
    );
}

/** Plan a session: for a course (everyone in it is invited) or on its own (pick people). */
function NewSessionDialog({
    open,
    onOpenChange,
    onCreate,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    onCreate: (title: string) => void;
}) {
    const id = useId();
    const [kind, setKind] = useState<Kind>('class');
    const [course, setCourse] = useState(COURSES[0]!);
    const [title, setTitle] = useState('');
    const [startNow, setStartNow] = useState(false);
    const [date, setDate] = useState('2026-10-02T18:00');
    const [minutes, setMinutes] = useState('60');
    const [host, setHost] = useState('');
    const [record, setRecord] = useState(true);
    const [notify, setNotify] = useState(true);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent closeLabel="Schließen" className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Neue Sitzung</DialogTitle>
                    <DialogDescription>
                        Für einen Kurs, oder eine eigene mit Menschen, die du einzeln einlädst.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div role="radiogroup" aria-label="Art" className="grid grid-cols-2 gap-2">
                        {(
                            [
                                ['class', 'Kurstermin', 'Alle im Kurs sind eingeladen'],
                                ['adhoc', 'Eigene Sitzung', 'Du lädst einzeln ein'],
                            ] as const
                        ).map(([value, label, hint]) => (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={kind === value}
                                onClick={() => setKind(value)}
                                className={cn(
                                    'rounded-lg border px-3 py-2 text-start',
                                    kind === value
                                        ? 'border-primary ring-1 ring-primary'
                                        : 'border-border hover:bg-muted',
                                )}
                            >
                                <div className="text-sm font-medium">{label}</div>
                                <div className="text-xs text-muted-foreground">{hint}</div>
                            </button>
                        ))}
                    </div>
                    {kind === 'class' && (
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-course`}>Kurs</Label>
                            <Select value={course} onValueChange={setCourse}>
                                <SelectTrigger id={`${id}-course`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COURSES.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-title`}>Titel</Label>
                        <Input
                            id={`${id}-title`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="z. B. Lektion 9: Das Verb"
                        />
                    </div>
                    <div className="grid grid-cols-[1fr_8rem] gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-when`}>Wann</Label>
                            <Input
                                id={`${id}-when`}
                                type="datetime-local"
                                value={date}
                                disabled={startNow}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-min`}>Dauer (Min.)</Label>
                            <Input
                                id={`${id}-min`}
                                inputMode="numeric"
                                value={minutes}
                                onChange={(e) => setMinutes(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Switch
                            id={`${id}-startNow`}
                            checked={startNow}
                            onCheckedChange={setStartNow}
                        />
                        <Label htmlFor={`${id}-startNow`} className="font-normal">
                            Sofort starten
                        </Label>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-host`}>Leitung</Label>
                        <Combobox
                            id={`${id}-host`}
                            value={host}
                            options={HOSTS}
                            onChange={setHost}
                            placeholder="Lehrkraft wählen …"
                            searchPlaceholder="Suchen …"
                            emptyLabel="Niemand gefunden."
                        />
                    </div>
                    {kind === 'adhoc' && (
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-why`}>
                                Worum geht es? (steht in der Einladung)
                            </Label>
                            <Textarea id={`${id}-why`} rows={2} />
                        </div>
                    )}
                    <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Switch
                                id={`${id}-record`}
                                checked={record}
                                onCheckedChange={setRecord}
                            />
                            <Label htmlFor={`${id}-record`} className="font-normal">
                                Aufnehmen und danach im Kurs zeigen
                            </Label>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Switch
                                id={`${id}-notify`}
                                checked={notify}
                                onCheckedChange={setNotify}
                            />
                            <Label htmlFor={`${id}-notify`} className="font-normal">
                                Einladungen per E-Mail und in der App verschicken
                            </Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Abbrechen
                    </Button>
                    <Button
                        disabled={!title.trim()}
                        onClick={() => {
                            onCreate(title);
                            onOpenChange(false);
                            setTitle('');
                        }}
                    >
                        {startNow ? 'Jetzt starten' : 'Planen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Recordings and settings
// ---------------------------------------------------------------------------

type Recording = {
    id: number;
    title: string;
    course: string;
    date: string;
    seconds: number | null;
    size: string;
    source: 'live' | 'upload';
    state: 'completed' | 'processing' | 'failed';
    published: boolean;
    shared: boolean;
};
const RECORDINGS: Recording[] = [
    {
        id: 1,
        title: 'Lektion 6: Das Pronomen',
        course: COURSES[0]!,
        date: '28.09.2026',
        seconds: 5340,
        size: '612 MB',
        source: 'live',
        state: 'completed',
        published: true,
        shared: false,
    },
    {
        id: 2,
        title: 'Tajwid: Nun Sakina',
        course: COURSES[1]!,
        date: '29.09.2026',
        seconds: 3560,
        size: '—',
        source: 'live',
        state: 'processing',
        published: false,
        shared: false,
    },
    {
        id: 3,
        title: 'Fiqh: Reinheit',
        course: COURSES[3]!,
        date: '27.09.2026',
        seconds: null,
        size: '—',
        source: 'live',
        state: 'failed',
        published: false,
        shared: false,
    },
    {
        id: 4,
        title: 'Lektion 5: Artikel',
        course: COURSES[0]!,
        date: '24.09.2026',
        seconds: 5410,
        size: '640 MB',
        source: 'live',
        state: 'completed',
        published: true,
        shared: true,
    },
    {
        id: 5,
        title: 'Einführung ins Hifz (Vortrag)',
        course: COURSES[2]!,
        date: '15.09.2026',
        seconds: 2710,
        size: '298 MB',
        source: 'upload',
        state: 'completed',
        published: false,
        shared: false,
    },
];

function RecordingsView({ scope }: { scope: 'all' | 'processing' | 'failed' }) {
    const [items, setItems] = useState(RECORDINGS);
    const [remove, setRemove] = useState<Recording | null>(null);
    const [share, setShare] = useState<Recording | null>(null);
    const shown = items.filter((r) => scope === 'all' || r.state === scope);
    const set = (r: Recording) => setItems((all) => all.map((x) => (x.id === r.id ? r : x)));
    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-8 py-8">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Aufnahmen</h1>
                    <p className="text-sm text-muted-foreground">
                        Aus den Sitzungen und hochgeladen. Veröffentlicht heißt: sichtbar im Kurs.
                    </p>
                </div>
                <Button>
                    <Plus aria-hidden="true" /> Video hochladen
                </Button>
            </header>
            <div className="grid grid-cols-3 gap-5">
                {shown.map((r) => (
                    <article
                        key={r.id}
                        className="flex flex-col overflow-hidden rounded-xl border border-border"
                    >
                        <div className="relative flex aspect-video items-center justify-center bg-video-surface">
                            {r.state === 'completed' ? (
                                <Clapperboard
                                    className="size-8 text-video-foreground"
                                    aria-hidden="true"
                                />
                            ) : r.state === 'processing' ? (
                                <Loader
                                    className="size-8 animate-spin text-video-foreground motion-reduce:animate-none"
                                    aria-hidden="true"
                                />
                            ) : (
                                <VideoOff
                                    className="size-8 text-video-foreground"
                                    aria-hidden="true"
                                />
                            )}
                            {r.seconds && (
                                <span className="absolute end-2 bottom-2 rounded bg-video-scrim px-1.5 py-0.5 text-xs text-video-foreground tabular-nums">
                                    {mins(r.seconds)}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col gap-2 p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h2 className="truncate text-sm font-medium">{r.title}</h2>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {r.course} · {r.date} ·{' '}
                                        {r.source === 'live' ? 'Live' : 'Hochgeladen'}
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <IconButton
                                            label={`Aktionen für ${r.title}`}
                                            icon={<EllipsisVertical aria-hidden="true" />}
                                        />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            disabled={r.state !== 'completed'}
                                            onSelect={() => set({ ...r, published: !r.published })}
                                        >
                                            {r.published ? (
                                                <EyeOff aria-hidden="true" />
                                            ) : (
                                                <Eye aria-hidden="true" />
                                            )}
                                            {r.published
                                                ? 'Zurückhalten'
                                                : 'Im Kurs veröffentlichen'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            disabled={r.state !== 'completed'}
                                            onSelect={() => setShare(r)}
                                        >
                                            <Share2 aria-hidden="true" /> Freigabelink …
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <FolderInput aria-hidden="true" /> In anderen Kurs
                                            verschieben …
                                        </DropdownMenuItem>
                                        <DropdownMenuItem disabled={r.state !== 'completed'}>
                                            <Download aria-hidden="true" /> Herunterladen ({r.size})
                                        </DropdownMenuItem>
                                        {r.state !== 'processing' && (
                                            <DropdownMenuItem
                                                onSelect={() => set({ ...r, state: 'processing' })}
                                            >
                                                <RefreshCw aria-hidden="true" /> Neu verarbeiten
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive-tint-foreground"
                                            onSelect={() => setRemove(r)}
                                        >
                                            <Trash2 aria-hidden="true" /> Löschen …
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="mt-auto flex flex-wrap gap-1.5">
                                {r.state === 'completed' ? (
                                    <Badge tone={r.published ? 'success' : 'faint'} dot>
                                        {r.published ? 'Im Kurs sichtbar' : 'Zurückgehalten'}
                                    </Badge>
                                ) : (
                                    <Badge
                                        tone={r.state === 'failed' ? 'destructive' : 'warning'}
                                        dot
                                    >
                                        {r.state === 'failed'
                                            ? 'Fehlgeschlagen'
                                            : 'Wird verarbeitet'}
                                    </Badge>
                                )}
                                {r.shared && <Badge tone="neutral">Link geteilt</Badge>}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
            <ConfirmActionDialog
                open={remove !== null}
                onOpenChange={(o) => !o && setRemove(null)}
                title={`„${remove?.title}" löschen?`}
                description="Das Video ist danach weg, auch für alle im Kurs und für geteilte Links."
                confirmLabel="Löschen"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={() => {
                    setItems((all) => all.filter((x) => x.id !== remove?.id));
                    setRemove(null);
                }}
            />
            <Dialog open={share !== null} onOpenChange={(o) => !o && setShare(null)}>
                <DialogContent closeLabel="Schließen">
                    <DialogHeader>
                        <DialogTitle>Freigabelink</DialogTitle>
                        <DialogDescription>
                            Wer den Link hat, sieht das Video — auch ohne Konto. Nur für Aufnahmen
                            ohne Lernende im Bild.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor="share-expires">Gültig bis</Label>
                        <Input id="share-expires" type="date" defaultValue="2026-12-31" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShare(null)}>
                            Abbrechen
                        </Button>
                        <Button
                            onClick={() => {
                                if (share) set({ ...share, shared: true });
                                setShare(null);
                            }}
                        >
                            <Link2 aria-hidden="true" /> Link erstellen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SettingsView() {
    const [guests, setGuests] = useState(true);
    const [sound, setSound] = useState(false);
    const [multi, setMulti] = useState(false);
    const row = (label: string, hint: string, control: ReactNode) => (
        <div className="flex items-center justify-between gap-6 py-4">
            <div>
                <div className="text-sm font-medium">{label}</div>
                <p className="text-sm text-muted-foreground">{hint}</p>
            </div>
            {control}
        </div>
    );
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-8 py-8">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">Live-Einstellungen</h1>
                <p className="text-sm text-muted-foreground">
                    Gilt für jede Sitzung; einzelne Sitzungen können einiges davon ändern.
                </p>
            </header>
            <section className="divide-y divide-border">
                <h2 className="pb-2 font-semibold">Im Raum</h2>
                {row(
                    'Gäste ohne Konto zulassen',
                    'Über den Link — sie warten, bis die Leitung sie hereinlässt.',
                    <Switch
                        checked={guests}
                        onCheckedChange={setGuests}
                        aria-label="Gäste ohne Konto zulassen"
                    />,
                )}
                {row(
                    'Ton, wenn sich jemand meldet',
                    'Die Leitung hört einen kurzen Ton bei jeder Meldung.',
                    <Switch
                        checked={sound}
                        onCheckedChange={setSound}
                        aria-label="Ton, wenn sich jemand meldet"
                    />,
                )}
                {row(
                    'Mehrere Bildschirme gleichzeitig teilen',
                    'Standard für neue Sitzungen.',
                    <Switch
                        checked={multi}
                        onCheckedChange={setMulti}
                        aria-label="Mehrere Bildschirme gleichzeitig teilen"
                    />,
                )}
            </section>
            <section className="divide-y divide-border">
                <h2 className="pb-2 font-semibold">Aufnahmen</h2>
                {row(
                    'Qualität',
                    'Größere Dateien, schärferes Bild.',
                    <Select defaultValue="1080p">
                        <SelectTrigger className="w-44" aria-label="Qualität">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="720p">720p (klein)</SelectItem>
                            <SelectItem value="1080p">1080p (empfohlen)</SelectItem>
                            <SelectItem value="1440p">1440p (groß)</SelectItem>
                        </SelectContent>
                    </Select>,
                )}
                {row(
                    'Bild',
                    'Wer im Video zu sehen ist.',
                    <Select defaultValue="speaker">
                        <SelectTrigger className="w-44" aria-label="Bild">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="speaker">Wer spricht</SelectItem>
                            <SelectItem value="grid">Alle im Raster</SelectItem>
                        </SelectContent>
                    </Select>,
                )}
                {row(
                    'Verarbeitung',
                    'Nachts, wenn niemand live ist.',
                    <Input
                        type="time"
                        defaultValue="02:00"
                        className="w-32"
                        aria-label="Verarbeitungszeit"
                    />,
                )}
                {row(
                    'Aufbewahren',
                    'Danach werden fertige Aufnahmen gelöscht. 0 = für immer.',
                    <div className="flex items-center gap-2">
                        <Input
                            inputMode="numeric"
                            defaultValue="365"
                            className="w-24"
                            aria-label="Aufbewahren (Tage)"
                        />
                        <span className="text-sm text-muted-foreground">Tage</span>
                    </div>,
                )}
            </section>
            <div>
                <Button>Speichern</Button>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

function LivePage({
    initialView = { kind: 'sessions', scope: 'all' },
    openSession = null,
}: {
    initialView?: View;
    openSession?: number | null;
}) {
    const [sessions, setSessions] = useState(SESSIONS);
    const [view, setView] = useState<View>(initialView);
    const [open, setOpen] = useState<number | null>(openSession);
    const change = (s: Session) => setSessions((all) => all.map((x) => (x.id === s.id ? s : x)));
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
                    <AppRailItem icon={Video} label="Live" active />
                    <AppRailItem
                        icon={CreditCard}
                        label="Zahlungen"
                        onClick={linkTo('Pages/Zahlungen', 'Bestellungen')}
                    />
                    <AppRailItem icon={Palette} label="Design" onClick={() => {}} />
                    <AppRailSpacer />
                    <AppRailItem icon={Settings2} label="Betrieb" onClick={() => {}} />
                    <AppRailItem icon={UserRound} label="Konto" onClick={() => {}} />
                </AppRail>
            }
            sidebar={<LiveMenu view={view} onView={setView} sessions={sessions} />}
        >
            {view.kind === 'sessions' && (
                <SessionsView
                    key={view.scope}
                    sessions={sessions}
                    scope={view.scope}
                    onChange={change}
                    open={open}
                    onOpen={setOpen}
                />
            )}
            {view.kind === 'recordings' && <RecordingsView key={view.scope} scope={view.scope} />}
            {view.kind === 'settings' && <SettingsView />}
        </AdminLayout>
    );
}

/**
 * The Live area as it could look: sessions this week at a glance with what
 * is live now on top, one session as a panel, recordings and settings. Click
 * around — it responds, but saves nothing.
 */
const meta: Meta<typeof LivePage> = {
    title: 'Pages/Live',
    component: LivePage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.live')) localStorage.removeItem(k);
    },
};
export default meta;

export const Sitzungen: StoryObj<typeof LivePage> = {
    render: () => <LivePage />,
};

/** A session running right now: who is in, the recording running. */
export const SitzungLaeuft: StoryObj<typeof LivePage> = {
    render: () => <LivePage openSession={1} />,
};

/** A session with nobody to lead it: the panel says so and offers the teachers. */
export const SitzungOhneLeitung: StoryObj<typeof LivePage> = {
    render: () => <LivePage openSession={4} />,
};

export const NeueSitzung: StoryObj<typeof LivePage> = {
    render: () => <LivePage />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Neue Sitzung' }));
        const dialog = await within(canvasElement.ownerDocument.body).findByRole('dialog', {
            name: 'Neue Sitzung',
        });
        await expect(within(dialog).getByRole('button', { name: 'Planen' })).toBeDisabled();
    },
};

export const Aufnahmen: StoryObj<typeof LivePage> = {
    render: () => <LivePage initialView={{ kind: 'recordings', scope: 'all' }} />,
};

export const Einstellungen: StoryObj<typeof LivePage> = {
    render: () => <LivePage initialView={{ kind: 'settings' }} />,
};
