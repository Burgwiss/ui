import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    PollBallot,
    PollComposer,
    PollResults,
    type PollBallotLabels,
    type PollComposerLabels,
    type PollDraft,
    type PollResultsLabels,
} from './Poll';

const composerLabels: PollComposerLabels = {
    question: 'Frage',
    answer: (n) => `Antwort ${n}`,
    addAnswer: 'Antwort hinzufügen',
    removeAnswer: 'Antwort entfernen',
    start: 'Umfrage starten',
    starting: 'Wird gestartet …',
    duplicate: 'Antworten müssen sich unterscheiden.',
};

const ballotLabels: PollBallotLabels = {
    votes: (n) => `${n} Stimmen`,
    remaining: (s) => `noch ${s} s`,
    vote: 'Abstimmen',
    final: 'Deine Stimme ist endgültig.',
    yourVote: (answer) => `Deine Stimme: ${answer}`,
    close: 'Umfrage beenden',
};

const resultsLabels: PollResultsLabels = {
    votes: (n) => `${n} Stimmen`,
    heading: 'Ergebnis',
    newPoll: 'Neue Umfrage',
};

const start = () => screen.getByRole('button', { name: 'Umfrage starten' });
const add = () => screen.getByRole('button', { name: 'Antwort hinzufügen' });
const remove = () => screen.getByRole('button', { name: 'Antwort entfernen' });

async function fill(question: string, answers: string[]) {
    if (question) await userEvent.type(screen.getByLabelText('Frage'), question);
    for (const [i, a] of answers.entries()) {
        await userEvent.type(screen.getByLabelText(`Antwort ${i + 1}`), a);
    }
}

