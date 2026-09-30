import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from './Command';

function List({ onSelect = () => {} }: { onSelect?: (v: string) => void }) {
    return (
        <Command label="Befehle">
            <CommandInput placeholder="Suchen…" aria-label="Suchen" />
            <CommandList>
                <CommandEmpty>Keine Treffer</CommandEmpty>
                <CommandGroup heading="Kurse">
                    <CommandItem onSelect={onSelect}>Kurs anlegen</CommandItem>
                    <CommandItem onSelect={onSelect}>Kurs duplizieren</CommandItem>
                    <CommandItem disabled onSelect={onSelect}>
                        Kurs archivieren
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </Command>
    );
}

describe('Command', () => {
    it('lists the items under their group heading', () => {
        render(<List />);
        expect(screen.getAllByRole('option')).toHaveLength(3);
        expect(screen.getByText('Kurse')).toBeInTheDocument();
    });

    it('filters as the user types and shows the empty state when nothing matches', async () => {
        const user = userEvent.setup();
        render(<List />);
        await user.type(screen.getByRole('combobox', { name: 'Befehle' }), 'dupli');
        expect(screen.getAllByRole('option')).toHaveLength(1);
        expect(screen.getByRole('option', { name: 'Kurs duplizieren' })).toBeInTheDocument();

        await user.clear(screen.getByRole('combobox'));
        await user.type(screen.getByRole('combobox'), 'zzz');
        expect(screen.queryByRole('option')).toBeNull();
        expect(screen.getByText('Keine Treffer')).toBeInTheDocument();
    });

    it('selects an item on click and on Enter', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(<List onSelect={onSelect} />);

        await user.click(screen.getByRole('option', { name: 'Kurs anlegen' }));
        expect(onSelect).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole('combobox'));
        await user.keyboard('{ArrowDown}{Enter}');
        expect(onSelect).toHaveBeenCalledTimes(2);
    });

    it('a disabled item is not selectable', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(<List onSelect={onSelect} />);
        await user.click(screen.getByRole('option', { name: 'Kurs archivieren' }));
        expect(onSelect).not.toHaveBeenCalled();
    });

    it('shouldFilter={false} leaves filtering to the caller', async () => {
        const user = userEvent.setup();
        render(
            <Command shouldFilter={false} label="Befehle">
                <CommandInput />
                <CommandList>
                    <CommandItem>Server-Treffer</CommandItem>
                </CommandList>
            </Command>,
        );
        await user.type(screen.getByRole('combobox'), 'ganz anders');
        expect(screen.getByRole('option', { name: 'Server-Treffer' })).toBeInTheDocument();
    });
});

describe('CommandSeparator', () => {
    it('renders a divider between groups', () => {
        const { container } = render(
            <Command label="Befehle">
                <CommandList>
                    <CommandGroup heading="A">
                        <CommandItem>Eins</CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="B">
                        <CommandItem>Zwei</CommandItem>
                    </CommandGroup>
                </CommandList>
            </Command>,
        );
        expect(container.querySelector('[data-slot="command-separator"]')).not.toBeNull();
    });
});

describe('CommandDialog', () => {
    it('renders a named modal with a visually hidden title/description and a named close button', () => {
        render(
            <CommandDialog
                open
                onOpenChange={() => {}}
                title="Befehlspalette"
                description="Befehl suchen und ausführen"
                closeLabel="Palette schließen"
            >
                <CommandInput aria-label="Suchen" />
                <CommandList>
                    <CommandItem>Kurs anlegen</CommandItem>
                </CommandList>
            </CommandDialog>,
        );
        const dialog = screen.getByRole('dialog', { name: 'Befehlspalette' });
        expect(dialog).toHaveAccessibleDescription('Befehl suchen und ausführen');
        expect(screen.getByRole('button', { name: 'Palette schließen' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Kurs anlegen' })).toBeInTheDocument();
    });
});
