import { X } from 'lucide-react';

import { Badge, type BadgeTone } from '../../atoms/Badge';
import { IconButton } from '../../atoms/IconButton';
import { cn } from '../../lib/cn';
import { formatFileSize } from '../../lib/messageAttachments';

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

const STATUS_TONE: Record<AttachmentScanStatus, BadgeTone> = {
    pending: 'muted',
    clean: 'success',
    infected: 'destructive',
    error: 'destructive',
};

/**
 * Attachments of a message, one row each: name, size and type, a scan-status
 * pill, a download link and an optional remove button. A file still being
 * scanned (or found infected) has no download link, so nobody mistakes a
 * refused download for a broken one. It only displays existing attachments; to pick new
 * files use `AttachmentDropzone` or `ComposerAttachments`.
 *
 * @summary List of a message's attachments with size, scan status, download link and optional remove button.
 */
export function AttachmentList({
    items,
    labels,
    onDelete,
    formatSize = formatFileSize,
    className,
}: AttachmentListProps) {
    if (items.length === 0) {
        return (
            <p
                className={cn(
                    'rounded-md border border-dashed border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground',
                    className,
                )}
            >
                {labels.empty}
            </p>
        );
    }

    return (
        <ul
            className={cn(
                'divide-y divide-border rounded-md border border-border bg-card text-card-foreground',
                className,
            )}
        >
            {items.map((item) => {
                const status = item.scanStatus;
                const downloadable = status === undefined || status === 'clean';
                return (
                    // Stacked on phones (the file name gets the full width and
                    // truncates cleanly), horizontal from `sm` — keeps a long
                    // "Herunterladen" and the status pill inside a narrow bubble.
                    <li
                        key={item.id}
                        className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4"
                    >
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                                {item.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {formatSize(item.sizeBytes)} · {item.mime}
                            </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
                            {status !== undefined && labels.scan ? (
                                <Badge
                                    tone={STATUS_TONE[status]}
                                    className="shrink-0"
                                    data-testid={`attachment-status-${status}`}
                                >
                                    {labels.scan[status]}
                                </Badge>
                            ) : null}

                            {downloadable ? (
                                <a
                                    href={item.downloadUrl}
                                    aria-label={labels.download(item.name)}
                                    className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-foreground underline underline-offset-2 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                >
                                    {labels.downloadShort}
                                </a>
                            ) : null}

                            {item.canDelete && onDelete ? (
                                <IconButton
                                    label={labels.remove(item.name)}
                                    icon={<X className="size-4" aria-hidden="true" />}
                                    destructive
                                    className="shrink-0"
                                    onClick={() => onDelete(item.id)}
                                />
                            ) : null}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
