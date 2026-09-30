import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toolbar, ToggleGroup } from 'radix-ui';
import { describe, expect, it, vi } from 'vitest';

import { IconToggle } from './IconToggle';

function Group({ onValueChange }: { onValueChange?: (v: string) => void }) {
    return (
        <ToggleGroup.Root type="single" aria-label="Ausrichtung" onValueChange={onValueChange}>
            <IconToggle as={ToggleGroup.Item} value="left" label="Links" icon={<svg />} />
            <IconToggle as={ToggleGroup.Item} value="right" label="Rechts" icon={<svg />} />
        </ToggleGroup.Root>
    );
}

describe('IconToggle', () => {
    it('uses the label as the accessible name', () => {
        render(<Group />);
        expect(screen.getByRole('radio', { name: 'Links' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Rechts' })).toBeInTheDocument();
    });

    it('selects its value in the group on click', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Group onValueChange={onValueChange} />);
        await user.click(screen.getByRole('radio', { name: 'Rechts' }));
        expect(onValueChange).toHaveBeenCalledWith('right');
        const chosen = screen.getByRole('radio', { name: 'Rechts' });
        expect(chosen).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByRole('radio', { name: 'Links' })).toHaveAttribute(
            'aria-checked',
            'false',
        );
        // The pressed look must key off ARIA: the tooltip trigger overwrites
        // `data-state`, so a `data-[state=on]` style would never apply.
        expect(chosen.className).toContain('aria-checked:bg-primary');
    });

    it('a multi-select group is styled through aria-pressed', () => {
        render(
            <ToggleGroup.Root type="multiple" aria-label="Format" defaultValue={['bold']}>
                <IconToggle as={ToggleGroup.Item} value="bold" label="Fett" icon={<svg />} />
            </ToggleGroup.Root>,
        );
        const bold = screen.getByRole('button', { name: 'Fett' });
        expect(bold).toHaveAttribute('aria-pressed', 'true');
        expect(bold.className).toContain('aria-pressed:bg-primary');
    });

    it('shows the label as a tooltip on keyboard focus', async () => {
        const user = userEvent.setup();
        render(<Group />);
        await user.tab();
        expect((await screen.findAllByText('Links')).length).toBeGreaterThan(0);
        expect(await screen.findByRole('tooltip')).toHaveTextContent('Links');
    });

    it('works with a different Radix item primitive (Toolbar.ToggleItem)', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(
            <Toolbar.Root aria-label="Werkzeuge">
                <Toolbar.ToggleGroup type="single" onValueChange={onValueChange}>
                    <IconToggle as={Toolbar.ToggleItem} value="bold" label="Fett" icon={<svg />} />
                </Toolbar.ToggleGroup>
            </Toolbar.Root>,
        );
        await user.click(screen.getByRole('radio', { name: 'Fett' }));
        expect(onValueChange).toHaveBeenCalledWith('bold');
    });

    it('forwards the ref and merges className', () => {
        const ref = createRef<HTMLButtonElement>();
        render(
            <ToggleGroup.Root type="single" aria-label="x">
                <IconToggle
                    ref={ref}
                    as={ToggleGroup.Item}
                    value="a"
                    label="A"
                    icon={<svg />}
                    className="px-4"
                />
            </ToggleGroup.Root>,
        );
        expect(ref.current?.tagName).toBe('BUTTON');
        expect(ref.current?.className).toContain('px-4');
    });
});
