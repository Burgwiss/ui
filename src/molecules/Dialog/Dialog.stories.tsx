import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './Dialog';

const meta = {
    title: 'Molecules/Dialog',
    component: Dialog,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A dialog with a form field and cancel/confirm footer, the canonical case for `Dialog` over `AlertDialog`. */
export const LinkEinfuegen: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Link einfügen</Button>
            </DialogTrigger>
            <DialogContent closeLabel="Schließen">
                <DialogHeader>
                    <DialogTitle>Link einfügen</DialogTitle>
                    <DialogDescription>
                        Der markierte Text wird mit dieser Adresse verknüpft.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="link-url">Adresse</Label>
                    <Input id="link-url" type="url" placeholder="https://" />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Abbrechen</Button>
                    </DialogClose>
                    <Button>Einfügen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
};
