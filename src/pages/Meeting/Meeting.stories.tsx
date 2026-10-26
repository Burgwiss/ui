import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
    ChartColumn,
    Camera,
    CameraOff,
    CircleAlert,
    DoorOpen,
    EllipsisVertical,
    Hand,
    LifeBuoy,
    Loader,
    Lock,
    LogOut,
    MessageSquare,
    Mic,
    MicOff,
    Pin,
    ScreenShare,
    ScreenShareOff,
    Shield,
    SmilePlus,
    UserRoundX,
    Users,
    Volume2,
    WifiOff,
} from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { useStoryText } from '../../../.storybook/locale';
import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { chatComposerLabelsDe, formatTimeDe, messageListLabelsDe } from '../../lib/chat.fixtures';
import {
    ADMISSION_LABELS,
    cameraFrame,
    DEMO_PEOPLE,
    DEVICE_LABELS,
    LIST_LABELS,
    ME,
    POLL_BALLOT_LABELS,
    POLL_COMPOSER_LABELS,
    POLL_QUESTION,
    POLL_RESULTS_LABELS,
    REACTIONS,
    RECORDING_LABELS,
    ROLE_LABELS,
    slideFrame,
    STAGE_LABELS,
    SUPPORT_LABELS,
    TILE_LABELS,
    type DemoPerson,
} from '../../lib/meeting.fixtures';
import { AdmissionRequests, type AdmissionRequest } from '../../molecules/AdmissionRequests';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '../../molecules/Alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../molecules/AlertDialog';
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';
import { MeetingControl } from '../../molecules/MeetingControl';
import { Popover, PopoverContent, PopoverTrigger } from '../../molecules/Popover';
import { ReactionPicker } from '../../molecules/ReactionPicker';
import { RecordingIndicator, type RecordingState } from '../../molecules/RecordingIndicator';
import { nativeSelectClass } from '../../molecules/Select';
import { SegmentedChoice, SegmentedChoiceItem } from '../../molecules/SegmentedChoice';
import { SupportReference } from '../../molecules/SupportReference';
import { ChatComposer } from '../../organisms/ChatComposer';
import { DevicePreview } from '../../organisms/DevicePreview';
import { MeetingHeader } from '../../organisms/MeetingHeader';
import { MeetingToolbar } from '../../organisms/MeetingToolbar';
import { MessageList, type MessageListItem } from '../../organisms/MessageList';
import { ParticipantList } from '../../organisms/ParticipantList';
import { ParticipantTile } from '../../organisms/ParticipantTile';
import { PollBallot, PollComposer, PollResults } from '../../organisms/Poll';
import { VideoStage } from '../../organisms/VideoStage';
import { MeetingLobby } from '../../templates/MeetingLobby';
import { MeetingRoom, MeetingRoomPanel } from '../../templates/MeetingRoom';

/**
 * PAGE PROTOTYPE — a live lesson in Burgmeet, from the lobby to the end. Every feature of
 * today's meeting room is here (devices, screen share, hand, reactions, chat, people and
 * moderation, polls, guests knocking, recording notices, connection trouble, leave or end
 * for everyone), laid out like the call apps people already know: own controls in the
 * centre of the bottom bar, panels on the right, the stage gets the rest.
 *
 * Non-functional: drawn camera pictures, no media, no server. Click around — the
 * microphone, camera, hand, reactions, panels, chat and poll respond.
 */

const ROOM_CODE = 'ABC-DEF-GHI';
const TITLE = { de: 'Arabisch für Anfänger · Lektion 3', en: 'Arabic for beginners · Lesson 3' };

// ---------------------------------------------------------------------------
// Small page parts
// ---------------------------------------------------------------------------

function Logo() {
    return (
        <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                B
            </span>
            <span className="text-base font-semibold">Burgmeet</span>
        </div>
    );
}

function FooterLinks() {
    return (
        <nav aria-label="Rechtliches" className="flex flex-wrap justify-center gap-x-5 gap-y-1">
            <a className="underline-offset-4 hover:underline" href="#hilfe">
                Hilfe
            </a>
            <a className="underline-offset-4 hover:underline" href="#datenschutz">
                Datenschutz
            </a>
            <a className="underline-offset-4 hover:underline" href="#impressum">
                Impressum
            </a>
        </nav>
    );
}

function Field({
    label,
    children,
    hint,
}: {
    label: string;
    children: (id: string) => ReactNode;
    hint?: string;
}) {
    const id = useId();
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            {children(id)}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
    );
}

function CheckRow({ children, className }: { children: ReactNode; className?: string }) {
    const id = useId();
    return (
        <div className={className ?? 'flex items-start gap-2 text-sm'}>
            <Checkbox id={id} className="mt-0.5" />
            <Label htmlFor={id} className="block font-normal">
                {children}
            </Label>
        </div>
    );
}

function DeviceSelect({ label, options }: { label: string; options: string[] }) {
    return (
        <Field label={label}>
            {(id) => (
                <select id={id} className={nativeSelectClass}>
                    {options.map((o) => (
                        <option key={o}>{o}</option>
                    ))}
                </select>
            )}
        </Field>
    );
}

const CAMERAS = ['FaceTime HD-Kamera', 'Logitech C920'];
const MICS = ['MacBook Air-Mikrofon', 'AirPods Pro'];
const OUTPUTS = ['Systemausgabe', 'MacBook Air-Lautsprecher', 'AirPods Pro'];
const BACKGROUNDS = ['Ohne Effekt', 'Weichzeichnen', 'Bürobild'];

function MicOptions() {
    return (
        <div className="space-y-3">
            <DeviceSelect label="Mikrofon auswählen" options={MICS} />
            <DeviceSelect label="Ausgabegerät wählen" options={OUTPUTS} />
        </div>
    );
}

function CameraOptions() {
    return (
        <div className="space-y-3">
            <DeviceSelect label="Kamera auswählen" options={CAMERAS} />
            <DeviceSelect label="Hintergrund" options={BACKGROUNDS} />
        </div>
    );
}

function useClock() {
    return '18:40';
}

