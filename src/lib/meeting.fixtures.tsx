/**
 * Example labels, people and pictures for the meeting components' stories and the
 * Meeting page prototype. Not part of the public API — it keeps the stories of the tile,
 * stage, toolbar, panels and lobby telling one story (Ustadh Mosa's Arabic class), in
 * German and English.
 *
 * The "camera pictures" are drawn SVGs, not photos: a soft room and a silhouette in a
 * per-person colour, so a prototype looks like a call without shipping anyone's face.
 */
import type { Localized } from '../../.storybook/locale';
import type { AdmissionRequestsLabels } from '../molecules/AdmissionRequests';
import type { ReactionOption } from '../molecules/ReactionPicker';
import type { RecordingState } from '../molecules/RecordingIndicator';
import type { SupportReferenceLabels } from '../molecules/SupportReference';
import type { DevicePreviewLabels } from '../organisms/DevicePreview';
import type { ParticipantListLabels } from '../organisms/ParticipantList';
import type { ParticipantTileLabels } from '../organisms/ParticipantTile';
import type { PollBallotLabels, PollComposerLabels, PollResultsLabels } from '../organisms/Poll';
import type { VideoStageLabels } from '../organisms/VideoStage';

// ---------------------------------------------------------------------------
// Pictures
// ---------------------------------------------------------------------------

