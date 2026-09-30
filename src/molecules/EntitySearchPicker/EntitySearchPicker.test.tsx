import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    EntitySearchPicker,
    type EntitySearchPickerProps,
    type EntitySearchResult,
} from './EntitySearchPicker';

type Item = { id: number; title: string; sub: string };

const labels = {
    searching: 'Suche läuft…',
    empty: 'Keine Treffer',
    refine: 'Suche verfeinern',
};

const ARABIC: Item = { id: 7, title: 'Arabisch A1', sub: 'arabisch-a1' };

function renderPicker(over: Partial<EntitySearchPickerProps<Item>> = {}) {
    const onSearch =
        over.onSearch ??
        vi.fn(async (): Promise<Item[] | EntitySearchResult<Item>> => ({
            items: [],
            hasMore: false,
        }));
    const onSelect = over.onSelect ?? vi.fn();
    render(
        <EntitySearchPicker<Item>
            onSearch={onSearch}
            onSelect={onSelect}
            triggerLabel="Kurs wählen"
            placeholder="Kurse suchen…"
            labels={labels}
            getKey={(i) => i.id}
            renderRow={(i) => (
                <>
                    <span>{i.title}</span>
                    <span>{i.sub}</span>
                </>
            )}
            debounceMs={0}
            {...over}
        />,
    );
    return { onSearch, onSelect };
}

const trigger = () => screen.getByRole('button', { name: 'Kurs wählen' });