describe('PollComposer', () => {
    const setup = (props: Partial<Parameters<typeof PollComposer>[0]> = {}) => {
        const onStart = vi.fn();
        render(<PollComposer onStart={onStart} labels={composerLabels} {...props} />);
        return { onStart };
    };

    it('starts with a question and two empty answers', () => {
        setup();
        expect(screen.getByLabelText('Frage')).toHaveValue('');
        expect(screen.getByLabelText('Antwort 1')).toHaveValue('');
        expect(screen.getByLabelText('Antwort 2')).toHaveValue('');
        expect(screen.queryByLabelText('Antwort 3')).toBeNull();
    });

    describe('start button', () => {
        it('is disabled while everything is empty', () => {
            setup();
            expect(start()).toBeDisabled();
        });

        it('is disabled while an answer is missing', async () => {
            setup();
            await fill('Welcher Buchstabe?', ['Alif']);
            expect(start()).toBeDisabled();
        });

        it('is disabled while the question is missing', async () => {
            setup();
            await fill('', ['Alif', 'Ba']);
            expect(start()).toBeDisabled();
        });

        it('treats whitespace-only text as empty', async () => {
            setup();
            await fill('   ', ['Alif', 'Ba']);
            expect(start()).toBeDisabled();
        });

        it('is enabled once the question and all answers are filled', async () => {
            setup();
            await fill('Welcher Buchstabe?', ['Alif', 'Ba']);
            expect(start()).toBeEnabled();
        });

        it('becomes disabled again when an added answer is still empty', async () => {
            setup();
            await fill('Welcher Buchstabe?', ['Alif', 'Ba']);
            await userEvent.click(add());
            expect(start()).toBeDisabled();
        });

        it('is disabled while busy and shows labels.starting', async () => {
            setup({
                busy: true,
                draft: { question: 'Frage?', answers: ['A', 'B'] },
            });
            expect(screen.getByRole('button', { name: 'Wird gestartet …' })).toBeDisabled();
        });
    });

    describe('onStart', () => {
        it('receives the trimmed question and answers', async () => {
            const { onStart } = setup();
            await fill('  Welcher Buchstabe?  ', ['  Alif ', 'Ba  ']);
            await userEvent.click(start());
            expect(onStart).toHaveBeenCalledExactlyOnceWith({
                question: 'Welcher Buchstabe?',
                answers: ['Alif', 'Ba'],
            });
        });

        it('submits with Enter from a field', async () => {
            const { onStart } = setup();
            await fill('Frage?', ['A', 'B']);
            await userEvent.type(screen.getByLabelText('Antwort 2'), '{Enter}');
            expect(onStart).toHaveBeenCalledTimes(1);
        });

        it('does not submit an incomplete poll with Enter', async () => {
            const { onStart } = setup();
            await fill('Frage?', ['A']);
            await userEvent.type(screen.getByLabelText('Frage'), '{Enter}');
            expect(onStart).not.toHaveBeenCalled();
        });

        it('does not submit while busy', async () => {
            const { onStart } = setup({
                busy: true,
                draft: { question: 'Q', answers: ['A', 'B'] },
            });
            await userEvent.type(screen.getByLabelText('Frage'), '{Enter}');
            expect(onStart).not.toHaveBeenCalled();
        });
    });

    describe('duplicate answers', () => {
        it('shows an alert and keeps start disabled', async () => {
            setup();
            await fill('Frage?', ['Alif', 'Alif']);
            expect(screen.getByRole('alert')).toHaveTextContent(
                'Antworten müssen sich unterscheiden.',
            );
            expect(start()).toBeDisabled();
        });

        it('ignores case and surrounding spaces', async () => {
            setup();
            await fill('Frage?', ['Alif', '  ALIF ']);
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(start()).toBeDisabled();
        });

        it('marks only the repeated answer as invalid', async () => {
            setup();
            await fill('Frage?', ['Alif', 'alif']);
            expect(screen.getByLabelText('Antwort 1')).not.toHaveAttribute('aria-invalid');
            expect(screen.getByLabelText('Antwort 2')).toHaveAttribute('aria-invalid', 'true');
        });

        it('clears the alert once the answers differ', async () => {
            setup();
            await fill('Frage?', ['Alif', 'Alif']);
            await userEvent.type(screen.getByLabelText('Antwort 2'), 'x');
            expect(screen.queryByRole('alert')).toBeNull();
            expect(start()).toBeEnabled();
        });

        it('does not flag two empty answers as duplicates', () => {
            setup();
            expect(screen.queryByRole('alert')).toBeNull();
        });
    });

    describe('adding and removing answers', () => {
        it('adds an answer field', async () => {
            setup();
            await userEvent.click(add());
            expect(screen.getByLabelText('Antwort 3')).toBeInTheDocument();
        });

        it('disables adding at maxAnswers (5 by default)', async () => {
            setup();
            for (let i = 0; i < 3; i += 1) await userEvent.click(add());
            expect(screen.getByLabelText('Antwort 5')).toBeInTheDocument();
            expect(add()).toBeDisabled();
            expect(screen.queryByLabelText('Antwort 6')).toBeNull();
        });

        it('honours a custom maxAnswers', async () => {
            setup({ maxAnswers: 3 });
            await userEvent.click(add());
            expect(add()).toBeDisabled();
        });

        it('removes the last answer', async () => {
            setup();
            await userEvent.click(add());
            await userEvent.type(screen.getByLabelText('Antwort 3'), 'Ta');
            await userEvent.click(remove());
            expect(screen.queryByLabelText('Antwort 3')).toBeNull();
        });

        it('disables removing at minAnswers (2 by default)', () => {
            setup();
            expect(remove()).toBeDisabled();
        });

        it('honours a custom minAnswers', async () => {
            setup({ minAnswers: 1 });
            expect(remove()).toBeEnabled();
            await userEvent.click(remove());
            expect(screen.queryByLabelText('Antwort 2')).toBeNull();
            expect(remove()).toBeDisabled();
        });

        // Regression: the uncontrolled draft used to start with two answers whatever
        // minAnswers said, so a host could start a poll below the minimum.
        it('starts with at least minAnswers fields when minAnswers is above 2', () => {
            setup({ minAnswers: 3 });
            expect(screen.getByLabelText('Antwort 3')).toBeInTheDocument();
        });

        it('keeps the typed answers when one is added', async () => {
            setup();
            await userEvent.type(screen.getByLabelText('Antwort 1'), 'Alif');
            await userEvent.click(add());
            expect(screen.getByLabelText('Antwort 1')).toHaveValue('Alif');
        });
    });

    describe('limits', () => {
        it('caps the question and answer length', () => {
            setup({ maxQuestionLength: 10, maxAnswerLength: 5 });
            expect(screen.getByLabelText('Frage')).toHaveAttribute('maxlength', '10');
            expect(screen.getByLabelText('Antwort 1')).toHaveAttribute('maxlength', '5');
        });
    });

    describe('controlled draft', () => {
        it('shows the draft it is given', () => {
            setup({ draft: { question: 'Gespeichert?', answers: ['Ja', 'Nein', 'Vielleicht'] } });
            expect(screen.getByLabelText('Frage')).toHaveValue('Gespeichert?');
            expect(screen.getByLabelText('Antwort 3')).toHaveValue('Vielleicht');
        });

        it('reports every change through onDraftChange', async () => {
            const onDraftChange = vi.fn();
            const draft: PollDraft = { question: '', answers: ['', ''] };
            setup({ draft, onDraftChange });
            await userEvent.type(screen.getByLabelText('Frage'), 'Q');
            expect(onDraftChange).toHaveBeenLastCalledWith({ question: 'Q', answers: ['', ''] });
            await userEvent.click(add());
            expect(onDraftChange).toHaveBeenLastCalledWith({
                question: '',
                answers: ['', '', ''],
            });
        });

        it('shows only what the parent hands back', async () => {
            // The parent ignores the change, so the field stays empty.
            setup({ draft: { question: '', answers: ['', ''] }, onDraftChange: () => {} });
            await userEvent.type(screen.getByLabelText('Frage'), 'abc');
            expect(screen.getByLabelText('Frage')).toHaveValue('');
        });

        it('works as a fully controlled field when the parent stores the draft', async () => {
            function Host() {
                const [draft, setDraft] = useState<PollDraft>({ question: '', answers: ['', ''] });
                return (
                    <PollComposer
                        draft={draft}
                        onDraftChange={setDraft}
                        onStart={() => {}}
                        labels={composerLabels}
                    />
                );
            }
            render(<Host />);
            await userEvent.type(screen.getByLabelText('Frage'), 'abc');
            expect(screen.getByLabelText('Frage')).toHaveValue('abc');
        });
    });
});

