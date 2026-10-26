/** Where a meeting recording stands. */
export type RecordingState = 'scheduled' | 'recording' | 'processing' | 'available' | 'failed' | 'none' | 'deleting' | 'deleted' | 'unknown';
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
export declare function RecordingIndicator({ state, labels, className }: RecordingIndicatorProps): import("react").JSX.Element;
