import type { Meta, StoryObj } from '@storybook/react-vite';

import { useStoryText } from '../../../.storybook/locale';
import { RECORDING_LABELS } from '../../lib/meeting.fixtures';
import { RecordingIndicator, type RecordingState } from './RecordingIndicator';

/** Whether the meeting is being recorded. Pulses red while it is. */
const meta: Meta<typeof RecordingIndicator> = {
    title: 'Molecules/RecordingIndicator',
    component: RecordingIndicator,
    parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof RecordingIndicator>;

/** Recording now: a pulsing red dot (still under reduced motion, it just stops pulsing). */
export const AufnahmeLaeuft: Story = {
    render: function Render() {
        const t = useStoryText();
        return <RecordingIndicator state="recording" labels={t(RECORDING_LABELS)} />;
    },
};

const ALL: RecordingState[] = [
    'scheduled',
    'recording',
    'processing',
    'available',
    'failed',
    'none',
    'deleting',
    'deleted',
    'unknown',
];

/** Every state the meeting platform reports. */
export const AlleZustaende: Story = {
    render: function Render() {
        const t = useStoryText();
        return (
            <div className="flex max-w-xl flex-wrap gap-2">
                {ALL.map((s) => (
                    <RecordingIndicator key={s} state={s} labels={t(RECORDING_LABELS)} />
                ))}
            </div>
        );
    },
};
