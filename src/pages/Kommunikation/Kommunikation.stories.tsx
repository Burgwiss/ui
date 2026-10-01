import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
    ArrowRight,
    BellRing,
    BookOpen,
    CircleCheck,
    CreditCard,
    EllipsisVertical,
    Eye,
    EyeOff,
    HandCoins,
    Hash,
    House,
    Info,
    Lock,
    LockOpen,
    Mail,
    Megaphone,
    MessagesSquare,
    PanelsTopLeft,
    Pencil,
    Plus,
    ScrollText,
    Send,
    Settings2,
    ShieldCheck,
    SlidersHorizontal,
    Trash2,
    UserMinus,
    UserRound,
    Users as UsersIcon,
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
import { IconButton } from '../../atoms/IconButton';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { Switch } from '../../atoms/Switch';
import { Textarea } from '../../atoms/Textarea';
import type { GridColumn } from '../../hooks/grid/types';
import type { GridActionItem } from '../../hooks/gridActions';
import { useGrid } from '../../hooks/useGrid';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../molecules/Tabs';
import { AppRail, AppRailItem, AppRailSpacer } from '../../organisms/AppRail';
import { DataGrid } from '../../organisms/DataGrid';
import {
    DATA_GRID_LABELS,
    FILTER_CHIPS_LABELS,
    FILTER_EDITOR_LABELS,
    VIEWS_LABELS,
} from '../../organisms/DataGrid/DataGrid.fixtures';
import { MessageList, type MessageListItem } from '../../organisms/MessageList';
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
 * PAGE PROTOTYPE — Kommunikation, an area of its own in the admin rail: how
 * the school talks to its people. The private conversations between a
 * student and a teacher (read-only oversight, every look in the audit log),
 * the group channels of the course runs, the announcements teachers send,
 * every e-mail the app sends by itself, and the rules for when and to whom.
 * Room for campaigns later. Same shell as Kurse, Nutzer, Live, Zahlungen,
 * Sponsoren and System. Non-functional: example content, no server.
 *
 * Grounded in `app/Domain/Messages` (ADR-0024, ADR-0037),
 * `app/Domain/Channels` (ADR-0062), `app/Domain/Notifications` (ADR-0006,
 * ADR-0023), every `*Notification` class and Mailable in `app/Domain/**`,
 * and the ops digest (ADR-0064). Anything here with no backend behind it
 * today carries a `MOCK-ONLY` comment.
 */

// ---------------------------------------------------------------------------
// Example data: the course runs, the conversations
// ---------------------------------------------------------------------------

const NOW = '2026-10-01T09:40:00';
const SCHOOL = 'Al-Nur Akademie';
const ME = { name: 'Amina Berger', email: 'amina.berger@alnur-akademie.example' };
const SENDER = 'schule@alnur-akademie.example';

type Offering = { id: number; course: string; run: string; teacher: string; students: number };
const OFFERINGS: Offering[] = [
    {
        id: 12,
        course: 'Arabisch A1',
        run: 'Herbst 2026 · Online',
        teacher: 'Samira Haddou',
        students: 31,
    },
    {
        id: 14,
        course: 'Deutsch für den Beruf B1',
        run: 'Herbst 2026 · Online',
        teacher: 'Thomas Berger',
        students: 24,
    },
    {
        id: 15,
        course: 'Pflege-Fachsprache',
        run: 'Herbst 2026 · Potsdam',
        teacher: 'Petra Lang',
        students: 14,
    },
    {
        id: 16,
        course: 'Tajwid Grundlagen',
        run: 'Herbst 2026 · Berlin',
        teacher: 'Karim Mansour',
        students: 16,
    },
    {
        id: 11,
        course: 'Hifz-Kreis: Juz ʿAmma',
        run: 'Laufend',
        teacher: 'Maryam Sayed',
        students: 19,
    },
    {
        id: 9,
        course: 'Fiqh des Alltags',
        run: 'Frühjahr 2026 · Online',
        teacher: 'Hüseyin Aydın',
        students: 22,
    },
];
const offering = (id: number) => OFFERINGS.find((o) => o.id === id)!;
const runLabel = (id: number) => `${offering(id).course} · ${offering(id).run}`;

type Msg = {
    id: number;
    /** `staff` is the teacher of the conversation; otherwise the student. */
    from: 'student' | 'staff';
    body: string;
    at: string;
    file?: { name: string; size: number; mime: string };
};

type Thread = {
    id: number;
    offeringId: number;
    student: string;
    staff: string;
    messages: number;
    lastAt: string;
    closed: boolean;
    transcript?: Msg[];
};

const THREADS: Thread[] = [
    {
        id: 41,
        offeringId: 12,
        student: 'Yusuf Okafor',
        staff: 'Samira Haddou',
        messages: 7,
        lastAt: '2026-10-01T08:47:00',
        closed: false,
        transcript: [
            {
                id: 1,
                from: 'student',
                body: 'Salam Frau Haddou, ich habe die Hausaufgabe zu Lektion 4 gemacht, bin mir aber bei den Sonnenbuchstaben unsicher. Darf ich sie Ihnen schicken?',
                at: '2026-09-30T19:12:00',
            },
            {
                id: 2,
                from: 'staff',
                body: 'Wa alaikum salam Yusuf, klar — schick sie gern hier rein.',
                at: '2026-09-30T19:40:00',
            },
            {
                id: 3,
                from: 'student',
                body: '',
                at: '2026-09-30T19:43:00',
                file: {
                    name: 'hausaufgabe-lektion-4.pdf',
                    size: 2_400_000,
                    mime: 'application/pdf',
                },
            },
            {
                id: 4,
                from: 'student',
                body: 'Bei Aufgabe 3 weiß ich nicht, ob das Lam bei „asch-schams“ gesprochen wird.',
                at: '2026-09-30T19:44:00',
            },
            {
                id: 5,
                from: 'staff',
                body: 'Sehr ordentlich! Bei asch-schams wird das Lam nicht gesprochen — das Schin wird dafür verdoppelt. Genau das sind die Sonnenbuchstaben. Aufgabe 5 schau dir bitte noch einmal an.',
                at: '2026-10-01T08:30:00',
            },
            {
                id: 6,
                from: 'staff',
                body: '',
                at: '2026-10-01T08:31:00',
                file: {
                    name: 'korrektur-yusuf-lektion-4.pdf',
                    size: 1_100_000,
                    mime: 'application/pdf',
                },
            },
            {
                id: 7,
                from: 'student',
                body: 'Danke! Ich mache es bis Donnerstag.',
                at: '2026-10-01T08:47:00',
            },
        ],
    },
    {
        id: 40,
        offeringId: 14,
        student: 'Omar Krüger',
        staff: 'Thomas Berger',
        messages: 5,
        lastAt: '2026-09-30T21:15:00',
        closed: true,
        transcript: [
            {
                id: 1,
                from: 'student',
                body: 'Warum habe ich beim Test zu Modul 2 nur 52 % bekommen? Ich hatte fast alles richtig.',
                at: '2026-09-29T17:02:00',
            },
            {
                id: 2,
                from: 'staff',
                body: 'Hallo Omar, die Aufgaben 4 bis 7 waren leer abgegeben. Das Quiz hat sie als falsch gewertet.',
                at: '2026-09-29T18:20:00',
            },
            {
                id: 3,
                from: 'student',
                body: 'Die Seite ist bei Aufgabe 4 abgestürzt. Das ist nicht fair.',
                at: '2026-09-29T18:31:00',
            },
            {
                id: 4,
                from: 'staff',
                body: 'Das prüfe ich. Wenn die Seite wirklich abgestürzt ist, darfst du den Test wiederholen.',
                at: '2026-09-30T08:05:00',
            },
            {
                id: 5,
                from: 'student',
                body: 'Meine Mutter möchte trotzdem mit der Schulleitung sprechen.',
                at: '2026-09-30T21:15:00',
            },
        ],
    },
    ...(
        [
            [39, 12, 'Hanna Haddad', 'Samira Haddou', 4, '2026-09-30T16:20:00', false],
            [38, 14, 'Leonie Weber', 'Thomas Berger', 9, '2026-09-30T12:02:00', false],
            [37, 15, 'Elif Demir', 'Petra Lang', 3, '2026-09-29T20:45:00', false],
            [36, 16, 'Bilal Rahman', 'Karim Mansour', 22, '2026-09-29T19:30:00', false],
            [35, 12, 'Sara Nasser', 'Samira Haddou', 2, '2026-09-29T10:14:00', false],
            [34, 14, 'Jonas Yılmaz', 'Thomas Berger', 6, '2026-09-28T22:40:00', false],
            [33, 11, 'Aisha Mahmoud', 'Maryam Sayed', 15, '2026-09-28T18:00:00', false],
            [32, 15, 'Tobias Wagner', 'Petra Lang', 5, '2026-09-27T14:10:00', false],
            [31, 12, 'Karim Saleh', 'Samira Haddou', 1, '2026-09-26T09:30:00', false],
            [30, 16, 'Nour El-Amin', 'Karim Mansour', 8, '2026-09-25T20:05:00', true],
            [29, 14, 'Maryam Schneider', 'Thomas Berger', 3, '2026-09-24T11:15:00', false],
            [21, 9, 'Lea Fischer', 'Hüseyin Aydın', 18, '2026-05-28T17:45:00', true],
            [20, 9, 'Felix Brandt', 'Hüseyin Aydın', 6, '2026-05-20T09:00:00', true],
        ] as const
    ).map(([id, offeringId, student, staff, messages, lastAt, closed]) => ({
        id,
        offeringId,
        student,
        staff,
        messages,
        lastAt,
        closed,
    })),
];

/** Conversations without a written transcript get a short, plausible one. */
function transcriptOf(t: Thread): Msg[] {
    if (t.transcript) return t.transcript;
    const first = t.staff.split(' ')[0];
    return [
        {
            id: 1,
            from: 'student',
            body: `Hallo ${first}, ich schaffe den Termin am Donnerstag nicht. Kann ich die Aufzeichnung nachholen?`,
            at: '2026-09-24T18:00:00',
        },
        {
            id: 2,
            from: 'staff',
            body: 'Ja, die Aufzeichnung steht am Freitag im Kurs. Schreib mir, wenn danach Fragen offen sind.',
            at: '2026-09-24T19:10:00',
        },
        { id: 3, from: 'student', body: 'Danke!', at: t.lastAt },
    ];
}

// ---------------------------------------------------------------------------
// Example data: the channels
// ---------------------------------------------------------------------------

type Member = { id: number; name: string; pseudonym: string; teacher?: boolean };
type ChannelMsg = {
    id: number;
    memberId: number;
    body: string;
    at: string;
    deleted?: boolean;
    replyTo?: number;
};

type Channel = {
    id: number;
    offeringId: number;
    name: string;
    description: string;
    anonymous: boolean;
    locked: boolean;
    /** Plain-language summary of the join rules; empty = every enrolled student. */
    rules: string[];
    members: Member[];
    messages: number;
    // MOCK-ONLY: last activity — the oversight list does not load it today.
    lastAt: string;
    log?: ChannelMsg[];
};

const people = (names: string[], teacher: string): Member[] => [
    { id: 1, name: teacher, pseudonym: teacher, teacher: true },
    ...names.map((name, i) => ({ id: i + 2, name, pseudonym: `Mitglied ${i + 1}` })),
];

const CHANNELS: Channel[] = [
    {
        id: 3,
        offeringId: 12,
        name: 'Fragen zur Grammatik',
        description: 'Alles zu Buchstaben, Vokalen und Satzbau — keine Frage ist zu klein.',
        anonymous: true,
        locked: false,
        rules: [],
        members: people(
            [
                'Yusuf Okafor',
                'Hanna Haddad',
                'Sara Nasser',
                'Karim Saleh',
                'Bilal Rahman',
                'Zainab Ali',
                'Lukas Hoffmann',
                'Emma Richter',
            ],
            'Samira Haddou',
        ),
        messages: 186,
        lastAt: '2026-10-01T09:05:00',
        log: [
            {
                id: 1,
                memberId: 3,
                body: 'Wann schreibt man das Ta marbuta mit zwei Punkten und wann nicht?',
                at: '2026-09-30T15:40:00',
            },
            {
                id: 2,
                memberId: 6,
                body: 'Hier war eine Nachricht, die gelöscht wurde.',
                at: '2026-09-30T15:52:00',
                deleted: true,
            },
            {
                id: 3,
                memberId: 1,
                body: 'Ta marbuta hat immer die zwei Punkte — außer im Satz ganz am Ende, wenn ihr pausiert. Dann sprecht ihr es wie ein h. Schaut euch dazu noch einmal Folie 12 an.',
                at: '2026-09-30T16:05:00',
                replyTo: 1,
            },
            {
                id: 4,
                memberId: 2,
                body: 'Ah, deshalb klingt „madrasa“ am Satzende anders. Danke!',
                at: '2026-09-30T16:11:00',
            },
            {
                id: 5,
                memberId: 8,
                body: 'Gibt es die Folien auch als PDF?',
                at: '2026-10-01T08:58:00',
            },
            {
                id: 6,
                memberId: 1,
                body: 'Ja, unter Lektion 4 → Material.',
                at: '2026-10-01T09:05:00',
                replyTo: 5,
            },
        ],
    },
    {
        id: 4,
        offeringId: 12,
        name: 'Allgemein',
        description: 'Organisatorisches zur Ausführung.',
        anonymous: false,
        locked: false,
        rules: [],
        members: people(
            ['Yusuf Okafor', 'Hanna Haddad', 'Sara Nasser', 'Karim Saleh', 'Bilal Rahman'],
            'Samira Haddou',
        ),
        messages: 92,
        lastAt: '2026-09-30T18:20:00',
    },
    {
        id: 5,
        offeringId: 12,
        name: 'Schwesternrunde',
        description: 'Austausch unter den Teilnehmerinnen.',
        anonymous: false,
        locked: false,
        rules: ['Geschlecht ist gleich weiblich'],
        members: people(['Hanna Haddad', 'Sara Nasser', 'Zainab Ali'], 'Samira Haddou'),
        messages: 41,
        lastAt: '2026-09-29T21:00:00',
    },
    {
        id: 6,
        offeringId: 14,
        name: 'Hausaufgaben',
        description: 'Fragen zu den Aufgaben der Woche.',
        anonymous: false,
        locked: false,
        rules: [],
        members: people(['Omar Krüger', 'Leonie Weber', 'Jonas Yılmaz'], 'Thomas Berger'),
        messages: 64,
        lastAt: '2026-09-30T20:12:00',
    },
    {
        id: 7,
        offeringId: 14,
        name: 'Prüfungsvorbereitung B1',
        description: 'Übungsaufgaben und Lerngruppen für die B1-Prüfung.',
        anonymous: true,
        locked: true,
        rules: [],
        members: people(['Omar Krüger', 'Leonie Weber', 'Maryam Schneider'], 'Thomas Berger'),
        messages: 133,
        lastAt: '2026-09-29T22:48:00',
    },
    {
        id: 8,
        offeringId: 15,
        name: 'Stationsalltag',
        description: 'Redewendungen aus dem Klinikalltag.',
        anonymous: false,
        locked: false,
        rules: [],
        members: people(['Elif Demir', 'Tobias Wagner'], 'Petra Lang'),
        messages: 27,
        lastAt: '2026-09-28T13:30:00',
    },
    {
        id: 9,
        offeringId: 11,
        name: 'Elternrunde',
        description: 'Für Eltern der Kinder im Hifz-Kreis.',
        anonymous: false,
        locked: false,
        rules: ['Rolle in der Familie ist gleich Elternteil', 'Alter ist mindestens 18'],
        members: people(['Rami Haddad', 'Grace Okafor'], 'Maryam Sayed'),
        messages: 58,
        lastAt: '2026-09-29T09:50:00',
    },
    {
        id: 10,
        offeringId: 16,
        name: 'Rezitation üben',
        description: 'Aufnahmen teilen und Rückmeldung geben.',
        anonymous: false,
        locked: false,
        rules: [],
        members: people(['Bilal Rahman', 'Nour El-Amin'], 'Karim Mansour'),
        messages: 74,
        lastAt: '2026-09-27T19:00:00',
    },
    {
        id: 2,
        offeringId: 9,
        name: 'Fragen',
        description: 'Fragen zwischen den Terminen.',
        anonymous: true,
        locked: true,
        rules: [],
        members: people(['Lea Fischer', 'Felix Brandt'], 'Hüseyin Aydın'),
        messages: 212,
        lastAt: '2026-05-30T12:00:00',
    },
];

