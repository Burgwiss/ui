import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Chip, ChipRow } from './Chip';

const meta = {
    title: 'Atoms/Chip',
    component: Chip,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

const CATEGORIES = ['Alle', 'Arabisch', 'Koran', 'Grammatik', 'Aussprache'];

function CategoryRow() {
    const [active, setActive] = useState('Alle');
    return (
        <ChipRow ariaLabel="Kategorien" className="max-w-md">
            {CATEGORIES.map((c) => (
                <Chip key={c} selected={active === c} onClick={() => setActive(c)}>
                    {c}
                </Chip>
            ))}
        </ChipRow>
    );
}

/** A scrollable category filter: one chip active at a time, arrow keys move between chips. */
export const SingleSelectRow: Story = {
    args: { children: 'Alle' },
    render: () => <CategoryRow />,
};

function TagPicker() {
    const [tags, setTags] = useState<string[]>(['Anfänger']);
    const toggle = (tag: string, on: boolean) =>
        setTags((prev) => (on ? [...prev, tag] : prev.filter((t) => t !== tag)));
    return (
        <fieldset className="flex flex-wrap gap-2">
            <legend className="sr-only">Schlagwörter</legend>
            {['Anfänger', 'Fortgeschritten', 'Abendkurs'].map((tag) => (
                <Chip
                    key={tag}
                    multi
                    id={`tag-${tag}`}
                    checked={tags.includes(tag)}
                    onChange={(on) => toggle(tag, on)}
                >
                    {tag}
                </Chip>
            ))}
        </fieldset>
    );
}

/** A free-form tag picker: each chip is a checkbox, so several can be on at once. */
export const MultiSelect: Story = {
    args: { children: 'Anfänger' },
    render: () => <TagPicker />,
};
