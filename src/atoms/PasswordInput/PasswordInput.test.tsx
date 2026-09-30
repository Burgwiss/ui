import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PasswordInput } from './PasswordInput';

const labels = { show: 'Passwort anzeigen', hide: 'Passwort verbergen' };

describe('PasswordInput', () => {
    it('renders masked by default with a "show" toggle named from labels.show', () => {
        render(<PasswordInput labels={labels} aria-label="Passwort" defaultValue="geheim" />);
        expect(screen.getByLabelText('Passwort')).toHaveAttribute('type', 'password');
        const toggle = screen.getByRole('button', { name: 'Passwort anzeigen' });
        expect(toggle).toHaveAttribute('aria-pressed', 'false');
    });

    it('reveals on click (toggle renamed from labels.hide) and re-masks on the next click', async () => {
        const user = userEvent.setup();
        render(<PasswordInput labels={labels} aria-label="Passwort" defaultValue="geheim" />);

        await user.click(screen.getByRole('button', { name: 'Passwort anzeigen' }));
        expect(screen.getByLabelText('Passwort')).toHaveAttribute('type', 'text');
        const hide = screen.getByRole('button', { name: 'Passwort verbergen' });
        expect(hide).toHaveAttribute('aria-pressed', 'true');

        await user.click(hide);
        expect(screen.getByLabelText('Passwort')).toHaveAttribute('type', 'password');
    });

    it('the toggle never submits a surrounding form', async () => {
        const user = userEvent.setup();
        let submitted = false;
        render(
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submitted = true;
                }}
            >
                <PasswordInput labels={labels} aria-label="Passwort" />
            </form>,
        );
        await user.click(screen.getByRole('button', { name: 'Passwort anzeigen' }));
        expect(submitted).toBe(false);
    });

    it('keeps the typed value when toggling visibility', async () => {
        const user = userEvent.setup();
        render(<PasswordInput labels={labels} aria-label="Passwort" />);
        await user.type(screen.getByLabelText('Passwort'), 'abc123');
        await user.click(screen.getByRole('button', { name: 'Passwort anzeigen' }));
        expect(screen.getByLabelText('Passwort')).toHaveValue('abc123');
    });

    it('forwards input props and the ref (labels is not leaked to the DOM)', () => {
        const ref = createRef<HTMLInputElement>();
        render(
            <PasswordInput
                ref={ref}
                labels={labels}
                id="pw"
                autoComplete="new-password"
                aria-label="Passwort"
            />,
        );
        const input = screen.getByLabelText('Passwort');
        expect(input).toHaveAttribute('id', 'pw');
        expect(input).toHaveAttribute('autocomplete', 'new-password');
        expect(input).not.toHaveAttribute('labels');
        expect(ref.current).toBe(input);
    });
});
