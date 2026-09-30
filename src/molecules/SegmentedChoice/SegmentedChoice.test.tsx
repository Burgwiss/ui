import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SegmentedChoice, SegmentedChoiceItem } from './SegmentedChoice';

function Fixture({ onValueChange }: { onValueChange?: (v: string) => void }) {
    return (
        <SegmentedChoice defaultValue="a" aria-label="Abrechnung" onValueChange={onValueChange}>
            <SegmentedChoiceItem value="a">Monatlich</SegmentedChoiceItem>
            <SegmentedChoiceItem value="b">Jährlich</SegmentedChoiceItem>
            <SegmentedChoiceItem value="c" disabled>
                Einmalig
            </SegmentedChoiceItem>
        </SegmentedChoice>
    );
}

describe('SegmentedChoice', () => {
    it('is a radiogroup, not a tablist, with the default value checked', () => {
        render(<Fixture />);
        expect(screen.getByRole('radiogroup', { name: 'Abrechnung' })).toBeInTheDocument();
        expect(screen.queryByRole('tablist')).toBeNull();
        expect(screen.getByRole('radio', { name: 'Monatlich' })).toBeChecked();
    });

    it('selects on click and reports the value', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Fixture onValueChange={onValueChange} />);
        await user.click(screen.getByRole('radio', { name: 'Jährlich' }));
        expect(onValueChange).toHaveBeenCalledWith('b');
        expect(screen.getByRole('radio', { name: 'Jährlich' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'Monatlich' })).not.toBeChecked();
    });

    it('a disabled option cannot be chosen', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Fixture onValueChange={onValueChange} />);
        await user.click(screen.getByRole('radio', { name: 'Einmalig' }));
        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('arrow keys move focus between the enabled options', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        screen.getByRole('radio', { name: 'Monatlich' }).focus();
        await user.keyboard('{ArrowRight}');
        await waitFor(() => expect(screen.getByRole('radio', { name: 'Jährlich' })).toHaveFocus());
    });

    it('styles the checked option with the primary token', () => {
        render(<Fixture />);
        expect(screen.getByRole('radio', { name: 'Monatlich' }).className).toContain(
            'data-[state=checked]:bg-primary',
        );
    });

    it('forwards refs on group and item', () => {
        const group = createRef<HTMLDivElement>();
        const item = createRef<HTMLButtonElement>();
        render(
            <SegmentedChoice ref={group} aria-label="x">
                <SegmentedChoiceItem ref={item} value="a">
                    A
                </SegmentedChoiceItem>
            </SegmentedChoice>,
        );
        expect(group.current).toBeInstanceOf(HTMLElement);
        expect(item.current).toBeInstanceOf(HTMLElement);
    });
});
