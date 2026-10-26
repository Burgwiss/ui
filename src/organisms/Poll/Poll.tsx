import { Minus, Plus, Timer } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';

import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { RadioGroup, RadioGroupItem } from '../../atoms/RadioGroup';
import { cn } from '../../lib/cn';

// ---------------------------------------------------------------------------
// Composer
// ---------------------------------------------------------------------------

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
export function PollComposer({
    draft: draftProp,
    onDraftChange,
    onStart,
    labels,
    busy = false,
    minAnswers = 2,
    maxAnswers = 5,
    maxQuestionLength = 200,
    maxAnswerLength = 100,
    className,
}: PollComposerProps) {
    const [own, setOwn] = useState<PollDraft>(() => ({
        question: '',
        answers: Array.from({ length: Math.max(2, minAnswers) }, () => ''),
    }));
    const draft = draftProp ?? own;
    const set = (next: PollDraft) => {
        setOwn(next);
        onDraftChange?.(next);
    };
    const id = useId();
    const trimmed = draft.answers.map((a) => a.trim());
    const lower = trimmed.map((a) => a.toLocaleLowerCase());
    const duplicate = lower.some((a, i) => a && lower.indexOf(a) !== i);
    const ready = draft.question.trim() !== '' && trimmed.every(Boolean) && !duplicate;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (ready && !busy) onStart({ question: draft.question.trim(), answers: trimmed });
    };

    return (
        <form onSubmit={submit} className={cn('space-y-4', className)}>
            <div className="space-y-1.5">
                <Label htmlFor={`${id}-q`}>{labels.question}</Label>
                <Input
                    id={`${id}-q`}
                    value={draft.question}
                    maxLength={maxQuestionLength}
                    onChange={(e) => set({ ...draft, question: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                {draft.answers.map((answer, i) => (
                    <div key={i} className="space-y-1.5">
                        <Label htmlFor={`${id}-a${i}`}>{labels.answer(i + 1)}</Label>
                        <Input
                            id={`${id}-a${i}`}
                            value={answer}
                            maxLength={maxAnswerLength}
                            aria-invalid={
                                duplicate && lower.indexOf(lower[i]!) !== i ? true : undefined
                            }
                            onChange={(e) =>
                                set({
                                    ...draft,
                                    answers: draft.answers.map((a, j) =>
                                        j === i ? e.target.value : a,
                                    ),
                                })
                            }
                        />
                    </div>
                ))}
                {duplicate && labels.duplicate && (
                    <p role="alert" className="text-sm text-destructive-tint-foreground">
                        {labels.duplicate}
                    </p>
                )}
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={draft.answers.length >= maxAnswers}
                        onClick={() => set({ ...draft, answers: [...draft.answers, ''] })}
                    >
                        <Plus aria-hidden="true" />
                        {labels.addAnswer}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={draft.answers.length <= minAnswers}
                        onClick={() => set({ ...draft, answers: draft.answers.slice(0, -1) })}
                    >
                        <Minus aria-hidden="true" />
                        {labels.removeAnswer}
                    </Button>
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={!ready || busy}>
                {busy && labels.starting ? labels.starting : labels.start}
            </Button>
        </form>
    );
}

// ---------------------------------------------------------------------------
// Ballot
// ---------------------------------------------------------------------------

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
export function PollBallot({
    question,
    options,
    totalVotes,
    remainingSeconds,
    votedFor,
    onVote,
    onClose,
    busy = false,
    labels,
    className,
}: PollBallotProps) {
    const [choice, setChoice] = useState('');
    const id = useId();
    const voted = options.find((o) => o.id === votedFor);
    return (
        <div className={cn('space-y-4', className)}>
            <div className="space-y-1">
                <h3 id={`${id}-q`} className="text-base font-semibold text-balance">
                    {question}
                </h3>
                <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground tabular-nums">
                    <span>{labels.votes(totalVotes)}</span>
                    {remainingSeconds !== undefined && labels.remaining && (
                        <span className="inline-flex items-center gap-1">
                            <Timer aria-hidden="true" className="size-3.5" />
                            {labels.remaining(remainingSeconds)}
                        </span>
                    )}
                </p>
            </div>
            {voted ? (
                <p className="rounded-lg bg-muted px-3 py-2 text-sm">
                    {labels.yourVote(voted.label)}
                </p>
            ) : (
                onVote && (
                    <form
                        className="space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (choice && !busy) onVote(choice);
                        }}
                    >
                        <RadioGroup
                            aria-labelledby={`${id}-q`}
                            value={choice}
                            onValueChange={setChoice}
                        >
                            {options.map((o) => (
                                <Label
                                    key={o.id}
                                    htmlFor={`${id}-${o.id}`}
                                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent"
                                >
                                    <RadioGroupItem id={`${id}-${o.id}`} value={o.id} />
                                    {o.label}
                                </Label>
                            ))}
                        </RadioGroup>
                        {labels.final && (
                            <p className="text-xs text-muted-foreground">{labels.final}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={!choice || busy}>
                            {labels.vote}
                        </Button>
                    </form>
                )
            )}
            {onClose && labels.close && (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={onClose}
                    disabled={busy}
                >
                    {labels.close}
                </Button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

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
export function PollResults({
    question,
    results,
    votedFor,
    onNewPoll,
    labels,
    formatShare = (x) => `${Math.round(x * 100)} %`,
    className,
}: PollResultsProps) {
    const total = results.reduce((n, r) => n + r.votes, 0);
    const top = Math.max(0, ...results.map((r) => r.votes));
    return (
        <div className={cn('space-y-4', className)}>
            <div className="space-y-1">
                {labels.heading && (
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {labels.heading}
                    </p>
                )}
                <h3 className="text-base font-semibold text-balance">{question}</h3>
                <p className="text-sm text-muted-foreground tabular-nums">{labels.votes(total)}</p>
            </div>
            <ul className="space-y-3">
                {results.map((r) => {
                    const share = total ? r.votes / total : 0;
                    const leading = total > 0 && r.votes === top;
                    return (
                        <li key={r.id} className="space-y-1">
                            <div className="flex items-baseline justify-between gap-2 text-sm">
                                <span className={cn('min-w-0', leading && 'font-semibold')}>
                                    {r.label}
                                    {r.id === votedFor && <span aria-hidden="true"> ✓</span>}
                                </span>
                                <span className="shrink-0 text-muted-foreground tabular-nums">
                                    {labels.votes(r.votes)} · {formatShare(share)}
                                </span>
                            </div>
                            <div
                                aria-hidden="true"
                                className="h-2 overflow-hidden rounded-full bg-muted"
                            >
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none',
                                        leading ? 'bg-primary' : 'bg-muted-foreground/50',
                                    )}
                                    style={{ width: `${share * 100}%` }}
                                />
                            </div>
                        </li>
                    );
                })}
            </ul>
            {onNewPoll && labels.newPoll && (
                <Button type="button" variant="outline" className="w-full" onClick={onNewPoll}>
                    {labels.newPoll}
                </Button>
            )}
        </div>
    );
}
