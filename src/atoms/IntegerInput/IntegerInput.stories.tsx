import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Label } from '../Label';
import { IntegerInput } from './IntegerInput';

const meta = {
    title: 'Atoms/IntegerInput',
    component: IntegerInput,
    tags: ['autodocs'],
    args: { value: 60, onValueChange: () => {} },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof IntegerInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function DurationField() {
    const [minutes, setMinutes] = useState(60);
    return (
        <div className="flex w-56 flex-col gap-1.5">
            <Label htmlFor="dauer">Dauer in Minuten</Label>
            <IntegerInput
                id="dauer"
                value={minutes}
                onValueChange={setMinutes}
                min={5}
                max={720}
                emptyValue={0}
            />
            <p className="text-xs text-muted-foreground">Wert: {minutes}</p>
        </div>
    );
}

/** A duration field with `min`/`max`: type a leading zero, clear it, or overshoot to see the behaviour. */
export const Controlled: Story = {
    render: () => <DurationField />,
};
