import { Check, EllipsisVertical, Hand, MicOff, X } from 'lucide-react';
import { useId, type ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { cn } from '../../lib/cn';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';
import { SearchField } from '../../molecules/SearchField';

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

function Section({ title, level, children }: { title: string; level: 2 | 3; children: ReactNode }) {
    const id = useId();
    const Heading = level === 2 ? 'h2' : 'h3';
    return (
        <section aria-labelledby={id} className="space-y-1">
            <Heading
                id={id}
                className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
                {title}
            </Heading>
            <ul className="space-y-0.5">{children}</ul>
        </section>
    );
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
export function ParticipantList({
    people,
    waiting = [],
    onAdmit,
    onDeny,
    query,
    onQueryChange,
    actions,
    headingLevel = 3,
    labels,
    className,
}: ParticipantListProps) {
    const raised = people
        .filter((p) => p.handPosition !== undefined)
        .sort((a, b) => (a.handPosition ?? 0) - (b.handPosition ?? 0));
    const rest = people.filter((p) => p.handPosition === undefined);

    const row = (p: ParticipantListPerson) => (
        <li
            key={p.id}
            className="group/row flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-accent/60"
        >
            <InitialsAvatar name={p.name} colored size="sm" />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    {p.name}
                    {p.self && (
                        <span className="font-normal text-muted-foreground"> {labels.you}</span>
                    )}
                </p>
                {p.role && (
                    <p
                        className={cn(
                            'truncate text-xs',
                            p.leader ? 'font-medium text-foreground' : 'text-muted-foreground',
                        )}
                    >
                        {p.role}
                    </p>
                )}
            </div>
            {p.handPosition !== undefined && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning px-2 py-0.5 text-xs font-semibold text-warning-foreground tabular-nums">
                    <Hand aria-hidden="true" className="size-3" />
                    <span aria-hidden="true">{p.handPosition}</span>
                    <span className="sr-only">{labels.hand(p.handPosition)}</span>
                </span>
            )}
            {p.muted && (
                <span className="text-muted-foreground">
                    <MicOff aria-hidden="true" className="size-4" />
                    <span className="sr-only">{labels.muted}</span>
                </span>
            )}
            {p.actions && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={labels.actions(p.name)}
                        >
                            <EllipsisVertical aria-hidden="true" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">{p.actions}</DropdownMenuContent>
                </DropdownMenu>
            )}
        </li>
    );

    return (
        <div className={cn('flex flex-col gap-4', className)}>
            {onQueryChange && labels.search && (
                <SearchField
                    value={query ?? ''}
                    onValueChange={onQueryChange}
                    placeholder={labels.search}
                />
            )}
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}

            {waiting.length > 0 && (
                <Section level={headingLevel} title={labels.waiting(waiting.length)}>
                    {waiting.map((w) => (
                        <li
                            key={w.id}
                            className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 py-1"
                        >
                            <InitialsAvatar name={w.name} colored size="sm" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{w.name}</p>
                                {w.detail && (
                                    <p className="truncate text-xs text-muted-foreground">
                                        {w.detail}
                                    </p>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-sm"
                                className="rounded-full"
                                aria-label={labels.deny(w.name)}
                                disabled={w.busy}
                                onClick={() => onDeny?.(w.id)}
                            >
                                <X aria-hidden="true" />
                            </Button>
                            <Button
                                type="button"
                                size="icon-sm"
                                className="rounded-full"
                                aria-label={labels.admit(w.name)}
                                disabled={w.busy}
                                onClick={() => onAdmit?.(w.id)}
                            >
                                <Check aria-hidden="true" />
                            </Button>
                        </li>
                    ))}
                </Section>
            )}

            {raised.length > 0 && (
                <Section level={headingLevel} title={labels.raised(raised.length)}>
                    {raised.map(row)}
                </Section>
            )}

            {(people.length > 0 || Boolean(query)) && (
                <Section level={headingLevel} title={labels.inMeeting(people.length)}>
                    {rest.map(row)}
                    {people.length === 0 && labels.noMatch && (
                        <li className="px-2 py-3 text-sm text-muted-foreground">
                            {labels.noMatch}
                        </li>
                    )}
                </Section>
            )}
        </div>
    );
}