// ---------------------------------------------------------------------------
// The lobby
// ---------------------------------------------------------------------------

type LobbyState = 'joinable' | 'guest' | 'waiting' | 'ended' | 'denied' | 'cameraBlocked' | 'host';

function LobbyDemo({ state }: { state: LobbyState }) {
    const t = useStoryText();
    const [cam, setCam] = useState(state !== 'cameraBlocked' && state !== 'guest');
    const [mic, setMic] = useState(state === 'joinable' || state === 'host');
    const [level, setLevel] = useState(0.3);
    useEffect(() => {
        if (!mic) return;
        const id = setInterval(
            () => setLevel((l) => Math.max(0.04, Math.min(1, l * 0.6 + Math.random() * 0.55))),
            140,
        );
        return () => clearInterval(id);
    }, [mic]);

    const meta = (
        <>
            <Badge tone="neutral">{t(TITLE)}</Badge>
            <Badge tone="muted">{ROOM_CODE}</Badge>
            <RecordingIndicator state="scheduled" labels={t(RECORDING_LABELS)} />
        </>
    );

    const preview = (
        <DevicePreview
            name={ME.name}
            video={cam ? <img alt="" src={cameraFrame(ME.hue, ME.variant)} /> : undefined}
            cameraOn={cam}
            microphoneOn={mic}
            onToggleCamera={() => setCam(!cam)}
            onToggleMicrophone={() => setMic(!mic)}
            cameraBlocked={
                state === 'cameraBlocked'
                    ? 'Der Kamerazugriff ist blockiert. Erlaube ihn über das Schloss in der Adressleiste.'
                    : undefined
            }
            cameraOptions={{ label: 'Kameraoptionen', content: <CameraOptions /> }}
            microphoneOptions={{ label: 'Mikrofonoptionen', content: <MicOptions /> }}
            level={level}
            levelStatus="Mikrofon funktioniert."
            labels={{
                ...t(DEVICE_LABELS),
                camera: cam ? 'Kamera ausschalten' : 'Kamera einschalten',
                microphone: mic ? 'Mikrofon ausschalten' : 'Mikrofon einschalten',
            }}
            status={
                state === 'cameraBlocked' ? (
                    <Alert variant="destructive">
                        <CameraOff aria-hidden="true" />
                        <AlertTitle>Kamera: Zugriff verweigert</AlertTitle>
                        <AlertDescription>
                            Du kannst trotzdem beitreten und zuhören. Um die Kamera zu nutzen,
                            erlaube den Zugriff in den Browsereinstellungen und lade die Seite neu.
                            <SupportReference
                                id="c1e2a7d4-90f1-4b3e-8a5c-2d7e6f0b1a93"
                                labels={t(SUPPORT_LABELS)}
                            />
                        </AlertDescription>
                    </Alert>
                ) : undefined
            }
        >
            <details className="group rounded-xl border border-border bg-card">
                <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-2 px-4 text-sm font-medium">
                    Geräte auswählen und Lautsprecher testen
                </summary>
                <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-2">
                    <DeviceSelect label="Kamera" options={CAMERAS} />
                    <DeviceSelect label="Mikrofon" options={MICS} />
                    <DeviceSelect label="Ausgabegerät" options={OUTPUTS} />
                    <DeviceSelect label="Hintergrund" options={BACKGROUNDS} />
                    <Button variant="outline" className="sm:col-span-2" type="button">
                        <Volume2 aria-hidden="true" />
                        Testton abspielen
                    </Button>
                </div>
            </details>
        </DevicePreview>
    );

    const join = (
        <>
            <Button
                size="lg"
                className="h-12 w-full text-base"
                onClick={linkTo('Pages/Meeting', 'Unterricht')}
            >
                Meeting beitreten
            </Button>
            <p className="text-sm text-muted-foreground">
                Mikrofon und Kamera sind beim Beitritt aus. Du schaltest sie im Meeting ein.
            </p>
        </>
    );

    if (state === 'ended') {
        return (
            <MeetingLobby
                header={<Logo />}
                footer={<FooterLinks />}
                notice={
                    <Alert>
                        <DoorOpen aria-hidden="true" />
                        <AlertTitle>Die Leitung hat dieses Meeting für alle beendet.</AlertTitle>
                        <AlertDescription>
                            Ein Wiederbeitritt ist nicht mehr möglich.
                        </AlertDescription>
                    </Alert>
                }
                title="Das Meeting ist beendet"
                description="Danke fürs Mitmachen. Die Aufnahme findest du später in deinem Kurs."
                meta={
                    <>
                        <Badge tone="neutral">{t(TITLE)}</Badge>
                        <RecordingIndicator state="processing" labels={t(RECORDING_LABELS)} />
                    </>
                }
                access={
                    <Button variant="outline" className="w-full">
                        Zur Startseite
                    </Button>
                }
            />
        );
    }

    if (state === 'denied') {
        return (
            <MeetingLobby
                header={<Logo />}
                footer={<FooterLinks />}
                title="Kein Zugriff"
                description="Dieses Meeting ist nur für die Teilnehmenden des Kurses. Melde dich mit dem Konto an, mit dem du eingeschrieben bist."
                access={
                    <>
                        <Button className="w-full">Mit anderem Konto anmelden</Button>
                        <Alert variant="destructive" className="text-start">
                            <CircleAlert aria-hidden="true" />
                            <AlertDescription>
                                Wenn du glaubst, dass das ein Fehler ist, schreib deiner Schule.
                                <SupportReference
                                    id="0b9d4e21-7c3a-4f8e-b6d2-5a1c9e7f3d08"
                                    labels={t(SUPPORT_LABELS)}
                                />
                            </AlertDescription>
                        </Alert>
                    </>
                }
            />
        );
    }

    if (state === 'waiting') {
        return (
            <MeetingLobby
                header={<Logo />}
                footer={<FooterLinks />}
                title="Du wartest auf die Zulassung"
                description="Die Kursleitung sieht, dass du angeklopft hast, und lässt dich gleich herein."
                meta={meta}
                preview={preview}
                access={
                    <>
                        <div
                            role="status"
                            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                        >
                            <Loader
                                aria-hidden="true"
                                className="size-5 animate-spin text-muted-foreground motion-reduce:animate-none"
                            />
                            <div>
                                <p className="text-sm font-medium">Jonas Weber</p>
                                <p className="text-sm text-muted-foreground">Angeklopft um 18:38</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full">
                            Anfrage zurückziehen
                        </Button>
                    </>
                }
            />
        );
    }

    if (state === 'guest') {
        return (
            <MeetingLobby
                header={<Logo />}
                footer={<FooterLinks />}
                title="Als Gast teilnehmen"
                description="Gib deinen Namen ein und klopfe an. Die Kursleitung lässt dich herein."
                meta={meta}
                preview={preview}
                access={
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <Field label="Dein Name" hint="So sehen dich die anderen Teilnehmenden.">
                            {(id) => <Input id={id} maxLength={100} autoComplete="name" />}
                        </Field>
                        <Field
                            label="Passwort"
                            hint="Gib das Passwort aus deiner Einladung unverändert ein."
                        >
                            {(id) => <Input id={id} type="password" autoComplete="off" />}
                        </Field>
                        <Button
                            type="submit"
                            size="lg"
                            className="h-12 w-full text-base"
                            onClick={linkTo('Pages/Meeting', 'Lobby Warten')}
                        >
                            Anklopfen
                        </Button>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="h-px flex-1 bg-border" />
                            oder
                            <span className="h-px flex-1 bg-border" />
                        </div>
                        <Button type="button" variant="outline" className="w-full">
                            Mit Schulkonto beitreten
                        </Button>
                    </form>
                }
            />
        );
    }

    return (
        <MeetingLobby
            header={<Logo />}
            footer={<FooterLinks />}
            title={state === 'host' ? 'Dein Meeting ist bereit' : 'Bereit zum Beitreten?'}
            description={
                state === 'host'
                    ? 'Drei Teilnehmende sind schon da, zwei Gäste warten. Du kannst sie schon jetzt zulassen.'
                    : 'Ustadh Mosa Khallaf und 6 weitere sind schon im Meeting.'
            }
            meta={meta}
            preview={preview}
            access={join}
            aside={
                state === 'host' ? (
                    <ParticipantList
                        people={[]}
                        waiting={[
                            { id: 'g1', name: 'Jonas Weber', detail: 'wartet seit 2 Min.' },
                            { id: 'g2', name: 'Familie Rahman', detail: 'wartet seit 1 Min.' },
                        ]}
                        onAdmit={() => {}}
                        onDeny={() => {}}
                        headingLevel={2}
                        labels={t(LIST_LABELS)}
                    />
                ) : undefined
            }
        />
    );
}

