import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AttachmentDropzone, type AttachmentDropzoneLabels } from './AttachmentDropzone';
import type { ImageAdjustDialogLabels } from '../ImageAdjustDialog';

const labels: AttachmentDropzoneLabels = {
    label: 'Drop files here, or click to browse',
    hint: (max, mimes) => `Max ${max} MB. Allowed: ${mimes.join(', ')}.`,
    uploading: (name) => `Uploading ${name}…`,
    uploadFailed: (name) => `Could not upload ${name}.`,
    selected: (name) => `Selected: ${name}`,
    errorTooLarge: (name, max) => `${name} is larger than ${max} MB.`,
    errorType: (name, type) => `${name} has a disallowed type (${type}).`,
    typeUnknown: 'unknown',
};

const adjustLabels: ImageAdjustDialogLabels = {
    title: 'Shrink image',
    description: (max) => `At most ${max} px`,
    previewAlt: 'Preview',
    currentDimensions: (w, h) => `${w}x${h}`,
    targetDimensions: (w, h) => `${w}x${h}`,
    maxDimensionLabel: 'Longest side',
    qualityLabel: (p) => `${p}%`,
    notScalable: (t) => t,
    error: (r) => r,
    cancel: 'Cancel',
    apply: 'Apply',
    close: 'Close',
};

