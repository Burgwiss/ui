import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../Button';
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

describe('Tooltip on touch', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    function press(target: Element, { hold, moveBy = 0 }: { hold: number; moveBy?: number }) {
        fireEvent.pointerDown(target, { pointerType: 'touch', clientX: 10, clientY: 10 });
        if (moveBy) fireEvent.pointerMove(target, { pointerType: 'touch', clientX: 10, clientY: 10 + moveBy });
        act(() => {
            vi.advanceTimersByTime(hold);
        });
        fireEvent.pointerUp(target, { pointerType: 'touch', clientX: 10, clientY: 10 + moveBy });
        fireEvent.click(target);
    }

    it('opens on a long press, swallows that press and closes after the finger lifts', () => {
        const onClick = vi.fn();
        render(
            <Button size="icon" aria-label="Mikrofon" onClick={onClick}>
                <span aria-hidden="true">M</span>
            </Button>,
        );
        const trigger = screen.getByRole('button', { name: 'Mikrofon' });

        press(trigger, { hold: 500 });
        expect(screen.getByRole('tooltip')).toHaveTextContent('Mikrofon');
        expect(onClick).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(1500);
        });
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

        press(trigger, { hold: 100 });
        expect(onClick).toHaveBeenCalledOnce();
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('treats a moving finger as scrolling and leaves mouse and keyboard behaviour alone', () => {
        const onClick = vi.fn();
        render(
            <Button size="icon" aria-label="Kamera" onClick={onClick}>
                <span aria-hidden="true">K</span>
            </Button>,
        );
        const trigger = screen.getByRole('button', { name: 'Kamera' });

        press(trigger, { hold: 600, moveBy: 20 });
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        expect(onClick).toHaveBeenCalledOnce();

        fireEvent.pointerDown(trigger, { pointerType: 'mouse' });
        act(() => {
            vi.advanceTimersByTime(600);
        });
        fireEvent.pointerUp(trigger, { pointerType: 'mouse' });
        fireEvent.click(trigger);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
        expect(onClick).toHaveBeenCalledTimes(2);
    });

    it('explains a disabled button on a long press', () => {
        render(
            <Button disabled tooltip="Erst eine Lektion anlegen">
                Veröffentlichen
            </Button>,
        );
        press(screen.getByRole('button', { name: 'Veröffentlichen' }), { hold: 500 });
        expect(screen.getByRole('tooltip')).toHaveTextContent('Erst eine Lektion anlegen');
    });

    it('reports a touch-opened hint to a controlled tooltip', () => {
        const onOpenChange = vi.fn();
        render(
            <TooltipProvider>
                <Tooltip open={false} onOpenChange={onOpenChange}>
                    <TooltipTrigger>Info</TooltipTrigger>
                    <TooltipContent>Mehr dazu</TooltipContent>
                </Tooltip>
            </TooltipProvider>,
        );
        press(screen.getByRole('button', { name: 'Info' }), { hold: 500 });
        expect(onOpenChange).toHaveBeenCalledWith(true);
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
});
