import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { VideoStage, type VideoStageLabels } from './VideoStage';

const labels: VideoStageLabels = {
    stage: 'Meetingbühne',
    pages: 'Rasterseiten',
    previous: 'Vorherige Seite',
    next: 'Nächste Seite',
    page: (current, total) => `Seite ${current} von ${total}`,
    empty: 'Noch niemand hier',
};

const tiles = (n: number) =>
    Array.from({ length: n }, (_, i) => (
        <div key={i} data-testid="tile">
            Person {i + 1}
        </div>
    ));

const renderedTiles = () => screen.queryAllByTestId('tile');

describe('VideoStage', () => {
    it('is a region named labels.stage', () => {
        render(<VideoStage labels={labels}>{tiles(2)}</VideoStage>);
        expect(screen.getByRole('region', { name: 'Meetingbühne' })).toBeInTheDocument();
    });

    it('shows the empty text when there are no tiles', () => {
        render(<VideoStage labels={labels}>{[]}</VideoStage>);
        expect(screen.getByText('Noch niemand hier')).toBeInTheDocument();
        expect(renderedTiles()).toHaveLength(0);
    });

    it('ignores children that are not elements', () => {
        render(
            <VideoStage labels={labels}>
                {null}
                {false}
                {'text'}
            </VideoStage>,
        );
        expect(screen.getByText('Noch niemand hier')).toBeInTheDocument();
    });

    it('shows no empty text when there are tiles', () => {
        render(<VideoStage labels={labels}>{tiles(1)}</VideoStage>);
        expect(screen.queryByText('Noch niemand hier')).toBeNull();
    });

    it('renders every tile when they all fit on one page', () => {
        render(<VideoStage labels={labels}>{tiles(5)}</VideoStage>);
        expect(renderedTiles()).toHaveLength(5);
    });

    it('keeps the order of the tiles', () => {
        render(<VideoStage labels={labels}>{tiles(3)}</VideoStage>);
        expect(renderedTiles().map((t) => t.textContent)).toEqual([
            'Person 1',
            'Person 2',
            'Person 3',
        ]);
    });

    describe('paging', () => {
        it('shows no pager for up to 16 tiles', () => {
            render(<VideoStage labels={labels}>{tiles(16)}</VideoStage>);
            expect(renderedTiles()).toHaveLength(16);
            expect(screen.queryByRole('group', { name: 'Rasterseiten' })).toBeNull();
        });

        it('renders 16 tiles and a pager for 20', () => {
            render(<VideoStage labels={labels}>{tiles(20)}</VideoStage>);
            expect(renderedTiles()).toHaveLength(16);
            const pager = screen.getByRole('group', { name: 'Rasterseiten' });
            expect(within(pager).getByRole('status')).toHaveTextContent('Seite 1 von 2');
        });

        it('disables previous on the first page and enables next', () => {
            render(<VideoStage labels={labels}>{tiles(20)}</VideoStage>);
            expect(screen.getByRole('button', { name: 'Vorherige Seite' })).toHaveAttribute(
                'aria-disabled',
                'true',
            );
            expect(screen.getByRole('button', { name: 'Nächste Seite' })).not.toHaveAttribute(
                'aria-disabled',
                'true',
            );
        });

        it('moves to page 2, shows the rest and calls onPageChange(1)', async () => {
            const onPageChange = vi.fn();
            render(
                <VideoStage labels={labels} onPageChange={onPageChange}>
                    {tiles(20)}
                </VideoStage>,
            );
            await userEvent.click(screen.getByRole('button', { name: 'Nächste Seite' }));
            expect(onPageChange).toHaveBeenCalledWith(1);
            expect(screen.getByRole('status')).toHaveTextContent('Seite 2 von 2');
            expect(renderedTiles().map((t) => t.textContent)).toEqual([
                'Person 17',
                'Person 18',
                'Person 19',
                'Person 20',
            ]);
        });

        it('disables next on the last page and goes back with previous', async () => {
            const onPageChange = vi.fn();
            render(
                <VideoStage labels={labels} onPageChange={onPageChange}>
                    {tiles(20)}
                </VideoStage>,
            );
            await userEvent.click(screen.getByRole('button', { name: 'Nächste Seite' }));
            expect(screen.getByRole('button', { name: 'Nächste Seite' })).toHaveAttribute(
                'aria-disabled',
                'true',
            );
            await userEvent.click(screen.getByRole('button', { name: 'Vorherige Seite' }));
            expect(onPageChange).toHaveBeenLastCalledWith(0);
            expect(screen.getByRole('status')).toHaveTextContent('Seite 1 von 2');
            expect(renderedTiles()).toHaveLength(16);
        });

        it('does not go past the first page when previous is activated there', async () => {
            const onPageChange = vi.fn();
            render(
                <VideoStage labels={labels} onPageChange={onPageChange}>
                    {tiles(20)}
                </VideoStage>,
            );
            await userEvent.click(screen.getByRole('button', { name: 'Vorherige Seite' }));
            expect(onPageChange).not.toHaveBeenCalled();
        });

        it('honours a custom maxPerPage', () => {
            render(
                <VideoStage labels={labels} grid={{ maxPerPage: 4 }}>
                    {tiles(10)}
                </VideoStage>,
            );
            expect(renderedTiles()).toHaveLength(4);
            expect(screen.getByRole('status')).toHaveTextContent('Seite 1 von 3');
        });

        it('shows the page given by a controlled `page` prop', () => {
            render(
                <VideoStage labels={labels} page={1}>
                    {tiles(20)}
                </VideoStage>,
            );
            expect(screen.getByRole('status')).toHaveTextContent('Seite 2 von 2');
            expect(renderedTiles()).toHaveLength(4);
        });

        it('clamps a controlled page past the end to the last page', () => {
            render(
                <VideoStage labels={labels} page={9}>
                    {tiles(20)}
                </VideoStage>,
            );
            expect(screen.getByRole('status')).toHaveTextContent('Seite 2 von 2');
            expect(renderedTiles().map((t) => t.textContent)).toContain('Person 20');
        });

        it('stays on the controlled page until the parent changes it', async () => {
            const onPageChange = vi.fn();
            render(
                <VideoStage labels={labels} page={0} onPageChange={onPageChange}>
                    {tiles(20)}
                </VideoStage>,
            );
            await userEvent.click(screen.getByRole('button', { name: 'Nächste Seite' }));
            expect(onPageChange).toHaveBeenCalledWith(1);
            expect(screen.getByRole('status')).toHaveTextContent('Seite 1 von 2');
        });

        it('drops the pager and clamps the page when tiles leave', () => {
            const { rerender } = render(
                <VideoStage labels={labels} page={1}>
                    {tiles(20)}
                </VideoStage>,
            );
            rerender(
                <VideoStage labels={labels} page={1}>
                    {tiles(5)}
                </VideoStage>,
            );
            expect(screen.queryByRole('group', { name: 'Rasterseiten' })).toBeNull();
            expect(renderedTiles()).toHaveLength(5);
        });
    });

    describe('featured', () => {
        it('renders the featured content and keeps the tiles', () => {
            render(
                <VideoStage labels={labels} featured={<div>Geteilter Bildschirm</div>}>
                    {tiles(3)}
                </VideoStage>,
            );
            expect(screen.getByText('Geteilter Bildschirm')).toBeInTheDocument();
            expect(renderedTiles()).toHaveLength(3);
        });

        it('shows the featured content even with no tiles, next to the empty text', () => {
            render(
                <VideoStage labels={labels} featured={<div>Geteilter Bildschirm</div>}>
                    {[]}
                </VideoStage>,
            );
            expect(screen.getByText('Geteilter Bildschirm')).toBeInTheDocument();
            expect(screen.getByText('Noch niemand hier')).toBeInTheDocument();
        });

        it('pages the strip at 6 tiles by default', () => {
            render(
                <VideoStage labels={labels} featured={<div>Geteilter Bildschirm</div>}>
                    {tiles(10)}
                </VideoStage>,
            );
            expect(renderedTiles()).toHaveLength(6);
            expect(screen.getByRole('status')).toHaveTextContent('Seite 1 von 2');
        });
    });

    it('merges a caller className', () => {
        render(
            <VideoStage labels={labels} className="rounded-xl">
                {tiles(1)}
            </VideoStage>,
        );
        expect(screen.getByRole('region').className).toContain('rounded-xl');
    });
});
