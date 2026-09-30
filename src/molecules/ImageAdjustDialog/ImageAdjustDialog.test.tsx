import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageAdjustDialog, type ImageAdjustDialogLabels } from './ImageAdjustDialog';

const labels: ImageAdjustDialogLabels = {
    title: 'Shrink image',
    description: (max) => `Longest side at most ${max} px.`,
    previewAlt: 'Preview',
    currentDimensions: (w, h) => `Now ${w}x${h}`,
    targetDimensions: (w, h) => `New ${w}x${h}`,
    maxDimensionLabel: 'Longest side',
    qualityLabel: (pct) => `Quality ${pct}%`,
    notScalable: (type) => `Cannot scale ${type}`,
    error: (reason) => `Failed: ${reason}`,
    cancel: 'Cancel',
    apply: 'Apply',
    close: 'Close dialog',
};

const png = () => new File(['x'], 'photo.png', { type: 'image/png' });
const jpeg = () => new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

let drawImage: ReturnType<typeof vi.fn>;
let toBlob: ReturnType<typeof vi.fn>;

beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    drawImage = vi.fn();
    toBlob = vi.fn((cb: BlobCallback) => cb(new Blob(['small'], { type: 'image/png' })));
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
        drawImage,
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toBlob =
        toBlob as unknown as typeof HTMLCanvasElement.prototype.toBlob;
});

afterEach(() => {
    vi.restoreAllMocks();
});

/** jsdom never loads images, so hand the preview a size and fire `load`. */
function loadPreview(width: number, height: number) {
    const img = screen.getByAltText('Preview');
    Object.defineProperty(img, 'naturalWidth', { value: width, configurable: true });
    Object.defineProperty(img, 'naturalHeight', { value: height, configurable: true });
    fireEvent.load(img);
}

function renderDialog(over: Partial<React.ComponentProps<typeof ImageAdjustDialog>> = {}) {
    const onApply = vi.fn<(file: File) => void>();
    const onCancel = vi.fn();
    render(
        <ImageAdjustDialog
            file={png()}
            maxDimension={1000}
            onApply={onApply}
            onCancel={onCancel}
            labels={labels}
            {...over}
        />,
    );
    return { onApply, onCancel };
}

