import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
    it('renders the title and description', () => {
        render(
            <EmptyState
                icon={Inbox}
                title="Noch keine Nachrichten"
                description="Starte eine Konversation."
            />,
        );
        expect(screen.getByText('Noch keine Nachrichten')).toBeInTheDocument();
        expect(screen.getByText('Starte eine Konversation.')).toBeInTheDocument();
    });

    it('renders the optional action node', () => {
        render(
            <EmptyState
                icon={Inbox}
                title="Noch keine Nachrichten"
                action={<a href="/start">Neu beginnen</a>}
            />,
        );
        expect(screen.getByRole('link', { name: 'Neu beginnen' })).toHaveAttribute(
            'href',
            '/start',
        );
    });

    it('omits description and action when not provided', () => {
        const { container } = render(<EmptyState icon={Inbox} title="Nichts hier" />);
        expect(container.querySelectorAll('p')).toHaveLength(1);
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('hides the decorative icon disc from assistive tech', () => {
        const { container } = render(<EmptyState icon={Inbox} title="Nichts hier" />);
        const disc = container.querySelector('[aria-hidden="true"]');
        expect(disc).not.toBeNull();
        expect(disc?.querySelector('svg')).not.toBeNull();
    });

    it('merges a caller className', () => {
        const { container } = render(
            <EmptyState icon={Inbox} title="Nichts hier" className="py-20" />,
        );
        expect((container.firstChild as HTMLElement).className).toContain('py-20');
    });
});
