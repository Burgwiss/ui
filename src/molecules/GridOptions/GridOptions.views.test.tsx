import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useGridPreferences } from '../../hooks';
import type { GridView } from '../../hooks/useGridPreferences';
import { GridOptions } from './GridOptions';
import type { GridOptionsViews, GridViewsLabels } from './GridViews';

afterEach(() => localStorage.clear());

const LABELS: GridViewsLabels = {
    trigger: 'Ansichten',
    save: 'Aktuelle Ansicht speichern …',
    saveTitle: 'Ansicht speichern',
    name: 'Name der Ansicht',
    confirm: 'Speichern',
    update: 'Aktive Ansicht aktualisieren',
    rename: 'Ansicht umbenennen …',
    renameTitle: 'Ansicht umbenennen',
    delete: 'Ansicht löschen …',
    deleteConfirm: 'Löschen',
    confirmDelete: (name) =>
        `Die Ansicht „${name}“ wird gelöscht. Das lässt sich nicht rückgängig machen.`,
    cancel: 'Abbrechen',
    empty: 'Noch keine Ansichten gespeichert.',
    modified: 'geändert',
    nameRequired: 'Bitte einen Namen eingeben.',
    closeLabel: 'Schließen',
};

const OPTION_LABELS = {
    trigger: 'Tabellenoptionen',
    columns: 'Spalten',
    density: 'Zeilenhöhe',
    comfortable: 'Bequem',
    compact: 'Kompakt',
    selection: 'Zeilen auswählen',
    reset: 'Zurücksetzen',
};

const VIEWS: GridView[] = [
    { id: 'v1', name: 'Unbezahlt diesen Monat', state: {} },
    { id: 'v2', name: 'Nur Arabisch', state: {} },
];

type ViewsProps = Partial<Omit<GridOptionsViews, 'labels'>>;

function Harness({ views }: { views?: GridOptionsViews }) {
    const prefs = useGridPreferences('views.test');
    return (
        <GridOptions
            preferences={prefs}
            columns={[{ id: 'title', label: 'Kurs', hideable: false }]}
            labels={OPTION_LABELS}
            views={views}
        />
    );
}

function setup(props: ViewsProps = {}) {
    const handlers = {
        onApply: vi.fn(),
        onSave: vi.fn(),
        onUpdate: vi.fn(),
        onRename: vi.fn(),
        onDelete: vi.fn(),
    };
    const user = userEvent.setup();
    render(
        <Harness
            views={{
                views: VIEWS,
                activeViewId: null,
                isModified: false,
                labels: LABELS,
                ...handlers,
                ...props,
            }}
        />,
    );
    return { ...handlers, user };
}

type User = ReturnType<typeof userEvent.setup>;

const trigger = () => screen.getByRole('button', { name: 'Tabellenoptionen' });

/** The "Ansichten" entry of the ⋮ menu; its name also carries the active view and "geändert". */
const viewsEntry = (menu: HTMLElement) =>
    within(menu).getByRole('menuitem', { name: /^Ansichten/ });

/**
 * Opens ⋮, then the "Ansichten" submenu by keyboard (→). Pointer moves into a submenu rely on
 * layout (Radix's pointer-grace triangle), which jsdom does not have.
 */
async function openMenu(user: User) {
    await user.click(trigger());
    const root = await screen.findByRole('menu');
    viewsEntry(root).focus();
    await user.keyboard('{ArrowRight}');
    const menus = await screen.findAllByRole('menu');
    return menus[menus.length - 1] as HTMLElement;
}

/** Opens the submenu and chooses the item by its accessible name. */
async function choose(user: User, name: string | RegExp) {
    const menu = await openMenu(user);
    await user.click(within(menu).getByRole('menuitem', { name }));
}

