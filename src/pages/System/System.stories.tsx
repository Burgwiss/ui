import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
    Activity,
    ArrowRight,
    BookOpen,
    Bug,
    CircleCheck,
    CircleX,
    CreditCard,
    EllipsisVertical,
    Eye,
    HandCoins,
    House,
    Info,
    KeyRound,
    ListTodo,
    Lock,
    Mail,
    PanelsTopLeft,
    RefreshCw,
    RotateCcw,
    School,
    ScrollText,
    Settings2,
    ShieldCheck,
    Smartphone,
    Square,
    TriangleAlert,
    UserRound,
    Users as UsersIcon,
    Video,
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

import { Badge, type BadgeTone } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
import { IconButton } from '../../atoms/IconButton';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { PasswordInput } from '../../atoms/PasswordInput';
import type { GridColumn } from '../../hooks/grid/types';
import type { GridActionItem, RowId } from '../../hooks/gridActions';
import { useGrid } from '../../hooks/useGrid';
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
import { AdminLayout } from '../../templates/AdminLayout';
import { GridPage } from '../../templates/GridPage';

/**
 * PAGE PROTOTYPE — the System area of the admin, formerly "Betrieb": only the
 * technical side of the school stays here. Everything that belongs to one
 * feature moved to that feature's area — and every problem shown here points
 * to the place where it is fixed. Same shell as Kurse, Nutzer, Live,
 * Zahlungen and Sponsoren. Non-functional: example content, no server.
 *
 * Grounded in `app/Domain/Diagnostics` (the checks and their German messages),
 * `app/Domain/Jobs`, `app/Domain/Audit` and `app/Domain/Platform/Secrets`.
 * Anything here with no backend behind it today carries a `MOCK-ONLY` comment.
 */

// ---------------------------------------------------------------------------
// Shared: time, where things are fixed
// ---------------------------------------------------------------------------

const NOW = new Date('2026-10-01T09:40:00');
const SCHOOL = 'Al-Nur Akademie';
const ME = { name: 'Amina Berger', email: 'amina.berger@alnur-akademie.example' };

const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const dayTimeFmt = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
});
const longFmt = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});
const at = (iso: string) => new Date(iso);
/** „heute, 09:40“, „gestern, 18:02“, otherwise „28.09., 11:05“. */
function when(iso: string) {
    const d = at(iso);
    const days = Math.round(
        (new Date(NOW.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86400000,
    );
    if (days === 0) return `heute, ${timeFmt.format(d)}`;
    if (days === 1) return `gestern, ${timeFmt.format(d)}`;
    return dayTimeFmt.format(d);
}
function duration(fromIso: string, toIso: string) {
    const s = Math.max(0, Math.round((at(toIso).getTime() - at(fromIso).getTime()) / 1000));
    return s < 60 ? `${s} s` : `${Math.floor(s / 60)} Min. ${s % 60} s`;
}

const OPTIONS_LABELS = {
    trigger: 'Tabellenoptionen',
    columns: 'Spalten',
    density: 'Zeilenhöhe',
    comfortable: 'Bequem',
    compact: 'Kompakt',
    selection: 'Zeilen auswählen',
    reset: 'Zurücksetzen',
};

type Scope = 'all' | 'failed' | 'warning';
type View =
    | { kind: 'overview'; scope: Scope }
    | { kind: 'jobs' }
    | { kind: 'audit' }
    | { kind: 'credentials' }
    | { kind: 'school' }
    | { kind: 'mobile' };

/**
 * A place in the admin where something is set or fixed. `story` opens the
 * matching page prototype where one exists; `view` stays inside System.
 */
type Target = {
    label: string;
    href: string;
    story?: readonly [string, string];
    view?: View;
};

const TO = {
    paymentsSettings: { label: 'Zahlungen › Einstellungen', href: '#/admin/payments/settings' },
    paymentsStorno: {
        label: 'Zahlungen › Widerrufe & Stornos',
        href: '#/admin/payments/withdrawals',
        story: ['Pages/Admin/Zahlungen', 'WiderrufeUndStornos'],
    },
    courses: {
        label: 'Kurse › Alle Kurse',
        href: '#/admin/courses',
        story: ['Pages/Admin/Kursverwaltung', 'Kursliste'],
    },
    coursesSettings: { label: 'Kurse › Einstellungen', href: '#/admin/courses/settings' },
    usersList: {
        label: 'Nutzer › Wartet auf Freigabe',
        href: '#/admin/users?status=pending',
        story: ['Pages/Admin/Nutzerverwaltung', 'Nutzerliste'],
    },
    usersLogin: { label: 'Nutzer › Anmeldung', href: '#/admin/users/sign-in' },
    liveSettings: {
        label: 'Live › Einstellungen',
        href: '#/admin/live/settings',
        story: ['Pages/Admin/Live', 'Einstellungen'],
    },
    websiteTheme: { label: 'Website › Theme', href: '#/admin/website/theme' },
    websiteSettings: { label: 'Website › Einstellungen', href: '#/admin/website/settings' },
    sponsorsSettings: {
        label: 'Sponsoren › Einstellungen',
        href: '#/admin/sponsors/settings',
        story: ['Pages/Admin/Sponsoren', 'Einstellungen'],
    },
    backupRunbook: { label: 'Anleitung: Backups', href: '#/docs/runbooks/backup' },
    jobs: { label: 'System › Hintergrundaufgaben', href: '#/admin/jobs', view: { kind: 'jobs' } },
    mobile: { label: 'Mobile App', href: '#/admin/mobile', view: { kind: 'mobile' } },
} satisfies Record<string, Target>;

/** A link to where something is fixed: another page prototype, or a view inside System. */
function TargetLink({
    target,
    onView,
    className,
}: {
    target: Target;
    onView?: (v: View) => void;
    className?: string;
}) {
    return (
        <a
            href={target.href}
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                if (target.view) onView?.(target.view);
                else if (target.story) linkTo(target.story[0], target.story[1])(e);
            }}
            className={cn(
                'inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline',
                className,
            )}
        >
            {target.label}
            <ArrowRight className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
        </a>
    );
}

// ---------------------------------------------------------------------------
// Example data: the health checks
// ---------------------------------------------------------------------------

type CheckStatus = 'ok' | 'warning' | 'failed' | 'skipped';
const AREAS = ['Kurse', 'Zahlungen', 'Live', 'Website', 'Nutzer & Datenschutz', 'Server'] as const;
type Area = (typeof AREAS)[number];

type Check = {
    id: string;
    /** The real label from `diagnostics.check_labels`. */
    name: string;
    area: Area;
    status: CheckStatus;
    /** The real `short_*` summary. */
    summary: string;
    /** The real full message; only for checks that are not OK. */
    message?: string;
    /** What the check looks at, in plain words. */
    what: string;
    /** Since when the check is in this state (non-OK only). */
    since?: string;
    fix?: Target;
};