// ---------------------------------------------------------------------------
// Example data: announcements
// ---------------------------------------------------------------------------

/** One row of `announcements` with its materialised recipients (ADR-0023). */
type Announcement = {
    id: number;
    offeringId: number;
    author: string;
    subject: string;
    body: string[];
    sentAt: string;
    recipients: number;
    read: number;
};

const ANNOUNCEMENTS: Announcement[] = [
    {
        id: 58,
        offeringId: 12,
        author: 'Samira Haddou',
        subject: 'Donnerstag fällt aus — Nachholtermin am Samstag',
        body: [
            'Salam ihr Lieben,',
            'der Termin am Donnerstag, 2. Oktober, muss leider ausfallen. Wir holen ihn am Samstag, 4. Oktober, um 10:00 Uhr nach — der Link bleibt derselbe.',
            'Wer am Samstag nicht kann: Die Aufzeichnung steht wie immer am Tag danach im Kurs.',
        ],
        sentAt: '2026-10-01T07:55:00',
        recipients: 32,
        read: 19,
    },
    {
        id: 57,
        offeringId: 14,
        author: 'Thomas Berger',
        subject: 'Probeprüfung B1 am 10. Oktober',
        body: [
            'Hallo zusammen,',
            'am Freitag, 10. Oktober, schreiben wir eine vollständige Probeprüfung unter echten Bedingungen: 3 Stunden, mit Pausen. Bringt bitte Kopfhörer für den Hörteil mit.',
        ],
        sentAt: '2026-09-30T16:10:00',
        recipients: 25,
        read: 21,
    },
    {
        id: 56,
        offeringId: 16,
        author: 'Karim Mansour',
        subject: 'Neue Übungsaufnahmen zu Sure al-Fatiha',
        body: [
            'Salam,',
            'unter Lektion 3 findet ihr jetzt meine Aufnahmen Vers für Vers. Hört sie euch vor Montag zweimal an.',
        ],
        sentAt: '2026-09-29T19:00:00',
        recipients: 17,
        read: 15,
    },
    {
        id: 55,
        offeringId: 15,
        author: 'Petra Lang',
        subject: 'Hospitation im Klinikum Ernst von Bergmann',
        body: [
            'Liebe Gruppe,',
            'die Hospitation findet am 15. Oktober statt. Treffpunkt ist 7:45 Uhr am Haupteingang. Bitte denkt an euren Impfnachweis.',
        ],
        sentAt: '2026-09-28T12:30:00',
        recipients: 15,
        read: 9,
    },
    {
        id: 54,
        offeringId: 12,
        author: 'Amina Berger',
        subject: 'Willkommen in Arabisch A1',
        body: [
            'Herzlich willkommen!',
            'In diesem Kurs lernst du in 14 Wochen das arabische Alphabet, einfache Sätze und die wichtigsten Begrüßungen. Den Stundenplan findest du in der Übersicht der Ausführung.',
        ],
        sentAt: '2026-09-12T08:00:00',
        recipients: 32,
        read: 31,
    },
    {
        id: 53,
        offeringId: 11,
        author: 'Maryam Sayed',
        subject: 'Elternabend am 20. September',
        body: [
            'Liebe Eltern,',
            'wir laden euch herzlich zum Elternabend ein — wir besprechen den Plan für das Halbjahr und beantworten eure Fragen.',
        ],
        sentAt: '2026-09-08T18:20:00',
        recipients: 20,
        read: 18,
    },
    {
        id: 41,
        offeringId: 9,
        author: 'Hüseyin Aydın',
        subject: 'Letzter Termin und Zertifikate',
        body: [
            'Liebe Teilnehmende,',
            'nächste Woche ist unser letzter Termin. Die Zertifikate bekommt ihr danach automatisch per E-Mail.',
        ],
        sentAt: '2026-05-22T10:00:00',
        recipients: 23,
        read: 23,
    },
];

const EXTRA_STUDENTS = [
    'Leonie Weber',
    'Omar Krüger',
    'Elif Demir',
    'Tobias Wagner',
    'Aisha Mahmoud',
    'Felix Brandt',
    'Lea Fischer',
    'Jonas Yılmaz',
    'Maryam Schneider',
    'Nour El-Amin',
    'Mia Becker',
    'Samir Aziz',
    'Clara Wolf',
    'Hamza Rashid',
    'Julia Neumann',
    'Ibrahim Kaya',
    'Emma Richter',
    'Lukas Hoffmann',
    'Zainab Ali',
    'Karim Saleh',
    'Sara Nasser',
    'Hanna Haddad',
    'Yusuf Okafor',
    'Bilal Rahman',
    'Noah Schulz',
    'Amira Hassan',
    'Ben Krause',
    'Layla Osman',
    'Paul Zimmermann',
    'Rania Farouk',
    'David Lehmann',
    'Yasmin Celik',
];

/** Who got one announcement: the enrolled students plus the teacher as a courtesy copy. */
function recipientsOf(a: Announcement) {
    const o = offering(a.offeringId);
    const names = [
        ...new Set([
            ...THREADS.filter((t) => t.offeringId === a.offeringId).map((t) => t.student),
            ...CHANNELS.filter((c) => c.offeringId === a.offeringId).flatMap((c) =>
                c.members.filter((m) => !m.teacher).map((m) => m.name),
            ),
        ]),
    ];
    // Pad with more example students, so the list is as long as the count.
    for (const extra of EXTRA_STUDENTS)
        if (names.length < a.recipients - 1 && !names.includes(extra)) names.push(extra);
    const rows = names.map((name, i) => ({
        name,
        role: 'Lernende:r',
        readAt: i < Math.round((a.read / a.recipients) * names.length) ? a.sentAt : null,
    }));
    return [{ name: o.teacher, role: 'Lehrkraft', readAt: a.sentAt }, ...rows];
}

// ---------------------------------------------------------------------------
// Example data: the automatic e-mails — the real catalogue
// ---------------------------------------------------------------------------

type Channel3 = 'mail' | 'inapp' | 'push';

type CategoryId =
    | 'account_security'
    | 'account_admin'
    | 'course_updates'
    | 'channels'
    | 'class_announcements'
    | 'direct_messages'
    | 'reminders'
    | 'recordings'
    | 'payments'
    | 'system_health';

/**
 * `NotificationCategory::wired()` — the ten categories with a real sender —
 * with the real labels (`notifications.categories.*`). `forced` is
 * `isForcedOn()`: nobody can switch those off.
 */
const CATEGORIES: Record<CategoryId, { label: string; forced: boolean }> = {
    account_security: { label: 'Kontosicherheit', forced: true },
    account_admin: { label: 'Kontoverwaltung', forced: false },
    course_updates: { label: 'Kursänderungen', forced: false },
    channels: { label: 'Kanäle', forced: false },
    class_announcements: { label: 'Durchführungsankündigungen', forced: true },
    direct_messages: { label: 'Direktnachrichten', forced: false },
    reminders: { label: 'Erinnerungen', forced: false },
    recordings: { label: 'Aufzeichnungen', forced: false },
    payments: { label: 'Zahlungen', forced: true },
    system_health: { label: 'Systemstatus', forced: true },
};

/**
 * One message the app sends by itself. Mirrors one `*Notification` class, a
 * Mailable or a Laravel built-in mail; `category` is its
 * `NotificationCategory`, which decides whether people can switch it off.
 * `null` = no category: it ignores every preference and always goes out.
 */
type AutoMail = {
    id: string;
    /** The PHP class, for whoever builds the real page. */
    source: string;
    name: string;
    area: string;
    trigger: string;
    to: string;
    channels: Channel3[];
    category: CategoryId | null;
    /** Sent to an address, not to an account — so there are no settings to respect. */
    address?: boolean;
    /** The real subject template (`lang/{de,en}/*.php`); `null` for push only. */
    subject: { de: string; en: string } | null;
    /** One sentence of body for the preview. */
    line: { de: string; en: string };
    cta?: { de: string; en: string };
};

/** Example values for the placeholders in the real subject templates. */
const PLACEHOLDERS: Record<string, { de: string; en: string }> = {
    school: { de: SCHOOL, en: SCHOOL },
    course: { de: 'Arabisch A1', en: 'Arabisch A1' },
    class: { de: 'Arabisch A1', en: 'Arabisch A1' },
    lesson: { de: 'Lektion 5: Die Mondbuchstaben', en: 'Lektion 5: Die Mondbuchstaben' },
    title: { de: 'Lektion 5 live', en: 'Lektion 5 live' },
    when: { de: 'in 24 Stunden', en: 'in 24 hours' },
    sender: { de: 'Samira Haddou', en: 'Samira Haddou' },
    count: { de: '3', en: '3' },
    number: { de: 'R-2026-0142', en: 'R-2026-0142' },
    date: { de: '28.09.2026', en: '28/09/2026' },
    subject: {
        de: 'Donnerstag fällt aus — Nachholtermin am Samstag',
        en: 'Donnerstag fällt aus — Nachholtermin am Samstag',
    },
};
const fill = (template: string, locale: 'de' | 'en') =>
    template.replace(/:([a-z]+)/g, (all, key: string) => PLACEHOLDERS[key]?.[locale] ?? all);

const MAIL_INAPP: Channel3[] = ['mail', 'inapp'];
const ALL_THREE: Channel3[] = ['mail', 'inapp', 'push'];
const MAIL: Channel3[] = ['mail'];

const ACCOUNT = 'Konto und Anmeldung';
const COURSES = 'Kurse';
const LIVE = 'Live';
const TALK = 'Austausch';
const PAYMENTS = 'Zahlungen';
const SPONSORS = 'Sponsoren';
const SCHOOL_OPS = 'An die Schule';

/**
 * The real catalogue: 36 notification classes, the three Mailables that go
 * out by themselves and Laravel's two built-in mails — read off
 * `app/Domain/**` on 2026-10-01. Left out: `DiagnosticTestMail` (only on a
 * click) and `UserInvitation` (never sent any more).
 */
