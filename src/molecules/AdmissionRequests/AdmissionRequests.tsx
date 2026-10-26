import { Check, DoorOpen, X } from 'lucide-react';
import { useId, useRef } from 'react';

import { Button } from '../../atoms/Button';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { cn } from '../../lib/cn';

export interface AdmissionRequest {
    id: string;
    name: string;
    /** A second line, e.g. "wartet seit 2 Min." */
    detail?: string;
    /** A decision for this person is being sent: both buttons wait. */
    busy?: boolean;
}

export interface AdmissionRequestsLabels {
    /** Heading, e.g. "Gäste klopfen an". */
    title: string;
    admit: (name: string) => string;
    deny: (name: string) => string;
    /** One line under the heading, e.g. "Häkchen: zulassen. Kreuz: ablehnen." */
    hint?: string;
    /** Shown once there are more requests than `max`: "und 3 weitere". */
    more?: (count: number) => string;
    /** Opens the full list (when `onShowAll` is given): "Alle anzeigen". */
    showAll?: string;
}

export interface AdmissionRequestsProps {
    /** The people waiting, oldest first. Renders nothing when empty. */
    requests: AdmissionRequest[];
    onAdmit: (id: string) => void;
    onDeny: (id: string) => void;
    labels: AdmissionRequestsLabels;
    /** Most requests shown before "and N more". Default 3. */
    max?: number;
    /** Opens the full waiting list (in the participants panel). */
    onShowAll?: () => void;
    className?: string;
}

/**
 * The card a host sees when someone knocks: who is waiting, with a tick to let them in
 * and a cross to turn them away — no dialog, one click. It floats over the stage (put it
 * in `MeetingRoom`'s `overlay`) and disappears when nobody waits. Newly arriving names are
 * announced politely to screen readers.
 *
 * After a decision, focus moves to the next person's tick, so a host working through a
 * queue with the keyboard never loses their place.
 *
 * @summary Floating card of knocking guests with one-click admit and deny.
 */
export function AdmissionRequests({
    requests,
    onAdmit,
    onDeny,
    labels,
    max = 3,
    onShowAll,
    className,
}: AdmissionRequestsProps) {
    const list = useRef<HTMLUListElement>(null);
    const titleId = useId();
    if (requests.length === 0) return null;
    const shown = requests.slice(0, max);
    const hidden = requests.length - shown.length;

    const decide = (fn: (id: string) => void, id: string, index: number) => {
        fn(id);
        // Keep the keyboard in the queue: the next row's admit button, or the previous one.
        requestAnimationFrame(() => {
            const buttons = list.current?.querySelectorAll<HTMLButtonElement>('[data-admit]');
            const next = buttons?.[Math.min(index, (buttons?.length ?? 1) - 1)];
            next?.focus();
        });
    };

    return (
        <section
            aria-labelledby={titleId}
            className={cn(
                'w-full max-w-sm rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg',
                className,
            )}
        >
            <div className="flex items-start gap-2">
                <DoorOpen
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
                <div className="min-w-0">
                    <h2 id={titleId} className="text-sm font-semibold">
                        {labels.title}
                    </h2>
                    {labels.hint && <p className="text-xs text-muted-foreground">{labels.hint}</p>}
                </div>
            </div>
            <ul ref={list} aria-live="polite" className="mt-2 space-y-1">
                {shown.map((r, index) => (
                    <li key={r.id} className="flex items-center gap-2 rounded-lg px-1 py-1">
                        <InitialsAvatar name={r.name} colored size="sm" />
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{r.name}</p>
                            {r.detail && (
                                <p className="truncate text-xs text-muted-foreground">{r.detail}</p>
                            )}
                        </div>
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            aria-label={labels.deny(r.name)}
                            disabled={r.busy}
                            onClick={() => decide(onDeny, r.id, index)}
                            className="rounded-full"
                        >
                            <X aria-hidden="true" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            aria-label={labels.admit(r.name)}
                            disabled={r.busy}
                            data-admit=""
                            onClick={() => decide(onAdmit, r.id, index)}
                            className="rounded-full"
                        >
                            <Check aria-hidden="true" />
                        </Button>
                    </li>
                ))}
            </ul>
            {(hidden > 0 || onShowAll) && (
                <div className="mt-1 flex items-center justify-between gap-2 ps-1">
                    {hidden > 0 && labels.more && (
                        <p className="text-xs text-muted-foreground">{labels.more(hidden)}</p>
                    )}
                    {onShowAll && labels.showAll && (
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            className="ms-auto"
                            onClick={onShowAll}
                        >
                            {labels.showAll}
                        </Button>
                    )}
                </div>
            )}
        </section>
    );
}
