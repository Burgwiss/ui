import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { InlineText, type InlineTextProps } from './InlineText';

function Harness(props: Partial<InlineTextProps> & { initial?: string }) {
    const { initial = 'Arabisch für Anfänger', onChange, ...rest } = props;
    const [value, setValue] = useState(initial);
    return (
        <InlineText
            label="Titel"
            placeholder="Wie heißt der Kurs?"
            value={value}
            onChange={(v) => {
                setValue(v);
                onChange?.(v);
            }}
            {...rest}
        />
    );
}

describe('InlineText', () => {
    it('shows the text as a button named by its label and value', () => {
        render(<Harness />);
        expect(
            screen.getByRole('button', { name: 'Titel: Arabisch für Anfänger' }),
        ).toBeInTheDocument();
    });

    it('wraps the text in the element asked for', () => {
        render(<Harness as="h1" />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Arabisch für Anfänger',
        );
    });

    it('turns into a field on click, with the text selected; Enter keeps the change', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Harness onChange={onChange} />);
        await user.click(screen.getByRole('button'));
        const field = screen.getByRole('textbox', { name: 'Titel' });
        expect(field).toHaveFocus();
        await user.keyboard('Arabisch kompakt{Enter}');
        expect(onChange).toHaveBeenCalledWith('Arabisch kompakt');
        expect(screen.getByRole('button', { name: 'Titel: Arabisch kompakt' })).toHaveFocus();
    });

    it('throws the change away on Escape', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Harness onChange={onChange} />);
        await user.click(screen.getByRole('button'));
        await user.keyboard('Egal{Escape}');
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: /Arabisch für Anfänger/ })).toHaveFocus();
    });

    it('keeps the change when focus leaves, trimmed', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <>
                <Harness onChange={onChange} />
                <button type="button">anderswo</button>
            </>,
        );
        await user.click(screen.getByRole('button', { name: /Titel/ }));
        await user.keyboard('  Neu  ');
        await user.click(screen.getByRole('button', { name: 'anderswo' }));
        expect(onChange).toHaveBeenCalledWith('Neu');
    });

    it('does not report an unchanged value', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Harness onChange={onChange} />);
        await user.click(screen.getByRole('button'));
        await user.keyboard('{End}{Enter}');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('multiline: Enter makes a new line, Ctrl/⌘+Enter keeps', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Harness multiline initial="Zeile" onChange={onChange} />);
        await user.click(screen.getByRole('button'));
        await user.keyboard('{End}{Enter}zwei');
        expect(onChange).not.toHaveBeenCalled();
        await user.keyboard('{Control>}{Enter}{/Control}');
        expect(onChange).toHaveBeenCalledWith('Zeile\nzwei');
    });

    it('when empty, says what belongs there instead of leaving a hole', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(<Harness initial="" onChange={onChange} />);
        const add = screen.getByRole('button', { name: 'Titel — Wie heißt der Kurs?' });
        await user.click(add);
        await user.keyboard('Tafsir{Enter}');
        expect(onChange).toHaveBeenCalledWith('Tafsir');
    });

    it('can be cleared, and then offers to fill it again', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByRole('button'));
        await user.clear(screen.getByRole('textbox'));
        await user.keyboard('{Enter}');
        expect(screen.getByRole('button', { name: 'Titel — Wie heißt der Kurs?' })).toBeVisible();
    });

    it('passes axe, filled and empty', async () => {
        const { container } = render(
            <>
                <Harness />
                <Harness initial="" label="Kurzbeschreibung" />
            </>,
        );
        expect(await axe(container)).toHaveNoViolations();
    });
});
