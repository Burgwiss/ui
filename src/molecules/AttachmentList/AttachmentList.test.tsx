import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    AttachmentList,
    type AttachmentListItem,
    type AttachmentListLabels,
} from './AttachmentList';

const labels: AttachmentListLabels = {
    empty: 'No attachments yet.',
    download: (name) => `Download ${name}`,
    downloadShort: 'Download',
    remove: (name) => `Remove ${name}`,
    scan: {
        pending: 'Scanning…',
        clean: 'Clean',
        infected: 'Infected',
        error: 'Scan error',
    },
};

const item = (over: Partial<AttachmentListItem> = {}): AttachmentListItem => ({
    id: 1,
    name: 'paper.pdf',
    sizeBytes: 2048,
    mime: 'application/pdf',
    scanStatus: 'clean',
    downloadUrl: '/attachments/1/download',
    canDelete: false,
    ...over,
});

describe('AttachmentList', () => {
    it('shows the empty text when there are no items', () => {
        render(<AttachmentList items={[]} labels={labels} />);
        expect(screen.getByText('No attachments yet.')).toBeInTheDocument();
        expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('renders name, size and type, and a download link for a clean file', () => {
        render(<AttachmentList items={[item()]} labels={labels} formatSize={() => '2.0 KB'} />);
        expect(screen.getByText('paper.pdf')).toBeInTheDocument();
        expect(screen.getByText('2.0 KB · application/pdf')).toBeInTheDocument();
        const link = screen.getByRole('link', { name: 'Download paper.pdf' });
        expect(link).toHaveAttribute('href', '/attachments/1/download');
        expect(link).toHaveTextContent('Download');
        expect(screen.getByTestId('attachment-status-clean')).toHaveTextContent('Clean');
    });

    it.each(['pending', 'infected', 'error'] as const)(
        'gives a %s file a status pill but no download link',
        (scanStatus) => {
            render(<AttachmentList items={[item({ scanStatus })]} labels={labels} />);
            expect(screen.getByTestId(`attachment-status-${scanStatus}`)).toBeInTheDocument();
            expect(screen.queryByRole('link')).not.toBeInTheDocument();
        },
    );

    it('allows the download and shows no pill when the app does not scan', () => {
        render(
            <AttachmentList
                items={[item({ scanStatus: undefined })]}
                labels={{ ...labels, scan: undefined }}
            />,
        );
        expect(screen.getByRole('link', { name: 'Download paper.pdf' })).toBeInTheDocument();
        expect(screen.queryByTestId(/attachment-status/)).not.toBeInTheDocument();
    });

    it('shows the remove button only when the item allows it and a handler exists', () => {
        const onDelete = vi.fn();
        const { rerender } = render(
            <AttachmentList items={[item()]} labels={labels} onDelete={onDelete} />,
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();

        rerender(<AttachmentList items={[item({ canDelete: true })]} labels={labels} />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();

        rerender(
            <AttachmentList
                items={[item({ canDelete: true })]}
                labels={labels}
                onDelete={onDelete}
            />,
        );
        expect(screen.getByRole('button', { name: 'Remove paper.pdf' })).toBeInTheDocument();
    });

    it('reports the id of the removed item', async () => {
        const onDelete = vi.fn();
        render(
            <AttachmentList
                items={[item({ id: 'a' }), item({ id: 'b', name: 'b.pdf', canDelete: true })]}
                labels={labels}
                onDelete={onDelete}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Remove b.pdf' }));
        expect(onDelete).toHaveBeenCalledExactlyOnceWith('b');
    });

    it('truncates a long file name and pins the trailing controls so a row cannot burst its bubble', () => {
        const long = 'a-ridiculously-long-attachment-filename-that-would-bust-the-bubble-width.pdf';
        render(<AttachmentList items={[item({ name: long })]} labels={labels} />);
        expect(screen.getByText(long).className).toContain('truncate');
        expect(screen.getByTestId('attachment-status-clean').className).toContain('shrink-0');
        expect(screen.getByRole('link').className).toContain('shrink-0');
    });
});
