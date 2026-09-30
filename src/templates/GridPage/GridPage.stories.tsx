import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { GridPage } from './GridPage';
import { CourseList } from './GridPage.fixtures';

const meta: Meta<typeof GridPage> = {
    title: 'Templates/GridPage',
    component: GridPage,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Die Kursliste mit allem: Sortieren (Umschalt für mehrere), Spaltenmenü, Filter mit Chips, gespeicherte Ansichten, Spalten ziehen, anheften, Breite ändern, Ausführungen aufklappen, Gruppieren mit Summen, Preis direkt bearbeiten, Kopieren (Strg+C) und CSV-Export.',
            },
        },
    },
    // Each story keeps its own remembered settings: a clean slate per load.
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.startsWith('burgwiss-ui:grid:storybook.')) localStorage.removeItem(k);
    },
};
export default meta;

type Story = StoryObj<typeof GridPage>;

/** Everything on: click a header to sort, ⋮ on a header for its menu, ▸ to open a course's offerings. */
export const Kursliste: Story = {
    render: () => <CourseList />,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);

        await step('Sort by price', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Preis' }));
            await expect(canvas.getByRole('columnheader', { name: /Preis/ })).toHaveAttribute(
                'aria-sort',
                'ascending',
            );
        });

        await step('Open a course’s offerings', async () => {
            const toggle = canvas.getAllByRole('button', { name: /aufklappen$/ })[0]!;
            await userEvent.click(toggle);
            await expect(toggle).toHaveAttribute('aria-expanded', 'true');
            await expect(canvas.getAllByText(/^Ausführungen von/)[0]).toBeVisible();
        });

        await step('Filter by status from the column menu', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Optionen für Status' }));
            await userEvent.click(await body.findByRole('menuitem', { name: 'Filtern …' }));
            const entwurf = await body.findByRole('checkbox', { name: 'Entwurf' });
            await userEvent.click(entwurf);
            await userEvent.click(body.getByRole('button', { name: 'Anwenden' }));
            await waitFor(() =>
                expect(canvas.getByRole('region', { name: 'Aktive Filter' })).toBeVisible(),
            );
            for (const cell of canvas.getAllByText(/Entwurf|Veröffentlicht|Archiviert/, {
                selector: '[data-cell-content]',
            })) {
                await expect(cell).toHaveTextContent('Entwurf');
            }
        });
    },
};

/** Grouped by category, with a count per group and summed price and enrolments. */
export const Gruppiert: Story = {
    render: () => <CourseList gridId="storybook.kursliste.grouped" groupBy={['category']} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const group = canvas.getByRole('button', { name: /^Kategorie: Religion/ });
        await expect(group).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(group);
        await expect(group).toHaveAttribute('aria-expanded', 'true');
    },
};

/** Edit a price in place: click it, type, Enter. 999 € is refused, to show the error path. */
export const PreisBearbeiten: Story = {
    name: 'Preis bearbeiten',
    render: () => <CourseList gridId="storybook.kursliste.edit" />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getAllByRole('button', { name: /^Preis bearbeiten/ })[0]!);
        const input = canvas.getByRole('spinbutton', { name: 'Preis' });
        await userEvent.clear(input);
        await userEvent.type(input, '75{Enter}');
        await waitFor(() =>
            expect(
                canvas.getByText('Ausgeführt: Preis von „Arabisch für Anfänger" gespeichert'),
            ).toBeVisible(),
        );
        await expect(canvas.getAllByText('75,00 €')[0]).toBeVisible();
    },
};

/** 2000 courses: only the rows in view are rendered, so scrolling stays smooth. */
export const VieleKurse: Story = {
    name: '2000 Kurse',
    render: () => <CourseList count={2000} gridId="storybook.kursliste.many" />,
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(canvasElement.querySelectorAll('tr[data-grid-row-id]').length).toBeGreaterThan(
                0,
            ),
        );
        await expect(canvasElement.querySelectorAll('tr[data-grid-row-id]').length).toBeLessThan(
            120,
        );
    },
};

/** The first load: skeleton rows and a polite "Lädt …". */
export const Laedt: Story = {
    name: 'Lädt',
    render: () => <CourseList empty loading gridId="storybook.kursliste.loading" />,
};

/** A failed load says so and offers a retry, instead of an empty table. */
export const Fehler: Story = {
    render: () => (
        <CourseList
            empty
            error="Zeitüberschreitung nach 30 Sekunden."
            gridId="storybook.kursliste.error"
        />
    ),
};

/** No courses yet. */
export const Leer: Story = {
    render: () => <CourseList empty gridId="storybook.kursliste.empty" />,
};

/** `selection: 'single'` — no checkboxes; a click picks one row. */
export const Einzelauswahl: Story = {
    render: () => <CourseList selection="single" gridId="storybook.kursliste.single" />,
};

/** `selection: 'none'` — a read-only list. */
export const OhneAuswahl: Story = {
    render: () => <CourseList selection="none" gridId="storybook.kursliste.none" />,
};
