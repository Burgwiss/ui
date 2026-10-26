import { EllipsisVertical, Hand, MicOff, Pin } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { cn } from '../../lib/cn';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';

/** Three signal bars, `lit` of them filled — reads at 12px, unlike a one-bar icon. */
function SignalBars({ lit }: { lit: number }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3.5">
            {[0, 1, 2].map((i) => (
                <rect
                    key={i}
                    x={1 + i * 4}
                    y={8 - i * 3}
                    width="2.5"
                    height={3 + i * 3}
                    rx="0.75"
                    fill="currentColor"
                    opacity={i < lit ? 1 : 0.3}
                />
            ))}
        </svg>
    );
}

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
    connection?: { fair: string; poor: string };
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
export function ParticipantTile({
    name,
    suffix,
    video,
    mirror = false,
    fit = 'cover',
    muted,
    speaking = false,
    handRaised = false,
    handPosition,
    reaction,
    connection,
    badge,
    pinned = false,
    actions,
    labels,
    style,
    className,
}: ParticipantTileProps) {
    const hasVideo = Boolean(video);
    const weak = connection === 'fair' || connection === 'poor';
    return (
        <figure
            style={style}
            data-speaking={speaking || undefined}
            data-hand={handRaised || undefined}
            className={cn(
                'group/tile @container relative isolate m-0 overflow-hidden rounded-xl bg-muted',
                'ring-2 ring-transparent ring-offset-2 ring-offset-background transition-shadow duration-150',
                speaking && 'ring-success',
                handRaised && 'ring-warning',
                className,
            )}
        >
            {hasVideo ? (
                <div
                    className={cn(
                        'absolute inset-0 bg-video-surface',
                        '[&>*]:size-full',
                        fit === 'cover' ? '[&>*]:object-cover' : '[&>*]:object-contain',
                        mirror && '[&>*]:-scale-x-100',
                    )}
                >
                    {video}
                </div>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-b from-muted to-secondary">
                    <InitialsAvatar
                        name={name}
                        colored
                        size="lg"
                        className={cn(
                            '@[14rem]:size-16 @[14rem]:text-xl @[24rem]:size-24 @[24rem]:text-3xl',
                            speaking && 'ring-4 ring-success/40',
                        )}
                    />
                </div>
            )}

            {/* Top: hand at the start, reaction and menu at the end. */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
                <div className="flex min-w-0 items-center gap-1">
                    {handRaised && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning px-2 py-1 text-xs font-semibold text-warning-foreground shadow-sm">
                            <Hand aria-hidden="true" className="size-3.5" />
                            {handPosition !== undefined && (
                                <span aria-hidden="true" className="tabular-nums">
                                    {handPosition}
                                </span>
                            )}
                            <span className="sr-only">{labels.handRaised(handPosition)}</span>
                        </span>
                    )}
                    {pinned && labels.pinned && (
                        <span className="inline-flex items-center rounded-full bg-video-scrim p-1.5 text-video-foreground">
                            <Pin aria-hidden="true" className="size-3.5" />
                            <span className="sr-only">{labels.pinned}</span>
                        </span>
                    )}
                </div>
                <div className="flex items-start gap-1">
                    {reaction && (
                        <span
                            key={reaction.key}
                            role="img"
                            aria-label={reaction.label}
                            className="flex size-11 animate-in items-center justify-center rounded-full bg-background/90 text-2xl shadow-md duration-300 zoom-in-50 fade-in motion-reduce:animate-none"
                        >
                            {reaction.emoji}
                        </span>
                    )}
                    {actions && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    aria-label={labels.actions(name)}
                                    className={cn(
                                        'pointer-events-auto rounded-full bg-background/90 shadow-sm',
                                        'opacity-0 transition-opacity group-focus-within/tile:opacity-100 group-hover/tile:opacity-100',
                                        'focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100',
                                    )}
                                >
                                    <EllipsisVertical aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">{actions}</DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Bottom: the name chip. */}
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end p-2">
                <span
                    className={cn(
                        'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium',
                        hasVideo
                            ? 'bg-video-scrim text-video-foreground'
                            : 'bg-background/85 text-foreground shadow-xs',
                    )}
                >
                    {muted && (
                        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-destructive p-0.5 text-destructive-foreground">
                            <MicOff aria-hidden="true" className="size-3" />
                        </span>
                    )}
                    <span className="truncate">
                        {name}
                        {suffix && <span className="font-normal opacity-80"> {suffix}</span>}
                    </span>
                    {muted && <span className="sr-only">, {labels.muted}</span>}
                    {badge && (
                        <span
                            className={cn(
                                'shrink-0 rounded px-1 text-[0.6875rem] font-semibold tracking-wide uppercase',
                                hasVideo
                                    ? 'bg-video-foreground/15'
                                    : 'bg-muted text-muted-foreground',
                            )}
                        >
                            {badge}
                        </span>
                    )}
                    {weak && labels.connection && (
                        <span
                            className={cn(
                                'shrink-0',
                                connection === 'poor' &&
                                    !hasVideo &&
                                    'text-destructive-tint-foreground',
                            )}
                        >
                            <SignalBars lit={connection === 'poor' ? 1 : 2} />
                            <span className="sr-only">, {labels.connection[connection]}</span>
                        </span>
                    )}
                </span>
            </figcaption>
        </figure>
    );
}
