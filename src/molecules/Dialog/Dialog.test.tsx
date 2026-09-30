import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

function Fixture({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
    return (
        <Dialog onOpenChange={onOpenChange}>
            <DialogTrigger>Öffnen</DialogTrigger>
            <DialogContent closeLabel="Dialog schließen">
                <DialogHeader>
                    <DialogTitle>Link einfügen</DialogTitle>
                    <DialogDescription>Adresse eingeben</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose>Abbrechen</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

describe('Dialog', () => {
    it('is closed until the trigger is used, then opens as a named modal', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        expect(screen.queryByRole('dialog')).toBeNull();

        await user.click(screen.getByRole('button', { name: 'Öffnen' }));
        const dialog = screen.getByRole('dialog', { name: 'Link einfügen' });
        expect(dialog).toHaveAccessibleDescription('Adresse eingeben');
    });

    it('the corner close button is named by closeLabel and closes the dialog', async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        render(<Fixture onOpenChange={onOpenChange} />);
        await user.click(screen.getByRole('button', { name: 'Öffnen' }));

        await user.click(screen.getByRole('button', { name: 'Dialog schließen' }));
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes on Escape', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        await user.click(screen.getByRole('button', { name: 'Öffnen' }));
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('DialogClose closes it too', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        await user.click(screen.getByRole('button', { name: 'Öffnen' }));
        await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('moves focus into the dialog and returns it to the trigger on close', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        const trigger = screen.getByRole('button', { name: 'Öffnen' });
        await user.click(trigger);
        expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
        await user.keyboard('{Escape}');
        expect(trigger).toHaveFocus();
    });

    it('can be controlled through `open`', () => {
        const { rerender } = render(
            <Dialog open>
                <DialogContent closeLabel="Schließen">
                    <DialogTitle>Titel</DialogTitle>
                </DialogContent>
            </Dialog>,
        );
        expect(screen.getByRole('dialog', { name: 'Titel' })).toBeInTheDocument();
        rerender(
            <Dialog open={false}>
                <DialogContent closeLabel="Schließen">
                    <DialogTitle>Titel</DialogTitle>
                </DialogContent>
            </Dialog>,
        );
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('anchors to the top on phones and centres from sm up', () => {
        render(
            <Dialog open>
                <DialogContent closeLabel="Schließen">
                    <DialogTitle>Titel</DialogTitle>
                </DialogContent>
            </Dialog>,
        );
        const cls = screen.getByRole('dialog').className;
        expect(cls).toContain('top-4');
        expect(cls).toContain('sm:top-1/2');
    });

    it('forwards the content ref and merges className', () => {
        const ref = createRef<HTMLDivElement>();
        render(
            <Dialog open>
                <DialogContent ref={ref} closeLabel="Schließen" className="max-w-2xl">
                    <DialogTitle>Titel</DialogTitle>
                </DialogContent>
            </Dialog>,
        );
        expect(ref.current).toBe(screen.getByRole('dialog'));
        expect(ref.current?.className).toContain('max-w-2xl');
    });
});
