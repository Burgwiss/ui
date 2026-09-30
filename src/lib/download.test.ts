import { afterEach, describe, expect, it, vi } from 'vitest';

import { downloadText } from './download';

afterEach(() => vi.restoreAllMocks());

describe('downloadText', () => {
    it('clicks a temporary link to a blob with the file name, then cleans up', async () => {
        vi.useFakeTimers();
        const create = vi.fn(() => 'blob:x');
        const revoke = vi.fn();
        Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
        const clicks: HTMLAnchorElement[] = [];
        vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
            this: HTMLAnchorElement,
        ) {
            clicks.push(this);
        });
        downloadText('a,b', 'kurse.csv');
        expect(clicks).toHaveLength(1);
        expect(clicks[0]!.download).toBe('kurse.csv');
        expect(clicks[0]!.href).toBe('blob:x');
        expect(document.querySelector('a[download]')).toBeNull();
        const blob = (create.mock.calls[0] as unknown as [Blob])[0];
        expect(blob.type).toBe('text/csv;charset=utf-8');
        expect(await blob.text()).toBe('a,b');
        vi.advanceTimersByTime(1000);
        expect(revoke).toHaveBeenCalledWith('blob:x');
        vi.useRealTimers();
    });
});
