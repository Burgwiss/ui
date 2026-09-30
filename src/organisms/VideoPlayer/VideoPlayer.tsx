import {
    AlertTriangle,
    Captions,
    Loader2,
    Maximize,
    Minimize,
    Pause,
    PictureInPicture2,
    Play,
    RotateCcw,
    RotateCw,
    Settings,
    SkipForward,
    Volume1,
    Volume2,
    VolumeX,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useId,
    useRef,
    useState,
    type KeyboardEvent,
    type PointerEvent,
} from 'react';

import { Button } from '../../atoms/Button';
import { cn } from '../../lib/cn';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';
import {
    addWatched,
    chapterAt,
    formatTime,
    keyToCommand,
    watchedFraction,
    type Chapter,
    type PlayerCommand,
    type WatchedRange,
} from './videoMath';

export type { Chapter, WatchedRange } from './videoMath';

/** Every text the player shows or announces. The app passes them in its language. */
export interface VideoPlayerLabels {
    play: string;
    pause: string;
    replay: string;
    back10: string;
    forward10: string;
    mute: string;
    unmute: string;
    volume: string;
    /** Name of the timeline slider, e.g. "Position im Video". */
    seek: string;
    /** Spoken value of the timeline, e.g. `(a, b) => \`${a} von ${b}\``. */
    timeOf: (current: string, total: string) => string;
    settings: string;
    speed: string;
    /** A speed in the menu, e.g. `1` → "Normal", `1.5` → "1,5×". */
    speedValue: (rate: number) => string;
    captions: string;
    captionsOff: string;
    pictureInPicture: string;
    fullscreen: string;
    exitFullscreen: string;
    chapters: string;
    loading: string;
    errorTitle: string;
    errorBody: string;
    retry: string;
    /** End screen: "Als Nächstes". */
    upNext: string;
    playNext: string;
    cancel: string;
    /** End screen countdown, e.g. `(s) => \`Startet in ${s} s\``. */
    startsIn: (seconds: number) => string;
    /** Double-tap feedback on phones, e.g. `(s) => \`${s} Sekunden\``. */
    skipped: (seconds: number) => string;
    /** Spoken after an action, for screen readers. */
    announce: {
        playing: string;
        paused: string;
        seeked: (time: string) => string;
        speed: (rateLabel: string) => string;
        volume: (percent: number) => string;
        muted: string;
        unmuted: string;
        captionsOn: (language: string) => string;
        captionsOff: string;
    };
}

export interface VideoPlayerProgress {
    currentTime: number;
    duration: number;
    /** Spans actually watched — skipping ahead adds nothing. */
    watched: WatchedRange[];
    /** Share of the video watched, 0–1. */
    fraction: number;
}

export interface VideoPlayerProps {
    src: string;
    /** The video's accessible name. */
    title: string;
    /** Still image shown before playing. */
    poster?: string;
    /** Continue where the person stopped, remembered under this name (e.g. the lesson id). */
    resumeKey?: string;
    /** Chapter marks: split the timeline, name the hover preview, and list under the player. */
    chapters?: Chapter[];
    /** Show the chapter list under the player. Default: when there are chapters. */
    showChapterList?: boolean;
    /** WebVTT caption tracks. */
    captions?: { src: string; srcLang: string; label: string; default?: boolean }[];
    /** Speeds in the settings menu. Default 0.5–2 in quarter steps. */
    speeds?: readonly number[];
    /**
     * Get a fresh URL when this one fails — signed links expire. Tried once
     * automatically; playback continues at the same second.
     */
    refreshSrc?: () => Promise<string>;
    /** Share of the video that must be WATCHED to count as done. Default 0.9. */
    completeAt?: number;
    /** Every few seconds while playing, and on pause and end. */
    onProgress?: (progress: VideoPlayerProgress) => void;
    /** Once, when `completeAt` of the video has been watched. */
    onComplete?: () => void;
    /** End screen with the next lesson. `autoAdvanceSeconds` counts down to it; cancelable. */
    next?: { title: string; onPlay: () => void; autoAdvanceSeconds?: number };
    labels: VideoPlayerLabels;
    className?: string;
}

const DEFAULT_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const HIDE_AFTER_MS = 2500;
const PROGRESS_EVERY_MS = 5000;
const PREFS_KEY = 'burgwiss-ui:video-prefs';

/** Storage key for a resume position. Exported so an app can clear it. */
export function videoResumeKey(resumeKey: string): string {
    return `burgwiss-ui:video:${resumeKey}`;
}

