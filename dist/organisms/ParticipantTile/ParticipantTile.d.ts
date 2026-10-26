import type { CSSProperties, ReactNode } from 'react';
export interface ParticipantTileReaction {
    /** Changes with every new reaction, so the same emoji twice animates twice. */
    key: string | number;
    emoji: string;
    /** What the emoji means, read out instead of the glyph ("Applaus"). */
    label: string;
}
export interface ParticipantTileLabels {
    /** Read after the name when the microphone is off, e.g. "Mikrofon aus". */
    muted: string;
    /** The raised-hand badge, given the position in the queue when known: "Meldung 2". */
    handRaised: (position?: number) => string;
    /** Name of the ⋮ menu button: "Aktionen für Amira Haddad". */
    actions: (name: string) => string;
    /** Read when the tile is pinned, e.g. "Angeheftet". */
    pinned?: string;
    /** Read for a weak connection: `{ fair: 'Verbindung schwankt', poor: 'Schlechte Verbindung' }`. */
    connection?: {
        fair: string;
        poor: string;
    };
}
export interface ParticipantTileProps {
    /** The person's name. The initials come from it, so keep "(du)" out of it — use `suffix`. */
    name: string;
    /** Shown after the name, quieter: "(du)" on your own tile. */
    suffix?: string;
    /** The camera picture — usually a `<video>` the app attaches its track to. Leave out while the camera is off: the initials show instead. */
    video?: ReactNode;
    /** Flip the picture horizontally — for your own camera, so it moves like a mirror. */
    mirror?: boolean;
    /** How the picture fills the tile. `cover` (default) crops a camera; use `contain` for a shared screen. */
    fit?: 'cover' | 'contain';
    /** The microphone is off: a small crossed-out mic beside the name. Leave undefined while the state is unknown (reconnecting). */
    muted?: boolean;
    /** The person is talking right now: a green ring, the same in every school's theme. */
    speaking?: boolean;
    /** The hand is raised: an amber ring and badge, visible with or without a camera. */
    handRaised?: boolean;
    /** Position of the raised hand in the queue (1 = first), shown in the badge. */
    handPosition?: number;
    /** The reaction to float over the tile for a few seconds; the app removes it again. */
    reaction?: ParticipantTileReaction | null;
    /** Only a weak connection is shown — a good one needs no icon. */
    connection?: 'good' | 'fair' | 'poor';
    /** A short label next to the name, e.g. the role "Host" or "Gast". */
    badge?: string;
    /** The tile is pinned to the stage. */
    pinned?: boolean;
    /** Items for the ⋮ menu (`DropdownMenuItem`s). Leave out and there is no menu. */
    actions?: ReactNode;
    /** Every string the tile reads out or shows. */
    labels: ParticipantTileLabels;
    /** Size and position — `VideoStage` sets a width and height here. */
    style?: CSSProperties;
    className?: string;
}
/**
 * One person in a meeting: their camera (or their initials when it is off), their name,
 * and what everyone needs to see about them — microphone off, talking, hand raised, a
 * reaction, a weak connection — plus a ⋮ menu for what you may do with them (moderate,
 * pin). A raised hand is an amber ring and badge, so it reads without a camera and from
 * across the grid; talking is a green ring.
 *
 * The tile never touches media: the app renders its own `<video>` and passes it as
 * `video`. Lay tiles out with `VideoStage`, which sizes them.
 *
 * @summary A person's video tile: camera or initials, name, mic, talking, hand, reaction and a ⋮ menu.
 */
export declare function ParticipantTile({ name, suffix, video, mirror, fit, muted, speaking, handRaised, handPosition, reaction, connection, badge, pinned, actions, labels, style, className, }: ParticipantTileProps): import("react").JSX.Element;
