import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    Camera,
    CameraOff,
    Hand,
    LogOut,
    MessageSquare,
    Mic,
    MicOff,
    ScreenShare,
} from 'lucide-react';
import { useState } from 'react';

import { Label } from '../../atoms/Label';
import { nativeSelectClass } from '../Select';
import { MeetingControl } from './MeetingControl';

/**
 * A control in the meeting toolbar. The tone says the state at a glance: red-tinted when
 * a device is off, filled when a mode is on, amber for a raised hand, solid red to leave.
 */
const meta: Meta<typeof MeetingControl> = {
    title: 'Molecules/MeetingControl',
    component: MeetingControl,
    parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof MeetingControl>;

/** Click to switch the microphone; the label always says what the next click does. */
export const Mikrofon: Story = {
    render: function Render() {
        const [on, setOn] = useState(true);
        return (
            <MeetingControl
                label={on ? 'Mikrofon ausschalten' : 'Mikrofon einschalten'}
                icon={on ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
                tone={on ? 'default' : 'off'}
                pressed={on}
                onClick={() => setOn(!on)}
            />
        );
    },
};

/** With a chevron for choosing the device — the split button. */
export const MitGeraeteauswahl: Story = {
    render: () => (
        <MeetingControl
            label="Kamera ausschalten"
            icon={<Camera aria-hidden="true" />}
            pressed
            options={{
                label: 'Kameraoptionen',
                content: (
                    <div className="space-y-1.5">
                        <Label htmlFor="cam">Kamera auswählen</Label>
                        <select id="cam" className={nativeSelectClass}>
                            <option>FaceTime HD-Kamera</option>
                            <option>Logitech C920</option>
                        </select>
                    </div>
                ),
            }}
        />
    ),
};

/** Every tone side by side: on, off, active mode, attention, leave. */
export const Toene: Story = {
    render: () => (
        <div className="flex items-center gap-2">
            <MeetingControl
                label="Mikrofon ausschalten"
                icon={<Mic aria-hidden="true" />}
                pressed
            />
            <MeetingControl
                label="Kamera einschalten"
                icon={<CameraOff aria-hidden="true" />}
                tone="off"
                pressed={false}
            />
            <MeetingControl
                label="Teilen beenden"
                icon={<ScreenShare aria-hidden="true" />}
                tone="active"
                pressed
            />
            <MeetingControl
                label="Meldung zurücknehmen"
                icon={<Hand aria-hidden="true" />}
                tone="attention"
                pressed
            />
            <MeetingControl
                label="Meeting verlassen"
                icon={<LogOut aria-hidden="true" />}
                tone="danger"
                showLabel
            />
        </div>
    ),
};

/** A count on the corner: unread messages. Put the number in the label too. */
export const MitZaehler: Story = {
    render: () => (
        <MeetingControl
            label="Chat: 3 ungelesene Nachrichten"
            icon={<MessageSquare aria-hidden="true" />}
            badge={3}
        />
    ),
};

/** Disabled with a reason: still focusable, and the tooltip says why. */
export const DeaktiviertMitGrund: Story = {
    render: () => (
        <MeetingControl
            label="Mikrofon einschalten"
            icon={<MicOff aria-hidden="true" />}
            tone="off"
            pressed={false}
            disabledReason="Die Kursleitung hat die Mikrofone gesperrt."
        />
    ),
};
