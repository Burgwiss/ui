import { Check, CircleDashed } from 'lucide-react';
import { useId } from 'react';

import { cn } from '../../lib/cn';

export interface CompletionChecklistItem {
    /** Stable id, passed to `onItemClick`. */
    id: string;
    /** What to fill in, e.g. "Kurzbeschreibung". */
    label: string;
    /** Filled in. */
    done: boolean;
    /** Nice to have: does not count against "complete". */
    optional?: boolean;
}

export interface CompletionChecklistProps {
    /** The things a page should have, in page order. */
    items: CompletionChecklistItem[];
    /** Makes each item a button, e.g. to scroll to and open that part of the page. */
    onItemClick?: (id: string) => void;
    /** All visible text, in the app's language. */
    labels: {
        /** Small heading, e.g. "Seite (DE)". */
        heading: string;
        /** Shown when every required item is done, e.g. "alles Nötige da". */
        complete: string;
        /** Shown while a required item is missing, e.g. "Pflichtangaben fehlen". */
        incomplete: string;
        /** Tag on optional items, e.g. "optional". */
        optional: string;
        /** Screen-reader state of a done item, e.g. "ausgefüllt". */
        done: string;
        /** Screen-reader state of a missing item, e.g. "fehlt". */
        missing: string;
    };
    className?: string;
}

/**
 * How complete a page is: "5 / 7", a bar, and the list of what to fill in —
 * required first-class, optional ones tagged. It answers "can I publish this?"
 * at a glance, for page editors (course page, category page). With
 * `onItemClick` each entry jumps to its part of the page. For a multi-step
 * form use a stepper instead.
 *
 * @summary Page completeness: count, progress bar and a checklist of required and optional parts.
 */
export function CompletionChecklist({
    items,
    onItemClick,
    labels,
    className,
}: CompletionChecklistProps) {
    const headingId = useId();
    const done = items.filter((i) => i.done).length;
    const complete = items.every((i) => i.done || i.optional);
    return (
        <section aria-labelledby={headingId} className={cn('flex flex-col gap-2', className)}>
            <h2 id={headingId} className="text-xs font-medium text-muted-foreground">
                {labels.heading}
            </h2>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums">
                    {done} / {items.length}
                </span>
                <span className="text-xs text-muted-foreground">
                    {complete ? labels.complete : labels.incomplete}
                </span>
            </div>
            <div
                role="progressbar"
                aria-labelledby={headingId}
                aria-valuemin={0}
                aria-valuemax={items.length}
                aria-valuenow={done}
                className="h-1.5 overflow-hidden rounded-full bg-muted"
            >
                <div
                    className="h-full rounded-full bg-success transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }}
                />
            </div>
            <ul className="mt-1 flex flex-col gap-0.5 text-sm">
                {items.map((item) => {
                    const content = (
                        <>
                            {item.done ? (
                                <Check
                                    className="size-4 shrink-0 text-success"
                                    aria-hidden="true"
                                />
                            ) : (
                                <CircleDashed
                                    className="size-4 shrink-0 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            )}
                            <span className={cn('truncate', !item.done && 'text-muted-foreground')}>
                                {item.label}
                            </span>
                            <span className="sr-only">
                                {item.done ? labels.done : labels.missing}
                            </span>
                            {item.optional && (
                                <span className="ms-auto text-xs text-muted-foreground">
                                    {labels.optional}
                                </span>
                            )}
                        </>
                    );
                    return (
                        <li key={item.id}>
                            {onItemClick ? (
                                <button
                                    type="button"
                                    onClick={() => onItemClick(item.id)}
                                    className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-start hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    {content}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 px-1 py-1">{content}</div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
