export interface PollDraft {
    question: string;
    answers: string[];
}
export interface PollComposerLabels {
    question: string;
    /** "Antwort 1". */
    answer: (n: number) => string;
    addAnswer: string;
    removeAnswer: string;
    start: string;
    /** Busy label while starting. */
    starting?: string;
    /** Shown when two answers are the same. */
    duplicate?: string;
}
export interface PollComposerProps {
    /** The draft, if you keep it (so it survives closing the panel). Uncontrolled otherwise. */
    draft?: PollDraft;
    onDraftChange?: (draft: PollDraft) => void;
    /** Start the poll with the trimmed question and answers. */
    onStart: (draft: PollDraft) => void;
    labels: PollComposerLabels;
    busy?: boolean;
    /** Default 2. */
    minAnswers?: number;
    /** Default 5. */
    maxAnswers?: number;
    /** Default 200 characters. */
    maxQuestionLength?: number;
    /** Default 100 characters. */
    maxAnswerLength?: number;
    className?: string;
}
/**
 * The form a host uses to start a quick poll in a meeting: a question and two to five
 * answers. The start button waits until the question and every answer are filled in and
 * no two answers are the same. Keep the draft in the app (`draft` + `onDraftChange`) to
 * let it survive closing the panel.
 *
 * @summary Start-a-poll form: a question and 2–5 distinct answers.
 */
export declare function PollComposer({ draft: draftProp, onDraftChange, onStart, labels, busy, minAnswers, maxAnswers, maxQuestionLength, maxAnswerLength, className, }: PollComposerProps): import("react").JSX.Element;
export interface PollOption {
    id: string;
    label: string;
}
export interface PollBallotLabels {
    /** "12 Stimmen abgegeben". */
    votes: (count: number) => string;
    /** "Noch 1:24" — receives seconds left. */
    remaining?: (seconds: number) => string;
    vote: string;
    /** "Eine abgegebene Stimme kann nicht geändert werden." */
    final?: string;
    /** "Deine Antwort: Ja". */
    yourVote: (answer: string) => string;
    /** For leaders: "Abstimmung schließen". */
    close?: string;
}
export interface PollBallotProps {
    question: string;
    options: PollOption[];
    totalVotes: number;
    /** Seconds until it closes on its own. */
    remainingSeconds?: number;
    /** The id you voted for. Then the ballot shows your answer instead of the choice. */
    votedFor?: string;
    onVote?: (id: string) => void;
    /** Shows the close button (leaders). */
    onClose?: () => void;
    busy?: boolean;
    labels: PollBallotLabels;
    className?: string;
}
/**
 * A running poll: the question, the answers as a radio choice, how many have voted and how
 * long is left. After voting, the person sees their answer (a vote cannot change). A host
 * also sees "close poll"; give `onVote` only to those who may vote.
 *
 * @summary Running poll: pick one answer, see vote count and time left; hosts can close it.
 */
export declare function PollBallot({ question, options, totalVotes, remainingSeconds, votedFor, onVote, onClose, busy, labels, className, }: PollBallotProps): import("react").JSX.Element;
export interface PollResult extends PollOption {
    votes: number;
}
export interface PollResultsLabels {
    /** "12 Stimmen". */
    votes: (count: number) => string;
    /** Shown above the bars, e.g. "Ergebnis". */
    heading?: string;
    /** Leaders: "Neue Abstimmung". */
    newPoll?: string;
}
export interface PollResultsProps {
    question: string;
    results: PollResult[];
    /** Mark this answer as your own. */
    votedFor?: string;
    onNewPoll?: () => void;
    labels: PollResultsLabels;
    /** Format a share, default `Math.round(x * 100) + ' %'`. */
    formatShare?: (share: number) => string;
    className?: string;
}
/**
 * A closed poll's result: each answer with its votes as a bar and a share, the leading
 * answer emphasised, your own answer marked. Votes are counts only — nobody sees who voted
 * what. A host gets "new poll".
 *
 * @summary Closed poll result: a bar, count and share per answer, leader emphasised.
 */
export declare function PollResults({ question, results, votedFor, onNewPoll, labels, formatShare, className, }: PollResultsProps): import("react").JSX.Element;
