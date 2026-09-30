import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Textarea } from './Textarea';

describe('Textarea', () => {
    it('is a multiline textbox that reports what is typed', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<Textarea aria-label="Notiz" onChange={onChange} />);
        const box = screen.getByRole('textbox', { name: 'Notiz' });

        await user.type(box, 'Zeile eins{Enter}Zeile zwei');
        expect(box).toHaveValue('Zeile eins\nZeile zwei');
        expect(onChange).toHaveBeenCalled();
    });

    it('forwards the ref and native props', () => {
        const ref = createRef<HTMLTextAreaElement>();
        render(<Textarea ref={ref} aria-label="x" rows={7} maxLength={20} placeholder="Text" />);
        expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
        expect(ref.current).toHaveAttribute('rows', '7');
        expect(ref.current).toHaveAttribute('maxlength', '20');
        expect(screen.getByPlaceholderText('Text')).toBe(ref.current);
    });

    it('does not accept typing while disabled', async () => {
        const user = userEvent.setup();
        render(<Textarea aria-label="x" disabled />);
        await user.type(screen.getByRole('textbox'), 'abc');
        expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('merges a caller className with the base classes', () => {
        render(<Textarea aria-label="x" className="min-h-40" />);
        const cls = screen.getByRole('textbox').className;
        expect(cls).toContain('min-h-40');
        expect(cls).toContain('border-input');
    });

    it('carries aria-invalid through', () => {
        render(<Textarea aria-label="x" aria-invalid />);
        expect(screen.getByRole('textbox')).toBeInvalid();
    });
});
