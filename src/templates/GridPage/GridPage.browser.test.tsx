import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { CourseList } from './GridPage.fixtures';

/*
 * What jsdom cannot tell us: whether the toolbar still fits once the search
 * slides open. The actions must make room, not sit under the search.
 */

afterEach(() => {
    cleanup();
    localStorage.clear();
});

const settle = () => act(() => new Promise((r) => setTimeout(r, 350)));

describe('GridPage — toolbar room, in a real browser', () => {
    it('moves actions into "…" while the search is open, and back after', async () => {
        render(
            <div style={{ width: 420 }}>
                <CourseList gridId="browser.toolbar" />
            </div>,
        );
        await settle();
        const toolbar = screen.getByRole('toolbar', { name: 'Kurse' });
        const before = within(toolbar).getAllByRole('button').length;

        await userEvent.click(screen.getByRole('searchbox'));
        await settle();
        const search = screen.getByRole('searchbox').getBoundingClientRect();
        for (const button of within(toolbar).getAllByRole('button'))
            expect(button.getBoundingClientRect().right).toBeLessThanOrEqual(search.left);
        expect(within(toolbar).getByRole('button', { name: 'Weitere Aktionen' })).toBeVisible();

        await userEvent.keyboard('{Tab}');
        await settle();
        expect(within(toolbar).getAllByRole('button')).toHaveLength(before);
    });

    it('links each course name to its page', async () => {
        render(<CourseList gridId="browser.links" />);
        const link = screen.getByRole('link', { name: 'Arabisch für Anfänger' });
        expect(link).toHaveAttribute('href', '#/admin/kurse/1');
    });
});
