export type WatchedRange = [start: number, end: number];
export interface Chapter {
    /** Seconds from the start. */
    start: number;
    title: string;
}
/** `m:ss`, or `h:mm:ss` from an hour — or when the whole video is that long, so widths match. */
export declare function formatTime(seconds: number, duration?: number): string;
/** Add a watched span, merging it with every span it overlaps or touches. */
export declare function addWatched(ranges: WatchedRange[], [start, end]: WatchedRange): WatchedRange[];
/** The share of the video actually seen, 0–1. Seeking to the end adds nothing. */
export declare function watchedFraction(ranges: WatchedRange[], duration: number): number;
/** The chapter a time falls in, or null before the first. */
export declare function chapterAt(chapters: Chapter[], time: number): Chapter | null;
export type PlayerCommand = {
    type: 'toggle';
} | {
    type: 'seekBy';
    seconds: number;
} | {
    type: 'seekTo';
    fraction: number;
} | {
    type: 'volumeBy';
    delta: number;
} | {
    type: 'mute';
} | {
    type: 'fullscreen';
} | {
    type: 'captions';
} | {
    type: 'speedBy';
    step: 1 | -1;
};
/**
 * The player's keys, as on YouTube: Space/K play, J/L ±10 s, ←/→ ±5 s, ↑/↓
 * volume, M mute, F fullscreen, C captions, 0–9 jump to 0–90 %, Home/End,
 * </> speed. Anything with Ctrl, ⌘ or Alt belongs to the browser.
 */
export declare function keyToCommand(event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>): PlayerCommand | null;
