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
export declare function CompletionChecklist({ items, onItemClick, labels, className, }: CompletionChecklistProps): import("react").JSX.Element;
