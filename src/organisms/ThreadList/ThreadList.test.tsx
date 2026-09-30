import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ThreadList, type ThreadListItem, type ThreadListLabels } from './ThreadList';

const labels: ThreadListLabels = {
    list: 'Conversations',
    empty: 'No conversations yet.',
    unread: 'Unread',
};

const threads: ThreadListItem[] = [
    { id: 1, title: 'Anna', subtitle: 'Maths', preview: 'See you', unread: true },
    { id: 2, title: 'Ben', lastActivityAt: '2026-06-13T10:00:00Z' },
    { id: 3, title: 'Cem' },
];

describe('ThreadList', () => {
    it('shows the empty text, and no list, without threads', () => {
        render(<ThreadList threads={[]} labels={labels} />);
        expect(screen.getByText('No conversations yet.')).toBeInTheDocument();
        expect(screen.queryByRole('list')).toBeNull();
    });

    it('is a named list with a row per thread', () => {
        render(<ThreadList threads={threads} labels={labels} />);
        const list = screen.getByRole('list', { name: 'Conversations' });
        expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    });

    it('shows title, subtitle and preview', () => {
        render(<ThreadList threads={threads} labels={labels} />);
        expect(screen.getByText('Anna')).toBeInTheDocument();
        expect(screen.getByText('Maths')).toBeInTheDocument();
        expect(screen.getByText('See you')).toBeInTheDocument();
    });

    it('formats the last activity with formatTime, and shows none when there is none', () => {
        render(<ThreadList threads={threads} labels={labels} formatTime={(iso) => `at ${iso}`} />);
        const time = screen.getByText('at 2026-06-13T10:00:00Z');
        expect(time.tagName).toBe('TIME');
        expect(time).toHaveAttribute('datetime', '2026-06-13T10:00:00Z');
        expect(document.querySelectorAll('time')).toHaveLength(1);
    });

    it('marks an unread thread with a decorative dot and one screen-reader label', () => {
        render(<ThreadList threads={threads} labels={labels} />);
        expect(screen.getAllByText('Unread')).toHaveLength(1);
        expect(screen.getByText('Unread')).toHaveClass('sr-only');
        const row = screen.getByRole('button', { name: /Anna/ });
        expect(row).toHaveAccessibleName(expect.stringContaining('Unread'));
        expect(row.querySelector('[aria-hidden="true"]')).not.toBeNull();
    });

    it('shows no unread mark on a read thread', () => {
        render(<ThreadList threads={threads.slice(1)} labels={labels} />);
        expect(screen.queryByText('Unread')).toBeNull();
    });

    it('marks the open thread with aria-current and no other', () => {
        render(<ThreadList threads={threads} labels={labels} activeId={2} />);
        expect(screen.getByRole('button', { name: /Ben/ })).toHaveAttribute('aria-current', 'true');
        expect(screen.getByRole('button', { name: /Anna/ })).not.toHaveAttribute('aria-current');
        expect(screen.getByRole('button', { name: /Cem/ })).not.toHaveAttribute('aria-current');
    });

    it('marks nothing open when activeId is null, and treats 0 as an id', () => {
        const { rerender } = render(
            <ThreadList threads={threads} labels={labels} activeId={null} />,
        );
        expect(document.querySelector('[aria-current]')).toBeNull();
        rerender(<ThreadList threads={[{ id: 0, title: 'Zero' }]} labels={labels} activeId={0} />);
        expect(screen.getByRole('button', { name: 'Zero' })).toHaveAttribute(
            'aria-current',
            'true',
        );
    });

    it('opens a thread on click with its id', async () => {
        const onOpen = vi.fn();
        render(<ThreadList threads={threads} labels={labels} onOpen={onOpen} />);
        await userEvent.click(screen.getByRole('button', { name: /Ben/ }));
        expect(onOpen).toHaveBeenCalledExactlyOnceWith(2);
    });

    it('opens a thread with the keyboard: Tab to it, Enter or Space to choose', async () => {
        const onOpen = vi.fn();
        render(<ThreadList threads={threads} labels={labels} onOpen={onOpen} />);
        await userEvent.tab();
        expect(screen.getByRole('button', { name: /Anna/ })).toHaveFocus();
        await userEvent.keyboard('{Enter}');
        await userEvent.keyboard(' ');
        expect(onOpen).toHaveBeenCalledTimes(2);
        expect(onOpen).toHaveBeenNthCalledWith(1, 1);
    });

    it('renders a row with an href as a link, and still reports the choice', async () => {
        const onOpen = vi.fn();
        render(
            <ThreadList
                threads={[{ id: 'a', title: 'Anna', href: '/messages/a' }]}
                labels={labels}
                onOpen={onOpen}
            />,
        );
        const link = screen.getByRole('link', { name: 'Anna' });
        expect(link).toHaveAttribute('href', '/messages/a');
        // A real navigation is not implemented by jsdom; cancel it and observe the handler.
        link.addEventListener('click', (event) => event.preventDefault());
        await userEvent.click(link);
        expect(onOpen).toHaveBeenCalledExactlyOnceWith('a');
    });

    it('renders links with the component given in `as`, passing href and current state', () => {
        function RouterLink({ href, children, ...rest }: ComponentProps<'a'>) {
            return (
                <a href={href} data-router="yes" {...rest}>
                    {children}
                </a>
            );
        }
        render(
            <ThreadList
                threads={[{ id: 'a', title: 'Anna', href: '/messages/a' }]}
                labels={labels}
                as={RouterLink}
                activeId="a"
            />,
        );
        const link = screen.getByRole('link', { name: 'Anna' });
        expect(link).toHaveAttribute('data-router', 'yes');
        expect(link).toHaveAttribute('href', '/messages/a');
        expect(link).toHaveAttribute('aria-current', 'true');
    });

    it('ignores `as` for a row without an href', () => {
        const Never = () => <span>never</span>;
        render(<ThreadList threads={[{ id: 1, title: 'Anna' }]} labels={labels} as={Never} />);
        expect(screen.queryByText('never')).toBeNull();
        expect(screen.getByRole('button', { name: 'Anna' })).toHaveAttribute('type', 'button');
    });

    it('truncates a long title so the row cannot grow', () => {
        const long = 'x'.repeat(200);
        render(<ThreadList threads={[{ id: 1, title: long }]} labels={labels} />);
        expect(screen.getByText(long).className).toContain('truncate');
    });
});
