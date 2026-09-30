import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { IntegerInput } from './IntegerInput';

// A minimal controlled host: useState<number> + onValueChange. The <output>
// exposes the numeric value the parent actually receives.
function Host({
    initial = 60,
    emptyValue,
    min,
    max,
    onBlur,
}: {
    initial?: number;
    emptyValue?: number;
    min?: number;
    max?: number;
    onBlur?: () => void;
}) {
    const [value, setValue] = useState(initial);
    return (
        <>
            <IntegerInput
                aria-label="Dauer"
                value={value}
                onValueChange={setValue}
                emptyValue={emptyValue}
                min={min}
                max={max}
                onBlur={onBlur}
            />
            <output data-testid="value">{value}</output>
        </>
    );
}

const field = () => screen.getByLabelText('Dauer') as HTMLInputElement;

describe('IntegerInput', () => {
    it('is a numeric-keyboard text field, not type=number', () => {
        render(<Host />);
        expect(field()).toHaveAttribute('type', 'text');
        expect(field()).toHaveAttribute('inputmode', 'numeric');
    });

    it('accepts a normal number', async () => {
        const user = userEvent.setup();
        render(<Host />);
        await user.clear(field());
        await user.type(field(), '75');
        expect(field().value).toBe('75');
        expect(screen.getByTestId('value').textContent).toBe('75');
    });

    it('strips leading zeros from the displayed value', async () => {
        const user = userEvent.setup();
        render(<Host />);
        await user.clear(field());
        await user.type(field(), '0075');
        expect(field().value).toBe('75');
        expect(screen.getByTestId('value').textContent).toBe('75');
    });

    it('a single zero is allowed while typing (not force-stripped to empty)', async () => {
        const user = userEvent.setup();
        render(<Host />);
        await user.clear(field());
        await user.type(field(), '0');
        expect(field().value).toBe('0');
    });

    it('reports emptyValue and shows an EMPTY box when cleared (not "0")', async () => {
        const user = userEvent.setup();
        render(<Host emptyValue={0} />);
        await user.clear(field());
        expect(field().value).toBe('');
        expect(screen.getByTestId('value').textContent).toBe('0');
    });

    it('honours a custom emptyValue', async () => {
        const user = userEvent.setup();
        render(<Host initial={2} emptyValue={1} />);
        await user.clear(field());
        expect(field().value).toBe('');
        expect(screen.getByTestId('value').textContent).toBe('1');
    });

    it('ignores non-digit characters', async () => {
        const user = userEvent.setup();
        render(<Host />);
        await user.clear(field());
        await user.type(field(), '7a5-.');
        expect(field().value).toBe('75');
    });

    it('re-syncs when the parent value changes (seed / reset)', () => {
        const { rerender } = render(
            <IntegerInput aria-label="Dauer" value={60} onValueChange={() => {}} />,
        );
        expect(field().value).toBe('60');
        rerender(<IntegerInput aria-label="Dauer" value={30} onValueChange={() => {}} />);
        expect(field().value).toBe('30');
    });

    it('clamps to max on blur, and reports the clamped value', async () => {
        const user = userEvent.setup();
        render(<Host max={720} />);
        await user.clear(field());
        await user.type(field(), '900');
        // Mid-typing nothing is clamped.
        expect(field().value).toBe('900');
        await user.tab();
        expect(field().value).toBe('720');
        expect(screen.getByTestId('value').textContent).toBe('720');
    });

    it('clamps to min on blur', async () => {
        const user = userEvent.setup();
        render(<Host min={5} />);
        await user.clear(field());
        await user.type(field(), '2');
        await user.tab();
        expect(field().value).toBe('5');
        expect(screen.getByTestId('value').textContent).toBe('5');
    });

    it('does not clamp an empty field on blur', async () => {
        const user = userEvent.setup();
        render(<Host min={5} emptyValue={0} />);
        await user.clear(field());
        await user.tab();
        expect(field().value).toBe('');
        expect(screen.getByTestId('value').textContent).toBe('0');
    });

    it('still clamps when the caller passes its own onBlur, and calls it after', async () => {
        // Regression: `{...rest}` used to come after the clamping onBlur, so any
        // caller-supplied onBlur (even `undefined`) silently disabled the clamp.
        const user = userEvent.setup();
        const onBlur = vi.fn();
        render(<Host max={10} onBlur={onBlur} />);
        await user.clear(field());
        await user.type(field(), '99');
        await user.tab();
        expect(field().value).toBe('10');
        expect(onBlur).toHaveBeenCalledOnce();
    });

    it('forwards the ref to the input', () => {
        const ref = createRef<HTMLInputElement>();
        render(<IntegerInput ref={ref} aria-label="x" value={1} onValueChange={vi.fn()} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
});