// MOCK-ONLY: the area of a check, its "Beheben" target and "since when" do not exist —
// a check today has a name, status, message and summary, nothing that says where it belongs.
const CHECKS: Check[] = [
    // Kurse
    {
        id: 'classes',
        name: 'Durchführungen',
        area: 'Kurse',
        status: 'warning',
        summary: '1 laufend ohne Lehrkraft',
        message:
            '1 laufende Durchführung(en) ohne zugewiesene Lehrkraft. Weise eine Lehrkraft zu oder sage die Durchführung ab.',
        what: 'Ob jede laufende Durchführung eine Lehrkraft hat. Ohne Lehrkraft beantwortet niemand Nachrichten, und Live-Sitzungen haben keine Leitung.',
        since: '2026-09-30T07:00:00',
        fix: TO.courses,
    },
    {
        id: 'lessons',
        name: 'Lektionen',
        area: 'Kurse',
        status: 'ok',
        summary: '14 gesamt',
        what: 'Ob jede laufende Durchführung zu einem Kurs mit Lektionen gehört, und ob manuell freigegebene Kurse nicht seit über einer Woche stillstehen.',
    },
    {
        id: 'course_offering_publish_state',
        name: 'Veröffentlichung der Ausführungen',
        area: 'Kurse',
        status: 'ok',
        summary: 'stimmig',
        what: 'Ob veröffentlichte Ausführungen zu einem veröffentlichten Kurs gehören.',
    },
    {
        id: 'certificates',
        name: 'Zertifikats-Rückstau',
        area: 'Kurse',
        status: 'ok',
        summary: '118 aktiv',
        what: 'Ob jedes ausgestellte Zertifikat ein PDF bekommen hat, das die Lernenden herunterladen können.',
    },
    {
        id: 'attendance_certificates',
        name: 'Integrität der Anwesenheitszertifikate',
        area: 'Kurse',
        status: 'ok',
        summary: 'in Ordnung',
        what: 'Ob Anwesenheitszertifikate zu den erfassten Anwesenheiten passen.',
    },
    {
        id: 'ai',
        name: 'KI-Endpunkt',
        area: 'Kurse',
        status: 'skipped',
        summary: 'nicht eingerichtet',
        message:
            'KI-Assistent nicht konfiguriert — KI-Konversationslektionen sind planmäßig nicht verfügbar',
        what: 'Ob der KI-Assistent für KI-Konversationslektionen antwortet und keine Antworten hängen bleiben.',
        fix: TO.coursesSettings,
    },
    // Zahlungen
    {
        id: 'paypal',
        name: 'PayPal-Zugangsdaten',
        area: 'Zahlungen',
        status: 'failed',
        summary: 'Webhook-ID fehlt',
        message:
            'PayPal-Zugangsdaten authentifizieren, aber keine Webhook-ID gesetzt (PAYPAL_WEBHOOK_ID) — eingehende Zahlungs-Ereignisse werden abgelehnt, sodass erfasste Zahlungen nie bestätigt werden. Registriere einen Webhook im PayPal-Dashboard und speichere dessen ID.',
        what: 'Ob PayPal die Zugangsdaten annimmt und ob PayPal der Schule Bescheid sagen kann, wenn eine Zahlung eingeht. Fehlt das, bezahlen Leute, und ihre Bestellung bleibt offen.',
        since: '2026-09-29T22:15:00',
        fix: TO.paymentsSettings,
    },
    {
        id: 'payment_gateway',
        name: 'Zahlungs-Gateway',
        area: 'Zahlungen',
        status: 'ok',
        summary: 'erreichbar',
        what: 'Ob der Zahlungsanbieter erreichbar ist.',
    },
    {
        id: 'paid_without_entitlement',
        name: 'Bezahlt ohne Zugang',
        area: 'Zahlungen',
        status: 'ok',
        summary: 'Jede bezahlte Bestellung hat Zugang',
        what: 'Ob jede Person, die bezahlt hat, auch in ihren Kurs oder Lernpfad hineinkommt.',
    },
    {
        id: 'stale_payments',
        name: 'Hängende Zahlungen',
        area: 'Zahlungen',
        status: 'warning',
        summary: 'Stornos offen',
        message:
            '1 ausgestellte Rechnung(en) gehören zu abgelaufenen oder stornierten Buchungen auf Rechnung und brauchen eine Stornorechnung.',
        what: 'Ob die Bücher vollständig sind: jede bezahlte Bestellung hat eine Rechnung, jede stornierte Buchung ihre Stornorechnung.',
        since: '2026-09-30T14:00:00',
        fix: TO.paymentsStorno,
    },
    {
        id: 'subscriptions',
        name: 'Abonnements',
        area: 'Zahlungen',
        status: 'ok',
        summary: 'Abonnements in Ordnung',
        what: 'Ob laufende Abonnements pünktlich abgebucht werden und keines über sein Enddatum hinaus läuft.',
    },
    {
        id: 'program_access',
        name: 'Programmzugang',
        area: 'Zahlungen',
        status: 'ok',
        summary: 'in Ordnung',
        what: 'Ob Lernpfad-Zugänge mit der Bezahlung übereinstimmen.',
    },
    // Live
    {
        id: 'livekit',
        name: 'LiveKit',
        area: 'Live',
        status: 'ok',
        summary: 'erreichbar',
        what: 'Ob der Server für Live-Sitzungen erreichbar ist und ein sicheres Secret hat.',
    },
    {
        id: 'livekit_clock',
        name: 'LiveKit-Uhr',
        area: 'Live',
        status: 'ok',
        summary: 'synchron',
        what: 'Ob die Uhr des Live-Servers richtig geht — sonst lehnt er Zugänge ab.',
    },
    {
        id: 'live_turn',
        name: 'TURN-Relay (443)',
        area: 'Live',
        status: 'ok',
        summary: 'erreichbar',
        what: 'Ob Teilnehmende hinter strengen Firmen- oder Schulnetzen trotzdem in Live-Sitzungen kommen.',
    },
    {
        id: 'recording_backlog',
        name: 'Aufzeichnungs-Rückstau',
        area: 'Live',
        status: 'ok',
        summary: 'kein Rückstau',
        what: 'Ob Aufzeichnungen fertig verarbeitet werden und keine in der Aufnahme hängen bleibt.',
    },
    {
        id: 'recording_storage',
        name: 'Speicher für Aufzeichnungen',
        area: 'Live',
        status: 'ok',
        summary: 'erreichbar',
        what: 'Ob der Speicher für Aufzeichnungen erreichbar ist.',
    },
    {
        id: 'reminders',
        name: 'Erinnerungen',
        area: 'Live',
        status: 'ok',
        summary: 'planmäßig',
        what: 'Ob die Erinnerungen vor Live-Sitzungen rechtzeitig rausgehen.',
    },
    // Website
    {
        id: 'theme_contrast',
        name: 'Theme-Kontrast',
        area: 'Website',
        status: 'warning',
        summary: '2 Paare unter AA',
        message:
            '2 Farbpaare in deinem aktiven Theme liegen unter 4,5:1 — am schlechtesten ist Akzent auf Karte mit 3,1:1. Öffne den Website-Editor und pass die Palette an.',
        what: 'Ob Text in deinen Schulfarben gut lesbar ist — mindestens 4,5:1 Kontrast, wie es die Barrierefreiheit verlangt.',
        since: '2026-09-28T17:05:00',
        fix: TO.websiteTheme,
    },
    {
        id: 'theme_assets',
        name: 'Logo und Markenschrift',
        area: 'Website',
        status: 'ok',
        summary: 'Logo und Schrift in Ordnung',
        what: 'Ob dein Logo eine Variante für dunkle Seiten hat und deine Schrift die Seite nicht ausbremst.',
    },
    {
        id: 'home_blocks',
        name: 'Landingpage-Blöcke',
        area: 'Website',
        status: 'ok',
        summary: '7 Blöcke rendern',
        what: 'Ob jeder sichtbare Block der Startseite auch etwas zeigt.',
    },
    {
        id: 'hreflang',
        name: 'Sprachlinks (hreflang)',
        area: 'Website',
        status: 'ok',
        summary: '48 Sprachlinks geprüft',
        what: 'Ob die deutsche und die englische Fassung jeder Seite richtig aufeinander verweisen — das braucht Google.',
    },
    {
        id: 'contact_recipient',
        name: 'Empfängerin des Kontaktformulars',
        area: 'Website',
        status: 'ok',
        summary: 'Kontaktadresse hinterlegt',
        what: 'Ob Nachrichten aus dem Kontaktformular bei jemandem ankommen.',
    },
    {
        id: 'contact_captcha',
        name: 'Spam-Schutz des Kontaktformulars',
        area: 'Website',
        status: 'skipped',
        summary: 'abgeschaltet',
        what: 'Ob der Spam-Schutz des Kontaktformulars funktioniert, wenn er an ist.',
        fix: TO.websiteSettings,
    },
    // Nutzer & Datenschutz
    {
        id: 'pending_approvals',
        name: 'Ausstehende Freigaben',
        area: 'Nutzer & Datenschutz',
        status: 'warning',
        summary: '3 ausstehend',
        message: '3 Person(en) warten unter /admin/users auf deine Freigabe.',
        what: 'Ob sich jemand registriert hat und auf deine Freigabe wartet.',
        since: '2026-09-30T19:22:00',
        fix: TO.usersList,
    },
    {
        id: 'two_factor_recovery',
        name: 'Wiederherstellungscodes',
        area: 'Nutzer & Datenschutz',
        status: 'ok',
        summary: '4 eingerichtet, Codes vorhanden',
        what: 'Ob alle mit Anmeldung in zwei Schritten noch Wiederherstellungscodes haben.',
    },
    {
        id: 'google_oauth',
        name: 'Google-OAuth',
        area: 'Nutzer & Datenschutz',
        status: 'skipped',
        summary: 'nicht eingerichtet',
        message: 'Google-Anmeldung nicht konfiguriert — Passwort-Anmeldung nicht betroffen',
        what: 'Ob „Mit Google anmelden“ funktioniert.',
        fix: TO.usersLogin,
    },
    {
        id: 'oidc',
        name: 'Unternehmens-Single-Sign-on',
        area: 'Nutzer & Datenschutz',
        status: 'skipped',
        summary: 'nicht eingerichtet',
        message: 'Single Sign-on nicht konfiguriert — Passwort-Anmeldung nicht betroffen',
        what: 'Ob die Anmeldung über den Identitätsanbieter eines Unternehmens funktioniert.',
        fix: TO.usersLogin,
    },
    {
        id: 'data_export',
        name: 'DSGVO-Datenexporte',
        area: 'Nutzer & Datenschutz',
        status: 'ok',
        summary: 'Exporte in Ordnung',
        what: 'Ob jede angeforderte Datenauskunft fertig wird — das ist eine gesetzliche Pflicht.',
    },
    {
        id: 'stale_erasure',
        name: 'Hängende DSGVO-Löschungen',
        area: 'Nutzer & Datenschutz',
        status: 'ok',
        summary: 'Anonymisierungen aktuell',
        what: 'Ob gelöschte Konten nach Ablauf der Frist wirklich anonymisiert werden.',
    },
    {
        id: 'soft_deletes_near_expiry',
        name: 'Bald endgültig gelöschte Konten',
        area: 'Nutzer & Datenschutz',
        status: 'ok',
        summary: 'keine ablaufend',
        what: 'Ob ein gelöschtes Konto bald endgültig weg ist — bis dahin lässt es sich wiederherstellen.',
    },
    {
        id: 'sponsorship_grants',
        name: 'Verwaiste Förderzusagen',
        area: 'Nutzer & Datenschutz',
        status: 'ok',
        summary: 'Sponsoring-Freigaben in Ordnung',
        what: 'Ob jede Freigabe für einen Sponsor noch zu einer bestehenden Einschreibung gehört.',
    },
    // Server
    {
        id: 'backup',
        name: 'Backups',
        area: 'Server',
        status: 'failed',
        summary: '31 Std. alt',
        message:
            'Der neueste Off-Box-Postgres-Dump ist 31 Std. alt (Grenze 26 Std.) — die Sicherung der letzten Nacht fehlt. Backup-Compose-Dienst prüfen.',
        what: 'Ob jede Nacht eine Sicherung der Datenbank außerhalb des Servers abgelegt wird. Ohne sie ist bei einem Serverausfall alles seit der letzten Sicherung verloren.',
        since: '2026-10-01T04:00:00',
        fix: TO.backupRunbook,
    },
    {
        id: 'database',
        name: 'Datenbank',
        area: 'Server',
        status: 'ok',
        summary: 'erreichbar',
        what: 'Ob die Datenbank antwortet.',
    },
    {
        id: 'migrations_current',
        name: 'Datenbank-Migrationen',
        area: 'Server',
        status: 'ok',
        summary: 'alle angewendet',
        what: 'Ob die Datenbank zur installierten Version passt.',
    },
    {
        id: 'queue',
        name: 'Warteschlange',
        area: 'Server',
        status: 'ok',
        summary: '0 wartend, 0 fehlgeschlagen',
        what: 'Ob Aufgaben im Hintergrund abgearbeitet werden — E-Mails, Importe, Aufzeichnungen.',
    },
    {
        id: 'jobs',
        name: 'Hintergrundjobs',
        area: 'Server',
        status: 'ok',
        summary: '14 gesamt',
        what: 'Ob keine Hintergrundaufgabe hängt und in den letzten 24 Stunden keine fehlgeschlagen ist.',
        fix: TO.jobs,
    },
    {
        id: 'schedule',
        name: 'Aufgabenplaner',
        area: 'Server',
        status: 'ok',
        summary: 'läuft',
        what: 'Ob der Planer läuft, der nächtliche und regelmäßige Aufgaben startet.',
    },
    {
        id: 'mail_configured',
        name: 'E-Mail-Konfiguration',
        area: 'Server',
        status: 'ok',
        summary: 'über smtp',
        what: 'Ob Absenderadresse und Absendername gesetzt sind.',
    },
    {
        id: 'smtp_reachable',
        name: 'SMTP-Erreichbarkeit',
        area: 'Server',
        status: 'ok',
        summary: 'smtp.alnur-akademie.example:587',
        what: 'Ob der Server für ausgehende E-Mails erreichbar ist.',
    },
    {
        id: 'mail_delivery',
        name: 'E-Mail-Zustellung',
        area: 'Server',
        status: 'ok',
        summary: 'Mailer smtp fehlerfrei',
        what: 'Ob in letzter Zeit E-Mails nicht verschickt werden konnten.',
    },
    {
        id: 'used_disk_space',
        name: 'Belegter Speicherplatz',
        area: 'Server',
        status: 'ok',
        summary: '58 %',
        what: 'Wie voll die Festplatte des Servers ist.',
    },
    {
        id: 'debug_mode',
        name: 'Debug-Modus',
        area: 'Server',
        status: 'ok',
        summary: 'aus',
        what: 'Ob der Debug-Modus aus ist — an würde er Fehlerdetails öffentlich zeigen.',
    },
    {
        id: 'secret_store',
        name: 'Secret-Store',
        area: 'Server',
        status: 'ok',
        summary: 'lesbar',
        what: 'Ob gespeicherte Zugangsdaten sich entschlüsseln lassen.',
    },
];

const CHECK_STATUS: Record<CheckStatus, { label: string; tone: BadgeTone; rank: number }> = {
    failed: { label: 'Fehler', tone: 'destructive', rank: 0 },
    warning: { label: 'Warnung', tone: 'warning', rank: 1 },
    skipped: { label: 'Nicht eingerichtet', tone: 'muted', rank: 2 },
    ok: { label: 'OK', tone: 'success', rank: 3 },
};
const count = (checks: Check[], s: CheckStatus) => checks.filter((c) => c.status === s).length;

/**
 * The area as the grid groups it: areas with a problem first, then the order
 * of the rail. A sort key rides in front of the name and the group label drops it.
 */
function areaKey(area: Area, checks: Check[]) {
    const worst = Math.min(
        ...checks.filter((c) => c.area === area).map((c) => CHECK_STATUS[c.status].rank),
    );
    return `${worst}${AREAS.indexOf(area)}|${area}`;
}

const LAST_RUN = '2026-10-01T09:40:00';

type Run = { id: number; at: string; status: CheckStatus; summary: string; change?: boolean };

/**
 * The latest runs of one check, then the runs where its result changed — so a
 * problem that has lasted two days does not fill the list with the same line.
 */
function historyOf(c: Check): Run[] {
    // MOCK-ONLY: no page shows a check's earlier runs today; only the latest result is rendered.
    const minus = (iso: string, min: number) =>
        new Date(at(iso).getTime() - min * 60000).toISOString();
    const runs: Run[] = [0, 15, 30, 45].map((m, i) => ({
        id: i,
        at: minus(LAST_RUN, m),
        status: c.status,
        summary: c.summary,
    }));
    if (c.since) {
        runs.push(
            { id: 10, at: c.since, status: c.status, summary: c.summary, change: true },
            { id: 11, at: minus(c.since, 15), status: 'ok', summary: 'in Ordnung' },
        );
    }
    if (c.status === 'failed' || c.status === 'warning') {
        // An earlier episode that came and went.
        runs.push(
            {
                id: 20,
                at: '2026-09-24T12:00:00',
                status: 'ok',
                summary: 'in Ordnung',
                change: true,
            },
            {
                id: 21,
                at: '2026-09-24T11:15:00',
                status: c.status,
                summary: c.summary,
                change: true,
            },
        );
    }
    return runs;
}

// ---------------------------------------------------------------------------
// Example data: background jobs
// ---------------------------------------------------------------------------

type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
type JobType = 'import' | 'scan' | 'notify' | 'recording' | 'export';
type Job = {
    id: number;
    type: JobType;
    /** Who started it, or null for the system. */
    by: string | null;
    status: JobStatus;
    startedAt: string | null;
    finishedAt: string | null;
    done: number;
    /** Null while the total is unknown. */
    total: number | null;
    unit: string;
    attempts: number;
    subject: string;
    params: [string, string][];
    result?: string;
    failure?: string;
    log: [string, string][];
};

/** The real labels from `jobs.types`. */
const JOB_TYPES: Record<JobType, string> = {
    import: 'CSV-Import',
    scan: 'Virus-Scan',
    notify: 'Lektionsfreigabe-Benachrichtigungen',
    recording: 'Sitzungsaufzeichnung verarbeiten',
    export: 'DSGVO-Datenexport',
};
const JOB_STATUS: Record<JobStatus, { label: string; tone: BadgeTone }> = {
    queued: { label: 'Wartet', tone: 'muted' },
    running: { label: 'Läuft', tone: 'neutral' },
    succeeded: { label: 'Fertig', tone: 'success' },
    failed: { label: 'Fehlgeschlagen', tone: 'destructive' },
    cancelled: { label: 'Abgebrochen', tone: 'faint' },
};
const cancellable = (j: Job) => j.status === 'running' || j.status === 'queued';
const retryable = (j: Job) => j.status === 'failed' || j.status === 'cancelled';

