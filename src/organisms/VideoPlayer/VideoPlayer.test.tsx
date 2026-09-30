import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { VIDEO_LABELS as L } from './VideoPlayer.fixtures';
import { VideoPlayer, videoResumeKey, type VideoPlayerProps } from './VideoPlayer';

/*
 * jsdom has no media engine. Each <video> gets a small fake: play/pause flip
 * `paused` and fire the events a browser would; duration, time and text
 * tracks are plain properties. Layout-dependent behaviour (dragging the
 * timeline, real playback) lives in VideoPlayer.browser.test.tsx.
 */
type FakeTrack = { language: string; mode: TextTrackMode; activeCues?: { text: string }[] };

function fakeMedia(el: HTMLVideoElement, { duration = 600, tracks = [] as FakeTrack[] } = {}) {
    let t = 0;
    let paused = true;
    Object.defineProperties(el, {
        duration: { configurable: true, get: () => duration },
        currentTime: {
            configurable: true,
            get: () => t,
            set: (v: number) => {
                t = v;
            },
        },
        paused: { configurable: true, get: () => paused },
        ended: { configurable: true, get: () => false },
        buffered: {
            configurable: true,
            get: () => ({ length: 1, end: () => Math.min(duration, t + 30) }),
        },
        textTracks: { configurable: true, get: () => tracks },
        play: {
            configurable: true,
            value: vi.fn(() => {
                paused = false;
                el.dispatchEvent(new Event('play'));
                el.dispatchEvent(new Event('playing'));
                return Promise.resolve();
            }),
        },
        pause: {
            configurable: true,
            value: vi.fn(() => {
                paused = true;
                el.dispatchEvent(new Event('pause'));
            }),
        },
    });
    return {
        tick: (to: number) => {
            t = to;
            fireEvent.timeUpdate(el);
        },
    };
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

function setup(props: Partial<VideoPlayerProps> = {}, media: Parameters<typeof fakeMedia>[1] = {}) {
    const utils = render(<VideoPlayer src="/v.mp4" title="Lektion 3" labels={L} {...props} />);
    const video = utils.container.querySelector('video')!;
    const fake = fakeMedia(video, media);
    fireEvent.loadedMetadata(video);
    return { ...utils, video, ...fake, region: screen.getByRole('region', { name: 'Lektion 3' }) };
}
async function start() {
    await userEvent.click(screen.getByRole('button', { name: L.play }));
}

describe('VideoPlayer — playing', () => {
    it('is a named region with a big play button before it starts', () => {
        setup();
        expect(screen.getByRole('region', { name: 'Lektion 3' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: L.play })).toBeInTheDocument();
        expect(screen.queryByRole('slider', { name: L.seek })).not.toBeInTheDocument();
    });

    it('plays from the big button and then shows the controls', async () => {
        const { video } = setup();
        await start();
        expect(video.play).toHaveBeenCalled();
        expect(screen.getByRole('button', { name: L.pause })).toBeInTheDocument();
        expect(screen.getByRole('slider', { name: L.seek })).toBeInTheDocument();
    });

    it('announces play and pause for screen readers', async () => {
        const { video } = setup();
        await start();
        expect(screen.getByText(L.announce.playing)).toBeInTheDocument();
        act(() => video.pause());
        expect(screen.getByText(L.announce.paused)).toBeInTheDocument();
    });
});

describe('VideoPlayer — keyboard', () => {
    it('answers the usual keys while it has focus', async () => {
        const user = userEvent.setup();
        const { video, region } = setup();
        await start();
        region.focus();
        await user.keyboard('l');
        expect(video.currentTime).toBe(10);
        await user.keyboard('{ArrowRight}');
        expect(video.currentTime).toBe(15);
        await user.keyboard('j');
        expect(video.currentTime).toBe(5);
        await user.keyboard('5');
        expect(video.currentTime).toBe(300);
        await user.keyboard('{End}');
        expect(video.currentTime).toBe(600);
        await user.keyboard('{Home}');
        expect(video.currentTime).toBe(0);
        await user.keyboard('k');
        expect(video.pause).toHaveBeenCalled();
        await user.keyboard('m');
        expect(video.muted).toBe(true);
    });

    it('never goes below 0 or past the end', async () => {
        const user = userEvent.setup();
        const { video, region } = setup();
        await start();
        region.focus();
        await user.keyboard('j');
        expect(video.currentTime).toBe(0);
        await user.keyboard('{End}l');
        expect(video.currentTime).toBe(600);
    });

    it('leaves browser shortcuts alone', async () => {
        const user = userEvent.setup();
        const { video, region } = setup();
        await start();
        region.focus();
        await user.keyboard('{Control>}l{/Control}');
        expect(video.currentTime).toBe(0);
    });

    it('does nothing unless focus is in the player', async () => {
        const user = userEvent.setup();
        const { video } = setup();
        await start();
        (document.activeElement as HTMLElement).blur();
        await user.keyboard('l');
        expect(video.currentTime).toBe(0);
    });

    it('changes speed with > and <, and volume with ↑ ↓', async () => {
        const user = userEvent.setup();
        const { video, region } = setup();
        await start();
        region.focus();
        await user.keyboard('>');
        expect(video.playbackRate).toBe(1.25);
        await user.keyboard('<<');
        expect(video.playbackRate).toBe(0.75);
        await user.keyboard('{ArrowDown}{ArrowDown}');
        expect(video.volume).toBe(0.8);
    });
});

describe('VideoPlayer — timeline', () => {
    it('is a slider that speaks the time', async () => {
        const { tick } = setup();
        await start();
        tick(65);
        const slider = screen.getByRole('slider', { name: L.seek });
        expect(slider).toHaveAttribute('aria-valuenow', '65');
        expect(slider).toHaveAttribute('aria-valuemax', '600');
        expect(slider).toHaveAttribute('aria-valuetext', '1:05 von 10:00');
    });

    it('seeks by keyboard on the slider, once per key', async () => {
        const user = userEvent.setup();
        const { video } = setup();
        await start();
        screen.getByRole('slider', { name: L.seek }).focus();
        await user.keyboard('{ArrowRight}');
        expect(video.currentTime).toBe(5);
        await user.keyboard('{PageUp}');
        expect(video.currentTime).toBe(35);
        await user.keyboard('{End}');
        expect(video.currentTime).toBe(600);
        expect(screen.getByText(L.announce.seeked('10:00'))).toBeInTheDocument();
    });

    it('marks chapter boundaries on the track', async () => {
        const { container } = setup({
            chapters: [
                { start: 0, title: 'A' },
                { start: 300, title: 'B' },
            ],
        });
        await start();
        const slider = screen.getByRole('slider', { name: L.seek });
        const marks = Array.from(slider.querySelectorAll<HTMLElement>('div')).filter(
            (d) => d.style.left === '50%',
        );
        expect(marks.length).toBeGreaterThan(0);
        void container;
    });
});

describe('VideoPlayer — settings, volume, captions', () => {
    it('changes speed in the settings menu, and remembers it for every video', async () => {
        const user = userEvent.setup();
        const { video, unmount } = setup();
        await start();
        await user.click(screen.getByRole('button', { name: L.settings }));
        await user.click(await screen.findByRole('menuitemradio', { name: '1,5×' }));
        expect(video.playbackRate).toBe(1.5);
        expect(screen.getByText(L.announce.speed('1,5×'))).toBeInTheDocument();
        unmount();
        const again = setup({ src: '/other.mp4' });
        expect(again.video.playbackRate).toBe(1.5);
    });

    it('sets volume with its slider and mutes with its button', async () => {
        const user = userEvent.setup();
        const { video } = setup();
        await start();
        fireEvent.change(screen.getByRole('slider', { name: L.volume }), {
            target: { value: '0.4' },
        });
        expect(video.volume).toBe(0.4);
        expect(screen.getByText(L.announce.volume(40))).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: L.mute }));
        expect(video.muted).toBe(true);
        expect(screen.getByRole('button', { name: L.unmute })).toBeInTheDocument();
    });

    it('turns captions on and off, with the button pressed state', async () => {
        const user = userEvent.setup();
        const tracks: FakeTrack[] = [
            { language: 'de', mode: 'disabled' },
            { language: 'en', mode: 'disabled' },
        ];
        setup(
            {
                captions: [
                    { src: '/de.vtt', srcLang: 'de', label: 'Deutsch', default: true },
                    { src: '/en.vtt', srcLang: 'en', label: 'English' },
                ],
            },
            { tracks },
        );
        await start();
        const cc = screen.getByRole('button', { name: L.captions });
        expect(cc).toHaveAttribute('aria-pressed', 'false');
        await user.click(cc);
        expect(tracks.map((t) => t.mode)).toEqual(['hidden', 'disabled']);
        expect(cc).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByText(L.announce.captionsOn('Deutsch'))).toBeInTheDocument();
        await user.click(cc);
        expect(tracks.map((t) => t.mode)).toEqual(['disabled', 'disabled']);
    });

    it('draws the active caption itself, above the controls', async () => {
        const user = userEvent.setup();
        const tracks: FakeTrack[] = [
            { language: 'de', mode: 'disabled', activeCues: [{ text: 'Willkommen.' }] },
        ];
        setup({ captions: [{ src: '/de.vtt', srcLang: 'de', label: 'Deutsch' }] }, { tracks });
        await start();
        expect(screen.queryByText('Willkommen.')).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: L.captions }));
        const caption = screen.getByText('Willkommen.');
        expect(caption).toHaveAttribute('lang', 'de');
        expect(caption.parentElement).toHaveClass('bottom-24');
    });

    it('has no captions button without captions', async () => {
        setup();
        await start();
        expect(screen.queryByRole('button', { name: L.captions })).not.toBeInTheDocument();
    });

    it('asks the whole player to go fullscreen', async () => {
        const { region } = setup();
        const request = vi.fn().mockResolvedValue(undefined);
        region.requestFullscreen = request;
        await start();
        await userEvent.click(screen.getByRole('button', { name: L.fullscreen }));
        expect(request).toHaveBeenCalled();
    });
});