const AUTO_MAILS: AutoMail[] = [
    // --- Konto und Anmeldung -------------------------------------------------
    {
        id: 'invitation',
        source: 'Identity\\Notifications\\UserInvitedNotification',
        name: 'Einladung',
        area: ACCOUNT,
        trigger:
            'Ein Admin lädt jemanden ein — einzeln, gesammelt oder erneut; auch wenn sich die Adresse einer offenen Einladung ändert.',
        to: 'Eingeladene',
        channels: MAIL_INAPP,
        category: 'account_admin',
        subject: {
            de: 'Du wurdest zu :school eingeladen',
            en: 'You have been invited to :school',
        },
        // The real copy: emails.invite.body / expiry_notice.
        line: {
            de: 'eine Administratorin hat dich zu Al-Nur Akademie eingeladen. Klicke auf den Button, um dein Passwort zu setzen und loszulegen. Dieser Einladungslink ist 7 Tage gültig.',
            en: 'an administrator has invited you to join Al-Nur Akademie. Click the button below to set your password and get started. This invitation link is valid for 7 days.',
        },
        cta: { de: 'Passwort setzen', en: 'Set my password' },
    },
    {
        id: 'approved',
        source: 'Identity\\Notifications\\UserApprovedNotification',
        name: 'Konto freigegeben',
        area: ACCOUNT,
        trigger: 'Ein Admin gibt ein Konto frei, das sich jemand selbst angelegt hat.',
        to: 'Neu Registrierte',
        channels: MAIL_INAPP,
        category: null,
        subject: {
            de: 'Dein Konto bei :school ist jetzt aktiv',
            en: 'Your :school account is now active',
        },
        line: {
            de: 'dein Konto ist freigegeben. Bestätige noch kurz deine E-Mail-Adresse, dann kannst du loslegen.',
            en: 'your account has been approved. Confirm your e-mail address and you are ready to go.',
        },
        cta: { de: 'E-Mail-Adresse bestätigen', en: 'Verify e-mail address' },
    },
    {
        id: 'approval-pending',
        source: 'Identity\\Notifications\\SelfRegistrationPendingNotification',
        name: 'Konto wartet auf Freigabe',
        area: ACCOUNT,
        trigger: 'Jemand registriert sich selbst, während neue Konten eine Freigabe brauchen.',
        to: 'Admins',
        channels: MAIL_INAPP,
        category: null,
        subject: {
            de: 'Neues Konto wartet auf Freigabe bei :school',
            en: 'New account awaiting approval at :school',
        },
        line: {
            de: 'Leonie Weber hat sich registriert und wartet auf deine Freigabe.',
            en: 'Leonie Weber has registered and is waiting for your approval.',
        },
        cta: { de: 'Konto prüfen', en: 'Review account' },
    },
    {
        id: 'verify-email',
        source: 'Laravel VerifyEmail',
        name: 'E-Mail-Adresse bestätigen',
        area: ACCOUNT,
        trigger:
            'Nach der Registrierung (sobald das Konto frei ist), wenn sich die Adresse ändert, oder auf Wunsch erneut.',
        to: 'Kontoinhaber:in',
        channels: MAIL,
        category: null,
        subject: { de: 'Bestätige deine E-Mail-Adresse', en: 'Verify your email address' },
        line: {
            de: 'bitte bestätige, dass diese E-Mail-Adresse dir gehört.',
            en: 'please confirm that this e-mail address belongs to you.',
        },
        cta: { de: 'E-Mail-Adresse bestätigen', en: 'Verify Email Address' },
    },
    {
        id: 'reset-password',
        source: 'Laravel ResetPassword',
        name: 'Passwort zurücksetzen',
        area: ACCOUNT,
        trigger:
            'Jemand klickt „Passwort vergessen“ — oder ein Admin schickt den Link aus der Nutzerverwaltung.',
        to: 'Kontoinhaber:in',
        channels: MAIL,
        category: null,
        subject: { de: 'Setze dein Passwort zurück', en: 'Reset your password' },
        line: {
            de: 'mit dem Button setzt du ein neues Passwort. Wenn du das nicht angefordert hast, ignoriere diese E-Mail.',
            en: 'use the button to choose a new password. If you did not ask for this, ignore this e-mail.',
        },
        cta: { de: 'Passwort zurücksetzen', en: 'Reset Password' },
    },
    {
        id: 'reset-unavailable',
        source: 'Identity\\Notifications\\PasswordResetUnavailableNotification',
        name: 'Kein Passwort (Google-Konto)',
        area: ACCOUNT,
        trigger: '„Passwort vergessen“ bei einem Konto, das sich nur mit Google anmeldet.',
        to: 'Kontoinhaber:in',
        channels: MAIL,
        category: 'account_security',
        subject: { de: 'Anmeldung bei :school', en: 'Signing in to :school' },
        line: {
            de: 'dein Konto hat kein Passwort — du meldest dich mit Google an.',
            en: 'your account has no password — you sign in with Google.',
        },
    },
    {
        id: 'email-changed',
        source: 'Identity\\Notifications\\EmailChangedByAdminNotification',
        name: 'E-Mail-Adresse geändert',
        area: ACCOUNT,
        trigger: 'Ein Admin ändert die E-Mail-Adresse eines Kontos. Geht an die alte Adresse.',
        to: 'Kontoinhaber:in',
        channels: MAIL,
        category: 'account_security',
        subject: {
            de: 'Deine :school E-Mail-Adresse wurde geändert',
            en: 'Your :school email address was changed',
        },
        line: {
            de: 'ein Admin hat die E-Mail-Adresse deines Kontos geändert. Warst du das nicht, melde dich bei der Schule.',
            en: 'an administrator changed the e-mail address of your account. If this was not expected, contact the school.',
        },
    },
    {
        id: 'two-factor-reset',
        source: 'Identity\\Notifications\\TwoFactorResetByAdminNotification',
        name: 'Zwei-Schritt-Anmeldung zurückgesetzt',
        area: ACCOUNT,
        trigger: 'Ein Admin setzt die Anmeldung in zwei Schritten zurück.',
        to: 'Kontoinhaber:in',
        channels: MAIL,
        category: 'account_security',
        subject: {
            de: 'Anmeldung in zwei Schritten bei :school zurückgesetzt',
            en: 'Two-step sign-in was reset on your :school account',
        },
        line: {
            de: 'ein Admin hat die Anmeldung in zwei Schritten zurückgesetzt. Richte sie bei der nächsten Anmeldung neu ein.',
            en: 'an administrator reset two-step sign-in. Set it up again the next time you sign in.',
        },
    },
    {
        id: 'two-factor-off',
        source: 'Identity\\Notifications\\TwoFactorDisabledNotification',
        name: 'Zwei-Schritt-Anmeldung ausgeschaltet',
        area: ACCOUNT,
        trigger: 'Jemand schaltet die eigene Anmeldung in zwei Schritten aus.',
        to: 'Kontoinhaber:in',
        channels: MAIL,
        category: 'account_security',
        subject: {
            de: 'Anmeldung in zwei Schritten bei :school deaktiviert',
            en: 'Two-step sign-in was switched off on your :school account',
        },
        line: {
            de: 'die Anmeldung in zwei Schritten ist jetzt aus.',
            en: 'two-step sign-in is now switched off.',
        },
    },
    {
        id: 'recovery-code',
        source: 'Identity\\Notifications\\TwoFactorRecoveryCodeUsedNotification',
        name: 'Wiederherstellungscode benutzt',
        area: ACCOUNT,
        trigger: 'Bei einer Anmeldung wird ein Wiederherstellungscode benutzt.',
        to: 'Kontoinhaber:in',
        channels: MAIL,
        category: 'account_security',
        subject: {
            de: 'Wiederherstellungscode bei :school verwendet',
            en: 'A recovery code was used on your :school account',
        },
        line: {
            de: 'gerade wurde einer deiner Wiederherstellungscodes benutzt.',
            en: 'one of your recovery codes was just used.',
        },
    },

    // --- Kurse -----------------------------------------------------------------
    {
        id: 'enrolled',
        source: 'Courses\\Notifications\\StudentEnrolledInClassNotification',
        name: 'Eingeschrieben',
        area: COURSES,
        trigger: 'Jemand wird in eine Ausführung eingeschrieben.',
        to: 'Lernende',
        channels: MAIL_INAPP,
        category: 'course_updates',
        subject: {
            de: 'Du wurdest in :class eingeschrieben',
            en: "You've been enrolled in :class",
        },
        line: {
            de: 'du bist jetzt in Arabisch A1 eingeschrieben. Den Stundenplan findest du in der Ausführung.',
            en: 'you are now enrolled in Arabisch A1. The schedule is on the course page.',
        },
        cta: { de: 'Zum Kurs', en: 'Open course' },
    },
    {
        id: 'lesson-released',
        source: 'Courses\\Notifications\\LessonReleasedNotification',
        name: 'Neue Lektion',
        area: COURSES,
        trigger: 'Eine Lektion wird freigeschaltet.',
        to: 'Lernende der Ausführung',
        channels: MAIL_INAPP,
        category: 'course_updates',
        subject: { de: 'Neue Lektion verfügbar: :lesson', en: 'New lesson available: :lesson' },
        line: {
            de: 'in Arabisch A1 ist eine neue Lektion für dich freigeschaltet.',
            en: 'a new lesson has been released for you in Arabisch A1.',
        },
        cta: { de: 'Lektion öffnen', en: 'Open lesson' },
    },
    {
        id: 'waitlist',
        source: 'Courses\\Notifications\\WaitlistSeatOfferedNotification',
        name: 'Platz frei (Warteliste)',
        area: COURSES,
        trigger: 'Ein Platz wird frei und die nächste Person auf der Warteliste ist dran.',
        to: 'Wartende',
        channels: MAIL_INAPP,
        category: 'course_updates',
        subject: {
            de: 'Ein Platz ist frei geworden: :course',
            en: 'A place has opened up: :course',
        },
        line: {
            de: 'in Arabisch A1 ist ein Platz für dich frei geworden.',
            en: 'a place has opened up for you in Arabisch A1.',
        },
        cta: { de: 'Platz annehmen', en: 'Take the place' },
    },
    {
        id: 'rebooked',
        source: 'Courses\\Notifications\\EnrolmentRebookedNotification',
        name: 'Umgebucht',
        area: COURSES,
        trigger: 'Ein Admin bucht jemanden auf eine andere Ausführung um.',
        to: 'Lernende',
        channels: MAIL_INAPP,
        category: 'course_updates',
        subject: {
            de: 'Deine Buchung wurde auf :course umgebucht',
            en: 'Your booking has moved to :course',
        },
        line: {
            de: 'deine Buchung gilt jetzt für Arabisch A1 · Herbst 2026 · Online.',
            en: 'your booking now applies to Arabisch A1 · Herbst 2026 · Online.',
        },
    },
    {
        id: 'completed',
        source: 'Completion\\Notifications\\EnrolmentCompletedNotification',
        name: 'Kurs abgeschlossen',
        area: COURSES,
        trigger: 'Jemand schließt eine Ausführung ab.',
        to: 'Lernende',
        channels: MAIL_INAPP,
        category: 'course_updates',
        subject: { de: 'Du hast :course abgeschlossen', en: 'You completed :course' },
        line: {
            de: 'herzlichen Glückwunsch — du hast Arabisch A1 abgeschlossen.',
            en: 'congratulations — you have completed Arabisch A1.',
        },
    },
    {
        id: 'certificate-issued',
        source: 'Certificates\\Notifications\\CertificateIssuedNotification',
        name: 'Zertifikat ausgestellt',
        area: COURSES,
        trigger: 'Ein Zertifikat oder eine Teilnahmebescheinigung wird ausgestellt.',
        to: 'Lernende',
        channels: MAIL_INAPP,
        category: null,
        subject: {
            de: 'Dein Zertifikat für :course ist fertig',
            en: 'Your certificate for :course is ready',
        },
        line: {
            de: 'dein Zertifikat für Arabisch A1 liegt bereit.',
            en: 'your certificate for Arabisch A1 is ready.',
        },
        cta: { de: 'Zertifikat herunterladen', en: 'Download certificate' },
    },
    {
        id: 'certificate-revoked',
        source: 'Certificates\\Notifications\\CertificateRevokedNotification',
        name: 'Zertifikat widerrufen',
        area: COURSES,
        trigger: 'Ein Admin widerruft ein Zertifikat.',
        to: 'Lernende',
        channels: MAIL_INAPP,
        category: 'course_updates',
        subject: {
            de: 'Dein Zertifikat für :course wurde widerrufen',
            en: 'Your certificate for :course was revoked',
        },
        line: {
            de: 'dein Zertifikat für Arabisch A1 ist nicht mehr gültig.',
            en: 'your certificate for Arabisch A1 is no longer valid.',
        },
    },
    {
        id: 'class-reminder',
        source: 'Courses\\Notifications\\ClassStartingReminderNotification',
        name: 'Erinnerung: Kurs beginnt',
        area: COURSES,
        trigger:
            'Vor dem Beginn einer Ausführung — einmal zur ersten, einmal zur letzten Erinnerung (siehe Regeln).',
        to: 'Lernende',
        channels: ALL_THREE,
        category: 'reminders',
        subject: {
            de: 'Erinnerung: „:title“ beginnt :when',
            en: 'Reminder: “:title” begins :when',
        },
        line: {
            de: 'deine Durchführung „Lektion 5 live“ beginnt gleich. Beginn: Do., 02.10., 18:00.',
            en: 'your delivery “Lektion 5 live” begins soon. Starts: Thu 02/10, 18:00.',
        },
        cta: { de: 'Durchführung öffnen', en: 'Open delivery' },
    },

    // --- Live ------------------------------------------------------------------
    {
        id: 'live-reminder',
        source: 'Live\\Notifications\\LiveSessionStartingReminderNotification',
        name: 'Erinnerung: Live-Sitzung',
        area: LIVE,
        trigger:
            'Vor jeder Live-Sitzung — einmal zur ersten, einmal zur letzten Erinnerung (siehe Regeln).',
        to: 'Lernende',
        channels: ALL_THREE,
        category: 'reminders',
        subject: {
            de: 'Erinnerung: Live-Sitzung „:title“ beginnt :when',
            en: 'Reminder: live session “:title” begins :when',
        },
        line: {
            de: 'die Live-Sitzung „Lektion 5 live“ in Arabisch A1 beginnt gleich. Die Schaltfläche „Beitreten“ erscheint, sobald der Host live geht.',
            en: 'the live session “Lektion 5 live” in Arabisch A1 begins soon. The “Join” button appears as soon as the host goes live.',
        },
        cta: { de: 'Durchführung öffnen', en: 'Open delivery' },
    },
    {
        id: 'live-cancelled',
        source: 'Live\\Notifications\\LiveSessionCancelledNotification',
        name: 'Live-Sitzung abgesagt',
        area: LIVE,
        trigger: 'Eine Live-Sitzung wird abgesagt.',
        to: 'Teilnehmende und Leitung',
        channels: ALL_THREE,
        category: 'class_announcements',
        subject: { de: 'Live-Sitzung abgesagt: :title', en: 'Live session cancelled: :title' },
        line: {
            de: 'die Live-Sitzung „Lektion 5 live“ am Do., 02.10., fällt aus.',
            en: 'the live session “Lektion 5 live” on Thu 02/10 is cancelled.',
        },
    },
    {
        id: 'live-rescheduled',
        source: 'Live\\Notifications\\LiveSessionRescheduledNotification',
        name: 'Live-Sitzung verschoben',
        area: LIVE,
        trigger: 'Die Startzeit einer Live-Sitzung ändert sich.',
        to: 'Teilnehmende und Leitung',
        channels: MAIL_INAPP,
        category: 'class_announcements',
        subject: { de: 'Live-Sitzung verschoben: :title', en: 'Live session rescheduled: :title' },
        line: {
            de: '„Lektion 5 live“ beginnt jetzt am Sa., 04.10., um 10:00.',
            en: '“Lektion 5 live” now starts on Sat 04/10 at 10:00.',
        },
    },
    {
        id: 'adhoc-invite',
        source: 'Live\\Notifications\\AdHocSessionInvitedNotification',
        name: 'Einladung zu einem Treffen',
        area: LIVE,
        trigger: 'Jemand legt ein spontanes Treffen an und lädt Leute dazu ein.',
        to: 'Eingeladene',
        channels: MAIL_INAPP,
        category: 'reminders',
        subject: { de: 'Du bist eingeladen: :title', en: 'You’re invited: :title' },
        line: {
            de: 'Samira Haddou lädt dich zu „Lektion 5 live“ ein.',
            en: 'Samira Haddou invites you to “Lektion 5 live”.',
        },
        cta: { de: 'Beitreten', en: 'Join' },
    },
    {
        id: 'recording-ready',
        source: 'Live\\Notifications\\RecordingAvailableNotification',
        name: 'Aufzeichnung bereit',
        area: LIVE,
        trigger: 'Die Aufzeichnung einer Live-Sitzung ist fertig verarbeitet.',
        to: 'Lernende',
        channels: ALL_THREE,
        category: 'recordings',
        subject: { de: 'Aufzeichnung bereit: :title', en: 'Recording ready: :title' },
        line: {
            de: 'die Aufzeichnung von „Lektion 5 live“ steht jetzt im Kurs.',
            en: 'the recording of “Lektion 5 live” is now in the course.',
        },
        cta: { de: 'Ansehen', en: 'Watch' },
    },

    // --- Austausch ---------------------------------------------------------------
    {
        id: 'announcement',
        source: 'Notifications\\NewAnnouncementNotification',
        name: 'Ankündigung',
        area: TALK,
        trigger: 'Eine Lehrkraft oder ein Admin schickt eine Ankündigung an eine Ausführung.',
        to: 'Lernende und Lehrkräfte',
        channels: MAIL_INAPP,
        category: 'class_announcements',
        subject: { de: '[:class] :subject', en: '[:class] :subject' },
        line: {
            de: 'der Termin am Donnerstag muss leider ausfallen. Wir holen ihn am Samstag um 10:00 Uhr nach.',
            en: 'der Termin am Donnerstag muss leider ausfallen. Wir holen ihn am Samstag um 10:00 Uhr nach.',
        },
    },
    {
        id: 'direct-message',
        source: 'Messages\\Notifications\\NewMessageNotification',
        name: 'Neue Nachricht',
        area: TALK,
        trigger:
            'Jemand schreibt eine private Nachricht. Keine weitere E-Mail, solange schon eine ungelesen ist.',
        to: 'Die andere Person',
        channels: ALL_THREE,
        category: 'direct_messages',
        subject: {
            de: '[:class] Neue Nachricht von :sender',
            en: '[:class] New message from :sender',
        },
        line: {
            de: 'Samira Haddou hat dir in Arabisch A1 geschrieben.',
            en: 'Samira Haddou sent you a message in Arabisch A1.',
        },
        cta: { de: 'Nachricht lesen', en: 'Read message' },
    },
    {
        id: 'channel-message',
        source: 'Channels\\Notifications\\NewChannelMessageNotification',
        name: 'Neue Kanalnachricht',
        area: TALK,
        trigger:
            'Jemand schreibt in einem Kanal. Nur als Push; in der App ein Eintrag pro Kanal statt pro Nachricht.',
        to: 'Mitglieder',
        channels: ['push'],
        category: 'channels',
        subject: null,
        line: { de: '', en: '' },
    },
    {
        id: 'channel-digest',
        source: 'Channels\\Notifications\\ChannelActivityDigest',
        name: 'Ungelesenes in Kanälen',
        area: TALK,
        trigger:
            'Täglich um 07:00, wenn in einem Kanal etwas ungelesen ist — nicht an Mitglieder, die den Kanal nie geöffnet haben.',
        to: 'Mitglieder',
        channels: MAIL,
        category: 'channels',
        subject: {
            de: 'Du hast :count ungelesene Kanalnachricht(en)',
            en: 'You have :count unread channel message(s)',
        },
        line: {
            de: 'in „Fragen zur Grammatik“ warten 3 neue Nachrichten auf dich.',
            en: '3 new messages are waiting for you in “Fragen zur Grammatik”.',
        },
        cta: { de: 'Kanal öffnen', en: 'Open channel' },
    },

    // --- Zahlungen -----------------------------------------------------------------
    {
        id: 'receipt',
        source: 'Payments\\Notifications\\ReceiptIssuedNotification',
        name: 'Beleg',
        area: PAYMENTS,
        trigger: 'Eine bezahlte Bestellung bekommt ihren Beleg.',
        to: 'Käufer:innen',
        channels: MAIL_INAPP,
        category: 'payments',
        subject: { de: 'Ihr Beleg :number', en: 'Your receipt :number' },
        line: {
            de: 'anbei dein Beleg über 240,00 € für Arabisch A1.',
            en: 'attached is your receipt for €240.00 for Arabisch A1.',
        },
        cta: { de: 'Beleg herunterladen', en: 'Download receipt' },
    },
    {
        id: 'invoice',
        source: 'Payments\\Notifications\\InvoiceIssuedForPaymentNotification',
        name: 'Rechnung (Überweisung)',
        area: PAYMENTS,
        trigger: 'Bei Kauf auf Rechnung — mit IBAN und Fälligkeit.',
        to: 'Käufer:innen',
        channels: MAIL_INAPP,
        category: 'payments',
        subject: { de: 'Deine Rechnung :number', en: 'Your invoice :number' },
        line: {
            de: 'bitte überweise 240,00 € bis zum 15.10.2026 auf DE89 3704 0044 0532 0130 00.',
            en: 'please transfer €240.00 by 15/10/2026 to DE89 3704 0044 0532 0130 00.',
        },
    },
    {
        id: 'payment-failed',
        source: 'Payments\\Notifications\\PaymentFailedNotification',
        name: 'Zahlung fehlgeschlagen',
        area: PAYMENTS,
        trigger: 'Eine Zahlung schlägt fehl.',
        to: 'Käufer:innen',
        channels: MAIL_INAPP,
        category: 'payments',
        subject: {
            de: 'Ihre Zahlung konnte nicht abgeschlossen werden',
            en: 'Your payment could not be completed',
        },
        line: {
            de: 'deine Zahlung für Arabisch A1 ist nicht durchgegangen. Versuch es bitte noch einmal.',
            en: 'your payment for Arabisch A1 did not go through. Please try again.',
        },
        cta: { de: 'Erneut bezahlen', en: 'Pay again' },
    },
    {
        id: 'subscription-failed',
        source: 'Payments\\Notifications\\SubscriptionPaymentFailedNotification',
        name: 'Abo-Zahlung fehlgeschlagen',
        area: PAYMENTS,
        trigger: 'Eine Abo-Zahlung schlägt zum ersten Mal fehl.',
        to: 'Käufer:innen',
        channels: MAIL_INAPP,
        category: 'payments',
        subject: {
            de: 'Ihre Abo-Zahlung ist fehlgeschlagen',
            en: 'Your subscription payment failed',
        },
        line: {
            de: 'die monatliche Zahlung für den Hifz-Kreis ist fehlgeschlagen.',
            en: 'the monthly payment for the Hifz-Kreis failed.',
        },
    },
    {
        id: 'first-charge',
        source: 'Payments\\Notifications\\FirstChargeReminderNotification',
        name: 'Erste Abbuchung kommt',
        area: PAYMENTS,
        trigger: 'Täglich um 08:00: drei Tage vor der ersten Abbuchung eines reservierten Platzes.',
        to: 'Käufer:innen',
        channels: MAIL_INAPP,
        category: 'payments',
        subject: {
            de: 'Bevorstehende Zahlung für Ihre reservierte Durchführung',
            en: 'Upcoming payment for your reserved delivery',
        },
        line: {
            de: 'am 04.10.2026 buchen wir 240,00 € für Arabisch A1 ab.',
            en: 'on 04/10/2026 we will charge €240.00 for Arabisch A1.',
        },
    },
    {
        id: 'trial-ending',
        source: 'Payments\\Notifications\\TrialEndingReminderNotification',
        name: 'Testphase endet',
        area: PAYMENTS,
        trigger: 'Täglich um 08:00: kurz bevor eine kostenlose Testphase endet.',
        to: 'Käufer:innen',
        channels: MAIL_INAPP,
        category: 'payments',
        subject: {
            de: 'Ihre kostenlose Testphase endet bald',
            en: 'Your free trial is ending soon',
        },
        line: {
            de: 'deine Testphase im Hifz-Kreis endet in drei Tagen.',
            en: 'your trial in the Hifz-Kreis ends in three days.',
        },
    },
    {
        id: 'commitment-lapsed',
        source: 'Payments\\Notifications\\CommitmentLapsedNotification',
        name: 'Reservierter Platz freigegeben',
        area: PAYMENTS,
        trigger: 'Ein reservierter Platz wird freigegeben, weil die Zahlung ausblieb.',
        to: 'Käufer:innen und Admins',
        channels: MAIL_INAPP,
        category: 'payments',
        subject: {
            de: 'Ihr reservierter Platz wurde freigegeben',
            en: 'Your reserved place was released',
        },
        line: {
            de: 'dein Platz in Arabisch A1 ist wieder frei, weil die Zahlung nicht eingegangen ist.',
            en: 'your place in Arabisch A1 has been released because the payment did not arrive.',
        },
    },
    {
        id: 'seat-assigned',
        source: 'Payments\\Notifications\\SeatAssignedNotification',
        name: 'Platz zugewiesen',
        area: PAYMENTS,
        trigger: 'Wer mehrere Plätze gekauft hat, trägt jemanden für einen davon ein.',
        to: 'Teilnehmende',
        channels: MAIL_INAPP,
        category: 'payments',
        subject: { de: 'Du hast einen Platz in :course', en: 'You have a place on :course' },
        line: {
            de: 'Grace Okafor hat dir einen Platz in Arabisch A1 geschenkt.',
            en: 'Grace Okafor has given you a place on Arabisch A1.',
        },
        cta: { de: 'Konto einrichten', en: 'Set up account' },
    },
    {
        id: 'withdrawal',
        source: 'Payments\\Notifications\\WithdrawalReceiptNotification',
        name: 'Widerruf und Erstattung',
        area: PAYMENTS,
        trigger: 'Jemand widerruft einen Kauf und bekommt das Geld zurück.',
        to: 'Käufer:innen',
        channels: MAIL_INAPP,
        category: 'payments',
        subject: { de: 'Ihr Widerruf und Ihre Erstattung', en: 'Your withdrawal and refund' },
        line: {
            de: 'wir haben deinen Widerruf erhalten und erstatten 240,00 €.',
            en: 'we have received your withdrawal and are refunding €240.00.',
        },
    },

    // --- Sponsoren -------------------------------------------------------------------
    {
        id: 'sponsorship',
        source: 'Sponsors\\Notifications\\SponsorshipVisibilityNotification',
        name: 'Sponsor sieht Fortschritt',
        area: SPONSORS,
        trigger:
            'Ein Admin gibt eine Einschreibung für einen Sponsor frei — oder nimmt die Freigabe zurück.',
        to: 'Lernende',
        channels: MAIL_INAPP,
        category: 'account_admin',
        subject: {
            de: 'Ein Sponsor kann jetzt deinen Fortschritt in :course sehen',
            en: 'A sponsor can now see your progress in :course',
        },
        line: {
            de: 'Jobcenter Berlin Mitte kann jetzt deinen Fortschritt in Arabisch A1 sehen.',
            en: 'Jobcenter Berlin Mitte can now see your progress in Arabisch A1.',
        },
    },

    // --- An die Schule ---------------------------------------------------------------
    {
        id: 'health-alert',
        source: 'Diagnostics\\Notifications\\HealthAlertNotification',
        name: 'Statuswarnung',
        area: SCHOOL_OPS,
        trigger: 'Eine Prüfung wird rot, bleibt rot (alle 24 Stunden erneut) oder ist wieder grün.',
        to: 'Admins',
        channels: MAIL_INAPP,
        category: 'system_health',
        subject: {
            de: 'Statuswarnung: :count Check(s) fehlerhaft',
            en: 'Health alert: :count check(s) failing',
        },
        line: {
            de: 'PayPal-Zugangsdaten, Speicher und Warteschlange sind rot.',
            en: 'PayPal credentials, storage and queue are failing.',
        },
        cta: { de: 'Zur Übersicht', en: 'Open overview' },
    },
    {
        id: 'ops-digest',
        source: 'Diagnostics\\Mail\\OpsDigestMail',
        name: 'Wöchentlicher Betriebsbericht',
        area: SCHOOL_OPS,
        trigger: 'Jeden Montag um 07:30 — auch in einer ruhigen Woche.',
        to: 'Empfänger aus den Regeln',
        channels: MAIL,
        category: null,
        address: true,
        subject: {
            de: 'Wöchentlicher Betriebsbericht — :school (:date)',
            en: 'Weekly ops digest — :school (:date)',
        },
        line: {
            de: '12 neue Einschreibungen, 9 Zahlungen über 2.160,00 €, 2 offene Überweisungen, keine roten Prüfungen.',
            en: '12 new enrolments, 9 payments totalling €2,160.00, 2 pending transfers, no failing checks.',
        },
    },
    {
        id: 'contact',
        source: 'Marketing\\Mail\\ContactMessageReceived',
        name: 'Kontaktformular',
        area: SCHOOL_OPS,
        trigger: 'Jemand schickt das Kontaktformular der Website ab.',
        to: 'Kontaktadresse der Schule',
        channels: MAIL,
        category: null,
        address: true,
        subject: { de: 'Neue Kontaktnachricht — :school', en: 'New contact message — :school' },
        line: {
            de: 'Rami Haddad fragt: „Gibt es den Hifz-Kreis auch am Wochenende?“',
            en: 'Rami Haddad asks: “Gibt es den Hifz-Kreis auch am Wochenende?”',
        },
    },
    {
        id: 'access-request',
        source: 'Marketing\\Mail\\RequestAccessReceived',
        name: 'Zugangsanfrage',
        area: SCHOOL_OPS,
        trigger:
            'Jemand fragt über die Website nach einem Zugang — an Schulen, an denen nur Admins Konten anlegen.',
        to: 'Kontaktadresse der Schule',
        channels: MAIL,
        category: null,
        address: true,
        subject: { de: 'Neue Zugangsanfrage — :school', en: 'New access request — :school' },
        line: {
            de: 'Elif Demir möchte an Pflege-Fachsprache teilnehmen.',
            en: 'Elif Demir would like to join Pflege-Fachsprache.',
        },
    },
];