describe('GridOptions views — the ⋮ button', () => {
    it('shows no dot while the setup matches the view', () => {
        setup({ activeViewId: 'v1' });
        expect(trigger().querySelector('[data-modified-dot]')).toBeNull();
    });

    it('shows a dot when the setup differs from the view', () => {
        setup({ activeViewId: 'v1', isModified: true });
        expect(trigger().querySelector('[data-modified-dot]')).not.toBeNull();
    });

    it('shows the dot when modified even with no active view', () => {
        setup({ activeViewId: null, isModified: true });
        expect(trigger().querySelector('[data-modified-dot]')).not.toBeNull();
    });

    it('hides the dot from assistive tech and keeps the button name unchanged', () => {
        setup({ activeViewId: 'v1', isModified: true });
        expect(trigger().querySelector('[data-modified-dot]')).toHaveAttribute(
            'aria-hidden',
            'true',
        );
        expect(trigger()).toHaveAccessibleName('Tabellenoptionen');
    });
});

describe('GridOptions views — the "Ansichten" entry', () => {
    it('opens a submenu, and is the first entry of the ⋮ menu', async () => {
        const { user } = setup();
        await user.click(trigger());
        const root = await screen.findByRole('menu');
        const entries = within(root).getAllByRole('menuitem');
        expect(entries[0]).toHaveAccessibleName('Ansichten');
        expect(entries[0]).toHaveAttribute('aria-haspopup', 'menu');
        expect(entries[1]).toHaveAccessibleName('Spalten');
    });

    it('is absent when GridOptions gets no views', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        expect(trigger().querySelector('[data-modified-dot]')).toBeNull();
        await user.click(trigger());
        const root = await screen.findByRole('menu');
        expect(within(root).queryByRole('menuitem', { name: /Ansichten/ })).toBeNull();
        expect(within(root).getAllByRole('menuitem')[0]).toHaveAccessibleName('Spalten');
    });

    it('shows just the generic label when no view is active', async () => {
        const { user } = setup();
        await user.click(trigger());
        expect(viewsEntry(await screen.findByRole('menu'))).toHaveAccessibleName('Ansichten');
    });

    it('shows the active view name, muted, after the label', async () => {
        const { user } = setup({ activeViewId: 'v2' });
        await user.click(trigger());
        const entry = viewsEntry(await screen.findByRole('menu'));
        expect(entry).toHaveAccessibleName('Ansichten Nur Arabisch');
        expect(within(entry).getByText('Nur Arabisch')).toHaveClass('text-muted-foreground');
        expect(within(entry).getByText('Nur Arabisch')).toHaveClass('truncate');
    });

    it('falls back to the generic label when the active id is unknown', async () => {
        const { user } = setup({ activeViewId: 'gone' });
        await user.click(trigger());
        expect(viewsEntry(await screen.findByRole('menu'))).toHaveAccessibleName('Ansichten');
    });

    it('has no "geändert" marker while unmodified', async () => {
        const { user } = setup({ activeViewId: 'v1' });
        await user.click(trigger());
        const entry = viewsEntry(await screen.findByRole('menu'));
        expect(entry).toHaveAccessibleName('Ansichten Unbezahlt diesen Monat');
        expect(entry).not.toHaveTextContent('geändert');
    });

    it('announces "geändert" when the setup differs from the view', async () => {
        const { user } = setup({ activeViewId: 'v1', isModified: true });
        await user.click(trigger());
        const entry = viewsEntry(await screen.findByRole('menu'));
        expect(entry).toHaveAccessibleName('Ansichten Unbezahlt diesen Monat geändert');
        expect(entry.querySelector('[data-modified-dot]')).toHaveAttribute('aria-hidden', 'true');
    });

    it('marks a modified setup even when no view is active', async () => {
        const { user } = setup({ activeViewId: null, isModified: true });
        await user.click(trigger());
        expect(viewsEntry(await screen.findByRole('menu'))).toHaveAccessibleName(
            'Ansichten geändert',
        );
    });
});

