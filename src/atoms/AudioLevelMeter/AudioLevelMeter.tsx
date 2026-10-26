import { cn } from '../../lib/cn';

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
export function AudioLevelMeter({ level, label, segments = 12, className }: AudioLevelMeterProps) {
    const value = Math.round(Math.min(1, Math.max(0, Number.isFinite(level) ? level : 0)) * 100);
    const lit = Math.round((value / 100) * segments);
    return (
        <div
            role="meter"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            className={cn('flex h-2 w-full items-stretch gap-0.5', className)}
        >
            {Array.from({ length: segments }, (_, i) => (
                <span
                    key={i}
                    aria-hidden="true"
                    className={cn(
                        'flex-1 rounded-full transition-colors duration-75',
                        i < lit ? 'bg-success' : 'bg-muted',
                    )}
                />
            ))}
        </div>
    );
}
