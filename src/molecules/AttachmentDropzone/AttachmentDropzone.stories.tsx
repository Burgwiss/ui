import type { Meta, StoryObj } from '@storybook/react-vite';

import { AttachmentDropzone, type AttachmentDropzoneLabels } from './AttachmentDropzone';

const labels: AttachmentDropzoneLabels = {
    label: 'Dateien hierher ziehen oder klicken zum Auswählen',
    hint: (max, mimes) => `Höchstens ${max} MB. Erlaubt: ${mimes.join(', ')}.`,
    uploading: (name) => `${name} wird hochgeladen …`,
    uploadFailed: (name) => `${name} konnte nicht hochgeladen werden.`,
    selected: (name) => `Ausgewählt: ${name}`,
    errorTooLarge: (name, max) => `${name} ist größer als ${max} MB.`,
    errorType: (name, type) => `${name} hat einen nicht erlaubten Typ (${type}).`,
    typeUnknown: 'unbekannt',
};

const meta = {
    title: 'Molecules/AttachmentDropzone',
    component: AttachmentDropzone,
    tags: ['autodocs'],
    args: {
        labels,
        mimes: ['application/pdf', 'image/png'],
        maxSizeMb: 25,
        onSelect: () => {},
    },
    parameters: { layout: 'padded' },
} satisfies Meta<typeof AttachmentDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start here: the empty area in `onSelect` mode; tweak `mimes` and `maxSizeMb` in the controls. */
export const Playground: Story = {};

/** Shows how a chosen file is confirmed by name when the parent controls `selectedFileName`. */
export const MitBestaetigung: Story = {
    args: { selectedFileName: 'hausaufgabe-woche-3.pdf' },
};

/** Use `externalError` (with `ariaDescribedBy`) to surface a server-side rejection under the area. */
export const MitFehlerVomServer: Story = {
    args: {
        externalError: 'Der Anhang konnte nicht gespeichert werden.',
        ariaDescribedBy: 'dz-error',
    },
};

/** A disabled dropzone blocks both clicking and dropping, e.g. while a form is submitting. */
export const Deaktiviert: Story = { args: { disabled: true } };
