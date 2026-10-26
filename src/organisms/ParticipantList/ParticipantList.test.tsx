import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DropdownMenuItem } from '../../molecules/DropdownMenu';
import {
    ParticipantList,
    type ParticipantListLabels,
    type ParticipantListPerson,
    type ParticipantListProps,
} from './ParticipantList';

const labels: ParticipantListLabels = {
    raised: (n) => `Meldungen (${n})`,
    inMeeting: (n) => `Im Meeting (${n})`,
    waiting: (n) => `Wartend (${n})`,
    you: '(du)',
    muted: 'Mikrofon aus',
    hand: (position) => `Meldung ${position}`,
    actions: (name) => `Aktionen für ${name}`,
    admit: (name) => `${name} zulassen`,
    deny: (name) => `${name} ablehnen`,
    search: 'Teilnehmer suchen',
    noMatch: 'Niemand gefunden',
};

const people: ParticipantListPerson[] = [
    { id: '1', name: 'Ustadh Mosa', role: 'Lehrer', leader: true },
    { id: '2', name: 'Amira Haddad', handPosition: 2 },
    { id: '3', name: 'Bilal Karim', handPosition: 1 },
    { id: '4', name: 'Chadia Omar', muted: true },
];

const setup = (props: Partial<ParticipantListProps> = {}) =>
    render(<ParticipantList people={people} labels={labels} {...props} />);

const section = (title: string) => screen.getByRole('region', { name: title });
const names = (el: HTMLElement) =>
    within(el)
        .getAllByRole('listitem')
        .map((li) => li.querySelector('p')?.textContent ?? '');

