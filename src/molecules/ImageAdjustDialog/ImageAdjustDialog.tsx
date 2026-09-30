import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../Dialog';

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

const SCALABLE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MIN_DIMENSION = 64;

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
export function ImageAdjustDialog({
    file,
    maxDimension,
    onApply,
    onCancel,
    labels,
}: ImageAdjustDialogProps) {
    return (
        <Dialog
            open={file !== null}
            onOpenChange={(next) => {
                if (!next) onCancel();
            }}
        >
            <DialogContent className="max-w-2xl" closeLabel={labels.close}>
                <DialogHeader>
                    <DialogTitle>{labels.title}</DialogTitle>
                    <DialogDescription>{labels.description(maxDimension)}</DialogDescription>
                </DialogHeader>
                {/* Keyed on the file so every new file starts from fresh state. */}
                {file !== null && (
                    <AdjustBody
                        key={`${file.name}:${file.size}:${file.lastModified}`}
                        file={file}
                        maxDimension={maxDimension}
                        onApply={onApply}
                        onCancel={onCancel}
                        labels={labels}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function AdjustBody({
    file,
    maxDimension,
    onApply,
    onCancel,
    labels,
}: Omit<ImageAdjustDialogProps, 'file'> & { file: File }) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
    // What is typed in the size field. Kept as text so it can be emptied and
    // retyped; the size used is derived from it below.
    const [sizeText, setSizeText] = useState<string>(String(maxDimension));
    const [quality, setQuality] = useState<number>(0.9);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    const isScalable = SCALABLE_MIMES.has(file.type);
    const typed = Number.parseInt(sizeText, 10);
    const targetMax =
        Number.isFinite(typed) && typed > 0
            ? Math.min(maxDimension, Math.max(MIN_DIMENSION, typed))
            : maxDimension;

    // An object URL is a resource that must be released, so it is created in
    // an effect and revoked in its cleanup — not derived during render.
    useEffect(() => {
        // A webview without object URLs simply gets no preview.
        if (typeof URL.createObjectURL !== 'function') return;
        const url = URL.createObjectURL(file);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL only exists after mount
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const scaledDims = useMemo(() => {
        if (natural === null) return null;
        const longest = Math.max(natural.w, natural.h);
        if (longest <= targetMax) return { w: natural.w, h: natural.h };
        const scale = targetMax / longest;
        return { w: Math.round(natural.w * scale), h: Math.round(natural.h * scale) };
    }, [natural, targetMax]);

    const apply = async () => {
        if (imgRef.current === null || scaledDims === null) return;
        setProcessing(true);
        setError(null);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = scaledDims.w;
            canvas.height = scaledDims.h;
            const ctx = canvas.getContext('2d');
            if (ctx === null) throw new Error('canvas-2d-unsupported');
            ctx.drawImage(imgRef.current, 0, 0, scaledDims.w, scaledDims.h);

            // PNG is lossless, so it takes no quality argument.
            const blob: Blob | null = await new Promise((resolve) =>
                canvas.toBlob(resolve, file.type, file.type === 'image/png' ? undefined : quality),
            );
            if (blob === null) throw new Error('canvas-to-blob-empty');
            onApply(new File([blob], file.name, { type: file.type, lastModified: Date.now() }));
        } catch (e) {
            setError(labels.error(e instanceof Error ? e.message : 'unknown'));
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <div className="space-y-4">
                {previewUrl !== null && (
                    <div className="flex justify-center rounded-md border border-border bg-muted/30 p-2">
                        <img
                            ref={imgRef}
                            src={previewUrl}
                            alt={labels.previewAlt}
                            onLoad={(e) =>
                                setNatural({
                                    w: e.currentTarget.naturalWidth,
                                    h: e.currentTarget.naturalHeight,
                                })
                            }
                            className="max-h-64 w-auto object-contain"
                        />
                    </div>
                )}

                {natural !== null && (
                    <p className="text-xs text-muted-foreground" data-testid="image-adjust-dims">
                        {labels.currentDimensions(natural.w, natural.h)}
                        {scaledDims !== null && (
                            <>
                                {' → '}
                                <span className="font-medium text-foreground">
                                    {labels.targetDimensions(scaledDims.w, scaledDims.h)}
                                </span>
                            </>
                        )}
                    </p>
                )}

                {isScalable ? (
                    <>
                        <div className="space-y-1">
                            <Label htmlFor="image-adjust-max">{labels.maxDimensionLabel}</Label>
                            <Input
                                id="image-adjust-max"
                                type="number"
                                min={MIN_DIMENSION}
                                max={maxDimension}
                                step={64}
                                value={sizeText}
                                onChange={(e) => setSizeText(e.target.value)}
                                // Show the size actually used once the person is done typing.
                                onBlur={() => setSizeText(String(targetMax))}
                            />
                        </div>

                        {file.type !== 'image/png' && (
                            <div className="space-y-1">
                                <Label htmlFor="image-adjust-quality">
                                    {labels.qualityLabel(Math.round(quality * 100))}
                                </Label>
                                <input
                                    id="image-adjust-quality"
                                    type="range"
                                    min={0.5}
                                    max={1}
                                    step={0.05}
                                    value={quality}
                                    onChange={(e) => setQuality(Number.parseFloat(e.target.value))}
                                    className="w-full accent-primary"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <p className="text-xs text-muted-foreground">{labels.notScalable(file.type)}</p>
                )}

                {error !== null && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    {labels.cancel}
                </Button>
                <Button
                    type="button"
                    onClick={() => {
                        void apply();
                    }}
                    disabled={processing || !isScalable || scaledDims === null}
                    tooltip={!isScalable ? labels.notScalable(file.type) : undefined}
                >
                    {labels.apply}
                </Button>
            </DialogFooter>
        </>
    );
}