describe('VideoPlayer — resume and completion', () => {
    it('resumes from the stored position, not a few seconds in and not at the end', () => {
        localStorage.setItem(videoResumeKey('l3'), '120');
        const { video } = setup({ resumeKey: 'l3' });
        expect(video.currentTime).toBe(120);
    });

    it.each(['2', '597'])('starts over from a stored %s s', (saved) => {
        localStorage.setItem(videoResumeKey('l3'), saved);
        const { video } = setup({ resumeKey: 'l3' });
        expect(video.currentTime).toBe(0);
    });

    it('counts what was watched, and completes once at 90 %', async () => {
        const onComplete = vi.fn();
        const onProgress = vi.fn();
        const { tick, video } = setup({ onComplete, onProgress }, { duration: 100 });
        await start();
        for (let t = 1; t <= 91; t++) tick(t);
        expect(onComplete).toHaveBeenCalledTimes(1);
        act(() => video.pause());
        const last = onProgress.mock.calls.at(-1)![0];
        expect(last.fraction).toBeCloseTo(0.91);
        expect(last.watched).toEqual([[0, 91]]);
        for (let t = 92; t <= 100; t++) tick(t);
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('does not count a jump to the end as watching', async () => {
        const onComplete = vi.fn();
        const { tick } = setup({ onComplete }, { duration: 100 });
        await start();
        tick(1);
        tick(2);
        tick(95);
        tick(96);
        tick(97);
        expect(onComplete).not.toHaveBeenCalled();
    });
});

describe('VideoPlayer — failure and expired links', () => {
    it('asks once for a fresh link and continues at the same second', async () => {
        const refreshSrc = vi.fn().mockResolvedValue('/v.mp4?sig=new');
        const { video, container } = setup({ refreshSrc });
        await start();
        video.currentTime = 77;
        await act(async () => {
            fireEvent.error(video);
        });
        expect(refreshSrc).toHaveBeenCalledTimes(1);
        const fresh = container.querySelector('video')!;
        expect(fresh).toHaveAttribute('src', '/v.mp4?sig=new');
        fakeMedia(fresh);
        fireEvent.loadedMetadata(fresh);
        expect(fresh.currentTime).toBe(77);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('shows the error with a retry when the fresh link fails too', async () => {
        const refreshSrc = vi.fn().mockResolvedValue('/v.mp4?sig=new');
        const { video, container } = setup({ refreshSrc });
        await act(async () => {
            fireEvent.error(video);
        });
        const fresh = container.querySelector('video')!;
        await act(async () => {
            fireEvent.error(fresh);
        });
        expect(screen.getByRole('alert')).toHaveTextContent(L.errorTitle);
        await userEvent.click(screen.getByRole('button', { name: L.retry }));
        expect(refreshSrc).toHaveBeenCalledTimes(2);
    });

    it('retries the same link, cache-busted, without a refresher', async () => {
        const { video, container } = setup();
        await act(async () => {
            fireEvent.error(video);
        });
        await userEvent.click(screen.getByRole('button', { name: L.retry }));
        expect(container.querySelector('video')!.getAttribute('src')).toMatch(
            /^\/v\.mp4\?retry=\d+$/,
        );
    });
});

describe('VideoPlayer — end screen', () => {
    it('offers the next lesson and counts down to it, cancelably', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onPlay = vi.fn();
        const { video } = setup({ next: { title: 'Lektion 4', onPlay, autoAdvanceSeconds: 3 } });
        act(() => {
            fireEvent.ended(video);
        });
        expect(screen.getByText('Lektion 4')).toBeInTheDocument();
        expect(screen.getByRole('timer')).toHaveTextContent(L.startsIn(3));
        // One step per second: each tick schedules the next.
        for (let i = 0; i < 4; i++) act(() => void vi.advanceTimersByTime(1000));
        expect(onPlay).toHaveBeenCalledTimes(1);
    });

    it('stops the countdown on cancel', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onPlay = vi.fn();
        const { video } = setup({ next: { title: 'Lektion 4', onPlay, autoAdvanceSeconds: 5 } });
        act(() => {
            fireEvent.ended(video);
        });
        fireEvent.click(screen.getByRole('button', { name: L.cancel }));
        act(() => void vi.advanceTimersByTime(6000));
        expect(onPlay).not.toHaveBeenCalled();
        expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    });

    it('does not advance on its own without autoAdvanceSeconds', () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        const onPlay = vi.fn();
        const { video } = setup({ next: { title: 'Lektion 4', onPlay } });
        act(() => {
            fireEvent.ended(video);
        });
        act(() => void vi.advanceTimersByTime(20000));
        expect(onPlay).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: L.playNext }));
        expect(onPlay).toHaveBeenCalledTimes(1);
    });
});

