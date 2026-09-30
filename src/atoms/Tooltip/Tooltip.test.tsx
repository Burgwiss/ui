import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../atoms/Tooltip';

/**
 * Marketing P1 — shadcn Tooltip primitive smoke test.
 *
 *   - Trigger + content render
 *   - getByRole('tooltip') resolves after focus
 *   - aria-label on the trigger button carries through
 */
describe('Components/ui/tooltip', () => {
    function Fixture() {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button type="button" aria-label="Reset to defaults">
                            <span aria-hidden="true">⟳</span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Reset to defaults</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    it('renders the trigger with its accessible name', () => {
        render(<Fixture />);

        expect(screen.getByRole('button', { name: 'Reset to defaults' })).toBeInTheDocument();
    });

    it('reveals the tooltip content on focus', async () => {
        const user = userEvent.setup();
        render(<Fixture />);

        const trigger = screen.getByRole('button', { name: 'Reset to defaults' });
        await user.tab();

        expect(trigger).toHaveFocus();
        // Radix-UI renders the tooltip into a portal; once focused, the
        // tooltip role should be discoverable.
        expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    });
});