describe('GridOptions views — submenu', () => {
    it('lists the views as radio items, none checked without an active view', async () => {
        const { user } = setup();
        const menu = await openMenu(user);
        const radios = within(menu).getAllByRole('menuitemradio');
        expect(radios.map((r) => r.textContent)).toEqual([
            'Unbezahlt diesen Monat',
            'Nur Arabisch',
        ]);
        for (const radio of radios) expect(radio).not.toBeChecked();
    });

    it('checks the active view', async () => {
        const { user } = setup({ activeViewId: 'v2' });
        const menu = await openMenu(user);
        expect(within(menu).getByRole('menuitemradio', { name: 'Nur Arabisch' })).toBeChecked();
        expect(
            within(menu).getByRole('menuitemradio', { name: 'Unbezahlt diesen Monat' }),
        ).not.toBeChecked();
    });

    it('applies the chosen view', async () => {
        const { user, onApply } = setup({ activeViewId: 'v2' });
        const menu = await openMenu(user);
        await user.click(
            within(menu).getByRole('menuitemradio', { name: 'Unbezahlt diesen Monat' }),
        );
        expect(onApply).toHaveBeenCalledExactlyOnceWith('v1');
    });

    it('choosing the already-active view applies it again, which reverts a modified setup', async () => {
        const { user, onApply } = setup({ activeViewId: 'v1', isModified: true });
        const menu = await openMenu(user);
        await user.click(
            within(menu).getByRole('menuitemradio', { name: 'Unbezahlt diesen Monat' }),
        );
        expect(onApply).toHaveBeenCalledExactlyOnceWith('v1');
    });

    it('applies from the keyboard: → opens the submenu on the first view, ArrowDown moves on', async () => {
        const { user, onApply } = setup();
        trigger().focus();
        await user.keyboard('{Enter}');
        await screen.findByRole('menu');
        // The "Ansichten" entry is the menu's first item, so it holds focus on open.
        await user.keyboard('{ArrowRight}');
        await screen.findAllByRole('menu');
        await user.keyboard('{ArrowDown}{Enter}');
        expect(onApply).toHaveBeenCalledExactlyOnceWith('v2');
    });

    it('choosing a view closes the whole menu and gives focus back to the ⋮ button', async () => {
        const { user } = setup();
        const menu = await openMenu(user);
        await user.click(within(menu).getByRole('menuitemradio', { name: 'Nur Arabisch' }));
        await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
        await waitFor(() => expect(trigger()).toHaveFocus());
    });

    it('"update" closes the whole menu and gives focus back to the ⋮ button', async () => {
        const { user } = setup({ activeViewId: 'v1', isModified: true });
        await choose(user, 'Aktive Ansicht aktualisieren');
        await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
        await waitFor(() => expect(trigger()).toHaveFocus());
    });

    it('opens no dialog after a plain choice like applying a view', async () => {
        const { user } = setup();
        const menu = await openMenu(user);
        await user.click(within(menu).getByRole('menuitemradio', { name: 'Nur Arabisch' }));
        await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    it('says so when there are no views, and still offers to save', async () => {
        const { user } = setup({ views: [] });
        const menu = await openMenu(user);
        expect(within(menu).getByText('Noch keine Ansichten gespeichert.')).toBeInTheDocument();
        expect(within(menu).queryAllByRole('menuitemradio')).toHaveLength(0);
        expect(
            within(menu).getByRole('menuitem', { name: 'Aktuelle Ansicht speichern …' }),
        ).toBeInTheDocument();
    });

    it('offers only "save" without an active view', async () => {
        const { user } = setup();
        const menu = await openMenu(user);
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((i) => i.textContent),
        ).toEqual(['Aktuelle Ansicht speichern …']);
    });

    it('offers rename and delete for the active view', async () => {
        const { user } = setup({ activeViewId: 'v1' });
        const menu = await openMenu(user);
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((i) => i.textContent),
        ).toEqual(['Aktuelle Ansicht speichern …', 'Ansicht umbenennen …', 'Ansicht löschen …']);
    });

    it('offers "update" only when modified', async () => {
        const { user } = setup({ activeViewId: 'v1', isModified: true });
        const menu = await openMenu(user);
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((i) => i.textContent),
        ).toEqual([
            'Aktuelle Ansicht speichern …',
            'Aktive Ansicht aktualisieren',
            'Ansicht umbenennen …',
            'Ansicht löschen …',
        ]);
    });

    it('offers no "update" without an active view, even when modified', async () => {
        const { user } = setup({ activeViewId: null, isModified: true });
        const menu = await openMenu(user);
        expect(
            within(menu).queryByRole('menuitem', { name: 'Aktive Ansicht aktualisieren' }),
        ).toBeNull();
    });

    it('offers no "update" without an onUpdate handler', async () => {
        const { user } = setup({ activeViewId: 'v1', isModified: true, onUpdate: undefined });
        const menu = await openMenu(user);
        expect(
            within(menu).queryByRole('menuitem', { name: 'Aktive Ansicht aktualisieren' }),
        ).toBeNull();
    });

    it('"update" reports the active view id', async () => {
        const { user, onUpdate } = setup({ activeViewId: 'v2', isModified: true });
        await choose(user, 'Aktive Ansicht aktualisieren');
        expect(onUpdate).toHaveBeenCalledExactlyOnceWith('v2');
    });
});

