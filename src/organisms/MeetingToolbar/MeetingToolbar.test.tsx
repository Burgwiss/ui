import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MeetingToolbar } from './MeetingToolbar';

describe('MeetingToolbar', () => {
    it('is a group named by its label', () => {
        render(
            <MeetingToolbar label="Meeting-Steuerung">
                <button type="button">Mikrofon</button>
            </MeetingToolbar>,
        );
        expect(screen.getByRole('group', { name: 'Meeting-Steuerung' })).toBeInTheDocument();
    });

    it('renders its children', () => {
        render(
            <MeetingToolbar label="Steuerung">
                <button type="button">Mikrofon</button>
                <button type="button">Kamera</button>
            </MeetingToolbar>,
        );
        const group = screen.getByRole('group', { name: 'Steuerung' });
        expect(
            within(group)
                .getAllByRole('button')
                .map((b) => b.textContent),
        ).toEqual(['Mikrofon', 'Kamera']);
    });

    it('renders the start and end slots', () => {
        render(
            <MeetingToolbar
                label="Steuerung"
                start={<span>12:04 · Mathe</span>}
                end={<button type="button">Verlassen</button>}
            >
                <button type="button">Mikrofon</button>
            </MeetingToolbar>,
        );
        expect(screen.getByText('12:04 · Mathe')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Verlassen' })).toBeInTheDocument();
    });

    it('keeps start, children and end in that order', () => {
        render(
            <MeetingToolbar label="Steuerung" start={<span>Start</span>} end={<span>Ende</span>}>
                <span>Mitte</span>
            </MeetingToolbar>,
        );
        const text = screen.getByRole('group').textContent;
        expect(text?.indexOf('Start')).toBeLessThan(text!.indexOf('Mitte'));
        expect(text?.indexOf('Mitte')).toBeLessThan(text!.indexOf('Ende'));
    });

    it('works with children only', () => {
        render(
            <MeetingToolbar label="Steuerung">
                <span>Nur Mitte</span>
            </MeetingToolbar>,
        );
        expect(screen.getByText('Nur Mitte')).toBeInTheDocument();
    });

    it('merges a caller className', () => {
        render(
            <MeetingToolbar label="Steuerung" className="border-t">
                <span>x</span>
            </MeetingToolbar>,
        );
        expect(screen.getByRole('group').className).toContain('border-t');
    });
});
