import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';

const meta = {
    title: 'Molecules/Popover',
    component: Popover,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A trigger button opening a small form field, the typical use of a popover. */
export const Default: Story = {
    render: () => (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">Erinnerung festlegen</Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="erinnerung">Tage vorher</Label>
                    <Input id="erinnerung" type="number" defaultValue={2} />
                </div>
            </PopoverContent>
        </Popover>
    ),
};
