import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PageViewer } from './PageViewer';

const LABELS = {
    loading: 'Lädt …',
    failedTitle: 'Lädt nicht',
    failedBody: 'Keine Antwort.',
    retry: 'Erneut',
};

function viewer(extra: Partial<React.ComponentProps<typeof PageViewer>> = {}) {
    return (
        <PageViewer
            title="Vorschau"
            srcDoc="<p>Seite</p>"
            deviceWidth={1280}
            labels={LABELS}
            timeoutMs={1000}
            {...extra}
        />
    );
}
const frame = () => screen.getByTitle('Vorschau') as HTMLIFrameElement;

describe('PageViewer', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('shows a loading notice until the page loads', () => {
        const { container } = render(viewer());
        expect(screen.getByRole('status')).toHaveTextContent('Lädt …');
        fireEvent.load(frame());
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
        expect(container.firstElementChild).toHaveAttribute('data-status', 'loaded');
    });

    it('turns a page that never loads into a message with a retry, not a blank box', () => {
        render(viewer());
        act(() => vi.advanceTimersByTime(1000));
        expect(screen.getByRole('alert')).toHaveTextContent('Lädt nicht');
        expect(screen.queryByTitle('Vorschau')).not.toBeInTheDocument();
    });

    it('retries with a fresh frame', () => {
        render(viewer());
        act(() => vi.advanceTimersByTime(1000));
        fireEvent.click(screen.getByRole('button', { name: 'Erneut' }));
        expect(screen.getByRole('status')).toBeInTheDocument();
        fireEvent.load(frame());
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('does not fail a page that loaded, however long it stays', () => {
        render(viewer());
        fireEvent.load(frame());
        act(() => vi.advanceTimersByTime(60_000));
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('reports its status', () => {
        const onStatusChange = vi.fn();
        render(viewer({ onStatusChange }));
        fireEvent.load(frame());
        expect(onStatusChange.mock.calls.map((c) => c[0])).toEqual([
            'waiting',
            'loading',
            'loaded',
        ]);
    });

    it('is inert unless interactive', () => {
        const { unmount } = render(viewer());
        expect(frame()).toHaveAttribute('inert');
        unmount();
        render(viewer({ interactive: true }));
        expect(frame()).not.toHaveAttribute('inert');
    });

    it('lays the page out at the device width', () => {
        render(viewer({ deviceWidth: 390 }));
        expect(frame().parentElement).toHaveStyle({ width: '390px' });
    });

    it('draws the overlay over the page without taking clicks', () => {
        render(viewer({ overlay: <span>Markierung</span> }));
        expect(screen.getByText('Markierung').parentElement).toHaveClass('pointer-events-none');
    });

    it('waits to mount until it is near the screen', () => {
        let fire: (hit: boolean) => void = () => {};
        const observe = vi.fn();
        vi.stubGlobal(
            'IntersectionObserver',
            class {
                constructor(cb: (e: { isIntersecting: boolean }[]) => void) {
                    fire = (hit) => cb([{ isIntersecting: hit }]);
                }
                observe = observe;
                disconnect() {}
            },
        );
        const { container } = render(viewer());
        expect(container.firstElementChild).toHaveAttribute('data-status', 'waiting');
        expect(screen.queryByTitle('Vorschau')).not.toBeInTheDocument();
        act(() => fire(true));
        expect(frame()).toBeInTheDocument();
        vi.unstubAllGlobals();
    });
});
