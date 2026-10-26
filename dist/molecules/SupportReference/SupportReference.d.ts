export interface SupportReferenceLabels {
    /** Shown before the id, e.g. "Vorgangs-ID". */
    prefix: string;
    /** The copy button's name, e.g. "Vorgangs-ID kopieren". */
    copy: string;
    /** Announced after copying, e.g. "Kopiert". */
    copied: string;
}
export interface SupportReferenceProps {
    /** The id support can look the failure up by. */
    id: string;
    labels: SupportReferenceLabels;
    className?: string;
}
/**
 * The line under an error that support needs: "Vorgangs-ID: 7f3c…" with a copy button.
 * Put it inside an `Alert` whenever a failure has an id on the server, so a person who
 * writes to support can paste exactly the case — instead of describing a screenshot.
 *
 * @summary An error's support id with a copy button, for inside an Alert.
 */
export declare function SupportReference({ id, labels, className }: SupportReferenceProps): import("react").JSX.Element;
