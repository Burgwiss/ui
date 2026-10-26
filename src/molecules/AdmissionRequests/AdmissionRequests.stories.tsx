import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { useStoryText } from '../../../.storybook/locale';
import { ADMISSION_LABELS } from '../../lib/meeting.fixtures';
import { AdmissionRequests, type AdmissionRequest } from './AdmissionRequests';

const QUEUE: AdmissionRequest[] = [
    { id: 'g1', name: 'Jonas Weber', detail: 'wartet seit 2 Min.' },
    { id: 'g2', name: 'Familie Rahman', detail: 'wartet seit 1 Min.' },
    { id: 'g3', name: 'Hatice Kaya', detail: 'gerade eben' },
    { id: 'g4', name: 'Peter Lange', detail: 'gerade eben' },
];

/** What a host sees when guests knock: one click to admit or turn away. */
const meta: Meta<typeof AdmissionRequests> = {
    title: 'Molecules/AdmissionRequests',
    component: AdmissionRequests,
    parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof AdmissionRequests>;

/** Work through the queue: focus moves to the next person after each decision. */
export const GaesteKlopfen: Story = {
    render: function Render() {
        const t = useStoryText();
        const [queue, setQueue] = useState(QUEUE);
        const drop = (id: string) => setQueue((q) => q.filter((r) => r.id !== id));
        return (
            <AdmissionRequests
                requests={queue}
                onAdmit={drop}
                onDeny={drop}
                labels={t(ADMISSION_LABELS)}
                onShowAll={() => {}}
            />
        );
    },
};

/** One person, a decision on its way: both buttons wait. */
export const WirdGesendet: Story = {
    render: function Render() {
        const t = useStoryText();
        return (
            <AdmissionRequests
                requests={[{ id: 'g1', name: 'Jonas Weber', busy: true }]}
                onAdmit={() => {}}
                onDeny={() => {}}
                labels={t(ADMISSION_LABELS)}
            />
        );
    },
};
