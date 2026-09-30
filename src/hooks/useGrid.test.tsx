import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { GridActionItem, RowId } from './gridActions';
import { useGrid, type GridSelectionMode } from './useGrid';

/** Minimal rows for tests that only care about ids. */
const byIds = (ids: RowId[]) => ({
    rows: ids.map((id) => ({ id })),
    getRowId: (r: { id: RowId }) => r.id,
    columns: [{ id: 'id', header: 'Id' }],
});

afterEach(() => localStorage.clear());

const ROWS = [
    { id: 1, name: 'Eins' },
    { id: 2, name: 'Zwei' },
    { id: 3, name: 'Drei' },
    { id: 4, name: 'Vier' },
];

function Harness({
    mode = 'multiple',
    actions = [],
    rows = ROWS,
    onState,
}: {
    mode?: GridSelectionMode;
    actions?: GridActionItem[];
    rows?: typeof ROWS;
    onState?: (ids: RowId[]) => void;
}) {
    const grid = useGrid({
        id: 'test',
        rows,
        getRowId: (r) => r.id,
        columns: [{ id: 'name', header: 'Name' }],
        selection: mode,
        actions,
    });
    onState?.(grid.selectedIds);
    return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div onKeyDown={grid.onKeyDown} onContextMenu={grid.onContextMenu}>
            <output data-testid="sel">{grid.selectedIds.join(',')}</output>
            <table aria-label="Liste" {...grid.getTableProps()}>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id} {...grid.getRowProps(r.id)}>
                            {grid.showCheckboxes && (
                                <td>
                                    <input
                                        {...grid.getRowCheckboxProps(r.id, `${r.name} wählen`)}
                                    />
                                </td>
                            )}
                            <td>{r.name}</td>
                            <td>
                                <button type="button">Link {r.name}</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {grid.showCheckboxes && <input {...grid.getSelectAllProps('Alle')} />}
            <input type="search" aria-label="Suche" />
        </div>
    );
}

const sel = () => screen.getByTestId('sel').textContent;
const cell = (name: string) => screen.getByText(name);
const row = (name: string) => cell(name).closest('tr') as HTMLElement;

function action(id: string, extra: Partial<GridActionItem> = {}): GridActionItem {
    return { id, label: id, icon: null, onSelect: vi.fn(), ...extra };
}

describe('useGrid — mouse selection', () => {
    it('selects one row on click, replacing the previous one', async () => {
        render(<Harness />);
        await userEvent.click(cell('Eins'));
        expect(sel()).toBe('1');
        await userEvent.click(cell('Drei'));
        expect(sel()).toBe('3');
    });

    it('adds and removes a row with ⌘/Ctrl-click', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Eins'));
        await user.keyboard('{Control>}');
        await user.click(cell('Drei'));
        expect(sel()).toBe('1,3');
        await user.click(cell('Eins'));
        await user.keyboard('{/Control}');
        expect(sel()).toBe('3');
    });

    it('selects a range with Shift-click, from the last plain click', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Zwei'));
        await user.keyboard('{Shift>}');
        await user.click(cell('Vier'));
        await user.keyboard('{/Shift}');
        expect(sel()).toBe('2,3,4');
    });

    it('moves focus to the Shift-clicked row, so arrows continue from there', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Eins'));
        await user.keyboard('{Shift>}');
        await user.click(cell('Drei'));
        await user.keyboard('{/Shift}');
        expect(row('Drei')).toHaveFocus();
    });

    it('ignores clicks on buttons and links inside a row', async () => {
        render(<Harness />);
        await userEvent.click(screen.getByRole('button', { name: 'Link Zwei' }));
        expect(sel()).toBe('');
    });

    it('toggles with the row checkbox without dropping the others', async () => {
        render(<Harness />);
        await userEvent.click(screen.getByRole('checkbox', { name: 'Eins wählen' }));
        await userEvent.click(screen.getByRole('checkbox', { name: 'Drei wählen' }));
        expect(sel()).toBe('1,3');
    });

    it('selects all and none with the header checkbox, and shows "some" as indeterminate', async () => {
        render(<Harness />);
        const all = screen.getByRole('checkbox', { name: 'Alle' }) as HTMLInputElement;
        await userEvent.click(cell('Zwei'));
        expect(all.indeterminate).toBe(true);
        await userEvent.click(all);
        expect(sel()).toBe('1,2,3,4');
        expect(all).toBeChecked();
        await userEvent.click(all);
        expect(sel()).toBe('');
    });
});

