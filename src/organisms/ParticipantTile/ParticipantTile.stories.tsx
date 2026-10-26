import type { Meta, StoryObj } from '@storybook/react-vite';
import { MicOff, Pin, UserRoundX } from 'lucide-react';

import { useStoryText } from '../../../.storybook/locale';
import { cameraFrame, TILE_LABELS } from '../../lib/meeting.fixtures';
import { DropdownMenuItem } from '../../molecules/DropdownMenu';
import { ParticipantTile, type ParticipantTileProps } from './ParticipantTile';

function Tile(props: Partial<ParticipantTileProps>) {
    const t = useStoryText();
    return (
        <div className="w-[26rem] max-w-full" style={{ aspectRatio: '16 / 9' }}>
            <ParticipantTile
                name="Amira Haddad"
                video={<img alt="" src={cameraFrame(250, 1)} />}
                labels={t(TILE_LABELS)}
                className="size-full"
                {...props}
            />
        </div>
    );
}

/**
 * One person on the meeting stage. The app renders its own `<video>` (here a drawn
 * picture) and passes it as `video`; the tile adds the name, the state and the ⋮ menu.
 */
const meta: Meta<typeof ParticipantTile> = {
    title: 'Organisms/ParticipantTile',
    component: ParticipantTile,
    parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof ParticipantTile>;

/** Camera on, microphone on: just the name. */
export const KameraAn: Story = { render: () => <Tile /> };

/** Camera off: the initials, large, on a calm surface — never a black box. */
export const KameraAus: Story = { render: () => <Tile video={undefined} muted /> };

/** Talking: a green ring, so you can see who speaks. */
export const Spricht: Story = { render: () => <Tile speaking /> };

/** Microphone off: a red crossed-out mic in the name chip, and read out after the name. */
export const Stumm: Story = { render: () => <Tile muted /> };

/** Hand raised: an amber ring and a badge with the place in the queue — visible without a camera, too. */
export const Gemeldet: Story = {
    render: () => (
        <div className="flex flex-wrap gap-4">
            <Tile handRaised handPosition={2} muted />
            <Tile video={undefined} handRaised handPosition={1} muted name="Leonie Berger" />
        </div>
    ),
};

/** A reaction floats in the top corner for a few seconds; the app removes it. */
export const MitReaktion: Story = {
    render: () => <Tile reaction={{ key: 1, emoji: '👏', label: 'Applaus' }} muted />,
};

/** A role label beside the name, for the people running the meeting. */
export const MitRolle: Story = {
    render: () => (
        <Tile
            name="Ustadh Mosa Khallaf"
            badge="Host"
            video={<img alt="" src={cameraFrame(200, 0)} />}
            speaking
        />
    ),
};

/** A weak connection gets a signal icon; a good one shows nothing. */
export const SchwacheVerbindung: Story = { render: () => <Tile connection="poor" muted /> };

/** Your own tile: mirrored picture and "(du)" after the name (as `suffix`, so the initials stay right). */
export const EigeneKachel: Story = {
    render: () => (
        <Tile
            name="Selma Yilmaz"
            suffix="(du)"
            mirror
            muted
            video={<img alt="" src={cameraFrame(330, 2)} />}
        />
    ),
};

/** A host's ⋮ menu: what they may do with this person. Hover the tile (or Tab to it) to show the button. */
export const MitAktionen: Story = {
    render: () => (
        <Tile
            pinned
            actions={
                <>
                    <DropdownMenuItem>
                        <Pin aria-hidden="true" />
                        Anheften
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <MicOff aria-hidden="true" />
                        Stummschalten
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive-tint-foreground">
                        <UserRoundX aria-hidden="true" />
                        Aus dem Meeting entfernen
                    </DropdownMenuItem>
                </>
            }
        />
    ),
};

/** A long name truncates; the tile never grows. */
export const LangerName: Story = {
    render: () => (
        <Tile name="Alexandra-Maria von Beispielhausen mit sehr langem Namen" muted badge="Gast" />
    ),
};
