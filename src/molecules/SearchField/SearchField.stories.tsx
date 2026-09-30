import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { SearchField } from './SearchField';

const meta: Meta<typeof SearchField> = {
    title: 'Molecules/SearchField',
    component: SearchField,
    render: (args) => {
        const [value, setValue] = useState(args.value);
        return <SearchField {...args} value={value} onValueChange={setValue} className="w-72" />;
    },
    args: { value: '', placeholder: 'Kurse suchen …' },
};
export default meta;

/** The empty field showing the placeholder, which is also its accessible name. */
export const Empty: StoryObj<typeof SearchField> = {};
/** A field with an existing query, e.g. restored from the URL. */
export const WithValue: StoryObj<typeof SearchField> = { args: { value: 'Tajweed' } };
