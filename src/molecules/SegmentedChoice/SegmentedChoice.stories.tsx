import type { Meta, StoryObj } from '@storybook/react-vite';

import { SegmentedChoice, SegmentedChoiceItem } from './SegmentedChoice';

const meta = {
    title: 'Molecules/SegmentedChoice',
    component: SegmentedChoice,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof SegmentedChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A billing-mode choice with a disabled option: the typical submitted form value. */
export const Abrechnung: Story = {
    render: () => (
        <SegmentedChoice defaultValue="monatlich" aria-label="Abrechnung" className="w-80">
            <SegmentedChoiceItem value="monatlich">Monatlich</SegmentedChoiceItem>
            <SegmentedChoiceItem value="jaehrlich">Jährlich</SegmentedChoiceItem>
            <SegmentedChoiceItem value="einmalig" disabled>
                Einmalig
            </SegmentedChoiceItem>
        </SegmentedChoice>
    ),
};