const pdf = (name = 'paper.pdf') => new File(['fake'], name, { type: 'application/pdf' });
const input = () => screen.getByLabelText(labels.label) as HTMLInputElement;

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe('AttachmentDropzone', () => {
    it('names the input and shows the size and type hint', () => {
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={['application/pdf']}
                maxSizeMb={25}
                onUpload={vi.fn()}
            />,
        );
        expect(input()).toHaveAttribute('type', 'file');
        expect(screen.getByText('Max 25 MB. Allowed: application/pdf.')).toBeInTheDocument();
    });

    it('lets an explicit aria-label replace the visible label as the name', () => {
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={[]}
                maxSizeMb={1}
                onSelect={vi.fn()}
                ariaLabel="Add attachment"
                inputId="att"
            />,
        );
        const field = screen.getByLabelText('Add attachment');
        expect(field).toHaveAttribute('id', 'att');
    });

    it('calls onUpload with a valid file', async () => {
        const onUpload = vi.fn();
        const file = pdf();
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={['application/pdf']}
                maxSizeMb={25}
                onUpload={onUpload}
            />,
        );
        await userEvent.upload(input(), file);
        await waitFor(() => expect(onUpload).toHaveBeenCalledExactlyOnceWith(file));
    });

    it('shows the progress text while an upload runs, then removes it', async () => {
        let finish!: () => void;
        const onUpload = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={['application/pdf']}
                maxSizeMb={25}
                onUpload={onUpload}
            />,
        );
        await userEvent.upload(input(), pdf());
        expect(await screen.findByTestId('attachment-uploading')).toHaveTextContent(
            'Uploading paper.pdf…',
        );
        finish();
        await waitFor(() => expect(screen.queryByTestId('attachment-uploading')).toBeNull());
    });

    it('ends the progress state and shows an error when the upload rejects', async () => {
        let fail!: (e: Error) => void;
        const onUpload = vi.fn(() => new Promise<void>((_, reject) => (fail = reject)));
        render(
            <AttachmentDropzone labels={labels} mimes={[]} maxSizeMb={25} onUpload={onUpload} />,
        );
        await userEvent.upload(input(), pdf());
        await screen.findByTestId('attachment-uploading');
        fail(new Error('boom'));
        expect(await screen.findByTestId('attachment-error')).toHaveTextContent(
            'Could not upload paper.pdf.',
        );
        expect(screen.queryByTestId('attachment-uploading')).toBeNull();
    });

    it('in select mode hands the file over and confirms the name', async () => {
        const onSelect = vi.fn();
        const file = pdf();
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={['application/pdf']}
                maxSizeMb={25}
                onSelect={onSelect}
            />,
        );
        await userEvent.upload(input(), file);
        expect(onSelect).toHaveBeenCalledExactlyOnceWith(file);
        expect(screen.getByTestId('attachment-selected')).toHaveTextContent('Selected: paper.pdf');
    });

    it('prefers selectedFileName from the parent over its own memory', async () => {
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={[]}
                maxSizeMb={25}
                onSelect={vi.fn()}
                selectedFileName="parent.pdf"
            />,
        );
        await userEvent.upload(input(), pdf());
        expect(screen.getByTestId('attachment-selected')).toHaveTextContent('parent.pdf');
    });

    it('rejects a file over the size limit and does not hand it over', async () => {
        const onUpload = vi.fn();
        const huge = new File([new Uint8Array(2 * 1024 * 1024)], 'huge.pdf', {
            type: 'application/pdf',
        });
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={['application/pdf']}
                maxSizeMb={1}
                onUpload={onUpload}
            />,
        );
        await userEvent.upload(input(), huge);
        expect(screen.getByTestId('attachment-error')).toHaveTextContent(
            'huge.pdf is larger than 1 MB.',
        );
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(onUpload).not.toHaveBeenCalled();
    });

    it('rejects a disallowed type and names it', async () => {
        const onUpload = vi.fn();
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={['application/pdf']}
                maxSizeMb={25}
                onUpload={onUpload}
            />,
        );
        // `applyAccept: false`: the component has no `accept`, and a drop skips it anyway.
        await userEvent
            .setup({ applyAccept: false })
            .upload(input(), new File(['bad'], 'evil.exe', { type: 'application/x-msdownload' }));
        expect(screen.getByTestId('attachment-error')).toHaveTextContent(
            'evil.exe has a disallowed type (application/x-msdownload).',
        );
        expect(onUpload).not.toHaveBeenCalled();
    });

    it('names an unknown type with the unknown label', async () => {
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={['application/pdf']}
                maxSizeMb={25}
                onUpload={vi.fn()}
            />,
        );
        await userEvent.upload(input(), new File(['x'], 'mystery', { type: '' }));
        expect(screen.getByTestId('attachment-error')).toHaveTextContent('(unknown)');
    });

    it('clears an earlier error once a valid file is picked', async () => {
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={['application/pdf']}
                maxSizeMb={25}
                onSelect={vi.fn()}
            />,
        );
        await userEvent.upload(input(), new File(['x'], 'a.txt', { type: 'text/plain' }));
        expect(screen.getByTestId('attachment-error')).toBeInTheDocument();
        await userEvent.upload(input(), pdf());
        expect(screen.queryByTestId('attachment-error')).toBeNull();
    });

    it('lets the same file be picked twice in a row (the input is cleared after each pick)', async () => {
        const onSelect = vi.fn();
        const file = pdf();
        render(
            <AttachmentDropzone labels={labels} mimes={[]} maxSizeMb={25} onSelect={onSelect} />,
        );
        fireEvent.change(input(), { target: { files: [file] } });
        expect(input().value).toBe('');
        fireEvent.change(input(), { target: { files: [file] } });
        expect(onSelect).toHaveBeenCalledTimes(2);
    });

    it('accepts a dropped file, and ignores a drop while disabled', () => {
        const onSelect = vi.fn();
        const { rerender } = render(
            <AttachmentDropzone labels={labels} mimes={[]} maxSizeMb={25} onSelect={onSelect} />,
        );
        const area = input().closest('label') as HTMLElement;
        fireEvent.drop(area, { dataTransfer: { files: [pdf('dropped.pdf')] } });
        expect(onSelect).toHaveBeenCalledTimes(1);

        rerender(
            <AttachmentDropzone
                labels={labels}
                mimes={[]}
                maxSizeMb={25}
                onSelect={onSelect}
                disabled
            />,
        );
        fireEvent.drop(area, { dataTransfer: { files: [pdf('again.pdf')] } });
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(input()).toBeDisabled();
    });

    it('shows a server error, marks the input invalid, and lets a local error take over', async () => {
        render(
            <AttachmentDropzone
                labels={labels}
                mimes={['application/pdf']}
                maxSizeMb={25}
                onSelect={vi.fn()}
                externalError="Storage is full."
                ariaDescribedBy="dz-err"
            />,
        );
        expect(screen.getByTestId('attachment-external-error')).toHaveTextContent(
            'Storage is full.',
        );
        expect(screen.getByTestId('attachment-external-error')).toHaveAttribute('id', 'dz-err');
        expect(input()).toHaveAttribute('aria-invalid', 'true');

        await userEvent.upload(input(), new File(['x'], 'a.txt', { type: 'text/plain' }));
        expect(screen.queryByTestId('attachment-external-error')).toBeNull();
        expect(screen.getByTestId('attachment-error')).toBeInTheDocument();
    });

    describe('with imageAdjust', () => {
        beforeEach(() => {
            URL.createObjectURL = vi.fn(() => 'blob:x');
            URL.revokeObjectURL = vi.fn();
        });

        const stubImage = (width: number, height: number) => {
            class FakeImage {
                naturalWidth = width;
                naturalHeight = height;
                onload: (() => void) | null = null;
                onerror: (() => void) | null = null;
                set src(_value: string) {
                    queueMicrotask(() => this.onload?.());
                }
            }
            vi.stubGlobal('Image', FakeImage);
        };
        const png = () => new File(['x'], 'big.png', { type: 'image/png' });
        const props = {
            labels,
            mimes: ['image/png'],
            maxSizeMb: 25,
            imageAdjust: { maxDimension: 1000, labels: adjustLabels },
        };

        it('opens the adjust dialog for a picture larger than the limit, and holds the file back', async () => {
            stubImage(4000, 3000);
            const onSelect = vi.fn();
            render(<AttachmentDropzone {...props} onSelect={onSelect} />);
            await userEvent.upload(input(), png());
            expect(await screen.findByRole('dialog', { name: 'Shrink image' })).toBeInTheDocument();
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('drops the file when the dialog is cancelled', async () => {
            stubImage(4000, 3000);
            const onSelect = vi.fn();
            render(<AttachmentDropzone {...props} onSelect={onSelect} />);
            await userEvent.upload(input(), png());
            await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
            await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
            expect(onSelect).not.toHaveBeenCalled();
        });

        it('passes a picture within the limit straight through', async () => {
            stubImage(800, 600);
            const onSelect = vi.fn();
            render(<AttachmentDropzone {...props} onSelect={onSelect} />);
            await userEvent.upload(input(), png());
            await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
            expect(screen.queryByRole('dialog')).toBeNull();
        });

        it('does not probe a file that is not a raster image', async () => {
            stubImage(4000, 3000);
            const onSelect = vi.fn();
            render(<AttachmentDropzone {...props} mimes={[]} onSelect={onSelect} />);
            await userEvent.upload(input(), pdf());
            await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
        });
    });
});