describe('useGrid — selection modes', () => {
    it('single: no checkboxes, one row at most, no ranges', async () => {
        const user = userEvent.setup();
        render(<Harness mode="single" />);
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        await user.click(cell('Eins'));
        await user.keyboard('{Shift>}');
        await user.click(cell('Drei'));
        await user.keyboard('{/Shift}{Control>}a{/Control}');
        expect(sel()).toBe('3');
    });

    it('none: nothing can be selected, rows carry no aria-selected', async () => {
        const user = userEvent.setup();
        render(<Harness mode="none" />);
        await user.click(cell('Eins'));
        await user.keyboard('{Control>}a{/Control}');
        expect(sel()).toBe('');
        expect(row('Eins')).not.toHaveAttribute('aria-selected');
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('marks the table as a multiselectable grid only in multiple mode', () => {
        const { rerender } = render(<Harness />);
        expect(screen.getByRole('grid')).toHaveAttribute('aria-multiselectable', 'true');
        rerender(<Harness mode="single" />);
        expect(screen.getByRole('grid')).not.toHaveAttribute('aria-multiselectable');
    });

    it('turns selection off when the person switches it off, and clears it', () => {
        const { result } = renderHook(() =>
            useGrid({ id: 'x', ...byIds([1, 2]), defaultSelectedIds: [1] }),
        );
        expect(result.current.selectedIds).toEqual([1]);
        act(() => result.current.preferences.setSelectionEnabled(false));
        expect(result.current.mode).toBe('none');
        expect(result.current.allowedMode).toBe('multiple');
        expect(result.current.selectedIds).toEqual([]);
        expect(result.current.showCheckboxes).toBe(false);
    });

    it('drops selected rows that are no longer on screen', () => {
        const { result, rerender } = renderHook(
            ({ ids }: { ids: RowId[] }) =>
                useGrid({ id: 'x', ...byIds(ids), defaultSelectedIds: [1, 3] }),
            { initialProps: { ids: [1, 2, 3] } },
        );
        rerender({ ids: [1, 2] });
        expect(result.current.selectedIds).toEqual([1]);
        expect(result.current.selectionState).toBe('one');
    });

    it('keeps number ids numbers when read back from the DOM', async () => {
        const seen: RowId[][] = [];
        render(<Harness onState={(ids) => seen.push(ids)} />);
        await userEvent.click(cell('Zwei'));
        expect(seen.at(-1)).toEqual([2]);
    });
});

describe('useGrid — keyboard', () => {
    it('makes exactly one row a tab stop, the first by default', () => {
        render(<Harness />);
        expect(row('Eins')).toHaveAttribute('tabindex', '0');
        expect(row('Zwei')).toHaveAttribute('tabindex', '-1');
    });

    it('moves with the arrows, and the selection follows', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        row('Eins').focus();
        await user.keyboard('{ArrowDown}{ArrowDown}');
        expect(row('Drei')).toHaveFocus();
        expect(sel()).toBe('3');
        await user.keyboard('{ArrowUp}');
        expect(sel()).toBe('2');
    });

    it('extends with Shift+arrow', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Zwei'));
        await user.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');
        expect(sel()).toBe('2,3,4');
    });

    it('moves focus without touching the selection with ⌘/Ctrl+arrow, then Space adds', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Eins'));
        await user.keyboard('{Control>}{ArrowDown}{ArrowDown}{/Control}');
        expect(row('Drei')).toHaveFocus();
        expect(sel()).toBe('1');
        await user.keyboard(' ');
        expect(sel()).toBe('1,3');
    });

    it('jumps to the ends with Home and End', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        row('Zwei').focus();
        await user.keyboard('{End}');
        expect(row('Vier')).toHaveFocus();
        await user.keyboard('{Home}');
        expect(row('Eins')).toHaveFocus();
    });

    it('stops at the first and last row', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        row('Eins').focus();
        await user.keyboard('{ArrowUp}');
        expect(row('Eins')).toHaveFocus();
    });

    it('selects all with ⌘/Ctrl+A and clears with Escape', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        row('Eins').focus();
        await user.keyboard('{Control>}a{/Control}');
        expect(sel()).toBe('1,2,3,4');
        await user.keyboard('{Escape}');
        expect(sel()).toBe('');
    });

    it('leaves typing in the search box alone', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(<Harness actions={[action('Neu', { shortcut: 'N', onSelect })]} />);
        await user.click(screen.getByRole('searchbox'));
        await user.keyboard('n{Control>}a{/Control}');
        expect(onSelect).not.toHaveBeenCalled();
        expect(sel()).toBe('');
    });

    it('runs the default action on Enter, for the focused row', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
            <Harness actions={[action('Öffnen', { when: ['one'], isDefault: true, onSelect })]} />,
        );
        row('Drei').focus();
        await user.keyboard('{Enter}');
        expect(onSelect).toHaveBeenCalledWith([3]);
        expect(sel()).toBe('3');
    });

    it('runs the default action on double-click', async () => {
        const onSelect = vi.fn();
        render(
            <Harness actions={[action('Öffnen', { when: ['one'], isDefault: true, onSelect })]} />,
        );
        await userEvent.dblClick(cell('Zwei'));
        expect(onSelect).toHaveBeenCalledWith([2]);
    });

    it('does not run a default action that does not fit, or is disabled', async () => {
        const onSelect = vi.fn();
        const { rerender } = render(
            <Harness actions={[action('Neu', { isDefault: true, onSelect })]} />,
        );
        await userEvent.dblClick(cell('Zwei'));
        rerender(
            <Harness
                actions={[
                    action('Öffnen', { when: ['one'], isDefault: true, disabled: true, onSelect }),
                ]}
            />,
        );
        await userEvent.dblClick(cell('Drei'));
        expect(onSelect).not.toHaveBeenCalled();
    });
});

