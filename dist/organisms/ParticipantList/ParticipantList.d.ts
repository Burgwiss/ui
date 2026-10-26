import { type ReactNode } from 'react';
export interface ParticipantListPerson {
    id: string;
    /** As shown; the list adds the `you` label for `self`. */
    name: string;
    self?: boolean;
    /** A role label ("Host", "Co-Host", "Gast"). */
    role?: string;
    /** Emphasise the role (leaders), so the people running the meeting stand out. */
    leader?: boolean;
    /** The microphone is off. Leave undefined while unknown. */
    muted?: boolean;
    /** Position of a raised hand (1 = first). People with a hand raised are listed first, in this order. */
    handPosition?: number;
    /** Items for this person's ⋮ menu (`DropdownMenuItem`s). Leave out and there is no menu. */
    actions?: ReactNode;
}
export interface ParticipantListWaiting {
    id: string;
    name: string;
    detail?: string;
    busy?: boolean;
}
export interface ParticipantListLabels {
    /** Section heading for raised hands: `(n) => \`Gemeldet (${n})\``. */
    raised: (count: number) => string;
    /** Section heading for everyone in the meeting: "Im Meeting (12)". */
    inMeeting: (count: number) => string;
    /** Section heading for people knocking: "Wartende Gäste (2)". */
    waiting: (count: number) => string;
    /** Added after your own name: "(du)". */
    you: string;
    muted: string;
    hand: (position: number) => string;
    actions: (name: string) => string;
    admit: (name: string) => string;
    deny: (name: string) => string;
    /** Placeholder and name of the search field (shown when `onQueryChange` is given). */
    search?: string;
    /** When a search matches nobody. (With no search and nobody in the meeting, the section is left out.) */
    noMatch?: string;
}
export interface ParticipantListProps {
    people: ParticipantListPerson[];
    /** People asking to be let in. Shown on top, for leaders only — leave out for everyone else. */
    waiting?: ParticipantListWaiting[];
    onAdmit?: (id: string) => void;
    onDeny?: (id: string) => void;
    /** Filter text; give it with `onQueryChange` to show a search field. Matching is the app's job — pass the filtered `people`. */
    query?: string;
    onQueryChange?: (query: string) => void;
    /** Level of the section headings. Default 3 (under a panel's `h2`); use 2 where the list sits right under the page's `h1`. */
    headingLevel?: 2 | 3;
    /** Meeting-wide actions above the list, e.g. "Alle stummschalten". */
    actions?: ReactNode;
    labels: ParticipantListLabels;
    className?: string;
}
/**
 * Who is in the meeting, for a side panel: people knocking (for hosts, with admit and
 * deny), then raised hands in the order they were raised, then everyone else. Each row
 * shows the name, the role, a crossed-out mic when muted and the hand's place in the
 * queue, plus a ⋮ menu with whatever the viewer may do (moderate, remove).
 *
 * Meeting-wide actions ("mute everyone") go in `actions`; give `query` and
 * `onQueryChange` for a search field in large meetings.
 *
 * @summary Meeting people panel: waiting guests, raised hands in order, everyone else, each with a ⋮ menu.
 */
export declare function ParticipantList({ people, waiting, onAdmit, onDeny, query, onQueryChange, actions, headingLevel, labels, className, }: ParticipantListProps): import("react").JSX.Element;