type Prefs = { rate: number; volume: number; muted: boolean; captions: string | null };

function readPrefs(): Prefs {
    try {
        const p = JSON.parse(localStorage.getItem(PREFS_KEY) ?? 'null') as Partial<Prefs> | null;
        return {
            rate: typeof p?.rate === 'number' && p.rate > 0 && p.rate <= 4 ? p.rate : 1,
            volume: typeof p?.volume === 'number' && p.volume >= 0 && p.volume <= 1 ? p.volume : 1,
            muted: p?.muted === true,
            captions: typeof p?.captions === 'string' ? p.captions : null,
        };
    } catch {
        return { rate: 1, volume: 1, muted: false, captions: null };
    }
}

function writePrefs(patch: Partial<Prefs>) {
    try {
        localStorage.setItem(PREFS_KEY, JSON.stringify({ ...readPrefs(), ...patch }));
    } catch {
        // Storage blocked: the choice holds for this visit.
    }
}

/**
 * The lesson video player: a real `<video>` with our own controls, built for
 * learning. Big play button, a timeline with buffered range, chapter marks and
 * a hover preview, ±10 s, volume, speed (remembered), captions, picture-in-
 * picture and fullscreen; controls fade while playing. Keyboard shortcuts work
 * while the player has focus (K/Space, J/L, ←/→, ↑/↓, M, F, C, 0–9, </>);
 * on a phone, double-tap the sides to skip. It resumes where the person
 * stopped, counts only what was actually watched towards "done", refreshes an
 * expired signed link without losing the place, and can end on "next lesson".
 *
 * @summary Accessible, themable lesson video player with chapters, captions, resume and completion.
 */
export function VideoPlayer(props: VideoPlayerProps) {
    // A new lesson starts over: fresh state, fresh watched ranges, fresh refresh attempt.
    return <Player key={props.src} {...props} />;
}

