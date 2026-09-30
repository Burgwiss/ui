import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

function Fixture({ onAction = () => {} }: { onAction?: () => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger>Löschen…</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Wirklich löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Das lässt sich nicht rückgängig machen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={onAction}>Löschen</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

describe('AlertDialog', () => {
    it('opens as an alertdialog named by its title and described by its description', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        expect(screen.queryByRole('alertdialog')).toBeNull();

        await user.click(screen.getByRole('button', { name: 'Löschen…' }));
        const dialog = screen.getByRole('alertdialog', { name: 'Wirklich löschen?' });
        expect(dialog).toHaveAccessibleDescription('Das lässt sich nicht rückgängig machen.');
    });

    it('Cancel closes without running the action', async () => {
        const user = userEvent.setup();
        const onAction = vi.fn();
        render(<Fixture onAction={onAction} />);
        await user.click(screen.getByRole('button', { name: 'Löschen…' }));
        await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
        expect(screen.queryByRole('alertdialog')).toBeNull();
        expect(onAction).not.toHaveBeenCalled();
    });

    it('Action runs the handler and closes', async () => {
        const user = userEvent.setup();
        const onAction = vi.fn();
        render(<Fixture onAction={onAction} />);
        await user.click(screen.getByRole('button', { name: 'Löschen…' }));
        await user.click(screen.getByRole('button', { name: 'Löschen' }));
        expect(onAction).toHaveBeenCalledOnce();
        expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('closes on Escape', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        await user.click(screen.getByRole('button', { name: 'Löschen…' }));
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('focuses the Cancel button first (the safe choice)', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        await user.click(screen.getByRole('button', { name: 'Löschen…' }));
        expect(screen.getByRole('button', { name: 'Abbrechen' })).toHaveFocus();
    });

    it('forwards refs on trigger, content, title, description and buttons', () => {
        const trigger = createRef<HTMLButtonElement>();
        const content = createRef<HTMLDivElement>();
        const title = createRef<HTMLHeadingElement>();
        const description = createRef<HTMLParagraphElement>();
        const action = createRef<HTMLButtonElement>();
        const cancel = createRef<HTMLButtonElement>();
        const header = createRef<HTMLDivElement>();
        const footer = createRef<HTMLDivElement>();
        render(
            <AlertDialog defaultOpen>
                <AlertDialogTrigger ref={trigger}>Öffnen</AlertDialogTrigger>
                <AlertDialogContent ref={content}>
                    <AlertDialogHeader ref={header}>
                        <AlertDialogTitle ref={title}>Titel</AlertDialogTitle>
                        <AlertDialogDescription ref={description}>Text</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter ref={footer}>
                        <AlertDialogCancel ref={cancel}>Nein</AlertDialogCancel>
                        <AlertDialogAction ref={action}>Ja</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>,
        );
        for (const r of [trigger, content, title, description, action, cancel, header, footer]) {
            expect(r.current).toBeInstanceOf(HTMLElement);
        }
    });
});
