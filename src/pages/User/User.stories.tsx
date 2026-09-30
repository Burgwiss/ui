import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
    ArrowLeft,
    BookOpen,
    CalendarClock,
    Copy,
    CreditCard,
    Download,
    Eye,
    FileText,
    GraduationCap,
    History,
    House,
    KeyRound,
    ListPlus,
    MoreHorizontal,
    NotebookPen,
    Palette,
    Settings2,
    ShieldCheck,
    Trash2,
    UserRound,
    Users as UsersIcon,
    Wallet,
} from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { IconButton } from '../../atoms/IconButton';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { Textarea } from '../../atoms/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../molecules/Card';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../molecules/Select';
import { StatCard } from '../../molecules/StatCard';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../../organisms/Table';
import { AdminLayout } from '../../templates/AdminLayout';

/**
 * PAGE PROTOTYPE — one person in the admin (`/admin/users/{id}` in Burgwiss).
 * Everything today's user page can do, on one scrolling page with a section
 * menu on the left: status and what it needs from you, role, profile and
 * the school's own profile fields, courses (enrol, drop), admin notes, the
 * history of the account, sign-in security (password link, two-step reset,
 * view as this person), and the GDPR corner (export, remove, erase).
 * Non-functional: example content, no server.
 */

type Role = 'student' | 'teacher' | 'admin' | 'sponsor';
type Status = 'active' | 'invited' | 'expired' | 'pending' | 'deleted';

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

const OFFERINGS = [
    'Arabisch für Anfänger · Herbst 2026 (Berlin)',
    'Tajwid Grundlagen · Winter 2026',
    'Hifz-Kreis: Juz ʿAmma · Samstags',
    'Fiqh des Alltags · Online',
];

