import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../atoms/Button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from './Sheet';

const meta = {
    title: 'Organisms/Sheet',
    component: Sheet,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mobile navigation drawer: slides in from the left with a title, description and links. */
export const Navigation: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">Menü öffnen</Button>
            </SheetTrigger>
            <SheetContent side="left" closeLabel="Menü schließen" className="p-4">
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription>Springe zu einem Bereich.</SheetDescription>
                <nav aria-label="Hauptnavigation" className="flex flex-col gap-2 text-sm">
                    <a href="#kurse">Kurse</a>
                    <a href="#teilnehmende">Teilnehmende</a>
                </nav>
            </SheetContent>
        </Sheet>
    ),
};

/** Mobile bottom sheet for a choice: `side="bottom"` plus `showHandle`, with a `SheetClose` to cancel. */
export const BottomSheet: Story = {
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button>Kurs wählen</Button>
            </SheetTrigger>
            <SheetContent side="bottom" showHandle closeLabel="Schließen" className="p-4">
                <SheetTitle>Kurs wählen</SheetTitle>
                <p className="text-sm text-muted-foreground">Wähle den passenden Kurs aus.</p>
                <SheetClose asChild>
                    <Button variant="outline">Abbrechen</Button>
                </SheetClose>
            </SheetContent>
        </Sheet>
    ),
};
