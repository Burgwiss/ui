import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../../atoms/Button';
import { ImageAdjustDialog, type ImageAdjustDialogLabels } from './ImageAdjustDialog';

const labels: ImageAdjustDialogLabels = {
    title: 'Bild verkleinern',
    description: (max) => `Bilder dürfen höchstens ${max} Pixel an der längsten Seite haben.`,
    previewAlt: 'Vorschau des ausgewählten Bildes',
    currentDimensions: (w, h) => `Aktuell: ${w} × ${h} px`,
    targetDimensions: (w, h) => `Neu: ${w} × ${h} px`,
    maxDimensionLabel: 'Längste Seite in Pixel',
    qualityLabel: (pct) => `Qualität: ${pct} %`,
    notScalable: (type) => `Dateien vom Typ ${type} lassen sich hier nicht verkleinern.`,
    error: () =>
        'Das Bild konnte nicht verkleinert werden. Bitte versuche es mit einem anderen Bild.',
    cancel: 'Abbrechen',
    apply: 'Übernehmen',
    close: 'Schließen',
};

// A 1 × 1 px PNG — enough to have a real file to hand over.
const PIXEL =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const photo = () =>
    new File([Uint8Array.from(atob(PIXEL), (c) => c.charCodeAt(0))], 'tafelbild.png', {
        type: 'image/png',
    });

const meta = {
    title: 'Molecules/ImageAdjustDialog',
    component: ImageAdjustDialog,
    tags: ['autodocs'],
    args: {
        file: null,
        maxDimension: 2048,
        labels,
        onApply: () => {},
        onCancel: () => {},
    },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof ImageAdjustDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Try the full flow: pick an image, adjust, apply or cancel. */
export const Bedienbar: Story = {
    render: (args) => {
        const [file, setFile] = useState<File | null>(null);
        return (
            <>
                <Button variant="outline" onClick={() => setFile(photo())}>
                    Bild auswählen
                </Button>
                <ImageAdjustDialog
                    {...args}
                    file={file}
                    onApply={() => setFile(null)}
                    onCancel={() => setFile(null)}
                />
            </>
        );
    },
};

/** Open from the start. The page behind a modal is inert, so nothing else sits here. */
export const Geoeffnet: Story = {
    args: { file: photo() },
    render: (args) => (
        <>
            <p className="text-sm text-muted-foreground">Seite hinter dem Dialog</p>
            <ImageAdjustDialog {...args} />
        </>
    ),
};

/** A GIF cannot be scaled here: the dialog shows the `notScalable` note and disables Apply. */
export const NichtSkalierbar: Story = {
    args: { file: new File(['GIF89a'], 'animation.gif', { type: 'image/gif' }) },
    render: Geoeffnet.render,
};
