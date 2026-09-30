import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Label } from '../../atoms/Label';
import { Combobox } from './Combobox';

const meta = {
    title: 'Molecules/Combobox',
    component: Combobox,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const ZEITZONEN = ['Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich', 'Europe/London'];

function TimezoneField() {
    const [zone, setZone] = useState('Europe/Berlin');
    return (
        <div className="flex w-72 flex-col gap-1.5">
            <Label htmlFor="zeitzone">Zeitzone</Label>
            <Combobox
                id="zeitzone"
                value={zone}
                options={ZEITZONEN}
                onChange={setZone}
                searchPlaceholder="Zeitzone suchen"
                emptyLabel="Keine Zeitzone gefunden"
            />
        </div>
    );
}

/** A long list (time zones) made searchable, with its value held in local state. */
export const Default: Story = {
    args: {
        id: 'zeitzone',
        value: 'Europe/Berlin',
        options: ZEITZONEN,
        onChange: () => {},
        emptyLabel: 'Keine Zeitzone gefunden',
    },
    render: () => <TimezoneField />,
};
