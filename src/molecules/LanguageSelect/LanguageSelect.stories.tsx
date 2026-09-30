import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { LanguageSelect } from './LanguageSelect';
import { languageLabels, languageOptions } from './LanguageSelect.fixtures';

const meta = {
    title: 'Molecules/LanguageSelect',
    component: LanguageSelect,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
    args: {
        languages: languageOptions,
        value: 'de',
        onValueChange: () => {},
        labels: languageLabels,
    },
} satisfies Meta<typeof LanguageSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Four languages at different stages: an amber chip while fields are missing, green once
 * complete, and a code box ("AR") for a language without a flag. Pick one to see it move.
 */
export const Default: Story = {
    render: (args) => {
        const [value, setValue] = useState(args.value);
        return <LanguageSelect {...args} value={value} onValueChange={setValue} />;
    },
};

/** A page with one language only: the control still shows its progress, and the list has one entry. */
export const EineSprache: Story = {
    args: { languages: languageOptions.slice(0, 1) },
    render: (args) => {
        const [value, setValue] = useState(args.value);
        return <LanguageSelect {...args} value={value} onValueChange={setValue} />;
    },
};
