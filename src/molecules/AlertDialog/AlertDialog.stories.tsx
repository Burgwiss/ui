import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../atoms/Button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './AlertDialog';

const meta = {
    title: 'Molecules/AlertDialog',
    component: AlertDialog,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The destructive confirm: a trigger button, a consequence sentence, cancel and confirm. */
export const KursLoeschen: Story = {
    render: () => (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Kurs löschen</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Kurs wirklich löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Der Kurs kann 30 Tage lang wiederhergestellt werden.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction>Löschen</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    ),
};