const AREAS = [...new Set(AUTO_MAILS.map((m) => m.area))];

const CHANNEL_LABEL: Record<Channel3, string> = { mail: 'E-Mail', inapp: 'In-App', push: 'Push' };

// ---------------------------------------------------------------------------
// Example data: the rules
// ---------------------------------------------------------------------------

/** `ReminderLeadTime`, earliest first, with the real labels (`settings.reminders.options.*`). */
const LEAD_TIMES = [
    ['72h', '3 Tage vorher', 4320],
    ['48h', '2 Tage vorher', 2880],
    ['24h', '1 Tag vorher', 1440],
    ['12h', '12 Stunden vorher', 720],
    ['2h', '2 Stunden vorher', 120],
    ['1h', '1 Stunde vorher', 60],
    ['30m', '30 Minuten vorher', 30],
] as const;
const minutesOf = (v: string) => LEAD_TIMES.find(([k]) => k === v)?.[2] ?? 0;

type Pref = 'mail' | 'inapp' | 'push';
const PREFS: [Pref, string][] = [
    ['mail', 'E-Mail'],
    ['inapp', 'In-App'],
    ['push', 'Push'],
];

type Rules = {
    early: string;
    late: string;
    /** Category → channel → on, for people who never changed their own. */
    defaults: Record<string, Record<Pref, boolean>>;
};

const RULES: Rules = {
    early: '24h',
    late: '1h',
    defaults: Object.fromEntries(
        (Object.keys(CATEGORIES) as CategoryId[])
            .filter((c) => !CATEGORIES[c].forced)
            .map((c) => [c, { mail: true, inapp: true, push: true }]),
    ),
};

/** `ops_digest_recipients`: plain addresses, not accounts (ADR-0064). */
type DigestRecipient = { id: number; email: string };
const DIGEST_RECIPIENTS: DigestRecipient[] = [
    { id: 1, email: ME.email },
    { id: 2, email: 'leitung@alnur-akademie.example' },
    { id: 3, email: 'buchhaltung@alnur-akademie.example' },
];

// ---------------------------------------------------------------------------
// Formatting, labels, small parts
// ---------------------------------------------------------------------------

const timeFmt = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });
const dayTimeFmt = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
});
const dayFmt = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });
const dateFmt = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
/** „heute, 09:40“, „gestern, 18:02“, this week „28.09., 11:05“, otherwise the date. */
function when(iso: string) {
    const d = new Date(iso);
    const days = Math.round(
        (new Date(new Date(NOW).toDateString()).getTime() - new Date(d.toDateString()).getTime()) /
            86400000,
    );
    if (days === 0) return `heute, ${timeFmt.format(d)}`;
    if (days === 1) return `gestern, ${timeFmt.format(d)}`;
    if (days < 7) return `${dayFmt.format(d)}, ${timeFmt.format(d)}`;
    return dateFmt.format(d);
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

const MESSAGE_LABELS = {
    log: 'Nachrichten',
    empty: 'Noch keine Nachrichten.',
    deleted: 'Diese Nachricht wurde gelöscht.',
    replyPreviewDeleted: 'gelöschte Nachricht',
    reply: 'Antworten',
    delete: 'Nachricht löschen',
    attachments: {
        empty: 'Keine Anhänge',
        download: (name: string) => `Herunterladen: ${name}`,
        downloadShort: 'Herunterladen',
        remove: (name: string) => `${name} entfernen`,
    },
};

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

/** One block of a settings page. */
function SettingsSection({
    title,
    text,
    children,
}: {
    title: string;
    text?: ReactNode;
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

/** The panel's audit line: a muted box with the shield. */
function AuditNote({ children }: { children: ReactNode }) {
    return (
        <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm"
        >
            <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
            />
            <span>{children}</span>
        </div>
    );
}

/** The run a conversation, channel or announcement belongs to: course over run. */
function RunCell({ offeringId }: { offeringId: number }) {
    const o = offering(offeringId);
    return (
        <span className="flex min-w-0 flex-col">
            <span className="truncate">{o.course}</span>
            <span className="truncate text-xs text-muted-foreground">{o.run}</span>
        </span>
    );
}

function Person({ name, note }: { name: string; note?: string }) {
    return (
        <span className="flex min-w-0 items-center gap-2">
            <InitialsAvatar name={name} size="sm" colored />
            <span className="flex min-w-0 flex-col">
                <span className="truncate">{name}</span>
                {note && <span className="truncate text-xs text-muted-foreground">{note}</span>}
            </span>
        </span>
    );
}

function ChannelBadges({ c }: { c: Channel }) {
    return (
        <span className="flex flex-wrap gap-1.5">
            {c.anonymous && (
                <Badge tone="neutral">
                    <EyeOff aria-hidden="true" /> Anonym
                </Badge>
            )}
            {c.locked && (
                <Badge tone="warning">
                    <Lock aria-hidden="true" /> Gesperrt
                </Badge>
            )}
            {c.rules.length > 0 && <Badge tone="faint">Beitrittsregeln</Badge>}
        </span>
    );
}

function ChannelList({ channels }: { channels: Channel3[] }) {
    return (
        <span className="flex flex-wrap gap-1.5">
            {(['mail', 'inapp', 'push'] as const)
                .filter((c) => channels.includes(c))
                .map((c) => (
                    <Badge key={c} tone="neutral">
                        {CHANNEL_LABEL[c]}
                    </Badge>
                ))}
        </span>
    );
}

/** Whether a person can switch an e-mail off — follows its category. */
function optOut(m: AutoMail) {
    if (!m.category)
        return {
            can: false,
            label: 'Nein, immer',
            note: m.address ? 'An eine Adresse' : 'Ohne Kategorie',
        };
    const c = CATEGORIES[m.category];
    return c.forced
        ? { can: false, label: 'Nein, immer', note: c.label }
        : { can: true, label: 'Ja', note: c.label };
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
                'inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline',
                className,
            )}
        >
            {label}
            <ArrowRight className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
        </a>
    );
}

const AUDIT_NOTE_THREADS =
    'Nur lesen. Wer eine Unterhaltung öffnet, steht mit Namen und Uhrzeit im Protokoll — der Inhalt nie. Deshalb zeigt die Liste keine Vorschau.';
const AUDIT_NOTE_CHANNELS =
    'Wer einen Kanal einsieht, steht im Protokoll. Du siehst dabei alle mit echtem Namen, auch in anonymen Kanälen.';

// ---------------------------------------------------------------------------
// Shell and menu
// ---------------------------------------------------------------------------

type View =
    | { kind: 'threads' }
    | { kind: 'channels' }
    | { kind: 'announcements' }
    | { kind: 'emails' }
    | { kind: 'rules' }
    | { kind: 'campaigns' };

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
                    <AppRailItem icon={PanelsTopLeft} label="Website" onClick={() => {}} />
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
                    <AppRailItem
                        icon={HandCoins}
                        label="Sponsoren"
                        onClick={linkTo('Pages/Sponsoren', 'Sponsoren')}
                    />
                    <AppRailItem icon={MessagesSquare} label="Kommunikation" active />
                    <AppRailSpacer />
                    <AppRailItem
                        icon={Settings2}
                        label="System"
                        onClick={linkTo('Pages/System', 'Uebersicht')}
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

