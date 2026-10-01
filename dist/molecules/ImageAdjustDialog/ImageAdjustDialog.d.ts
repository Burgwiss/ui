export interface ImageAdjustDialogLabels {
    /** Dialog heading, e.g. `Bild verkleinern`. */
    title: string;
    /** Explanation under the heading; receives the allowed longest side in px. */
    description: (maxDimension: number) => string;
    /** Alt text of the preview image. */
    previewAlt: string;
    /** `Aktuell: 4000 × 3000 px` */
    currentDimensions: (width: number, height: number) => string;
    /** `Neu: 2048 × 1536 px` */
    targetDimensions: (width: number, height: number) => string;
    /** Visible label of the size field (the longest side, in px). */
    maxDimensionLabel: string;
    /** `Qualität: 90 %` */
    qualityLabel: (percent: number) => string;
    /** Shown for a type that cannot be scaled here (GIF, PDF, …). */
    notScalable: (mimeType: string) => string;
    /** Shown when resizing failed. `reason` is a technical code, for logs rather than people. */
    error: (reason: string) => string;
    /** Text of the button that closes the dialog without a result. */
    cancel: string;
    /** Text of the button that hands the resized file to `onApply`. */
    apply: string;
    /** Accessible name of the dialog's corner close button. */
    close: string;
}
export interface ImageAdjustDialogProps {
    /** The dialog is open while this is a file. */
    file: File | null;
    /** The longest side a picture may have, in px. */
    maxDimension: number;
    /** The resized file, when the person presses Apply. */
    onApply: (file: File) => void;
    /** Cancel, Escape or the close button. */
    onCancel: () => void;
    /** Every visible and announced string; the app supplies them in its own language. */
    labels: ImageAdjustDialogLabels;
}
/**
 * Lets a person shrink a picture that is too big before it is attached: shows
 * it, the current and the new size, a size field and (for JPEG and WebP) a
 * quality slider, and hands back the resized file. The resizing happens in the
 * browser, on a canvas. It is a controlled dialog: open it by passing a `file`, close it
 * from `onApply` or `onCancel`. Only PNG, JPEG and WebP can be scaled; other types show a
 * note and disable Apply. `AttachmentDropzone` opens it for you through its `imageAdjust` prop.
 *
 * @summary Modal that previews an oversized image and returns a version resized in the browser.
 */
export declare function ImageAdjustDialog({ file, maxDimension, onApply, onCancel, labels, }: ImageAdjustDialogProps): import("react").JSX.Element;
