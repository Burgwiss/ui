import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../../atoms/Button';
import { ConfirmActionDialog } from './ConfirmActionDialog';

const meta = {
    title: 'Molecules/ConfirmActionDialog',
    component: ConfirmActionDialog,
    tags: ['autodocs'],
    args: {
        open: false,
        onOpenChange: () => {},
        title: 'Kurs archivieren?',
        description: 'Archivierte Kurse sind für Teilnehmende nicht mehr sichtbar.',
        confirmLabel: 'Archivieren',
        cancelLabel: 'Abbrechen',
        onConfirm: () => {},
    },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof ConfirmActionDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ variant }: { variant: 'default' | 'destructive' }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="outline" onClick={() => setOpen(true)}>
                Kurs archivieren
            </Button>
            <ConfirmActionDialog
                open={open}
                onOpenChange={setOpen}
                title="Kurs archivieren?"
                description="Archivierte Kurse sind für Teilnehmende nicht mehr sichtbar."
                confirmLabel="Archivieren"
                cancelLabel="Abbrechen"
                variant={variant}
                onConfirm={() => {}}
            />
        </>
    );
}

/** The default: a red confirm button for archiving, deleting or removing something. */
export const Destructive: Story = {
    render: () => <Demo variant="destructive" />,
};

/** Use `variant="default"` to confirm a non-destructive but consequential action. */
export const NeutralConfirm: Story = {
    render: () => <Demo variant="default" />,
};
