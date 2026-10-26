import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RecordingIndicator, type RecordingState } from './RecordingIndicator';

const labels: Partial<Record<RecordingState, string>> = {
    scheduled: 'Aufnahme geplant',
    recording: 'Aufnahme läuft',
    processing: 'Aufnahme wird verarbeitet',
    available: 'Aufnahme verfügbar',
    failed: 'Aufnahme fehlgeschlagen',
};

describe('RecordingIndicator', () => {
    it.each(Object.keys(labels) as RecordingState[])(
        'shows the label for the %s state',
        (state) => {
            render(<RecordingIndicator state={state} labels={labels} />);
            expect(screen.getByRole('status')).toHaveTextContent(labels[state]!);
        },
    );

    it('shows only the label of the current state', () => {
        render(<RecordingIndicator state="recording" labels={labels} />);
        expect(screen.getByRole('status')).toHaveTextContent('Aufnahme läuft');
        expect(screen.queryByText('Aufnahme geplant')).toBeNull();
    });

    it('keeps the status region present even when the state has no label', () => {
        render(<RecordingIndicator state="none" labels={labels} />);
        const status = screen.getByRole('status');
        expect(status).toBeInTheDocument();
        expect(status).toBeEmptyDOMElement();
    });

    it('announces a change: the same region gets its text when recording starts', () => {
        const { rerender } = render(<RecordingIndicator state="none" labels={labels} />);
        const status = screen.getByRole('status');
        expect(status).toBeEmptyDOMElement();
        rerender(<RecordingIndicator state="recording" labels={labels} />);
        expect(screen.getByRole('status')).toBe(status);
        expect(status).toHaveTextContent('Aufnahme läuft');
    });

    it('renders nothing inside for an empty label', () => {
        render(<RecordingIndicator state="recording" labels={{ recording: '' }} />);
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });

    it('marks the pill with its state', () => {
        render(<RecordingIndicator state="failed" labels={labels} />);
        expect(screen.getByText('Aufnahme fehlgeschlagen')).toHaveAttribute('data-state', 'failed');
    });

    it('hides the decorative recording dot from assistive tech', () => {
        render(<RecordingIndicator state="recording" labels={labels} />);
        const pill = screen.getByText('Aufnahme läuft');
        const dot = pill.querySelector('[aria-hidden="true"]');
        expect(dot).not.toBeNull();
    });

    it('merges a caller className onto the pill', () => {
        render(<RecordingIndicator state="available" labels={labels} className="ms-2" />);
        expect(screen.getByText('Aufnahme verfügbar').className).toContain('ms-2');
    });
});