/** A drawn camera picture: a room in soft light and a person's silhouette. */
export function cameraFrame(hue: number, variant = 0): string {
    const wall = `oklch(0.86 0.03 ${hue})`;
    const wall2 = `oklch(0.74 0.05 ${(hue + 40) % 360})`;
    const shirt = `oklch(0.48 0.09 ${(hue + 180) % 360})`;
    const skin = [
        'oklch(0.78 0.06 60)',
        'oklch(0.62 0.07 50)',
        'oklch(0.7 0.06 45)',
        'oklch(0.5 0.06 40)',
    ][variant % 4];
    const hair = [
        'oklch(0.25 0.02 40)',
        'oklch(0.2 0.01 30)',
        'oklch(0.4 0.05 50)',
        'oklch(0.3 0.03 20)',
    ][variant % 4];
    const shelf = variant % 2 === 0;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${wall}"/><stop offset="1" stop-color="${wall2}"/></linearGradient>
<radialGradient id="l" cx="0.3" cy="0.2" r="0.8"><stop offset="0" stop-color="white" stop-opacity="0.35"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient></defs>
<rect width="160" height="90" fill="url(#w)"/>
${shelf ? `<rect x="104" y="18" width="40" height="3" rx="1" fill="oklch(0.55 0.05 60)"/><rect x="108" y="8" width="5" height="10" fill="oklch(0.55 0.1 30)"/><rect x="114" y="10" width="4" height="8" fill="oklch(0.5 0.08 250)"/><rect x="119" y="7" width="6" height="11" fill="oklch(0.6 0.08 150)"/><circle cx="136" cy="13" r="4.5" fill="oklch(0.6 0.1 140)"/>` : `<rect x="14" y="10" width="30" height="22" rx="1.5" fill="oklch(0.95 0.01 90)" stroke="oklch(0.6 0.03 60)" stroke-width="1.2"/><path d="M18 28 L26 19 L32 25 L36 21 L41 28 Z" fill="oklch(0.65 0.08 160)"/>`}
<ellipse cx="80" cy="96" rx="40" ry="28" fill="${shirt}"/>
<rect x="73" y="54" width="14" height="14" rx="5" fill="${skin}"/>
<ellipse cx="80" cy="42" rx="14" ry="17" fill="${skin}"/>
<path d="M65 40 Q66 22 80 23 Q95 22 95 40 Q92 30 80 30 Q69 30 65 40 Z" fill="${hair}"/>
<rect width="160" height="90" fill="url(#l)"/>
</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** A drawn shared screen: a lesson slide on the Arabic letters. */
export function slideFrame(): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
<rect width="1600" height="900" fill="#fbfaf7"/>
<rect width="1600" height="110" fill="#1f3a5f"/>
<text x="80" y="72" font-family="Geist, system-ui, sans-serif" font-size="40" font-weight="600" fill="#ffffff">Lektion 3 · Die Buchstaben Alif bis Ta</text>
<g font-family="'Noto Naskh Arabic', 'Amiri', serif" font-size="190" fill="#1f3a5f" text-anchor="middle">
<text x="1300" y="470">ا</text><text x="980" y="470">ب</text><text x="660" y="470">ت</text><text x="340" y="470">ث</text></g>
<g font-family="Geist, system-ui, sans-serif" font-size="38" fill="#4a5568" text-anchor="middle">
<text x="1300" y="560">Alif</text><text x="980" y="560">Ba</text><text x="660" y="560">Ta</text><text x="340" y="560">Tha</text></g>
<rect x="80" y="660" width="1440" height="2" fill="#e2e8f0"/>
<text x="80" y="740" font-family="Geist, system-ui, sans-serif" font-size="34" fill="#2d3748">Achte auf die Punkte: einer unter dem Ba, zwei über dem Ta, drei über dem Tha.</text>
<text x="80" y="800" font-family="Geist, system-ui, sans-serif" font-size="28" fill="#718096">Übung: Schreibe jeden Buchstaben dreimal in dein Heft.</text>
</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export interface DemoPerson {
    id: string;
    name: string;
    role: 'host' | 'cohost' | 'participant' | 'guest';
    hue: number;
    camera: boolean;
    muted: boolean;
    variant: number;
}

const NAMES: [string, DemoPerson['role'], boolean, boolean][] = [
    ['Ustadh Mosa Khallaf', 'host', true, false],
    ['Amira Haddad', 'participant', true, true],
    ['Yusuf Demir', 'participant', true, true],
    ['Leonie Berger', 'participant', false, true],
    ['Ustadha Amina Berger', 'cohost', true, true],
    ['Bilal Rahman', 'participant', true, true],
    ['Hanna Öztürk', 'participant', false, true],
    ['Elias Schneider', 'participant', true, true],
    ['Maryam Nasser', 'participant', true, true],
    ['Jonas Weber', 'guest', false, true],
    ['Sara El-Amin', 'participant', true, true],
    ['Idris Kaya', 'participant', false, true],
    ['Fatima Zahra', 'participant', true, true],
    ['Noah Hoffmann', 'participant', true, true],
    ['Aylin Yıldız', 'participant', false, true],
    ['Karim Mansour', 'participant', true, true],
    ['Lea Fischer', 'participant', true, true],
    ['Omar Farouk', 'participant', false, true],
    ['Zainab Ali', 'participant', true, true],
    ['Mats Wagner', 'participant', true, true],
    ['Selin Arslan', 'participant', true, true],
    ['Hamza Sheikh', 'participant', false, true],
    ['Mila Becker', 'participant', true, true],
    ['Rayan Bakr', 'participant', true, true],
];

/** The class: the teacher first, then students, a co-teacher and a guest. */
export const DEMO_PEOPLE: DemoPerson[] = NAMES.map(([name, role, camera, muted], i) => ({
    id: `p${i + 1}`,
    name,
    role,
    camera,
    muted,
    hue: (i * 47 + 200) % 360,
    variant: i,
}));

/** You, in the prototype: a student. */
export const ME: DemoPerson = {
    id: 'me',
    name: 'Selma Yilmaz',
    role: 'participant',
    camera: true,
    muted: true,
    hue: 330,
    variant: 2,
};

export const ROLE_LABELS: Localized<Record<DemoPerson['role'], string>> = {
    de: { host: 'Host', cohost: 'Co-Host', participant: 'Teilnehmer', guest: 'Gast' },
    en: { host: 'Host', cohost: 'Co-host', participant: 'Participant', guest: 'Guest' },
};

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const TILE_LABELS: Localized<ParticipantTileLabels> = {
    de: {
        muted: 'Mikrofon aus',
        handRaised: (n) => (n ? `Meldung ${n}` : 'Hand gehoben'),
        actions: (name) => `Aktionen für ${name}`,
        pinned: 'Angeheftet',
        connection: { fair: 'Verbindung schwankt', poor: 'Schlechte Verbindung' },
    },
    en: {
        muted: 'Microphone off',
        handRaised: (n) => (n ? `Raised hand ${n}` : 'Hand raised'),
        actions: (name) => `Actions for ${name}`,
        pinned: 'Pinned',
        connection: { fair: 'Unstable connection', poor: 'Poor connection' },
    },
};

export const STAGE_LABELS: Localized<VideoStageLabels> = {
    de: {
        stage: 'Meetingbühne',
        pages: 'Rasterseiten',
        previous: 'Vorherige Seite',
        next: 'Nächste Seite',
        page: (n, m) => `Seite ${n} von ${m}`,
        empty: 'Es sind noch keine Teilnehmenden sichtbar.',
    },
    en: {
        stage: 'Meeting stage',
        pages: 'Grid pages',
        previous: 'Previous page',
        next: 'Next page',
        page: (n, m) => `Page ${n} of ${m}`,
        empty: 'Nobody is visible yet.',
    },
};

export const REACTIONS: Localized<ReactionOption[]> = {
    de: [
        { id: 'thumbs_up', emoji: '👍', label: 'Zustimmung' },
        { id: 'clap', emoji: '👏', label: 'Applaus' },
        { id: 'heart', emoji: '❤️', label: 'Herz' },
        { id: 'laugh', emoji: '😂', label: 'Lachen' },
        { id: 'surprised', emoji: '😮', label: 'Staunen' },
        { id: 'thumbs_down', emoji: '👎', label: 'Ablehnung' },
    ],
    en: [
        { id: 'thumbs_up', emoji: '👍', label: 'Agree' },
        { id: 'clap', emoji: '👏', label: 'Applause' },
        { id: 'heart', emoji: '❤️', label: 'Heart' },
        { id: 'laugh', emoji: '😂', label: 'Laugh' },
        { id: 'surprised', emoji: '😮', label: 'Surprised' },
        { id: 'thumbs_down', emoji: '👎', label: 'Disagree' },
    ],
};

export const RECORDING_LABELS: Localized<Partial<Record<RecordingState, string>>> = {
    de: {
        scheduled: 'Aufnahme geplant',
        recording: 'Aufnahme läuft',
        processing: 'Aufnahme wird verarbeitet',
        available: 'Aufnahme verfügbar',
        failed: 'Aufnahme fehlgeschlagen',
        none: 'Keine Aufnahme vorhanden',
        deleting: 'Aufnahme wird gelöscht',
        deleted: 'Aufnahme gelöscht',
        unknown: 'Aufnahmestatus derzeit unbekannt',
    },
    en: {
        scheduled: 'Recording scheduled',
        recording: 'Recording',
        processing: 'Recording is processing',
        available: 'Recording available',
        failed: 'Recording failed',
        none: 'No recording',
        deleting: 'Recording is being deleted',
        deleted: 'Recording deleted',
        unknown: 'Recording status unknown',
    },
};

export const ADMISSION_LABELS: Localized<AdmissionRequestsLabels> = {
    de: {
        title: 'Gäste klopfen an',
        hint: 'Häkchen: zulassen. Kreuz: ablehnen.',
        admit: (name) => `${name} zulassen`,
        deny: (name) => `${name} ablehnen`,
        more: (n) => `und ${n} weitere`,
        showAll: 'Alle anzeigen',
    },
    en: {
        title: 'Guests are knocking',
        hint: 'Tick: let in. Cross: turn away.',
        admit: (name) => `Let ${name} in`,
        deny: (name) => `Turn ${name} away`,
        more: (n) => `and ${n} more`,
        showAll: 'Show all',
    },
};

export const LIST_LABELS: Localized<ParticipantListLabels> = {
    de: {
        raised: (n) => `Gemeldet (${n})`,
        inMeeting: (n) => `Im Meeting (${n})`,
        waiting: (n) => `Wartende Gäste (${n})`,
        you: '(du)',
        muted: 'Mikrofon aus',
        hand: (n) => `Meldung ${n}`,
        actions: (name) => `Aktionen für ${name}`,
        admit: (name) => `${name} zulassen`,
        deny: (name) => `${name} ablehnen`,
        search: 'Teilnehmende suchen',
        noMatch: 'Niemand gefunden.',
    },
    en: {
        raised: (n) => `Raised hands (${n})`,
        inMeeting: (n) => `In the meeting (${n})`,
        waiting: (n) => `Waiting guests (${n})`,
        you: '(you)',
        muted: 'Microphone off',
        hand: (n) => `Raised hand ${n}`,
        actions: (name) => `Actions for ${name}`,
        admit: (name) => `Let ${name} in`,
        deny: (name) => `Turn ${name} away`,
        search: 'Search people',
        noMatch: 'Nobody found.',
    },
};

export const POLL_COMPOSER_LABELS: Localized<PollComposerLabels> = {
    de: {
        question: 'Frage',
        answer: (n) => `Antwort ${n}`,
        addAnswer: 'Antwort hinzufügen',
        removeAnswer: 'Letzte Antwort entfernen',
        start: 'Abstimmung starten',
        starting: 'Wird gestartet …',
        duplicate: 'Zwei Antworten sind gleich. Jede Antwort darf nur einmal vorkommen.',
    },
    en: {
        question: 'Question',
        answer: (n) => `Answer ${n}`,
        addAnswer: 'Add answer',
        removeAnswer: 'Remove last answer',
        start: 'Start poll',
        starting: 'Starting …',
        duplicate: 'Two answers are the same. Each answer may appear only once.',
    },
};

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export const POLL_BALLOT_LABELS: Localized<PollBallotLabels> = {
    de: {
        votes: (n) => (n === 1 ? '1 Stimme abgegeben' : `${n} Stimmen abgegeben`),
        remaining: (s) => `Noch ${clock(s)}`,
        vote: 'Abstimmen',
        final: 'Eine abgegebene Stimme kann nicht geändert werden.',
        yourVote: (a) => `Deine Antwort: ${a}`,
        close: 'Abstimmung schließen',
    },
    en: {
        votes: (n) => (n === 1 ? '1 vote cast' : `${n} votes cast`),
        remaining: (s) => `${clock(s)} left`,
        vote: 'Vote',
        final: 'A vote cannot be changed once cast.',
        yourVote: (a) => `Your answer: ${a}`,
        close: 'Close poll',
    },
};

export const POLL_RESULTS_LABELS: Localized<PollResultsLabels> = {
    de: {
        votes: (n) => (n === 1 ? '1 Stimme' : `${n} Stimmen`),
        heading: 'Ergebnis',
        newPoll: 'Neue Abstimmung',
    },
    en: {
        votes: (n) => (n === 1 ? '1 vote' : `${n} votes`),
        heading: 'Result',
        newPoll: 'New poll',
    },
};

export const DEVICE_LABELS: Localized<DevicePreviewLabels> = {
    de: {
        title: 'Deine Vorschau',
        cameraOff: 'Deine Kamera ist aus',
        camera: 'Kamera',
        microphone: 'Mikrofon',
        level: 'Mikrofonpegel',
    },
    en: {
        title: 'Your preview',
        cameraOff: 'Your camera is off',
        camera: 'Camera',
        microphone: 'Microphone',
        level: 'Microphone level',
    },
};

export const SUPPORT_LABELS: Localized<SupportReferenceLabels> = {
    de: { prefix: 'Vorgangs-ID', copy: 'Vorgangs-ID kopieren', copied: 'Kopiert' },
    en: { prefix: 'Reference', copy: 'Copy reference', copied: 'Copied' },
};

export const POLL_QUESTION: Localized<{ question: string; answers: string[] }> = {
    de: {
        question: 'Welcher Buchstabe hat zwei Punkte über der Linie?',
        answers: ['Ba (ب)', 'Ta (ت)', 'Tha (ث)'],
    },
    en: {
        question: 'Which letter has two dots above the line?',
        answers: ['Ba (ب)', 'Ta (ت)', 'Tha (ث)'],
    },
};