describe('ParticipantList', () => {
    describe('sections', () => {
        it('lists everyone without a raised hand in the meeting section', () => {
            setup();
            expect(names(section('Im Meeting (4)'))).toEqual(['Ustadh Mosa', 'Chadia Omar']);
        });

        it('lists raised hands first, ordered by queue position', () => {
            setup();
            expect(names(section('Meldungen (2)'))).toEqual(['Bilal Karim', 'Amira Haddad']);
            const headings = screen.getAllByRole('heading').map((h) => h.textContent);
            expect(headings.indexOf('Meldungen (2)')).toBeLessThan(
                headings.indexOf('Im Meeting (4)'),
            );
        });

        it('shows the queue position on the raised-hand badge', () => {
            setup();
            expect(screen.getByText('Meldung 1')).toHaveClass('sr-only');
            expect(screen.getByText('Meldung 2')).toHaveClass('sr-only');
        });

        it('has no raised section when nobody has a hand up', () => {
            setup({ people: people.filter((p) => p.handPosition === undefined) });
            expect(screen.queryByRole('region', { name: /Meldungen/ })).toBeNull();
        });

        it('does not reorder the caller array', () => {
            const input = [...people];
            setup({ people: input });
            expect(input.map((p) => p.id)).toEqual(['1', '2', '3', '4']);
        });

        it('counts everyone in the meeting heading, raised hands included', () => {
            setup();
            expect(screen.getByRole('heading', { name: 'Im Meeting (4)' })).toBeInTheDocument();
        });
    });

    describe('person row', () => {
        it('marks yourself with labels.you', () => {
            setup({ people: [{ id: '1', name: 'Ustadh Mosa', self: true }] });
            expect(screen.getByText('(du)')).toBeInTheDocument();
        });

        it('does not mark other people', () => {
            setup();
            expect(screen.queryByText('(du)')).toBeNull();
        });

        it('shows the role', () => {
            setup();
            expect(screen.getByText('Lehrer')).toBeInTheDocument();
        });

        it('reads out a muted microphone', () => {
            setup();
            expect(screen.getAllByText('Mikrofon aus')).toHaveLength(1);
            expect(screen.getByText('Mikrofon aus')).toHaveClass('sr-only');
        });
    });

    describe('waiting', () => {
        const waiting = [
            { id: 'w1', name: 'Dawud Saleh', detail: 'wartet seit 1 Min.' },
            { id: 'w2', name: 'Esma Yilmaz' },
        ];

        it('has no waiting section when the list is empty', () => {
            setup();
            expect(screen.queryByRole('region', { name: /Wartend/ })).toBeNull();
        });

        it('lists the waiting people with their count', () => {
            setup({ waiting });
            expect(names(section('Wartend (2)'))).toEqual(['Dawud Saleh', 'Esma Yilmaz']);
            expect(screen.getByText('wartet seit 1 Min.')).toBeInTheDocument();
        });

        it('puts the waiting section before everyone else', () => {
            setup({ waiting });
            const headings = screen.getAllByRole('heading').map((h) => h.textContent);
            expect(headings[0]).toBe('Wartend (2)');
        });

        it('calls onAdmit and onDeny with the id', async () => {
            const onAdmit = vi.fn();
            const onDeny = vi.fn();
            setup({ waiting, onAdmit, onDeny });
            await userEvent.click(screen.getByRole('button', { name: 'Esma Yilmaz zulassen' }));
            await userEvent.click(screen.getByRole('button', { name: 'Dawud Saleh ablehnen' }));
            expect(onAdmit).toHaveBeenCalledExactlyOnceWith('w2');
            expect(onDeny).toHaveBeenCalledExactlyOnceWith('w1');
        });

        it('does not throw when the callbacks are missing', async () => {
            setup({ waiting });
            await userEvent.click(screen.getByRole('button', { name: 'Esma Yilmaz zulassen' }));
            expect(screen.getByText('Esma Yilmaz')).toBeInTheDocument();
        });

        it('blocks both buttons of a busy person', async () => {
            const onAdmit = vi.fn();
            const onDeny = vi.fn();
            setup({ waiting: [{ id: 'w1', name: 'Dawud Saleh', busy: true }], onAdmit, onDeny });
            const admit = screen.getByRole('button', { name: 'Dawud Saleh zulassen' });
            const deny = screen.getByRole('button', { name: 'Dawud Saleh ablehnen' });
            expect(admit).toHaveAttribute('aria-disabled', 'true');
            expect(deny).toHaveAttribute('aria-disabled', 'true');
            await userEvent.click(admit);
            await userEvent.click(deny);
            expect(onAdmit).not.toHaveBeenCalled();
            expect(onDeny).not.toHaveBeenCalled();
        });
    });

    describe('search', () => {
        it('has no search field without onQueryChange', () => {
            setup();
            expect(screen.queryByRole('searchbox')).toBeNull();
            expect(screen.queryByPlaceholderText('Teilnehmer suchen')).toBeNull();
        });

        it('has no search field without labels.search', () => {
            setup({ onQueryChange: () => {}, labels: { ...labels, search: undefined } });
            expect(screen.queryByRole('searchbox')).toBeNull();
        });

        it('shows the query and reports typing', async () => {
            const onQueryChange = vi.fn();
            setup({ onQueryChange, query: '' });
            const field = screen.getByPlaceholderText('Teilnehmer suchen');
            await userEvent.type(field, 'Am');
            expect(onQueryChange).toHaveBeenNthCalledWith(1, 'A');
            expect(onQueryChange).toHaveBeenNthCalledWith(2, 'm');
        });

        it('shows the controlled query value', () => {
            setup({ onQueryChange: () => {}, query: 'Bil' });
            expect(screen.getByPlaceholderText('Teilnehmer suchen')).toHaveValue('Bil');
        });
    });

    describe('person actions', () => {
        it('has no menu button unless the person has actions', () => {
            setup();
            expect(screen.queryByRole('button', { name: /Aktionen für/ })).toBeNull();
        });

        it('has a menu button for the person with actions only', async () => {
            const onSelect = vi.fn();
            setup({
                people: [
                    { id: '1', name: 'Ustadh Mosa' },
                    {
                        id: '2',
                        name: 'Amira Haddad',
                        actions: (
                            <DropdownMenuItem onSelect={onSelect}>Stummschalten</DropdownMenuItem>
                        ),
                    },
                ],
            });
            expect(screen.getAllByRole('button')).toHaveLength(1);
            await userEvent.click(
                screen.getByRole('button', { name: 'Aktionen für Amira Haddad' }),
            );
            await userEvent.click(await screen.findByRole('menuitem', { name: 'Stummschalten' }));
            expect(onSelect).toHaveBeenCalledTimes(1);
        });
    });

    describe('headings', () => {
        it('uses h3 headings by default', () => {
            setup();
            expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0);
            expect(screen.queryAllByRole('heading', { level: 2 })).toHaveLength(0);
        });

        it('uses h2 headings with headingLevel 2', () => {
            setup({ headingLevel: 2, waiting: [{ id: 'w', name: 'Dawud Saleh' }] });
            expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
            expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
        });
    });

    it('renders the extra actions slot', () => {
        setup({ actions: <button type="button">Alle stummschalten</button> });
        expect(screen.getByRole('button', { name: 'Alle stummschalten' })).toBeInTheDocument();
    });

    describe('empty list', () => {
        it('shows noMatch when nobody matches a search', () => {
            setup({ people: [], query: 'xyz', onQueryChange: () => {} });
            expect(screen.getByText('Niemand gefunden')).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: 'Im Meeting (0)' })).toBeInTheDocument();
        });

        it('omits the meeting section entirely with no people and no query', () => {
            setup({ people: [] });
            expect(screen.queryByText('Niemand gefunden')).toBeNull();
            expect(screen.queryByRole('heading')).toBeNull();
            expect(screen.queryByRole('region')).toBeNull();
        });

        it('treats an empty query like no query', () => {
            setup({ people: [], query: '', onQueryChange: () => {} });
            expect(screen.queryByText('Niemand gefunden')).toBeNull();
            expect(screen.queryByRole('heading')).toBeNull();
        });

        it('still lists waiting people when nobody is in the meeting yet', () => {
            setup({ people: [], waiting: [{ id: 'w', name: 'Dawud Saleh' }] });
            expect(screen.getByRole('region', { name: 'Wartend (1)' })).toBeInTheDocument();
            expect(screen.queryByRole('region', { name: /Im Meeting/ })).toBeNull();
        });

        it('does not show noMatch when there are people, even with a query', () => {
            setup({ query: 'Am', onQueryChange: () => {} });
            expect(screen.queryByText('Niemand gefunden')).toBeNull();
        });

        it('shows an empty section without a noMatch label when a query matches nobody', () => {
            setup({
                people: [],
                query: 'xyz',
                onQueryChange: () => {},
                labels: { ...labels, noMatch: undefined },
            });
            expect(screen.getByRole('heading', { name: 'Im Meeting (0)' })).toBeInTheDocument();
            expect(screen.queryByRole('listitem')).toBeNull();
        });
    });
});
