import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Chip, ChipRow } from './Chip';

describe('Chip (single)', () => {
    it('reflects selected state via aria-pressed + a check glyph', () => {
        const { rerender } = render(<Chip selected>Arabisch</Chip>);
        const btn = screen.getByRole('button', { name: /Arabisch/ });
        expect(btn).toHaveAttribute('aria-pressed', 'true');
        expect(btn.querySelector('svg')).not.toBeNull();

        rerender(<Chip>Arabisch</Chip>);
        const off = screen.getByRole('button', { name: /Arabisch/ });
        expect(off).toHaveAttribute('aria-pressed', 'false');
        expect(off.querySelector('svg')).toBeNull();
    });

    it('fires onClick when activated', async () => {
        const onClick = vi.fn();
        render(<Chip onClick={onClick}>Koran</Chip>);
        await userEvent.click(screen.getByRole('button', { name: /Koran/ }));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('is a non-submitting button', () => {
        render(<Chip>Koran</Chip>);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });
});

describe('Chip (multi)', () => {
    it('is a real checkbox named by its text and reports the toggled value', async () => {
        const onChange = vi.fn();
        render(
            <Chip multi id="t1" checked={false} onChange={onChange}>
                Abendkurs
            </Chip>,
        );
        const box = screen.getByRole('checkbox', { name: 'Abendkurs' });
        await userEvent.click(box);
        expect(onChange).toHaveBeenCalledWith(true);
    });

    it('shows the check glyph and data-state when checked', () => {
        const { container } = render(
            <Chip multi id="t1" checked onChange={() => {}}>
                Abendkurs
            </Chip>,
        );
        expect(container.querySelector('label')).toHaveAttribute('data-state', 'on');
        expect(container.querySelector('label svg')).not.toBeNull();
    });

    it('takes an explicit accessible name over its children', () => {
        render(
            <Chip multi id="t1" checked={false} onChange={() => {}} ariaLabel="Nur Abendkurse">
                Abend
            </Chip>,
        );
        expect(screen.getByRole('checkbox', { name: 'Nur Abendkurse' })).toBeInTheDocument();
    });

    it('toggles with the space key', async () => {
        const onChange = vi.fn();
        const user = userEvent.setup();
        render(
            <Chip multi id="t1" checked={false} onChange={onChange}>
                Abendkurs
            </Chip>,
        );
        await user.tab();
        await user.keyboard(' ');
        expect(onChange).toHaveBeenCalledWith(true);
    });
});

describe('ChipRow', () => {
    function setup() {
        render(
            <ChipRow ariaLabel="Kategorien">
                <Chip selected>Alle</Chip>
                <Chip>Arabisch</Chip>
                <Chip>Koran</Chip>
            </ChipRow>,
        );
        return {
            all: screen.getByRole('button', { name: /Alle/ }),
            arabic: screen.getByRole('button', { name: /Arabisch/ }),
            quran: screen.getByRole('button', { name: /Koran/ }),
        };
    }

    it('exposes the group label', () => {
        setup();
        expect(screen.getByRole('group', { name: 'Kategorien' })).toBeInTheDocument();
    });

    it('roves focus with arrow keys, Home and End, clamping at both ends', async () => {
        const user = userEvent.setup();
        const { all, arabic, quran } = setup();
        all.focus();

        await user.keyboard('{ArrowRight}');
        expect(arabic).toHaveFocus();
        await user.keyboard('{End}');
        expect(quran).toHaveFocus();
        await user.keyboard('{ArrowRight}');
        expect(quran).toHaveFocus();
        await user.keyboard('{Home}');
        expect(all).toHaveFocus();
        await user.keyboard('{ArrowLeft}');
        expect(all).toHaveFocus();
    });

    it('keeps a single tab stop that follows focus', async () => {
        const user = userEvent.setup();
        const { all, arabic, quran } = setup();
        all.focus();
        expect([all.tabIndex, arabic.tabIndex, quran.tabIndex]).toEqual([0, -1, -1]);

        await user.keyboard('{ArrowRight}');
        expect([all.tabIndex, arabic.tabIndex, quran.tabIndex]).toEqual([-1, 0, -1]);
    });

    it('ignores keys it does not handle', async () => {
        const user = userEvent.setup();
        const { all } = setup();
        all.focus();
        await user.keyboard('a');
        expect(all).toHaveFocus();
    });
});
