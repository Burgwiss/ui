import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { useStoryText } from '../../../.storybook/locale';
import {
    cameraFrame,
    DEMO_PEOPLE,
    slideFrame,
    STAGE_LABELS,
    TILE_LABELS,
} from '../../lib/meeting.fixtures';
import { ParticipantTile } from '../ParticipantTile';
import { VideoStage, type VideoStageProps } from './VideoStage';

function Stage({ count, ...props }: { count: number } & Partial<VideoStageProps>) {
    const t = useStoryText();
    return (
        <div className="h-[36rem] w-full rounded-xl border border-dashed border-border p-2">
            <VideoStage labels={t(STAGE_LABELS)} {...props}>
                {DEMO_PEOPLE.slice(0, count).map((p, i) => (
                    <ParticipantTile
                        key={p.id}
                        name={p.name}
                        video={
                            p.camera ? (
                                <img alt="" src={cameraFrame(p.hue, p.variant)} />
                            ) : undefined
                        }
                        muted={p.muted}
                        speaking={i === 0}
                        handRaised={i === 3}
                        handPosition={i === 3 ? 1 : undefined}
                        labels={t(TILE_LABELS)}
                    />
                ))}
            </VideoStage>
        </div>
    );
}

/**
 * The stage lays tiles out in the largest grid that fits, keeps them all the same size,
 * and pages past 16. Resize the canvas (or zoom the text) and watch it re-fit.
 */
const meta: Meta<typeof VideoStage> = {
    title: 'Organisms/VideoStage',
    component: VideoStage,
    parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof VideoStage>;

/** One person: a single large tile. */
export const Allein: Story = { render: () => <Stage count={1} /> };

/** Two people sit side by side whenever the width allows it. */
export const ZuZweit: Story = { render: () => <Stage count={2} /> };

/** A small class: rows centred, every tile the same size. */
export const KleineGruppe: Story = { render: () => <Stage count={7} /> };

/** More than fit: a pager on top, the last page keeps the tile size. */
export const MitSeiten: Story = { render: () => <Stage count={24} /> };

/** A shared screen takes the stage; the cameras move into a strip at the side (or below, when narrow). */
export const Bildschirmfreigabe: Story = {
    render: () => (
        <Stage
            count={6}
            featured={
                <>
                    <img
                        alt="Bildschirm von Ustadh Mosa Khallaf"
                        src={slideFrame()}
                        className="size-full object-contain"
                    />
                    <span className="absolute start-2 top-2 rounded-md bg-video-scrim px-2 py-1 text-sm font-medium text-video-foreground">
                        Bildschirm von Ustadh Mosa Khallaf
                    </span>
                </>
            }
        />
    ),
};

/** Controlled paging: the app keeps the page, e.g. to jump to whoever raised a hand. */
export const GesteuerteSeite: Story = {
    render: function Render() {
        const [page, setPage] = useState(1);
        return <Stage count={24} page={page} onPageChange={setPage} />;
    },
};

/** No tiles yet: a quiet sentence instead of an empty box. */
export const Leer: Story = { render: () => <Stage count={0} /> };
