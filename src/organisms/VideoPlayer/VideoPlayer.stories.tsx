import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { useStoryText } from '../../../.storybook/locale';
import { VideoPlayer, type VideoPlayerProps } from './VideoPlayer';
import { SAMPLE_CAPTIONS, SAMPLE_CHAPTERS, VIDEO_LABELS_BY_LOCALE } from './VideoPlayer.fixtures';

const SRC = 'media/sample-lesson.mp4';

function Player(props: Partial<VideoPlayerProps>) {
    const t = useStoryText();
    const [log, setLog] = useState('');
    return (
        <div className="mx-auto max-w-3xl space-y-2">
            <VideoPlayer
                src={SRC}
                title="Lektion 3: Die Buchstaben Alif bis Ta"
                labels={t(VIDEO_LABELS_BY_LOCALE)}
                onComplete={() => setLog('Als erledigt gezählt (90 % gesehen)')}
                {...props}
            />
            {log && <p className="text-sm text-muted-foreground">{log}</p>}
        </div>
    );
}

/**
 * The lesson video player: our own controls on a real `<video>`, themed by
 * tokens, in every language (try العربية). Click it, then try K, J, L, ← →,
 * ↑ ↓, M, F, C, 0–9 and < >. Speed and volume are remembered for every video.
 */
const meta: Meta<typeof VideoPlayer> = {
    title: 'Organisms/VideoPlayer',
    component: VideoPlayer,
    parameters: { layout: 'padded' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.startsWith('burgwiss-ui:video')) localStorage.removeItem(k);
    },
};
export default meta;

type Story = StoryObj<typeof VideoPlayer>;

/** Everything a lesson uses: chapters, captions in two languages, resume, and "next lesson". */
export const Lektion: Story = {
    render: () => (
        <Player
            resumeKey="storybook-lesson-3"
            chapters={SAMPLE_CHAPTERS}
            captions={SAMPLE_CAPTIONS}
            next={{ title: 'Lektion 4: Tha bis Kha', onPlay: () => {}, autoAdvanceSeconds: 8 }}
        />
    ),
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const video = canvasElement.querySelector('video')!;
        video.muted = true; // autoplay policy: a test may only start muted playback

        await step('Start from the big button', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Abspielen' }));
            await waitFor(() => expect(video.paused).toBe(false));
        });

        await step('Skip ahead with L', async () => {
            const before = video.currentTime;
            await userEvent.keyboard('l');
            await waitFor(() => expect(video.currentTime).toBeGreaterThanOrEqual(before + 9));
        });

        await step('Change speed in the settings', async () => {
            await userEvent.click(canvas.getByRole('button', { name: 'Einstellungen' }));
            await userEvent.click(await body.findByRole('menuitemradio', { name: '1,5×' }));
            await expect(video.playbackRate).toBe(1.5);
            // The menu hides the rest of the page from queries until it has closed.
            await waitFor(() => expect(body.queryByRole('menu')).toBeNull());
        });

        await step('Jump to a chapter from the list', async () => {
            const list = canvas.getByRole('navigation', { name: 'Kapitel' });
            await userEvent.click(within(list).getByRole('button', { name: /Ba und Ta/ }));
            await waitFor(() => expect(video.currentTime).toBeGreaterThanOrEqual(20));
        });
    },
};

/** Just the video: no chapters, no captions, no next lesson. */
export const Einfach: Story = {
    render: () => <Player />,
};

/**
 * A signed link that expired: the player asks the app for a fresh one once,
 * silently, and carries on. Here the first URL is broken on purpose.
 */
export const AbgelaufenerLink: Story = {
    render: () => (
        <Player
            src="media/abgelaufen.mp4"
            refreshSrc={() => new Promise((r) => setTimeout(() => r(SRC), 300))}
        />
    ),
};

/** The link fails and cannot be refreshed: say so, and offer to try again. */
export const LaedtNicht: Story = {
    name: 'Lädt nicht',
    render: () => <Player src="media/gibt-es-nicht.mp4" />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitFor(() => expect(canvas.getByRole('alert')).toBeVisible());
    },
};
