import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { VIDEO_LABELS } from './VideoPlayer.fixtures';
import { VideoPlayer, videoResumeKey } from './VideoPlayer';

afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
});

function player(extra: Partial<React.ComponentProps<typeof VideoPlayer>> = {}) {
    return (
        <VideoPlayer
            src="/v.mp4"
            title="Lektion 3"
            labels={VIDEO_LABELS}
            resumeKey="l3"
            {...extra}
        />
    );
}
const video = () => screen.getByLabelText('Lektion 3') as HTMLVideoElement;
/** jsdom has no media engine: give the element a duration and a settable time. */
function fakeMedia(el: HTMLVideoElement, duration = 600, start = 0) {
    let t = start;
    Object.defineProperty(el, 'duration', { configurable: true, get: () => duration });
    Object.defineProperty(el, 'currentTime', {
        configurable: true,
        get: () => t,
        set: (v: number) => {
            t = v;
        },
    });
}

describe('VideoPlayer', () => {
    it('is a named native video with controls', () => {
        render(player());
        expect(video()).toHaveAttribute('controls');
        expect(video()).toHaveAttribute('src', '/v.mp4');
    });

    it('resumes from the stored position', () => {
        localStorage.setItem(videoResumeKey('l3'), '120');
        render(player());
        fakeMedia(video());
        fireEvent.loadedMetadata(video());
        expect(video().currentTime).toBe(120);
    });

    it.each([
        ['near the start', '2'],
        ['near the end', '597'],
    ])('does not resume %s', (_, saved) => {
        localStorage.setItem(videoResumeKey('l3'), saved);
        render(player());
        fakeMedia(video());
        fireEvent.loadedMetadata(video());
        expect(video().currentTime).toBe(0);
    });

    it('never resumes without a resumeKey', () => {
        localStorage.setItem(videoResumeKey('l3'), '120');
        render(player({ resumeKey: undefined }));
        fakeMedia(video());
        fireEvent.loadedMetadata(video());
        expect(video().currentTime).toBe(0);
    });

    it('saves the position at most every 5 seconds, and forgets it at the end', () => {
        vi.useFakeTimers();
        vi.setSystemTime(10_000);
        render(player());
        fakeMedia(video(), 600, 42.7);
        fireEvent.timeUpdate(video());
        expect(localStorage.getItem(videoResumeKey('l3'))).toBe('42');
        video().currentTime = 50;
        vi.setSystemTime(12_000);
        fireEvent.timeUpdate(video());
        expect(localStorage.getItem(videoResumeKey('l3'))).toBe('42');
        vi.setSystemTime(16_000);
        fireEvent.timeUpdate(video());
        expect(localStorage.getItem(videoResumeKey('l3'))).toBe('50');
        fireEvent.ended(video());
        expect(localStorage.getItem(videoResumeKey('l3'))).toBeNull();
    });

    it('skips back and forward, never past the ends', async () => {
        render(player());
        fakeMedia(video(), 100, 20);
        await userEvent.click(screen.getByRole('button', { name: /−30 Sek/ }));
        expect(video().currentTime).toBe(0);
        await userEvent.click(screen.getByRole('button', { name: /\+30 Sek/ }));
        await userEvent.click(screen.getByRole('button', { name: /\+15 Sek/ }));
        expect(video().currentTime).toBe(45);
        video().currentTime = 95;
        await userEvent.click(screen.getByRole('button', { name: /\+15 Sek/ }));
        expect(video().currentTime).toBe(100);
        await userEvent.click(screen.getByRole('button', { name: /−15 Sek/ }));
        expect(video().currentTime).toBe(85);
    });

    it('changes speed, marking the pressed rate', async () => {
        render(player());
        const fast = screen.getByRole('button', { name: '1.5× Geschwindigkeit' });
        await userEvent.click(fast);
        expect(fast).toHaveAttribute('aria-pressed', 'true');
        expect(video().playbackRate).toBe(1.5);
        expect(screen.getByRole('button', { name: '1× Geschwindigkeit' })).toHaveAttribute(
            'aria-pressed',
            'false',
        );
        expect(screen.getByRole('group', { name: 'Geschwindigkeit' })).toBeInTheDocument();
    });

    it('turns a failed load into a message with Retry, which asks for a fresh URL', async () => {
        render(player());
        fireEvent.error(video());
        expect(screen.getByRole('alert')).toHaveTextContent(VIDEO_LABELS.errorTitle);
        await userEvent.click(screen.getByRole('button', { name: /Erneut versuchen/ }));
        expect(video()).toHaveAttribute('src', '/v.mp4?retry=1');
        fireEvent.error(video());
        await userEvent.click(screen.getByRole('button', { name: /Erneut versuchen/ }));
        expect(video()).toHaveAttribute('src', '/v.mp4?retry=2');
    });

    it('appends the retry to an existing query string', async () => {
        render(player({ src: '/v.mp4?sig=abc' }));
        fireEvent.error(video());
        await userEvent.click(screen.getByRole('button', { name: /Erneut versuchen/ }));
        expect(video()).toHaveAttribute('src', '/v.mp4?sig=abc&retry=1');
    });

    it('renders given caption tracks', () => {
        const { container } = render(
            player({
                captions: [{ src: '/de.vtt', srcLang: 'de', label: 'Deutsch', default: true }],
            }),
        );
        const track = container.querySelector('track');
        expect(track).toHaveAttribute('src', '/de.vtt');
        expect(track).toHaveAttribute('srclang', 'de');
    });
});