describe('ImageAdjustDialog', () => {
    it('is closed without a file', () => {
        renderDialog({ file: null });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('opens as a named modal with a preview for a file', () => {
        renderDialog();
        expect(screen.getByRole('dialog', { name: 'Shrink image' })).toHaveAccessibleDescription(
            'Longest side at most 1000 px.',
        );
        expect(screen.getByAltText('Preview')).toHaveAttribute('src', 'blob:preview');
    });

    it('releases the preview URL when it closes', () => {
        const { rerender } = render(
            <ImageAdjustDialog
                file={png()}
                maxDimension={1000}
                onApply={vi.fn()}
                onCancel={vi.fn()}
                labels={labels}
            />,
        );
        rerender(
            <ImageAdjustDialog
                file={null}
                maxDimension={1000}
                onApply={vi.fn()}
                onCancel={vi.fn()}
                labels={labels}
            />,
        );
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
    });

    it('shows the current size and the scaled size of an oversized picture', () => {
        renderDialog();
        loadPreview(4000, 2000);
        expect(screen.getByTestId('image-adjust-dims')).toHaveTextContent('Now 4000x2000');
        expect(screen.getByTestId('image-adjust-dims')).toHaveTextContent('New 1000x500');
    });

    it('does not upscale a picture already within the limit', () => {
        renderDialog();
        loadPreview(800, 600);
        expect(screen.getByTestId('image-adjust-dims')).toHaveTextContent('New 800x600');
    });

    it('recomputes the new size when the field changes, and caps it at the maximum', async () => {
        const user = userEvent.setup();
        renderDialog();
        loadPreview(4000, 2000);
        const field = screen.getByLabelText('Longest side');
        await user.clear(field);
        await user.type(field, '500');
        expect(screen.getByTestId('image-adjust-dims')).toHaveTextContent('New 500x250');

        await user.clear(field);
        await user.type(field, '9999');
        expect(screen.getByTestId('image-adjust-dims')).toHaveTextContent('New 1000x500');
    });

    it('lets the size field be emptied and retyped, never below 64, and shows the size used on blur', async () => {
        const user = userEvent.setup();
        renderDialog();
        loadPreview(4000, 2000);
        const field = screen.getByLabelText('Longest side');
        await user.clear(field);
        expect(field).toHaveValue(null);
        // Nothing typed: the largest allowed size applies.
        expect(screen.getByTestId('image-adjust-dims')).toHaveTextContent('New 1000x500');

        await user.type(field, '5');
        expect(screen.getByTestId('image-adjust-dims')).toHaveTextContent('New 64x32');
        await user.tab();
        expect(field).toHaveValue(64);
    });

    it('offers a quality slider for JPEG but not for PNG', () => {
        const { unmount } = render(
            <ImageAdjustDialog
                file={jpeg()}
                maxDimension={1000}
                onApply={vi.fn()}
                onCancel={vi.fn()}
                labels={labels}
            />,
        );
        expect(screen.getByLabelText('Quality 90%')).toBeInTheDocument();
        unmount();
        renderDialog();
        expect(screen.queryByLabelText(/Quality/)).not.toBeInTheDocument();
    });

    it('cannot apply before the picture has loaded', () => {
        renderDialog();
        expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    });

    it('draws the picture at the new size and hands back a file with the same name and type', async () => {
        const user = userEvent.setup();
        const { onApply } = renderDialog();
        loadPreview(4000, 2000);
        await user.click(screen.getByRole('button', { name: 'Apply' }));

        await waitFor(() => expect(onApply).toHaveBeenCalledTimes(1));
        expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1000, 500);
        const result = onApply.mock.calls[0]![0] as File;
        expect(result.name).toBe('photo.png');
        expect(result.type).toBe('image/png');
        // PNG is lossless: no quality argument.
        expect(toBlob.mock.calls[0]![2]).toBeUndefined();
    });

    it('passes the chosen quality for a JPEG', async () => {
        const user = userEvent.setup();
        toBlob.mockImplementation((cb: BlobCallback) =>
            cb(new Blob(['s'], { type: 'image/jpeg' })),
        );
        renderDialog({ file: jpeg() });
        loadPreview(2000, 2000);
        await user.click(screen.getByRole('button', { name: 'Apply' }));
        await waitFor(() => expect(toBlob).toHaveBeenCalled());
        expect(toBlob.mock.calls[0]![1]).toBe('image/jpeg');
        expect(toBlob.mock.calls[0]![2]).toBe(0.9);
    });

    it('shows an alert, and does not apply, when the canvas gives back nothing', async () => {
        const user = userEvent.setup();
        toBlob.mockImplementation((cb: BlobCallback) => cb(null));
        const { onApply } = renderDialog();
        loadPreview(4000, 2000);
        await user.click(screen.getByRole('button', { name: 'Apply' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Failed: canvas-to-blob-empty');
        expect(onApply).not.toHaveBeenCalled();
    });

    it('explains a type that cannot be scaled and disables Apply', () => {
        renderDialog({ file: new File(['x'], 'a.gif', { type: 'image/gif' }) });
        expect(screen.getByText('Cannot scale image/gif')).toBeInTheDocument();
        expect(screen.queryByLabelText('Longest side')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Apply' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
    });

    it('calls onCancel for Cancel, the close button and Escape', async () => {
        const user = userEvent.setup();
        const { onCancel } = renderDialog();
        await user.click(screen.getByRole('button', { name: 'Cancel' }));
        await user.click(screen.getByRole('button', { name: 'Close dialog' }));
        await user.keyboard('{Escape}');
        expect(onCancel).toHaveBeenCalledTimes(3);
    });
});