const JOBS: Job[] = [
    {
        id: 812,
        type: 'import',
        by: 'Amina Berger',
        status: 'running',
        startedAt: '2026-10-01T09:31:00',
        finishedAt: null,
        done: 340,
        total: 1200,
        unit: 'Zeilen',
        attempts: 1,
        subject: 'Import #57 · teilnehmende-herbst-2026.csv',
        params: [
            ['Datei', 'teilnehmende-herbst-2026.csv (1.200 Zeilen)'],
            ['Importiert als', 'Nutzer mit Einschreibung'],
            ['Bestehende Konten', 'aktualisieren, nicht doppelt anlegen'],
            ['Einladungen', 'werden verschickt'],
        ],
        log: [
            ['09:31:02', 'Datei gelesen — 1.200 Zeilen, 6 Spalten erkannt'],
            ['09:31:03', 'Spalten zugeordnet: Name, E-Mail, Kurs, Ausführung, Telefon, Notiz'],
            ['09:33:40', '100 Zeilen verarbeitet — 96 angelegt, 4 aktualisiert'],
            ['09:36:12', '200 Zeilen verarbeitet — 191 angelegt, 9 aktualisiert'],
            ['09:38:51', 'Zeile 287 übersprungen: E-Mail-Adresse ungültig („lea.fischer@mail“)'],
            ['09:39:30', '340 Zeilen verarbeitet — 324 angelegt, 15 aktualisiert, 1 übersprungen'],
        ],
    },
    {
        id: 811,
        type: 'scan',
        by: 'Hanna Haddad',
        status: 'running',
        startedAt: '2026-10-01T09:39:20',
        finishedAt: null,
        done: 0,
        total: null,
        unit: 'Dateien',
        attempts: 1,
        subject: 'Anhang · hausaufgabe-lektion-4.pdf',
        params: [
            ['Datei', 'hausaufgabe-lektion-4.pdf (2,4 MB)'],
            ['Hochgeladen in', 'Unterhaltung mit Samira Haddou'],
        ],
        log: [['09:39:20', 'Scan gestartet']],
    },
    {
        id: 810,
        type: 'notify',
        by: null,
        status: 'queued',
        startedAt: null,
        finishedAt: null,
        done: 0,
        total: 31,
        unit: 'Empfänger',
        attempts: 0,
        subject: 'Arabisch A1 · Lektion 5 freigegeben',
        params: [
            ['Kurs', 'Arabisch A1 · Herbst 2026 · Online'],
            ['Lektion', 'Lektion 5: Die Sonnenbuchstaben'],
            ['Kanäle', 'App und E-Mail'],
        ],
        log: [],
    },
    {
        id: 809,
        type: 'recording',
        by: null,
        status: 'succeeded',
        startedAt: '2026-10-01T02:00:04',
        finishedAt: '2026-10-01T02:14:07',
        done: 4,
        total: 4,
        unit: 'Spuren',
        attempts: 1,
        subject: 'Aufzeichnung · Deutsch für den Beruf B1 – Termin 6',
        params: [
            ['Sitzung', 'Deutsch für den Beruf B1 – Termin 6 (30.09., 18:00)'],
            ['Spuren', '4 (Leitung, Bildschirm, 2 Teilnehmende)'],
        ],
        result: 'Zusammengeführt zu einer Datei, 1:28 Std., 612 MB — für den Kurs sichtbar.',
        log: [
            ['02:00:04', 'Verarbeitung gestartet'],
            ['02:09:51', '4 von 4 Spuren zusammengeführt'],
            ['02:14:07', 'Hochgeladen und veröffentlicht'],
        ],
    },
    {
        id: 808,
        type: 'export',
        by: 'Omar Krüger',
        status: 'succeeded',
        startedAt: '2026-09-30T18:02:10',
        finishedAt: '2026-09-30T18:03:02',
        done: 1,
        total: 1,
        unit: 'Export',
        attempts: 1,
        subject: 'Datenexport für Omar Krüger',
        params: [
            ['Für', 'Omar Krüger (selbst angefordert)'],
            ['Umfang', 'Profil, Einschreibungen, Nachrichten, Zahlungen, Zertifikate'],
        ],
        result: 'ZIP mit 14 Dateien, 2,1 MB. Der Download-Link gilt 7 Tage.',
        log: [
            ['18:02:10', 'Export gestartet'],
            ['18:03:01', '14 Dateien zusammengestellt'],
            ['18:03:02', 'Link per E-Mail an Omar Krüger geschickt'],
        ],
    },
    {
        id: 807,
        type: 'notify',
        by: null,
        status: 'succeeded',
        startedAt: '2026-09-30T07:00:01',
        finishedAt: '2026-09-30T07:00:48',
        done: 28,
        total: 28,
        unit: 'Empfänger',
        attempts: 1,
        subject: 'Pflege-Fachsprache · Lektion 3 freigegeben',
        params: [
            ['Kurs', 'Pflege-Fachsprache · Herbst 2026 · Potsdam'],
            ['Lektion', 'Lektion 3: Übergabe am Krankenbett'],
        ],
        result: '28 Benachrichtigungen verschickt.',
        log: [
            ['07:00:01', 'Gestartet'],
            ['07:00:48', '28 von 28 verschickt'],
        ],
    },
    {
        id: 806,
        type: 'import',
        by: 'Mosa Khallaf',
        status: 'cancelled',
        startedAt: '2026-09-29T16:20:00',
        finishedAt: '2026-09-29T16:22:31',
        done: 120,
        total: 860,
        unit: 'Zeilen',
        attempts: 1,
        subject: 'Import #56 · warteliste-tajwid.csv',
        params: [
            ['Datei', 'warteliste-tajwid.csv (860 Zeilen)'],
            ['Importiert als', 'Nutzer mit Einschreibung'],
        ],
        result: '120 Zeilen verarbeitet, dann auf Wunsch angehalten. Die 120 bleiben angelegt.',
        log: [
            ['16:20:00', 'Gestartet'],
            ['16:22:10', 'Abbruch angefordert von Mosa Khallaf'],
            ['16:22:31', 'Nach Zeile 120 angehalten'],
        ],
    },
    {
        id: 805,
        type: 'recording',
        by: null,
        status: 'failed',
        startedAt: '2026-09-29T02:00:02',
        finishedAt: '2026-09-29T02:03:40',
        done: 1,
        total: 3,
        unit: 'Spuren',
        attempts: 3,
        subject: 'Aufzeichnung · Tajwid Grundlagen – Termin 4',
        params: [
            ['Sitzung', 'Tajwid Grundlagen – Termin 4 (28.09., 19:00)'],
            ['Spuren', '3'],
        ],
        failure: 'Die Datei ist im Speicher nicht mehr vorhanden.',
        log: [
            ['02:00:02', 'Verarbeitung gestartet (Versuch 3 von 3)'],
            ['02:01:15', 'Spur 1 von 3 gelesen'],
            ['02:03:40', 'Spur 2: Datei nicht gefunden — abgebrochen'],
        ],
    },
    {
        id: 804,
        type: 'scan',
        by: 'Samira Haddou',
        status: 'succeeded',
        startedAt: '2026-09-28T15:12:00',
        finishedAt: '2026-09-28T15:12:09',
        done: 1,
        total: 1,
        unit: 'Dateien',
        attempts: 1,
        subject: 'Anhang · arbeitsblatt-alif-ba.pdf',
        params: [['Datei', 'arbeitsblatt-alif-ba.pdf (880 KB)']],
        result: 'Sauber.',
        log: [
            ['15:12:00', 'Scan gestartet'],
            ['15:12:09', 'Keine Funde'],
        ],
    },
    {
        id: 803,
        type: 'import',
        by: 'Amina Berger',
        status: 'failed',
        startedAt: '2026-09-28T11:05:00',
        finishedAt: '2026-09-28T11:05:02',
        done: 0,
        total: 0,
        unit: 'Zeilen',
        attempts: 1,
        subject: 'Import #55 · export-altes-system.csv',
        params: [['Datei', 'export-altes-system.csv']],
        // MOCK-ONLY: the reason text; a real import reports its own wording.
        failure:
            'Die Kopfzeile hat keine Spalte „E-Mail“ — ohne sie lässt sich niemand zuordnen. Nichts wurde angelegt.',
        log: [
            ['11:05:00', 'Datei gelesen'],
            ['11:05:02', 'Spalte „E-Mail“ fehlt — abgebrochen'],
        ],
    },
    {
        id: 802,
        type: 'export',
        by: 'Leonie Weber',
        status: 'succeeded',
        startedAt: '2026-09-27T20:41:00',
        finishedAt: '2026-09-27T20:41:51',
        done: 1,
        total: 1,
        unit: 'Export',
        attempts: 1,
        subject: 'Datenexport für Leonie Weber',
        params: [['Für', 'Leonie Weber (selbst angefordert)']],
        result: 'ZIP mit 9 Dateien, 640 KB. Der Download-Link gilt 7 Tage.',
        log: [
            ['20:41:00', 'Export gestartet'],
            ['20:41:51', 'Link per E-Mail an Leonie Weber geschickt'],
        ],
    },
    {
        id: 801,
        type: 'recording',
        by: null,
        status: 'succeeded',
        startedAt: '2026-09-27T02:00:03',
        finishedAt: '2026-09-27T02:09:30',
        done: 2,
        total: 2,
        unit: 'Spuren',
        attempts: 1,
        subject: 'Aufzeichnung · Arabisch A1 – Termin 3',
        params: [['Sitzung', 'Arabisch A1 – Termin 3 (26.09., 17:00)']],
        result: 'Zusammengeführt zu einer Datei, 58 Min., 402 MB.',
        log: [
            ['02:00:03', 'Verarbeitung gestartet'],
            ['02:09:30', 'Hochgeladen und veröffentlicht'],
        ],
    },
];

// ---------------------------------------------------------------------------
// Example data: the audit log
// ---------------------------------------------------------------------------

type AuditGroup =
    | 'Nutzer & Anmeldung'
    | 'Datenschutz'
    | 'Nachrichten & Kanäle'
    | 'Kurse'
    | 'Zahlungen'
    | 'Live'
    | 'Website'
    | 'Sponsoren'
    | 'System';

type AuditEntry = {
    id: number;
    at: string;
    /** Null for "System / Cron". */
    actor: string | null;
    actorRole?: string;
    /** The stored action key, e.g. `user.role_changed`. */
    action: string;
    /** The real label from `audit.actions`. */
    label: string;
    group: AuditGroup;
    subject: string;
    subjectKind: string;
    subjectTarget?: Target;
    change?: { field: string; from: string; to: string }[];
    details?: [string, string][];
};

const STAFF: Record<string, string> = {
    'Amina Berger': 'Admin',
    'Mosa Khallaf': 'Admin',
    'Samira Haddou': 'Lehrkraft',
    'Omar Krüger': 'Lernende:r',
    'Dr. Katrin Vogel': 'Sponsor',
};

const userTarget = (name: string): Target => ({
    label: name,
    href: `#/admin/users?search=${encodeURIComponent(name)}`,
    story: ['Pages/Admin/Nutzerverwaltung', 'NutzerOffen'],
});

