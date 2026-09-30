import { useRef, useState } from 'react';

import { cn } from '../../lib/cn';
import { attachmentProblem } from '../../lib/messageAttachments';
import { ImageAdjustDialog, type ImageAdjustDialogLabels } from '../ImageAdjustDialog';

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
    imageAdjust?: { maxDimension: number; labels: ImageAdjustDialogLabels };
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

const RASTER_IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp']);

/** Pixel size of a raster image, or `null` when it cannot be read (or takes too long). */
function probeDimensions(file: File): Promise<{ w: number; h: number } | null> {
    if (!RASTER_IMAGE_MIMES.has(file.type) || typeof URL.createObjectURL !== 'function') {
        return Promise.resolve(null);
    }
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        let done = false;
        const finish = (dims: { w: number; h: number } | null) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            URL.revokeObjectURL(url);
            resolve(dims);
        };
        // If neither event ever fires, let the file through rather than stall.
        const timer = setTimeout(() => finish(null), 800);
        img.onload = () => finish({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => finish(null);
        img.src = url;
    });
}

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
export function AttachmentDropzone(props: AttachmentDropzoneProps) {
    const {
        labels,
        mimes,
        maxSizeMb,
        ariaLabel,
        inputId,
        ariaDescribedBy,
        required,
        disabled,
        externalError,
        imageAdjust,
    } = props;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadingName, setUploadingName] = useState<string | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [pendingAdjust, setPendingAdjust] = useState<File | null>(null);

    const validate = (file: File): string | null => {
        switch (attachmentProblem(file, { mimes, maxSizeMb })) {
            case 'too_large':
                return labels.errorTooLarge(file.name, maxSizeMb);
            case 'wrong_type':
                return labels.errorType(file.name, file.type || labels.typeUnknown);
            default:
                return null;
        }
    };

    const hand = async (file: File) => {
        if (props.onSelect) {
            setSelectedName(file.name);
            props.onSelect(file);
            return;
        }
        if (props.onUpload) {
            setUploadingName(file.name);
            try {
                await props.onUpload(file);
            } catch {
                // The app knows why; the person only needs to know it failed.
                setError(labels.uploadFailed(file.name));
            } finally {
                setUploadingName(null);
            }
        }
    };

    const handleFile = async (file: File) => {
        const problem = validate(file);
        if (problem !== null) {
            setError(problem);
            return;
        }
        setError(null);

        if (imageAdjust) {
            const dims = await probeDimensions(file);
            if (dims !== null && Math.max(dims.w, dims.h) > imageAdjust.maxDimension) {
                setPendingAdjust(file);
                return;
            }
        }
        await hand(file);
    };

    const shownSelectedName = props.onSelect
        ? props.selectedFileName !== undefined
            ? props.selectedFileName
            : selectedName
        : null;

    return (
        <div>
            {/* The label is the drop target; the drop is a mouse-only extra on top of the keyboard-reachable input inside it. */}
            <label
                className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-border bg-card px-6 py-8 text-sm text-muted-foreground transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring',
                    disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:border-primary',
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if (disabled) return;
                    const file = e.dataTransfer.files[0];
                    if (file) void handleFile(file);
                }}
            >
                <span className="font-medium text-foreground">{labels.label}</span>
                <span className="text-xs">{labels.hint(maxSizeMb, mimes)}</span>
                <input
                    ref={inputRef}
                    id={inputId}
                    type="file"
                    className="sr-only"
                    aria-label={ariaLabel ?? labels.label}
                    aria-describedby={ariaDescribedBy}
                    aria-invalid={externalError ? true : undefined}
                    required={required}
                    disabled={disabled}
                    // No `accept`: it only filters the OS picker and a drop skips
                    // it, so the check in `validate` is needed regardless — one
                    // source of truth.
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        // Clear the input so picking the same file again (after
                        // removing it) still fires `change`.
                        e.target.value = '';
                        if (file) void handleFile(file);
                    }}
                />
            </label>

            {uploadingName !== null && (
                <p
                    className="mt-2 text-sm text-muted-foreground"
                    data-testid="attachment-uploading"
                >
                    {labels.uploading(uploadingName)}
                </p>
            )}

            {shownSelectedName && uploadingName === null && (
                <p className="mt-2 text-sm text-foreground" data-testid="attachment-selected">
                    {labels.selected(shownSelectedName)}
                </p>
            )}

            {error !== null && (
                <p
                    role="alert"
                    className="mt-2 text-sm text-destructive"
                    data-testid="attachment-error"
                >
                    {error}
                </p>
            )}

            {externalError && error === null && (
                <p
                    id={ariaDescribedBy}
                    role="alert"
                    className="mt-2 text-sm text-destructive"
                    data-testid="attachment-external-error"
                >
                    {externalError}
                </p>
            )}

            {imageAdjust && (
                <ImageAdjustDialog
                    file={pendingAdjust}
                    maxDimension={imageAdjust.maxDimension}
                    labels={imageAdjust.labels}
                    onApply={(resized) => {
                        setPendingAdjust(null);
                        void hand(resized);
                    }}
                    onCancel={() => setPendingAdjust(null)}
                />
            )}
        </div>
    );
}
