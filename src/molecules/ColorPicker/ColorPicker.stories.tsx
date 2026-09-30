import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Label } from '../../atoms/Label';
import { ColorPicker } from './ColorPicker';

const meta = {
    title: 'Molecules/ColorPicker',
    component: ColorPicker,
    tags: ['autodocs'],
    args: {
        id: 'primaerfarbe',
        value: 'oklch(0.62 0.13 230)',
        onChange: () => {},
        swatchAriaLabel: 'Farbe auswählen',
    },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof ColorPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function PrimaryColour() {
    const [value, setValue] = useState('oklch(0.62 0.13 230)');
    return (
        <div className="flex w-72 flex-col gap-1.5">
            <Label htmlFor="primaerfarbe">Primärfarbe</Label>
            <ColorPicker
                id="primaerfarbe"
                value={value}
                onChange={setValue}
                swatchAriaLabel="Primärfarbe auswählen"
            />
        </div>
    );
}

/** A theme colour field with a label, holding its value in local state. */
export const Default: Story = {
    render: () => <PrimaryColour />,
};