// ---------------------------------------------------------------------------
// The room
// ---------------------------------------------------------------------------

type PanelKind = 'chat' | 'people' | 'poll' | null;
type PollPhase = 'none' | 'running' | 'closed';

interface RoomOptions {
    /** You are the host (moderation, guests, polls, end for everyone) or a student. */
    host?: boolean;
    /** People besides you. */
    count?: number;
    panel?: PanelKind;
    sharing?: boolean;
    recording?: RecordingState;
    /** Indices into the class (0 = teacher) with a raised hand, in order. */
    hands?: number[];
    myHand?: boolean;
    micOn?: boolean;
    camOn?: boolean;
    poll?: PollPhase;
    lecture?: boolean;
    reconnecting?: boolean;
    audioBlocked?: boolean;
    knocking?: boolean;
    chatLocked?: boolean;
    unread?: number;
}

const START_MESSAGES: MessageListItem[] = [
    {
        id: 1,
        authorId: 'p1',
        authorName: 'Ustadh Mosa Khallaf',
        authorBadge: 'Host',
        body: 'As-salamu alaykum! Heute: die Buchstaben Alif bis Ta. Die Folien findet ihr hier: https://kurs.example/arabisch/lektion-3',
        sentAt: '2026-10-26T17:31:00Z',
    },
    {
        id: 2,
        authorId: 'p2',
        authorName: 'Amira Haddad',
        body: 'Wa alaykum as-salam 👋',
        sentAt: '2026-10-26T17:31:40Z',
    },
    {
        id: 3,
        authorId: 'p3',
        authorName: 'Yusuf Demir',
        body: 'Ist das Ta der Buchstabe mit den zwei Punkten oben?',
        sentAt: '2026-10-26T17:36:10Z',
    },
    {
        id: 4,
        authorId: 'me',
        authorName: 'Selma Yilmaz',
        own: true,
        body: 'Ja, und das Tha hat drei.',
        sentAt: '2026-10-26T17:36:45Z',
    },
];

