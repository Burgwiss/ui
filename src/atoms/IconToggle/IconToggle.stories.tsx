import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import { ToggleGroup } from 'radix-ui';

import { IconToggle } from './IconToggle';

const meta = {
    title: 'Atoms/IconToggle',
    component: IconToggle,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof IconToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single-select alignment group: shows how `as` wires the item into a Radix `ToggleGroup`. */
export const InToggleGroup: Story = {
    args: { label: 'Linksbündig', icon: <AlignLeft />, value: 'left', as: ToggleGroup.Item },
    render: () => (
        <ToggleGroup.Root
            type="single"
            defaultValue="left"
            aria-label="Textausrichtung"
            className="inline-flex gap-1 rounded-lg border border-border bg-card p-1"
        >
            <IconToggle
                as={ToggleGroup.Item}
                value="left"
                label="Linksbündig"
                icon={<AlignLeft className="size-4" aria-hidden="true" />}
            />
            <IconToggle
                as={ToggleGroup.Item}
                value="center"
                label="Zentriert"
                icon={<AlignCenter className="size-4" aria-hidden="true" />}
            />
            <IconToggle
                as={ToggleGroup.Item}
                value="right"
                label="Rechtsbündig"
                icon={<AlignRight className="size-4" aria-hidden="true" />}
            />
        </ToggleGroup.Root>
    ),
};