describe('GridOptions views — save', () => {
    async function openSave(user: User) {
        await choose(user, 'Aktuelle Ansicht speichern …');
        return screen.findByRole('dialog', { name: 'Ansicht speichern' });
    }

    it('opens a dialog with a labelled, empty name input', async () => {
        const { user } = setup();
        const dialog = await openSave(user);
        const input = within(dialog).getByRole('textbox', { name: 'Name der Ansicht' });
        expect(input).toHaveValue('');
        await waitFor(() => expect(input).toHaveFocus());
    });

    it('saves the typed name, trimmed, and closes', async () => {
        const { user, onSave } = setup();
        const dialog = await openSave(user);
        await user.type(within(dialog).getByRole('textbox'), '  Neue Ansicht  ');
        await user.click(within(dialog).getByRole('button', { name: 'Speichern' }));
        expect(onSave).toHaveBeenCalledExactlyOnceWith('Neue Ansicht');
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('Enter submits', async () => {
        const { user, onSave } = setup();
        await openSave(user);
        await user.keyboard('Kurse{Enter}');
        expect(onSave).toHaveBeenCalledExactlyOnceWith('Kurse');
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('an empty name is refused with an error and the dialog stays open', async () => {
        const { user, onSave } = setup();
        const dialog = await openSave(user);
        await user.click(within(dialog).getByRole('button', { name: 'Speichern' }));
        expect(onSave).not.toHaveBeenCalled();
        const input = within(dialog).getByRole('textbox');
        expect(within(dialog).getByRole('alert')).toHaveTextContent('Bitte einen Namen eingeben.');
        expect(input).toBeInvalid();
        expect(input).toHaveAccessibleDescription('Bitte einen Namen eingeben.');
        expect(input).toHaveFocus();
    });

    it('a name of only spaces is refused, also via Enter', async () => {
        const { user, onSave } = setup();
        const dialog = await openSave(user);
        await user.keyboard('   {Enter}');
        expect(onSave).not.toHaveBeenCalled();
        expect(within(dialog).getByRole('alert')).toBeInTheDocument();
    });

    it('shows no error before the first attempt, and clears it once typing starts', async () => {
        const { user } = setup();
        const dialog = await openSave(user);
        expect(within(dialog).queryByRole('alert')).toBeNull();
        expect(within(dialog).getByRole('textbox')).toBeValid();
        await user.keyboard('{Enter}');
        expect(within(dialog).getByRole('alert')).toBeInTheDocument();
        await user.keyboard('K');
        expect(within(dialog).queryByRole('alert')).toBeNull();
    });

    it('Abbrechen closes without saving', async () => {
        const { user, onSave } = setup();
        const dialog = await openSave(user);
        await user.type(within(dialog).getByRole('textbox'), 'Kurse');
        await user.click(within(dialog).getByRole('button', { name: 'Abbrechen' }));
        expect(onSave).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('Escape closes without saving, and the corner button has its label', async () => {
        const { user, onSave } = setup();
        const dialog = await openSave(user);
        expect(within(dialog).getByRole('button', { name: 'Schließen' })).toBeInTheDocument();
        await user.keyboard('{Escape}');
        expect(onSave).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('starts empty again the next time it opens', async () => {
        const { user } = setup();
        const dialog = await openSave(user);
        await user.type(within(dialog).getByRole('textbox'), 'halb');
        await user.keyboard('{Escape}');
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        const again = await openSave(user);
        expect(within(again).getByRole('textbox')).toHaveValue('');
    });

    it('returns focus to the trigger when it closes', async () => {
        const { user } = setup();
        await openSave(user);
        await user.keyboard('{Escape}');
        await waitFor(() => expect(trigger()).toHaveFocus());
    });

    it('does not fire while composing with an IME', async () => {
        const { user, onSave } = setup();
        const dialog = await openSave(user);
        const input = within(dialog).getByRole('textbox');
        await user.type(input, 'ab');
        input.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, isComposing: true }),
        );
        expect(onSave).not.toHaveBeenCalled();
    });
});

describe('GridOptions views — rename', () => {
    async function openRename(user: User) {
        await choose(user, 'Ansicht umbenennen …');
        return screen.findByRole('dialog', { name: 'Ansicht umbenennen' });
    }

    it('opens prefilled with the active name', async () => {
        const { user } = setup({ activeViewId: 'v2' });
        const dialog = await openRename(user);
        expect(within(dialog).getByRole('textbox', { name: 'Name der Ansicht' })).toHaveValue(
            'Nur Arabisch',
        );
    });

    it('reports the id and the trimmed new name', async () => {
        const { user, onRename } = setup({ activeViewId: 'v2' });
        const dialog = await openRename(user);
        const input = within(dialog).getByRole('textbox');
        await user.clear(input);
        await user.type(input, ' Arabisch A1 {Enter}');
        expect(onRename).toHaveBeenCalledExactlyOnceWith('v2', 'Arabisch A1');
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('confirm button works too', async () => {
        const { user, onRename } = setup({ activeViewId: 'v1' });
        const dialog = await openRename(user);
        await user.type(within(dialog).getByRole('textbox'), ' 2');
        await user.click(within(dialog).getByRole('button', { name: 'Speichern' }));
        expect(onRename).toHaveBeenCalledExactlyOnceWith('v1', 'Unbezahlt diesen Monat 2');
    });

    it('an emptied name is refused', async () => {
        const { user, onRename } = setup({ activeViewId: 'v1' });
        const dialog = await openRename(user);
        await user.clear(within(dialog).getByRole('textbox'));
        await user.keyboard('{Enter}');
        expect(onRename).not.toHaveBeenCalled();
        expect(within(dialog).getByRole('alert')).toHaveTextContent('Bitte einen Namen eingeben.');
    });

    it('an unchanged name just closes', async () => {
        const { user, onRename } = setup({ activeViewId: 'v1' });
        await openRename(user);
        await user.keyboard('{Enter}');
        expect(onRename).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    });

    it('cancel does not rename', async () => {
        const { user, onRename } = setup({ activeViewId: 'v1' });
        const dialog = await openRename(user);
        await user.type(within(dialog).getByRole('textbox'), 'x');
        await user.click(within(dialog).getByRole('button', { name: 'Abbrechen' }));
        expect(onRename).not.toHaveBeenCalled();
    });
});

describe('GridOptions views — delete', () => {
    async function openDelete(user: User) {
        await choose(user, 'Ansicht löschen …');
        return screen.findByRole('alertdialog');
    }

    it('asks first, naming the view, and deletes nothing yet', async () => {
        const { user, onDelete } = setup({ activeViewId: 'v2' });
        const dialog = await openDelete(user);
        expect(dialog).toHaveTextContent(
            'Die Ansicht „Nur Arabisch“ wird gelöscht. Das lässt sich nicht rückgängig machen.',
        );
        expect(onDelete).not.toHaveBeenCalled();
    });

    it('confirming deletes the active view', async () => {
        const { user, onDelete } = setup({ activeViewId: 'v2' });
        const dialog = await openDelete(user);
        await user.click(within(dialog).getByRole('button', { name: 'Löschen' }));
        expect(onDelete).toHaveBeenCalledExactlyOnceWith('v2');
        await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    });

    it('cancelling deletes nothing', async () => {
        const { user, onDelete } = setup({ activeViewId: 'v2' });
        const dialog = await openDelete(user);
        await user.click(within(dialog).getByRole('button', { name: 'Abbrechen' }));
        expect(onDelete).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    });

    it('Escape deletes nothing', async () => {
        const { user, onDelete } = setup({ activeViewId: 'v2' });
        await openDelete(user);
        await user.keyboard('{Escape}');
        expect(onDelete).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    });

    it('gives focus back to the trigger afterwards', async () => {
        const { user } = setup({ activeViewId: 'v2' });
        await openDelete(user);
        await user.keyboard('{Escape}');
        await waitFor(() => expect(trigger()).toHaveFocus());
    });
});
