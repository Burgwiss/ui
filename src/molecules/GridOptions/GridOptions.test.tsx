import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { gridPreferencesKey, useGridPreferences } from '../../hooks';
import { GridOptions } from './GridOptions';

afterEach(() => localStorage.clear());

const LABELS = {
    trigger: 'Tabellenoptionen',
    columns: 'Spalten',
    density: 'Zeilenhöhe',
    comfortable: 'Bequem',
    compact: 'Kompakt',
    selection: 'Zeilen auswählen',
    reset: 'Zurücksetzen',
};
const COLUMNS = [
    { id: 'title', label: 'Kurs', hideable: false },
    { id: 'code', label: 'Kürzel' },
];

function Harness({ canSelect = true }: { canSelect?: boolean }) {
    const prefs = useGridPreferences('admin.courses');
    return (
        <>
            <GridOptions
                preferences={prefs}
                columns={COLUMNS}
                labels={LABELS}
                canSelect={canSelect}
            />
            <output data-testid="state">{JSON.stringify(prefs.values)}</output>
        </>
    );
}
const state = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}');

async function open() {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Tabellenoptionen' }));
    return { user, menu: await screen.findByRole('menu') };
}
/**
 * Open "Spalten" by keyboard: →. Pointer moves into a submenu rely on layout
 * (Radix's pointer-grace triangle), which jsdom does not have — the browser
 * run covers the mouse path.
 */
async function openColumns(opened?: Awaited<ReturnType<typeof open>>) {
    const { user, menu } = opened ?? (await open());
    within(menu).getByRole('menuitem', { name: 'Spalten' }).focus();
    await user.keyboard('{ArrowRight}');
    const menus = await screen.findAllByRole('menu');
    return { user, sub: menus[menus.length - 1] as HTMLElement };
}

async function pick(user: ReturnType<typeof userEvent.setup>, item: HTMLElement) {
    item.focus();
    await user.keyboard(' ');
}

describe('GridOptions', () => {
    it('is an icon button with a name that opens a menu', async () => {
        render(<Harness />);
        const trigger = screen.getByRole('button', { name: 'Tabellenoptionen' });
        expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
        expect(trigger).toHaveTextContent('');
        await open();
    });

    it('keeps the columns behind a "Spalten" item that opens a submenu', async () => {
        render(<Harness />);
        const opened = await open();
        const spalten = within(opened.menu).getByRole('menuitem', { name: 'Spalten' });
        expect(spalten).toHaveAttribute('aria-haspopup', 'menu');
        expect(within(opened.menu).queryByRole('menuitemcheckbox', { name: 'Kürzel' })).toBeNull();
        const { sub } = await openColumns(opened);
        expect(within(sub).getByRole('menuitemcheckbox', { name: 'Kürzel' })).toBeChecked();
    });

    it('hides a column from the submenu, keeps it open, and remembers it', async () => {
        render(<Harness />);
        const { user, sub } = await openColumns();
        await pick(user, within(sub).getByRole('menuitemcheckbox', { name: 'Kürzel' }));
        expect(within(sub).getByRole('menuitemcheckbox', { name: 'Kürzel' })).not.toBeChecked();
        expect(state().hiddenColumns).toEqual(['code']);
        expect(localStorage.getItem(gridPreferencesKey('admin.courses'))).toContain('code');
    });

    it('never lets the naming column be hidden', async () => {
        render(<Harness />);
        const { user, sub } = await openColumns();
        const title = within(sub).getByRole('menuitemcheckbox', { name: 'Kurs' });
        expect(title).toHaveAttribute('aria-disabled', 'true');
        await pick(user, title);
        expect(state().hiddenColumns).toEqual([]);
    });

    it('switches density', async () => {
        render(<Harness />);
        const { user, menu } = await open();
        expect(within(menu).getByRole('menuitemradio', { name: 'Bequem' })).toBeChecked();
        await user.click(within(menu).getByRole('menuitemradio', { name: 'Kompakt' }));
        expect(state().density).toBe('compact');
    });

    it('switches row selection off and on', async () => {
        render(<Harness />);
        let { user, menu } = await open();
        const toggle = within(menu).getByRole('menuitemcheckbox', { name: 'Zeilen auswählen' });
        expect(toggle).toBeChecked();
        await user.click(toggle);
        expect(state().selection).toBe(false);
        ({ user, menu } = await open());
        await user.click(within(menu).getByRole('menuitemcheckbox', { name: 'Zeilen auswählen' }));
        expect(state().selection).toBe(true);
    });

    it('offers no selection switch where the grid cannot select', async () => {
        render(<Harness canSelect={false} />);
        const { menu } = await open();
        expect(
            within(menu).queryByRole('menuitemcheckbox', { name: 'Zeilen auswählen' }),
        ).toBeNull();
    });

    it('offers reset only once something changed, and reset forgets it', async () => {
        render(<Harness />);
        let { user, menu } = await open();
        expect(within(menu).getByRole('menuitem', { name: 'Zurücksetzen' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        await user.click(within(menu).getByRole('menuitemradio', { name: 'Kompakt' }));
        ({ user, menu } = await open());
        await user.click(within(menu).getByRole('menuitem', { name: 'Zurücksetzen' }));
        expect(state()).toEqual({ hiddenColumns: [], density: 'comfortable', selection: true });
        expect(localStorage.getItem(gridPreferencesKey('admin.courses'))).toBeNull();
    });

    it('opens with what was stored last time', async () => {
        const { result, unmount } = renderHook(() => useGridPreferences('admin.courses'));
        act(() => result.current.setColumnVisible('code', false));
        unmount();
        render(<Harness />);
        const { sub } = await openColumns();
        expect(within(sub).getByRole('menuitemcheckbox', { name: 'Kürzel' })).not.toBeChecked();
    });
});