describe('EntitySearchPicker', () => {
    it('renders the trigger and does not search until opened', () => {
        const { onSearch } = renderPicker();
        expect(trigger()).toBeInTheDocument();
        expect(onSearch).not.toHaveBeenCalled();
    });

    it('does not open or search while disabled', async () => {
        const user = userEvent.setup();
        const { onSearch } = renderPicker({ disabled: true });
        await user.click(trigger());
        expect(screen.queryByPlaceholderText('Kurse suchen…')).toBeNull();
        expect(onSearch).not.toHaveBeenCalled();
    });

    it('searches on open with the empty query and an AbortSignal', async () => {
        const user = userEvent.setup();
        const { onSearch } = renderPicker();
        await user.click(trigger());
        await waitFor(() => expect(onSearch).toHaveBeenCalled());
        const [query, signal] = (onSearch as ReturnType<typeof vi.fn>).mock.calls[0]!;
        expect(query).toBe('');
        expect(signal).toBeInstanceOf(AbortSignal);
    });

    it('renders renderRow rows and selects the FULL item, then closes', async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        renderPicker({ onSearch: async () => [ARABIC], onSelect });

        await user.click(trigger());
        expect(await screen.findByText('Arabisch A1')).toBeInTheDocument();
        expect(screen.getByText('arabisch-a1')).toBeInTheDocument();

        await user.click(screen.getByText('Arabisch A1'));
        expect(onSelect).toHaveBeenCalledWith(ARABIC);
        expect(screen.queryByPlaceholderText('Kurse suchen…')).toBeNull();
    });

    it('passes the typed query to onSearch', async () => {
        const user = userEvent.setup();
        const { onSearch } = renderPicker();
        await user.click(trigger());
        await user.type(await screen.findByPlaceholderText('Kurse suchen…'), 'arab');
        await waitFor(() => {
            const queries = (onSearch as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
            expect(queries).toContain('arab');
        });
    });

    it('names the search input by its placeholder', async () => {
        const user = userEvent.setup();
        renderPicker();
        await user.click(trigger());
        expect(await screen.findByRole('combobox', { name: 'Kurse suchen…' })).toBeInTheDocument();
    });

    it('shows the searching status while a search is pending', async () => {
        const user = userEvent.setup();
        renderPicker({ onSearch: () => new Promise(() => {}) });
        await user.click(trigger());
        expect(await screen.findByRole('status')).toHaveTextContent(labels.searching);
    });

    it('shows the empty status when there are no matches', async () => {
        const user = userEvent.setup();
        renderPicker({ onSearch: async () => [] });
        await user.click(trigger());
        expect(await screen.findByText(labels.empty)).toBeInTheDocument();
    });

    it('shows the refine hint only when hasMore is true', async () => {
        const user = userEvent.setup();
        renderPicker({ onSearch: async () => ({ items: [ARABIC], hasMore: true }) });
        await user.click(trigger());
        expect(await screen.findByText(labels.refine)).toBeInTheDocument();
    });

    it('a plain array result never shows the refine hint', async () => {
        const user = userEvent.setup();
        renderPicker({ onSearch: async () => [ARABIC] });
        await user.click(trigger());
        await screen.findByText('Arabisch A1');
        expect(screen.queryByText(labels.refine)).toBeNull();
    });

    it('treats a rejected search as "no results" rather than crashing', async () => {
        const user = userEvent.setup();
        renderPicker({ onSearch: async () => Promise.reject(new Error('offline')) });
        await user.click(trigger());
        expect(await screen.findByText(labels.empty)).toBeInTheDocument();
    });

    it('aborts the previous search when the query changes, and ignores its late answer', async () => {
        const user = userEvent.setup();
        const signals: AbortSignal[] = [];
        let resolveFirst: (v: Item[]) => void = () => {};
        const onSearch = vi.fn((query: string, signal: AbortSignal) => {
            signals.push(signal);
            if (query === '') {
                return new Promise<Item[]>((resolve) => {
                    resolveFirst = resolve;
                });
            }
            return Promise.resolve([{ id: 2, title: 'Neuer Treffer', sub: 'neu' }]);
        });
        renderPicker({ onSearch });

        await user.click(trigger());
        await waitFor(() => expect(onSearch).toHaveBeenCalledTimes(1));
        await user.type(await screen.findByPlaceholderText('Kurse suchen…'), 'n');
        expect(await screen.findByText('Neuer Treffer')).toBeInTheDocument();
        expect(signals[0]!.aborted).toBe(true);

        // The superseded request resolves late; it must not overwrite the newer list.
        resolveFirst([{ id: 1, title: 'Veralteter Treffer', sub: 'alt' }]);
        await Promise.resolve();
        expect(screen.queryByText('Veralteter Treffer')).toBeNull();
        expect(screen.getByText('Neuer Treffer')).toBeInTheDocument();
    });

    it('does not re-search on every render when onSearch is an inline function', async () => {
        const user = userEvent.setup();
        const calls = vi.fn();
        renderPicker({
            onSearch: async (q) => {
                calls(q);
                return [ARABIC];
            },
        });
        await user.click(trigger());
        await screen.findByText('Arabisch A1');
        await new Promise((r) => setTimeout(r, 50));
        expect(calls).toHaveBeenCalledTimes(1);
    });

    it('debounces: rapid typing produces one search for the final query', async () => {
        const user = userEvent.setup({ delay: 5 });
        const calls = vi.fn();
        renderPicker({
            debounceMs: 80,
            onSearch: async (q) => {
                calls(q);
                return [];
            },
        });
        await user.click(trigger());
        const input = await screen.findByPlaceholderText('Kurse suchen…');
        await user.type(input, 'abc');
        await waitFor(() => expect(calls).toHaveBeenCalledWith('abc'));
        expect(calls).not.toHaveBeenCalledWith('a');
        expect(calls).not.toHaveBeenCalledWith('ab');
    });

    it('resets the query when closed', async () => {
        const user = userEvent.setup();
        renderPicker();
        await user.click(trigger());
        await user.type(await screen.findByPlaceholderText('Kurse suchen…'), 'abc');
        await user.keyboard('{Escape}');
        await user.click(trigger());
        expect(await screen.findByPlaceholderText('Kurse suchen…')).toHaveValue('');
    });

    it('applies triggerClassName and id to the trigger', () => {
        renderPicker({ triggerClassName: 'w-full justify-between', id: 'kurs' });
        expect(trigger()).toHaveClass('w-full');
        expect(trigger()).toHaveAttribute('id', 'kurs');
    });
});
