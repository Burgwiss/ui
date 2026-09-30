import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { InlineText } from './InlineText';

/**
 * Text you edit where it stands. Hover for the outline, click to edit, Enter
 * to keep, Escape to throw away.
 */
const meta: Meta<typeof InlineText> = {
    title: 'Molecules/InlineText',
    component: InlineText,
    parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof InlineText>;

function Demo() {
    const [title, setTitle] = useState('Arabisch für Anfänger');
    const [about, setAbout] = useState(
        'Dieser Kurs beginnt bei null: Alphabet, Aussprache, erste Sätze.',
    );
    const [audience, setAudience] = useState('');
    return (
        <div className="flex max-w-xl flex-col gap-4 ps-2">
            <InlineText
                as="h1"
                label="Titel"
                placeholder="Wie heißt der Kurs?"
                value={title}
                onChange={setTitle}
                className="text-3xl font-bold tracking-tight"
            />
            <InlineText
                multiline
                label="Über den Kurs"
                placeholder="Worum geht es?"
                value={about}
                onChange={setAbout}
                className="leading-relaxed"
            />
            <InlineText
                multiline
                label="Zielgruppe"
                placeholder="z. B. „Erwachsene ohne Vorkenntnisse“"
                value={audience}
                onChange={setAudience}
            />
        </div>
    );
}

/** A heading, a paragraph and an empty field. */
export const AufDerSeite: Story = {
    render: () => <Demo />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /^Titel:/ }));
        await userEvent.keyboard('Arabisch kompakt{Enter}');
        await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Arabisch kompakt',
        );
    },
};

/** On a coloured header: `inverse`. */
export const AufFarbe: Story = {
    render: () => (
        <div className="flex max-w-xl flex-col gap-3 rounded-xl bg-primary p-8 text-primary-foreground">
            <InlineText
                as="h1"
                inverse
                label="Titel"
                placeholder="Wie heißt der Kurs?"
                value="Koran"
                onChange={() => {}}
                className="text-3xl font-bold"
            />
            <InlineText
                inverse
                label="Kurzbeschreibung"
                placeholder="Ein Satz für den Katalog"
                value=""
                onChange={() => {}}
            />
        </div>
    ),
};
