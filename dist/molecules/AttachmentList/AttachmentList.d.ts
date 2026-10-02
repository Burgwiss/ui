/** Virus-scan result of one attachment: `pending` (still scanning), `clean`, `infected` or `error`. */
export type AttachmentScanStatus = 'pending' | 'clean' | 'infected' | 'error';
export interface AttachmentListItem {
    /** Stable identity: React key and the argument passed to `onDelete`. */
    id: string | number;
    /** File name as shown to the user (truncated when long). */
    name: string;
    /** File size in bytes; formatted by `formatSize`. */
    sizeBytes: number;
    /** MIME type shown next to the size, e.g. `application/pdf`. */
    mime: string;
    /**
     * Virus-scan state. Leave it out when the app does not scan: no status
     * pill is shown and the file can be downloaded. While it is anything but
     * `clean` there is no download link.
     */
    scanStatus?: AttachmentScanStatus;
    /** Target of the download link; only rendered when the file is downloadable (see `scanStatus`). */
    downloadUrl: string;
    /** Shows the remove button (needs `onDelete` too). */
    canDelete?: boolean;
}
export interface AttachmentListLabels {
    /** Shown instead of the list when there are no items. */
    empty: string;
    /** Accessible name of the download link, e.g. `Herunterladen: bericht.pdf`. */
    download: (name: string) => string;
    /** Visible text of the download link, e.g. `Herunterladen`. */
    downloadShort: string;
    /** Name and tooltip of the remove button, e.g. `bericht.pdf entfernen`. */
    remove: (name: string) => string;
    /** Text of the status pill per scan state. Without it no pill is shown. */
    scan?: Record<AttachmentScanStatus, string>;
}
export interface AttachmentListProps {
    /** The attachments, one row each, in the order given. An empty array shows `labels.empty`. */
    items: AttachmentListItem[];
    /** Every visible and announced string; the app supplies them in its own language. */
    labels: AttachmentListLabels;
    /** The remove button was pressed. The app decides how to delete. */
    onDelete?: (id: AttachmentListItem['id']) => void;
    /** Formats a size in bytes. Default: `1.5 KB`, in the reader's number format. */
    formatSize?: (bytes: number) => string;
    /** Extra classes for the outer list (or the empty-state paragraph). */
    className?: string;
}
/**
 * Attachments of a message, one row each: name, size and type, a scan-status
 * pill, a download link and an optional remove button. A file still being
 * scanned (or found infected) has no download link, so nobody mistakes a
 * refused download for a broken one. It only displays existing attachments; to pick new
 * files use `AttachmentDropzone` or `ComposerAttachments`.
 *
 * @summary List of a message's attachments with size, scan status, download link and optional remove button.
 */
export declare function AttachmentList({ items, labels, onDelete, formatSize, className, }: AttachmentListProps): import("react").JSX.Element;
