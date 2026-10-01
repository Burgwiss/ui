export interface GridFooterProps {
    /** e.g. "1–25 von 120" — already translated by the app. */
    summary: string;
    /** null = no previous page (the button renders disabled). */
    onPrev: (() => void) | null;
    /** Go to the next page; `null` = no next page (the button renders disabled). */
    onNext: (() => void) | null;
    /** Translated strings: `previous` and `next` are the icon buttons' accessible names and tooltips; `pager` names the surrounding `<nav>`. */
    labels: {
        previous: string;
        next: string;
        pager: string;
    };
}
/**
 * The standard grid footer: the count summary on the left, previous/next page buttons on the
 * right. It is a fragment, so place it inside your own flex row (see the story decorator).
 * Use it under a data grid or table that pages on the server; it shows no page numbers.
 *
 * @summary Grid footer with a count summary and previous/next page buttons.
 */
export declare function GridFooter({ summary, onPrev, onNext, labels }: GridFooterProps): import("react").JSX.Element;
