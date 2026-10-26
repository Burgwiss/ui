import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { messageListLabelsDe } from '../../lib/chat.fixtures';
import { MessageList } from './MessageList';

/* Real layout: jsdom has no widths, so a bubble escaping its column only shows here. */

afterEach(() => cleanup());

describe('MessageList in a narrow side panel', () => {
    it('keeps a bubble with a long link inside the list, on a wide viewport', () => {
        // A 22rem meeting panel on a desktop: the `sm:` widths apply, the container is narrow.
        render(
            <div style={{ width: 352, height: 400, display: 'flex', flexDirection: 'column' }}>
                <MessageList
                    labels={messageListLabelsDe}
                    messages={[
                        {
                            id: 1,
                            authorName: 'Ustadh Mosa Khallaf',
                            body: 'Die Folien findet ihr hier: https://kurs.example/arabisch/lektion-3-die-buchstaben-alif-bis-ta',
                            sentAt: '2026-10-26T17:31:00Z',
                        },
                    ]}
                    canDelete
                    onDelete={() => {}}
                />
            </div>,
        );
        const log = screen.getByRole('log');
        const text = screen.getByText(/Die Folien findet ihr hier/);
        const bubble = text.parentElement!;
        expect(bubble.getBoundingClientRect().right).toBeLessThanOrEqual(
            log.getBoundingClientRect().right,
        );
        expect(log.scrollWidth).toBeLessThanOrEqual(log.clientWidth);
    });
});
