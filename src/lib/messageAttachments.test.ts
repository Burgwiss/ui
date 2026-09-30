import { describe, expect, it } from 'vitest';

import {
    addFiles,
    attachmentProblem,
    formatFileSize,
    matchesMime,
    MESSAGE_ATTACHMENT_MAX_MB,
    MESSAGE_ATTACHMENT_MIMES,
    MESSAGE_MAX_ATTACHMENTS,
} from './messageAttachments';

const file = (name: string, size = 10, type = 'application/pdf') =>
    new File([new Uint8Array(size)], name, { type });

describe('defaults', () => {
    it('allows documents and images, 25 MB, five files', () => {
        expect(MESSAGE_ATTACHMENT_MIMES).toContain('application/pdf');
        expect(MESSAGE_ATTACHMENT_MIMES).toContain('image/png');
        expect(MESSAGE_ATTACHMENT_MIMES).not.toContain('application/x-msdownload');
        expect(MESSAGE_ATTACHMENT_MAX_MB).toBe(25);
        expect(MESSAGE_MAX_ATTACHMENTS).toBe(5);
    });
});

describe('formatFileSize', () => {
    it('uses bytes below a kilobyte', () => {
        expect(formatFileSize(0, 'en')).toBe('0 B');
        expect(formatFileSize(1023, 'en')).toBe('1023 B');
    });

    it('switches to KB at 1024 and MB at 1024 * 1024', () => {
        expect(formatFileSize(1024, 'en')).toBe('1.0 KB');
        expect(formatFileSize(1024 * 1024 - 1, 'en')).toBe('1,024.0 KB');
        expect(formatFileSize(1024 * 1024, 'en')).toBe('1.0 MB');
        expect(formatFileSize(2.5 * 1024 * 1024, 'en')).toBe('2.5 MB');
    });

    it('follows the locale for the decimal separator', () => {
        expect(formatFileSize(1536, 'de')).toBe('1,5 KB');
    });
});

describe('matchesMime', () => {
    it('matches an exact type only', () => {
        expect(matchesMime('application/pdf', ['application/pdf'])).toBe(true);
        expect(matchesMime('application/pdfx', ['application/pdf'])).toBe(false);
        expect(matchesMime('', ['application/pdf'])).toBe(false);
    });

    it('lets a wildcard allow the whole family, and only that family', () => {
        expect(matchesMime('image/png', ['image/*'])).toBe(true);
        expect(matchesMime('imagex/png', ['image/*'])).toBe(false);
        expect(matchesMime('video/mp4', ['image/*'])).toBe(false);
    });

    it('allows everything when the list is empty', () => {
        expect(matchesMime('anything/at-all', [])).toBe(true);
        expect(matchesMime('', [])).toBe(true);
    });
});

describe('attachmentProblem', () => {
    const limits = { mimes: ['application/pdf'], maxSizeMb: 1 };

    it('accepts a file within the limits, including exactly the size cap', () => {
        expect(attachmentProblem(file('a.pdf', 1024 * 1024), limits)).toBeNull();
    });

    it('rejects a file one byte over the cap', () => {
        expect(attachmentProblem(file('a.pdf', 1024 * 1024 + 1), limits)).toBe('too_large');
    });

    it('rejects a disallowed type', () => {
        expect(attachmentProblem(file('a.exe', 10, 'application/x-msdownload'), limits)).toBe(
            'wrong_type',
        );
    });

    it('reports size before type when both are wrong', () => {
        expect(attachmentProblem(file('a.exe', 2 * 1024 * 1024, 'text/x-foo'), limits)).toBe(
            'too_large',
        );
    });
});

describe('addFiles', () => {
    const limits = { maxFiles: 3, maxSizeMb: 1 };

    it('appends after what is already staged', () => {
        const a = file('a.pdf');
        const b = file('b.pdf');
        const result = addFiles([a], [b], limits);
        expect(result.files).toEqual([a, b]);
        expect(result.rejected).toEqual([]);
    });

    it('does not mutate the staged list', () => {
        const staged = [file('a.pdf')];
        addFiles(staged, [file('b.pdf')], limits);
        expect(staged).toHaveLength(1);
    });

    it('reports an oversize file instead of dropping it silently', () => {
        const big = file('big.pdf', 2 * 1024 * 1024);
        const result = addFiles([], [big], limits);
        expect(result.files).toEqual([]);
        expect(result.rejected).toEqual([{ file: big, reason: 'too_large' }]);
    });

    it('stops at the file cap and reports the overflow', () => {
        const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((n) => file(`${n}.pdf`)) as [
            File,
            File,
            File,
            File,
        ];
        const result = addFiles([a], [b, c, d], limits);
        expect(result.files).toEqual([a, b, c]);
        expect(result.rejected).toEqual([{ file: d, reason: 'too_many' }]);
    });

    it('rejects everything when already at the cap', () => {
        const staged = [file('a.pdf'), file('b.pdf'), file('c.pdf')];
        const extra = file('d.pdf');
        const result = addFiles(staged, [extra], limits);
        expect(result.files).toHaveLength(3);
        expect(result.rejected).toEqual([{ file: extra, reason: 'too_many' }]);
    });

    it('keeps a good file when a bad one comes with it', () => {
        const ok = file('ok.pdf');
        const big = file('big.pdf', 2 * 1024 * 1024);
        const result = addFiles([], [big, ok], limits);
        expect(result.files).toEqual([ok]);
        expect(result.rejected).toHaveLength(1);
    });
});
