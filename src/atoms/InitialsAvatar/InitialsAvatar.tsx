import { cn } from '../../lib/cn';
import { getInitials } from '../../lib/initials';

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

const SIZES: Record<NonNullable<InitialsAvatarProps['size']>, string> = {
    sm: 'size-9 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-12 text-base',
};

/** Deterministic hue (0–359) from a name — stable across renders + SSR. */
function hueFromName(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
        hash = (hash * 31 + name.charCodeAt(i)) % 360;
    }
    return hash;
}

/**
 * A round badge with a person's initials, for when there is no photo (list rows,
 * message threads, score tables). Give it the full `name`; it derives the initials and,
 * with `colored`, a stable per-name tint. It is decorative (`aria-hidden`), so always
 * show the name as text next to it. When you do have an image use `Avatar`.
 * SSR-safe (no window/document). With `colored`, the disc takes a soft per-name
 * tint + a darker same-hue text: contrast comes from the fixed lightness gap
 * (90 vs 30), so it stays AA-legible for every hue without depending on the
 * theme. Decorative — the visible name carries the meaning, so it's
 * `aria-hidden`.
 *
 * @summary Round initials badge for a person without a photo; decorative, so show the name beside it.
 */
export function InitialsAvatar({
    name,
    size = 'md',
    colored = false,
    className,
}: InitialsAvatarProps) {
    const tint = colored
        ? (() => {
              const hue = hueFromName(name);
              return { backgroundColor: `hsl(${hue} 60% 90%)`, color: `hsl(${hue} 55% 30%)` };
          })()
        : undefined;

    return (
        <div
            aria-hidden="true"
            data-testid="initials-avatar"
            style={tint}
            className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none',
                !colored && 'bg-muted text-foreground',
                SIZES[size],
                className,
            )}
        >
            {getInitials(name)}
        </div>
    );
}
