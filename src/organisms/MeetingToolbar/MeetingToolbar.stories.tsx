import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    Camera,
    EllipsisVertical,
    Hand,
    LogOut,
    MessageSquare,
    MicOff,
    ScreenShare,
    SmilePlus,
    Users,
} from 'lucide-react';

import { MeetingControl } from '../../molecules/MeetingControl';
import { MeetingToolbar } from './MeetingToolbar';

/** The meeting's bottom bar: info at the start, own devices in the centre, panels and leave at the end. */
const meta: Meta<typeof MeetingToolbar> = {
    title: 'Organisms/MeetingToolbar',
    component: MeetingToolbar,
    parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof MeetingToolbar>;

/** The full bar. Narrow the canvas: the info hides, the rest wraps onto two centred rows. */
export const Leiste: Story = {
    render: () => (
        <div className="border-t border-border bg-background">
            <MeetingToolbar
                label="Eigene Geräte und Meetingaktionen"
                start={
                    <>
                        <span className="font-medium text-foreground">18:40</span>
                        <span aria-hidden="true">·</span>
                        <span>ABC-DEF-GHI</span>
                    </>
                }
                end={
                    <>
                        <MeetingControl
                            label="Chat: 2 ungelesene Nachrichten"
                            icon={<MessageSquare aria-hidden="true" />}
                            badge={2}
                        />
                        <MeetingControl label="Teilnehmende" icon={<Users aria-hidden="true" />} />
                        <MeetingControl
                            label="Weitere Optionen"
                            icon={<EllipsisVertical aria-hidden="true" />}
                        />
                        <MeetingControl
                            label="Verlassen"
                            icon={<LogOut aria-hidden="true" />}
                            tone="danger"
                            showLabel
                        />
                    </>
                }
            >
                <MeetingControl
                    label="Mikrofon einschalten"
                    icon={<MicOff aria-hidden="true" />}
                    tone="off"
                    pressed={false}
                    options={{ label: 'Mikrofonoptionen', content: 'Mikrofon auswählen' }}
                />
                <MeetingControl
                    label="Kamera ausschalten"
                    icon={<Camera aria-hidden="true" />}
                    pressed
                    options={{ label: 'Kameraoptionen', content: 'Kamera auswählen' }}
                />
                <MeetingControl
                    label="Bildschirm teilen"
                    icon={<ScreenShare aria-hidden="true" />}
                />
                <MeetingControl
                    label="Melden"
                    icon={<Hand aria-hidden="true" />}
                    pressed={false}
                    badge={2}
                />
                <MeetingControl label="Reaktionen" icon={<SmilePlus aria-hidden="true" />} />
            </MeetingToolbar>
        </div>
    ),
};
