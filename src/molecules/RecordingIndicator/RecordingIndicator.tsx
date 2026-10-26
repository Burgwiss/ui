import { cn } from '../../lib/cn';

/** Where a meeting recording stands. */
export type RecordingState =
    | 'scheduled'
    | 'recording'
    | 'processing'
    | 'available'
    | 'failed'
    | 'none'
    | 'deleting'
    | 'deleted'
    | 'unknown';

const TONE: Record<RecordingState, string> = {
    recording: 'border-destructive/30 bg-destructive/10 text-destructive-tint-foreground',
    failed: 'border-destructive/30 bg-destructive/10 text-destructive-tint-foreground',
    scheduled: 'border-border bg-card text-foreground',
    processing: 'border-border bg-card text-foreground',
    available: 'border-success/30 bg-success/10 text-success-tint-foreground',
    none: 'border-border bg-muted text-muted-foreground',
    deleting: 'border-border bg-muted text-muted-foreground',
    deleted: 'border-border bg-muted text-muted-foreground',
    unknown: 'border-border bg-muted text-muted-foreground',
};

export interface RecordingIndicatorProps {
    state: RecordingState;
    /** The text for each state, in the app's language ("Aufnahme läuft"). A state without a label renders nothing. */
    labels: Partial<Record<RecordingState, string>>;
    className?: string;
}

/**
 * Tells everyone in a meeting whether it is being recorded — a pill with a pulsing red
 * dot while recording, so nobody can miss that they are on tape, and a calm pill for the
 * other states (scheduled, processing, available, failed). It is a polite live region:
 * when recording starts or stops, a screen reader hears it.
 *
 * Give `labels` only for the states you want to show; `disabled` meetings simply pass no
 * label. Put it in `MeetingHeader`'s `status` and in the lobby.
 *
 * @summary Recording status pill; pulses red while recording and announces changes.
 */
export function RecordingIndicator({ state, labels, className }: RecordingIndicatorProps) {
    const label = labels[state];
    return (
        <span role="status" className="inline-flex">
            {label && (
                <span
                    data-state={state}
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
                        TONE[state],
                        className,
                    )}
                >
                    {(state === 'recording' || state === 'scheduled') && (
                        <span aria-hidden="true" className="relative flex size-2">
                            {state === 'recording' && (
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-60 motion-reduce:animate-none" />
                            )}
                            <span
                                className={cn(
                                    'relative inline-flex size-2 rounded-full',
                                    state === 'recording'
                                        ? 'bg-destructive'
                                        : 'bg-muted-foreground',
                                )}
                            />
                        </span>
                    )}
                    {label}
                </span>
            )}
        </span>
    );
}
