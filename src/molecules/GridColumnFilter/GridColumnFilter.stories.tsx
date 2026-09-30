import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { GridColumnFilter } from './GridColumnFilter';

const OPTIONS = [
    { value: 'published', label: 'Veröffentlicht' },
    { value: 'draft', label: 'Entwurf' },
    { value: 'archived', label: 'Archiviert' },
];

const meta: Meta<typeof GridColumnFilter> = {
    title: 'Molecules/GridColumnFilter',
    component: GridColumnFilter,
    render: (args) => {
        const [value, setValue] = useState(args.value);
        return (
            <div className="rounded-md bg-muted px-3 py-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                <GridColumnFilter {...args} value={value} onChange={setValue} />
            </div>
        );
    },
    args: {
        title: 'Status',
        filterLabel: 'Status filtern',
        allLabel: 'Alle',
        options: OPTIONS,
        value: '',
    },
};
export default meta;

/** No filter chosen: a muted funnel, `value` is empty. */
export const Inactive: StoryObj<typeof GridColumnFilter> = {};
/** A choice is active: the funnel is filled and coloured so the filtered column is visible at a glance. */
export const Active: StoryObj<typeof GridColumnFilter> = { args: { value: 'draft' } };
