import { AlertTriangle, Gauge, RotateCcw, RotateCw } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '../../atoms/Button';
import { cn } from '../../lib/cn';

const DEFAULT_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const;
const SAVE_EVERY_MS = 5000;

export interface VideoPlayerLabels {
    /** Visible text of the "back 30 seconds" button, e.g. `30 s zurück`. */
    back30: string;
    /** Visible text of the "back 15 seconds" button. */
    back15: string;
    /** Visible text of the "forward 15 seconds" button. */
    forward15: string;
    /** Visible text of the "forward 30 seconds" button. */
    forward30: string;
    /** Name of the speed group, e.g. "Geschwindigkeit". */
    speed: string;
    /** Name of one speed button, e.g. `(r) => \`${r}× Geschwindigkeit\``. */
    speedValue: (rate: number) => string;
    /** Heading of the failure message shown when the video cannot be loaded. */
    errorTitle: string;
    /** Explanation under the failure heading, e.g. that the link may have expired. */
    errorBody: string;
    /** Text of the retry button, which reloads the video with a cache-busting `retry` query parameter. */
    retry: string;
}

export interface VideoPlayerProps {
    /** URL of the video file. On Retry the player requests it again with `retry=N` appended, so a server can return a fresh signed URL. */
    src: string;
    /** The video's accessible name. */
    title: string;
    /**
     * Remember where the person stopped, under this name (e.g. the lesson id),
     * and continue from there next time. Omit to always start at 0.
     */
    resumeKey?: string;
    /** Every visible and accessible string of the skip, speed and failure controls. */
    labels: VideoPlayerLabels;
    /** Playback rates offered as buttons, e.g. `[1, 1.5, 2]`. Default `[0.75, 1, 1.25, 1.5, 2]`. */
    speeds?: readonly number[];
    /** Caption tracks, e.g. `[{ src, srcLang: 'de', label: 'Deutsch' }]`. */
    captions?: { src: string; srcLang: string; label: string; default?: boolean }[];
    /** Extra classes on the wrapper around the video and its controls (the video is full-width, 16:9). */
    className?: string;
}

/** The storage key for a resume position. Exported so an app can clear it. */
export function videoResumeKey(resumeKey: string): string {
    return `burgwiss-ui:video:${resumeKey}`;
}

/**
 * A lesson video. The browser's own `<video>` controls (scrub, volume,
 * fullscreen) plus what lessons need on top:
 *
 * - **Resume.** The position is saved every few seconds and restored on load,
 *   so turning a phone — which remounts the page — no longer restarts at 0.
 *   Not near the start, and not near the end, so a finished video starts over.
 * - **Skip** ±15 s and ±30 s.
 * - **Speed**, 0.75× to 2×.
 * - **A failure state.** A signed URL can expire before play; instead of a
 *   silent black box it says so and offers a Retry that requests a fresh URL.
 *
 * Use it for lesson recordings that people watch in several sittings. It plays
 * one file URL; it has no playlist, streaming (HLS) or picture-in-picture logic
 * of its own.
 *
 * @summary Lesson video with resume position, skip buttons, speed choice and a retry-able failure state.
 */
