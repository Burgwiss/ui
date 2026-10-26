import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';
import { MeetingRoom, MeetingRoomPanel } from './MeetingRoom';

describe('MeetingRoom', () => {
    it('renders the stage and the toolbar', () => {
        render(<MeetingRoom stage={<div>Bühne</div>} toolbar={<div>Werkzeugleiste</div>} />);
        expect(screen.getByText('Bühne')).toBeInTheDocument();
        expect(screen.getByText('Werkzeugleiste')).toBeInTheDocument();
    });

    it('puts the stage in the main landmark and the toolbar outside it', () => {
        render(<MeetingRoom stage={<div>Bühne</div>} toolbar={<div>Werkzeugleiste</div>} />);
        const main = screen.getByRole('main');
        expect(main).toContainElement(screen.getByText('Bühne'));
        expect(main).not.toContainElement(screen.getByText('Werkzeugleiste'));
    });

    it('renders every optional slot when given', () => {
        render(
            <MeetingRoom
                header={<header>Kopf</header>}
                notices={<p>Hinweis</p>}
                stage={<div>Bühne</div>}
                overlay={<p>Klopfen</p>}
                prompt={<p>Eingabe</p>}
                toolbar={<div>Werkzeugleiste</div>}
                panel={<div>Seitenleiste</div>}
            />,
        );
        for (const text of [
            'Kopf',
            'Hinweis',
            'Bühne',
            'Klopfen',
            'Eingabe',
            'Werkzeugleiste',
            'Seitenleiste',
        ]) {
            expect(screen.getByText(text)).toBeInTheDocument();
        }
    });

    it('renders only the stage and toolbar when the optional slots are left out', () => {
        const { container } = render(
            <MeetingRoom stage={<div>Bühne</div>} toolbar={<div>Werkzeugleiste</div>} />,
        );
        expect(container.textContent).toBe('BühneWerkzeugleiste');
    });

    it('shows the header above and the toolbar below the stage', () => {
        render(
            <MeetingRoom
                header={<header>Kopf</header>}
                stage={<div>Bühne</div>}
                toolbar={<div>Werkzeugleiste</div>}
            />,
        );
        const text = document.body.textContent!;
        expect(text.indexOf('Kopf')).toBeLessThan(text.indexOf('Bühne'));
        expect(text.indexOf('Bühne')).toBeLessThan(text.indexOf('Werkzeugleiste'));
    });

    it('keeps the overlay and prompt in the main area', () => {
        render(
            <MeetingRoom
                stage={<div>Bühne</div>}
                overlay={<p>Klopfen</p>}
                prompt={<p>Eingabe</p>}
                toolbar={<div>Werkzeugleiste</div>}
            />,
        );
        const main = screen.getByRole('main');
        expect(main).toContainElement(screen.getByText('Klopfen'));
        expect(main).toContainElement(screen.getByText('Eingabe'));
    });

    it('shows a panel beside the stage only when one is given', () => {
        const { rerender } = render(
            <MeetingRoom stage={<div>Bühne</div>} toolbar={<div>T</div>} />,
        );
        expect(screen.queryByText('Seitenleiste')).toBeNull();
        rerender(
            <MeetingRoom
                stage={<div>Bühne</div>}
                toolbar={<div>T</div>}
                panel={<div>Seitenleiste</div>}
            />,
        );
        expect(screen.getByText('Seitenleiste')).toBeInTheDocument();
        expect(screen.getByRole('main')).not.toContainElement(screen.getByText('Seitenleiste'));
    });

    it('merges a caller className', () => {
        const { container } = render(
            <MeetingRoom stage={<div />} toolbar={<div />} className="h-screen" />,
        );
        expect((container.firstChild as HTMLElement).className).toContain('h-screen');
    });
});