function Player({
    src,
    title,
    poster,
    resumeKey,
    chapters = [],
    showChapterList,
    captions = [],
    speeds = DEFAULT_SPEEDS,
    refreshSrc,
    completeAt = 0.9,
    onProgress,
    onComplete,
    next,
    labels,
    className,
}: VideoPlayerProps) {
    const baseId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    // The element menus render into, so they stay visible in fullscreen.
    const [root, setRoot] = useState<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentSrc, setCurrentSrc] = useState(src);
    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);
    const [ended, setEnded] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [failed, setFailed] = useState(false);
    const [time, setTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [prefs, setPrefs] = useState<Prefs>(() => readPrefs());
    const [fullscreen, setFullscreen] = useState(false);
    const [active, setActive] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [announcement, setAnnouncement] = useState('');
    const [ripple, setRipple] = useState<{ side: 'back' | 'forward'; key: number } | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [hover, setHover] = useState<{ x: number; time: number } | null>(null);
    // Captions are drawn by us, not the browser: the browser puts them at the
    // very bottom, under our controls. Tracks run in "hidden" mode, which still
    // times the cues; we show the active ones above the control bar.
    const [cue, setCue] = useState('');

    const watched = useRef<WatchedRange[]>([]);
    const lastTime = useRef(0);
    const completed = useRef(false);
    const refreshed = useRef(false);
    const resumeAt = useRef<number | null>(null);
    const lastProgress = useRef(0);
    const lastSaved = useRef(0);
    const hideTimer = useRef<number | null>(null);
    const lastTap = useRef<{ t: number; x: number } | null>(null);

    const video = () => videoRef.current;
    const announce = (text: string) => setAnnouncement(text);
    const activeCaptions =
        prefs.captions && captions.some((c) => c.srcLang === prefs.captions)
            ? prefs.captions
            : null;

    const report = useCallback(
        (force = false) => {
            const v = video();
            if (!v) return;
            const d = Number.isFinite(v.duration) ? v.duration : 0;
            const fraction = watchedFraction(watched.current, d);
            // Completion is checked on every update: the progress report below
            // is throttled and would otherwise miss the moment it happens.
            if (!completed.current && d > 0 && fraction >= completeAt) {
                completed.current = true;
                onComplete?.();
            }
            const now = Date.now();
            if (!force && now - lastProgress.current < PROGRESS_EVERY_MS) return;
            lastProgress.current = now;
            onProgress?.({
                currentTime: v.currentTime,
                duration: d,
                watched: watched.current,
                fraction,
            });
        },
        [onProgress, onComplete, completeAt],
    );

    // ---- controls visibility ---------------------------------------------------
    const wake = useCallback(() => {
        setActive(true);
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setActive(false), HIDE_AFTER_MS);
    }, []);
    useEffect(() => () => void (hideTimer.current && window.clearTimeout(hideTimer.current)), []);
    const controlsVisible = !playing || active || menuOpen;

    // ---- commands ---------------------------------------------------------------
    const play = () =>
        void video()
            ?.play()
            ?.catch(() => {});
    const toggle = () => {
        const v = video();
        if (!v) return;
        if (v.paused || v.ended) play();
        else v.pause();
    };
    const seekTo = (t: number, speak = true) => {
        const v = video();
        if (!v) return;
        const d = Number.isFinite(v.duration) ? v.duration : t;
        v.currentTime = Math.max(0, Math.min(d, t));
        setTime(v.currentTime);
        setEnded(false);
        if (speak) announce(labels.announce.seeked(formatTime(v.currentTime, d)));
    };
    const setRate = (rate: number) => {
        const v = video();
        if (v) v.playbackRate = rate;
        setPrefs((p) => ({ ...p, rate }));
        writePrefs({ rate });
        announce(labels.announce.speed(labels.speedValue(rate)));
    };
    const setVolume = (volume: number) => {
        const v = video();
        const clamped = Math.round(Math.max(0, Math.min(1, volume)) * 100) / 100;
        if (v) {
            v.volume = clamped;
            v.muted = clamped === 0;
        }
        setPrefs((p) => ({ ...p, volume: clamped, muted: clamped === 0 }));
        writePrefs({ volume: clamped, muted: clamped === 0 });
        announce(labels.announce.volume(Math.round(clamped * 100)));
    };
    const toggleMute = () => {
        const v = video();
        const muted = !(v?.muted ?? prefs.muted);
        if (v) v.muted = muted;
        setPrefs((p) => ({ ...p, muted }));
        writePrefs({ muted });
        announce(muted ? labels.announce.muted : labels.announce.unmuted);
    };
    const setCaptions = (lang: string | null) => {
        for (const t of Array.from(video()?.textTracks ?? []))
            t.mode = t.language === lang ? 'hidden' : 'disabled';
        setPrefs((p) => ({ ...p, captions: lang }));
        writePrefs({ captions: lang });
        const label = captions.find((c) => c.srcLang === lang)?.label;
        announce(label ? labels.announce.captionsOn(label) : labels.announce.captionsOff);
    };
    const toggleFullscreen = async () => {
        const root = rootRef.current;
        const v = video() as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else if (root?.requestFullscreen) await root.requestFullscreen();
            // iPhone Safari: no element fullscreen, only the system player's.
            else v?.webkitEnterFullscreen?.();
        } catch {
            // Refused (iframe without allowfullscreen, user gesture missing): stay inline.
        }
    };
    const togglePip = async () => {
        const v = video();
        try {
            if (document.pictureInPictureElement) await document.exitPictureInPicture();
            else await v?.requestPictureInPicture?.();
        } catch {
            // Not allowed here; the button stays, nothing happens.
        }
    };

    const run = (command: PlayerCommand) => {
        const v = video();
        const d = v && Number.isFinite(v.duration) ? v.duration : duration;
        switch (command.type) {
            case 'toggle':
                return toggle();
            case 'seekBy':
                return seekTo((v?.currentTime ?? time) + command.seconds);
            case 'seekTo':
                return seekTo(command.fraction * d);
            case 'volumeBy':
                return setVolume((prefs.muted ? 0 : prefs.volume) + command.delta);
            case 'mute':
                return toggleMute();
            case 'fullscreen':
                return void toggleFullscreen();
            case 'captions':
                if (captions.length === 0) return;
                return setCaptions(
                    activeCaptions
                        ? null
                        : (captions.find((c) => c.default) ?? captions[0]!).srcLang,
                );
            case 'speedBy': {
                const i = speeds.indexOf(prefs.rate);
                const nextRate =
                    speeds[
                        Math.max(
                            0,
                            Math.min(
                                speeds.length - 1,
                                (i < 0 ? speeds.indexOf(1) : i) + command.step,
                            ),
                        )
                    ];
                if (nextRate !== undefined) setRate(nextRate);
                return;
            }
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        // Controls and menus handle their own keys; the timeline its arrows.
        if (
            target.closest(
                'input,textarea,select,[role=menu],[role=menuitem],[role=menuitemradio],[role=slider]',
            )
        )
            return;
        if ((event.key === ' ' || event.key === 'Enter') && target.closest('button')) return;
        const command = keyToCommand(event);
        if (!command) return;
        event.preventDefault();
        wake();
        run(command);
    };

    // ---- media events -------------------------------------------------------------
    const onLoadedMetadata = () => {
        const v = video();
        if (!v) return;
        setDuration(Number.isFinite(v.duration) ? v.duration : 0);
        v.playbackRate = prefs.rate;
        v.volume = prefs.volume;
        v.muted = prefs.muted;
        for (const t of Array.from(v.textTracks))
            t.mode = t.language === activeCaptions ? 'hidden' : 'disabled';
        let target = resumeAt.current;
        resumeAt.current = null;
        if (target === null && resumeKey) {
            try {
                const saved = Number(localStorage.getItem(videoResumeKey(resumeKey)) ?? 0) || 0;
                // Not a few seconds in, and not at the very end: then start over.
                if (saved > 3 && Number.isFinite(v.duration) && saved < v.duration - 5)
                    target = saved;
            } catch {
                // Resume is best-effort.
            }
        }
        if (target !== null) {
            v.currentTime = target;
            setTime(target);
            lastTime.current = target;
        }
    };
    const onTimeUpdate = () => {
        const v = video();
        if (!v) return;
        const t = v.currentTime;
        // Only continuous playback counts as watched: a jump breaks the span.
        if (
            !v.paused &&
            t > lastTime.current &&
            t - lastTime.current < 1.5 * Math.max(1, v.playbackRate)
        ) {
            watched.current = addWatched(watched.current, [lastTime.current, t]);
        }
        lastTime.current = t;
        setTime(t);
        if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
        if (resumeKey && Date.now() - lastSaved.current >= PROGRESS_EVERY_MS) {
            lastSaved.current = Date.now();
            try {
                localStorage.setItem(videoResumeKey(resumeKey), String(Math.floor(t)));
            } catch {
                // Resume is best-effort.
            }
        }
        report();
    };
    const onEnded = () => {
        setPlaying(false);
        setEnded(true);
        report(true);
        if (resumeKey) {
            try {
                localStorage.removeItem(videoResumeKey(resumeKey));
            } catch {
                // ignore
            }
        }
        if (next?.autoAdvanceSeconds) setCountdown(next.autoAdvanceSeconds);
    };
    const onError = async () => {
        const at = video()?.currentTime ?? 0;
        if (refreshSrc && !refreshed.current) {
            // A signed link that expired: ask once for a fresh one and carry on.
            refreshed.current = true;
            try {
                const fresh = await refreshSrc();
                resumeAt.current = at > 0 ? at : null;
                setCurrentSrc(fresh);
                return;
            } catch {
                // Fall through to the error screen.
            }
        }
        setFailed(true);
        setWaiting(false);
    };
    const retry = async () => {
        const at = time;
        setFailed(false);
        refreshed.current = false;
        resumeAt.current = at > 0 ? at : null;
        if (refreshSrc) {
            try {
                setCurrentSrc(await refreshSrc());
                return;
            } catch {
                setFailed(true);
                return;
            }
        }
        // No refresher: reload the same URL, cache-busted.
        setCurrentSrc(`${src}${src.includes('?') ? '&' : '?'}retry=${Date.now()}`);
    };

    useEffect(() => {
        const track = Array.from(videoRef.current?.textTracks ?? []).find(
            (t) => t.language === activeCaptions,
        );
        if (!track) {
            setCue('');
            return;
        }
        const read = () =>
            setCue(
                Array.from(track.activeCues ?? [])
                    .map((c) => (c as VTTCue).text ?? '')
                    .join('\n'),
            );
        read();
        track.addEventListener?.('cuechange', read);
        return () => track.removeEventListener?.('cuechange', read);
    }, [activeCaptions, duration]);

    useEffect(() => {
        const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current);
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    // End-screen countdown: one step per second, the last step starts the next lesson.
    useEffect(() => {
        if (countdown === null || !next) return;
        const t = window.setTimeout(() => {
            if (countdown <= 1) {
                setCountdown(null);
                next.onPlay();
            } else setCountdown(countdown - 1);
        }, 1000);
        return () => window.clearTimeout(t);
    }, [countdown, next]);

    // ---- touch: tap shows controls, double-tap the sides skips -----------------------
    const onSurfacePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        rootRef.current?.focus({ preventScroll: true });
        if (event.pointerType === 'mouse') {
            toggle();
            return;
        }
        const now = Date.now();
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const prev = lastTap.current;
        lastTap.current = { t: now, x };
        if (prev && now - prev.t < 300 && Math.abs(prev.x - x) < 60) {
            const rtl = rootRef.current?.closest('[dir=rtl]') !== null;
            const left = x < rect.width / 3;
            const right = x > (rect.width * 2) / 3;
            if (left || right) {
                const forward = right !== rtl;
                run({ type: 'seekBy', seconds: forward ? 10 : -10 });
                setRipple({ side: forward ? 'forward' : 'back', key: now });
                lastTap.current = null;
                return;
            }
        }
        if (active && playing) setActive(false);
        else wake();
    };

    // ---- render -----------------------------------------------------------------
    const currentChapter = chapterAt(chapters, time);
    const listChapters = (showChapterList ?? chapters.length > 0) && chapters.length > 0;
    const pct = (t: number) => (duration > 0 ? `${Math.min(100, (t / duration) * 100)}%` : '0%');
    const VolumeIcon =
        prefs.muted || prefs.volume === 0 ? VolumeX : prefs.volume < 0.5 ? Volume1 : Volume2;
    const controlButton =
        'text-video-foreground hover:bg-video-foreground/15 hover:text-video-foreground focus-visible:ring-video-foreground aria-expanded:bg-video-foreground/15';

    return (
        <div className={cn('space-y-3', className)}>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- keys and pointer wake the controls; every action also has a real button */}
            <div
                ref={(el) => {
                    rootRef.current = el;
                    setRoot(el);
                }}
                role="region"
                aria-label={title}
                // Focusable, so its keyboard shortcuts work — and only while it
                // has focus (WCAG 2.1.4). Clicking the video focuses it too.
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex={0}
                onKeyDown={onKeyDown}
                onPointerMove={wake}
                onFocus={wake}
                className={cn(
                    'group/player relative isolate aspect-video w-full overflow-hidden rounded-xl bg-video-surface text-video-foreground shadow-lg',
                    fullscreen && 'rounded-none',
                    !controlsVisible && 'cursor-none',
                )}
            >
                {/* eslint-disable-next-line jsx-a11y/media-has-caption -- tracks are rendered from `captions` below */}
                <video
                    key={currentSrc}
                    ref={videoRef}
                    src={currentSrc}
                    poster={poster}
                    aria-label={title}
                    playsInline
                    preload="metadata"
                    className="h-full w-full"
                    onLoadedMetadata={onLoadedMetadata}
                    onDurationChange={() =>
                        setDuration(
                            video()?.duration && Number.isFinite(video()!.duration)
                                ? video()!.duration
                                : 0,
                        )
                    }
                    onTimeUpdate={onTimeUpdate}
                    onProgress={() => {
                        const v = video();
                        if (v?.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1));
                    }}
                    onPlay={() => {
                        setPlaying(true);
                        setStarted(true);
                        setEnded(false);
                        setCountdown(null);
                        announce(labels.announce.playing);
                        wake();
                    }}
                    onPause={() => {
                        setPlaying(false);
                        setActive(true);
                        report(true);
                        if (!video()?.ended) announce(labels.announce.paused);
                    }}
                    onWaiting={() => setWaiting(true)}
                    onPlaying={() => setWaiting(false)}
                    onCanPlay={() => setWaiting(false)}
                    onEnded={onEnded}
                    onError={() => void onError()}
                >
                    {captions.map((c) => (
                        <track
                            key={c.src}
                            kind="captions"
                            src={c.src}
                            srcLang={c.srcLang}
                            label={c.label}
                        />
                    ))}
                </video>

                {/* Click/tap surface under the controls. */}
                {!failed && !ended && (
                    <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        onPointerUp={onSurfacePointerUp}
                    />
                )}

                {waiting && !failed && (
                    <div
                        role="status"
                        className="pointer-events-none absolute inset-0 flex items-center justify-center"
                    >
                        <Loader2
                            aria-hidden="true"
                            className="size-12 animate-spin text-video-foreground/90"
                        />
                        <span className="sr-only">{labels.loading}</span>
                    </div>
                )}

                {ripple && (
                    <div
                        key={ripple.key}
                        aria-hidden="true"
                        onAnimationEnd={() => setRipple(null)}
                        className={cn(
                            'pointer-events-none absolute inset-y-0 flex w-1/3 animate-out items-center justify-center bg-video-foreground/10 text-sm font-semibold duration-500 fade-out',
                            ripple.side === 'back'
                                ? 'start-0 rounded-e-full'
                                : 'end-0 rounded-s-full',
                        )}
                    >
                        {labels.skipped(ripple.side === 'back' ? -10 : 10)}
                    </div>
                )}

                {!playing && !failed && !ended && !waiting && (
                    <button
                        type="button"
                        onClick={() => {
                            play();
                            // This button disappears once playing: keep focus in the
                            // player so its keyboard shortcuts keep working.
                            rootRef.current?.focus({ preventScroll: true });
                        }}
                        aria-label={labels.play}
                        className="absolute top-1/2 left-1/2 flex size-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform outline-none hover:scale-105 focus-visible:ring-4 focus-visible:ring-video-foreground"
                    >
                        <Play aria-hidden="true" className="size-8 translate-x-0.5 fill-current" />
                    </button>
                )}

                {ended && !failed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-video-scrim p-6 text-center">
                        {next ? (
                            <>
                                <p className="text-sm text-video-foreground/80">{labels.upNext}</p>
                                <p className="text-xl font-semibold">{next.title}</p>
                                {countdown !== null && (
                                    <p role="timer" className="text-sm text-video-foreground/80">
                                        {labels.startsIn(countdown)}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => (setCountdown(null), next.onPlay())}
                                    >
                                        <SkipForward aria-hidden="true" />
                                        {labels.playNext}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className={controlButton}
                                        onClick={() => (
                                            setCountdown(null),
                                            seekTo(0, false),
                                            play()
                                        )}
                                    >
                                        <RotateCcw aria-hidden="true" />
                                        {labels.replay}
                                    </Button>
                                    {countdown !== null && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className={controlButton}
                                            onClick={() => setCountdown(null)}
                                        >
                                            {labels.cancel}
                                        </Button>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Button type="button" onClick={() => (seekTo(0, false), play())}>
                                <RotateCcw aria-hidden="true" />
                                {labels.replay}
                            </Button>
                        )}
                    </div>
                )}

                {failed && (
                    <div
                        role="alert"
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-video-scrim p-6 text-center"
                    >
                        <AlertTriangle aria-hidden="true" className="size-8" />
                        <p className="font-semibold">{labels.errorTitle}</p>
                        <p className="max-w-sm text-sm text-video-foreground/80">
                            {labels.errorBody}
                        </p>
                        <Button type="button" onClick={() => void retry()}>
                            <RotateCw aria-hidden="true" />
                            {labels.retry}
                        </Button>
                    </div>
                )}

                {/* Controls: shown while paused, on activity, and whenever focus is inside. */}
                {started && !failed && (
                    <div
                        data-visible={controlsVisible}
                        className={cn(
                            'absolute inset-x-0 bottom-0 bg-linear-to-t from-video-scrim via-video-scrim/60 to-transparent px-3 pt-10 pb-2 transition-opacity duration-200',
                            'opacity-100 group-focus-within/player:opacity-100 data-[visible=false]:opacity-0',
                        )}
                    >
                        <Timeline
                            time={time}
                            duration={duration}
                            buffered={buffered}
                            chapters={chapters}
                            labels={labels}
                            hover={hover}
                            onHover={setHover}
                            onSeek={(t) => seekTo(t, false)}
                            onSeekEnd={(t) =>
                                announce(labels.announce.seeked(formatTime(t, duration)))
                            }
                            pct={pct}
                        />
                        <div className="mt-1 flex items-center gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={controlButton}
                                aria-label={playing ? labels.pause : labels.play}
                                aria-keyshortcuts="k"
                                onClick={toggle}
                            >
                                {playing ? (
                                    <Pause aria-hidden="true" className="fill-current" />
                                ) : (
                                    <Play aria-hidden="true" className="fill-current" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={controlButton}
                                aria-label={labels.back10}
                                aria-keyshortcuts="j"
                                onClick={() => run({ type: 'seekBy', seconds: -10 })}
                            >
                                <RotateCcw aria-hidden="true" className="rtl:-scale-x-100" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={controlButton}
                                aria-label={labels.forward10}
                                aria-keyshortcuts="l"
                                onClick={() => run({ type: 'seekBy', seconds: 10 })}
                            >
                                <RotateCw aria-hidden="true" className="rtl:-scale-x-100" />
                            </Button>
                            <div className="group/vol flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={controlButton}
                                    aria-label={prefs.muted ? labels.unmute : labels.mute}
                                    aria-keyshortcuts="m"
                                    onClick={toggleMute}
                                >
                                    <VolumeIcon aria-hidden="true" />
                                </Button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={prefs.muted ? 0 : prefs.volume}
                                    aria-label={labels.volume}
                                    aria-valuetext={`${Math.round((prefs.muted ? 0 : prefs.volume) * 100)} %`}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    className="h-1 w-0 cursor-pointer accent-video-foreground opacity-0 transition-all group-hover/vol:w-20 group-hover/vol:opacity-100 focus-visible:w-20 focus-visible:opacity-100 pointer-coarse:hidden"
                                />
                            </div>
                            <span
                                className="ms-2 text-sm text-video-foreground/90 tabular-nums"
                                dir="ltr"
                            >
                                {formatTime(time, duration)} / {formatTime(duration, duration)}
                            </span>
                            {currentChapter && (
                                <span className="ms-3 hidden min-w-0 truncate text-sm text-video-foreground/80 sm:inline">
                                    · {currentChapter.title}
                                </span>
                            )}
                            <span className="flex-1" />
                            {captions.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        controlButton,
                                        activeCaptions && 'bg-video-foreground/15',
                                    )}
                                    aria-label={labels.captions}
                                    aria-pressed={activeCaptions !== null}
                                    aria-keyshortcuts="c"
                                    onClick={() => run({ type: 'captions' })}
                                >
                                    <Captions aria-hidden="true" />
                                </Button>
                            )}
                            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={controlButton}
                                        aria-label={labels.settings}
                                    >
                                        <Settings aria-hidden="true" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    align="end"
                                    container={root}
                                    className="w-48"
                                >
                                    <DropdownMenuLabel>{labels.speed}</DropdownMenuLabel>
                                    <DropdownMenuRadioGroup
                                        value={String(prefs.rate)}
                                        onValueChange={(v) => setRate(Number(v))}
                                    >
                                        {speeds.map((r) => (
                                            <DropdownMenuRadioItem key={r} value={String(r)}>
                                                {labels.speedValue(r)}
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                    {captions.length > 0 && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel>{labels.captions}</DropdownMenuLabel>
                                            <DropdownMenuRadioGroup
                                                value={activeCaptions ?? ''}
                                                onValueChange={(v) => setCaptions(v || null)}
                                            >
                                                <DropdownMenuRadioItem value="">
                                                    {labels.captionsOff}
                                                </DropdownMenuRadioItem>
                                                {captions.map((c) => (
                                                    <DropdownMenuRadioItem
                                                        key={c.srcLang}
                                                        value={c.srcLang}
                                                    >
                                                        {c.label}
                                                    </DropdownMenuRadioItem>
                                                ))}
                                            </DropdownMenuRadioGroup>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {typeof document !== 'undefined' &&
                                'pictureInPictureEnabled' in document &&
                                document.pictureInPictureEnabled && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={controlButton}
                                        aria-label={labels.pictureInPicture}
                                        onClick={() => void togglePip()}
                                    >
                                        <PictureInPicture2 aria-hidden="true" />
                                    </Button>
                                )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={controlButton}
                                aria-label={fullscreen ? labels.exitFullscreen : labels.fullscreen}
                                aria-keyshortcuts="f"
                                onClick={() => void toggleFullscreen()}
                            >
                                {fullscreen ? (
                                    <Minimize aria-hidden="true" />
                                ) : (
                                    <Maximize aria-hidden="true" />
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {activeCaptions && cue && (
                    <div
                        data-caption=""
                        className={cn(
                            'pointer-events-none absolute inset-x-0 flex justify-center px-6 transition-[bottom] duration-200',
                            controlsVisible && started ? 'bottom-24' : 'bottom-6',
                        )}
                    >
                        <p
                            lang={activeCaptions}
                            className="max-w-[90%] rounded-md bg-video-scrim px-3 py-1 text-center text-base leading-snug whitespace-pre-line sm:text-lg md:text-xl"
                        >
                            {cue}
                        </p>
                    </div>
                )}

                <div role="status" aria-live="polite" className="sr-only">
                    {announcement}
                </div>
            </div>

            {listChapters && (
                <nav aria-labelledby={`${baseId}-chapters`}>
                    <h2 id={`${baseId}-chapters`} className="mb-1 text-sm font-semibold">
                        {labels.chapters}
                    </h2>
                    <ol className="divide-y divide-border rounded-lg border border-border">
                        {[...chapters]
                            .sort((a, b) => a.start - b.start)
                            .map((c) => {
                                const current = currentChapter?.start === c.start;
                                return (
                                    <li key={c.start}>
                                        <button
                                            type="button"
                                            aria-current={current ? 'true' : undefined}
                                            onClick={() => {
                                                seekTo(c.start);
                                                play();
                                            }}
                                            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-[current=true]:bg-muted aria-[current=true]:font-medium"
                                        >
                                            <span
                                                className="w-14 shrink-0 text-muted-foreground tabular-nums"
                                                dir="ltr"
                                            >
                                                {formatTime(c.start, duration)}
                                            </span>
                                            <span className="min-w-0 truncate">{c.title}</span>
                                        </button>
                                    </li>
                                );
                            })}
                    </ol>
                </nav>
            )}
        </div>
    );
}

/** The timeline: buffered range, progress, chapter segments, hover preview. */
function Timeline({
    time,
    duration,
    buffered,
    chapters,
    labels,
    hover,
    onHover,
    onSeek,
    onSeekEnd,
    pct,
}: {
    time: number;
    duration: number;
    buffered: number;
    chapters: Chapter[];
    labels: VideoPlayerLabels;
    hover: { x: number; time: number } | null;
    onHover: (h: { x: number; time: number } | null) => void;
    onSeek: (t: number) => void;
    onSeekEnd: (t: number) => void;
    pct: (t: number) => string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const at = (clientX: number) => {
        const rect = ref.current!.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        return { x, time: rect.width > 0 ? (x / rect.width) * duration : 0 };
    };
    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step: Record<string, number> = {
            ArrowLeft: -5,
            ArrowRight: 5,
            PageDown: -30,
            PageUp: 30,
        };
        let target: number | null = null;
        if (event.key in step) target = time + step[event.key]!;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = duration;
        if (target === null) return;
        event.preventDefault();
        event.stopPropagation();
        const t = Math.max(0, Math.min(duration, target));
        onSeek(t);
        onSeekEnd(t);
    };
    const sorted = [...chapters]
        .sort((a, b) => a.start - b.start)
        .filter((c) => c.start > 0 && c.start < duration);
    const hoverChapter = hover ? chapterAt(chapters, hover.time) : null;

    return (
        // Time runs left to right in every language (as in every major player).
        <div dir="ltr" className="relative">
            {hover && duration > 0 && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-5 -translate-x-1/2 rounded-md bg-video-scrim px-2 py-1 text-center text-xs whitespace-nowrap shadow"
                    style={{ left: hover.x }}
                >
                    {hoverChapter && (
                        <div className="max-w-48 truncate font-medium">{hoverChapter.title}</div>
                    )}
                    <div className="tabular-nums">{formatTime(hover.time, duration)}</div>
                </div>
            )}
            <div
                ref={ref}
                role="slider"
                tabIndex={0}
                aria-label={labels.seek}
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={Math.round(time)}
                aria-valuetext={labels.timeOf(
                    formatTime(time, duration),
                    formatTime(duration, duration),
                )}
                onKeyDown={onKeyDown}
                onPointerDown={(e) => {
                    if (e.button !== 0 || duration <= 0) return;
                    dragging.current = true;
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    onSeek(at(e.clientX).time);
                }}
                onPointerMove={(e) => {
                    const h = at(e.clientX);
                    onHover(h);
                    if (dragging.current) onSeek(h.time);
                }}
                onPointerUp={(e) => {
                    if (!dragging.current) return;
                    dragging.current = false;
                    onSeekEnd(at(e.clientX).time);
                }}
                onPointerLeave={() => onHover(null)}
                className="group/tl relative flex h-4 cursor-pointer items-center rounded outline-none focus-visible:ring-2 focus-visible:ring-video-foreground"
            >
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-video-foreground/20 transition-[height] group-hover/tl:h-1.5">
                    <div
                        className="absolute inset-y-0 left-0 bg-video-foreground/40"
                        style={{ width: pct(buffered) }}
                    />
                    {/* On-video white, not the brand colour: a dark school colour vanishes on video. */}
                    <div
                        className="absolute inset-y-0 left-0 bg-video-foreground"
                        style={{ width: pct(time) }}
                    />
                    {/* Chapter boundaries: a gap in the track, as on YouTube. */}
                    {sorted.map((c) => (
                        <div
                            key={c.start}
                            className="absolute inset-y-0 w-0.5 bg-video-scrim"
                            style={{ left: pct(c.start) }}
                        />
                    ))}
                </div>
                <div
                    aria-hidden="true"
                    className="absolute size-3 -translate-x-1/2 scale-0 rounded-full bg-video-foreground shadow transition-transform group-hover/tl:scale-100 group-focus-visible/tl:scale-100"
                    style={{ left: pct(time) }}
                />
            </div>
        </div>
    );
}
