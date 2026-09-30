import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleAlert, Info } from 'lucide-react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from './Alert';

const meta = {
    title: 'Molecules/Alert',
    component: Alert,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The neutral notice: use it for a heads-up that is not an error. */
export const Default: Story = {
    render: () => (
        <Alert className="w-96">
            <Info aria-hidden="true" />
            <AlertTitle>Hinweis</AlertTitle>
            <AlertDescription>
                Deine Änderungen werden erst nach dem Speichern sichtbar.
            </AlertDescription>
        </Alert>
    ),
};

/** Use `variant="destructive"` when something failed and the user must act. */
export const Destructive: Story = {
    render: () => (
        <Alert variant="destructive" className="w-96">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>Zahlung fehlgeschlagen</AlertTitle>
            <AlertDescription>Bitte prüfe deine Zahlungsmethode.</AlertDescription>
        </Alert>
    ),
};

/** Put a link or button in `AlertAction` when the message has a one-click remedy. */
export const WithAction: Story = {
    render: () => (
        <Alert className="w-96">
            <AlertTitle>Neue Version verfügbar</AlertTitle>
            <AlertDescription>Lade die Seite neu, um sie zu nutzen.</AlertDescription>
            <AlertAction>
                <a href="#neu" className="text-sm underline">
                    Neu laden
                </a>
            </AlertAction>
        </Alert>
    ),
};
