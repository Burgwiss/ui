import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import { useState } from 'react';

import { Button } from '../../atoms/Button';
import { MeetingRoom, MeetingRoomPanel } from './MeetingRoom';

function Slot({ name, className }: { name: string; className?: string }) {
    return (
        <div
            className={`flex items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground ${className ?? ''}`}
        >
            {name}
        </div>
    );
}

/**
 * The meeting layout with its slots outlined. For the real composition — header, stage,
 * toolbar, panels — open the Meeting page prototype.
 */
const meta: Meta<typeof MeetingRoom> = {
    title: 'Templates/MeetingRoom',
    component: MeetingRoom,
    parameters: { layout: 'fullscreen' },
    decorators: [(Story) => <div className="h-dvh min-h-[32rem]">{<Story />}</div>],
};
export default meta;
type Story = StoryObj<typeof MeetingRoom>;

/** The slots: header, stage, toolbar. */
export const Aufbau: Story = {
    render: () => (
        <MeetingRoom
            header={<Slot name="header" className="m-2 h-10" />}
            stage={<Slot name="stage" className="h-full" />}
            toolbar={<Slot name="toolbar" className="m-2 h-14" />}
        />
    ),
};

/** With a panel: docked beside the stage on a desktop, a bottom sheet on a phone. Escape closes it. */
export const MitPanel: Story = {
    render: function Render() {
        const [open, setOpen] = useState(true);
        return (
            <MeetingRoom
                header={<Slot name="header" className="m-2 h-10" />}
                notices={<Slot name="notices" className="h-12" />}
                stage={<Slot name="stage" className="h-full" />}
                prompt={<Slot name="prompt" className="h-8 w-48" />}
                toolbar={
                    <div className="flex justify-center p-2">
                        <Button variant="outline" onClick={() => setOpen(!open)}>
                            Panel {open ? 'schließen' : 'öffnen'}
                        </Button>
                    </div>
                }
                panel={
                    open ? (
                        <MeetingRoomPanel
                            title="Chat"
                            closeLabel="Chat schließen"
                            onClose={() => setOpen(false)}
                            footer={<Slot name="footer" className="h-10" />}
                        >
                            <Slot name="panel content" className="h-64" />
                        </MeetingRoomPanel>
                    ) : undefined
                }
            />
        );
    },
};

/** Jump to the full prototype. */
export const ZumPrototyp: Story = {
    render: () => (
        <div className="flex h-full items-center justify-center">
            <Button onClick={linkTo('Pages/Meeting', 'Unterricht')}>Meeting-Prototyp öffnen</Button>
        </div>
    ),
};