describe('VideoPlayer — chapters', () => {
    const chapters = [
        { start: 0, title: 'Einführung' },
        { start: 120, title: 'Alif' },
        { start: 300, title: 'Ba' },
    ];

    it('lists chapters, jumps to one, and marks the current one', async () => {
        const { video, tick } = setup({ chapters });
        const list = screen.getByRole('navigation', { name: L.chapters });
        await userEvent.click(within(list).getByRole('button', { name: /Alif/ }));
        expect(video.currentTime).toBe(120);
        expect(video.play).toHaveBeenCalled();
        tick(130);
        expect(within(list).getByRole('button', { name: /Alif/ })).toHaveAttribute(
            'aria-current',
            'true',
        );
        expect(within(list).getByRole('button', { name: /Einführung/ })).not.toHaveAttribute(
            'aria-current',
        );
    });

    it('can hide the list', () => {
        setup({ chapters, showChapterList: false });
        expect(screen.queryByRole('navigation', { name: L.chapters })).not.toBeInTheDocument();
    });
});

describe('VideoPlayer — touch', () => {
    it('skips with a double tap on the right or left third', async () => {
        const { video, region } = setup();
        await start();
        const surface = region.querySelector<HTMLElement>('[aria-hidden="true"].absolute.inset-0')!;
        surface.getBoundingClientRect = () =>
            ({
                left: 0,
                top: 0,
                width: 300,
                height: 170,
                right: 300,
                bottom: 170,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            }) as DOMRect;
        const tap = (x: number) =>
            fireEvent.pointerUp(surface, { pointerType: 'touch', clientX: x, clientY: 80 });
        tap(280);
        tap(282);
        expect(video.currentTime).toBe(10);
        expect(screen.getByText(L.skipped(10))).toBeInTheDocument();
        tap(10);
        tap(12);
        expect(video.currentTime).toBe(0);
    });
});

describe('VideoPlayer — focus', () => {
    it('keeps focus in the player after the big play button disappears', async () => {
        const user = userEvent.setup();
        const { video, region } = setup();
        await user.click(screen.getByRole('button', { name: L.play }));
        expect(region).toHaveFocus();
        await user.keyboard('l');
        expect(video.currentTime).toBe(10);
    });
});
