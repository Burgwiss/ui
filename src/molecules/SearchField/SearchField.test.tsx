import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SearchField } from './SearchField';

function Controlled({ onChange }: { onChange: (v: string) => void }) {
    const [value, setValue] = useState('');
    return (
        <SearchField
            value={value}
            onValueChange={(v) => {
                setValue(v);
                onChange(v);
            }}
            placeholder="Kurse suchen"
        />
    );
}

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
});
