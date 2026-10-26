import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ReactionPicker, type ReactionOption } from './ReactionPicker';

const reactions: ReactionOption[] = [
    { id: 'like', emoji: '👍', label: 'Daumen hoch' },
    { id: 'clap', emoji: '👏', label: 'Applaus' },
    { id: 'laugh', emoji: '😂', label: 'Lachen' },
];

describe('ReactionPicker', () => {
    it('is a group named by label', () => {
        render(<ReactionPicker reactions={reactions} onPick={() => {}} label="Reaktionen" />);
        expect(screen.getByRole('group', { name: 'Reaktionen' })).toBeInTheDocument();
    });

    it('names each button by its meaning, not by the emoji', () => {
        render(<ReactionPicker reactions={reactions} onPick={() => {}} label="Reaktionen" />);
        const buttons = screen.getAllByRole('button');
        expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
            'Daumen hoch',
            'Applaus',
            'Lachen',
        ]);
        expect(screen.getByRole('button', { name: 'Applaus' })).toBeInTheDocument();
    });

    it('calls onPick with the id of the clicked reaction', async () => {
        const onPick = vi.fn();
        render(<ReactionPicker reactions={reactions} onPick={onPick} label="Reaktionen" />);
        await userEvent.click(screen.getByRole('button', { name: 'Applaus' }));
        expect(onPick).toHaveBeenCalledTimes(1);
        expect(onPick).toHaveBeenCalledWith('clap');
    });

    it('can be picked with the keyboard', async () => {
        const onPick = vi.fn();
        const user = userEvent.setup();
        render(<ReactionPicker reactions={reactions} onPick={onPick} label="Reaktionen" />);
        await user.tab();
        await user.keyboard('{Enter}');
        expect(onPick).toHaveBeenCalledWith('like');
    });

    it('lets the same reaction be picked twice', async () => {
        const onPick = vi.fn();
        render(<ReactionPicker reactions={reactions} onPick={onPick} label="Reaktionen" />);
        const clap = screen.getByRole('button', { name: 'Applaus' });
        await userEvent.click(clap);
        await userEvent.click(clap);
        expect(onPick).toHaveBeenCalledTimes(2);
    });

    it('disables every reaction and picks nothing when disabled', async () => {
        const onPick = vi.fn();
        render(
            <ReactionPicker reactions={reactions} onPick={onPick} label="Reaktionen" disabled />,
        );
        for (const b of screen.getAllByRole('button')) expect(b).toBeDisabled();
        await userEvent.click(screen.getByRole('button', { name: 'Applaus' }));
        expect(onPick).not.toHaveBeenCalled();
    });

    it('renders an empty group for no reactions', () => {
        render(<ReactionPicker reactions={[]} onPick={() => {}} label="Reaktionen" />);
        expect(screen.getByRole('group', { name: 'Reaktionen' })).toBeEmptyDOMElement();
    });

    it('hides the emoji glyph from assistive tech', () => {
        render(<ReactionPicker reactions={reactions} onPick={() => {}} label="Reaktionen" />);
        expect(screen.getByText('👏')).toHaveAttribute('aria-hidden', 'true');
    });
});
