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

export const Empty: StoryObj<typeof SearchField> = {};
export const WithValue: StoryObj<typeof SearchField> = { args: { value: 'Tajweed' } };
