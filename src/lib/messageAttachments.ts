/**
 * Default attachment policy for a message composer, and the pure helpers the
 * chat components share. The server stays authoritative: these values only
 * drive the pre-flight hint and client-side validation, so a person gets
 * instant feedback before the network round-trip. Every component that uses
 * them takes the limits as props, so an app with a different policy overrides
 * the defaults rather than editing them.
 */
export const MESSAGE_ATTACHMENT_MIMES: string[] = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

/** Default max size per file, in MB. */
export const MESSAGE_ATTACHMENT_MAX_MB = 25;

/** Default max files per message. */
export const MESSAGE_MAX_ATTACHMENTS = 5;

/**
 * A file size as `812 B`, `1.5 KB` or `2.0 MB`. The number follows `locale`
 * (a comma in German); with none given it follows the reader's browser. The
 * units are the same everywhere.
 */
export function formatFileSize(bytes: number, locale?: string): string {
    const digits = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toLocaleString(locale, digits)} KB`;
    return `${(bytes / 1024 / 1024).toLocaleString(locale, digits)} MB`;
}

/**
 * Whether a MIME type is in the allowed list. `image/*` allows the whole
 * family; an empty list allows everything.
 */
export function matchesMime(type: string, allowed: readonly string[]): boolean {
    if (allowed.length === 0) return true;
    return allowed.some((mime) =>
        mime.endsWith('/*') ? type.startsWith(mime.slice(0, -1)) : mime === type,
    );
}

export type AttachmentProblem = 'too_large' | 'wrong_type';

/** The first reason a file cannot be attached, or `null` when it can. */
export function attachmentProblem(
    file: Pick<File, 'size' | 'type'>,
    limits: { mimes: readonly string[]; maxSizeMb: number },
): AttachmentProblem | null {
    if (file.size > limits.maxSizeMb * 1024 * 1024) return 'too_large';
    if (!matchesMime(file.type, limits.mimes)) return 'wrong_type';
    return null;
}

export interface AddFilesResult {
    /** `current` plus every incoming file that fit. */
    files: File[];
    /** Incoming files that were left out, and why. */
    rejected: { file: File; reason: 'too_large' | 'too_many' }[];
}

/**
 * Adds picked files to the ones already staged, keeping to the size and count
 * limits. Nothing is dropped silently: every file left out is reported.
 */
export function addFiles(
    current: File[],
    incoming: File[],
    limits: { maxFiles: number; maxSizeMb: number },
): AddFilesResult {
    const files = [...current];
    const rejected: AddFilesResult['rejected'] = [];
    for (const file of incoming) {
        if (file.size > limits.maxSizeMb * 1024 * 1024) {
            rejected.push({ file, reason: 'too_large' });
        } else if (files.length >= limits.maxFiles) {
            rejected.push({ file, reason: 'too_many' });
        } else {
            files.push(file);
        }
    }
    return { files, rejected };
}
