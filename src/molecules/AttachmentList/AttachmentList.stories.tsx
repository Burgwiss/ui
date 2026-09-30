import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { attachmentListLabelsDe } from '../../lib/chat.fixtures';
import { AttachmentList, type AttachmentListItem } from './AttachmentList';

const ITEMS: AttachmentListItem[] = [
    {
        id: 1,
        name: 'Arbeitsblatt-Woche-3.pdf',
        sizeBytes: 482_304,
        mime: 'application/pdf',
        scanStatus: 'clean',
        downloadUrl: '/anhaenge/1',
        canDelete: true,
    },
    {
        id: 2,
        name: 'Foto-Tafelbild.jpg',
        sizeBytes: 2_411_724,
        mime: 'image/jpeg',
        scanStatus: 'pending',
        downloadUrl: '/anhaenge/2',
    },
    {
        id: 3,
        name: 'unbekannt.docx',
        sizeBytes: 90_112,
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        scanStatus: 'infected',
        downloadUrl: '/anhaenge/3',
    },
];

const meta = {
    title: 'Molecules/AttachmentList',
    component: AttachmentList,
    tags: ['autodocs'],
    args: { items: ITEMS, labels: attachmentListLabelsDe },
    parameters: { layout: 'padded' },
} satisfies Meta<typeof AttachmentList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start here: clean, pending and infected files side by side, to compare the download rules. */
export const Playground: Story = {};

/** With no items the list renders the `labels.empty` message instead of an empty box. */
export const Leer: Story = { args: { items: [] } };

/** Omit `scanStatus` and `labels.scan` when the app does not scan: no pill, file stays downloadable. */
export const OhneVirenpruefung: Story = {
    args: {
        items: ITEMS.slice(0, 1).map((item) => ({ ...item, scanStatus: undefined })),
        labels: { ...attachmentListLabelsDe, scan: undefined },
    },
};

/** Set `canDelete` on items and pass `onDelete` to let people remove a file; the parent owns the state. */
export const MitEntfernen: Story = {
    render: (args) => {
        const [items, setItems] = useState(ITEMS.map((item) => ({ ...item, canDelete: true })));
        return (
            <AttachmentList
                {...args}
                items={items}
                onDelete={(id) => setItems((current) => current.filter((item) => item.id !== id))}
            />
        );
    },
};
