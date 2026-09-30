import type { Meta, StoryObj } from '@storybook/react-vite';

import { CompletionChecklist, type CompletionChecklistProps } from './CompletionChecklist';

const LABELS: CompletionChecklistProps['labels'] = {
    heading: 'Seite (DE)',
    complete: 'alles Nötige da',
    incomplete: 'Pflichtangaben fehlen',
    optional: 'optional',
    done: 'ausgefüllt',
    missing: 'fehlt',
};

/** How complete a page is, for the right-hand panel of a page editor. */
const meta: Meta<typeof CompletionChecklist> = {
    title: 'Molecules/CompletionChecklist',
    component: CompletionChecklist,
    parameters: { layout: 'padded' },
    decorators: [(Story) => <div className="w-64">{Story()}</div>],
    args: { labels: LABELS, onItemClick: () => {} },
};
export default meta;

type Story = StoryObj<typeof CompletionChecklist>;

/** Everything required is there; two optional parts are not. */
export const FastFertig: Story = {
    args: {
        items: [
            { id: 'title', label: 'Titel', done: true },
            { id: 'tagline', label: 'Kurzbeschreibung', done: true },
            { id: 'about', label: 'Über den Kurs', done: true },
            { id: 'audience', label: 'Für wen', done: false, optional: true },
            { id: 'video', label: 'Vorschau-Video', done: false, optional: true },
        ],
    },
};

/** A new page: only the title so far. */
export const Neu: Story = {
    args: {
        items: [
            { id: 'title', label: 'Titel', done: true },
            { id: 'tagline', label: 'Kurzbeschreibung', done: false },
            { id: 'about', label: 'Über den Kurs', done: false },
        ],
    },
};
