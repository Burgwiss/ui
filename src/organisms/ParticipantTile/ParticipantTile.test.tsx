import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DropdownMenuItem } from '../../molecules/DropdownMenu';
import { ParticipantTile, type ParticipantTileLabels } from './ParticipantTile';

const labels: ParticipantTileLabels = {
    muted: 'Mikrofon aus',
    handRaised: (position) => (position === undefined ? 'Hand gehoben' : `Meldung ${position}`),
    actions: (name) => `Aktionen für ${name}`,
    pinned: 'Angeheftet',
    connection: { fair: 'Verbindung schwankt', poor: 'Schlechte Verbindung' },
};

const caption = () => screen.getByText('Amira Haddad').closest('figcaption')!;

describe('ParticipantTile', () => {
    it('shows the name in the figure caption', () => {
        render(<ParticipantTile name="Amira Haddad" labels={labels} />);
        expect(within(screen.getByRole('figure')).getByText('Amira Haddad')).toBeInTheDocument();
        expect(caption()).toHaveTextContent('Amira Haddad');
    });

    describe('picture', () => {
        it('shows initials while there is no video', () => {
            render(<ParticipantTile name="Amira Haddad" labels={labels} />);
            expect(screen.getByText('AH')).toBeInTheDocument();
        });

        it('shows the video node instead of initials when given', () => {
            render(
                <ParticipantTile
                    name="Amira Haddad"
                    labels={labels}
                    video={<div data-testid="cam" />}
                />,
            );
            expect(screen.getByTestId('cam')).toBeInTheDocument();
            expect(screen.queryByText('AH')).toBeNull();
        });
    });

    describe('muted', () => {
        it('adds a screen-reader label after the name', () => {
            render(<ParticipantTile name="Amira Haddad" muted labels={labels} />);
            expect(screen.getByText(', Mikrofon aus')).toHaveClass('sr-only');
            expect(caption()).toHaveTextContent('Amira Haddad, Mikrofon aus');
        });

        it.each([false, undefined])('adds nothing when muted is %s', (muted) => {
            render(<ParticipantTile name="Amira Haddad" muted={muted} labels={labels} />);
            expect(screen.queryByText(/Mikrofon aus/)).toBeNull();
        });
    });

    describe('raised hand', () => {
        it('shows the badge with the queue position', () => {
            render(
                <ParticipantTile name="Amira Haddad" handRaised handPosition={2} labels={labels} />,
            );
            expect(screen.getByText('Meldung 2')).toHaveClass('sr-only');
            expect(screen.getByText('2')).toHaveAttribute('aria-hidden', 'true');
        });

        it('shows the badge without a position when unknown', () => {
            render(<ParticipantTile name="Amira Haddad" handRaised labels={labels} />);
            expect(screen.getByText('Hand gehoben')).toBeInTheDocument();
        });

        it('shows no badge when the hand is down', () => {
            render(<ParticipantTile name="Amira Haddad" handPosition={2} labels={labels} />);
            expect(screen.queryByText(/Meldung|Hand gehoben/)).toBeNull();
        });

        it('exposes data-hand only while raised', () => {
            const { rerender } = render(
                <ParticipantTile name="Amira Haddad" handRaised labels={labels} />,
            );
            expect(screen.getByRole('figure')).toHaveAttribute('data-hand', 'true');
            rerender(<ParticipantTile name="Amira Haddad" labels={labels} />);
            expect(screen.getByRole('figure')).not.toHaveAttribute('data-hand');
        });
    });

    describe('speaking', () => {
        it('exposes data-speaking only while talking', () => {
            const { rerender } = render(
                <ParticipantTile name="Amira Haddad" speaking labels={labels} />,
            );
            expect(screen.getByRole('figure')).toHaveAttribute('data-speaking', 'true');
            rerender(<ParticipantTile name="Amira Haddad" labels={labels} />);
            expect(screen.getByRole('figure')).not.toHaveAttribute('data-speaking');
        });
    });

    describe('reaction', () => {
        it('is an image named by its label, not by the emoji', () => {
            render(
                <ParticipantTile
                    name="Amira Haddad"
                    labels={labels}
                    reaction={{ key: 1, emoji: '👏', label: 'Applaus' }}
                />,
            );
            const reaction = screen.getByRole('img', { name: 'Applaus' });
            expect(reaction).toHaveTextContent('👏');
        });

        it.each([null, undefined])('shows nothing for %s', (reaction) => {
            render(<ParticipantTile name="Amira Haddad" labels={labels} reaction={reaction} />);
            expect(screen.queryByRole('img')).toBeNull();
        });

        it('remounts on a new key so the same emoji animates again', () => {
            const { rerender } = render(
                <ParticipantTile
                    name="Amira Haddad"
                    labels={labels}
                    reaction={{ key: 1, emoji: '👏', label: 'Applaus' }}
                />,
            );
            const first = screen.getByRole('img');
            rerender(
                <ParticipantTile
                    name="Amira Haddad"
                    labels={labels}
                    reaction={{ key: 2, emoji: '👏', label: 'Applaus' }}
                />,
            );
            expect(screen.getByRole('img')).not.toBe(first);
        });
    });

    describe('actions menu', () => {
        it('has no menu button without actions', () => {
            render(<ParticipantTile name="Amira Haddad" labels={labels} />);
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('has a menu button named by labels.actions(name) when actions are given', () => {
            render(
                <ParticipantTile
                    name="Amira Haddad"
                    labels={labels}
                    actions={<DropdownMenuItem>Anheften</DropdownMenuItem>}
                />,
            );
            expect(
                screen.getByRole('button', { name: 'Aktionen für Amira Haddad' }),
            ).toBeInTheDocument();
        });

        it('opens the items and runs the chosen one', async () => {
            const onSelect = vi.fn();
            render(
                <ParticipantTile
                    name="Amira Haddad"
                    labels={labels}
                    actions={
                        <>
                            <DropdownMenuItem onSelect={onSelect}>Anheften</DropdownMenuItem>
                            <DropdownMenuItem>Stummschalten</DropdownMenuItem>
                        </>
                    }
                />,
            );
            expect(screen.queryByRole('menuitem')).toBeNull();
            await userEvent.click(
                screen.getByRole('button', { name: 'Aktionen für Amira Haddad' }),
            );
            expect(await screen.findAllByRole('menuitem')).toHaveLength(2);
            await userEvent.click(screen.getByRole('menuitem', { name: 'Anheften' }));
            expect(onSelect).toHaveBeenCalledTimes(1);
        });
    });

    describe('connection', () => {
        it('labels a poor connection for screen readers', () => {
            render(<ParticipantTile name="Amira Haddad" connection="poor" labels={labels} />);
            expect(screen.getByText(', Schlechte Verbindung')).toHaveClass('sr-only');
        });

        it('labels a fair connection for screen readers', () => {
            render(<ParticipantTile name="Amira Haddad" connection="fair" labels={labels} />);
            expect(screen.getByText(', Verbindung schwankt')).toHaveClass('sr-only');
            expect(screen.queryByText(/Schlechte/)).toBeNull();
        });

        it('says nothing about a good connection', () => {
            render(<ParticipantTile name="Amira Haddad" connection="good" labels={labels} />);
            expect(caption()).toHaveTextContent(/^Amira Haddad$/);
        });

        it('says nothing when the labels are not provided', () => {
            render(
                <ParticipantTile
                    name="Amira Haddad"
                    connection="poor"
                    labels={{ ...labels, connection: undefined }}
                />,
            );
            expect(caption()).toHaveTextContent(/^Amira Haddad$/);
        });
    });

    describe('suffix', () => {
        it('shows the suffix after the name', () => {
            render(<ParticipantTile name="Amira Haddad" suffix="(du)" labels={labels} />);
            expect(caption()).toHaveTextContent('Amira Haddad (du)');
            expect(screen.getByText('(du)')).toBeInTheDocument();
        });

        it('does not affect the initials', () => {
            render(<ParticipantTile name="Amira Haddad" suffix="(du)" labels={labels} />);
            expect(screen.getByText('AH')).toBeInTheDocument();
            expect(screen.queryByText('A(')).toBeNull();
        });

        it('shows nothing extra without a suffix', () => {
            render(<ParticipantTile name="Amira Haddad" labels={labels} />);
            expect(caption()).toHaveTextContent(/^Amira Haddad$/);
        });
    });

    describe('badge and pin', () => {
        it('shows the role badge beside the name', () => {
            render(<ParticipantTile name="Amira Haddad" badge="Host" labels={labels} />);
            expect(caption()).toHaveTextContent('Host');
        });

        it('announces a pinned tile', () => {
            render(<ParticipantTile name="Amira Haddad" pinned labels={labels} />);
            expect(screen.getByText('Angeheftet')).toHaveClass('sr-only');
        });

        it('announces nothing when not pinned', () => {
            render(<ParticipantTile name="Amira Haddad" labels={labels} />);
            expect(screen.queryByText('Angeheftet')).toBeNull();
        });
    });

    it('applies the size the stage gives it', () => {
        render(<ParticipantTile name="Amira Haddad" labels={labels} style={{ width: '20rem' }} />);
        expect(screen.getByRole('figure')).toHaveStyle({ width: '20rem' });
    });
});