function CommunicationMenu({
    view,
    onView,
    channels,
}: {
    view: View;
    onView: (v: View) => void;
    channels: Channel[];
}) {
    const item = (v: View, Icon: LucideIcon, label: string, n?: number, extra?: ReactNode) => (
        <SidebarMenuItem key={v.kind}>
            <SidebarMenuButton active={v.kind === view.kind} onClick={() => onView(v)}>
                <Icon aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {extra}
                {n !== undefined && (
                    <span className="text-xs text-muted-foreground tabular-nums">{n}</span>
                )}
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
    return (
        <Sidebar
            label="Kommunikation"
            resize={{
                label: 'Menü verbreitern oder verschmälern',
                storageKey: 'storybook.page.kommunikation',
            }}
        >
            <SidebarHeader>
                <div className="px-2 text-lg font-semibold tracking-tight">Kommunikation</div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup label="Im Kurs">
                    <SidebarMenu>
                        {item(
                            { kind: 'threads' },
                            MessagesSquare,
                            'Unterhaltungen',
                            THREADS.length,
                        )}
                        {item({ kind: 'channels' }, Hash, 'Kanäle', channels.length)}
                        {item(
                            { kind: 'announcements' },
                            Megaphone,
                            'Ankündigungen',
                            ANNOUNCEMENTS.length,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Automatisch">
                    <SidebarMenu>
                        {item({ kind: 'emails' }, Mail, 'E-Mails', AUTO_MAILS.length)}
                        {item({ kind: 'rules' }, SlidersHorizontal, 'Regeln')}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarMenu>
                        {/* MOCK-ONLY: campaigns do not exist; the entry only holds the place. */}
                        {item(
                            { kind: 'campaigns' },
                            Send,
                            'Kampagnen',
                            undefined,
                            <Badge tone="faint">bald</Badge>,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

/** The grid page chrome every list here shares: options, chips, filter editor. */
function ListPage<T>({
    title,
    grid,
    columns,
    search,
    onSearch,
    placeholder,
    extra,
    notice,
    summary,
    table,
    empty,
    rowLabel,
    group,
}: {
    title: string;
    grid: ReturnType<typeof useGrid<T>>;
    columns: GridColumn<T>[];
    search: string;
    onSearch: (v: string) => void;
    placeholder: string;
    extra?: ReactNode;
    notice: ReactNode;
    summary: string;
    table: string;
    empty: string;
    rowLabel: (row: T) => string;
    group?: (header: string, value: string, n: number) => string;
}) {
    return (
        <GridPage
            title={title}
            offsetTop="0px"
            grid={grid}
            search={{ value: search, onChange: onSearch, placeholder }}
            moreActionsLabel="Weitere Aktionen"
            selectionLabels={{ count: (n) => `${n} ausgewählt`, clear: 'Auswahl aufheben' }}
            shortcutLabels={{ Mod: 'Strg', Shift: 'Umschalt', Delete: 'Entf' }}
            options={
                <div className="flex items-center gap-2">
                    {extra}
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
            notice={notice}
            footer={
                <GridFooter
                    summary={summary}
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
                    table,
                    empty,
                    ...(group ? { group } : {}),
                }}
                rowLabel={rowLabel}
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

/** The radio-pill filter the System jobs list uses, with a count per option. */
function FilterSwitch<V extends string>({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: V;
    onChange: (v: V) => void;
    options: readonly (readonly [V, string, number])[];
}) {
    return (
        <div
            role="radiogroup"
            aria-label={label}
            className="flex rounded-lg border border-border p-0.5"
        >
            {options.map(([v, text, n]) => (
                <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={value === v}
                    onClick={() => onChange(v)}
                    className={cn(
                        'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm',
                        value === v
                            ? 'bg-muted font-medium'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {text}
                    <span className="text-xs text-muted-foreground tabular-nums">{n}</span>
                </button>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Unterhaltungen
// ---------------------------------------------------------------------------

type ThreadFilter = 'all' | 'open' | 'closed';

function ThreadsView({
    initialSearch,
    onOpen,
}: {
    initialSearch: string;
    onOpen: (id: number) => void;
}) {
    const [search, setSearch] = useState(initialSearch);
    const [filter, setFilter] = useState<ThreadFilter>('all');
    const q = search.toLowerCase();
    const inFilter = (t: Thread, f: ThreadFilter) =>
        f === 'all' ? true : f === 'closed' ? t.closed : !t.closed;
    const shown = THREADS.filter((t) => inFilter(t, filter)).filter((t) =>
        `${t.student} ${t.staff} ${runLabel(t.offeringId)}`.toLowerCase().includes(q),
    );
    const columns: GridColumn<Thread>[] = useMemo(
        () => [
            {
                id: 'student',
                header: 'Lernende:r',
                pinned: 'left',
                hideable: false,
                width: 210,
                cell: (t) => (
                    <a
                        href={`#/admin/messages/${t.id}`}
                        aria-label={`Unterhaltung von ${t.student} mit ${t.staff} lesen`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(t.id);
                        }}
                        className="flex min-w-0 items-center gap-2 underline-offset-4 hover:underline"
                    >
                        <InitialsAvatar name={t.student} size="sm" colored />
                        <span className="truncate font-medium text-foreground">{t.student}</span>
                    </a>
                ),
                filter: { type: 'text' },
            },
            {
                id: 'staff',
                header: 'Lehrkraft',
                width: 180,
                groupable: true,
                cell: (t) => <Person name={t.staff} />,
                filter: {
                    type: 'choice',
                    options: [...new Set(THREADS.map((t) => t.staff))].map((s) => ({
                        value: s,
                        label: s,
                    })),
                },
            },
            {
                id: 'run',
                header: 'Kurs',
                width: 230,
                groupable: true,
                value: (t) => runLabel(t.offeringId),
                cell: (t) => <RunCell offeringId={t.offeringId} />,
            },
            { id: 'messages', header: 'Nachrichten', width: 135, align: 'right' },
            {
                id: 'lastAt',
                header: 'Letzte Nachricht',
                width: 165,
                cell: (t) => <span className="tabular-nums">{when(t.lastAt)}</span>,
                filter: { type: 'date' },
            },
            {
                id: 'closed',
                header: 'Status',
                width: 130,
                groupable: true,
                value: (t) => (t.closed ? 'Geschlossen' : 'Offen'),
                cell: (t) =>
                    t.closed ? (
                        <Badge tone="faint">Geschlossen</Badge>
                    ) : (
                        <Badge tone="neutral" dot>
                            Offen
                        </Badge>
                    ),
            },
        ],
        [onOpen],
    );
    const actions: GridActionItem[] = [
        {
            id: 'open',
            label: 'Lesen',
            icon: <Eye aria-hidden="true" />,
            when: ['one'],
            isDefault: true,
            shortcut: 'E',
            onSelect: (ids) => onOpen(Number(ids[0])),
        },
    ];
    const grid = useGrid<Thread>({
        id: 'storybook.page.kommunikation.threads',
        rows: shown,
        getRowId: (t) => t.id,
        columns,
        selection: 'single',
        actions,
    });
    return (
        <ListPage
            title="Unterhaltungen"
            grid={grid}
            columns={columns}
            search={search}
            onSearch={setSearch}
            placeholder="Lernende, Lehrkraft oder Kurs …"
            // MOCK-ONLY: the status filter — the oversight list can only text-search; „Geschlossen“ is a soft-deleted thread.
            extra={
                <FilterSwitch
                    label="Nach Status zeigen"
                    value={filter}
                    onChange={setFilter}
                    options={(
                        [
                            ['all', 'Alle'],
                            ['open', 'Offen'],
                            ['closed', 'Geschlossen'],
                        ] as const
                    ).map(
                        ([v, l]) => [v, l, THREADS.filter((t) => inFilter(t, v)).length] as const,
                    )}
                />
            }
            notice={
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                    {AUDIT_NOTE_THREADS}
                </span>
            }
            summary={`${shown.length} Unterhaltungen`}
            table="Unterhaltungen"
            empty={
                search
                    ? 'Keine Unterhaltungen gefunden. Prüfe die Schreibweise oder setze die Suche zurück.'
                    : 'Keine Unterhaltung in diesem Zustand.'
            }
            rowLabel={(t) => `${t.student} und ${t.staff}`}
        />
    );
}

function ThreadSheet({ thread, onClose }: { thread: Thread; onClose: () => void }) {
    const t = thread;
    const first = (n: string) => n.split(' ')[0];
    const messages: MessageListItem[] = transcriptOf(t).map((m) => ({
        id: m.id,
        authorId: m.from,
        authorName: m.from === 'staff' ? t.staff : t.student,
        authorBadge: m.from === 'staff' ? 'Lehrkraft' : null,
        body: m.body,
        sentAt: m.at,
        attachments: m.file
            ? [
                  {
                      id: `${m.id}-f`,
                      name: m.file.name,
                      sizeBytes: m.file.size,
                      mime: m.file.mime,
                      downloadUrl: `#/attachments/${m.id}`,
                  },
              ]
            : undefined,
    }));
    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(56rem,92vw)] max-w-none gap-0 p-0"
                onOpenAutoFocus={focusTitle}
            >
                <div className="flex shrink-0 flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <div className="min-w-0 flex-1">
                            <SheetTitle
                                data-sheet-title
                                tabIndex={-1}
                                className="text-2xl tracking-tight outline-none"
                            >
                                {t.student} und {t.staff}
                            </SheetTitle>
                            <SheetDescription>{runLabel(t.offeringId)}</SheetDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                {t.closed ? (
                                    <Badge tone="faint">Geschlossen</Badge>
                                ) : (
                                    <Badge tone="neutral" dot>
                                        Offen
                                    </Badge>
                                )}
                                <Badge tone="muted">
                                    <Lock aria-hidden="true" /> Nur lesen
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {t.messages} Nachrichten · zuletzt {when(t.lastAt)}
                                </span>
                            </div>
                        </div>
                        {/* MOCK-ONLY: a link to this conversation's entries — the audit log filters by action only. */}
                        <Button variant="outline" onClick={linkTo('Pages/System', 'Protokoll')}>
                            <ScrollText aria-hidden="true" /> Im Protokoll
                        </Button>
                    </div>
                    <AuditNote>
                        <strong className="font-medium">Du liest mit.</strong> Im Protokoll steht
                        jetzt „Konversation eingesehen (Aufsicht)“ — {ME.name}, heute{' '}
                        {timeFmt.format(new Date(NOW))}. Der Inhalt kommt nicht ins Protokoll.{' '}
                        {first(t.student)} und {first(t.staff)} sehen nicht, dass du gelesen hast;
                        ihre Ungelesen-Markierungen bleiben, wie sie sind.
                    </AuditNote>
                </div>
                <div className="flex min-h-0 flex-1 flex-col border-t border-border bg-muted/40">
                    <MessageList
                        messages={messages}
                        labels={{
                            ...MESSAGE_LABELS,
                            log: `Nachrichten zwischen ${t.student} und ${t.staff}`,
                            loadOlder: 'Ältere Nachrichten laden',
                        }}
                        hasOlder={t.messages > messages.length}
                        onLoadOlder={() => {}}
                        formatTime={(iso) => dayTimeFmt.format(new Date(iso))}
                        className="px-8 py-4"
                    />
                </div>
                <p className="flex shrink-0 items-center gap-2 border-t border-border px-8 py-3 text-sm text-muted-foreground">
                    <Lock className="size-4 shrink-0" aria-hidden="true" />
                    {t.closed
                        ? 'Geschlossen — niemand schreibt hier mehr. Admins können nie antworten.'
                        : 'Admins können hier nicht antworten. Wer etwas klären will, schreibt der Lehrkraft direkt.'}
                </p>
            </SheetContent>
        </Sheet>
    );
}

// ---------------------------------------------------------------------------
// Kanäle
// ---------------------------------------------------------------------------

function ChannelsView({
    channels,
    onOpen,
    onLock,
    onEdit,
    onDelete,
    onCreate,
    notice,
}: {
    channels: Channel[];
    onOpen: (id: number) => void;
    onLock: (c: Channel) => void;
    onEdit: (c: Channel) => void;
    onDelete: (c: Channel) => void;
    onCreate: () => void;
    notice: string | null;
}) {
    const [search, setSearch] = useState('');
    const q = search.toLowerCase();
    // MOCK-ONLY: searching channels — the oversight list has no search today.
    const shown = channels.filter((c) =>
        `${c.name} ${runLabel(c.offeringId)} ${offering(c.offeringId).teacher} ${c.members
            .map((m) => m.name)
            .join(' ')}`
            .toLowerCase()
            .includes(q),
    );
    const columns: GridColumn<Channel>[] = useMemo(
        () => [
            {
                id: 'name',
                header: 'Kanal',
                pinned: 'left',
                hideable: false,
                width: 225,
                cell: (c) => (
                    <a
                        href={`#/admin/channels/${c.id}`}
                        aria-label={`Kanal „${c.name}“ einsehen`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(c.id);
                        }}
                        className="flex min-w-0 items-center gap-2 underline-offset-4 hover:underline"
                    >
                        <Hash
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <span className="flex min-w-0 flex-col">
                            <span className="truncate font-medium text-foreground">{c.name}</span>
                            <span className="truncate text-xs text-muted-foreground">
                                {c.description}
                            </span>
                        </span>
                    </a>
                ),
                filter: { type: 'text' },
            },
            {
                id: 'run',
                header: 'Kurs',
                width: 180,
                groupable: true,
                value: (c) => runLabel(c.offeringId),
                cell: (c) => <RunCell offeringId={c.offeringId} />,
            },
            {
                id: 'members',
                header: 'Mitglieder',
                width: 145,
                align: 'right',
                value: (c) => c.members.length,
            },
            { id: 'messages', header: 'Nachrichten', width: 145, align: 'right' },
            {
                id: 'lastAt',
                header: 'Zuletzt',
                width: 125,
                cell: (c) => <span className="tabular-nums">{when(c.lastAt)}</span>,
            },
            {
                id: 'flags',
                header: 'Merkmale',
                width: 140,
                sortable: false,
                value: (c) =>
                    [c.anonymous && 'Anonym', c.locked && 'Gesperrt'].filter(Boolean).join(', '),
                cell: (c) => <ChannelBadges c={c} />,
            },
            {
                id: 'actions',
                header: 'Aktionen',
                hideable: false,
                sortable: false,
                width: 110,
                cell: (c) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <IconButton
                                label={`Aktionen für ${c.name}`}
                                icon={<EllipsisVertical aria-hidden="true" />}
                                className="size-8"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onOpen(c.id)}>
                                <Eye aria-hidden="true" /> Einsehen
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onLock(c)}>
                                {c.locked ? (
                                    <>
                                        <LockOpen aria-hidden="true" /> Entsperren
                                    </>
                                ) : (
                                    <>
                                        <Lock aria-hidden="true" /> Sperren
                                    </>
                                )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onEdit(c)}>
                                <Pencil aria-hidden="true" /> Bearbeiten …
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive-tint-foreground"
                                onSelect={() => onDelete(c)}
                            >
                                <Trash2 aria-hidden="true" /> Löschen …
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [onOpen, onLock, onEdit, onDelete],
    );
    const actions: GridActionItem[] = [
        {
            id: 'new',
            label: 'Neuer Kanal',
            icon: <Plus aria-hidden="true" />,
            tone: 'primary',
            shortcut: 'N',
            onSelect: onCreate,
        },
        {
            id: 'open',
            label: 'Einsehen',
            icon: <Eye aria-hidden="true" />,
            when: ['one'],
            isDefault: true,
            shortcut: 'E',
            onSelect: (ids) => onOpen(Number(ids[0])),
        },
    ];
    const grid = useGrid<Channel>({
        id: 'storybook.page.kommunikation.channels',
        rows: shown,
        getRowId: (c) => c.id,
        columns,
        selection: 'single',
        actions,
    });
    return (
        <ListPage
            title="Kanäle"
            grid={grid}
            columns={columns}
            search={search}
            onSearch={setSearch}
            placeholder="Kanal, Kurs oder Person …"
            notice={
                <span role="status" className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                    {notice ?? AUDIT_NOTE_CHANNELS}
                </span>
            }
            summary={`${shown.length} Kanäle`}
            table="Kanäle"
            empty="Kein Kanal passt dazu."
            rowLabel={(c) => c.name}
        />
    );
}

type ChannelConfirm =
    | null
    | { kind: 'anonOff' }
    | { kind: 'remove'; member: Member }
    | { kind: 'deleteMsg'; id: number };

function ChannelSheet({
    channel,
    onClose,
    onChange,
    onEdit,
    onDelete,
}: {
    channel: Channel;
    onClose: () => void;
    onChange: (c: Channel) => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const id = useId();
    const c = channel;
    const [confirm, setConfirm] = useState<ChannelConfirm>(null);
    const [note, setNote] = useState<string | null>(null);
    const [log, setLog] = useState<ChannelMsg[]>(
        c.log ??
            c.members.slice(0, 3).map((m, i) => ({
                id: i + 1,
                memberId: m.id,
                body: [
                    'Willkommen im Kanal! Fragen gern jederzeit hier.',
                    'Danke, freue mich auf den Kurs.',
                    'Gibt es zum nächsten Termin etwas vorzubereiten?',
                ][i]!,
                at: `2026-09-2${7 + i}T18:0${i}:00`,
            })),
    );
    const memberOf = (mid: number) => c.members.find((m) => m.id === mid)!;
    const messages: MessageListItem[] = log.map((m) => {
        const who = memberOf(m.memberId);
        const replied = m.replyTo ? log.find((x) => x.id === m.replyTo) : undefined;
        return {
            id: m.id,
            authorId: m.memberId,
            authorName: who.name,
            authorBadge: who.teacher ? 'Lehrkraft' : null,
            // De-anonymised for admins: the pseudonym the others see rides along.
            authorNote: c.anonymous && !who.teacher ? `für andere: ${who.pseudonym}` : null,
            body: m.body,
            sentAt: m.at,
            deleted: m.deleted,
            replyTo: replied
                ? {
                      id: replied.id,
                      authorName: memberOf(replied.memberId).name,
                      preview: replied.body.slice(0, 80),
                      deleted: replied.deleted,
                  }
                : null,
        };
    });

    const row = (label: string, hint: ReactNode, control: ReactNode, htmlFor?: string) => (
        <div className="flex items-center justify-between gap-6 py-4">
            <div>
                {htmlFor ? (
                    <Label htmlFor={htmlFor} className="text-sm font-medium">
                        {label}
                    </Label>
                ) : (
                    <div className="text-sm font-medium">{label}</div>
                )}
                <p className="text-sm text-muted-foreground">{hint}</p>
            </div>
            {control}
        </div>
    );

    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(56rem,92vw)] max-w-none gap-0 p-0"
                onOpenAutoFocus={focusTitle}
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <span
                            aria-hidden="true"
                            className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                        >
                            <Hash className="size-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <SheetTitle
                                data-sheet-title
                                tabIndex={-1}
                                className="text-2xl tracking-tight outline-none"
                            >
                                {c.name}
                            </SheetTitle>
                            <SheetDescription>{runLabel(c.offeringId)}</SheetDescription>
                            <div className="mt-2">
                                <ChannelBadges c={c} />
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
                                <DropdownMenuItem onSelect={onEdit}>
                                    <Pencil aria-hidden="true" /> Bearbeiten …
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive-tint-foreground"
                                    onSelect={onDelete}
                                >
                                    <Trash2 aria-hidden="true" /> Kanal löschen …
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <p className="text-sm">{c.description}</p>
                    <AuditNote>
                        Im Protokoll steht jetzt „Kanal eingesehen (Aufsicht)“ — {ME.name}, heute{' '}
                        {timeFmt.format(new Date(NOW))}.{' '}
                        {c.anonymous
                            ? 'Du siehst alle mit echtem Namen; Lernende sehen einander nur unter ihrem Pseudonym. Lehrkräfte stehen immer mit Namen da.'
                            : 'Du siehst alle mit echtem Namen.'}
                    </AuditNote>
                    {note && (
                        <p role="status" className="text-sm text-muted-foreground">
                            {note}
                        </p>
                    )}
                </div>

                <div className="px-8 pb-8">
                    <Part title="Einstellungen">
                        {/* MOCK-ONLY: moderating from the oversight panel — today inspect is read-only and these live on the channel page and its edit form. */}
                        <div className="divide-y divide-border">
                            {row(
                                'Anonymer Kanal',
                                'Lernende sehen einander unter einem Pseudonym. Lehrkräfte werden immer namentlich genannt.',
                                <Switch
                                    id={`${id}-anon`}
                                    checked={c.anonymous}
                                    onCheckedChange={(on) => {
                                        if (on) {
                                            onChange({ ...c, anonymous: true });
                                            setNote('Anonymer Modus ist aktiv.');
                                        } else setConfirm({ kind: 'anonOff' });
                                    }}
                                />,
                                `${id}-anon`,
                            )}
                            {row(
                                'Gesperrt',
                                'Niemand kann mehr schreiben; alle können weiter lesen. Nur das Team kann den Kanal wieder öffnen.',
                                <Switch
                                    id={`${id}-lock`}
                                    checked={c.locked}
                                    onCheckedChange={(on) => {
                                        onChange({ ...c, locked: on });
                                        setNote(
                                            on
                                                ? 'Gesperrt — lesen geht weiter, schreiben nicht.'
                                                : 'Entsperrt — alle Mitglieder können wieder schreiben.',
                                        );
                                    }}
                                />,
                                `${id}-lock`,
                            )}
                            {row(
                                'Wer beitreten darf',
                                c.rules.length === 0 ? (
                                    'Alle eingeschriebenen Lernenden dieser Ausführung.'
                                ) : (
                                    <span className="flex flex-col">
                                        <span>Nur wer alle Regeln erfüllt:</span>
                                        {c.rules.map((r) => (
                                            <span key={r} className="text-foreground">
                                                {r}
                                            </span>
                                        ))}
                                    </span>
                                ),
                                <Button variant="outline" size="sm" onClick={onEdit}>
                                    <Pencil aria-hidden="true" /> Regeln bearbeiten
                                </Button>,
                            )}
                        </div>
                    </Part>

                    <Part
                        title={`Mitglieder (${c.members.length})`}
                        text="Wer entfernt wird, kann nicht erneut beitreten."
                    >
                        <ul className="flex max-h-80 flex-col divide-y divide-border overflow-auto rounded-lg border border-border">
                            {c.members.map((m) => (
                                <li key={m.id} className="flex items-center gap-3 px-3 py-2.5">
                                    <InitialsAvatar name={m.name} size="sm" colored />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-medium">{m.name}</div>
                                        {c.anonymous && !m.teacher && (
                                            <div className="truncate text-xs text-muted-foreground">
                                                für andere: {m.pseudonym}
                                            </div>
                                        )}
                                    </div>
                                    {m.teacher ? (
                                        <Badge tone="neutral">Lehrkraft</Badge>
                                    ) : (
                                        <IconButton
                                            label={`${m.name} aus dem Kanal entfernen`}
                                            icon={<UserMinus aria-hidden="true" />}
                                            onClick={() =>
                                                setConfirm({ kind: 'remove', member: m })
                                            }
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    </Part>

                    <Part
                        title={`Nachrichten (${c.messages})`}
                        text="Gelöschte Nachrichten sehen alle als „Diese Nachricht wurde gelöscht.“ — wer gelöscht hat, steht im Protokoll."
                    >
                        <div className="flex h-[480px] flex-col overflow-hidden rounded-lg border border-border bg-muted/40">
                            <MessageList
                                messages={messages}
                                labels={{ ...MESSAGE_LABELS, log: `Nachrichten in ${c.name}` }}
                                onDelete={(m) =>
                                    setConfirm({ kind: 'deleteMsg', id: Number(m.id) })
                                }
                                canDelete={(m) => !m.deleted}
                                formatTime={(iso) => dayTimeFmt.format(new Date(iso))}
                                className="px-4 py-3"
                            />
                        </div>
                    </Part>
                </div>

                <ConfirmActionDialog
                    open={confirm?.kind === 'anonOff'}
                    onOpenChange={(open) => !open && setConfirm(null)}
                    title="Anonymen Modus ausschalten?"
                    description="Dieser Kanal ist anonym. Wenn du den anonymen Modus ausschaltest, sehen alle Lernenden rückwirkend die echten Namen hinter allen bisherigen Nachrichten."
                    confirmLabel="Ausschalten"
                    cancelLabel="Abbrechen"
                    variant="destructive"
                    onConfirm={() => {
                        onChange({ ...c, anonymous: false });
                        setNote('Anonymer Modus ist aus.');
                        setConfirm(null);
                    }}
                />
                <ConfirmActionDialog
                    open={confirm?.kind === 'remove'}
                    onOpenChange={(open) => !open && setConfirm(null)}
                    title={
                        confirm?.kind === 'remove'
                            ? `${confirm.member.name} entfernen?`
                            : 'Mitglied entfernen?'
                    }
                    description="Die Person verlässt den Kanal sofort und kann nicht erneut beitreten. Ihre bisherigen Nachrichten bleiben stehen."
                    confirmLabel="Entfernen"
                    cancelLabel="Abbrechen"
                    variant="destructive"
                    onConfirm={() => {
                        if (confirm?.kind !== 'remove') return;
                        onChange({
                            ...c,
                            members: c.members.filter((m) => m.id !== confirm.member.id),
                        });
                        setNote(`${confirm.member.name} entfernt.`);
                        setConfirm(null);
                    }}
                />
                <ConfirmActionDialog
                    open={confirm?.kind === 'deleteMsg'}
                    onOpenChange={(open) => !open && setConfirm(null)}
                    title="Nachricht löschen?"
                    description="Alle sehen stattdessen „Diese Nachricht wurde gelöscht.“ Dass du sie gelöscht hast, steht im Protokoll."
                    confirmLabel="Löschen"
                    cancelLabel="Abbrechen"
                    variant="destructive"
                    onConfirm={() => {
                        if (confirm?.kind !== 'deleteMsg') return;
                        setLog((l) =>
                            l.map((m) => (m.id === confirm.id ? { ...m, deleted: true } : m)),
                        );
                        setNote('Nachricht gelöscht.');
                        setConfirm(null);
                    }}
                />
            </SheetContent>
        </Sheet>
    );
}

/** Course run, name, description, anonymity and who may join — to create a channel and to edit one. */
function ChannelDialog({
    open,
    onOpenChange,
    initial,
    onSave,
}: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    initial: Channel | null;
    onSave: (v: {
        offeringId: number;
        name: string;
        description: string;
        anonymous: boolean;
        rules: string[];
    }) => void;
}) {
    const id = useId();
    const [run, setRun] = useState(String(initial?.offeringId ?? ''));
    const [name, setName] = useState(initial?.name ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [anonymous, setAnonymous] = useState(initial?.anonymous ?? false);
    const [who, setWho] = useState(initial?.rules.length ? 'rules' : 'all');
    const [field, setField] = useState('Geschlecht');
    const [op, setOp] = useState('ist gleich');
    const [value, setValue] = useState(initial?.rules.length ? 'weiblich' : '');
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent closeLabel="Schließen" className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{initial ? 'Kanal bearbeiten' : 'Neuer Kanal'}</DialogTitle>
                    <DialogDescription>
                        Ein Gruppenchat für eine Ausführung. Lernende treten selbst bei; die
                        Lehrkraft ist immer dabei.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-run`}>Ausführung</Label>
                        <Select value={run} onValueChange={setRun} disabled={initial !== null}>
                            <SelectTrigger id={`${id}-run`}>
                                <SelectValue placeholder="Ausführung wählen …" />
                            </SelectTrigger>
                            <SelectContent>
                                {OFFERINGS.map((o) => (
                                    <SelectItem key={o.id} value={String(o.id)}>
                                        {runLabel(o.id)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-name`}>Name</Label>
                        <Input
                            id={`${id}-name`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="z. B. Fragen zur Grammatik"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-desc`}>Beschreibung</Label>
                        <Textarea
                            id={`${id}-desc`}
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="flex items-start justify-between gap-6 rounded-lg border border-border p-3">
                        <div>
                            <Label htmlFor={`${id}-anon`} className="text-sm font-medium">
                                Anonymer Kanal
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Lernende sehen einander unter einem Pseudonym. Lehrkräfte werden
                                immer namentlich genannt.
                            </p>
                        </div>
                        <Switch
                            id={`${id}-anon`}
                            checked={anonymous}
                            onCheckedChange={setAnonymous}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`${id}-who`}>Wer darf beitreten</Label>
                        <Select value={who} onValueChange={setWho}>
                            <SelectTrigger id={`${id}-who`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Alle eingeschriebenen Lernenden</SelectItem>
                                <SelectItem value="rules">Nur wer eine Regel erfüllt</SelectItem>
                            </SelectContent>
                        </Select>
                        {who === 'rules' && (
                            <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3">
                                <Select value={field} onValueChange={setField}>
                                    <SelectTrigger aria-label="Feld">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Geschlecht', 'Geburtsdatum', 'Rolle in der Familie'].map(
                                            (f) => (
                                                <SelectItem key={f} value={f}>
                                                    {f}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                <Select value={op} onValueChange={setOp}>
                                    <SelectTrigger aria-label="Vergleich">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[
                                            'ist gleich',
                                            'ist mindestens',
                                            'Alter ist unter',
                                            'Alter ist mindestens',
                                        ].map((x) => (
                                            <SelectItem key={x} value={x}>
                                                {x}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    aria-label="Wert"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder="Wert wählen…"
                                />
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Abbrechen
                    </Button>
                    <Button
                        disabled={
                            run === '' ||
                            name.trim() === '' ||
                            (who === 'rules' && value.trim() === '')
                        }
                        onClick={() => {
                            onSave({
                                offeringId: Number(run),
                                name: name.trim(),
                                description: description.trim(),
                                anonymous,
                                rules: who === 'rules' ? [`${field} ${op} ${value.trim()}`] : [],
                            });
                            onOpenChange(false);
                        }}
                    >
                        {initial ? 'Kanal speichern' : 'Kanal erstellen'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Ankündigungen
// ---------------------------------------------------------------------------

function ReadCell({ a }: { a: Announcement }) {
    const pct = Math.round((a.read / a.recipients) * 100);
    return (
        <div className="flex min-w-0 items-center gap-2">
            <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
                aria-label={`Gelesen: ${a.subject}`}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            >
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-9 text-end text-xs tabular-nums">{pct} %</span>
        </div>
    );
}

function AnnouncementsView({ onOpen }: { onOpen: (id: number) => void }) {
    const [search, setSearch] = useState('');
    const q = search.toLowerCase();
    const shown = ANNOUNCEMENTS.filter((a) =>
        `${a.subject} ${a.author} ${runLabel(a.offeringId)}`.toLowerCase().includes(q),
    );
    const columns: GridColumn<Announcement>[] = useMemo(
        () => [
            {
                id: 'subject',
                header: 'Ankündigung',
                pinned: 'left',
                hideable: false,
                width: 280,
                cell: (a) => (
                    <a
                        href={`#/admin/announcements/${a.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(a.id);
                        }}
                        className="flex min-w-0 items-center gap-2 underline-offset-4 hover:underline"
                    >
                        <Megaphone
                            className="size-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <span className="truncate font-medium text-foreground">{a.subject}</span>
                    </a>
                ),
                filter: { type: 'text' },
            },
            {
                id: 'run',
                header: 'Kurs',
                width: 220,
                groupable: true,
                value: (a) => runLabel(a.offeringId),
                cell: (a) => <RunCell offeringId={a.offeringId} />,
            },
            {
                id: 'author',
                header: 'Von',
                width: 180,
                groupable: true,
                cell: (a) => <Person name={a.author} />,
                filter: {
                    type: 'choice',
                    options: [...new Set(ANNOUNCEMENTS.map((a) => a.author))].map((s) => ({
                        value: s,
                        label: s,
                    })),
                },
            },
            {
                id: 'sentAt',
                header: 'Gesendet',
                width: 140,
                cell: (a) => <span className="tabular-nums">{when(a.sentAt)}</span>,
                filter: { type: 'date' },
            },
            { id: 'recipients', header: 'Empfänger', width: 130, align: 'right' },
            {
                id: 'read',
                header: 'Gelesen',
                width: 140,
                value: (a) => a.read / a.recipients,
                cell: (a) => <ReadCell a={a} />,
                exportValue: (a) => `${a.read} von ${a.recipients}`,
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
    const grid = useGrid<Announcement>({
        id: 'storybook.page.kommunikation.announcements',
        rows: shown,
        getRowId: (a) => a.id,
        columns,
        selection: 'single',
        actions,
    });
    return (
        // MOCK-ONLY: a school-wide list of announcements — today each one is only visible inside its course run.
        <ListPage
            title="Ankündigungen"
            grid={grid}
            columns={columns}
            search={search}
            onSearch={setSearch}
            placeholder="Betreff, Lehrkraft oder Kurs …"
            notice={
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Info className="size-3.5 shrink-0" aria-hidden="true" />
                    Geht per E-Mail und in der App an alle in der Ausführung — abschalten kann man
                    das nicht. Schreiben dürfen Admins und, wenn der Kurs es erlaubt, Lehrkräfte.
                </span>
            }
            summary={`${shown.length} Ankündigungen`}
            table="Ankündigungen"
            empty="Keine Ankündigung passt dazu."
            rowLabel={(a) => a.subject}
        />
    );
}

function AnnouncementSheet({
    announcement,
    onClose,
}: {
    announcement: Announcement;
    onClose: () => void;
}) {
    const a = announcement;
    const rows = recipientsOf(a);
    const recipientColumns: GridColumn<(typeof rows)[number]>[] = [
        {
            id: 'name',
            header: 'Person',
            hideable: false,
            width: 380,
            cell: (r) => <Person name={r.name} note={r.role} />,
        },
        {
            id: 'readAt',
            header: 'Gelesen',
            width: 170,
            value: (r) => (r.readAt ? 1 : 0),
            cell: (r) =>
                r.readAt ? (
                    <Badge tone="success" dot>
                        Gelesen
                    </Badge>
                ) : (
                    <Badge tone="faint">Ungelesen</Badge>
                ),
        },
    ];
    const grid = useGrid({
        id: 'storybook.page.kommunikation.announcement.recipients',
        rows,
        getRowId: (r) => r.name,
        columns: recipientColumns,
        selection: 'none',
        defaults: { density: 'compact' },
    });
    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(52rem,92vw)] max-w-none gap-0 overflow-y-auto p-0"
                onOpenAutoFocus={focusTitle}
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <span
                            aria-hidden="true"
                            className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                        >
                            <Megaphone className="size-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <SheetTitle
                                data-sheet-title
                                tabIndex={-1}
                                className="text-2xl tracking-tight outline-none"
                            >
                                {a.subject}
                            </SheetTitle>
                            <SheetDescription>{runLabel(a.offeringId)}</SheetDescription>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <ChannelList channels={['mail', 'inapp']} />
                                <span>
                                    von {a.author} · {when(a.sentAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-8 pb-8">
                    <Part title="Text">
                        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 px-5 py-4 text-sm">
                            {a.body.map((p) => (
                                <p key={p}>{p}</p>
                            ))}
                        </div>
                    </Part>
                    <Part
                        title={`Empfänger (${a.recipients})`}
                        text={`Alle, die beim Senden in der Ausführung eingeschrieben waren, und ${offering(a.offeringId).teacher} als Kopie. Wer später dazukommt, bekommt sie nicht.`}
                        action={
                            <span className="flex shrink-0 flex-col items-end text-sm tabular-nums">
                                <span>{a.read} bisher gelesen</span>
                                <span className="text-xs text-muted-foreground">
                                    {a.recipients} von {a.recipients} E-Mails zugestellt
                                </span>
                            </span>
                        }
                    >
                        <div data-density="compact" className={compactGrid}>
                            <DataGrid
                                grid={grid}
                                labels={{
                                    ...DATA_GRID_LABELS,
                                    table: `Empfänger von „${a.subject}“`,
                                    empty: 'Niemand.',
                                }}
                                rowLabel={(r) => r.name}
                            />
                        </div>
                    </Part>
                    <Part title="Ändern">
                        <p className="text-sm text-muted-foreground">
                            Einmal gesendet, kann eine Ankündigung nicht bearbeitet werden — auch
                            nicht zurückgeholt. Falsches korrigiert eine neue Ankündigung in der
                            Ausführung.
                        </p>
                    </Part>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ---------------------------------------------------------------------------
// E-Mails — the catalogue
// ---------------------------------------------------------------------------

/** The honest marker: reading only, editing is shaped as its own issue. */
function LaterMarker() {
    return (
        <Badge tone="faint">
            <Pencil aria-hidden="true" /> Texte bearbeiten — kommt später
        </Badge>
    );
}

function EmailsView({ onOpen }: { onOpen: (id: string) => void }) {
    const [search, setSearch] = useState('');
    const q = search.toLowerCase();
    const shown = AUTO_MAILS.filter((m) =>
        `${m.name} ${m.trigger} ${m.to} ${m.area} ${m.subject?.de ?? ''}`.toLowerCase().includes(q),
    );
    const columns: GridColumn<AutoMail>[] = useMemo(
        () => [
            {
                id: 'name',
                header: 'E-Mail',
                pinned: 'left',
                hideable: false,
                width: 270,
                cell: (m) => (
                    <a
                        href={`#/admin/communication/emails/${m.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onOpen(m.id);
                        }}
                        className="flex min-w-0 flex-col underline-offset-4 hover:underline"
                    >
                        <span className="truncate font-medium text-foreground">{m.name}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            {m.subject ? fill(m.subject.de, 'de') : 'Nur Push, keine E-Mail'}
                        </span>
                    </a>
                ),
                filter: { type: 'text' },
            },
            {
                id: 'area',
                header: 'Bereich',
                width: 150,
                groupable: true,
                // A sort key in front keeps the areas in catalogue order.
                value: (m) => `${String(AREAS.indexOf(m.area)).padStart(2, '0')}|${m.area}`,
                cell: (m) => m.area,
            },
            {
                id: 'trigger',
                header: 'Wann',
                width: 300,
                cell: (m) => <span className="whitespace-normal">{m.trigger}</span>,
            },
            {
                id: 'to',
                header: 'An wen',
                width: 150,
                groupable: true,
                filter: {
                    type: 'choice',
                    options: [...new Set(AUTO_MAILS.map((m) => m.to))].map((t) => ({
                        value: t,
                        label: t,
                    })),
                },
            },
            {
                id: 'channels',
                header: 'Kanäle',
                width: 170,
                sortable: false,
                value: (m) => m.channels.map((c) => CHANNEL_LABEL[c]).join(', '),
                cell: (m) => <ChannelList channels={m.channels} />,
            },
            {
                id: 'optOut',
                header: 'Abschaltbar',
                width: 160,
                groupable: true,
                value: (m) => optOut(m).label,
                cell: (m) => {
                    const o = optOut(m);
                    return (
                        <span className="flex min-w-0 flex-col">
                            <span>{o.label}</span>
                            <span className="truncate text-xs text-muted-foreground">{o.note}</span>
                        </span>
                    );
                },
                filter: {
                    type: 'choice',
                    options: [
                        { value: 'Ja', label: 'Ja' },
                        { value: 'Nein, immer', label: 'Nein, immer' },
                    ],
                },
            },
        ],
        [onOpen],
    );
    const actions: GridActionItem[] = [
        {
            id: 'open',
            label: 'Ansehen',
            icon: <Eye aria-hidden="true" />,
            when: ['one'],
            isDefault: true,
            shortcut: 'E',
            onSelect: (ids) => onOpen(String(ids[0])),
        },
    ];
    const grid = useGrid<AutoMail>({
        id: 'storybook.page.kommunikation.emails',
        rows: shown,
        getRowId: (m) => m.id,
        columns,
        selection: 'single',
        actions,
        defaults: { groupBy: ['area'], hiddenColumns: ['area'] },
    });
    // Groups start closed; the catalogue opens them all once.
    const opened = useRef(false);
    useEffect(() => {
        if (opened.current) return;
        opened.current = true;
        grid.expandAllGroups();
    });
    return (
        // MOCK-ONLY: the whole catalogue — the app has no list of its notifications; this one is read off the classes.
        <ListPage
            title="E-Mails"
            grid={grid}
            columns={columns}
            search={search}
            onSearch={setSearch}
            placeholder="E-Mail, Anlass oder Betreff …"
            extra={<LaterMarker />}
            notice={
                <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Info className="size-3.5 shrink-0" aria-hidden="true" />
                    Alles, was die App von selbst verschickt. Ob man etwas abschalten kann,
                    entscheidet seine Kategorie in den Benachrichtigungs-Einstellungen.
                </span>
            }
            summary={`${shown.length} automatische Nachrichten`}
            table="Automatische E-Mails"
            empty="Keine E-Mail passt dazu."
            rowLabel={(m) => m.name}
            group={(_header, value, n) => `${value.split('|')[1] ?? value} (${n})`}
        />
    );
}

/** The e-mail as it lands: sender, subject, the school's frame around the text. */
function EmailPreview({ mail, locale }: { mail: AutoMail; locale: 'de' | 'en' }) {
    const de = locale === 'de';
    if (!mail.subject)
        return (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span>
                    {de
                        ? 'Keine E-Mail: nur eine Push-Mitteilung aufs Handy oder in den Browser — „Samira Haddou in #Fragen zur Grammatik: Gibt es die Folien auch als PDF?“. Wer sie nicht will, bekommt einmal am Tag „Ungelesenes in Kanälen“.'
                        : 'No e-mail: a push notification only, to the phone or the browser — “Samira Haddou in #Fragen zur Grammatik: Gibt es die Folien auch als PDF?”. Whoever does not want it gets “unread in channels” once a day.'}
                </span>
            </div>
        );
    return (
        <div className="overflow-hidden rounded-lg border border-border">
            <dl className="flex flex-col gap-1 border-b border-border bg-muted/40 px-5 py-3 text-sm">
                <div className="flex gap-4">
                    <dt className="w-20 shrink-0 text-muted-foreground">{de ? 'Von' : 'From'}</dt>
                    <dd>
                        {SCHOOL} &lt;{SENDER}&gt;
                    </dd>
                </div>
                <div className="flex gap-4">
                    <dt className="w-20 shrink-0 text-muted-foreground">
                        {de ? 'Betreff' : 'Subject'}
                    </dt>
                    <dd className="font-medium">{fill(mail.subject[locale], locale)}</dd>
                </div>
            </dl>
            <div className="flex flex-col gap-3 bg-background px-8 py-6 text-sm">
                <div className="text-base font-semibold">{SCHOOL}</div>
                <p>
                    {mail.address ? '' : de ? 'Hallo Yusuf, ' : 'Hi Yusuf, '}
                    {mail.line[locale]}
                </p>
                {mail.cta && (
                    <span className="w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                        {mail.cta[locale]}
                    </span>
                )}
                <p className="border-t border-border pt-2 text-xs text-muted-foreground">
                    © 2026 {SCHOOL}. {de ? 'Alle Rechte vorbehalten.' : 'All rights reserved.'}
                </p>
            </div>
        </div>
    );
}

function EmailSheet({ mail, onClose }: { mail: AutoMail; onClose: () => void }) {
    const [locale, setLocale] = useState<'de' | 'en'>('de');
    const o = optOut(mail);
    return (
        <Sheet open onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                side="right"
                closeLabel="Schließen"
                className="w-[min(52rem,92vw)] max-w-none gap-0 overflow-y-auto p-0"
                onOpenAutoFocus={focusTitle}
            >
                <div className="flex flex-col gap-4 px-8 pt-8 pb-6">
                    <div className="flex items-start gap-4 pe-8">
                        <span
                            aria-hidden="true"
                            className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                        >
                            <Mail className="size-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <SheetTitle
                                data-sheet-title
                                tabIndex={-1}
                                className="text-2xl tracking-tight outline-none"
                            >
                                {mail.name}
                            </SheetTitle>
                            <SheetDescription>{mail.area} · geht automatisch raus</SheetDescription>
                            <div className="mt-2">
                                <ChannelList channels={mail.channels} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-8 pb-8">
                    <Part title="Wann und an wen">
                        <dl className="flex flex-col gap-2 text-sm">
                            {(
                                [
                                    ['Anlass', mail.trigger],
                                    ['An', mail.to],
                                    [
                                        'Kanäle',
                                        mail.channels.map((c) => CHANNEL_LABEL[c]).join(', '),
                                    ],
                                    [
                                        'Abschaltbar',
                                        mail.category === null
                                            ? mail.address
                                                ? 'Nein — geht an eine Adresse, nicht an ein Konto mit Einstellungen.'
                                                : 'Nein — sie hat keine Kategorie in den Benachrichtigungs-Einstellungen und geht immer raus.'
                                            : o.can
                                              ? `Ja — in den Benachrichtigungs-Einstellungen, Kategorie „${o.note}“.`
                                              : `Nein — Kategorie „${o.note}“ geht immer raus.`,
                                    ],
                                    ['Absender', `${SCHOOL} <${SENDER}>`],
                                ] as const
                            ).map(([k, v]) => (
                                <div key={k} className="flex gap-6">
                                    <dt className="w-32 shrink-0 text-muted-foreground">{k}</dt>
                                    <dd>{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </Part>
                    <Part
                        title="Vorschau"
                        text="In der Sprache, die die Person eingestellt hat; sonst in der Standardsprache der Schule."
                    >
                        {/* MOCK-ONLY: rendering a notification for preview — no endpoint does that today; only the subjects (and the invitation's text) are the real copy. */}
                        <Tabs value={locale} onValueChange={(v) => setLocale(v as 'de' | 'en')}>
                            <TabsList aria-label="Sprache der Vorschau">
                                <TabsTrigger value="de">Deutsch</TabsTrigger>
                                <TabsTrigger value="en">English</TabsTrigger>
                            </TabsList>
                            <TabsContent value="de" className="pt-2">
                                <EmailPreview mail={mail} locale="de" />
                            </TabsContent>
                            <TabsContent value="en" className="pt-2">
                                <EmailPreview mail={mail} locale="en" />
                            </TabsContent>
                        </Tabs>
                    </Part>
                    <Part title="Texte bearbeiten" action={<LaterMarker />}>
                        <p className="text-sm text-muted-foreground">
                            Die Texte kommen heute fest aus der App, in beiden Sprachen. Eigene
                            Texte für deine Schule kommen später — als eigenes Vorhaben, damit keine
                            Pflichtangabe (Rechnung, Widerruf, Sicherheit) verloren geht.
                        </p>
                    </Part>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ---------------------------------------------------------------------------
// Regeln
// ---------------------------------------------------------------------------

function RulesView() {
    const id = useId();
    const [saved, setSaved] = useState(RULES);
    const [draft, setDraft] = useState(RULES);
    const [note, setNote] = useState<string | null>(null);
    const [recipients, setRecipients] = useState(DIGEST_RECIPIENTS);
    const [newRecipient, setNewRecipient] = useState('');
    const [digestNote, setDigestNote] = useState<string | null>(null);
    const [tested, setTested] = useState<string | null>(null);
    const [removing, setRemoving] = useState<DigestRecipient | null>(null);

    const orderBroken = minutesOf(draft.early) <= minutesOf(draft.late);
    const defaultsChanged = Object.keys(draft.defaults).some((k) =>
        PREFS.some(([p]) => draft.defaults[k]![p] !== saved.defaults[k]![p]),
    );
    const changed = [
        draft.early !== saved.early && 'Erste Erinnerung',
        draft.late !== saved.late && 'Letzte Erinnerung',
        defaultsChanged && 'Standard-Benachrichtigungen',
    ].filter(Boolean) as string[];
    const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newRecipient.trim());

    const setDefault = (cat: string, ch: Pref, on: boolean) =>
        setDraft((d) => ({
            ...d,
            defaults: { ...d.defaults, [cat]: { ...d.defaults[cat]!, [ch]: on } },
        }));

    return (
        // The unsaved bar is sticky inside the page's own scroll area, so it
        // spans the page only — never the rail or the menu beside it.
        <div className="flex min-h-svh flex-col">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-8 py-8">
                <header>
                    <h1 className="text-2xl font-semibold tracking-tight">Regeln</h1>
                    <p className="text-sm text-muted-foreground">
                        Wann die App von selbst schreibt, was neue Nutzer bekommen, und wer den
                        Betriebsbericht liest.
                    </p>
                </header>

                <SettingsSection
                    title="Erinnerungen vor Live-Sitzungen"
                    text="Vor jeder Live-Sitzung und jedem Termin einer Ausführung gehen zwei Erinnerungen an alle Eingeschriebenen raus — die erste muss vor der letzten kommen."
                >
                    <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                        {(
                            [
                                [
                                    'early',
                                    'Erste Erinnerung',
                                    'Damit man sich den Termin freihält.',
                                ],
                                [
                                    'late',
                                    'Letzte Erinnerung',
                                    'Kurz vorher, mit dem Link zum Beitreten.',
                                ],
                            ] as const
                        ).map(([key, label, hint]) => (
                            <div key={key} className="flex items-center justify-between gap-6 p-4">
                                <div>
                                    <Label htmlFor={`${id}-${key}`} className="text-sm font-medium">
                                        {label}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">{hint}</p>
                                </div>
                                <Select
                                    value={draft[key]}
                                    onValueChange={(v) => setDraft({ ...draft, [key]: v })}
                                >
                                    <SelectTrigger
                                        id={`${id}-${key}`}
                                        className="w-44"
                                        aria-invalid={orderBroken || undefined}
                                        aria-describedby={orderBroken ? `${id}-order` : undefined}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEAD_TIMES.map(([v, l]) => (
                                            <SelectItem key={v} value={v}>
                                                {l}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                    {orderBroken && (
                        <p id={`${id}-order`} className="text-sm text-destructive-tint-foreground">
                            Die erste Erinnerung muss vor der letzten liegen.
                        </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Wer Erinnerungen abgeschaltet hat, bekommt keine. Die Texte findest du unter
                        E-Mails › Erinnerungen.
                    </p>
                </SettingsSection>

                <SettingsSection
                    title="Standard für neue Nutzer"
                    text="Was jemand bekommt, solange er oder sie in den eigenen Benachrichtigungs-Einstellungen nichts geändert hat. Wer etwas geändert hat, behält das."
                >
                    {/* MOCK-ONLY: school-wide defaults — today every category defaults to on, per person, with no school setting. */}
                    <div className="overflow-hidden rounded-lg border border-border">
                        <table className="w-full text-sm">
                            <caption className="sr-only">
                                Standard-Benachrichtigungen je Kategorie
                            </caption>
                            <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
                                <tr>
                                    <th scope="col" className="px-4 py-2 font-medium">
                                        Kategorie
                                    </th>
                                    {PREFS.map(([p, label]) => (
                                        <th
                                            key={p}
                                            scope="col"
                                            className="w-24 px-4 py-2 font-medium"
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {(Object.keys(CATEGORIES) as CategoryId[]).map((cat) => {
                                    const c = CATEGORIES[cat];
                                    const v = draft.defaults[cat];
                                    return (
                                        <tr key={cat}>
                                            <th
                                                scope="row"
                                                className="px-4 py-2.5 text-left font-normal"
                                            >
                                                <span className="flex items-center gap-2">
                                                    {c.label}
                                                    {c.forced && (
                                                        <Badge tone="faint">
                                                            <Lock aria-hidden="true" /> Immer an
                                                        </Badge>
                                                    )}
                                                </span>
                                            </th>
                                            {PREFS.map(([ch, chLabel]) => (
                                                <td key={ch} className="px-4 py-2.5">
                                                    <Switch
                                                        aria-label={`${c.label}: ${chLabel}`}
                                                        checked={c.forced ? true : v![ch]}
                                                        disabled={c.forced}
                                                        onCheckedChange={(on) =>
                                                            setDefault(cat, ch, on)
                                                        }
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        „Immer an“ heißt: Das muss ankommen — Kontosicherheit, Zahlungen,
                        Ankündigungen und Statuswarnungen. Push gibt es nur für Leute mit der App
                        oder mit Browser-Benachrichtigungen.
                    </p>
                </SettingsSection>

                <SettingsSection
                    title="Betriebsbericht"
                    text="Jeden Montag um 07:30 eine E-Mail mit der Woche: neue Einschreibungen, Zahlungen, fehlgeschlagene Aufgaben, Speicherplatz, kommende Live-Sitzungen und rote Prüfungen. Auch in einer ruhigen Woche — dann weißt du, dass alles läuft."
                >
                    <ul
                        aria-label="Empfänger des Betriebsberichts"
                        className="flex flex-col divide-y divide-border rounded-lg border border-border"
                    >
                        {recipients.map((r) => (
                            <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
                                <Mail
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                                <span className="min-w-0 flex-1 truncate text-sm">{r.email}</span>
                                <IconButton
                                    label={`${r.email} entfernen`}
                                    icon={<X aria-hidden="true" />}
                                    onClick={() => setRemoving(r)}
                                />
                            </li>
                        ))}
                        {recipients.length === 0 && (
                            <li className="px-4 py-3 text-sm text-muted-foreground">
                                Niemand eingetragen — dann geht der Bericht an alle Admins.
                            </li>
                        )}
                    </ul>
                    <form
                        className="flex items-end gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!validEmail) return;
                            setRecipients((all) => [
                                ...all,
                                {
                                    id: Math.max(0, ...all.map((r) => r.id)) + 1,
                                    email: newRecipient.trim(),
                                },
                            ]);
                            setDigestNote(`${newRecipient.trim()} bekommt den Bericht ab Montag.`);
                            setNewRecipient('');
                        }}
                    >
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor={`${id}-digest`}>Empfänger hinzufügen</Label>
                            <Input
                                id={`${id}-digest`}
                                type="email"
                                placeholder="name@beispiel.de"
                                value={newRecipient}
                                onChange={(e) => setNewRecipient(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="outline" disabled={!validEmail}>
                            <Plus aria-hidden="true" /> Hinzufügen
                        </Button>
                    </form>
                    <p role="status" className="text-xs text-muted-foreground">
                        {digestNote ??
                            'Änderungen an der Liste gelten sofort und stehen im Protokoll. Ist sie leer, geht der Bericht an alle Admins.'}
                    </p>
                </SettingsSection>

                <SettingsSection
                    title="Versand"
                    text="Über welche Adresse die E-Mails der Schule rausgehen. Die Zugangsdaten stehen bei System."
                >
                    {/* MOCK-ONLY: "last tested" — the test mail (POST admin/health/test-mail) is real, its result is not stored. */}
                    <div className="flex items-center gap-4 rounded-lg border border-border p-4">
                        <span
                            aria-hidden="true"
                            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success-tint-foreground"
                        >
                            <CircleCheck className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">
                                {SCHOOL} &lt;{SENDER}&gt;
                            </div>
                            <div className="truncate text-xs text-muted-foreground" role="status">
                                {tested ??
                                    'Eingerichtet · zuletzt getestet 30.09.2026, 10:04 — angekommen.'}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() =>
                                setTested(
                                    `Test-E-Mail an ${ME.email} gesendet. Bitte Posteingang prüfen.`,
                                )
                            }
                        >
                            <Send aria-hidden="true" /> Test-E-Mail an mich
                        </Button>
                    </div>
                    <StoryLink
                        label="System › Zugangsdaten"
                        href="#/admin/system/credentials"
                        story={['Pages/System', 'Zugangsdaten']}
                        className="w-fit text-sm"
                    />
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
                                disabled={orderBroken}
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
                open={removing !== null}
                onOpenChange={(o) => !o && setRemoving(null)}
                title="Empfänger entfernen?"
                description={`${removing?.email ?? ''} bekommt den Betriebsbericht ab sofort nicht mehr.`}
                confirmLabel="Entfernen"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={() => {
                    setRecipients((all) => all.filter((r) => r.id !== removing?.id));
                    setDigestNote(`${removing?.email} entfernt.`);
                    setRemoving(null);
                }}
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Kampagnen — later
// ---------------------------------------------------------------------------

function CampaignsView() {
    return (
        <div className="flex h-full items-center justify-center px-8 py-12">
            <EmptyState
                icon={BellRing}
                title="Kampagnen — bald"
                description="Später schreibst du hier selbst an viele auf einmal: an alle Lernenden eines Kurses, an Interessierte, an Ehemalige. Noch gibt es das nicht."
                className="max-w-xl"
            />
        </div>
    );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

function CommunicationPage({
    initialView = { kind: 'threads' },
    initialSearch = '',
    openThread = null,
    openChannel = null,
    openAnnouncement = null,
    openMail = null,
}: {
    initialView?: View;
    initialSearch?: string;
    openThread?: number | null;
    openChannel?: number | null;
    openAnnouncement?: number | null;
    openMail?: string | null;
}) {
    const [view, setView] = useState<View>(initialView);
    const [channels, setChannels] = useState(CHANNELS);
    const [thread, setThread] = useState<number | null>(openThread);
    const [channel, setChannel] = useState<number | null>(openChannel);
    const [announcement, setAnnouncement] = useState<number | null>(openAnnouncement);
    const [mail, setMail] = useState<string | null>(openMail);
    const [editing, setEditing] = useState<number | 'new' | null>(null);
    const [remove, setRemove] = useState<Channel | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const change = (c: Channel) => setChannels((all) => all.map((x) => (x.id === c.id ? c : x)));
    const lock = (c: Channel) => {
        change({ ...c, locked: !c.locked });
        setNotice(c.locked ? `„${c.name}“ entsperrt.` : `„${c.name}“ gesperrt.`);
    };
    const go = (v: View) => {
        setThread(null);
        setChannel(null);
        setAnnouncement(null);
        setMail(null);
        setView(v);
    };
    const openThreadObj = THREADS.find((t) => t.id === thread) ?? null;
    const openChannelObj = channels.find((c) => c.id === channel) ?? null;
    const openAnnouncementObj = ANNOUNCEMENTS.find((a) => a.id === announcement) ?? null;
    const openMailObj = AUTO_MAILS.find((m) => m.id === mail) ?? null;
    const edited = typeof editing === 'number' ? channels.find((c) => c.id === editing) : null;

    return (
        <Shell menu={<CommunicationMenu view={view} onView={go} channels={channels} />}>
            {view.kind === 'threads' && (
                <ThreadsView initialSearch={initialSearch} onOpen={setThread} />
            )}
            {view.kind === 'channels' && (
                <ChannelsView
                    channels={channels}
                    onOpen={setChannel}
                    onLock={lock}
                    onEdit={(c) => setEditing(c.id)}
                    onDelete={setRemove}
                    onCreate={() => setEditing('new')}
                    notice={notice}
                />
            )}
            {view.kind === 'announcements' && <AnnouncementsView onOpen={setAnnouncement} />}
            {view.kind === 'emails' && <EmailsView onOpen={setMail} />}
            {view.kind === 'rules' && <RulesView />}
            {view.kind === 'campaigns' && <CampaignsView />}

            {openThreadObj && view.kind === 'threads' && (
                <ThreadSheet
                    key={openThreadObj.id}
                    thread={openThreadObj}
                    onClose={() => setThread(null)}
                />
            )}
            {openChannelObj && view.kind === 'channels' && (
                <ChannelSheet
                    key={openChannelObj.id}
                    channel={openChannelObj}
                    onClose={() => setChannel(null)}
                    onChange={change}
                    onEdit={() => setEditing(openChannelObj.id)}
                    onDelete={() => setRemove(openChannelObj)}
                />
            )}
            {openAnnouncementObj && view.kind === 'announcements' && (
                <AnnouncementSheet
                    key={openAnnouncementObj.id}
                    announcement={openAnnouncementObj}
                    onClose={() => setAnnouncement(null)}
                />
            )}
            {openMailObj && view.kind === 'emails' && (
                <EmailSheet key={openMailObj.id} mail={openMailObj} onClose={() => setMail(null)} />
            )}

            <ChannelDialog
                key={String(editing)}
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
                initial={edited ?? null}
                onSave={(v) => {
                    if (edited) {
                        change({ ...edited, ...v });
                        setNotice(`„${v.name}“ gespeichert.`);
                        return;
                    }
                    const nid = Math.max(...channels.map((c) => c.id)) + 1;
                    setChannels((all) => [
                        {
                            id: nid,
                            ...v,
                            locked: false,
                            members: people([], offering(v.offeringId).teacher),
                            messages: 0,
                            lastAt: NOW,
                        },
                        ...all,
                    ]);
                    setNotice(
                        `„${v.name}“ erstellt — Lernende sehen ihn jetzt und können beitreten.`,
                    );
                }}
            />
            <ConfirmActionDialog
                open={remove !== null}
                onOpenChange={(o) => !o && setRemove(null)}
                title="Kanal löschen?"
                description={`Der Kanal „${remove?.name ?? ''}“ wird für alle Mitglieder ausgeblendet. Der Nachrichtenverlauf bleibt gespeichert und wird nicht endgültig gelöscht.`}
                confirmLabel="Kanal löschen"
                cancelLabel="Abbrechen"
                variant="destructive"
                onConfirm={() => {
                    setChannels((all) => all.filter((c) => c.id !== remove?.id));
                    setNotice(`„${remove?.name}“ gelöscht.`);
                    setRemove(null);
                    setChannel(null);
                }}
            />
        </Shell>
    );
}

/**
 * Kommunikation as an area of its own: conversations (read-only oversight),
 * the channels of every course run, the announcements teachers send, every
 * e-mail the app sends by itself, and the rules behind them — with room for
 * campaigns later. Click around — it responds, but saves nothing.
 */
const meta: Meta<typeof CommunicationPage> = {
    title: 'Pages/Kommunikation',
    component: CommunicationPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.kommunikation')) localStorage.removeItem(k);
    },
};
export default meta;

const rowsShown = (el: HTMLElement) =>
    waitFor(() => expect(el.querySelectorAll('tr[data-grid-row-id]').length).toBeGreaterThan(0));

/** Every conversation across the school, newest first; no previews, because reading is audited. */
export const Unterhaltungen: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** One conversation, read-only: the transcript, the audit notice, no way to reply. */
export const UnterhaltungSheet: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage openThread={41} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const panel = await body.findByRole('dialog', { name: 'Yusuf Okafor und Samira Haddou' });
        await waitFor(() =>
            expect(panel.ownerDocument.activeElement).toHaveTextContent(
                'Yusuf Okafor und Samira Haddou',
            ),
        );
        await expect(within(panel).queryByRole('textbox')).toBeNull();
    },
};

/** The group channels of every course run, with lock, edit and delete. */
export const Kanaele: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage initialView={{ kind: 'channels' }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** One anonymous channel: lock, anonymity, join rules, members to remove, messages to delete. */
export const KanalSheet: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage initialView={{ kind: 'channels' }} openChannel={3} />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const panel = await body.findByRole('dialog', { name: 'Fragen zur Grammatik' });
        await waitFor(() =>
            expect(panel.ownerDocument.activeElement).toHaveTextContent('Fragen zur Grammatik'),
        );
    },
};

/** Every announcement teachers sent, school-wide: who, to which run, how many read it. */
export const Ankuendigungen: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage initialView={{ kind: 'announcements' }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** One announcement: its text and who has read it. */
export const AnkuendigungSheet: StoryObj<typeof CommunicationPage> = {
    render: () => (
        <CommunicationPage initialView={{ kind: 'announcements' }} openAnnouncement={58} />
    ),
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const panel = await body.findByRole('dialog', {
            name: 'Donnerstag fällt aus — Nachholtermin am Samstag',
        });
        await rowsShown(panel);
    },
};

/** Every e-mail the app sends by itself, by area — read-only; editing comes later. */
export const EMails: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage initialView={{ kind: 'emails' }} />,
    play: async ({ canvasElement }) => {
        await rowsShown(canvasElement);
    },
};

/** One e-mail: when, to whom, whether it can be switched off, and a German and English preview. */
export const EMailSheet: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage initialView={{ kind: 'emails' }} openMail="invitation" />,
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const panel = await body.findByRole('dialog', { name: 'Einladung' });
        await userEvent.click(within(panel).getByRole('tab', { name: 'English' }));
        await within(panel).findByText('From');
    },
};

/** Reminder lead times, default notifications, the ops report's recipients, the sender. */
export const Regeln: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage initialView={{ kind: 'rules' }} />,
};

/** A changed reminder, not yet saved: the bar says what changed. */
export const RegelnUngespeichert: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage initialView={{ kind: 'rules' }} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('switch', { name: 'Kanäle: E-Mail' }));
        await canvas.findByRole('region', { name: 'Ungespeicherte Änderungen' });
    },
};

/** The place for campaigns, clearly marked as not there yet. */
export const Kampagnen: StoryObj<typeof CommunicationPage> = {
    render: () => <CommunicationPage initialView={{ kind: 'campaigns' }} />,
};
