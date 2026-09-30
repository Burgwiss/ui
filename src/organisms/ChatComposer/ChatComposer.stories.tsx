import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { ChatComposer, type ChatComposerLabels } from './ChatComposer';

const labels: ChatComposerLabels = {
    message: 'Nachricht schreiben',
    placeholder: 'Nachricht schreiben …',
    send: 'Nachricht senden',
    attach: 'Datei anhängen',
    removeFile: (name) => `${name} entfernen`,
    replyingTo: (name) => `Antwort an ${name}`,
    cancelReply: 'Antwort abbrechen',
    fileTooLarge: (name, max) => `${name} ist größer als ${max} MB.`,
    tooManyFiles: (max) => `Mehr als ${max} Anhänge sind nicht möglich.`,
};

const later = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const meta = {
    title: 'Organisms/ChatComposer',
    component: ChatComposer,
    tags: ['autodocs'],
    args: { labels, onSend: () => later(600) },
    parameters: { layout: 'padded' },
} satisfies Meta<typeof ChatComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start here: the default composer, with a slow `onSend` so the busy state is visible. */
export const Playground: Story = {};

/** Answering a specific message: shows the reply chip and passes `replyTo` to `onSend`. */
export const AntwortAufNachricht: Story = {
    render: (args) => {
        const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>({
            id: 7,
            name: 'Anna Schmidt',
        });
        return <ChatComposer {...args} replyTo={replyTo} onClearReply={() => setReplyTo(null)} />;
    },
};

/** A rejected send: the draft stays and the parent's `error` shows under the field. */
export const MitFehler: Story = {
    args: {
        error: 'Die Nachricht darf höchstens 2000 Zeichen lang sein.',
        onSend: () => Promise.reject(new Error('abgelehnt')),
    },
};

/** Text-only chat: `allowAttachments={false}` removes the paperclip. */
export const OhneAnhaenge: Story = { args: { allowAttachments: false } };

/** Read-only state, e.g. a closed thread: the field and buttons are disabled. */
export const Deaktiviert: Story = { args: { disabled: true } };
