import { type AttachmentDropzoneLabels } from '../AttachmentDropzone';
export interface ComposerAttachmentsLabels {
    /** Accessible name of the file input. */
    add: string;
    /** Shown in place of the drop area once the limit is reached. */
    maxReached: (max: number) => string;
    /** Accessible name of the list of chosen files. */
    stagedHeading: string;
    /** Accessible name of a file's remove button, e.g. `bericht.pdf entfernen`. */
    remove: (name: string) => string;
    /** Visible text of the remove button, e.g. `Entfernen`. */
    removeShort: string;
    /** Labels for the inner drop area (headline, hint, error messages); see `AttachmentDropzoneLabels`. */
    dropzone: AttachmentDropzoneLabels;
}
export interface ComposerAttachmentsProps {
    /** The chosen files. The parent owns them. */
    files: File[];
    /** Called with the complete new list when a file is added (appended) or removed. */
    onChange: (files: File[]) => void;
    /** Every visible and announced string; the app supplies them in its own language. */
    labels: ComposerAttachmentsLabels;
    /** A server-side error for the files, shown under the drop area. */
    error?: string | null;
    /** Disables the drop area and every remove button, e.g. while the form submits. */
    disabled?: boolean;
    /** Allowed MIME types. Default: documents and images. */
    mimes?: readonly string[];
    /** Largest file, in MB. Default 25. */
    maxSizeMb?: number;
    /** Most files per message. Default 5. */
    maxFiles?: number;
    /** Formats a size in bytes. Default `1.5 KB`, in the reader's number format. */
    formatSize?: (bytes: number) => string;
    /** Extra classes for the outer wrapper. */
    className?: string;
}
/**
 * An attachment picker for a reply form: a drop area, and under it the files
 * chosen so far, each with a remove button. It only collects `File`s in the
 * parent's state — the form submits them. Once `maxFiles` is reached the drop
 * area gives way to a note. To show attachments that already exist on a message
 * use `AttachmentList`; for a single upload field use `AttachmentDropzone`.
 *
 * @summary Multi-file picker for a reply form that keeps chosen files in the parent's state.
 */
export declare function ComposerAttachments({ files, onChange, labels, error, disabled, mimes, maxSizeMb, maxFiles, formatSize, className, }: ComposerAttachmentsProps): import("react").JSX.Element;
