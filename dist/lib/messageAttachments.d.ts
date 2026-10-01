/**
 * Default attachment policy for a message composer, and the pure helpers the
 * chat components share. The server stays authoritative: these values only
 * drive the pre-flight hint and client-side validation, so a person gets
 * instant feedback before the network round-trip. Every component that uses
 * them takes the limits as props, so an app with a different policy overrides
 * the defaults rather than editing them.
 */
export declare const MESSAGE_ATTACHMENT_MIMES: string[];
/** Default max size per file, in MB. */
export declare const MESSAGE_ATTACHMENT_MAX_MB = 25;
/** Default max files per message. */
export declare const MESSAGE_MAX_ATTACHMENTS = 5;
/**
 * A file size as `812 B`, `1.5 KB` or `2.0 MB`. The number follows `locale`
 * (a comma in German); with none given it follows the reader's browser. The
 * units are the same everywhere.
 */
export declare function formatFileSize(bytes: number, locale?: string): string;
/**
 * Whether a MIME type is in the allowed list. `image/*` allows the whole
 * family; an empty list allows everything.
 */
export declare function matchesMime(type: string, allowed: readonly string[]): boolean;
export type AttachmentProblem = 'too_large' | 'wrong_type';
/** The first reason a file cannot be attached, or `null` when it can. */
export declare function attachmentProblem(file: Pick<File, 'size' | 'type'>, limits: {
    mimes: readonly string[];
    maxSizeMb: number;
}): AttachmentProblem | null;
export interface AddFilesResult {
    /** `current` plus every incoming file that fit. */
    files: File[];
    /** Incoming files that were left out, and why. */
    rejected: {
        file: File;
        reason: 'too_large' | 'too_many';
    }[];
}
/**
 * Adds picked files to the ones already staged, keeping to the size and count
 * limits. Nothing is dropped silently: every file left out is reported.
 */
export declare function addFiles(current: File[], incoming: File[], limits: {
    maxFiles: number;
    maxSizeMb: number;
}): AddFilesResult;
