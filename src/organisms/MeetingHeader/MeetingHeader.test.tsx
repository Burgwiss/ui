import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MeetingHeader } from './MeetingHeader';

describe('MeetingHeader', () => {
    it('is a banner whose title is the page heading', () => {
        render(<MeetingHeader title="Arabisch A1" />);
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 1, name: 'Arabisch A1' })).toBeInTheDocument();
    });

    it('has exactly one heading', () => {
        render(<MeetingHeader title="Arabisch A1" subtitle="Lektion 3" />);
        expect(screen.getAllByRole('heading')).toHaveLength(1);
    });

    it('renders the subtitle, status and end slots', () => {
        render(
            <MeetingHeader
                title="Arabisch A1"
                subtitle="Lektion 3"
                status={<span>Aufnahme läuft</span>}
                end={<span>00:42:10</span>}
            />,
        );
        expect(screen.getByText('Lektion 3')).toBeInTheDocument();
        expect(screen.getByText('Aufnahme läuft')).toBeInTheDocument();
        expect(screen.getByText('00:42:10')).toBeInTheDocument();
    });

    it('renders only the title when nothing else is given', () => {
        render(<MeetingHeader title="Arabisch A1" />);
        expect(screen.getByRole('banner').textContent).toBe('Arabisch A1');
    });

    it('accepts rich nodes in the slots', () => {
        render(<MeetingHeader title="T" end={<button type="button">Einstellungen</button>} />);
        expect(screen.getByRole('button', { name: 'Einstellungen' })).toBeInTheDocument();
    });

    it('merges a caller className', () => {
        render(<MeetingHeader title="T" className="border-b" />);
        expect(screen.getByRole('banner').className).toContain('border-b');
    });
});
