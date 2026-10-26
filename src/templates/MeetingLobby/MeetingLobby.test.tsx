import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MeetingLobby } from './MeetingLobby';

describe('MeetingLobby', () => {
    it('renders the title as the page heading', () => {
        render(
            <MeetingLobby title="Arabisch A1" access={<button type="button">Beitreten</button>} />,
        );
        expect(screen.getByRole('heading', { level: 1, name: 'Arabisch A1' })).toBeInTheDocument();
    });

    it('renders the access controls in the main landmark', () => {
        render(
            <MeetingLobby title="Arabisch A1" access={<button type="button">Beitreten</button>} />,
        );
        expect(screen.getByRole('main')).toContainElement(
            screen.getByRole('button', { name: 'Beitreten' }),
        );
    });

    it('works without a preview', () => {
        render(<MeetingLobby title="Arabisch A1" access={<p>Zugang</p>} />);
        expect(screen.getByText('Zugang')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('renders only title and access when nothing else is given', () => {
        render(<MeetingLobby title="Arabisch A1" access={<p>Zugang</p>} />);
        expect(screen.queryByRole('banner')).toBeNull();
        expect(screen.queryByRole('contentinfo')).toBeNull();
        expect(screen.queryByRole('complementary')).toBeNull();
        expect(screen.getByRole('main').textContent).toBe('Arabisch A1Zugang');
    });

    it('renders the preview, description and meta when given', () => {
        render(
            <MeetingLobby
                title="Arabisch A1"
                description={<p>Lektion 3</p>}
                meta={<span>Beginnt um 18:00</span>}
                preview={<div>Kamera-Vorschau</div>}
                access={<p>Zugang</p>}
            />,
        );
        expect(screen.getByText('Kamera-Vorschau')).toBeInTheDocument();
        expect(screen.getByText('Lektion 3')).toBeInTheDocument();
        expect(screen.getByText('Beginnt um 18:00')).toBeInTheDocument();
    });

    it('renders the header as a banner and the footer as contentinfo', () => {
        render(
            <MeetingLobby
                title="Arabisch A1"
                header={<span>Logo</span>}
                footer={<span>Impressum</span>}
                access={<p>Zugang</p>}
            />,
        );
        expect(screen.getByRole('banner')).toHaveTextContent('Logo');
        expect(screen.getByRole('contentinfo')).toHaveTextContent('Impressum');
    });

    it('renders the aside as a complementary landmark', () => {
        render(
            <MeetingLobby title="Arabisch A1" aside={<p>Teilnehmer</p>} access={<p>Zugang</p>} />,
        );
        expect(screen.getByRole('complementary')).toHaveTextContent('Teilnehmer');
    });

    it('renders the notice above the title', () => {
        render(
            <MeetingLobby
                title="Arabisch A1"
                notice={<div role="alert">Aufnahme aktiv</div>}
                access={<p>Zugang</p>}
            />,
        );
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Aufnahme aktiv');
        const text = screen.getByRole('main').textContent!;
        expect(text.indexOf('Aufnahme aktiv')).toBeLessThan(text.indexOf('Arabisch A1'));
    });

    it('has a single h1 even with every slot filled', () => {
        render(
            <MeetingLobby
                header={<span>Logo</span>}
                notice={<p>n</p>}
                title="Arabisch A1"
                description="d"
                meta="m"
                access={<p>Zugang</p>}
                preview={<p>p</p>}
                aside={<p>a</p>}
                footer={<p>f</p>}
            />,
        );
        expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });

    it('merges a caller className', () => {
        const { container } = render(
            <MeetingLobby title="T" access={<p>x</p>} className="bg-muted" />,
        );
        expect((container.firstChild as HTMLElement).className).toContain('bg-muted');
    });
});
