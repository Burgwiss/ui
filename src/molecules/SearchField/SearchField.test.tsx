import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SearchField } from './SearchField';

function Controlled({
    onChange,
    collapsible,
}: {
    onChange: (v: string) => void;
    collapsible?: boolean;
}) {
    const [value, setValue] = useState('');
    return (
        <SearchField
            value={value}
            onValueChange={(v) => {
                setValue(v);
                onChange(v);
            }}
            placeholder="Kurse suchen"
            collapsible={collapsible}
        />
    );
}

const box = () => screen.getByRole('searchbox').parentElement!;

describe('SearchField', () => {
    it('is named by its placeholder, since a search box has no visible label', () => {
        render(<SearchField value="" onValueChange={() => {}} placeholder="Kurse suchen" />);
        expect(screen.getByRole('searchbox', { name: 'Kurse suchen' })).toBeInTheDocument();
    });

    it('reports every keystroke as the new value', async () => {
        const onChange = vi.fn();
        render(<Controlled onChange={onChange} />);
        await userEvent.type(screen.getByRole('searchbox'), 'abc');
        expect(onChange).toHaveBeenLastCalledWith('abc');
        expect(onChange).toHaveBeenCalledTimes(3);
    });

    it('has no axe violations', async () => {
        const { container } = render(
            <SearchField value="" onValueChange={() => {}} placeholder="Kurse suchen" />,
        );
        expect(await axe(container)).toHaveNoViolations();
    });

    describe('collapsible', () => {
        it('starts small and opens when focused', async () => {
            const user = userEvent.setup();
            render(<Controlled onChange={() => {}} collapsible />);
            expect(box()).not.toHaveAttribute('data-expanded');
            await user.click(screen.getByRole('searchbox'));
            expect(box()).toHaveAttribute('data-expanded');
        });

        it('closes again when left empty, and stays open while it holds a search', async () => {
            const user = userEvent.setup();
            render(<Controlled onChange={() => {}} collapsible />);
            await user.click(screen.getByRole('searchbox'));
            await user.tab();
            expect(box()).not.toHaveAttribute('data-expanded');
            await user.click(screen.getByRole('searchbox'));
            await user.keyboard('arab');
            await user.tab();
            expect(box()).toHaveAttribute('data-expanded');
        });

        it('opens from a keyboard focus too, so a shortcut can jump to it', () => {
            render(<Controlled onChange={() => {}} collapsible />);
            act(() => screen.getByRole('searchbox').focus());
            expect(box()).toHaveAttribute('data-expanded');
        });

        it('keeps its name while small, and passes axe', async () => {
            const { container } = render(<Controlled onChange={() => {}} collapsible />);
            expect(screen.getByRole('searchbox', { name: 'Kurse suchen' })).toBeInTheDocument();
            expect(await axe(container)).toHaveNoViolations();
        });

        it('is always open without collapsible', () => {
            render(<Controlled onChange={() => {}} />);
            expect(box()).toHaveAttribute('data-expanded');
        });
    });
});
