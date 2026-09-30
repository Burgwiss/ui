import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

function Fixture({ onValueChange }: { onValueChange?: (v: string) => void }) {
    return (
        <Tabs defaultValue="one" onValueChange={onValueChange}>
            <TabsList aria-label="Bereiche">
                <TabsTrigger value="one">Eins</TabsTrigger>
                <TabsTrigger value="two">Zwei</TabsTrigger>
                <TabsTrigger value="three" disabled>
                    Drei
                </TabsTrigger>
            </TabsList>
            <TabsContent value="one">Panel eins</TabsContent>
            <TabsContent value="two">Panel zwei</TabsContent>
            <TabsContent value="three">Panel drei</TabsContent>
        </Tabs>
    );
}

describe('Tabs', () => {
    it('renders the default panel and hides the others', () => {
        render(<Fixture />);
        expect(screen.getByRole('tab', { name: 'Eins' })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('Panel eins')).toBeInTheDocument();
        expect(screen.queryByText('Panel zwei')).toBeNull();
    });

    it('switches the visible panel when a trigger is clicked', async () => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(<Fixture onValueChange={onValueChange} />);
        await user.click(screen.getByRole('tab', { name: 'Zwei' }));
        expect(onValueChange).toHaveBeenCalledWith('two');
        expect(screen.getByText('Panel zwei')).toBeInTheDocument();
        expect(screen.queryByText('Panel eins')).toBeNull();
    });

    it('moves between tabs with the arrow keys, skipping a disabled one', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        screen.getByRole('tab', { name: 'Eins' }).focus();
        await user.keyboard('{ArrowRight}');
        expect(screen.getByRole('tab', { name: 'Zwei' })).toHaveFocus();
        await user.keyboard('{ArrowRight}');
        expect(screen.getByRole('tab', { name: 'Eins' })).toHaveFocus();
    });

    it('a disabled tab cannot be selected', async () => {
        const user = userEvent.setup();
        render(<Fixture />);
        await user.click(screen.getByRole('tab', { name: 'Drei' }));
        expect(screen.queryByText('Panel drei')).toBeNull();
    });

    it('connects each tab to its panel', () => {
        render(<Fixture />);
        const tab = screen.getByRole('tab', { name: 'Eins' });
        expect(screen.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tab.id);
    });

    it('lifts every trigger to the 44px floor on a coarse pointer only', () => {
        render(<Fixture />);
        for (const tab of screen.getAllByRole('tab')) {
            expect(tab.className).toContain('pointer-coarse:min-h-11');
            expect(tab.className).not.toMatch(/(^|\s)min-h-11(\s|$)/);
        }
    });

    it('wraps the tab row instead of pushing overflow onto the page', () => {
        render(<Fixture />);
        expect(screen.getByRole('tablist').className).toContain('flex-wrap');
    });

    it('unmounts an unselected panel (Radix renders only the present one)', () => {
        // A FACT about the primitive, pinned so nobody relies on the opposite: an
        // error message inside an inactive panel never mounts and is never announced.
        render(<Fixture />);
        expect(screen.queryByText('Panel zwei')).toBeNull();
    });

    it('forwards refs on root, list, trigger and content', () => {
        const root = createRef<HTMLDivElement>();
        const list = createRef<HTMLDivElement>();
        const trigger = createRef<HTMLButtonElement>();
        const content = createRef<HTMLDivElement>();
        render(
            <Tabs ref={root} defaultValue="a">
                <TabsList ref={list} aria-label="x">
                    <TabsTrigger ref={trigger} value="a">
                        A
                    </TabsTrigger>
                </TabsList>
                <TabsContent ref={content} value="a">
                    Inhalt
                </TabsContent>
            </Tabs>,
        );
        for (const r of [root, list, trigger, content]) {
            expect(r.current).toBeInstanceOf(HTMLElement);
        }
    });
});
