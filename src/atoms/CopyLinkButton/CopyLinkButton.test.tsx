import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CopyLinkButton } from './CopyLinkButton';

const props = {
    url: 'https://example.org/beitreten/42',
    label: 'Einladungslink kopieren',
    copiedLabel: 'Link kopiert',
};

function mockClipboard(writeText: ReturnType<typeof vi.fn>) {
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
}

afterEach(() => {
    vi.useRealTimers();
});

describe('CopyLinkButton', () => {
    it('renders an accessible idle button named by `label`', () => {
        render(<CopyLinkButton {...props} />);
        expect(screen.getByRole('button', { name: props.label })).toBeInTheDocument();
    });

    it('writes the url to the clipboard and flips to the copied state', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        mockClipboard(writeText);
        render(<CopyLinkButton {...props} />);

        await userEvent.click(screen.getByRole('button', { name: props.label }));

        expect(writeText).toHaveBeenCalledWith(props.url);
        await waitFor(() =>
            expect(screen.getByRole('button', { name: props.copiedLabel })).toBeInTheDocument(),
        );
        // The polite live region announces it too.
        expect(screen.getByRole('status')).toHaveTextContent(props.copiedLabel);
    });

    it('returns to idle after two seconds', async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        mockClipboard(writeText);
        vi.useFakeTimers({ shouldAdvanceTime: true });
        render(<CopyLinkButton {...props} />);

        await userEvent
            .setup({ advanceTimers: vi.advanceTimersByTime })
            .click(screen.getByRole('button', { name: props.label }));
        await waitFor(() =>
            expect(screen.getByRole('button', { name: props.copiedLabel })).toBeInTheDocument(),
        );

        act(() => {
            vi.advanceTimersByTime(2100);
        });
        expect(screen.getByRole('button', { name: props.label })).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });

    it('stays idle (no false success) when the clipboard is denied', async () => {
        const writeText = vi.fn().mockRejectedValue(new Error('denied'));
        mockClipboard(writeText);
        render(<CopyLinkButton {...props} />);

        await userEvent.click(screen.getByRole('button', { name: props.label }));

        await waitFor(() => expect(writeText).toHaveBeenCalled());
        expect(screen.getByRole('button', { name: props.label })).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });

    it('does nothing (and does not throw) when there is no clipboard API', async () => {
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
        render(<CopyLinkButton {...props} />);
        await userEvent.click(screen.getByRole('button', { name: props.label }));
        expect(screen.getByRole('button', { name: props.label })).toBeInTheDocument();
    });

    it('size="sm" shows the visible text next to the icon', () => {
        render(<CopyLinkButton {...props} size="sm" />);
        expect(screen.getByRole('button')).toHaveTextContent(props.label);
    });

    it('renders the screen-reader hint only when given', () => {
        const { rerender } = render(<CopyLinkButton {...props} />);
        expect(screen.queryByText('Der Link erfordert eine Anmeldung.')).toBeNull();
        rerender(<CopyLinkButton {...props} hint="Der Link erfordert eine Anmeldung." />);
        expect(screen.getByText('Der Link erfordert eine Anmeldung.')).toHaveClass('sr-only');
    });
});