function RoomDemo({
    host = false,
    count = 7,
    panel: initialPanel = null,
    sharing = false,
    recording = 'recording',
    hands = [],
    myHand = false,
    micOn = false,
    camOn = true,
    poll: initialPoll = 'none',
    lecture = false,
    reconnecting = false,
    audioBlocked = false,
    knocking = false,
    chatLocked = false,
    unread = 0,
}: RoomOptions) {
    const t = useStoryText();
    const clock = useClock();
    const roles = t(ROLE_LABELS);
    const reactions = t(REACTIONS);
    const [mic, setMic] = useState(micOn);
    const [cam, setCam] = useState(camOn);
    const [hand, setHand] = useState(myHand);
    const [share, setShare] = useState(false);
    const [panel, setPanel] = useState<PanelKind>(initialPanel);
    const [reaction, setReaction] = useState<{ key: number; emoji: string; label: string } | null>(
        null,
    );
    const [reactionsOpen, setReactionsOpen] = useState(false);
    const [messages, setMessages] = useState(START_MESSAGES);
    const [poll, setPoll] = useState<PollPhase>(initialPoll);
    const [vote, setVote] = useState<string | undefined>();
    const [queue, setQueue] = useState<AdmissionRequest[]>(
        knocking
            ? [
                  { id: 'g1', name: 'Jonas Weber', detail: 'wartet seit 2 Min.' },
                  { id: 'g2', name: 'Familie Rahman', detail: 'gerade eben' },
              ]
            : [],
    );
    const [moderating, setModerating] = useState<DemoPerson | null>(null);
    const [meetingSettings, setMeetingSettings] = useState(false);
    const [endConfirm, setEndConfirm] = useState(false);
    const reactionTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    useEffect(() => () => clearTimeout(reactionTimer.current), []);

    const others = DEMO_PEOPLE.slice(0, count);
    const handOrder = useMemo(() => {
        const order = hands.map((i) => others[i]?.id).filter(Boolean) as string[];
        if (hand) order.push(ME.id);
        return order;
    }, [hands, hand, others]);
    const position = (id: string) => {
        const i = handOrder.indexOf(id);
        return i === -1 ? undefined : i + 1;
    };
    const blockedReason = lecture
        ? 'In großen Meetings sind Mikrofon und Kamera für Teilnehmende aus. Melde dich, wenn du etwas sagen möchtest.'
        : reconnecting
          ? 'Die Verbindung wird wiederhergestellt.'
          : undefined;
    const effectiveMic = mic && !lecture;
    const effectiveCam = cam && !lecture;
    const panelToggle = (kind: Exclude<PanelKind, null>) =>
        setPanel((p) => (p === kind ? null : kind));
    const sendReaction = (id: string) => {
        const r = reactions.find((x) => x.id === id)!;
        setReaction({ key: Date.now(), emoji: r.emoji, label: r.label });
        setReactionsOpen(false);
        clearTimeout(reactionTimer.current);
        reactionTimer.current = setTimeout(() => setReaction(null), 4000);
    };

    const personActions = (p: DemoPerson) =>
        host && p.role !== 'host' ? (
            <>
                <DropdownMenuItem>
                    <Pin aria-hidden="true" />
                    Für mich anheften
                </DropdownMenuItem>
                <DropdownMenuItem disabled={p.muted}>
                    <MicOff aria-hidden="true" />
                    Stummschalten
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setModerating(p)}>
                    <Shield aria-hidden="true" />
                    Moderation für {p.name} …
                </DropdownMenuItem>
            </>
        ) : undefined;

    // Stage -----------------------------------------------------------------
    const tileLabels = t(TILE_LABELS);
    const tiles = [
        <ParticipantTile
            key={ME.id}
            name={ME.name}
            suffix={t({ de: '(du)', en: '(you)' })}
            video={
                effectiveCam && !reconnecting ? (
                    <img alt="" src={cameraFrame(ME.hue, ME.variant)} />
                ) : undefined
            }
            mirror
            muted={reconnecting ? undefined : !effectiveMic}
            handRaised={hand}
            handPosition={position(ME.id)}
            reaction={reaction}
            labels={tileLabels}
        />,
        ...others.map((p, i) => (
            <ParticipantTile
                key={p.id}
                name={p.name}
                video={
                    p.camera && !(lecture && p.role === 'participant') ? (
                        <img alt="" src={cameraFrame(p.hue, p.variant)} />
                    ) : undefined
                }
                muted={reconnecting ? undefined : p.muted}
                speaking={i === 0 && !reconnecting}
                handRaised={position(p.id) !== undefined}
                handPosition={position(p.id)}
                badge={
                    p.role === 'host' || p.role === 'cohost' || p.role === 'guest'
                        ? roles[p.role]
                        : undefined
                }
                connection={i === 5 ? 'poor' : undefined}
                actions={personActions(p)}
                labels={tileLabels}
            />
        )),
    ];

    const presenter = share ? `${ME.name}` : sharing ? DEMO_PEOPLE[0]!.name : null;
    const stage = (
        <VideoStage
            labels={t(STAGE_LABELS)}
            featured={
                presenter ? (
                    <>
                        <img
                            alt={`Bildschirm von ${presenter}`}
                            src={slideFrame()}
                            className="size-full object-contain"
                        />
                        <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-video-scrim px-2 py-1 text-sm font-medium text-video-foreground">
                            <ScreenShare aria-hidden="true" className="size-4" />
                            {share ? 'Du teilst deinen Bildschirm' : `Bildschirm von ${presenter}`}
                        </span>
                    </>
                ) : undefined
            }
        >
            {tiles}
        </VideoStage>
    );

    // Panels ----------------------------------------------------------------
    const pollText = t(POLL_QUESTION);
    const pollOptions = pollText.answers.map((label, i) => ({ id: `a${i}`, label }));
    let panelNode: ReactNode = null;
    if (panel === 'chat') {
        panelNode = (
            <MeetingRoomPanel
                title="Chat"
                closeLabel="Chat schließen"
                onClose={() => setPanel(null)}
                flush
                footer={
                    chatLocked ? (
                        <p className="text-sm text-muted-foreground">
                            <Lock aria-hidden="true" className="me-1 inline size-3.5" />
                            Die Kursleitung hat den Chat gesperrt. Du kannst lesen und eigene
                            Nachrichten löschen.
                        </p>
                    ) : (
                        <ChatComposer
                            labels={{ ...chatComposerLabelsDe, placeholder: 'Nachricht an alle' }}
                            allowAttachments={false}
                            onSend={(body) =>
                                setMessages((m) => [
                                    ...m,
                                    {
                                        id: Date.now(),
                                        authorId: 'me',
                                        authorName: ME.name,
                                        own: true,
                                        body,
                                        sentAt: new Date().toISOString(),
                                    },
                                ])
                            }
                        />
                    )
                }
            >
                <div className="flex h-full flex-col">
                    <p className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
                        Der Chat wird mit dem Termin gespeichert und ist für Teilnehmende des Kurses
                        sichtbar.
                    </p>
                    <MessageList
                        messages={messages}
                        labels={{
                            ...messageListLabelsDe,
                            log: 'Chatverlauf',
                            empty: 'Noch keine Nachrichten. Stelle eine Frage oder teile einen Link.',
                        }}
                        canDelete={(m) => Boolean(m.own) || host}
                        onDelete={(m) =>
                            setMessages((all) =>
                                all.map((x) => (x.id === m.id ? { ...x, deleted: true } : x)),
                            )
                        }
                        formatTime={formatTimeDe}
                    />
                </div>
            </MeetingRoomPanel>
        );
    } else if (panel === 'people') {
        panelNode = (
            <MeetingRoomPanel
                title={`Teilnehmende (${others.length + 1})`}
                closeLabel="Teilnehmende schließen"
                onClose={() => setPanel(null)}
            >
                <ParticipantList
                    labels={t(LIST_LABELS)}
                    waiting={host ? queue : undefined}
                    onAdmit={(id) => setQueue((q) => q.filter((r) => r.id !== id))}
                    onDeny={(id) => setQueue((q) => q.filter((r) => r.id !== id))}
                    actions={
                        host ? (
                            <>
                                <Button variant="outline" size="sm">
                                    <MicOff aria-hidden="true" />
                                    Alle stummschalten
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMeetingSettings(true)}
                                >
                                    <Shield aria-hidden="true" />
                                    Meeting moderieren
                                </Button>
                            </>
                        ) : undefined
                    }
                    people={[
                        {
                            id: ME.id,
                            name: ME.name,
                            self: true,
                            role: roles.participant,
                            muted: !effectiveMic,
                            handPosition: position(ME.id),
                        },
                        ...others.map((p) => ({
                            id: p.id,
                            name: p.name,
                            role: roles[p.role],
                            leader: p.role === 'host' || p.role === 'cohost',
                            muted: p.muted,
                            handPosition: position(p.id),
                            actions: personActions(p),
                        })),
                    ]}
                />
            </MeetingRoomPanel>
        );
    } else if (panel === 'poll') {
        panelNode = (
            <MeetingRoomPanel
                title="Abstimmung"
                closeLabel="Abstimmung schließen"
                onClose={() => setPanel(null)}
            >
                {poll === 'none' && host && (
                    <PollComposer
                        labels={t(POLL_COMPOSER_LABELS)}
                        draft={undefined}
                        onStart={() => setPoll('running')}
                    />
                )}
                {poll === 'none' && !host && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        Zurzeit gibt es keine Abstimmung.
                    </p>
                )}
                {poll === 'running' && (
                    <PollBallot
                        question={pollText.question}
                        options={pollOptions}
                        totalVotes={vote ? 9 : 8}
                        remainingSeconds={84}
                        votedFor={vote}
                        onVote={host ? undefined : setVote}
                        onClose={host ? () => setPoll('closed') : undefined}
                        labels={t(POLL_BALLOT_LABELS)}
                    />
                )}
                {poll === 'closed' && (
                    <PollResults
                        question={pollText.question}
                        results={[
                            { ...pollOptions[0]!, votes: 2 },
                            { ...pollOptions[1]!, votes: 9 },
                            { ...pollOptions[2]!, votes: 1 },
                        ]}
                        votedFor={vote ?? (host ? undefined : 'a1')}
                        onNewPoll={host ? () => setPoll('none') : undefined}
                        labels={t(POLL_RESULTS_LABELS)}
                    />
                )}
            </MeetingRoomPanel>
        );
    }

    // Notices ---------------------------------------------------------------
    const notices =
        reconnecting || audioBlocked ? (
            <>
                {reconnecting && (
                    <Alert>
                        <WifiOff aria-hidden="true" />
                        <AlertTitle>Die Verbindung ist unterbrochen</AlertTitle>
                        <AlertDescription>
                            Wir stellen sie gerade wieder her. Bis dahin sind deine Geräte, Hand und
                            Reaktionen pausiert. Du kannst das Meeting jederzeit verlassen.
                        </AlertDescription>
                    </Alert>
                )}
                {audioBlocked && (
                    <Alert>
                        <Volume2 aria-hidden="true" />
                        <AlertTitle>Dein Browser hat den Ton angehalten</AlertTitle>
                        <AlertDescription>
                            Klicke einmal, damit du die anderen hörst.
                        </AlertDescription>
                        <AlertAction>
                            <Button size="sm">Ton einschalten</Button>
                        </AlertAction>
                    </Alert>
                )}
            </>
        ) : undefined;

    // Toolbar ---------------------------------------------------------------
    const handCount = handOrder.length;
    const toolbar = (
        <MeetingToolbar
            label="Eigene Geräte und Meetingaktionen"
            start={
                <>
                    <span className="font-medium text-foreground tabular-nums">{clock}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{ROOM_CODE}</span>
                </>
            }
            end={
                <>
                    <MeetingControl
                        label={
                            unread && panel !== 'chat'
                                ? `Chat: ${unread} ungelesene Nachrichten`
                                : 'Chat'
                        }
                        icon={<MessageSquare aria-hidden="true" />}
                        tone={panel === 'chat' ? 'active' : 'default'}
                        pressed={panel === 'chat'}
                        badge={panel === 'chat' ? 0 : unread}
                        onClick={() => panelToggle('chat')}
                    />
                    <MeetingControl
                        label={
                            host && queue.length
                                ? `Teilnehmende: ${queue.length} warten auf Zulassung`
                                : 'Teilnehmende'
                        }
                        icon={<Users aria-hidden="true" />}
                        tone={panel === 'people' ? 'active' : 'default'}
                        pressed={panel === 'people'}
                        badge={host ? queue.length : 0}
                        onClick={() => panelToggle('people')}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <MeetingControl
                                label="Weitere Optionen"
                                icon={<EllipsisVertical aria-hidden="true" />}
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align="end" className="w-64">
                            <DropdownMenuItem onSelect={() => setPanel('poll')}>
                                <ChartColumn aria-hidden="true" />
                                Abstimmung
                            </DropdownMenuItem>
                            {host && (
                                <DropdownMenuItem onSelect={() => setMeetingSettings(true)}>
                                    <Shield aria-hidden="true" />
                                    Meeting moderieren
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                                Öffnet einen neuen Tab. Dein Meeting bleibt offen.
                            </DropdownMenuLabel>
                            <DropdownMenuItem>
                                <LifeBuoy aria-hidden="true" />
                                Hilfe
                            </DropdownMenuItem>
                            <DropdownMenuItem>Datenschutz</DropdownMenuItem>
                            <DropdownMenuItem>Impressum</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {host ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <MeetingControl
                                    label="Verlassen"
                                    icon={
                                        <LogOut aria-hidden="true" className="rtl:-scale-x-100" />
                                    }
                                    tone="danger"
                                    showLabel
                                />
                            </PopoverTrigger>
                            <PopoverContent
                                aria-label="Meeting verlassen"
                                side="top"
                                align="end"
                                className="w-80 space-y-3"
                            >
                                <div className="space-y-1">
                                    <h2 className="text-sm font-semibold">
                                        Meeting verlassen oder für alle beenden?
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Wenn du nur gehst, läuft das Meeting für die anderen weiter.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={linkTo('Pages/Meeting', 'Lobby Beendet')}
                                >
                                    Nur Meeting verlassen
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => setEndConfirm(true)}
                                >
                                    Meeting für alle beenden
                                </Button>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <MeetingControl
                            label="Verlassen"
                            icon={<LogOut aria-hidden="true" className="rtl:-scale-x-100" />}
                            tone="danger"
                            showLabel
                            onClick={linkTo('Pages/Meeting', 'Lobby Beendet')}
                        />
                    )}
                </>
            }
        >
            <MeetingControl
                label={effectiveMic ? 'Mikrofon ausschalten' : 'Mikrofon einschalten'}
                icon={effectiveMic ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
                tone={effectiveMic ? 'default' : 'off'}
                pressed={effectiveMic}
                disabledReason={blockedReason}
                onClick={() => setMic(!mic)}
                options={{
                    label: 'Mikrofonoptionen',
                    content: <MicOptions />,
                    disabled: reconnecting,
                }}
            />
            <MeetingControl
                label={effectiveCam ? 'Kamera ausschalten' : 'Kamera einschalten'}
                icon={
                    effectiveCam ? <Camera aria-hidden="true" /> : <CameraOff aria-hidden="true" />
                }
                tone={effectiveCam ? 'default' : 'off'}
                pressed={effectiveCam}
                disabledReason={blockedReason}
                onClick={() => setCam(!cam)}
                options={{
                    label: 'Kameraoptionen',
                    content: <CameraOptions />,
                    disabled: reconnecting,
                }}
            />
            {share ? (
                <MeetingControl
                    label="Teilen beenden"
                    icon={<ScreenShareOff aria-hidden="true" />}
                    tone="active"
                    pressed
                    onClick={() => setShare(false)}
                />
            ) : (
                <Popover>
                    <PopoverTrigger asChild>
                        <MeetingControl
                            label="Bildschirm teilen"
                            icon={<ScreenShare aria-hidden="true" />}
                            pressed={false}
                            disabledReason={
                                lecture
                                    ? 'Nur die Kursleitung kann in großen Meetings teilen.'
                                    : reconnecting
                                      ? blockedReason
                                      : sharing
                                        ? `${DEMO_PEOPLE[0]!.name} teilt gerade. Es kann immer nur eine Person teilen.`
                                        : undefined
                            }
                        />
                    </PopoverTrigger>
                    <PopoverContent aria-label="Bildschirm teilen" side="top" className="space-y-3">
                        <h2 className="text-sm font-semibold">Bildschirm teilen</h2>
                        <CheckRow>Ton der gewählten Quelle teilen</CheckRow>
                        <Button className="w-full" onClick={() => setShare(true)}>
                            Bildschirm teilen
                        </Button>
                    </PopoverContent>
                </Popover>
            )}
            <MeetingControl
                label={hand ? 'Meldung zurücknehmen' : 'Melden'}
                icon={<Hand aria-hidden="true" />}
                tone={hand ? 'attention' : 'default'}
                pressed={hand}
                badge={handCount}
                disabledReason={reconnecting ? blockedReason : undefined}
                onClick={() => setHand(!hand)}
            />
            <Popover open={reactionsOpen} onOpenChange={setReactionsOpen}>
                <PopoverTrigger asChild>
                    <MeetingControl
                        label="Reaktionen"
                        icon={<SmilePlus aria-hidden="true" />}
                        disabledReason={reconnecting ? blockedReason : undefined}
                    />
                </PopoverTrigger>
                <PopoverContent aria-label="Reaktionen" side="top" className="w-auto p-2">
                    <ReactionPicker
                        label="Reaktionen"
                        reactions={reactions}
                        onPick={sendReaction}
                    />
                </PopoverContent>
            </Popover>
        </MeetingToolbar>
    );

    const participantCount = others.length + 1;
    return (
        <>
            <MeetingRoom
                header={
                    <MeetingHeader
                        title={t(TITLE)}
                        subtitle={ROOM_CODE}
                        status={
                            <>
                                <RecordingIndicator
                                    state={recording}
                                    labels={t(RECORDING_LABELS)}
                                />
                                {lecture && <Badge tone="neutral">Vortragsmodus</Badge>}
                            </>
                        }
                        end={
                            <span className="inline-flex items-center gap-1.5">
                                <Users aria-hidden="true" className="size-4" />
                                <span className="sr-only">Teilnehmende:</span>
                                {lecture ? 142 : participantCount}
                            </span>
                        }
                    />
                }
                notices={notices}
                stage={stage}
                overlay={
                    host && panel !== 'people' ? (
                        <AdmissionRequests
                            requests={queue}
                            onAdmit={(id) => setQueue((q) => q.filter((r) => r.id !== id))}
                            onDeny={(id) => setQueue((q) => q.filter((r) => r.id !== id))}
                            onShowAll={() => setPanel('people')}
                            labels={t(ADMISSION_LABELS)}
                        />
                    ) : undefined
                }
                prompt={
                    poll !== 'none' && panel !== 'poll' ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full shadow-sm"
                            onClick={() => setPanel('poll')}
                        >
                            <ChartColumn aria-hidden="true" />
                            {poll === 'running'
                                ? 'Abstimmung läuft – jetzt abstimmen'
                                : 'Ergebnis ansehen'}
                        </Button>
                    ) : undefined
                }
                toolbar={toolbar}
                panel={panelNode}
            />

            {moderating && (
                <ModerationDialog
                    person={moderating}
                    onOpenChange={(open) => !open && setModerating(null)}
                />
            )}
            <MeetingSettingsDialog
                open={meetingSettings}
                onOpenChange={setMeetingSettings}
                onEnd={() => setEndConfirm(true)}
            />
            <AlertDialog open={endConfirm} onOpenChange={setEndConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>„{t(TITLE)}“ für alle beenden?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Alle verlassen das Meeting sofort. Ein Wiederbeitritt ist nicht mehr
                            möglich. Die Aufnahme wird danach verarbeitet.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={linkTo('Pages/Meeting', 'Lobby Beendet')}
                        >
                            Meeting für alle beenden
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

const PERMISSION = ['Meetingvorgabe', 'Erlauben', 'Verbieten'];

function ModerationDialog({
    person,
    onOpenChange,
}: {
    person: DemoPerson;
    onOpenChange: (open: boolean) => void;
}) {
    const [mic, setMic] = useState('Meetingvorgabe');
    const [cam, setCam] = useState('Meetingvorgabe');
    const [screen, setScreen] = useState('Meetingvorgabe');
    const [chat, setChat] = useState('Meetingvorgabe');
    const [remove, setRemove] = useState(false);
    const choice = (label: string, value: string, set: (v: string) => void) => (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium" id={`mod-${label}`}>
                {label}
            </span>
            <SegmentedChoice
                aria-labelledby={`mod-${label}`}
                value={value}
                onValueChange={set}
                className="w-auto"
            >
                {PERMISSION.map((p) => (
                    <SegmentedChoiceItem key={p} value={p} className="min-h-9 px-2.5 text-xs">
                        {p}
                    </SegmentedChoiceItem>
                ))}
            </SegmentedChoice>
        </div>
    );
    return (
        <>
            <Dialog open onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-lg" closeLabel="Schließen">
                    <DialogHeader>
                        <DialogTitle>Moderation für {person.name}</DialogTitle>
                        <DialogDescription>
                            Was du hier stoppst, kann {person.name.split(' ')[0]} selbst wieder
                            einschalten, solange es erlaubt ist.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5">
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" disabled={person.muted}>
                                <MicOff aria-hidden="true" />
                                Stummschalten
                            </Button>
                            <Button variant="outline" size="sm" disabled={!person.camera}>
                                <CameraOff aria-hidden="true" />
                                Kamera stoppen
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                tooltip={`${person.name} teilt gerade nicht.`}
                            >
                                <ScreenShareOff aria-hidden="true" />
                                Bildschirmfreigabe stoppen
                            </Button>
                        </div>
                        <fieldset className="space-y-3">
                            <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                Rechte für diesen Termin
                            </legend>
                            {choice('Mikrofon', mic, setMic)}
                            {choice('Kamera', cam, setCam)}
                            {choice('Bildschirmfreigabe', screen, setScreen)}
                            {choice('Chat-Schreibrecht', chat, setChat)}
                            <p className="text-xs text-muted-foreground">
                                Die allgemeine Chatsperre hat Vorrang. Persönliche Freigaben wirken
                                erst nach dem Entsperren.
                            </p>
                        </fieldset>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button variant="destructive" onClick={() => setRemove(true)}>
                            <UserRoundX aria-hidden="true" />
                            Entfernen
                        </Button>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Fertig
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog open={remove} onOpenChange={setRemove}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {person.name} aus dem Meeting entfernen?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {person.name.split(' ')[0]} verlässt das Meeting sofort.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <CheckRow>Wiederbeitritt für diesen Termin sperren</CheckRow>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Entfernen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function MeetingSettingsDialog({
    open,
    onOpenChange,
    onEnd,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEnd: () => void;
}) {
    const locks = [
        ['Raum sperren', 'Niemand Neues kann beitreten, auch nicht über die Warteliste.'],
        ['Mikrofone sperren', 'Teilnehmende und Gäste können ihr Mikrofon nicht einschalten.'],
        ['Kameras sperren', 'Teilnehmende und Gäste können ihre Kamera nicht einschalten.'],
        ['Teilen sperren', 'Nur die Kursleitung kann den Bildschirm teilen.'],
        ['Chat sperren', 'Teilnehmende und Gäste können lesen, aber nicht schreiben.'],
    ];
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" closeLabel="Schließen">
                <DialogHeader>
                    <DialogTitle>Meeting moderieren</DialogTitle>
                    <DialogDescription>
                        Gilt für alle außer Host, Co-Host und Admin.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    {locks.map(([label, hint]) => (
                        <CheckRow
                            key={label}
                            className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm"
                        >
                            <span>
                                <span className="block font-medium">{label}</span>
                                <span className="block text-muted-foreground">{hint}</span>
                            </span>
                        </CheckRow>
                    ))}
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button variant="destructive" onClick={onEnd}>
                        Meeting für alle beenden
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fertig
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

const meta: Meta = {
    title: 'Pages/Meeting',
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <div className="h-dvh min-h-[36rem]">
                <Story />
            </div>
        ),
    ],
};
export default meta;
type Story = StoryObj;

/** Before joining: your picture and devices on the left, the meeting and "join" on the right. */
export const Lobby: Story = { render: () => <LobbyDemo state="joinable" /> };

/** A guest without a school account knocks with their name (and the invitation's password). */
export const LobbyGast: Story = { render: () => <LobbyDemo state="guest" /> };

/** After knocking: waiting for the host, with the way back. */
export const LobbyWarten: Story = {
    render: () => <LobbyDemo state="waiting" />,
};

/** The browser blocked the camera: say how to fix it, and that joining still works. */
export const LobbyKameraBlockiert: Story = {
    name: 'Lobby Kamera blockiert',
    render: () => <LobbyDemo state="cameraBlocked" />,
};

/** A host sees who is already waiting and can let them in before joining. */
export const LobbyHost: Story = { render: () => <LobbyDemo state="host" /> };

/** Back in the lobby after the meeting ended — never a blank page. */
export const LobbyBeendet: Story = {
    render: () => <LobbyDemo state="ended" />,
};

/** Not on the course: no access, with a support id. */
export const LobbyKeinZugriff: Story = {
    render: () => <LobbyDemo state="denied" />,
};

/** A lesson in progress, seen by a student: the teacher talks, the class listens. */
export const Unterricht: Story = { render: () => <RoomDemo /> };

/** One-to-one lesson: two people side by side. */
export const ZuZweit: Story = { name: 'Zu zweit', render: () => <RoomDemo count={1} micOn /> };

/** A full class: 16 per page, a pager on top, nobody jumps around when they speak. */
export const GrosseKlasse: Story = {
    name: 'Große Klasse',
    render: () => <RoomDemo count={22} hands={[3, 9]} />,
};

/** The teacher shares the lesson slides; the cameras make room in a strip. */
export const Bildschirmfreigabe: Story = { render: () => <RoomDemo sharing count={9} /> };

/** You raised your hand: amber button, amber ring on your tile, your place in the queue. */
export const Gemeldet: Story = { render: () => <RoomDemo myHand hands={[2]} /> };

/** The chat beside the stage (a sheet from the bottom on a phone). */
export const Chat: Story = { render: () => <RoomDemo panel="chat" /> };

/** The chat with unread messages, closed: the count on the chat button. */
export const ChatUngelesen: Story = {
    name: 'Chat ungelesen',
    render: () => <RoomDemo unread={3} />,
};

/** The host locked the chat: everyone can still read. */
export const ChatGesperrt: Story = {
    name: 'Chat gesperrt',
    render: () => <RoomDemo panel="chat" chatLocked />,
};

/** A running poll, seen by a student: the prompt above the toolbar, the ballot in the panel. */
export const Abstimmung: Story = { render: () => <RoomDemo poll="running" panel="poll" /> };

/** The result after the poll closed. */
export const AbstimmungErgebnis: Story = {
    render: () => <RoomDemo poll="closed" panel="poll" />,
};

/** The host starts a poll. */
export const AbstimmungStarten: Story = {
    name: 'Abstimmung starten',
    render: () => <RoomDemo host poll="none" panel="poll" micOn />,
};

/**
 * The host's view: guests knocking over the stage, raised hands in the people panel,
 * moderation in every ⋮ menu.
 */
export const AlsHost: Story = {
    render: () => <RoomDemo host knocking hands={[3, 1]} micOn />,
};

/** The host's people panel: waiting guests, raised hands in order, everyone with a ⋮ menu. */
export const TeilnehmendeAlsHost: Story = {
    name: 'Teilnehmende als Host',
    render: () => <RoomDemo host knocking hands={[3, 1]} panel="people" micOn />,
};

/** Moderating one person: stop their devices, set their rights, remove them. */
export const ModerationEinerPerson: Story = {
    name: 'Moderation einer Person',
    render: () => <RoomDemo host panel="people" micOn />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        // The tile and the people panel both offer the menu; use the panel's.
        const triggers = canvas.getAllByRole('button', { name: 'Aktionen für Amira Haddad' });
        await userEvent.click(triggers[triggers.length - 1]!);
        await userEvent.click(
            await body.findByRole('menuitem', { name: /Moderation für Amira Haddad/ }),
        );
        await expect(
            await body.findByRole('dialog', { name: 'Moderation für Amira Haddad' }),
        ).toBeInTheDocument();
    },
};

/** A host leaving chooses: go alone, or end the meeting for everyone. */
export const VerlassenAlsHost: Story = {
    name: 'Verlassen als Host',
    render: () => <RoomDemo host micOn />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Verlassen' }));
        await expect(
            await body.findByRole('button', { name: 'Meeting für alle beenden' }),
        ).toBeInTheDocument();
    },
};

/** Over 30 people: microphones and cameras stay off for students, and the toolbar says why. */
export const Vortragsmodus: Story = { render: () => <RoomDemo lecture count={15} hands={[4]} /> };

/** The connection dropped: a notice on top, devices paused (and say why), mic states hidden until confirmed. */
export const VerbindungUnterbrochen: Story = {
    name: 'Verbindung unterbrochen',
    render: () => <RoomDemo reconnecting />,
};

/** The browser held back the sound: one click brings it back. */
export const TonBlockiert: Story = {
    name: 'Ton blockiert',
    render: () => <RoomDemo audioBlocked />,
};

/** Click through the student's controls: mute, camera, hand, a reaction, the chat. */
export const Bedienen: Story = {
    render: () => <RoomDemo micOn />,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await step('Mute', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Mikrofon ausschalten' }));
            await expect(
                canvas.getByRole('button', { name: 'Mikrofon einschalten' }),
            ).toHaveAttribute('aria-pressed', 'false');
        });
        await step('Raise the hand', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Melden' }));
            await expect(
                canvas.getByRole('button', { name: 'Meldung zurücknehmen' }),
            ).toBeInTheDocument();
        });
        await step('Send applause', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Reaktionen' }));
            await userEvent.click(await body.findByRole('button', { name: 'Applaus' }));
            await waitFor(() =>
                expect(canvas.getByRole('img', { name: 'Applaus' })).toBeInTheDocument(),
            );
        });
        await step('Open the chat', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Chat' }));
            await expect(await canvas.findByRole('heading', { name: 'Chat' })).toBeInTheDocument();
        });
    },
};

/** On a phone: two rows of controls, panels slide up from the bottom. */
export const Telefon: Story = {
    render: () => <RoomDemo panel="chat" count={4} />,
    globals: { viewport: { value: 'mobile2', isRotated: false } },
};

/** The lobby on a phone: the way in first, the self-check below. */
export const LobbyTelefon: Story = {
    render: () => <LobbyDemo state="joinable" />,
    globals: { viewport: { value: 'mobile2', isRotated: false } },
};