describe('useGrid — copy', () => {
    // userEvent.setup() puts its own clipboard on navigator; read what landed there.
    it('copies the selected rows with ⌘/Ctrl+C', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Zwei'));
        await user.keyboard('{Control>}c{/Control}');
        expect(await navigator.clipboard.readText()).toBe('Name\nZwei');
    });

    it('leaves ⌘/Ctrl+C alone when the person highlighted text themselves', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Zwei'));
        const spy = vi
            .spyOn(window, 'getSelection')
            .mockReturnValue({ toString: () => 'Zwei' } as Selection);
        await user.keyboard('{Control>}c{/Control}');
        expect(await navigator.clipboard.readText()).toBe('');
        spy.mockRestore();
    });
});

describe('useGrid — action shortcuts', () => {
    it('runs an action for its shortcut with the selected ids', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
            <Harness
                actions={[action('Kopie', { when: ['one', 'many'], shortcut: 'Mod+D', onSelect })]}
            />,
        );
        await user.click(cell('Eins'));
        await user.keyboard('{Shift>}{ArrowDown}{/Shift}{Control>}d{/Control}');
        expect(onSelect).toHaveBeenCalledWith([1, 2]);
    });

    it('ignores a shortcut whose action does not fit the selection', async () => {
        const user = userEvent.setup();
        const del = vi.fn();
        const create = vi.fn();
        render(
            <Harness
                actions={[
                    action('Löschen', { when: ['one', 'many'], shortcut: 'Delete', onSelect: del }),
                    action('Neu', { shortcut: 'N', onSelect: create }),
                ]}
            />,
        );
        row('Eins').focus();
        await user.keyboard('{Delete}');
        expect(del).not.toHaveBeenCalled();
        await user.click(cell('Eins'));
        await user.keyboard('n');
        expect(create).not.toHaveBeenCalled();
        await user.keyboard('{Delete}');
        expect(del).toHaveBeenCalledWith([1]);
    });

    it('never runs a disabled action from the keyboard', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(
            <Harness
                actions={[
                    action('Veröffentlichen', {
                        when: ['one'],
                        shortcut: 'P',
                        disabled: (ids) => ids.includes(1),
                        onSelect,
                    }),
                ]}
            />,
        );
        await user.click(cell('Eins'));
        await user.keyboard('p');
        expect(onSelect).not.toHaveBeenCalled();
        await user.click(cell('Zwei'));
        await user.keyboard('p');
        expect(onSelect).toHaveBeenCalledWith([2]);
    });
});

describe('useGrid — right-click', () => {
    it('makes an unselected row the selection', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Eins'));
        await user.pointer({ keys: '[MouseRight]', target: cell('Drei') });
        expect(sel()).toBe('3');
    });

    it('keeps the selection when right-clicking inside it', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Eins'));
        await user.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}');
        await user.pointer({ keys: '[MouseRight]', target: cell('Zwei') });
        expect(sel()).toBe('1,2,3');
    });

    it('clears the selection when right-clicking empty space', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(cell('Eins'));
        await user.pointer({ keys: '[MouseRight]', target: screen.getByTestId('sel') });
        expect(sel()).toBe('');
    });

    it('lists the actions for the new selection', () => {
        const { result } = renderHook(() =>
            useGrid({
                id: 'x',
                ...byIds([1, 2]),
                actions: [action('Neu'), action('Bearbeiten', { when: ['one'] })],
                defaultSelectedIds: [2],
            }),
        );
        expect(result.current.visibleActions.flat().map((a) => a.id)).toEqual(['Bearbeiten']);
    });
});

describe('useGrid — table semantics', () => {
    it('exposes selected rows to assistive tech', async () => {
        render(<Harness />);
        await userEvent.click(cell('Zwei'));
        const grid = screen.getByRole('grid', { name: 'Liste' });
        expect(within(grid).getAllByRole('row', { selected: true })).toHaveLength(1);
    });
});
