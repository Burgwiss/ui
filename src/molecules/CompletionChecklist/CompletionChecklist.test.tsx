import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it, vi } from 'vitest';

import { CompletionChecklist, type CompletionChecklistProps } from './CompletionChecklist';

const LABELS: CompletionChecklistProps['labels'] = {
    heading: 'Seite',
    complete: 'alles Nötige da',
    incomplete: 'Pflichtangaben fehlen',
    optional: 'optional',
    done: 'ausgefüllt',
    missing: 'fehlt',
};

const ITEMS: CompletionChecklistProps['items'] = [
    { id: 'title', label: 'Titel', done: true },
    { id: 'tagline', label: 'Kurzbeschreibung', done: false },
    { id: 'faq', label: 'Häufige Fragen', done: false, optional: true },
];

describe('CompletionChecklist', () => {
    it('counts what is done and says whether anything required is missing', () => {
        render(<CompletionChecklist items={ITEMS} labels={LABELS} />);
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
        expect(screen.getByText('Pflichtangaben fehlen')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    });

    it('calls a page complete when only optional items are missing', () => {
        render(
            <CompletionChecklist
                items={ITEMS.map((i) => (i.id === 'tagline' ? { ...i, done: true } : i))}
                labels={LABELS}
            />,
        );
        expect(screen.getByText('alles Nötige da')).toBeInTheDocument();
    });

    it('reads each item with its state, and marks optional ones', () => {
        render(<CompletionChecklist items={ITEMS} labels={LABELS} />);
        const list = screen.getByRole('list');
        expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Titelausgefüllt');
        expect(within(list).getAllByRole('listitem')[2]).toHaveTextContent(
            'Häufige Fragenfehltoptional',
        );
    });

    it('jumps to an item when the page wires onItemClick', async () => {
        const onItemClick = vi.fn();
        const user = userEvent.setup();
        render(<CompletionChecklist items={ITEMS} labels={LABELS} onItemClick={onItemClick} />);
        await user.click(screen.getByRole('button', { name: /Kurzbeschreibung/ }));
        expect(onItemClick).toHaveBeenCalledWith('tagline');
    });

    it('passes axe', async () => {
        const { container } = render(
            <CompletionChecklist items={ITEMS} labels={LABELS} onItemClick={() => {}} />,
        );
        expect(await axe(container)).toHaveNoViolations();
    });
});
