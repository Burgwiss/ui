import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../../atoms/Label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
    nativeSelectClass,
} from './Select';

const meta = {
    title: 'Molecules/Select',
    component: Select,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A labelled select with a group, a separator and a disabled option, starting on a chosen value. */
export const Default: Story = {
    render: () => (
        <div className="flex w-64 flex-col gap-1.5">
            <Label htmlFor="sprache">Kurssprache</Label>
            <Select defaultValue="de">
                <SelectTrigger id="sprache">
                    <SelectValue placeholder="Sprache wählen" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Verfügbar</SelectLabel>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="en">Englisch</SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectItem value="fr" disabled>
                        Französisch (bald)
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    ),
};

/** With no `defaultValue` the trigger shows the `SelectValue` placeholder until something is chosen. */
export const Placeholder: Story = {
    render: () => (
        <div className="flex w-64 flex-col gap-1.5">
            <Label htmlFor="stufe">Niveau</Label>
            <Select>
                <SelectTrigger id="stufe">
                    <SelectValue placeholder="Niveau wählen" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="a1">A1</SelectItem>
                    <SelectItem value="a2">A2</SelectItem>
                </SelectContent>
            </Select>
        </div>
    ),
};

/** Use a native `<select>` with `nativeSelectClass` when the OS picker is better, e.g. long lists on a phone. */
export const Native: Story = {
    render: () => (
        <div className="flex w-64 flex-col gap-1.5">
            <Label htmlFor="land">Land</Label>
            <select id="land" className={nativeSelectClass} defaultValue="de">
                <option value="de">Deutschland</option>
                <option value="at">Österreich</option>
                <option value="ch">Schweiz</option>
            </select>
        </div>
    ),
};