describe('PollBallot', () => {
    const options = [
        { id: 'a', label: 'Alif' },
        { id: 'b', label: 'Ba' },
        { id: 'c', label: 'Ta' },
    ];
    const setup = (props: Partial<Parameters<typeof PollBallot>[0]> = {}) => {
        const onVote = vi.fn();
        render(
            <PollBallot
                question="Welcher Buchstabe?"
                options={options}
                totalVotes={4}
                onVote={onVote}
                labels={ballotLabels}
                {...props}
            />,
        );
        return { onVote };
    };

    it('shows the question and the vote count', () => {
        setup();
        expect(screen.getByRole('heading', { name: 'Welcher Buchstabe?' })).toBeInTheDocument();
        expect(screen.getByText('4 Stimmen')).toBeInTheDocument();
    });

    it('offers each answer as a radio inside a group named by the question', () => {
        setup();
        const group = screen.getByRole('radiogroup', { name: 'Welcher Buchstabe?' });
        expect(group).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(3);
        expect(screen.getByRole('radio', { name: 'Ba' })).toBeInTheDocument();
    });

    it('keeps the vote button disabled until a choice is made', async () => {
        setup();
        const vote = screen.getByRole('button', { name: 'Abstimmen' });
        expect(vote).toBeDisabled();
        await userEvent.click(screen.getByRole('radio', { name: 'Ba' }));
        expect(vote).toBeEnabled();
    });

    it('calls onVote with the id of the chosen answer', async () => {
        const { onVote } = setup();
        await userEvent.click(screen.getByRole('radio', { name: 'Ta' }));
        await userEvent.click(screen.getByRole('button', { name: 'Abstimmen' }));
        expect(onVote).toHaveBeenCalledExactlyOnceWith('c');
    });

    it('uses the last choice when it changes', async () => {
        const { onVote } = setup();
        await userEvent.click(screen.getByRole('radio', { name: 'Alif' }));
        await userEvent.click(screen.getByRole('radio', { name: 'Ba' }));
        await userEvent.click(screen.getByRole('button', { name: 'Abstimmen' }));
        expect(onVote).toHaveBeenCalledExactlyOnceWith('b');
    });

    it('does not vote while busy', async () => {
        const { onVote } = setup({ busy: true });
        await userEvent.click(screen.getByRole('radio', { name: 'Ba' }));
        expect(screen.getByRole('button', { name: 'Abstimmen' })).toBeDisabled();
        expect(onVote).not.toHaveBeenCalled();
    });

    it('shows the finality note', () => {
        setup();
        expect(screen.getByText('Deine Stimme ist endgültig.')).toBeInTheDocument();
    });

    describe('after voting', () => {
        it('shows labels.yourVote and no voting form', () => {
            setup({ votedFor: 'b' });
            expect(screen.getByText('Deine Stimme: Ba')).toBeInTheDocument();
            expect(screen.queryByRole('radio')).toBeNull();
            expect(screen.queryByRole('button', { name: 'Abstimmen' })).toBeNull();
        });

        it('ignores a votedFor that is not an option', () => {
            setup({ votedFor: 'zzz' });
            expect(screen.queryByText(/Deine Stimme:/)).toBeNull();
            expect(screen.getAllByRole('radio')).toHaveLength(3);
        });
    });

    it('shows no voting form without onVote', () => {
        setup({ onVote: undefined });
        expect(screen.queryByRole('radio')).toBeNull();
    });

    describe('close', () => {
        it('has no close button without onClose', () => {
            setup();
            expect(screen.queryByRole('button', { name: 'Umfrage beenden' })).toBeNull();
        });

        it('has no close button without a label', () => {
            setup({ onClose: () => {}, labels: { ...ballotLabels, close: undefined } });
            expect(screen.queryByRole('button', { name: 'Umfrage beenden' })).toBeNull();
        });

        it('calls onClose', async () => {
            const onClose = vi.fn();
            setup({ onClose });
            await userEvent.click(screen.getByRole('button', { name: 'Umfrage beenden' }));
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('stays available after the host voted', () => {
            setup({ onClose: () => {}, votedFor: 'a' });
            expect(screen.getByRole('button', { name: 'Umfrage beenden' })).toBeInTheDocument();
        });
    });

    describe('remaining time', () => {
        it('shows the time left', () => {
            setup({ remainingSeconds: 42 });
            expect(screen.getByText('noch 42 s')).toBeInTheDocument();
        });

        it('shows 0 seconds rather than hiding the line', () => {
            setup({ remainingSeconds: 0 });
            expect(screen.getByText('noch 0 s')).toBeInTheDocument();
        });

        it('shows nothing without remainingSeconds', () => {
            setup();
            expect(screen.queryByText(/noch/)).toBeNull();
        });
    });
});

describe('PollResults', () => {
    const results = [
        { id: 'a', label: 'Alif', votes: 2 },
        { id: 'b', label: 'Ba', votes: 9 },
        { id: 'c', label: 'Ta', votes: 1 },
    ];
    const setup = (props: Partial<Parameters<typeof PollResults>[0]> = {}) =>
        render(
            <PollResults
                question="Welcher Buchstabe?"
                results={results}
                labels={resultsLabels}
                {...props}
            />,
        );
    const row = (label: string) => screen.getByText(label).closest('li')!;

    it('shows the question, heading and total votes', () => {
        setup();
        expect(screen.getByRole('heading', { name: 'Welcher Buchstabe?' })).toBeInTheDocument();
        expect(screen.getByText('Ergebnis')).toBeInTheDocument();
        expect(screen.getByText('12 Stimmen')).toBeInTheDocument();
    });

    it('computes each share of the total (2/9/1 of 12)', () => {
        setup();
        expect(row('Alif')).toHaveTextContent('2 Stimmen · 17 %');
        expect(row('Ba')).toHaveTextContent('9 Stimmen · 75 %');
        expect(row('Ta')).toHaveTextContent('1 Stimmen · 8 %');
    });

    it('sizes each bar by its share', () => {
        setup();
        const bar = (label: string) =>
            row(label).querySelector<HTMLElement>('[aria-hidden="true"] > div')!;
        expect(parseFloat(bar('Ba').style.width)).toBeCloseTo(75);
        expect(parseFloat(bar('Alif').style.width)).toBeCloseTo((2 / 12) * 100);
    });

    it('uses formatShare for the percentage text', () => {
        setup({ formatShare: (share) => `${(share * 100).toFixed(1)}%` });
        expect(row('Ba')).toHaveTextContent('75.0%');
    });

    it('marks the leading answer', () => {
        setup();
        expect(screen.getByText('Ba')).toHaveClass('font-semibold');
        expect(screen.getByText('Alif')).not.toHaveClass('font-semibold');
    });

    it('marks every answer in a tie for the lead', () => {
        setup({
            results: [
                { id: 'a', label: 'Alif', votes: 3 },
                { id: 'b', label: 'Ba', votes: 3 },
                { id: 'c', label: 'Ta', votes: 1 },
            ],
        });
        expect(screen.getByText('Alif')).toHaveClass('font-semibold');
        expect(screen.getByText('Ba')).toHaveClass('font-semibold');
        expect(screen.getByText('Ta')).not.toHaveClass('font-semibold');
    });

    it('ticks the answer the viewer voted for', () => {
        setup({ votedFor: 'c' });
        expect(row('Ta')).toHaveTextContent('✓');
        expect(row('Ba')).not.toHaveTextContent('✓');
    });

    describe('with no votes', () => {
        const none = [
            { id: 'a', label: 'Alif', votes: 0 },
            { id: 'b', label: 'Ba', votes: 0 },
        ];

        it('shows 0 % rather than NaN', () => {
            setup({ results: none });
            expect(screen.getByText('0 Stimmen', { selector: 'p' })).toBeInTheDocument();
            expect(row('Alif')).toHaveTextContent('0 %');
            expect(row('Alif')).not.toHaveTextContent('NaN');
        });

        it('draws empty bars and leads with nobody', () => {
            setup({ results: none });
            const bar = row('Alif').querySelector<HTMLElement>('[aria-hidden="true"] > div')!;
            expect(bar.style.width).toBe('0%');
            expect(screen.getByText('Alif')).not.toHaveClass('font-semibold');
            expect(screen.getByText('Ba')).not.toHaveClass('font-semibold');
        });

        it('copes with an empty result list', () => {
            setup({ results: [] });
            expect(screen.getByText('0 Stimmen')).toBeInTheDocument();
            expect(screen.queryByRole('listitem')).toBeNull();
        });
    });

    describe('new poll', () => {
        it('has no button without onNewPoll', () => {
            setup();
            expect(screen.queryByRole('button', { name: 'Neue Umfrage' })).toBeNull();
        });

        it('has no button without a label', () => {
            setup({ onNewPoll: () => {}, labels: { ...resultsLabels, newPoll: undefined } });
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('calls onNewPoll', async () => {
            const onNewPoll = vi.fn();
            setup({ onNewPoll });
            await userEvent.click(screen.getByRole('button', { name: 'Neue Umfrage' }));
            expect(onNewPoll).toHaveBeenCalledTimes(1);
        });
    });
});
