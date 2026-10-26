export interface AudioLevelMeterProps {
    /** The current level, 0 (silence) to 1 (loud). Smooth it in the app: fast rise, slow fall. */
    level: number;
    /** Accessible name, e.g. "Mikrofonpegel". */
    label: string;
    /** Number of segments. Default 12. */
    segments?: number;
    className?: string;
}
/**
 * A microphone level meter: a row of segments that light up as someone speaks, so they
 * can see their microphone works before they join. It is a `meter` for assistive tech
 * (0–100), with the visual segments decorative. Keep the verdict ("Mikrofon funktioniert")
 * as text next to it — the bars alone are not an answer.
 *
 * @summary Segmented microphone level meter (role meter, 0–100).
 */
export declare function AudioLevelMeter({ level, label, segments, className }: AudioLevelMeterProps): import("react").JSX.Element;
