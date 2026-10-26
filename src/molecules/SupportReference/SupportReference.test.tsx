import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SupportReference } from './SupportReference';

const labels = { prefix: 'Vorgangs-ID', copy: 'Vorgangs-ID kopieren', copied: 'Kopiert' };

afterEach(() => {
    vi.restoreAllMocks();
});

describe('SupportReference', () => {
    it('shows the prefix and the id', () => {
        render(<SupportReference id="7f3c-91ab" labels={labels} />);
        expect(screen.getByText('Vorgangs-ID:')).toBeInTheDocument();
        expect(screen.getByText('7f3c-91ab')).toBeInTheDocument();
    });

    it('puts the id in a code element so it reads as an identifier', () => {
        render(<SupportReference id="7f3c-91ab" labels={labels} />);
        expect(screen.getByText('7f3c-91ab').tagName).toBe('CODE');
    });

    it('names the copy button by labels.copy', () => {
        render(<SupportReference id="7f3c-91ab" labels={labels} />);
        expect(screen.getByRole('button', { name: 'Vorgangs-ID kopieren' })).toBeInTheDocument();
    });

    it('copies the id to the clipboard and announces it', async () => {
        const user = userEvent.setup();
        const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
        render(<SupportReference id="7f3c-91ab" labels={labels} />);
        await user.click(screen.getByRole('button', { name: 'Vorgangs-ID kopieren' }));
        expect(writeText).toHaveBeenCalledWith('7f3c-91ab');
        expect(await screen.findByRole('button', { name: 'Kopiert' })).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent('Kopiert');
    });

    it('merges a caller className', () => {
        const { container } = render(
            <SupportReference id="7f3c-91ab" labels={labels} className="mt-2" />,
        );
        expect((container.firstChild as HTMLElement).className).toContain('mt-2');
    });
});
