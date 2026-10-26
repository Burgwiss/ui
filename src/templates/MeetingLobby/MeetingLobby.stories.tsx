import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '../../atoms/Badge';
import { Button } from '../../atoms/Button';
import { MeetingLobby } from './MeetingLobby';

function Slot({ name, className }: { name: string; className?: string }) {
    return (
        <div
            className={`flex items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground ${className ?? ''}`}
        >
            {name}
        </div>
    );
}

/** The page before (and after) a meeting, with its slots outlined. The full version is in Pages/Meeting. */
const meta: Meta<typeof MeetingLobby> = {
    title: 'Templates/MeetingLobby',
    component: MeetingLobby,
    parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof MeetingLobby>;

/** Self-check beside the meeting and the way in. */
export const Aufbau: Story = {
    render: () => (
        <MeetingLobby
            header={<Slot name="header" className="h-8" />}
            title="Bereit zum Beitreten?"
            description="Ustadh Mosa Khallaf und 6 weitere sind schon im Meeting."
            meta={<Badge tone="neutral">Arabisch für Anfänger · Lektion 3</Badge>}
            preview={<Slot name="preview" className="aspect-video" />}
            access={<Button className="w-full">Meeting beitreten</Button>}
            footer={<Slot name="footer" className="h-8" />}
        />
    ),
};

/** For a host: the waiting list beside everything else. */
export const MitWarteliste: Story = {
    render: () => (
        <MeetingLobby
            title="Dein Meeting ist bereit"
            preview={<Slot name="preview" className="aspect-video" />}
            access={<Button className="w-full">Meeting beitreten</Button>}
            aside={<Slot name="aside" className="h-48" />}
        />
    ),
};

/** Nothing to check (the meeting ended): one centred column. */
export const OhneVorschau: Story = {
    render: () => (
        <MeetingLobby
            notice={<Slot name="notice" className="h-16" />}
            title="Das Meeting ist beendet"
            description="Ein Beitritt ist nicht mehr möglich."
            access={<Button variant="outline">Zur Startseite</Button>}
        />
    ),
};