describe('MeetingRoomPanel', () => {
    const setup = (props: Partial<Parameters<typeof MeetingRoomPanel>[0]> = {}) => {
        const onClose = vi.fn();
        render(
            <MeetingRoomPanel
                title="Teilnehmer"
                closeLabel="Schließen"
                onClose={onClose}
                {...props}
            >
                <button type="button">Inhalt</button>
            </MeetingRoomPanel>,
        );
        return { onClose };
    };

    it('is a section labelled by its heading', () => {
        setup();
        const region = screen.getByRole('region', { name: 'Teilnehmer' });
        expect(region).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Teilnehmer' })).toBeInTheDocument();
    });

    it('renders its children', () => {
        setup();
        expect(screen.getByRole('button', { name: 'Inhalt' })).toBeInTheDocument();
    });

    it('renders the footer and header actions when given', () => {
        setup({ footer: <p>Fußzeile</p>, actions: <button type="button">Mehr</button> });
        expect(screen.getByText('Fußzeile')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Mehr' })).toBeInTheDocument();
    });

    it('renders no footer when none is given', () => {
        setup();
        expect(screen.queryByText('Fußzeile')).toBeNull();
    });

    it('calls onClose from the close button', async () => {
        const { onClose } = setup();
        await userEvent.click(screen.getByRole('button', { name: 'Schließen' }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('moves focus into the panel on mount', () => {
        setup();
        expect(screen.getByRole('region', { name: 'Teilnehmer' })).toHaveFocus();
    });

    it('closes on Escape pressed inside the panel', async () => {
        const { onClose } = setup();
        await userEvent.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape pressed on an element inside it', async () => {
        const { onClose } = setup();
        screen.getByRole('button', { name: 'Inhalt' }).focus();
        await userEvent.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('ignores other keys', async () => {
        const { onClose } = setup();
        await userEvent.keyboard('{Enter}a');
        expect(onClose).not.toHaveBeenCalled();
    });

    it('closes an open menu on Escape without closing the panel', async () => {
        const onClose = vi.fn();
        render(
            <MeetingRoomPanel title="Teilnehmer" closeLabel="Schließen" onClose={onClose}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button type="button">Mehr</button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Stummschalten</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </MeetingRoomPanel>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Mehr' }));
        expect(await screen.findByRole('menuitem', { name: 'Stummschalten' })).toBeInTheDocument();
        await userEvent.keyboard('{Escape}');
        expect(screen.queryByRole('menuitem')).toBeNull();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close when an earlier listener already handled Escape', async () => {
        const onClose = vi.fn();
        render(
            <MeetingRoomPanel title="Teilnehmer" closeLabel="Schließen" onClose={onClose}>
                <input aria-label="Feld" />
            </MeetingRoomPanel>,
        );
        const handle = (e: KeyboardEvent) => e.preventDefault();
        document.addEventListener('keydown', handle, true);
        try {
            screen.getByLabelText('Feld').focus();
            await userEvent.keyboard('{Escape}');
        } finally {
            document.removeEventListener('keydown', handle, true);
        }
        expect(onClose).not.toHaveBeenCalled();
    });

    it('calls the latest onClose after a re-render', async () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = render(
            <MeetingRoomPanel title="T" closeLabel="Schließen" onClose={first}>
                x
            </MeetingRoomPanel>,
        );
        rerender(
            <MeetingRoomPanel title="T" closeLabel="Schließen" onClose={second}>
                x
            </MeetingRoomPanel>,
        );
        await userEvent.keyboard('{Escape}');
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it('does not steal focus again on a re-render', async () => {
        const { rerender } = render(
            <MeetingRoomPanel title="T" closeLabel="Schließen" onClose={() => {}}>
                <input aria-label="Feld" />
            </MeetingRoomPanel>,
        );
        screen.getByLabelText('Feld').focus();
        rerender(
            <MeetingRoomPanel title="T2" closeLabel="Schließen" onClose={() => {}}>
                <input aria-label="Feld" />
            </MeetingRoomPanel>,
        );
        expect(screen.getByLabelText('Feld')).toHaveFocus();
    });
});
