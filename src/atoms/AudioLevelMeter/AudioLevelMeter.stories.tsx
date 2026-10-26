import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { AudioLevelMeter } from './AudioLevelMeter';

/** A microphone level meter for the pre-join check. */
const meta: Meta<typeof AudioLevelMeter> = {
    title: 'Atoms/AudioLevelMeter',
    component: AudioLevelMeter,
    parameters: { layout: 'padded' },
    args: { label: 'Mikrofonpegel', level: 0.45 },
};
export default meta;
type Story = StoryObj<typeof AudioLevelMeter>;

/** A fixed level. */
export const Pegel: Story = {
    render: (args) => (
        <div className="max-w-xs">
            <AudioLevelMeter {...args} />
        </div>
    ),
};

/** Someone speaking: the level moves (fast rise, slow fall — smoothed by the app). */
export const Sprechen: Story = {
    render: function Render() {
        const [level, setLevel] = useState(0.2);
        useEffect(() => {
            const id = setInterval(
                () => setLevel((l) => Math.max(0.05, Math.min(1, l * 0.7 + Math.random() * 0.5))),
                120,
            );
            return () => clearInterval(id);
        }, []);
        return (
            <div className="max-w-xs">
                <AudioLevelMeter label="Mikrofonpegel" level={level} />
            </div>
        );
    },
};

/** Silence: every segment dark. Pair it with "Kein Ton erkannt." in the app. */
export const Stille: Story = {
    args: { level: 0 },
    render: (args) => (
        <div className="max-w-xs">
            <AudioLevelMeter {...args} />
        </div>
    ),
};
