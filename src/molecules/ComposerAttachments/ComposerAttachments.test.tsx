import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
    ComposerAttachments,
    type ComposerAttachmentsLabels,
    type ComposerAttachmentsProps,
} from './ComposerAttachments';

const labels: ComposerAttachmentsLabels = {
    add: 'Add attachment',
    maxReached: (max) => `No more than ${max} attachments.`,
    stagedHeading: 'Chosen attachments',
    remove: (name) => `Remove ${name}`,
    removeShort: 'Remove',
    dropzone: {
        label: 'Drop files here',
        hint: (max) => `Max ${max} MB`,
        uploading: (n) => `Uploading ${n}`,
        uploadFailed: (n) => `Could not upload ${n}`,
        selected: (n) => `Selected ${n}`,
        errorTooLarge: (n, max) => `${n} is larger than ${max} MB`,
        errorType: (n, t) => `${n} has type ${t}`,
        typeUnknown: 'unknown',
    },
};

const pdf = (name: string, size = 2048) =>
    new File([new Uint8Array(size)], name, { type: 'application/pdf' });

type HarnessProps = Partial<Omit<ComposerAttachmentsProps, 'files' | 'onChange' | 'labels'>> & {
    initial?: File[];
    onChange?: (files: File[]) => void;
};

function Harness({ initial = [], onChange = vi.fn(), ...rest }: HarnessProps) {
    const [files, setFiles] = useState<File[]>(initial);
    return (
        <ComposerAttachments
            labels={labels}
            files={files}
            onChange={(next) => {
                onChange(next);
                setFiles(next);
            }}
            {...rest}
        />
    );
}

describe('ComposerAttachments', () => {
    it('adds a picked file to the list, with its size', async () => {
        const onChange = vi.fn();
        render(<Harness onChange={onChange} />);
        await userEvent.upload(screen.getByLabelText('Add attachment'), pdf('a.pdf', 2048));

        const list = screen.getByRole('list', { name: 'Chosen attachments' });
        expect(within(list).getByText(/a\.pdf/)).toBeInTheDocument();
        expect(list).toHaveTextContent('(2.0 KB)');
        expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'a.pdf' })]);
    });

    it('shows no list while nothing is chosen', () => {
        render(<Harness />);
        expect(screen.queryByRole('list')).toBeNull();
    });

    it('appends after the files already chosen', async () => {
        render(<Harness initial={[pdf('first.pdf')]} />);
        await userEvent.upload(screen.getByLabelText('Add attachment'), pdf('second.pdf'));
        const items = within(screen.getByRole('list')).getAllByRole('listitem');
        expect(items).toHaveLength(2);
        expect(items[1]).toHaveTextContent('second.pdf');
    });

    it('removes exactly the file whose button was pressed', async () => {
        render(<Harness initial={[pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]} />);
        await userEvent.click(screen.getByRole('button', { name: 'Remove b.pdf' }));
        const items = within(screen.getByRole('list')).getAllByRole('listitem');
        expect(items.map((li) => li.textContent)).toEqual([
            expect.stringContaining('a.pdf'),
            expect.stringContaining('c.pdf'),
        ]);
    });

    it('can re-add a file that was just removed', async () => {
        const file = pdf('again.pdf');
        render(<Harness />);
        const input = screen.getByLabelText('Add attachment');
        await userEvent.upload(input, file);
        await userEvent.click(screen.getByRole('button', { name: 'Remove again.pdf' }));
        expect(screen.queryByRole('list')).toBeNull();
        await userEvent.upload(screen.getByLabelText('Add attachment'), file);
        expect(screen.getByRole('list')).toHaveTextContent('again.pdf');
    });

    it('swaps the drop area for a note at the file limit', () => {
        render(<Harness maxFiles={2} initial={[pdf('a.pdf'), pdf('b.pdf')]} />);
        expect(screen.getByText('No more than 2 attachments.')).toBeInTheDocument();
        expect(screen.queryByLabelText('Add attachment')).toBeNull();
    });

    it('brings the drop area back once a file is removed from a full list', async () => {
        render(<Harness maxFiles={2} initial={[pdf('a.pdf'), pdf('b.pdf')]} />);
        await userEvent.click(screen.getByRole('button', { name: 'Remove a.pdf' }));
        expect(screen.getByLabelText('Add attachment')).toBeInTheDocument();
    });

    it('still shows a server error at the file limit', () => {
        render(<Harness maxFiles={1} initial={[pdf('a.pdf')]} error="Sending failed." />);
        expect(screen.getByRole('alert')).toHaveTextContent('Sending failed.');
    });

    it('shows a server error under the drop area', () => {
        render(<Harness error="Sending failed." />);
        expect(screen.getByRole('alert')).toHaveTextContent('Sending failed.');
    });

    it('rejects an oversize file without adding it', async () => {
        const onChange = vi.fn();
        render(<Harness maxSizeMb={1} onChange={onChange} />);
        await userEvent.upload(
            screen.getByLabelText('Add attachment'),
            pdf('huge.pdf', 2 * 1024 * 1024),
        );
        expect(screen.getByRole('alert')).toHaveTextContent('huge.pdf is larger than 1 MB');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('disables the picker and the remove buttons', () => {
        render(<Harness disabled initial={[pdf('a.pdf')]} />);
        expect(screen.getByLabelText('Add attachment')).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Remove a.pdf' })).toBeDisabled();
    });
});
