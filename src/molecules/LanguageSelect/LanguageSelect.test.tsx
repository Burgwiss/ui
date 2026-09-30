import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

import { LanguageSelect, type LanguageSelectProps } from './LanguageSelect';
import { languageLabels, languageOptions } from './LanguageSelect.fixtures';

function setup(props: Partial<LanguageSelectProps> = {}) {
    const onValueChange = vi.fn();
    const utils = render(
        <LanguageSelect
            languages={languageOptions}
            value="de"
            onValueChange={onValueChange}
            labels={languageLabels}
            {...props}
        />,
    );
    return { onValueChange, ...utils };
}

describe('LanguageSelect', () => {
    it('shows the current language name and its progress in the trigger', () => {
        setup();
        const trigger = screen.getByRole('combobox');
        expect(trigger).toHaveTextContent('Deutsch');
        expect(trigger).toHaveTextContent('5/7');
        expect(trigger).not.toHaveTextContent('Englisch');
    });

    it('names the trigger with the control label, the language and the spoken progress', () => {
        setup();
        expect(
            screen.getByRole('combobox', {
                name: 'Sprache der Seite: Deutsch, 5 von 7 ausgefüllt',
            }),
        ).toBeInTheDocument();
    });

    it('follows the value prop', () => {
        setup({ value: 'tr' });
        const trigger = screen.getByRole('combobox');
        expect(trigger).toHaveTextContent('Türkisch');
        expect(trigger).toHaveTextContent('0/7');
        expect(trigger.getAttribute('aria-label')).toContain('0 von 7 ausgefüllt');
    });

    it('falls back to the plain control label when the value matches no language', () => {
        setup({ value: 'xx' });
        expect(screen.getByRole('combobox', { name: 'Sprache der Seite' })).toBeInTheDocument();
    });

    it('lists every language with its progress, spoken in each option name', async () => {
        const user = userEvent.setup();
        setup();
        await user.click(screen.getByRole('combobox'));

        expect(screen.getAllByRole('option')).toHaveLength(4);
        expect(screen.getByRole('option', { name: 'Deutsch 5 von 7 ausgefüllt' })).toBeVisible();
        expect(screen.getByRole('option', { name: 'Englisch 1 von 7 ausgefüllt' })).toBeVisible();
        expect(screen.getByRole('option', { name: 'Türkisch 0 von 7 ausgefüllt' })).toBeVisible();
        expect(screen.getByRole('option', { name: 'Arabisch 7 von 7 ausgefüllt' })).toBeVisible();

        const english = screen.getByRole('option', { name: /Englisch/ });
        expect(english).toHaveTextContent('1/7');
    });

    it('draws a progress bar per language in the list', async () => {
        const user = userEvent.setup();
        setup();
        await user.click(screen.getByRole('combobox'));
        const bars = document.querySelectorAll('[data-slot="language-select-bar"]');
        expect(bars).toHaveLength(4);
        const widths = Array.from(bars).map(
            (bar) => (bar.firstElementChild as HTMLElement).style.width,
        );
        expect(widths[0]).toMatch(/^71\.4/);
        expect(widths[1]).toMatch(/^14\.2/);
        expect(widths[2]).toBe('0%');
        expect(widths[3]).toBe('100%');
    });

    it('reports the language code when an option is clicked', async () => {
        const user = userEvent.setup();
        const { onValueChange } = setup();
        await user.click(screen.getByRole('combobox'));
        await user.click(screen.getByRole('option', { name: /Englisch/ }));
        expect(onValueChange).toHaveBeenCalledOnce();
        expect(onValueChange).toHaveBeenCalledWith('en');
        expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('is operable from the keyboard', async () => {
        const user = userEvent.setup();
        const { onValueChange } = setup();
        await user.tab();
        expect(screen.getByRole('combobox')).toHaveFocus();
        await user.keyboard('{Enter}');
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        await user.keyboard('{ArrowDown}{Enter}');
        expect(onValueChange).toHaveBeenCalledOnce();
        expect(onValueChange).toHaveBeenCalledWith('en');
    });

    it('closes on Escape without choosing', async () => {
        const user = userEvent.setup();
        const { onValueChange } = setup();
        await user.click(screen.getByRole('combobox'));
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('listbox')).toBeNull();
        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('marks complete and incomplete languages with data-complete', async () => {
        const user = userEvent.setup();
        setup({ value: 'ar' });
        const triggerChip = within(screen.getByRole('combobox')).getByText('7/7');
        expect(triggerChip).toHaveAttribute('data-complete', 'true');
        expect(triggerChip.className).toContain('text-success-tint-foreground');

        await user.click(screen.getByRole('combobox'));
        const german = screen.getByRole('option', { name: /Deutsch/ });
        expect(german).toHaveAttribute('data-complete', 'false');
        expect(within(german).getByText('5/7')).toHaveAttribute('data-complete', 'false');
        expect(within(german).getByText('5/7').className).toContain('text-warning-tint-foreground');
        expect(screen.getByRole('option', { name: /Arabisch/ })).toHaveAttribute(
            'data-complete',
            'true',
        );
    });

    it('treats done above total as complete and clamps the bar', async () => {
        const user = userEvent.setup();
        setup({
            languages: [{ code: 'de', label: 'Deutsch', done: 9, total: 7 }],
        });
        expect(screen.getByRole('combobox')).toHaveTextContent('9/7');
        await user.click(screen.getByRole('combobox'));
        expect(screen.getByRole('option')).toHaveAttribute('data-complete', 'true');
        const bar = document.querySelector('[data-slot="language-select-bar"]');
        expect((bar?.firstElementChild as HTMLElement).style.width).toBe('100%');
    });

    it('shows the flag, hidden from assistive tech, when one is given', () => {
        setup();
        const flag = screen
            .getByRole('combobox')
            .querySelector('[data-slot="language-select-flag"]');
        expect(flag).toHaveAttribute('aria-hidden', 'true');
        expect(flag?.querySelector('svg')).not.toBeNull();
        expect(flag?.querySelector('[data-slot="language-select-code"]')).toBeNull();
    });

    it('shows the upper-cased code in a box when there is no flag', async () => {
        const user = userEvent.setup();
        setup({ value: 'ar' });
        const box = screen
            .getByRole('combobox')
            .querySelector('[data-slot="language-select-code"]');
        expect(box).toHaveTextContent('AR');

        await user.click(screen.getByRole('combobox'));
        const arabic = screen.getByRole('option', { name: /Arabisch/ });
        expect(arabic.querySelector('[data-slot="language-select-code"]')).toHaveTextContent('AR');
        // The code box is decorative: the option name stays the language name + progress.
        expect(arabic).toHaveAccessibleName('Arabisch 7 von 7 ausgefüllt');
    });

    it('merges className onto the trigger', () => {
        setup({ className: 'w-72' });
        expect(screen.getByRole('combobox').className).toContain('w-72');
    });

    it('passes axe closed', async () => {
        const { container } = setup();
        expect(await axe(container)).toHaveNoViolations();
    });

    it('passes axe open', async () => {
        const user = userEvent.setup();
        setup();
        await user.click(screen.getByRole('combobox'));
        expect(screen.getByRole('listbox')).toBeInTheDocument();
        // The list is portalled into <body>, so scan the whole document; the page-level
        // `region` rule is about landmarks, which a lone widget has none of.
        expect(
            await axe(document.body, { rules: { region: { enabled: false } } }),
        ).toHaveNoViolations();
    });
});