const AUDIT: AuditEntry[] = [
    {
        id: 40,
        at: '2026-10-01T09:31:00',
        actor: 'Amina Berger',
        action: 'import.started',
        label: 'Import gestartet',
        group: 'Nutzer & Anmeldung',
        subject: 'Import #57 · teilnehmende-herbst-2026.csv',
        subjectKind: 'Import',
        subjectTarget: TO.jobs,
        details: [['Zeilen', '1.200']],
    },
    {
        id: 39,
        at: '2026-10-01T09:12:00',
        actor: 'Mosa Khallaf',
        action: 'message.thread_inspected',
        label: 'Konversation eingesehen (Aufsicht)',
        group: 'Nachrichten & Kanäle',
        subject: 'Yusuf Okafor ↔ Samira Haddou',
        subjectKind: 'Unterhaltung',
        subjectTarget: {
            label: 'Yusuf Okafor ↔ Samira Haddou',
            href: '#/admin/messages/41',
            story: ['Pages/Admin/Kommunikation', 'UnterhaltungSheet'],
        },
        details: [
            ['Kurs', 'Arabisch A1 · Herbst 2026 · Online'],
            ['Inhalt', 'wird nie ins Protokoll geschrieben'],
        ],
    },
    {
        id: 38,
        at: '2026-10-01T08:55:00',
        actor: 'Amina Berger',
        action: 'user.role_changed',
        label: 'Rolle geändert',
        group: 'Nutzer & Anmeldung',
        subject: 'Karim Saleh',
        subjectKind: 'Nutzer',
        subjectTarget: userTarget('Karim Saleh'),
        change: [{ field: 'Rolle', from: 'Lernende:r', to: 'Lehrkraft' }],
    },
    {
        id: 37,
        at: '2026-10-01T08:40:00',
        actor: null,
        action: 'certificate.issued',
        label: 'Zertifikat ausgestellt',
        group: 'Kurse',
        subject: 'Fiqh des Alltags – Lea Fischer',
        subjectKind: 'Zertifikat',
    },
    {
        id: 36,
        at: '2026-10-01T08:02:00',
        actor: 'Dr. Katrin Vogel',
        action: 'sponsor.report_viewed',
        label: 'Sponsorenbericht eingesehen',
        group: 'Sponsoren',
        subject: 'Stiftung Bildungsbrücke',
        subjectKind: 'Sponsor',
        subjectTarget: {
            label: 'Stiftung Bildungsbrücke',
            href: '#/admin/sponsors/1',
            story: ['Pages/Admin/Sponsoren', 'SponsorSheet'],
        },
    },
    {
        id: 35,
        at: '2026-09-30T18:03:00',
        actor: null,
        action: 'data_export.completed',
        label: 'Datenexport bereit',
        group: 'Datenschutz',
        subject: 'Omar Krüger',
        subjectKind: 'Nutzer',
        subjectTarget: userTarget('Omar Krüger'),
    },
    {
        id: 34,
        at: '2026-09-30T18:02:00',
        actor: 'Omar Krüger',
        action: 'data_export.requested',
        label: 'Datenexport angefordert',
        group: 'Datenschutz',
        subject: 'Omar Krüger',
        subjectKind: 'Nutzer',
        subjectTarget: userTarget('Omar Krüger'),
    },
    {
        id: 33,
        at: '2026-09-30T17:51:00',
        actor: 'Amina Berger',
        action: 'user.impersonation_stopped',
        label: 'Identitätswechsel beendet',
        group: 'Nutzer & Anmeldung',
        subject: 'Leonie Weber',
        subjectKind: 'Nutzer',
        subjectTarget: userTarget('Leonie Weber'),
        details: [['Dauer', '7 Minuten']],
    },
    {
        id: 32,
        at: '2026-09-30T17:44:00',
        actor: 'Amina Berger',
        action: 'user.impersonation_started',
        label: 'Identitätswechsel gestartet',
        group: 'Nutzer & Anmeldung',
        subject: 'Leonie Weber',
        subjectKind: 'Nutzer',
        subjectTarget: userTarget('Leonie Weber'),
    },
    {
        id: 31,
        at: '2026-09-30T16:10:00',
        actor: 'Mosa Khallaf',
        action: 'channel.message_deleted',
        label: 'Kanalnachricht gelöscht',
        group: 'Nachrichten & Kanäle',
        subject: 'Kanal „Fragen zur Grammatik“',
        subjectKind: 'Kanal',
        subjectTarget: {
            label: 'Kanal „Fragen zur Grammatik“',
            href: '#/admin/channels/3',
            story: ['Pages/Admin/Kommunikation', 'KanalSheet'],
        },
        details: [
            ['Kurs', 'Arabisch A1 · Herbst 2026 · Online'],
            ['Geschrieben von', 'Bilal Rahman'],
        ],
    },
    {
        id: 30,
        at: '2026-09-30T15:20:00',
        actor: 'Amina Berger',
        action: 'certificate.revoked',
        label: 'Zertifikat widerrufen',
        group: 'Kurse',
        subject: 'Tajwid Grundlagen – Bilal Rahman',
        subjectKind: 'Zertifikat',
        change: [{ field: 'Status', from: 'Ausgestellt', to: 'Widerrufen' }],
        details: [['Grund', 'Versehentlich vor der Abschlussprüfung ausgestellt']],
    },
    {
        id: 29,
        at: '2026-09-30T14:05:00',
        actor: 'Mosa Khallaf',
        action: 'payment.refunded',
        label: 'Zahlung erstattet',
        group: 'Zahlungen',
        subject: 'Bestellung #2041',
        subjectKind: 'Bestellung',
        subjectTarget: {
            label: 'Bestellung #2041',
            href: '#/admin/payments/orders/2041',
            story: ['Pages/Admin/Zahlungen', 'Bestellungen'],
        },
        change: [{ field: 'Status', from: 'Bezahlt', to: 'Erstattet' }],
        details: [
            ['Betrag', '189,00 €'],
            ['Über', 'PayPal'],
        ],
    },
    {
        id: 28,
        at: '2026-09-30T11:30:00',
        actor: 'Amina Berger',
        action: 'school.settings.updated',
        label: 'Schul-Einstellungen geändert',
        group: 'System',
        subject: SCHOOL,
        subjectKind: 'Schule',
        subjectTarget: {
            label: 'System › Schule',
            href: '#/admin/system/school',
            view: { kind: 'school' },
        },
        change: [{ field: 'Zeitzone', from: 'Europe/London', to: 'Europe/Berlin' }],
    },
    {
        id: 27,
        at: '2026-09-30T10:02:00',
        actor: 'Amina Berger',
        action: 'platform.secret.set',
        label: 'Zugangsdatum gesetzt',
        group: 'System',
        subject: 'E-Mail (SMTP) · SMTP-Passwort',
        subjectKind: 'Zugangsdatum',
        subjectTarget: {
            label: 'System › Zugangsdaten',
            href: '#/admin/system/credentials',
            view: { kind: 'credentials' },
        },
        details: [['Wert', 'steht nie im Protokoll — nur, dass er geändert wurde']],
    },
    {
        id: 26,
        at: '2026-09-30T03:00:00',
        actor: null,
        action: 'account.erased',
        label: 'Personenbezogene Daten gelöscht (DSGVO)',
        group: 'Datenschutz',
        subject: 'Gelöschtes Konto (#1187)',
        subjectKind: 'Nutzer',
        details: [
            ['Gelöscht am', '01.09.2026'],
            ['Frist', '30 Tage'],
        ],
    },
    {
        id: 25,
        at: '2026-09-29T16:22:00',
        actor: 'Mosa Khallaf',
        action: 'import.cancelled',
        label: 'Import abgebrochen',
        group: 'Nutzer & Anmeldung',
        subject: 'Import #56 · warteliste-tajwid.csv',
        subjectKind: 'Import',
        subjectTarget: TO.jobs,
    },
    {
        id: 24,
        at: '2026-09-29T15:02:00',
        actor: 'Amina Berger',
        action: 'course_offering.published',
        label: 'Ausführung veröffentlicht',
        group: 'Kurse',
        subject: 'Arabisch A1 · Herbst 2026 · Online',
        subjectKind: 'Ausführung',
        subjectTarget: {
            label: 'Arabisch A1 · Herbst 2026 · Online',
            href: '#/admin/offerings/12',
            story: ['Pages/Admin/Kommunikation', 'InDerAusfuehrung'],
        },
        change: [{ field: 'Status', from: 'Entwurf', to: 'Veröffentlicht' }],
    },
    {
        id: 23,
        at: '2026-09-29T14:40:00',
        actor: 'Amina Berger',
        action: 'user.two_factor_reset_by_admin',
        label: 'Anmeldung in zwei Schritten zurückgesetzt',
        group: 'Nutzer & Anmeldung',
        subject: 'Thomas Berger',
        subjectKind: 'Nutzer',
        subjectTarget: userTarget('Thomas Berger'),
    },
    {
        id: 22,
        at: '2026-09-29T13:15:00',
        actor: 'Samira Haddou',
        action: 'live_session.cancelled',
        label: 'Live-Sitzung abgesagt',
        group: 'Live',
        subject: 'Arabisch A1 – Termin 5',
        subjectKind: 'Live-Sitzung',
        subjectTarget: {
            label: 'Arabisch A1 – Termin 5',
            href: '#/admin/live/sessions/88',
            story: ['Pages/Admin/Live', 'Sitzungen'],
        },
        details: [['Eingeladene', '31 — per E-Mail und in der App benachrichtigt']],
    },
    {
        id: 21,
        at: '2026-09-29T11:00:00',
        actor: 'Mosa Khallaf',
        action: 'sponsor.granted',
        label: 'Einschreibungen freigegeben',
        group: 'Sponsoren',
        subject: 'Müller Logistik GmbH',
        subjectKind: 'Sponsor',
        details: [['Einschreibungen', '6']],
    },
    {
        id: 20,
        at: '2026-09-29T10:20:00',
        actor: 'Amina Berger',
        action: 'user.approved',
        label: 'Benutzer:in freigegeben',
        group: 'Nutzer & Anmeldung',
        subject: 'Elif Demir',
        subjectKind: 'Nutzer',
        subjectTarget: userTarget('Elif Demir'),
    },
    {
        id: 19,
        at: '2026-09-29T09:45:00',
        actor: 'Mosa Khallaf',
        action: 'channel.inspected',
        label: 'Kanal eingesehen (Aufsicht)',
        group: 'Nachrichten & Kanäle',
        subject: 'Kanal „Elternrunde“',
        subjectKind: 'Kanal',
        details: [['Kurs', 'Hifz-Kreis: Juz ʿAmma · Laufend']],
    },
    {
        id: 18,
        at: '2026-09-28T19:30:00',
        actor: 'Amina Berger',
        action: 'design.changes.published',
        label: 'Designänderungen veröffentlicht',
        group: 'Website',
        subject: 'Startseite, Kursseite',
        subjectKind: 'Website',
    },
    {
        id: 17,
        at: '2026-09-28T17:05:00',
        actor: 'Amina Berger',
        action: 'school.theme.updated',
        label: 'Theme-Farben geändert',
        group: 'Website',
        subject: 'Theme',
        subjectKind: 'Website',
        change: [
            { field: 'Akzent', from: '#0F766E', to: '#14B8A6' },
            { field: 'Karte', from: '#FFFFFF', to: '#F8FAFC' },
        ],
    },
    {
        id: 16,
        at: '2026-09-28T10:10:00',
        actor: 'Amina Berger',
        action: 'user.invited',
        label: 'Benutzer:in eingeladen',
        group: 'Nutzer & Anmeldung',
        subject: 'Petra Lang',
        subjectKind: 'Nutzer',
        subjectTarget: userTarget('Petra Lang'),
        details: [['Rolle', 'Lehrkraft']],
    },
    {
        id: 15,
        at: '2026-09-27T21:30:00',
        actor: null,
        action: 'enrolment.activated_by_payment',
        label: 'Einschreibung durch Zahlung aktiviert',
        group: 'Zahlungen',
        subject: 'Nour El-Amin – Tajwid Grundlagen',
        subjectKind: 'Einschreibung',
    },
];
const ACTORS = [...new Set(AUDIT.map((e) => e.actor ?? 'System / Cron'))];
const GROUPS = [...new Set(AUDIT.map((e) => e.group))];

// ---------------------------------------------------------------------------
// Shell and menu
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
                    <AppRailItem icon={PanelsTopLeft} label="Website" onClick={() => {}} />
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
                    <AppRailSpacer />
                    <AppRailItem icon={Settings2} label="System" active />
                    <AppRailItem icon={UserRound} label="Konto" onClick={() => {}} />
                </AppRail>
            }
            sidebar={menu}
        >
            {children}
        </AdminLayout>
    );
}

function SystemMenu({
    view,
    onView,
    checks,
    jobs,
}: {
    view: View;
    onView: (v: View) => void;
    checks: Check[];
    jobs: Job[];
}) {
    const same = (v: View) => JSON.stringify(v) === JSON.stringify(view);
    const item = (
        v: View,
        Icon: LucideIcon,
        label: string,
        n?: number,
        attention?: 'warning' | 'destructive',
    ) => (
        <SidebarMenuItem key={JSON.stringify(v)}>
            <SidebarMenuButton active={same(v)} onClick={() => onView(v)}>
                <Icon aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {n !== undefined &&
                    (attention && n > 0 ? (
                        <Badge tone={attention}>{n}</Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground tabular-nums">{n}</span>
                    ))}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
    return (
        <Sidebar
            label="System"
            resize={{
                label: 'Menü verbreitern oder verschmälern',
                storageKey: 'storybook.page.system',
            }}
        >
            <SidebarHeader>
                <div className="px-2 text-lg font-semibold tracking-tight">System</div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        {item({ kind: 'overview', scope: 'all' }, Activity, 'Übersicht')}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Braucht dich">
                    <SidebarMenu>
                        {item(
                            { kind: 'overview', scope: 'failed' },
                            CircleX,
                            'Fehler',
                            count(checks, 'failed'),
                            'destructive',
                        )}
                        {item(
                            { kind: 'overview', scope: 'warning' },
                            TriangleAlert,
                            'Warnungen',
                            count(checks, 'warning'),
                            'warning',
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarMenu>
                        {item(
                            { kind: 'jobs' },
                            ListTodo,
                            'Hintergrundaufgaben',
                            jobs.filter(cancellable).length,
                        )}
                        {item({ kind: 'audit' }, ScrollText, 'Protokoll')}
                        {item({ kind: 'credentials' }, KeyRound, 'Zugangsdaten')}
                        {item({ kind: 'school' }, School, 'Schule')}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarMenu>{item({ kind: 'mobile' }, Smartphone, 'Mobile App')}</SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

/** One section of a panel: a title, a line under it, an action on the right. */
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

/** The classes every compact grid inside a panel shares. */
const compactGrid = cn(
    'max-h-96 overflow-auto rounded-lg border border-border',
    '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10 [&_thead]:bg-muted',
    'data-[density=compact]:[&_td]:py-1.5 [&_td:first-child]:pl-4 data-[density=compact]:[&_th]:h-8 [&_th:first-child]:pl-4',
    '[&_[data-slot=table-container]]:overflow-visible',
);

function focusTitle(e: Event) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).querySelector<HTMLElement>('[data-sheet-title]')?.focus();
}

// ---------------------------------------------------------------------------
// Übersicht — the health checks
// ---------------------------------------------------------------------------

const INTERVALS = [
    ['5', 'alle 5 Minuten'],
    ['15', 'alle 15 Minuten'],
    ['60', 'stündlich'],
    ['1440', 'einmal am Tag'],
] as const;

function Verdict({ checks }: { checks: Check[] }) {
    const failed = count(checks, 'failed');
    const warning = count(checks, 'warning');
    const tone = failed ? 'destructive' : warning ? 'warning' : 'success';
    const Icon = failed ? CircleX : warning ? TriangleAlert : CircleCheck;
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span
                aria-hidden="true"
                className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    tone === 'destructive' && 'bg-destructive/10 text-destructive-tint-foreground',
                    tone === 'warning' && 'bg-warning/10 text-warning-tint-foreground',
                    tone === 'success' && 'bg-success/10 text-success-tint-foreground',
                )}
            >
                <Icon className="size-5" />
            </span>
            <div className="min-w-0">
                {/* The real overall labels: diagnostics.overall.* */}
                <div className="truncate font-semibold">
                    {failed
                        ? 'Fehler erkannt'
                        : warning
                          ? 'Aufmerksamkeit erforderlich'
                          : 'Alle Systeme funktionsfähig'}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                    {[
                        failed && `${failed} ${failed === 1 ? 'Fehler' : 'Fehler'}`,
                        warning && `${warning} ${warning === 1 ? 'Warnung' : 'Warnungen'}`,
                        `${count(checks, 'skipped')} nicht eingerichtet`,
                        `${count(checks, 'ok')} in Ordnung`,
                    ]
                        .filter(Boolean)
                        .join(' · ')}
                </div>
            </div>
        </div>
    );
}