export function VideoPlayer({
    src,
    title,
    resumeKey,
    labels,
    speeds = DEFAULT_SPEEDS,
    captions = [],
    className,
}: VideoPlayerProps) {
    const ref = useRef<HTMLVideoElement>(null);
    const lastSavedAt = useRef(0);
    const [speed, setSpeed] = useState(1);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const key = resumeKey === undefined ? null : videoResumeKey(resumeKey);
    // A retry asks for the URL again, cache-busted, so a server can mint a fresh one.
    const playbackSrc =
        attempt === 0 ? src : `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}`;

    const storage = {
        read: (): number => {
            try {
                return key ? Number(localStorage.getItem(key) ?? 0) || 0 : 0;
            } catch {
                return 0;
            }
        },
        write: (seconds: number) => {
            try {
                if (key) localStorage.setItem(key, String(Math.floor(seconds)));
            } catch {
                // Storage full or blocked: resume is best-effort.
            }
        },
        clear: () => {
            try {
                if (key) localStorage.removeItem(key);
            } catch {
                // ignore
            }
        },
    };

    const onLoadedMetadata = () => {
        const v = ref.current;
        if (!v) return;
        const saved = storage.read();
        if (saved > 3 && Number.isFinite(v.duration) && saved < v.duration - 5) {
            v.currentTime = saved;
        }
        v.playbackRate = speed;
    };

    const onTimeUpdate = () => {
        const v = ref.current;
        if (!v) return;
        const now = Date.now();
        if (now - lastSavedAt.current < SAVE_EVERY_MS) return;
        lastSavedAt.current = now;
        storage.write(v.currentTime);
    };

    const skip = (seconds: number) => {
        const v = ref.current;
        if (!v) return;
        const max = Number.isFinite(v.duration) ? v.duration : v.currentTime + seconds;
        v.currentTime = Math.max(0, Math.min(max, v.currentTime + seconds));
    };

    const changeSpeed = (rate: number) => {
        setSpeed(rate);
        if (ref.current) ref.current.playbackRate = rate;
    };

    if (failed) {
        return (
            <div className={className}>
                <div
                    role="alert"
                    className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border border-warning/50 bg-warning/10 p-6 text-center text-warning-tint-foreground"
                >
                    <AlertTriangle className="size-8 shrink-0" aria-hidden="true" />
                    <div className="space-y-1">
                        <p className="text-sm font-semibold">{labels.errorTitle}</p>
                        <p className="text-xs">{labels.errorBody}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="min-h-11"
                        onClick={() => {
                            setFailed(false);
                            setAttempt((n) => n + 1);
                        }}
                    >
                        <RotateCw aria-hidden="true" />
                        {labels.retry}
                    </Button>
                </div>
            </div>
        );
    }

    const control =
        'inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

    return (
        <div className={className}>
            {/* The rule cannot see a <track> rendered from a list; one is always rendered. */}
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
                key={attempt}
                ref={ref}
                src={playbackSrc}
                title={title}
                aria-label={title}
                controls
                playsInline
                preload="metadata"
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                onEnded={storage.clear}
                onError={() => setFailed(true)}
                className="aspect-video w-full rounded-lg bg-video-surface shadow-lg"
            >
                {captions.length === 0 ? (
                    <track kind="captions" />
                ) : (
                    captions.map((c) => (
                        <track
                            key={c.src}
                            kind="captions"
                            src={c.src}
                            srcLang={c.srcLang}
                            label={c.label}
                            default={c.default}
                        />
                    ))
                )}
            </video>

            <div className="mt-2 flex flex-wrap items-center gap-2">
                <button type="button" className={control} onClick={() => skip(-30)}>
                    <RotateCcw className="size-4" aria-hidden="true" />
                    {labels.back30}
                </button>
                <button type="button" className={control} onClick={() => skip(-15)}>
                    <RotateCcw className="size-4" aria-hidden="true" />
                    {labels.back15}
                </button>
                <button type="button" className={control} onClick={() => skip(15)}>
                    <RotateCw className="size-4" aria-hidden="true" />
                    {labels.forward15}
                </button>
                <button type="button" className={control} onClick={() => skip(30)}>
                    <RotateCw className="size-4" aria-hidden="true" />
                    {labels.forward30}
                </button>

                <div
                    role="group"
                    aria-label={labels.speed}
                    className="ml-auto flex items-center gap-1"
                >
                    <Gauge className="size-4 text-muted-foreground" aria-hidden="true" />
                    {speeds.map((rate) => (
                        <button
                            key={rate}
                            type="button"
                            aria-pressed={speed === rate}
                            aria-label={labels.speedValue(rate)}
                            onClick={() => changeSpeed(rate)}
                            className={cn(
                                'inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                speed === rate
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            {rate}×
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
