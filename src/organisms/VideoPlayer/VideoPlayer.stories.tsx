import type { Meta, StoryObj } from '@storybook/react-vite';

import { VIDEO_LABELS } from './VideoPlayer.fixtures';
import { VideoPlayer } from './VideoPlayer';

const meta = {
    title: 'Organisms/VideoPlayer',
    component: VideoPlayer,
    args: {
        src: 'media/sample-lesson.mp4',
        title: 'Lektion 3: Die Buchstaben Alif bis Ta',
        resumeKey: 'storybook-lesson-3',
        labels: VIDEO_LABELS,
    },
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <div className="mx-auto max-w-3xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof VideoPlayer>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Start here: the working player with resume (`resumeKey`), skips and speed on a sample lesson. */
export const Standard: Story = {};

/** Failure state with Retry: what a student sees when a URL fails, e.g. a signed link has expired. */
export const LaedtNicht: Story = {
    name: 'Lädt nicht',
    args: { src: 'media/gibt-es-nicht.mp4', resumeKey: undefined },
};
