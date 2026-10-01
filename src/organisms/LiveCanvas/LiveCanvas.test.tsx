import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LiveCanvas, LiveCanvasGroup, LiveCanvasTarget } from './LiveCanvas';

function Harness({ onSelect }: { onSelect?: (id: string | null) => void }) {
    const [selected, setSelected] = useState<string | null>(null);
    return (
        <LiveCanvas
            label="Stilbuch"
            selected={selected}
            onSelect={(id) => {
                setSelected(id);
                onSelect?.(id);
            }}
            artboardStyle={{ '--primary': 'red' } as React.CSSProperties}
        >
            <LiveCanvasGroup caption="Knöpfe">
                <LiveCanvasTarget id="button.primary" label="Hauptknopf">
                    <button type="button">Anmelden</button>
                </LiveCanvasTarget>
                <LiveCanvasTarget id="field" label="Feld">
                    <input aria-label="E-Mail" />
                </LiveCanvasTarget>
            </LiveCanvasGroup>
            <LiveCanvasTarget id="table" label="Tabelle" wide>
                <p>Tabelle</p>
            </LiveCanvasTarget>
            <p>Kein Baustein</p>
        </LiveCanvas>
    );
}
const option = (name: string) => screen.getByRole('option', { name });

describe('LiveCanvas', () => {
    it('is a named listbox of targets, nothing selected', () => {
        render(<Harness />);
        expect(screen.getByRole('listbox', { name: 'Stilbuch' })).toBeInTheDocument();
        expect(screen.getAllByRole('option')).toHaveLength(3);
        expect(option('Hauptknopf')).toHaveAttribute('aria-selected', 'false');
    });

    it('selects a target on click and shows its name tag', async () => {
        const onSelect = vi.fn();
        render(<Harness onSelect={onSelect} />);
        await userEvent.click(option('Feld'));
        expect(onSelect).toHaveBeenLastCalledWith('field');
        expect(option('Feld')).toHaveAttribute('aria-selected', 'true');
        expect(option('Feld')).toHaveTextContent('Feld');
    });

    it('deselects on a second click', async () => {
        const onSelect = vi.fn();
        render(<Harness onSelect={onSelect} />);
        await userEvent.click(option('Feld'));
        await userEvent.click(option('Feld'));
        expect(onSelect).toHaveBeenLastCalledWith(null);
    });

    it('selects nothing when the artboard around the targets is clicked', async () => {
        const onSelect = vi.fn();
        render(<Harness onSelect={onSelect} />);
        await userEvent.click(option('Feld'));
        await userEvent.click(screen.getByText('Kein Baustein'));
        expect(onSelect).toHaveBeenLastCalledWith(null);
    });

    it('makes the samples inert: shown, not usable, not in the tab order', () => {
        render(<Harness />);
        const sample = screen.getByText('Anmelden', { ignore: '[aria-hidden]' }).closest('[inert]');
        expect(sample).not.toBeNull();
    });

    it('is one tab stop; arrows move, Enter selects, Escape clears', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();
        render(<Harness onSelect={onSelect} />);
        await user.tab();
        const list = screen.getByRole('listbox');
        expect(list).toHaveFocus();
        await user.keyboard('{ArrowDown}');
        expect(list.getAttribute('aria-activedescendant')).toBe(option('Hauptknopf').id);
        await user.keyboard('{ArrowDown}{Enter}');
        expect(onSelect).toHaveBeenLastCalledWith('field');
        await user.keyboard('{Escape}');
        expect(onSelect).toHaveBeenLastCalledWith(null);
    });

    it('mirrors the arrows right-to-left: ← moves forward', async () => {
        const user = userEvent.setup();
        render(
            <div dir="rtl">
                <Harness />
            </div>,
        );
        await user.tab();
        const list = screen.getByRole('listbox');
        await user.keyboard('{ArrowLeft}');
        expect(list.getAttribute('aria-activedescendant')).toBe(option('Hauptknopf').id);
        await user.keyboard('{ArrowLeft}{ArrowRight}');
        expect(list.getAttribute('aria-activedescendant')).toBe(option('Hauptknopf').id);
    });

    it('wraps around and jumps with Home and End', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.tab();
        const list = screen.getByRole('listbox');
        await user.keyboard('{ArrowUp}');
        expect(list.getAttribute('aria-activedescendant')).toBe(option('Tabelle').id);
        await user.keyboard('{ArrowDown}');
        expect(list.getAttribute('aria-activedescendant')).toBe(option('Hauptknopf').id);
        await user.keyboard('{End}');
        expect(list.getAttribute('aria-activedescendant')).toBe(option('Tabelle').id);
        await user.keyboard('{Home}');
        expect(list.getAttribute('aria-activedescendant')).toBe(option('Hauptknopf').id);
    });

    it('toggles the active target with Space', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();
        render(<Harness onSelect={onSelect} />);
        await user.tab();
        await user.keyboard('{ArrowDown} ');
        expect(onSelect).toHaveBeenLastCalledWith('button.primary');
        await user.keyboard(' ');
        expect(onSelect).toHaveBeenLastCalledWith(null);
    });

    it('applies the artboard styles, so CSS variables repaint the samples', () => {
        render(<Harness />);
        const board = screen.getByRole('listbox').parentElement as HTMLElement;
        expect(board.style.getPropertyValue('--primary')).toBe('red');
    });

    it('refuses a target outside a canvas', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() =>
            render(
                <LiveCanvasTarget id="x" label="x">
                    x
                </LiveCanvasTarget>,
            ),
        ).toThrow(/inside a LiveCanvas/);
    });
});
