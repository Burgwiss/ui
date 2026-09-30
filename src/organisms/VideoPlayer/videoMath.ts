/*
 * The video player's pure parts: time text, what was actually watched,
 * chapters, and which key does what. No DOM, so they are tested on their own.
 */

export type WatchedRange = [start: number, end: number];

export interface Chapter {
    /** Seconds from the start. */
    start: number;
    title: string;
}

/** `m:ss`, or `h:mm:ss` from an hour — or when the whole video is that long, so widths match. */
export function formatTime(seconds: number, duration = 0): string {
    const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = String(s % 60).padStart(2, '0');
    if (h > 0 || duration >= 3600) return `${h}:${String(m).padStart(2, '0')}:${sec}`;
    return `${m}:${sec}`;
}

/** Add a watched span, merging it with every span it overlaps or touches. */
export function addWatched(ranges: WatchedRange[], [start, end]: WatchedRange): WatchedRange[] {
    if (!(end > start)) return ranges;
    const all = [...ranges, [start, end] as WatchedRange].sort((a, b) => a[0] - b[0]);
    const out: WatchedRange[] = [];
    for (const [s, e] of all) {
        const last = out[out.length - 1];
        if (last && s <= last[1]) last[1] = Math.max(last[1], e);
        else out.push([s, e]);
    }
    return out;
}

/** The share of the video actually seen, 0–1. Seeking to the end adds nothing. */
export function watchedFraction(ranges: WatchedRange[], duration: number): number {
    if (!(duration > 0)) return 0;
    const seen = ranges.reduce(
        (sum, [s, e]) => sum + Math.max(0, Math.min(e, duration) - Math.max(s, 0)),
        0,
    );
    return Math.min(1, seen / duration);
}

/** The chapter a time falls in, or null before the first. */
export function chapterAt(chapters: Chapter[], time: number): Chapter | null {
    let found: Chapter | null = null;
    for (const c of [...chapters].sort((a, b) => a.start - b.start)) {
        if (c.start <= time) found = c;
        else break;
    }
    return found;
}

export type PlayerCommand =
    | { type: 'toggle' }
    | { type: 'seekBy'; seconds: number }
    | { type: 'seekTo'; fraction: number }
    | { type: 'volumeBy'; delta: number }
    | { type: 'mute' }
    | { type: 'fullscreen' }
    | { type: 'captions' }
    | { type: 'speedBy'; step: 1 | -1 };

/**
 * The player's keys, as on YouTube: Space/K play, J/L ±10 s, ←/→ ±5 s, ↑/↓
 * volume, M mute, F fullscreen, C captions, 0–9 jump to 0–90 %, Home/End,
 * </> speed. Anything with Ctrl, ⌘ or Alt belongs to the browser.
 */
export function keyToCommand(
    event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>,
): PlayerCommand | null {
    if (event.ctrlKey || event.metaKey || event.altKey) return null;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    switch (key) {
        case ' ':
        case 'k':
            return { type: 'toggle' };
        case 'j':
            return { type: 'seekBy', seconds: -10 };
        case 'l':
            return { type: 'seekBy', seconds: 10 };
        case 'ArrowLeft':
            return { type: 'seekBy', seconds: -5 };
        case 'ArrowRight':
            return { type: 'seekBy', seconds: 5 };
        case 'ArrowUp':
            return { type: 'volumeBy', delta: 0.1 };
        case 'ArrowDown':
            return { type: 'volumeBy', delta: -0.1 };
        case 'm':
            return { type: 'mute' };
        case 'f':
            return { type: 'fullscreen' };
        case 'c':
            return { type: 'captions' };
        case 'Home':
            return { type: 'seekTo', fraction: 0 };
        case 'End':
            return { type: 'seekTo', fraction: 1 };
        case '>':
            return { type: 'speedBy', step: 1 };
        case '<':
            return { type: 'speedBy', step: -1 };
    }
    if (/^[0-9]$/.test(key)) return { type: 'seekTo', fraction: Number(key) / 10 };
    return null;
}
