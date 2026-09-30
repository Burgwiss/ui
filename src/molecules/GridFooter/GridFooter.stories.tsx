import type { Meta, StoryObj } from '@storybook/react-vite';

import { GridFooter } from './GridFooter';

const labels = { previous: 'Vorherige Seite', next: 'Nächste Seite', pager: 'Seiten' };

const meta: Meta<typeof GridFooter> = {
    title: 'Molecules/GridFooter',
    component: GridFooter,
    decorators: [
        (Story) => (
            <div className="flex w-[640px] items-center gap-3 border-t border-border px-4 py-2">
                <Story />
            </div>
        ),
    ],
};
export default meta;

/** A middle page: both pager buttons are enabled. */
export const Middle: StoryObj<typeof GridFooter> = {
    args: { summary: 'Zeige 26–50 von 120', onPrev: () => {}, onNext: () => {}, labels },
};
/** Pass `onPrev: null` when there is no previous page; the button renders disabled. */
export const FirstPage: StoryObj<typeof GridFooter> = {
    args: { summary: 'Zeige 1–25 von 120', onPrev: null, onNext: () => {}, labels },
};
