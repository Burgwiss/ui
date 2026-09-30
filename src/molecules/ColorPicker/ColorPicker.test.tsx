import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ColorPicker } from './ColorPicker';

const swatch = () => screen.getByLabelText('Farbe wählen') as HTMLInputElement;
const text = () => screen.getByRole('textbox') as HTMLInputElement;

describe('ColorPicker', () => {
    it('shows the OKLCH value in the text field and its hex on the swatch', () => {
        render(
            <ColorPicker
                id="c"
                value="oklch(1 0 0)"
                onChange={() => {}}
                swatchAriaLabel="Farbe wählen"
            />,
        );
        expect(text()).toHaveValue('oklch(1 0 0)');
        expect(swatch()).toHaveValue('#ffffff');
    });

    it('falls back to black on the swatch for an unparseable value', () => {
        render(
            <ColorPicker
                id="c"
                value="kaputt"
                onChange={() => {}}
                swatchAriaLabel="Farbe wählen"
            />,
        );
        expect(swatch()).toHaveValue('#000000');
    });

    it('names the swatch through swatchAriaLabel', () => {
        render(
            <ColorPicker
                id="c"
                value="oklch(1 0 0)"
                onChange={() => {}}
                swatchAriaLabel="Farbe wählen"
            />,
        );
        expect(swatch()).toHaveAttribute('type', 'color');
    });

    it('picking on the swatch reports an OKLCH string', () => {
        const onChange = vi.fn();
        render(
            <ColorPicker
                id="c"
                value="oklch(1 0 0)"
                onChange={onChange}
                swatchAriaLabel="Farbe wählen"
            />,
        );
        fireEvent.change(swatch(), { target: { value: '#000000' } });
        expect(onChange).toHaveBeenCalledWith('oklch(0 0 0)');
    });

    it('typing in the text field reports the raw text', async () => {
        const user = userEvent.setup();
        function Host() {
            const [v, setV] = useState('');
            return (
                <>
                    <ColorPicker id="c" value={v} onChange={setV} swatchAriaLabel="Farbe wählen" />
                    <output data-testid="out">{v}</output>
                </>
            );
        }
        render(<Host />);
        await user.type(text(), 'oklch(0.5 0.1 200)');
        expect(screen.getByTestId('out')).toHaveTextContent('oklch(0.5 0.1 200)');
    });

    it('puts the id on the text field so a <label> can target it', () => {
        render(
            <>
                <label htmlFor="farbe">Primärfarbe</label>
                <ColorPicker
                    id="farbe"
                    value="oklch(1 0 0)"
                    onChange={() => {}}
                    swatchAriaLabel="Farbe wählen"
                />
            </>,
        );
        expect(screen.getByLabelText('Primärfarbe')).toBe(text());
    });

    it('marks the text field invalid only when asked', () => {
        const { rerender } = render(
            <ColorPicker id="c" value="x" onChange={() => {}} swatchAriaLabel="Farbe wählen" />,
        );
        expect(text()).not.toHaveAttribute('aria-invalid');
        rerender(
            <ColorPicker
                id="c"
                value="x"
                onChange={() => {}}
                swatchAriaLabel="Farbe wählen"
                ariaInvalid
            />,
        );
        expect(text()).toHaveAttribute('aria-invalid', 'true');
    });

    it('merges a caller className onto the wrapper', () => {
        const { container } = render(
            <ColorPicker
                id="c"
                value="x"
                onChange={() => {}}
                swatchAriaLabel="Farbe wählen"
                className="w-64"
            />,
        );
        expect((container.firstChild as HTMLElement).className).toContain('w-64');
    });
});
