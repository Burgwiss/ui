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
export declare function AdmissionRequests({ requests, onAdmit, onDeny, labels, max, onShowAll, className, }: AdmissionRequestsProps): import("react").JSX.Element | null;
