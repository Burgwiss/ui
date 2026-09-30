import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    SegmentedTab,
    SegmentedTabs,
    SegmentedTabsContent,
    SegmentedTabsList,
} from './SegmentedTabs';

function Fixture({ onValueChange }: { onValueChange?: (v: string) => void }) {
    return (
        <SegmentedTabs defaultValue="a" onValueChange={onValueChange}>
            <SegmentedTabsList aria-label="Ansicht">
                <SegmentedTab value="a">Liste</SegmentedTab>
                <SegmentedTab value="b">Karte</SegmentedTab>
            </SegmentedTabsList>
            <SegmentedTabsContent value="a">Listenansicht</SegmentedTabsContent>
            <SegmentedTabsContent value="b">Kartenansicht</SegmentedTabsContent>
        </SegmentedTabs>
    );
}

describe('SegmentedTabs', () => {
    it('has tablist/tab semantics with the default segment selected', () => {
        render(<Fixture />);
        expect(screen.getByRole('tablist', { name: 'Ansicht' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Liste' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Listenansicht')).toBeInTheDocument();
    });

    it('switches content on click and reports the value', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Fixture onValueChange={onValueChange} />);
        await user.click(screen.getByRole('tab', { name: 'Karte' }));
        expect(onValueChange).toHaveBeenCalledWith('b');
        expect(screen.getByText('Kartenansicht')).toBeInTheDocument();
        expect(screen.queryByText('Listenansicht')).toBeNull();
    });

    it('supports arrow-key navigation', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        screen.getByRole('tab', { name: 'Liste' }).focus();
        await user.keyboard('{ArrowRight}');
        expect(screen.getByRole('tab', { name: 'Karte' })).toHaveFocus();
    });

    it('styles the active segment with the primary token, not a palette colour', () => {
        render(<Fixture />);
        expect(screen.getByRole('tab', { name: 'Liste' }).className).toContain(
            'data-[state=active]:bg-primary',
        );
    });

    it('forwards refs across the family', () => {
        const root = createRef<HTMLDivElement>();
        const list = createRef<HTMLDivElement>();
        const tab = createRef<HTMLButtonElement>();
        const content = createRef<HTMLDivElement>();
        render(
            <SegmentedTabs ref={root} defaultValue="a">
                <SegmentedTabsList ref={list} aria-label="x">
                    <SegmentedTab ref={tab} value="a">
                        A
                    </SegmentedTab>
                </SegmentedTabsList>
                <SegmentedTabsContent ref={content} value="a">
                    Inhalt
                </SegmentedTabsContent>
            </SegmentedTabs>,
        );
        for (const r of [root, list, tab, content]) {
            expect(r.current).toBeInstanceOf(HTMLElement);
        }
    });
});
