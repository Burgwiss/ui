import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../Label';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

const meta = {
    title: 'Atoms/RadioGroup',
    component: RadioGroup,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A labelled group with a preselected option and one disabled option. */
export const Default: Story = {
    render: () => (
        <RadioGroup defaultValue="monatlich" aria-label="Abrechnung">
            <div className="flex items-center gap-2">
                <RadioGroupItem value="monatlich" id="r-monatlich" />
                <Label htmlFor="r-monatlich">Monatlich</Label>
            </div>
            <div className="flex items-center gap-2">
                <RadioGroupItem value="jaehrlich" id="r-jaehrlich" />
                <Label htmlFor="r-jaehrlich">Jährlich</Label>
            </div>
            <div className="flex items-center gap-2">
                <RadioGroupItem value="einmalig" id="r-einmalig" disabled />
                <Label htmlFor="r-einmalig">Einmalig (nicht verfügbar)</Label>
            </div>
        </RadioGroup>
    ),
};