function OverviewView({
    checks,
    scope,
    onOpen,
    onView,
    onRun,
    lastRun,
    running,
}: {
    checks: Check[];
    scope: Scope;
    onOpen: (id: string) => void;
    onView: (v: View) => void;
    onRun: () => void;
    lastRun: string;
    running: boolean;
}) {
    const [search, setSearch] = useState('');
    const [interval, setInterval] = useState('15');
    const shown = checks
        .filter((c) => scope === 'all' || c.status === scope)
        .filter((c) =>
            `${c.name} ${c.area} ${c.summary}`.toLowerCase().includes(search.toLowerCase()),
        )
        .sort(
            (a, b) =>
                CHECK_STATUS[a.status].rank - CHECK_STATUS[b.status].rank ||
                a.name.localeCompare(b.name, 'de'),
        );

    const columns: GridColumn<Check>[] = useMemo(
        () => [
            {
                id: 'name',
                header: 'Prüfung',
                pinned: 'left',
                hideable: false,
                width: 250,
                filter: { type: 'text' },
                cell: (c) => (
                    <a
                        href={`#/admin/system/checks/${c.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(c.id);
                        }}
                        className="truncate font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        {c.name}
                    </a>
                ),
            },
            {
                id: 'area',
                header: 'Bereich',
                width: 190,
                groupable: true,
                value: (c) => areaKey(c.area, checks),
                cell: (c) => c.area,
                exportValue: (c) => c.area,
            },
            {
                id: 'status',
                header: 'Status',
                width: 150,
                groupable: true,
                value: (c) => CHECK_STATUS[c.status].rank,
                cell: (c) => (
                    <Badge tone={CHECK_STATUS[c.status].tone} dot>
                        {CHECK_STATUS[c.status].label}
                    </Badge>
                ),
                exportValue: (c) => CHECK_STATUS[c.status].label,
            },
            {
                id: 'summary',
                header: 'Meldung',
                width: 280,
                cell: (c) => (
                    <span
                        className={cn(
                            'truncate',
                            (c.status === 'ok' || c.status === 'skipped') &&
                                'text-muted-foreground',
                        )}
                    >
                        {c.summary}
                    </span>
                ),
            },
            {
                id: 'lastRun',
                header: 'Zuletzt geprüft',
                width: 150,
                value: () => lastRun,
                cell: (c) => (
                    <span className="flex flex-col">
                        <span className="tabular-nums">{when(lastRun)}</span>
                        {c.since && (
                            <span className="text-xs text-muted-foreground">
                                so seit {when(c.since)}
                            </span>
                        )}
                    </span>
                ),
            },
            {
                id: 'fix',
                header: 'Beheben',
                width: 260,
                sortable: false,
                value: (c) => (c.status === 'ok' ? '' : (c.fix?.label ?? '')),
                cell: (c) =>
                    c.status !== 'ok' && c.fix ? (
                        <TargetLink target={c.fix} onView={onView} className="text-sm" />
                    ) : (
                        <span className="text-muted-foreground">—</span>
                    ),
            },
        ],
        [checks, lastRun, onOpen, onView],
    );

    const actions: GridActionItem[] = [
        {
            id: 'open',
            label: 'Details',
            icon: <Eye aria-hidden="true" />,
            when: ['one'],
            isDefault: true,
            shortcut: 'E',
            onSelect: (ids: RowId[]) => onOpen(String(ids[0])),
        },
    ];
    const grid = useGrid<Check>({
        id: 'storybook.page.system.checks',
        rows: shown,
        getRowId: (c) => c.id,
        columns,
        selection: 'single',
        actions,
        defaults: { groupBy: ['area'], hiddenColumns: ['area'] },
    });
    // Groups start closed; the overview opens them all once.
    const opened = useRef(false);
    useEffect(() => {
        if (opened.current) return;
        opened.current = true;
        grid.expandAllGroups();
    });

    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-16 shrink-0 items-center gap-4 border-b border-border px-4">
                <Verdict checks={checks} />
                <div className="ms-auto flex shrink-0 items-center gap-3 text-sm">
                    <span className="text-muted-foreground" aria-live="polite">
                        {running ? 'Prüfungen laufen …' : `Zuletzt geprüft ${when(lastRun)}`}
                    </span>
                    <Select value={interval} onValueChange={setInterval}>
                        <SelectTrigger className="w-44" aria-label="Wie oft automatisch prüfen">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {INTERVALS.map(([v, l]) => (
                                <SelectItem key={v} value={v}>
                                    {l}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={onRun} disabled={running}>
                        <RefreshCw aria-hidden="true" /> {running ? 'Prüft …' : 'Jetzt prüfen'}
                    </Button>
                </div>
            </div>
            <GridPage
                title={
                    scope === 'failed' ? 'Fehler' : scope === 'warning' ? 'Warnungen' : 'Übersicht'
                }
                offsetTop="4rem"
                grid={grid}
                search={{ value: search, onChange: setSearch, placeholder: 'Prüfung suchen …' }}
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
                            formatDate={(d) => d}
                            formatNumber={(x) => String(x)}
                        />
                    ) : undefined
                }
                notice={
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Info className="size-3.5 shrink-0" aria-hidden="true" />
                        Probleme zuerst. „Beheben“ führt dorthin, wo du es einstellst. Wird eine
                        Prüfung rot, bekommen alle Admins eine E-Mail — und alle 24 Stunden eine
                        Erinnerung, solange sie rot bleibt.
                    </span>
                }
                footer={
                    <GridFooter
                        summary={`${shown.length} Prüfungen`}
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
                        table: 'Prüfungen',
                        empty:
                            scope === 'all'
                                ? 'Keine Prüfung passt dazu.'
                                : 'Nichts zu tun — keine Prüfung in diesem Zustand.',
                        // The group value carries a sort key in front of the area name.
                        group: (header, value, n) =>
                            `${header}: ${value.split('|')[1] ?? value} (${n})`,
                    }}
                    rowLabel={(c) => c.name}
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

/** One check in a panel: what it looks at, what it says now, its last runs, where to fix it. */
function CheckSheet({
    check,
    onClose,
    onView,
    onRun,
    lastRun,
    running,
}: {
    check: Check;
    onClose: () => void;
    onView: (v: View) => void;
    onRun: () => void;
    lastRun: string;
    running: boolean;
}) {
    const c = check;
    const st = CHECK_STATUS[c.status];
    const rows = useMemo(() => historyOf(c), [c]);
    const columns: GridColumn<(typeof rows)[number]>[] = useMemo(
        () => [
            {
                id: 'at',
                header: 'Lauf',
                width: 170,
                cell: (r) => <span className="tabular-nums">{when(r.at)}</span>,
            },
            {
                id: 'status',
                header: 'Ergebnis',
                width: 180,
                cell: (r) => (
                    <Badge tone={CHECK_STATUS[r.status].tone} dot>
                        {CHECK_STATUS[r.status].label}
                    </Badge>
                ),
            },
            {
                id: 'summary',
                header: 'Meldung',
                width: 470,
                cell: (r) => (
                    <span className="flex items-center gap-2">
                        <span className="truncate">{r.summary}</span>
                        {r.change && <Badge tone="faint">geändert</Badge>}
                    </span>
                ),
            },
        ],
        [],
    );
    const grid = useGrid({
        id: 'storybook.page.system.history',
        rows,
        getRowId: (r) => r.id,
        columns,
        selection: 'none',
        defaults: { density: 'compact' },
    });
    const goFix = (v: View) => {
        onClose();
        onView(v);
    };
    return (
        <Sheet open onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(56rem,92vw)] max-w-none gap-0 p-0"
                onOpenAutoFocus={focusTitle}
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <div className="min-w-0 flex-1">
                            <SheetTitle
                                data-sheet-title
                                tabIndex={-1}
                                className="text-2xl tracking-tight outline-none"
                            >
                                {c.name}
                            </SheetTitle>
                            <SheetDescription>
                                Prüfung im Bereich {c.area} · zuletzt {when(lastRun)}
                            </SheetDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge tone={st.tone} dot>
                                    {st.label}
                                </Badge>
                                {c.since && (
                                    <span className="text-xs text-muted-foreground">
                                        so seit {when(c.since)}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={onRun}
                            disabled={running}
                            tooltip="Führt alle Prüfungen aus — einzeln geht es nicht"
                        >
                            <RefreshCw aria-hidden="true" /> {running ? 'Prüft …' : 'Jetzt prüfen'}
                        </Button>
                    </div>

                    {c.status !== 'ok' && (
                        <div
                            role="status"
                            className={cn(
                                'flex flex-col gap-3 rounded-lg border px-4 py-3 text-sm',
                                c.status === 'failed' &&
                                    'border-destructive/30 bg-destructive/10 text-destructive-tint-foreground',
                                c.status === 'warning' &&
                                    'border-warning/40 bg-warning/10 text-warning-tint-foreground',
                                c.status === 'skipped' && 'border-border bg-muted/40',
                            )}
                        >
                            <p>{c.message ?? c.summary}</p>
                            {c.fix && (
                                <div className="flex flex-wrap items-center gap-3">
                                    <span>Behebst du hier:</span>
                                    <TargetLink target={c.fix} onView={goFix} />
                                </div>
                            )}
                        </div>
                    )}
                    {c.status === 'ok' && (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CircleCheck className="size-4 shrink-0" aria-hidden="true" />
                            {c.summary} — nichts zu tun.
                        </p>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <Part title="Was das prüft">
                        <p className="text-sm">{c.what}</p>
                    </Part>
                    <Part
                        title="Verlauf"
                        text="Die letzten Läufe, dann jeder Lauf, bei dem sich das Ergebnis geändert hat. Alle Prüfungen laufen zusammen, alle 15 Minuten."
                    >
                        <div data-density="compact" className={compactGrid}>
                            <DataGrid
                                grid={grid}
                                labels={{
                                    ...DATA_GRID_LABELS,
                                    table: `Verlauf von ${c.name}`,
                                    empty: 'Noch kein Lauf.',
                                }}
                                rowLabel={(r) => when(r.at)}
                            />
                        </div>
                    </Part>
                    <Part title="Benachrichtigung">
                        <p className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            Wird diese Prüfung rot, bekommen alle Admins eine E-Mail
                            „Statuswarnung“. Solange sie rot bleibt, kommt alle 24 Stunden eine
                            Erinnerung, und eine Entwarnung, sobald sie wieder grün ist. Abschalten
                            lässt sich das nicht.
                        </p>
                    </Part>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ---------------------------------------------------------------------------
// Hintergrundaufgaben
// ---------------------------------------------------------------------------

type JobFilter = 'all' | 'running' | 'succeeded' | 'failed' | 'cancelled';
const inJobFilter = (j: Job, f: JobFilter) =>
    f === 'all' || (f === 'running' ? cancellable(j) : j.status === f);

function JobProgress({ job, wide = false }: { job: Job; wide?: boolean }) {
    if (job.status === 'queued')
        return <span className="text-muted-foreground">wartet auf einen freien Platz</span>;
    if (job.total === null)
        return (
            <span className="text-muted-foreground">In Arbeit … Gesamtzahl noch unbekannt.</span>
        );
    if (job.total === 0) return <span className="text-muted-foreground">nicht begonnen</span>;
    if (job.total === 1 && !wide)
        return (
            <span className="text-muted-foreground">
                {job.done === 1 ? 'erledigt' : 'nicht erledigt'}
            </span>
        );
    const pct = job.total === 0 ? 0 : Math.round((job.done / job.total) * 100);
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
                <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={pct}
                    aria-label={`Fortschritt ${JOB_TYPES[job.type]} #${job.id}`}
                    className={cn(
                        'h-1.5 flex-1 overflow-hidden rounded-full bg-muted',
                        wide && 'h-2',
                    )}
                >
                    <div
                        className={cn(
                            'h-full rounded-full',
                            job.status === 'failed'
                                ? 'bg-destructive'
                                : job.status === 'cancelled'
                                  ? 'bg-muted-foreground/40'
                                  : 'bg-primary',
                        )}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <span className="w-9 text-end text-xs tabular-nums">{pct} %</span>
            </div>
            <span className="text-xs text-muted-foreground">
                {job.done.toLocaleString('de-DE')} von {job.total.toLocaleString('de-DE')}{' '}
                {job.unit}
            </span>
        </div>
    );
}

function jobDuration(j: Job) {
    if (!j.startedAt) return '—';
    if (!j.finishedAt) return `läuft seit ${duration(j.startedAt, LAST_RUN)}`;
    return duration(j.startedAt, j.finishedAt);
}

function JobsView({
    jobs,
    onOpen,
    onCancel,
    onRetry,
    notice,
}: {
    jobs: Job[];
    onOpen: (id: number) => void;
    onCancel: (id: number) => void;
    onRetry: (id: number) => void;
    notice: string | null;
}) {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<JobFilter>('all');
    const shown = jobs
        .filter((j) => inJobFilter(j, filter))
        .filter((j) =>
            `${JOB_TYPES[j.type]} ${j.subject} ${j.by ?? 'System'} ${j.id}`
                .toLowerCase()
                .includes(search.toLowerCase()),
        );
    const byId = (id: RowId) => jobs.find((j) => j.id === Number(id))!;

    const columns: GridColumn<Job>[] = useMemo(
        () => [
            {
                id: 'type',
                header: 'Aufgabe',
                pinned: 'left',
                hideable: false,
                width: 300,
                value: (j) => JOB_TYPES[j.type],
                cell: (j) => (
                    <a
                        href={`#/admin/jobs/${j.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(j.id);
                        }}
                        className="flex min-w-0 flex-col underline-offset-4 hover:underline"
                    >
                        <span className="truncate font-medium text-foreground">
                            {JOB_TYPES[j.type]}{' '}
                            <span className="font-normal text-muted-foreground">#{j.id}</span>
                        </span>
                        <span className="truncate text-xs text-muted-foreground">{j.subject}</span>
                    </a>
                ),
                filter: {
                    type: 'choice',
                    options: Object.values(JOB_TYPES).map((l) => ({ value: l, label: l })),
                },
                groupable: true,
            },
            {
                id: 'status',
                header: 'Status',
                width: 145,
                groupable: true,
                value: (j) => JOB_STATUS[j.status].label,
                cell: (j) => (
                    <Badge tone={JOB_STATUS[j.status].tone} dot>
                        {JOB_STATUS[j.status].label}
                    </Badge>
                ),
            },
            {
                id: 'progress',
                header: 'Fortschritt',
                width: 200,
                sortable: false,
                cell: (j) => <JobProgress job={j} />,
            },
            {
                id: 'by',
                header: 'Gestartet von',
                width: 180,
                groupable: true,
                value: (j) => j.by ?? 'System / Cron',
                cell: (j) =>
                    j.by ? (
                        <span className="flex min-w-0 items-center gap-2">
                            <InitialsAvatar name={j.by} size="sm" colored />
                            <span className="truncate">{j.by}</span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">System / Cron</span>
                    ),
            },
            {
                id: 'startedAt',
                header: 'Gestartet',
                width: 175,
                value: (j) => j.startedAt ?? '',
                cell: (j) =>
                    j.startedAt ? (
                        <span className="flex flex-col">
                            <span className="tabular-nums">{when(j.startedAt)}</span>
                            <span className="text-xs text-muted-foreground">
                                {j.finishedAt ? `dauerte ${jobDuration(j)}` : jobDuration(j)}
                            </span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">noch nicht</span>
                    ),
            },
            {
                id: 'finishedAt',
                header: 'Beendet',
                width: 150,
                value: (j) => j.finishedAt ?? '',
                cell: (j) => (j.finishedAt ? when(j.finishedAt) : '—'),
            },
            {
                id: 'duration',
                header: 'Dauer',
                width: 160,
                sortable: false,
                cell: (j) => <span className="tabular-nums">{jobDuration(j)}</span>,
            },
            { id: 'attempts', header: 'Versuche', width: 110, align: 'right' },
            {
                id: 'actions',
                header: 'Aktionen',
                hideable: false,
                sortable: false,
                width: 95,
                cell: (j) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <IconButton
                                label={`Aktionen für ${JOB_TYPES[j.type]} #${j.id}`}
                                icon={<EllipsisVertical aria-hidden="true" />}
                                className="size-8"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onOpen(j.id)}>
                                <Eye aria-hidden="true" /> Öffnen
                            </DropdownMenuItem>
                            {retryable(j) && (
                                <DropdownMenuItem onSelect={() => onRetry(j.id)}>
                                    <RotateCcw aria-hidden="true" /> Erneut versuchen …
                                </DropdownMenuItem>
                            )}
                            {cancellable(j) && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive-tint-foreground"
                                        onSelect={() => onCancel(j.id)}
                                    >
                                        <Square aria-hidden="true" /> Abbrechen …
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [onOpen, onCancel, onRetry],
    );

    const actions: GridActionItem[] = [
        {
            id: 'open',
            label: 'Öffnen',
            icon: <Eye aria-hidden="true" />,
            when: ['one'],
            group: 'open',
            isDefault: true,
            shortcut: 'E',
            onSelect: (ids) => onOpen(Number(ids[0])),
        },
        {
            id: 'retry',
            label: 'Erneut versuchen …',
            icon: <RotateCcw aria-hidden="true" />,
            when: ['one'],
            group: 'state',
            disabled: (ids) => !retryable(byId(ids[0]!)),
            disabledReason: 'Nur fehlgeschlagene oder abgebrochene Aufgaben',
            onSelect: (ids) => onRetry(Number(ids[0])),
        },
        {
            id: 'cancel',
            label: 'Abbrechen …',
            icon: <Square aria-hidden="true" />,
            when: ['one'],
            group: 'danger',
            tone: 'destructive',
            disabled: (ids) => !cancellable(byId(ids[0]!)),
            disabledReason: 'Nur laufende oder wartende Aufgaben',
            onSelect: (ids) => onCancel(Number(ids[0])),
        },
    ];
    const grid = useGrid<Job>({
        id: 'storybook.page.system.jobs',
        rows: shown,
        getRowId: (j) => j.id,
        columns,
        selection: 'single',
        actions,
        defaults: { hiddenColumns: ['attempts', 'finishedAt', 'duration'] },
    });

    const filterSwitch = (
        <div
            role="radiogroup"
            aria-label="Nach Status zeigen"
            className="flex rounded-lg border border-border p-0.5"
        >
            {(
                [
                    ['all', 'Alle'],
                    ['running', 'Läuft'],
                    ['succeeded', 'Fertig'],
                    ['failed', 'Fehlgeschlagen'],
                    ['cancelled', 'Abgebrochen'],
                ] as const
            ).map(([value, label]) => (
                <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={filter === value}
                    onClick={() => setFilter(value)}
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm',
                        filter === value
                            ? 'bg-muted font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {label}
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {jobs.filter((j) => inJobFilter(j, value)).length}
                    </span>
                </button>
            ))}
        </div>
    );

    return (
        <GridPage
            title="Hintergrundaufgaben"
            offsetTop="0px"
            grid={grid}
            search={{
                value: search,
                onChange: setSearch,
                placeholder: 'Aufgabe, Datei oder Person …',
            }}
            moreActionsLabel="Weitere Aktionen"
            selectionLabels={{ count: (n) => `${n} ausgewählt`, clear: 'Auswahl aufheben' }}
            shortcutLabels={{ Mod: 'Strg', Shift: 'Umschalt', Delete: 'Entf' }}
            options={
                <div className="flex items-center gap-2">
                    {filterSwitch}
                    <GridOptions
                        preferences={grid.preferences}
                        canSelect={grid.allowedMode !== 'none'}
                        columns={columns.map((c) => ({
                            id: c.id,
                            label: c.header,
                            hideable: c.hideable,
                        }))}
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
                        formatNumber={(x) => String(x)}
                    />
                ) : undefined
            }
            notice={
                notice ? (
                    <span role="status" className="flex items-center gap-1.5 text-muted-foreground">
                        <Info className="size-3.5" aria-hidden="true" />
                        {notice}
                    </span>
                ) : (
                    <span className="text-muted-foreground">
                        Was länger dauert, läuft hier im Hintergrund: Importe, Datenexporte,
                        Aufzeichnungen, Benachrichtigungen, Virus-Scans.
                    </span>
                )
            }
            footer={
                <GridFooter
                    summary={`${shown.length} Aufgaben`}
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
                    table: 'Hintergrundaufgaben',
                    empty: 'Keine Aufgabe passt dazu.',
                }}
                rowLabel={(j) => `${JOB_TYPES[j.type]} #${j.id}`}
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

/** One background job: what it was asked to do, how far it got, its log, what went wrong. */
function JobSheet({
    job,
    onClose,
    onCancel,
    onRetry,
}: {
    job: Job;
    onClose: () => void;
    onCancel: () => void;
    onRetry: () => void;
}) {
    const j = job;
    return (
        <Sheet open onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(56rem,92vw)] max-w-none gap-0 p-0"
                onOpenAutoFocus={focusTitle}
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <div className="min-w-0 flex-1">
                            <SheetTitle
                                data-sheet-title
                                tabIndex={-1}
                                className="text-2xl tracking-tight outline-none"
                            >
                                {JOB_TYPES[j.type]} #{j.id}
                            </SheetTitle>
                            <SheetDescription>{j.subject}</SheetDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Badge tone={JOB_STATUS[j.status].tone} dot>
                                    {JOB_STATUS[j.status].label}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {retryable(j) && (
                                <Button
                                    onClick={onRetry}
                                    tooltip="Bereits erledigte Einträge werden übersprungen"
                                >
                                    <RotateCcw aria-hidden="true" /> Erneut versuchen
                                </Button>
                            )}
                            {cancellable(j) && (
                                <Button
                                    variant="outline"
                                    onClick={onCancel}
                                    tooltip="Hält nach dem aktuellen Eintrag an"
                                >
                                    <Square aria-hidden="true" /> Abbrechen
                                </Button>
                            )}
                        </div>
                    </div>

                    <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                        {[
                            ['Gestartet von', j.by ?? 'System / Cron'],
                            ['Gestartet', j.startedAt ? when(j.startedAt) : '—'],
                            ['Beendet', j.finishedAt ? when(j.finishedAt) : '—'],
                            ['Dauer', jobDuration(j)],
                            ['Versuche', String(j.attempts)],
                        ].map(([label, value]) => (
                            <div key={label} className="flex gap-1.5">
                                <dt className="text-muted-foreground">{label}</dt>
                                <dd className="font-medium">{value}</dd>
                            </div>
                        ))}
                    </dl>

                    {j.failure && (
                        <div
                            role="status"
                            className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-tint-foreground"
                        >
                            <CircleX className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            <span>
                                <strong className="font-medium">Fehlgeschlagen.</strong> {j.failure}
                            </span>
                        </div>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <Part
                        title="Fortschritt"
                        text={
                            j.status === 'running'
                                ? 'Letzte Aktualisierung vor 10 s'
                                : j.status === 'queued'
                                  ? 'Startet, sobald ein Platz frei ist.'
                                  : undefined
                        }
                    >
                        <JobProgress job={j} wide />
                        {j.result && <p className="text-sm">{j.result}</p>}
                    </Part>
                    <Part title="Parameter" text="Womit die Aufgabe gestartet wurde.">
                        <dl className="flex flex-col gap-2 text-sm">
                            {j.params.map(([k, v]) => (
                                <div key={k} className="grid grid-cols-3 gap-4">
                                    <dt className="text-muted-foreground">{k}</dt>
                                    <dd className="col-span-2">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </Part>
                    {/* MOCK-ONLY: log lines — a job run stores meta, result and failure_reason, no log. */}
                    <Part title="Protokoll">
                        {j.log.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Noch nichts passiert.</p>
                        ) : (
                            <ol className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs">
                                {j.log.map(([t, line]) => (
                                    <li key={`${t}${line}`} className="flex gap-3">
                                        <span className="shrink-0 text-muted-foreground tabular-nums">
                                            {t}
                                        </span>
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Part>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ---------------------------------------------------------------------------
// Protokoll
// ---------------------------------------------------------------------------

function AuditView({ onOpen }: { onOpen: (id: number) => void }) {
    const [search, setSearch] = useState('');
    const shown = AUDIT.filter((e) =>
        `${e.label} ${e.actor ?? 'System'} ${e.subject} ${e.action}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );
    const columns: GridColumn<AuditEntry>[] = useMemo(
        () => [
            {
                id: 'at',
                header: 'Wann',
                pinned: 'left',
                hideable: false,
                width: 160,
                cell: (e) => <span className="tabular-nums">{when(e.at)}</span>,
                exportValue: (e) => e.at,
                filter: { type: 'date' },
            },
            {
                id: 'actor',
                header: 'Wer',
                width: 200,
                groupable: true,
                value: (e) => e.actor ?? 'System / Cron',
                cell: (e) =>
                    e.actor ? (
                        <span className="flex min-w-0 items-center gap-2">
                            <InitialsAvatar name={e.actor} size="sm" colored />
                            <span className="flex min-w-0 flex-col">
                                <span className="truncate">{e.actor}</span>
                                <span className="truncate text-xs text-muted-foreground">
                                    {STAFF[e.actor] ?? ''}
                                </span>
                            </span>
                        </span>
                    ) : (
                        <span className="text-muted-foreground">System / Cron</span>
                    ),
                filter: {
                    type: 'choice',
                    options: ACTORS.map((a) => ({ value: a, label: a })),
                },
            },
            {
                id: 'label',
                header: 'Was',
                width: 280,
                cell: (e) => (
                    <a
                        href={`#/admin/audit/${e.id}`}
                        onClick={(ev) => {
                            ev.preventDefault();
                            onOpen(e.id);
                        }}
                        className="truncate font-medium text-foreground underline-offset-4 hover:underline"
                    >
                        {e.label}
                    </a>
                ),
                filter: { type: 'text' },
            },
            {
                id: 'subject',
                header: 'Betrifft',
                width: 260,
                cell: (e) => (
                    <span className="flex min-w-0 flex-col">
                        <span className="truncate">{e.subject}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {e.subjectKind}
                        </span>
                    </span>
                ),
                filter: { type: 'text' },
            },
            {
                id: 'group',
                header: 'Bereich',
                width: 190,
                groupable: true,
                filter: {
                    type: 'choice',
                    options: GROUPS.map((g) => ({ value: g, label: g })),
                },
            },
        ],
        [onOpen],
    );
    const actions: GridActionItem[] = [
        {
            id: 'open',
            label: 'Öffnen',
            icon: <Eye aria-hidden="true" />,
            when: ['one'],
            isDefault: true,
            shortcut: 'E',
            onSelect: (ids) => onOpen(Number(ids[0])),
        },
    ];
    const grid = useGrid<AuditEntry>({
        id: 'storybook.page.system.audit',
        rows: shown,
        getRowId: (e) => e.id,
        columns,
        selection: 'single',
        actions,
    });

    // Quick filters for the three questions asked most: which area, who, since when.
    // MOCK-ONLY: filtering by area, person and date — the audit log filters by action only today.
    // They set the same column filters the header menus do, so chips show either way.
    const choiceOf = (id: string) => {
        const f = grid.filters.find((x) => x.id === id);
        return f?.type === 'choice' && f.values.length === 1 ? f.values[0]! : 'all';
    };
    const setChoice = (id: string, v: string) =>
        v === 'all' ? grid.removeFilter(id) : grid.setFilter({ id, type: 'choice', values: [v] });
    const quick = (
        id: string,
        label: string,
        all: string,
        options: readonly string[],
        value: string,
        onChange: (v: string) => void,
    ) => (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-44" aria-label={label}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{all}</SelectItem>
                {options.map((o) => (
                    <SelectItem key={`${id}-${o}`} value={o}>
                        {o}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
    const PERIODS: Record<string, string> = {
        Heute: '2026-10-01',
        'Letzte 7 Tage': '2026-09-25',
        'Letzte 30 Tage': '2026-09-02',
    };
    const atFilter = grid.filters.find((f) => f.id === 'at');
    const period =
        Object.entries(PERIODS).find(
            ([, d]) => atFilter?.type === 'date' && atFilter.from === d,
        )?.[0] ?? 'all';
    return (
        <GridPage
            title="Protokoll"
            offsetTop="0px"
            grid={grid}
            search={{
                value: search,
                onChange: setSearch,
                placeholder: 'Person, Aktion oder Objekt …',
            }}
            moreActionsLabel="Weitere Aktionen"
            selectionLabels={{ count: (n) => `${n} ausgewählt`, clear: 'Auswahl aufheben' }}
            shortcutLabels={{ Mod: 'Strg', Shift: 'Umschalt', Delete: 'Entf' }}
            options={
                <div className="flex items-center gap-2">
                    {quick('group', 'Bereich', 'Alle Bereiche', GROUPS, choiceOf('group'), (v) =>
                        setChoice('group', v),
                    )}
                    {quick('actor', 'Wer', 'Alle Personen', ACTORS, choiceOf('actor'), (v) =>
                        setChoice('actor', v),
                    )}
                    {quick('period', 'Zeitraum', 'Jederzeit', Object.keys(PERIODS), period, (v) => {
                        if (v === 'all') grid.removeFilter('at');
                        else grid.setFilter({ id: 'at', type: 'date', from: PERIODS[v] });
                    })}
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
                        formatNumber={(x) => String(x)}
                    />
                ) : undefined
            }
            notice={
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                    Jede Änderung an der Schule, wer sie gemacht hat und wann. Einträge lassen sich
                    weder ändern noch löschen; nach 365 Tagen werden sie entfernt.
                </span>
            }
            footer={
                <GridFooter
                    summary={`${shown.length} Einträge`}
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
                    table: 'Protokoll',
                    empty: 'Keine Einträge für diesen Filter.',
                }}
                rowLabel={(e) => `${e.label}, ${when(e.at)}`}
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

/** One audit entry: who, what, about whom — and the old value next to the new one. */
function AuditSheet({
    entry,
    onClose,
    onView,
}: {
    entry: AuditEntry;
    onClose: () => void;
    onView: (v: View) => void;
}) {
    const e = entry;
    const goTo = (v: View) => {
        onClose();
        onView(v);
    };
    return (
        <Sheet open onOpenChange={(o) => !o && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(56rem,92vw)] max-w-none gap-0 p-0"
                onOpenAutoFocus={focusTitle}
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="pe-8">
                        <SheetTitle
                            data-sheet-title
                            tabIndex={-1}
                            className="text-2xl tracking-tight outline-none"
                        >
                            {e.label}
                        </SheetTitle>
                        <SheetDescription>{longFmt.format(at(e.at))} Uhr</SheetDescription>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge tone="neutral">{e.group}</Badge>
                            <Badge tone="faint">{e.action}</Badge>
                        </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col gap-1.5 rounded-lg border border-border p-4">
                            <dt className="text-muted-foreground">Wer</dt>
                            <dd className="flex items-center gap-2">
                                {e.actor ? (
                                    <>
                                        <InitialsAvatar name={e.actor} size="sm" colored />
                                        <span className="flex flex-col">
                                            <span className="font-medium">{e.actor}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {STAFF[e.actor]}
                                            </span>
                                        </span>
                                    </>
                                ) : (
                                    <span className="font-medium">
                                        System / Cron
                                        <span className="block text-xs font-normal text-muted-foreground">
                                            automatisch, ohne Person
                                        </span>
                                    </span>
                                )}
                            </dd>
                        </div>
                        <div className="flex flex-col gap-1.5 rounded-lg border border-border p-4">
                            <dt className="text-muted-foreground">Betrifft · {e.subjectKind}</dt>
                            <dd>
                                {e.subjectTarget ? (
                                    <TargetLink
                                        target={{ ...e.subjectTarget, label: e.subject }}
                                        onView={goTo}
                                    />
                                ) : (
                                    <span className="font-medium">{e.subject}</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
                <div className="px-8 pb-8">
                    {e.change && (
                        <Part title="Änderung">
                            <div className="flex flex-col gap-3">
                                {e.change.map((ch) => (
                                    <div key={ch.field} className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex flex-col gap-1 rounded-lg bg-muted/40 p-4">
                                            <span className="text-xs text-muted-foreground">
                                                {ch.field} · vorher
                                            </span>
                                            <span className="font-medium">{ch.from}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 rounded-lg border border-border p-4">
                                            <span className="text-xs text-muted-foreground">
                                                {ch.field} · nachher
                                            </span>
                                            <span className="font-medium">{ch.to}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Part>
                    )}
                    {e.details && (
                        <Part title="Weitere Angaben">
                            <dl className="flex flex-col gap-2 text-sm">
                                {e.details.map(([k, v]) => (
                                    <div key={k} className="grid grid-cols-3 gap-4">
                                        <dt className="text-muted-foreground">{k}</dt>
                                        <dd className="col-span-2">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Part>
                    )}
                    <Part title="Dieser Eintrag">
                        <p className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                            Nur lesen. Niemand kann ihn ändern oder löschen, auch kein Admin. Die
                            IP-Adresse wird nicht gespeichert; Inhalte von Nachrichten und
                            Passwörter nie.
                        </p>
                    </Part>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ---------------------------------------------------------------------------
// Zugangsdaten
// ---------------------------------------------------------------------------

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

type Source = 'store' | 'env' | 'unset' | 'env_only';
/** The real labels from `platform.secrets.source`. */
const SOURCE: Record<Source, { label: string; tone: BadgeTone }> = {
    store: { label: 'Hier gesetzt', tone: 'success' },
    env: { label: 'Deployment-Standard', tone: 'neutral' },
    unset: { label: 'Nicht konfiguriert', tone: 'muted' },
    env_only: { label: 'Vom Server vorgegeben', tone: 'neutral' },
};

type Field = {
    key: string;
    label: string;
    secret?: boolean;
    value: string;
    last4?: string;
    type?: string;
};

function CredentialCard({
    icon: Icon,
    title,
    text,
    source,
    updated,
    fields,
    test,
}: {
    icon: LucideIcon;
    title: string;
    text: string;
    source: Source;
    updated: string | null;
    fields: Field[];
    test: { label: string; tooltip: string; last: string; ok: string };
}) {
    const id = useId();
    const [draft, setDraft] = useState<Record<string, string>>({});
    const [testing, setTesting] = useState<'idle' | 'testing' | 'done'>('idle');
    const [saved, setSaved] = useState(false);
    const dirty = Object.values(draft).some((v) => v !== '');
    return (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
            <div className="flex items-start gap-3">
                <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                >
                    <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{title}</h3>
                        <Badge tone={SOURCE[source].tone} dot>
                            {SOURCE[source].label}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{text}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {fields.map((f) => (
                    <div
                        key={f.key}
                        className={cn(
                            'flex flex-col gap-2',
                            f.key === 'github_token' && 'col-span-2',
                        )}
                    >
                        <Label htmlFor={`${id}-${f.key}`}>{f.label}</Label>
                        {f.secret ? (
                            <PasswordInput
                                id={`${id}-${f.key}`}
                                value={draft[f.key] ?? ''}
                                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                                placeholder={f.last4 ? '•••••••• (gesetzt)' : 'Nicht gesetzt'}
                                aria-describedby={`${id}-${f.key}-hint`}
                                labels={{ show: 'Anzeigen', hide: 'Verbergen' }}
                            />
                        ) : (
                            <Input
                                id={`${id}-${f.key}`}
                                type={f.type}
                                value={draft[f.key] ?? f.value}
                                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                            />
                        )}
                        {f.secret && (
                            <p id={`${id}-${f.key}-hint`} className="text-xs text-muted-foreground">
                                {f.last4 ? `endet auf ${f.last4} · ` : ''}Leer = unverändert.
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground" aria-live="polite">
                    {testing === 'testing'
                        ? 'Test läuft …'
                        : testing === 'done'
                          ? test.ok
                          : saved
                            ? 'Gespeichert — gilt ab der nächsten Anfrage, ohne Neustart.'
                            : test.last}
                    {updated && testing === 'idle' && !saved && (
                        <span className="block text-xs">{updated}</span>
                    )}
                </p>
                <div className="flex gap-2">
                    {/* MOCK-ONLY: "Verbindung testen" exists for PayPal, Stripe, KI, Google and SSO — not yet for mail or GitHub (mail has the test e-mail on the status page). */}
                    <Button
                        variant="outline"
                        disabled={testing === 'testing'}
                        tooltip={test.tooltip}
                        onClick={() => {
                            setTesting('testing');
                            setTimeout(() => setTesting('done'), 900);
                        }}
                    >
                        {test.label}
                    </Button>
                    <Button
                        disabled={!dirty}
                        onClick={() => {
                            setDraft({});
                            setSaved(true);
                        }}
                    >
                        Speichern
                    </Button>
                </div>
            </div>
        </div>
    );
}

type Elsewhere = {
    icon: LucideIcon;
    name: string;
    fields: string;
    state: { label: string; tone: BadgeTone };
    target: Target;
    note?: string;
};

const ELSEWHERE: Elsewhere[] = [
    {
        icon: CreditCard,
        name: 'PayPal',
        fields: 'Client-ID, Secret, Webhook-ID',
        state: { label: 'Webhook-ID fehlt', tone: 'destructive' },
        target: TO.paymentsSettings,
    },
    {
        icon: CreditCard,
        name: 'Stripe',
        fields: 'Secret Key, Webhook-Signaturschlüssel, Publishable Key',
        state: { label: 'Nicht konfiguriert', tone: 'muted' },
        target: TO.paymentsSettings,
    },
    {
        icon: UsersIcon,
        name: 'Google (Mit Google anmelden)',
        fields: 'OAuth-Client-ID, OAuth-Client-Secret',
        state: { label: 'Nicht konfiguriert', tone: 'muted' },
        target: TO.usersLogin,
    },
    {
        icon: ShieldCheck,
        name: 'Unternehmens-Single-Sign-on',
        fields: 'Issuer, Client-ID, Client-Secret, erlaubte E-Mail-Domains',
        state: { label: 'Nicht konfiguriert', tone: 'muted' },
        target: TO.usersLogin,
    },
    {
        icon: BookOpen,
        name: 'KI-Assistent (Chat-Endpoint)',
        fields: 'Endpoint-Basis-URL, API-Schlüssel, Modellname',
        state: { label: 'Nicht konfiguriert', tone: 'muted' },
        target: TO.coursesSettings,
    },
    {
        icon: PanelsTopLeft,
        name: 'Spam-Schutz (Altcha)',
        fields: 'Altcha-Signaturschlüssel für das Kontaktformular',
        state: { label: 'Nicht konfiguriert', tone: 'muted' },
        target: TO.websiteSettings,
    },
    {
        icon: Video,
        name: 'LiveKit und Aufzeichnung',
        fields: 'API-Schlüssel, API-Secret',
        state: { label: 'Vom Server vorgegeben', tone: 'neutral' },
        target: TO.liveSettings,
        note: 'Dort nur zu sehen — ändern kann es der Betreiber eurer Schule.',
    },
    {
        icon: Video,
        name: 'Reverb (Live-Aktualisierungen)',
        fields: 'App-ID, Schlüssel, Secret',
        state: { label: 'Vom Server vorgegeben', tone: 'neutral' },
        target: TO.liveSettings,
        note: 'Dort nur zu sehen — ändern kann es der Betreiber eurer Schule.',
    },
    {
        icon: Smartphone,
        name: 'Expo, Apple (App Store Connect), Google Play',
        fields: 'Zugriffstoken, API-Schlüssel, Dienstkonto',
        state: { label: 'Geparkt', tone: 'faint' },
        target: TO.mobile,
    },
];

function CredentialsView({ onView }: { onView: (v: View) => void }) {
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-8 px-8 py-8">
            <header>
                <h1 className="text-2xl font-semibold tracking-tight">Zugangsdaten</h1>
                <p className="text-sm text-muted-foreground">
                    Was das System selbst braucht. Die Zugangsdaten einzelner Bereiche stellst du
                    jetzt dort ein, wo du sie brauchst.
                </p>
            </header>

            <SettingsSection title="Hier eingestellt">
                <CredentialCard
                    icon={Mail}
                    title="E-Mail-Versand"
                    text="Über diesen Server gehen alle E-Mails der Schule raus: Einladungen, Erinnerungen, Rechnungen."
                    source="store"
                    updated="Aktualisiert 30.09.2026 von Amina Berger"
                    fields={[
                        {
                            key: 'smtp_host',
                            label: 'SMTP-Host',
                            value: 'smtp.alnur-akademie.example',
                        },
                        { key: 'smtp_port', label: 'SMTP-Port', value: '587' },
                        {
                            key: 'smtp_username',
                            label: 'SMTP-Benutzername',
                            value: 'schule@alnur-akademie.example',
                        },
                        {
                            key: 'smtp_password',
                            label: 'SMTP-Passwort',
                            secret: true,
                            value: '',
                            last4: '4f2a',
                        },
                        {
                            key: 'mail_from_address',
                            label: 'Absenderadresse',
                            type: 'email',
                            value: 'schule@alnur-akademie.example',
                        },
                    ]}
                    test={{
                        label: 'Test-E-Mail an mich senden',
                        tooltip: `Schickt eine echte E-Mail an ${ME.email} — prüft auch das Passwort`,
                        last: 'Zuletzt getestet 30.09.2026, 10:04 — angekommen.',
                        ok: `Test-E-Mail an ${ME.email} gesendet. Bitte Posteingang prüfen.`,
                    }}
                />
                <CredentialCard
                    icon={Bug}
                    title="GitHub (Problemberichte)"
                    text="Meldet jemand in der App ein Problem, landet es als Eintrag im GitHub-Projekt eures Betreibers."
                    source="env"
                    updated={null}
                    fields={[
                        {
                            key: 'github_token',
                            label: 'GitHub-Zugriffstoken',
                            secret: true,
                            value: '',
                            last4: 'x9Qd',
                        },
                    ]}
                    test={{
                        label: 'Verbindung testen',
                        tooltip: 'Prüft, ob das Token angenommen wird — legt nichts an',
                        last: 'Noch nie getestet.',
                        ok: 'Verbindung erfolgreich.',
                    }}
                />
            </SettingsSection>

            <SettingsSection
                title="Woanders eingestellt"
                text="Diese Zugangsdaten gehören zu einem Bereich und stehen jetzt dort, neben dem, wofür sie gebraucht werden."
            >
                <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                    {ELSEWHERE.map((x) => (
                        <li key={x.name} className="flex items-center gap-3 px-4 py-3">
                            <x.icon
                                className="size-4 shrink-0 text-muted-foreground"
                                aria-hidden="true"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">{x.name}</div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {x.note ?? x.fields}
                                </div>
                            </div>
                            <Badge tone={x.state.tone} dot>
                                {x.state.label}
                            </Badge>
                            <TargetLink
                                target={x.target}
                                onView={onView}
                                className="w-60 shrink-0 justify-end text-sm"
                            />
                        </li>
                    ))}
                </ul>
                {/* MOCK-ONLY: where the browser-push (VAPID) keys live after the move is not decided; they stay out of this list. */}
            </SettingsSection>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Schule
// ---------------------------------------------------------------------------

const LOCALES = [
    { code: 'de', label: 'Deutsch', entries: 0 },
    { code: 'en', label: 'English', entries: 214 },
] as const;
const TIMEZONES = [
    'Europe/Berlin',
    'Europe/Vienna',
    'Europe/Zurich',
    'Europe/London',
    'Europe/Istanbul',
    'Africa/Cairo',
    'Asia/Dubai',
];

type SchoolSettings = {
    name: string;
    defaultLocale: string;
    enabled: string[];
    timezone: string;
};
const SCHOOL_SETTINGS: SchoolSettings = {
    name: SCHOOL,
    defaultLocale: 'de',
    enabled: ['de', 'en'],
    timezone: 'Europe/Berlin',
};

const MOVED: { what: string; detail: string; target: Target }[] = [
    {
        what: 'Registrierung und Anmeldung',
        detail: 'Anmeldemodus, Mit Google anmelden, Single Sign-on, Passwort-Anmeldung abschalten',
        target: TO.usersLogin,
    },
    {
        what: 'Erinnerungen vor Live-Sitzungen',
        detail: 'Wann die erste und die letzte Erinnerung rausgeht',
        target: TO.liveSettings,
    },
    {
        what: 'Sponsoren',
        detail: 'Ob es Sponsoren an deiner Schule gibt',
        target: TO.sponsorsSettings,
    },
];

function SchoolView({ onView }: { onView: (v: View) => void }) {
    const id = useId();
    const [saved, setSaved] = useState(SCHOOL_SETTINGS);
    const [draft, setDraft] = useState(SCHOOL_SETTINGS);
    const [confirmOff, setConfirmOff] = useState<string | null>(null);
    const [note, setNote] = useState<string | null>(null);
    const changed = [
        draft.name !== saved.name && 'Schulname',
        draft.defaultLocale !== saved.defaultLocale && 'Standardsprache',
        draft.enabled.join() !== saved.enabled.join() && 'Aktivierte Sprachen',
        draft.timezone !== saved.timezone && 'Zeitzone',
    ].filter(Boolean) as string[];
    const toggle = (code: string, on: boolean) =>
        setDraft((d) => ({
            ...d,
            enabled: on ? [...d.enabled, code] : d.enabled.filter((c) => c !== code),
        }));
    const off = LOCALES.find((l) => l.code === confirmOff);

    return (
        // The unsaved bar is sticky inside the page's own scroll area, so it
        // spans the page only — never the rail or the menu beside it.
        <div className="flex min-h-svh flex-col">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-8 py-8">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">Schule</h1>
                    <p className="text-sm text-muted-foreground">
                        Name, Sprachen und Zeitzone — was für die ganze Schule gilt.
                    </p>
                </header>

                <SettingsSection title="Name">
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-name`}>Schulname</Label>
                        <Input
                            id={`${id}-name`}
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            aria-describedby={`${id}-name-hint`}
                        />
                        <p id={`${id}-name-hint`} className="text-xs text-muted-foreground">
                            Steht in E-Mails, auf Zertifikaten und im Browser-Tab.
                        </p>
                    </div>
                </SettingsSection>

                <SettingsSection
                    title="Sprachen"
                    text="Welche Sprachen Nutzer auswählen können — im Admin, in der App und auf der Website."
                >
                    <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                        <div className="flex items-center justify-between gap-6 p-4">
                            <div>
                                <Label htmlFor={`${id}-default`} className="text-sm font-medium">
                                    Standardsprache
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Für alle, die keine eigene gewählt haben.
                                </p>
                            </div>
                            <Select
                                value={draft.defaultLocale}
                                onValueChange={(v) =>
                                    setDraft({
                                        ...draft,
                                        defaultLocale: v,
                                        enabled: draft.enabled.includes(v)
                                            ? draft.enabled
                                            : [...draft.enabled, v],
                                    })
                                }
                            >
                                <SelectTrigger id={`${id}-default`} className="w-44">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LOCALES.map((l) => (
                                        <SelectItem key={l.code} value={l.code}>
                                            {l.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <fieldset className="flex flex-col gap-3 p-4">
                            <legend className="sr-only">Aktivierte Sprachen</legend>
                            <div aria-hidden="true" className="text-sm font-medium">
                                Aktivierte Sprachen
                            </div>
                            {LOCALES.map((l) => {
                                const isDefault = draft.defaultLocale === l.code;
                                const on = draft.enabled.includes(l.code);
                                return (
                                    <div key={l.code} className="flex items-start gap-3">
                                        <Checkbox
                                            id={`${id}-l-${l.code}`}
                                            checked={on}
                                            disabled={isDefault}
                                            aria-describedby={`${id}-l-${l.code}-hint`}
                                            onCheckedChange={(v) => {
                                                if (!v && l.entries > 0) setConfirmOff(l.code);
                                                else toggle(l.code, !!v);
                                            }}
                                        />
                                        <div>
                                            <Label
                                                htmlFor={`${id}-l-${l.code}`}
                                                className="font-normal"
                                            >
                                                {l.label}
                                            </Label>
                                            <p
                                                id={`${id}-l-${l.code}-hint`}
                                                className="text-xs text-muted-foreground"
                                            >
                                                {isDefault
                                                    ? 'Standard — ändere zuerst die Standardsprache, um diese zu deaktivieren'
                                                    : l.entries > 0
                                                      ? `${l.entries} Einträge nutzen diese Sprache noch`
                                                      : 'Noch keine Inhalte in dieser Sprache'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </fieldset>
                    </div>
                </SettingsSection>

                <SettingsSection
                    title="Zeitzone"
                    text="Alle Uhrzeiten — Live-Sitzungen, Fristen, Erinnerungen — gelten in dieser Zeitzone."
                >
                    <div className="grid max-w-sm gap-2">
                        <Label htmlFor={`${id}-tz`}>Zeitzone</Label>
                        <Combobox
                            id={`${id}-tz`}
                            value={draft.timezone}
                            options={TIMEZONES}
                            onChange={(tz) => setDraft({ ...draft, timezone: tz })}
                            searchPlaceholder="Zeitzone suchen…"
                            emptyLabel="Keine Zeitzone entspricht dieser Suche."
                        />
                    </div>
                </SettingsSection>

                <SettingsSection
                    title="Woanders eingestellt"
                    text="Das stand früher auch hier und gehört jetzt zu seinem Bereich."
                >
                    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-muted/40">
                        {MOVED.map((m) => (
                            <li key={m.what} className="flex items-center gap-4 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium">{m.what}</div>
                                    <div className="text-xs text-muted-foreground">{m.detail}</div>
                                </div>
                                <TargetLink
                                    target={m.target}
                                    onView={onView}
                                    className="shrink-0 text-sm"
                                />
                            </li>
                        ))}
                    </ul>
                </SettingsSection>
                {note && (
                    <p role="status" className="text-sm text-muted-foreground">
                        {note}
                    </p>
                )}
            </div>

            {changed.length > 0 && (
                <div
                    role="region"
                    aria-label="Ungespeicherte Änderungen"
                    className="sticky bottom-0 z-20 border-t border-border bg-background px-8 py-3 shadow-lg"
                >
                    <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
                        <p className="text-sm">
                            <span className="font-medium">Nicht gespeichert.</span>{' '}
                            <span className="text-muted-foreground">
                                Geändert: {changed.join(', ')}.
                            </span>
                        </p>
                        <div className="flex shrink-0 gap-2">
                            <Button variant="outline" onClick={() => setDraft(saved)}>
                                Verwerfen
                            </Button>
                            <Button
                                disabled={draft.name.trim() === ''}
                                onClick={() => {
                                    setSaved(draft);
                                    setNote('Gespeichert.');
                                }}
                            >
                                Speichern
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmActionDialog
                open={off !== undefined}
                onOpenChange={(o) => !o && setConfirmOff(null)}
                title={`${off?.label ?? ''} deaktivieren?`}
                description={`${off?.entries ?? 0} Einträge enthalten noch Inhalte in dieser Sprache. Die Deaktivierung blendet sie sofort aus dem Admin-Bereich und auf öffentlichen Seiten aus. Die Inhalte bleiben in der Datenbank — die Sprache kann jederzeit wieder aktiviert werden.`}
                confirmLabel="Trotzdem deaktivieren"
                cancelLabel="Abbrechen"
                onConfirm={() => {
                    if (off) toggle(off.code, false);
                    setConfirmOff(null);
                }}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Mobile App — parked
// ---------------------------------------------------------------------------

function MobileView() {
    return (
        <div className="flex h-full items-center justify-center px-8 py-12">
            <EmptyState
                icon={Smartphone}
                title="Mobile App"
                description="Bleibt vorerst, wie sie ist. Ob es weiterhin eine eigene App pro Schule gibt, wird gerade entschieden — bis dahin ändert sich hier nichts."
                className="max-w-xl"
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

function SystemPage({
    initialView = { kind: 'overview', scope: 'all' },
    openCheck = null,
    openJob = null,
    openEntry = null,
}: {
    initialView?: View;
    openCheck?: string | null;
    openJob?: number | null;
    openEntry?: number | null;
}) {
    const [view, setView] = useState<View>(initialView);
    const [check, setCheck] = useState<string | null>(openCheck);
    const [jobs, setJobs] = useState(JOBS);
    const [job, setJob] = useState<number | null>(openJob);
    const [entry, setEntry] = useState<number | null>(openEntry);
    const [lastRun, setLastRun] = useState(LAST_RUN);
    const [running, setRunning] = useState(false);
    const [jobConfirm, setJobConfirm] = useState<{ kind: 'cancel' | 'retry'; id: number } | null>(
        null,
    );
    const [jobNotice, setJobNotice] = useState<string | null>(null);

    const run = () => {
        setRunning(true);
        setTimeout(() => {
            setRunning(false);
            setLastRun('2026-10-01T09:41:00');
        }, 1200);
    };
    const openCheckObj = CHECKS.find((c) => c.id === check) ?? null;
    const openJobObj = jobs.find((j) => j.id === job) ?? null;
    const openEntryObj = AUDIT.find((e) => e.id === entry) ?? null;
    const confirmJob = jobs.find((j) => j.id === jobConfirm?.id);
    const go = (v: View) => {
        setCheck(null);
        setJob(null);
        setEntry(null);
        setView(v);
    };

    return (
        <Shell menu={<SystemMenu view={view} onView={go} checks={CHECKS} jobs={jobs} />}>
            {view.kind === 'overview' && (
                <OverviewView
                    key={view.scope}
                    checks={CHECKS}
                    scope={view.scope}
                    onOpen={setCheck}
                    onView={go}
                    onRun={run}
                    lastRun={lastRun}
                    running={running}
                />
            )}
            {view.kind === 'jobs' && (
                <JobsView
                    jobs={jobs}
                    onOpen={setJob}
                    onCancel={(id) => setJobConfirm({ kind: 'cancel', id })}
                    onRetry={(id) => setJobConfirm({ kind: 'retry', id })}
                    notice={jobNotice}
                />
            )}
            {view.kind === 'audit' && <AuditView onOpen={setEntry} />}
            {view.kind === 'credentials' && <CredentialsView onView={go} />}
            {view.kind === 'school' && <SchoolView onView={go} />}
            {view.kind === 'mobile' && <MobileView />}

            {openCheckObj && view.kind === 'overview' && (
                <CheckSheet
                    key={openCheckObj.id}
                    check={openCheckObj}
                    onClose={() => setCheck(null)}
                    onView={go}
                    onRun={run}
                    lastRun={lastRun}
                    running={running}
                />
            )}
            {openJobObj && view.kind === 'jobs' && (
                <JobSheet
                    key={openJobObj.id}
                    job={openJobObj}
                    onClose={() => setJob(null)}
                    onCancel={() => setJobConfirm({ kind: 'cancel', id: openJobObj.id })}
                    onRetry={() => setJobConfirm({ kind: 'retry', id: openJobObj.id })}
                />
            )}
            {openEntryObj && view.kind === 'audit' && (
                <AuditSheet entry={openEntryObj} onClose={() => setEntry(null)} onView={go} />
            )}
            {/* The real copy: jobs.actions.confirm_* */}
            <ConfirmActionDialog
                open={jobConfirm?.kind === 'cancel'}
                onOpenChange={(o) => !o && setJobConfirm(null)}
                title="Diesen Job abbrechen?"
                description="Der Worker schließt den aktuellen Eintrag ab und stoppt. Bereits verarbeitete Einträge bleiben erhalten."
                confirmLabel="Ja, abbrechen"
                cancelLabel="Zurück"
                variant="destructive"
                onConfirm={() => {
                    setJobs((all) =>
                        all.map((j) =>
                            j.id === jobConfirm?.id
                                ? { ...j, status: 'cancelled', finishedAt: LAST_RUN }
                                : j,
                        ),
                    );
                    setJobNotice(
                        'Abbruch angefordert. Der Worker stoppt nach dem aktuellen Eintrag.',
                    );
                    setJobConfirm(null);
                }}
            />
            <ConfirmActionDialog
                open={jobConfirm?.kind === 'retry'}
                onOpenChange={(o) => !o && setJobConfirm(null)}
                title="Diesen Job neu starten?"
                description={
                    confirmJob?.type === 'notify' || confirmJob?.type === 'import'
                        ? 'Der Worker startet von vorn. Bereits erfolgreiche Einträge werden übersprungen, fehlgeschlagene erneut versucht — dabei können erneut Benachrichtigungen rausgehen.'
                        : 'Der Worker startet von vorn. Bereits erfolgreiche Einträge werden übersprungen.'
                }
                confirmLabel="Ja, wiederholen"
                cancelLabel="Zurück"
                onConfirm={() => {
                    setJobs((all) =>
                        all.map((j) =>
                            j.id === jobConfirm?.id
                                ? {
                                      ...j,
                                      status: 'running',
                                      finishedAt: null,
                                      failure: undefined,
                                      attempts: j.attempts + 1,
                                  }
                                : j,
                        ),
                    );
                    setJobNotice('Wiederholung gestartet.');
                    setJobConfirm(null);
                }}
            />
        </Shell>
    );
}

/**
 * The System area as it could look — what used to be "Betrieb", with
 * everything feature-specific moved to its feature: the school's health with
 * problems first and a way to where each is fixed, background jobs, the audit
 * log, the two credentials that stay, the school's basics, and the parked
 * mobile app. Click around — it responds, but saves nothing.
 */
const meta: Meta<typeof SystemPage> = {
    title: 'Pages/Admin/System',
    component: SystemPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.system')) localStorage.removeItem(k);
    },
};
export default meta;

const rowsShown = (el: HTMLElement) =>
    waitFor(() => expect(el.querySelectorAll('tr[data-grid-row-id]').length).toBeGreaterThan(0));

/** The school's health, grouped by area, problems first — each with the way to where it is fixed. */
export const Uebersicht: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** Only what is red: the menu's "Fehler". */
export const NurFehler: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'overview', scope: 'failed' }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** One check in a panel: what it looks at, the current result, the last runs, where to fix it. */
export const PruefungSheet: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage openCheck="paypal" />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const panel = await body.findByRole('dialog', { name: 'PayPal-Zugangsdaten' });
        await waitFor(() =>
            expect(panel.ownerDocument.activeElement).toHaveTextContent('PayPal-Zugangsdaten'),
        );
        await rowsShown(panel);
    },
};

/** Background jobs: what runs, what failed, filtered by status. */
export const Hintergrundaufgaben: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'jobs' }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** Only the failed jobs. */
export const AufgabenFehlgeschlagen: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'jobs' }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
        await userEvent.click(within(canvasElement).getByRole('radio', { name: /Fehlgeschlagen/ }));
        await waitFor(() =>
            expect(canvasElement.querySelectorAll('tr[data-grid-row-id]').length).toBe(2),
        );
    },
};

/** A running import: progress, parameters, its log, and "Abbrechen". */
export const AufgabeSheet: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'jobs' }} openJob={812} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        await body.findByRole('dialog', { name: 'CSV-Import #812' });
    },
};

/** A failed job: the error up front and "Erneut versuchen". */
export const AufgabeFehlgeschlagen: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'jobs' }} openJob={805} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        await body.findByRole('dialog', { name: 'Sitzungsaufzeichnung verarbeiten #805' });
    },
};

/** The audit log: when, who, what, about whom. */
export const Protokoll: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'audit' }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** One entry: the old value next to the new one. */
export const ProtokollEintrag: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'audit' }} openEntry={38} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        await body.findByRole('dialog', { name: 'Rolle geändert' });
    },
};

/** The two credentials that stay — and where all the others went. */
export const Zugangsdaten: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'credentials' }} />,
};

/** Name, languages, time zone; with what moved elsewhere. */
export const Schule: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'school' }} />,
};

/** A changed school name, not yet saved: the bar says what changed. */
export const SchuleUngespeichert: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'school' }} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const name = canvas.getByLabelText('Schulname');
        await userEvent.clear(name);
        await userEvent.type(name, 'Al-Nur Akademie Berlin');
        await canvas.findByRole('region', { name: 'Ungespeicherte Änderungen' });
    },
};

/** Parked: the decision about white-label apps is still open. */
export const MobileApp: StoryObj<typeof SystemPage> = {
    render: () => <SystemPage initialView={{ kind: 'mobile' }} />,
};
