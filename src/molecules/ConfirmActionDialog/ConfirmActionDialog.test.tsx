import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ConfirmActionDialog, type ConfirmActionDialogProps } from './ConfirmActionDialog';

function setup(over: Partial<ConfirmActionDialogProps> = {}) {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(
        <ConfirmActionDialog
            open
            onOpenChange={onOpenChange}
            title="Kurs archivieren?"
            description="Der Kurs wird ausgeblendet."
            confirmLabel="Archivieren"
            cancelLabel="Abbrechen"
            onConfirm={onConfirm}
            {...over}
        />,
    );
    return { onOpenChange, onConfirm };
}

describe('ConfirmActionDialog', () => {
    it('renders nothing while closed', () => {
        setup({ open: false });
        expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('shows title, description and both labels from props', () => {
        setup();
        const dialog = screen.getByRole('alertdialog', { name: 'Kurs archivieren?' });
        expect(dialog).toHaveAccessibleDescription('Der Kurs wird ausgeblendet.');
        expect(screen.getByRole('button', { name: 'Archivieren' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeInTheDocument();
    });

    it('confirming runs onConfirm and asks to close', async () => {
        const user = userEvent.setup();
        const { onConfirm, onOpenChange } = setup();
        await user.click(screen.getByRole('button', { name: 'Archivieren' }));
        expect(onConfirm).toHaveBeenCalledOnce();
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('cancelling closes without confirming', async () => {
        const user = userEvent.setup();
        const { onConfirm, onOpenChange } = setup();
        await user.click(screen.getByRole('button', { name: 'Abbrechen' }));
        expect(onConfirm).not.toHaveBeenCalled();
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('Escape asks to close and does not confirm', async () => {
        const user = userEvent.setup();
        const { onConfirm, onOpenChange } = setup();
        await user.keyboard('{Escape}');
        expect(onOpenChange).toHaveBeenCalledWith(false);
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('closeOnConfirm={false} keeps the dialog up but still runs onConfirm', async () => {
        const user = userEvent.setup();
        const { onConfirm, onOpenChange } = setup({ closeOnConfirm: false });
        await user.click(screen.getByRole('button', { name: 'Archivieren' }));
        expect(onConfirm).toHaveBeenCalledOnce();
        expect(onOpenChange).not.toHaveBeenCalledWith(false);
        expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('the destructive variant (default) uses the destructive token; "default" does not', () => {
        const { unmount } = render(
            <ConfirmActionDialog
                open
                onOpenChange={() => {}}
                title="T"
                description="D"
                confirmLabel="Ja"
                cancelLabel="Nein"
                onConfirm={() => {}}
            />,
        );
        expect(screen.getByRole('button', { name: 'Ja' }).className).toContain('bg-destructive');
        unmount();

        render(
            <ConfirmActionDialog
                open
                onOpenChange={() => {}}
                title="T"
                description="D"
                confirmLabel="Ja"
                cancelLabel="Nein"
                variant="default"
                onConfirm={() => {}}
            />,
        );
        expect(screen.getByRole('button', { name: 'Ja' }).className).not.toContain(
            'bg-destructive',
        );
    });

    it('renders children between the description and the buttons', () => {
        setup({
            children: (
                <label>
                    Auch Folgetermine
                    <input type="checkbox" />
                </label>
            ),
        });
        const dialog = screen.getByRole('alertdialog');
        const order = Array.from(dialog.querySelectorAll('p, label, button')).map((n) => n.tagName);
        expect(order.indexOf('LABEL')).toBeGreaterThan(order.indexOf('P'));
        expect(order.indexOf('LABEL')).toBeLessThan(order.indexOf('BUTTON'));
        expect(screen.getByRole('checkbox', { name: 'Auch Folgetermine' })).toBeInTheDocument();
    });

    it('accepts rich content as the description', () => {
        setup({ description: <strong>Achtung: endgültig</strong> });
        expect(screen.getByText('Achtung: endgültig').tagName).toBe('STRONG');
    });
});
