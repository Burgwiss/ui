import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ComposerAttachments, type ComposerAttachmentsLabels } from './ComposerAttachments';

const labels: ComposerAttachmentsLabels = {
    add: 'Anhang hinzufügen',
    maxReached: (max) => `Mehr als ${max} Anhänge sind nicht möglich.`,
    stagedHeading: 'Ausgewählte Anhänge',
    remove: (name) => `${name} entfernen`,
    removeShort: 'Entfernen',
    dropzone: {
        label: 'Dateien hierher ziehen oder klicken zum Auswählen',
        hint: (max, mimes) => `Höchstens ${max} MB. Erlaubt: ${mimes.length} Dateitypen.`,
        uploading: (name) => `${name} wird hochgeladen …`,
        uploadFailed: (name) => `${name} konnte nicht hochgeladen werden.`,
        selected: (name) => `Ausgewählt: ${name}`,
        errorTooLarge: (name, max) => `${name} ist größer als ${max} MB.`,
        errorType: (name, type) => `${name} hat einen nicht erlaubten Typ (${type}).`,
        typeUnknown: 'unbekannt',
    },
};

const pdf = (name: string, size: number) =>
    new File([new Uint8Array(size)], name, { type: 'application/pdf' });

const meta = {
    title: 'Molecules/ComposerAttachments',
    component: ComposerAttachments,
    tags: ['autodocs'],
    args: { files: [], onChange: () => {}, labels },
    parameters: { layout: 'padded' },
} satisfies Meta<typeof ComposerAttachments>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Try it: add and remove files with real state, as a reply form would. */
export const Bedienbar: Story = {
    render: (args) => {
        const [files, setFiles] = useState<File[]>([]);
        return <ComposerAttachments {...args} files={files} onChange={setFiles} />;
    },
};

/** Shows how chosen files are listed with size and a remove button under the drop area. */
export const MitAusgewaehltenDateien: Story = {
    args: { files: [pdf('Bericht.pdf', 482_304), pdf('Notizen.pdf', 12_100)] },
};

/** At `maxFiles` the drop area is replaced by a note; a server `error` still shows. */
export const Limit: Story = {
    args: {
        maxFiles: 2,
        files: [pdf('Bericht.pdf', 482_304), pdf('Notizen.pdf', 12_100)],
        error: 'Die Nachricht konnte nicht gesendet werden.',
    },
};
