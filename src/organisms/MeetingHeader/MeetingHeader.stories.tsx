import type { Meta, StoryObj } from '@storybook/react-vite';
import { Users } from 'lucide-react';

import { useStoryText } from '../../../.storybook/locale';
import { Badge } from '../../atoms/Badge';
import { RECORDING_LABELS } from '../../lib/meeting.fixtures';
import { RecordingIndicator } from '../../molecules/RecordingIndicator';
import { MeetingHeader } from './MeetingHeader';

/** The slim top bar of a meeting. */
const meta: Meta<typeof MeetingHeader> = {
    title: 'Organisms/MeetingHeader',
    component: MeetingHeader,
    parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof MeetingHeader>;

/** Title, room code, recording and the people count. */
export const Kopfzeile: Story = {
    render: function Render() {
        const t = useStoryText();
        return (
            <MeetingHeader
                title="Arabisch für Anfänger · Lektion 3"
                subtitle="ABC-DEF-GHI"
                status={<RecordingIndicator state="recording" labels={t(RECORDING_LABELS)} />}
                end={
                    <span className="inline-flex items-center gap-1.5">
                        <Users aria-hidden="true" className="size-4" />
                        <span className="sr-only">Teilnehmende:</span>8
                    </span>
                }
            />
        );
    },
};

/** A big meeting: lecture mode next to the recording. */
export const Vortragsmodus: Story = {
    render: function Render() {
        const t = useStoryText();
        return (
            <MeetingHeader
                title="Freitagsvortrag: Geduld im Lernen"
                subtitle="KLM-NOP-QRS"
                status={
                    <>
                        <RecordingIndicator state="recording" labels={t(RECORDING_LABELS)} />
                        <Badge tone="neutral">Vortragsmodus</Badge>
                    </>
                }
                end="18:40"
            />
        );
    },
};
