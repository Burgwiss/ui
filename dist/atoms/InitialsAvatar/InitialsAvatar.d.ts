export interface InitialsAvatarProps {
    /** Full name; the first + last initial are derived from it. */
    name: string;
    /**
     * Visual size. `sm` for dense list rows, `md` (default) for the standard
     * student/message row, `lg` for headers.
     */
    size?: 'sm' | 'md' | 'lg';
    /**
     * When true, derive a soft per-name background + matching text colour
     * (seeded by the name, so the same person is always the same colour). Off
     * by default → neutral muted disc.
     */
    colored?: boolean;
    /** Extra classes merged onto the disc (e.g. a margin). */
    className?: string;
}
/**
 * A round badge with a person's initials, for when there is no photo (list rows,
 * message threads, score tables). Give it the full `name`; it derives the initials and,
 * with `colored`, a stable per-name tint. It is decorative (`aria-hidden`), so always
 * show the name as text next to it. When you do have an image use `Avatar`.
 * SSR-safe (no window/document). With `colored`, the disc takes a soft per-name
 * tint + a darker same-hue text: contrast comes from the fixed lightness gap
 * (90 vs 26: at least 5.3:1 for every hue — 30 gave 4.27:1 at yellow-green, hue 60), so it stays AA-legible for every hue without depending on the
 * theme. Decorative — the visible name carries the meaning, so it's
 * `aria-hidden`.
 *
 * @summary Round initials badge for a person without a photo; decorative, so show the name beside it.
 */
/** The disc and text colours for one hue — exported so a test can check every hue. */
export declare function avatarTint(hue: number): {
    backgroundColor: string;
    color: string;
};
export declare function InitialsAvatar({ name, size, colored, className, }: InitialsAvatarProps): import("react").JSX.Element;
