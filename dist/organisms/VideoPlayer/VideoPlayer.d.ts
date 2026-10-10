import { type Chapter, type WatchedRange } from './videoMath';
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
    captions?: {
        src: string;
        srcLang: string;
        label: string;
        default?: boolean;
    }[];
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
    next?: {
        title: string;
        onPlay: () => void;
        autoAdvanceSeconds?: number;
    };
    labels: VideoPlayerLabels;
    className?: string;
}
/** Storage key for a resume position. Exported so an app can clear it. */
export declare function videoResumeKey(resumeKey: string): string;
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
export declare function VideoPlayer(props: VideoPlayerProps): import("react").JSX.Element;
