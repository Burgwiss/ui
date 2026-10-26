import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { useStoryText } from '../../../.storybook/locale';
import {
    POLL_BALLOT_LABELS,
    POLL_COMPOSER_LABELS,
    POLL_QUESTION,
    POLL_RESULTS_LABELS,
} from '../../lib/meeting.fixtures';
import { PollBallot, PollComposer, PollResults } from './Poll';

/** A quick poll in a meeting: start it, vote, see the result. */
const meta: Meta<typeof PollComposer> = {
    title: 'Organisms/Poll',
    component: PollComposer,
    parameters: { layout: 'padded' },
    decorators: [(Story) => <div className="max-w-sm">{<Story />}</div>],
};
export default meta;
type Story = StoryObj<typeof PollComposer>;

/** A host writes a question and two to five answers. Start waits until all are filled in. */
export const Starten: Story = {
    render: function Render() {
        const t = useStoryText();
        const [started, setStarted] = useState('');
        return (
            <div className="space-y-3">
                <PollComposer
                    labels={t(POLL_COMPOSER_LABELS)}
                    onStart={(d) => setStarted(d.question)}
                />
                <p role="status" className="text-sm text-muted-foreground">
                    {started && `Gestartet: ${started}`}
                </p>
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const start = canvas.getByRole('button', { name: 'Abstimmung starten' });
        await expect(start).toBeDisabled();
        await userEvent.type(canvas.getByLabelText('Frage'), 'Wer hat die Übung gemacht?');
        await userEvent.type(canvas.getByLabelText('Antwort 1'), 'Ja');
        await userEvent.type(canvas.getByLabelText('Antwort 2'), 'ja');
        await expect(canvas.getByRole('alert')).toBeInTheDocument();
        await userEvent.clear(canvas.getByLabelText('Antwort 2'));
        await userEvent.type(canvas.getByLabelText('Antwort 2'), 'Noch nicht');
        await expect(start).toBeEnabled();
    },
};

/** A running poll for a student: pick one answer, vote once. */
export const Abstimmen: Story = {
    render: function Render() {
        const t = useStoryText();
        const q = t(POLL_QUESTION);
        const [vote, setVote] = useState<string>();
        return (
            <PollBallot
                question={q.question}
                options={q.answers.map((label, i) => ({ id: `a${i}`, label }))}
                totalVotes={vote ? 9 : 8}
                remainingSeconds={84}
                votedFor={vote}
                onVote={setVote}
                labels={t(POLL_BALLOT_LABELS)}
            />
        );
    },
};

/** A running poll for the host: the count and the close button, no ballot. */
export const LaeuftAlsHost: Story = {
    render: function Render() {
        const t = useStoryText();
        const q = t(POLL_QUESTION);
        return (
            <PollBallot
                question={q.question}
                options={q.answers.map((label, i) => ({ id: `a${i}`, label }))}
                totalVotes={11}
                remainingSeconds={23}
                onClose={() => {}}
                labels={t(POLL_BALLOT_LABELS)}
            />
        );
    },
};

/** The result: a bar and share per answer, the leading answer emphasised, your own marked. */
export const Ergebnis: Story = {
    render: function Render() {
        const t = useStoryText();
        const q = t(POLL_QUESTION);
        return (
            <PollResults
                question={q.question}
                results={q.answers.map((label, i) => ({
                    id: `a${i}`,
                    label,
                    votes: [2, 9, 1][i]!,
                }))}
                votedFor="a1"
                onNewPoll={() => {}}
                labels={t(POLL_RESULTS_LABELS)}
            />
        );
    },
};
