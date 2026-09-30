import type { Meta, StoryObj } from '@storybook/react-vite';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from './Command';

const meta = {
    title: 'Molecules/Command',
    component: Command,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An inline palette with two groups, an empty message and one disabled item. */
export const Default: Story = {
    render: () => (
        <Command className="w-80 rounded-lg border border-border shadow-md" label="Befehle">
            <CommandInput placeholder="Befehl suchen…" aria-label="Befehl suchen" />
            <CommandList>
                <CommandEmpty>Keine Treffer</CommandEmpty>
                <CommandGroup heading="Kurse">
                    <CommandItem>Neuen Kurs anlegen</CommandItem>
                    <CommandItem>Kurs duplizieren</CommandItem>
                </CommandGroup>
                <CommandGroup heading="Teilnehmende">
                    <CommandItem>Teilnehmende einladen</CommandItem>
                    <CommandItem disabled>Teilnehmende exportieren</CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    ),
};
