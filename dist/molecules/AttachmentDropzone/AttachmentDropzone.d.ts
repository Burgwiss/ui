import { type ImageAdjustDialogLabels } from '../ImageAdjustDialog';
export interface AttachmentDropzoneLabels {
    /** Headline of the drop area; also the input's accessible name unless `ariaLabel` is set. */
    label: string;
    /** Under the headline, e.g. `Höchstens 25 MB. Erlaubt: application/pdf.` */
    hint: (maxSizeMb: number, mimes: readonly string[]) => string;
    /** Only in `onUpload` mode, while the upload runs. */
    uploading: (name: string) => string;
    /** Only in `onUpload` mode, when `onUpload` throws or rejects. */
    uploadFailed: (name: string) => string;
    /** Only in `onSelect` mode, once a file is chosen. */
    selected: (name: string) => string;
    /** Client-side error when the file exceeds `maxSizeMb`; shown in a `role="alert"` line under the area. */
    errorTooLarge: (name: string, maxSizeMb: number) => string;
    /** Client-side error when the file's type is not in `mimes`; `mimeType` is the browser-reported type or `typeUnknown`. */
    errorType: (name: string, mimeType: string) => string;
    /** Named in `errorType` when the browser reports no type. */
    typeUnknown: string;
}
interface BaseProps {
    /** Every visible and announced string; the app supplies them in its own language. */
    labels: AttachmentDropzoneLabels;
    /** Allowed MIME types; `image/*` allows a family. Empty allows everything. */
    mimes: readonly string[];
    /** Largest file, in MB. */
    maxSizeMb: number;
    /** Accessible name of the file input when the visible label is not enough context. */
    ariaLabel?: string;
    /** Id of the hidden file input, so an outside `<label htmlFor>` can point at it. */
    inputId?: string;
    /** Id the server-side error is given, for `aria-describedby`. */
    ariaDescribedBy?: string;
    /** Sets `required` on the hidden file input, so a surrounding form refuses to submit without a file. */
    required?: boolean;
    /** Dims the area and blocks pointer and keyboard. */
    disabled?: boolean;
    /** An error from the server, shown in addition to the client-side checks. */
    externalError?: string | null;
    /**
     * Offer to shrink a PNG, JPEG or WebP whose longest side is above
     * `maxDimension` before it is used. Without this, size in pixels is not checked.
     */
    imageAdjust?: {
        maxDimension: number;
        labels: ImageAdjustDialogLabels;
    };
}
interface UploadProps extends BaseProps {
    /** The app uploads the file. The area shows `labels.uploading` until this settles. */
    onUpload: (file: File) => void | Promise<void>;
    onSelect?: never;
    selectedFileName?: never;
}
interface SelectProps extends BaseProps {
    /** The app keeps the file and submits it later. */
    onSelect: (file: File) => void;
    /** The name to confirm as chosen. Defaults to the last file picked here. */
    selectedFileName?: string | null;
    onUpload?: never;
}
export type AttachmentDropzoneProps = UploadProps | SelectProps;
/**
 * A drag-and-drop file input for a single file: use it to attach one document or image to a
 * form or upload it straight away; for a message composer that holds several pending
 * attachments use `ComposerAttachments`. The whole area is a real `<label>` around a
 * hidden `<input type="file">`, so keyboard users open the picker with Tab and
 * Enter and no custom key handling is needed.
 *
 * Two modes: `onUpload` (async; shows progress text while awaiting) and
 * `onSelect` (sync; hands the file to a form and confirms the name). The size
 * and type checks here only spare a round-trip — the server has the last word.
 *
 * @summary Drag-and-drop single-file picker that checks size and type, then uploads or hands over the file.
 */
export declare function AttachmentDropzone(props: AttachmentDropzoneProps): import("react").JSX.Element;
export {};
