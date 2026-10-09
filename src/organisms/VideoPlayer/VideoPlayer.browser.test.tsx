import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import sampleCaptionsDe from '../../../.storybook/public/media/sample-lesson.de.vtt?url';
import sample from '../../../.storybook/public/media/sample-lesson.mp4?url';
import { SAMPLE_CHAPTERS, VIDEO_LABELS as L } from './VideoPlayer.fixtures';
import { VideoPlayer } from './VideoPlayer';

/* Real playback, real layout, real captions — what a fake media element cannot show. */

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

const waitFor = async (check: () => boolean, ms = 4000) => {
    const until = Date.now() + ms;
    while (!check()) {
        if (Date.now() > until) throw new Error('timed out');
        await new Promise((r) => setTimeout(r, 50));
    }
};

function mount(extra: Partial<Parameters<typeof VideoPlayer>[0]> = {}, width = 800) {
    render(
        <div style={{ width }}>
            <VideoPlayer
                src={sample}
                title="Lektion 3"
                labels={L}
                chapters={SAMPLE_CHAPTERS}
                captions={[
                    { src: sampleCaptionsDe, srcLang: 'de', label: 'Deutsch', default: true },
                ]}
                {...extra}
            />
        </div>,
    );
    const video = document.querySelector('video')!;
    video.muted = true;
    return video;
}

describe('VideoPlayer in a real browser', () => {
    // A phone at 390px leaves a ~358px player, a 320px phone ~288px. Every
    // control must sit inside the player once playback has started.
    it.each([358, 288])('keeps every control inside a %ipx player', async (width) => {
        const video = mount({}, width);
        await waitFor(() => video.readyState >= 1);
        await userEvent.click(page.getByRole('button', { name: L.play }));
        await waitFor(() => video.currentTime > 0.1);
        video.pause();
        const player = video.parentElement!.getBoundingClientRect();
        const controls = [
            ...document.querySelectorAll<HTMLElement>('[data-visible] button, [data-visible] input'),
        ].filter((el) => el.getClientRects().length > 0);
        expect(controls.length).toBeGreaterThan(3);
        for (const el of controls) {
            const box = el.getBoundingClientRect();
            expect(box.right, el.getAttribute('aria-label') ?? el.tagName).toBeLessThanOrEqual(
                player.right + 0.5,
            );
            expect(box.left).toBeGreaterThanOrEqual(player.left - 0.5);
        }
        // Skipping stays one control away until the player is very narrow.
        const back = document.querySelector<HTMLElement>('[data-control="back10"]')!;
        expect(back.getClientRects().length > 0).toBe(width >= 320);
    });

    it('plays the video from the big button', async () => {
        const video = mount();
        await waitFor(() => video.readyState >= 1);
        await userEvent.click(page.getByRole('button', { name: L.play }));
        await waitFor(() => video.currentTime > 0.3);
        expect(video.paused).toBe(false);
    });

    it('seeks where the timeline is clicked', async () => {
        const video = mount();
        await waitFor(() => video.readyState >= 1);
        await userEvent.click(page.getByRole('button', { name: L.play }));
        video.pause();
        const slider = screen.getByRole('slider', { name: L.seek });
        const box = slider.getBoundingClientRect();
        await userEvent.click(page.getByRole('slider', { name: L.seek }), {
            position: { x: box.width / 2, y: box.height / 2 },
        });
        expect(video.currentTime).toBeGreaterThan(18);
        expect(video.currentTime).toBeLessThan(22);
    });

    it('shows German captions when turned on', async () => {
        const video = mount();
        await waitFor(() => video.readyState >= 1);
        await userEvent.click(page.getByRole('button', { name: L.play }));
        video.pause();
        await userEvent.click(page.getByRole('button', { name: L.captions }));
        video.currentTime = 2;
        const track = Array.from(video.textTracks).find((t) => t.language === 'de')!;
        await waitFor(() => (track.activeCues?.length ?? 0) > 0);
        expect((track.activeCues![0] as VTTCue).text).toBe('Willkommen zur dritten Lektion.');
    });

    it('fades the controls while playing, and brings them back on movement', async () => {
        const video = mount();
        await waitFor(() => video.readyState >= 1);
        await userEvent.click(page.getByRole('button', { name: L.play }));
        (document.activeElement as HTMLElement | null)?.blur();
        const bar = document.querySelector<HTMLElement>('[data-visible]')!;
        await waitFor(() => bar.dataset.visible === 'false', 5000);
        await userEvent.hover(page.getByRole('region', { name: 'Lektion 3' }));
        await waitFor(() => bar.dataset.visible === 'true');
    });

    it('looks right paused, with controls and chapters', async () => {
        const video = mount();
        await waitFor(() => video.readyState >= 1);
        await userEvent.click(page.getByRole('button', { name: L.play }));
        video.pause();
        video.currentTime = 10;
        await waitFor(() => !video.seeking && video.readyState >= 2);
        await expect
            .element(page.getByRole('region', { name: 'Lektion 3' }))
            .toMatchScreenshot('player-paused');
    });
});