type Enrolment = {
    id: number;
    course: string;
    offering: string;
    status: 'active' | 'completed' | 'dropped';
    enrolledAt: string;
    doneAt: string | null;
    payment: string;
};
const ENROLMENTS: Enrolment[] = [
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
const ENROLMENT_STATUS = {
    active: ['Läuft', 'success'],
    completed: ['Abgeschlossen', 'neutral'],
    dropped: ['Abgemeldet', 'muted'],
} as const;

type Note = { id: number; text: string; by: string; at: string };

const SECTIONS = [
    { id: 'ueberblick', label: 'Überblick', icon: UserRound },
    { id: 'profil', label: 'Profil', icon: FileText },
    { id: 'kurse', label: 'Kurse', icon: GraduationCap },
    { id: 'notizen', label: 'Notizen', icon: NotebookPen },
    { id: 'verlauf', label: 'Verlauf', icon: History },
    { id: 'sicherheit', label: 'Anmeldung & Sicherheit', icon: ShieldCheck },
    { id: 'daten', label: 'Daten (DSGVO)', icon: Wallet },
] as const;

function Section({
    id,
    title,
    description,
    action,
    children,
}: {
    id: string;
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <Card id={id} className="scroll-mt-6">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="grid gap-1">
                    <CardTitle>
                        <h2>{title}</h2>
                    </CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                {action}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function UserPage({
    status: initialStatus = 'active',
    twoFactor = true,
}: {
    status?: Status;
    twoFactor?: boolean;
}) {
    const id = useId();
    const [status, setStatus] = useState<Status>(initialStatus);
    const [role, setRole] = useState<Role>('student');
    const [name, setName] = useState('Leonie Weber');
    const [email, setEmail] = useState('leonie.weber@example.de');
    const [phone, setPhone] = useState('+49 151 2345678');
    const [city, setCity] = useState('Köln');
    const [saved, setSaved] = useState({ name, email, phone, city });
    const [enrolments, setEnrolments] = useState(ENROLMENTS);
    const [notes, setNotes] = useState<Note[]>([
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
    const [confirm, setConfirm] = useState<
        null | 'remove' | 'password' | 'twofactor' | { drop: number } | { note: number }
    >(null);
    const [erasing, setErasing] = useState(false);
    const [eraseText, setEraseText] = useState('');
    const [viewAs, setViewAs] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [offering, setOffering] = useState('');

    const dirty = JSON.stringify(saved) !== JSON.stringify({ name, email, phone, city });
    const say = (text: string) => setNotice(text);

    const statusBanner = {
        active: null,
        invited: {
            tone: 'neutral' as const,
            text: 'Eingeladen am 28.09.2026 — der Link läuft in 5 Tagen ab. Noch nicht angenommen.',
            actions: (
                <>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => say('Einladungslink kopiert')}
                    >
                        <Copy aria-hidden="true" /> Link kopieren
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => say('Einladung erneut gesendet (neuer 7-Tage-Link)')}
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
            tone: 'warning' as const,
            text: 'Die Einladung ist vor 3 Tagen abgelaufen, ohne angenommen zu werden.',
            actions: (
                <Button size="sm" onClick={() => setStatus('invited')}>
                    Neu einladen
                </Button>
            ),
        },
        pending: {
            tone: 'warning' as const,
            text: 'Hat sich am 29.09.2026 selbst registriert und wartet auf deine Freigabe. Bis dahin kann sie sich nicht anmelden.',
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
            tone: 'muted' as const,
            text: 'Entfernt am 30.09.2026 — kann sich nicht mehr anmelden. Kurse, Zahlungen und Zertifikate sind noch da.',
            actions: (
                <>
                    <Button size="sm" onClick={() => setStatus('active')}>
                        Wiederherstellen
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => setErasing(true)}>
                        Endgültig löschen (DSGVO) …
                    </Button>
                </>
            ),
        },
    }[status];

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
                        storageKey: 'storybook.page.user',
                    }}
                >
                    <SidebarHeader>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={linkTo('Pages/Nutzerverwaltung', 'Nutzerliste')}
                        >
                            <ArrowLeft aria-hidden="true" /> Alle Nutzer
                        </Button>
                        <div className="flex items-center gap-3 px-2 pt-2">
                            <div className="min-w-0">
                                <div className="truncate font-semibold">{name}</div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {email}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 px-2 pt-1">
                            <Badge tone={STATUS_TONE[status]} dot>
                                {STATUS_LABEL[status]}
                            </Badge>
                            <Badge tone="neutral">{ROLE_LABEL[role]}</Badge>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarMenu>
                                {SECTIONS.map(({ id: s, label, icon: Icon }) => (
                                    <SidebarMenuItem key={s}>
                                        <SidebarMenuButton asChild>
                                            <a href={`#${s}`}>
                                                <Icon aria-hidden="true" />
                                                <span>{label}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            }
        >
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-8 py-8">
                {/* Überblick */}
                <section
                    id="ueberblick"
                    aria-labelledby={`${id}-h`}
                    className="flex scroll-mt-6 flex-col gap-4"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <InitialsAvatar name={name} size="lg" colored />
                            <div>
                                <h1
                                    id={`${id}-h`}
                                    className="text-2xl font-semibold tracking-tight"
                                >
                                    {name}
                                </h1>
                                <p className="text-sm text-muted-foreground">{email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`${id}-role`} className="sr-only">
                                Rolle
                            </Label>
                            <Select
                                value={role}
                                onValueChange={(v) => {
                                    setRole(v as Role);
                                    say(`Rolle geändert: ${ROLE_LABEL[v as Role]}`);
                                }}
                            >
                                <SelectTrigger id={`${id}-role`} className="w-40">
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
                                onClick={() => setViewAs(true)}
                                disabled={status !== 'active'}
                            >
                                <Eye aria-hidden="true" /> Als {name.split(' ')[0]} ansehen
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <IconButton
                                        label="Weitere Aktionen"
                                        icon={<MoreHorizontal aria-hidden="true" />}
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
                                    {status === 'deleted' ? (
                                        <DropdownMenuItem onSelect={() => setStatus('active')}>
                                            Wiederherstellen
                                        </DropdownMenuItem>
                                    ) : (
                                        <DropdownMenuItem
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

                    {statusBanner && (
                        <div
                            role="status"
                            className={
                                statusBanner.tone === 'warning'
                                    ? 'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-tint-foreground'
                                    : 'flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm'
                            }
                        >
                            <span>{statusBanner.text}</span>
                            <span className="flex gap-2">{statusBanner.actions}</span>
                        </div>
                    )}

                    {notice && (
                        <p role="status" className="text-sm text-muted-foreground">
                            Ausgeführt: {notice}
                        </p>
                    )}

                    <div className="grid grid-cols-4 gap-3">
                        <StatCard
                            label="Mitglied seit"
                            value="08.01.2026"
                            icon={<CalendarClock aria-hidden="true" />}
                        />
                        <StatCard
                            label="Zuletzt aktiv"
                            value="28.09.2026"
                            hint="vor 2 Tagen, 19:40 Uhr"
                        />
                        <StatCard
                            label="Kurse"
                            value={enrolments.filter((e) => e.status === 'active').length}
                            hint={`${enrolments.length} insgesamt`}
                        />
                        <StatCard label="Bezahlt" value="210,00 €" hint="2 Bestellungen" />
                    </div>
                </section>

                <Section
                    id="profil"
                    title="Profil"
                    description="Was die Person selbst auch sieht und ändern kann. Eine neue E-Mail-Adresse muss sie bestätigen."
                    action={
                        <Button
                            disabled={!dirty}
                            onClick={() => {
                                setSaved({ name, email, phone, city });
                                say(
                                    email !== saved.email
                                        ? 'Profil gespeichert — Bestätigungs-Mail an die neue Adresse gesendet'
                                        : 'Profil gespeichert',
                                );
                            }}
                        >
                            Speichern
                        </Button>
                    }
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-name`}>Name</Label>
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
                            <Label htmlFor={`${id}-phone`}>Telefon</Label>
                            <Input
                                id={`${id}-phone`}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor={`${id}-city`}>Stadt</Label>
                            <Input
                                id={`${id}-city`}
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Telefon und Stadt sind Profilfelder deiner Schule — festgelegt unter Nutzer
                        › Profilfelder.
                    </p>
                </Section>

                <Section
                    id="kurse"
                    title="Kurse"
                    description="Jede Ausführung, in der sie war oder ist."
                    action={
                        <Button variant="outline" onClick={() => setEnrolling(true)}>
                            <ListPlus aria-hidden="true" /> Einschreiben
                        </Button>
                    }
                >
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
                </Section>

                <Section
                    id="notizen"
                    title="Notizen"
                    description="Nur für Admins. Die Person sieht sie nie."
                >
                    <div className="grid gap-2">
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
                                            id: Date.now(),
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
                    </div>
                    <ul className="mt-4 flex flex-col divide-y divide-border">
                        {notes.map((n) => (
                            <li key={n.id} className="flex items-start justify-between gap-4 py-3">
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
                </Section>

                <Section id="verlauf" title="Verlauf" description="Wann mit dem Konto was geschah.">
                    <ol className="flex flex-col gap-2 text-sm">
                        {[
                            ['Konto angelegt', '08.01.2026, 09:12'],
                            ['Eingeladen von Amina Berger', '08.01.2026, 09:12'],
                            ['E-Mail bestätigt', '08.01.2026, 18:03'],
                            ['Freigegeben', '08.01.2026, 18:03'],
                            ...(status === 'deleted'
                                ? [['Entfernt von Amina Berger', '30.09.2026, 11:02']]
                                : []),
                        ].map(([what, when]) => (
                            <li
                                key={what}
                                className="flex justify-between gap-4 border-b border-border pb-2 last:border-0"
                            >
                                <span>{what}</span>
                                <span className="text-muted-foreground tabular-nums">{when}</span>
                            </li>
                        ))}
                    </ol>
                </Section>

                <Section id="sicherheit" title="Anmeldung & Sicherheit">
                    <div className="flex flex-col divide-y divide-border">
                        <Row
                            title="Anmeldung in zwei Schritten"
                            text={
                                twoFactor
                                    ? 'Eingerichtet. Zurücksetzen, wenn sie ihr Handy verloren hat.'
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
                        <Row
                            title="Passwort"
                            text="Du siehst es nie. Schick ihr einen Link, mit dem sie ein neues setzt."
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
                        <Row
                            title="Als diese Person ansehen"
                            text="Die App so sehen, wie sie sie sieht — nur lesend, protokolliert, mit einem Banner, bis du aufhörst."
                            action={
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={status !== 'active'}
                                    onClick={() => setViewAs(true)}
                                >
                                    Ansehen
                                </Button>
                            }
                        />
                    </div>
                </Section>

                <Section
                    id="daten"
                    title="Daten (DSGVO)"
                    description="Auskunft und Löschung nach Art. 15, 17 und 20."
                >
                    <div className="flex flex-col divide-y divide-border">
                        <Row
                            title="Datenexport"
                            text={
                                exportState === 'none'
                                    ? 'Noch kein Export angefordert.'
                                    : exportState === 'preparing'
                                      ? 'Export wird vorbereitet …'
                                      : 'Fertig — der Download gilt noch 7 Tage (bis 07.10.2026).'
                            }
                            action={
                                exportState === 'ready' ? (
                                    <Button size="sm" onClick={() => say('Export heruntergeladen')}>
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
                        <Row
                            title="Entfernen"
                            text="Kann sich nicht mehr anmelden; alles bleibt erhalten und lässt sich wiederherstellen."
                            action={
                                status === 'deleted' ? (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setStatus('active')}
                                    >
                                        Wiederherstellen
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setConfirm('remove')}
                                    >
                                        Entfernen …
                                    </Button>
                                )
                            }
                        />
                        <Row
                            title="Endgültig löschen"
                            text="Name, E-Mail und alle persönlichen Angaben werden unwiderruflich gelöscht. Rechnungen bleiben (gesetzliche Aufbewahrung), aber ohne Namen."
                            action={
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setErasing(true)}
                                >
                                    Endgültig löschen …
                                </Button>
                            }
                        />
                    </div>
                </Section>
            </div>

            <ConfirmActionDialog
                open={confirm !== null}
                onOpenChange={(o) => !o && setConfirm(null)}
                title={
                    confirm === 'remove'
                        ? `${name} entfernen?`
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
                        ? 'Sie kann sich nicht mehr anmelden. Kurse, Zahlungen und Zertifikate bleiben erhalten, und du kannst sie jederzeit wiederherstellen.'
                        : confirm === 'password'
                          ? `${email} bekommt eine E-Mail mit einem Link, der eine Stunde gilt.`
                          : confirm === 'twofactor'
                            ? `Bis sie es neu einrichtet, genügt für ${email} das Passwort allein. Wir schicken ihr eine E-Mail darüber.`
                            : confirm && 'drop' in confirm
                              ? 'Sie verliert den Zugang zu den Inhalten dieser Ausführung. Eine Zahlung wird dadurch nicht erstattet.'
                              : 'Die Notiz ist danach weg.'
                }
                confirmLabel={
                    confirm === 'password'
                        ? 'Senden'
                        : confirm === 'twofactor'
                          ? 'Zurücksetzen'
                          : confirm && typeof confirm === 'object' && 'drop' in confirm
                            ? 'Abmelden'
                            : confirm === 'remove'
                              ? 'Entfernen'
                              : 'Löschen'
                }
                cancelLabel="Abbrechen"
                variant={confirm === 'password' ? 'default' : 'destructive'}
                onConfirm={() => {
                    const c = confirm;
                    setConfirm(null);
                    if (c === 'remove') setStatus('deleted');
                    else if (c === 'password') say('Link zum Passwort-Setzen gesendet');
                    else if (c === 'twofactor') say('Anmeldung in zwei Schritten zurückgesetzt');
                    else if (c && 'drop' in c)
                        setEnrolments((es) =>
                            es.map((e) =>
                                e.id === c.drop
                                    ? { ...e, status: 'dropped', doneAt: '30.09.2026' }
                                    : e,
                            ),
                        );
                    else if (c && 'note' in c) setNotes((ns) => ns.filter((n) => n.id !== c.note));
                }}
            />

            <Dialog open={erasing} onOpenChange={setErasing}>
                <DialogContent closeLabel="Schließen">
                    <DialogHeader>
                        <DialogTitle>{name} endgültig löschen?</DialogTitle>
                        <DialogDescription>
                            Das lässt sich nicht rückgängig machen. Name, E-Mail, Profilfelder,
                            Notizen und Anmeldedaten werden gelöscht. Rechnungen bleiben ohne Namen
                            erhalten.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-erase`}>
                            Tippe den Namen zur Bestätigung: {name}
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
                            disabled={eraseText !== name}
                            onClick={() => {
                                setErasing(false);
                                linkTo('Pages/Nutzerverwaltung', 'Nutzerliste')();
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
                        <DialogTitle>Als {name} ansehen?</DialogTitle>
                        <DialogDescription>
                            Du siehst die App, wie sie sie sieht — nur lesend. Alles wird
                            protokolliert, und ein Banner bleibt oben, bis du „Beenden" drückst.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-code`}>Code aus deiner App</Label>
                        <Input id={`${id}-code`} inputMode="numeric" placeholder="123 456" />
                        <p className="text-xs text-muted-foreground">
                            Dein eigenes Konto hat die Anmeldung in zwei Schritten — bestätige kurz,
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
                                say(`Du siehst die App jetzt als ${name}`);
                            }}
                        >
                            Ansehen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={enrolling} onOpenChange={setEnrolling}>
                <DialogContent closeLabel="Schließen">
                    <DialogHeader>
                        <DialogTitle>In einen Kurs einschreiben</DialogTitle>
                        <DialogDescription>
                            Ohne Bezahlung, wie von Hand eingetragen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-offering`}>Ausführung</Label>
                        <Combobox
                            id={`${id}-offering`}
                            value={offering}
                            options={OFFERINGS}
                            onChange={setOffering}
                            placeholder="Kurs und Termin wählen …"
                            searchPlaceholder="Suchen …"
                            emptyLabel="Keine Ausführung gefunden."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEnrolling(false)}>
                            Abbrechen
                        </Button>
                        <Button
                            disabled={!offering}
                            onClick={() => {
                                const [course, off] = offering.split(' · ');
                                setEnrolments((es) => [
                                    {
                                        id: Date.now(),
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
                            }}
                        >
                            Einschreiben
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

function Row({
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

/**
 * One person, everything about them on one page: status and what it needs
 * from you, role, profile, courses, notes, history, sign-in security and
 * the GDPR corner. Click around — it responds, but saves nothing.
 */
const meta: Meta<typeof UserPage> = {
    title: 'Pages/Nutzer',
    component: UserPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
};
export default meta;

export const Nutzerseite: StoryObj<typeof UserPage> = {
    render: () => <UserPage />,
};

/** Registered on her own; the page leads with "Freigeben". */
export const WartetAufFreigabe: StoryObj<typeof UserPage> = {
    render: () => <UserPage status="pending" twoFactor={false} />,
};

/** Invited, not yet accepted: copy the link, send again, or call it off. */
export const Eingeladen: StoryObj<typeof UserPage> = {
    render: () => <UserPage status="invited" twoFactor={false} />,
};

/** Removed: restore, or erase for good (GDPR) after typing the name. */
export const Entfernt: StoryObj<typeof UserPage> = {
    render: () => <UserPage status="deleted" />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('status')).toHaveTextContent(/Entfernt am/);
        await userEvent.click(canvas.getAllByRole('button', { name: /Endgültig löschen/ })[0]!);
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('dialog');
        const erase = within(dialog).getByRole('button', { name: 'Endgültig löschen' });
        await expect(erase).toBeDisabled();
        await userEvent.type(within(dialog).getByRole('textbox'), 'Leonie Weber');
        await expect(erase).toBeEnabled();
        await userEvent.click(within(dialog).getByRole('button', { name: 'Abbrechen' }));
    },
};
