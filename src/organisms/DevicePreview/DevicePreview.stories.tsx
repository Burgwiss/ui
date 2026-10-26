import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { useStoryText } from '../../../.storybook/locale';
import { Label } from '../../atoms/Label';
import { cameraFrame, DEVICE_LABELS } from '../../lib/meeting.fixtures';
import { nativeSelectClass } from '../../molecules/Select';
import { DevicePreview, type DevicePreviewProps } from './DevicePreview';

function Preview(props: Partial<DevicePreviewProps>) {
    const t = useStoryText();
    const [cam, setCam] = useState(props.cameraOn ?? true);
    const [mic, setMic] = useState(props.microphoneOn ?? true);
    return (
        <div className="max-w-xl">
            <DevicePreview
                name="Selma Yilmaz"
                video={<img alt="" src={cameraFrame(330, 2)} />}
                level={0.5}
                levelStatus="Mikrofon funktioniert."
                labels={{
                    ...t(DEVICE_LABELS),
                    camera: cam ? 'Kamera ausschalten' : 'Kamera einschalten',
                    microphone: mic ? 'Mikrofon ausschalten' : 'Mikrofon einschalten',
                }}
                {...props}
                cameraOn={cam}
                microphoneOn={mic}
                onToggleCamera={() => setCam(!cam)}
                onToggleMicrophone={() => setMic(!mic)}
            />
        </div>
    );
}

/** The self-check before joining. */
const meta: Meta<typeof DevicePreview> = {
    title: 'Organisms/DevicePreview',
    component: DevicePreview,
    parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof DevicePreview>;

/** Camera and microphone on: your mirrored picture and a moving level. */
export const Bereit: Story = { render: () => <Preview /> };

/** Camera off: your initials stand in; nothing is asked of the browser until you click. */
export const KameraAus: Story = { render: () => <Preview cameraOn={false} microphoneOn={false} /> };

/** The browser blocked the camera: the toggle is disabled and says why. */
export const KameraBlockiert: Story = {
    render: () => (
        <Preview
            cameraOn={false}
            cameraBlocked="Der Kamerazugriff ist blockiert. Erlaube ihn über das Schloss in der Adressleiste."
            status={<p>Kamera: Zugriff verweigert. Du kannst trotzdem beitreten und zuhören.</p>}
        />
    ),
};

/** With the device choices below and behind each chevron. */
export const MitGeraeteauswahl: Story = {
    render: () => (
        <Preview
            cameraOptions={{
                label: 'Kameraoptionen',
                content: (
                    <div className="space-y-1.5">
                        <Label htmlFor="cam-pick">Kamera auswählen</Label>
                        <select id="cam-pick" className={nativeSelectClass}>
                            <option>FaceTime HD-Kamera</option>
                        </select>
                    </div>
                ),
            }}
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="mic">Mikrofon</Label>
                    <select id="mic" className={nativeSelectClass}>
                        <option>MacBook Air-Mikrofon</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="bg">Hintergrund</Label>
                    <select id="bg" className={nativeSelectClass}>
                        <option>Ohne Effekt</option>
                        <option>Weichzeichnen</option>
                    </select>
                </div>
            </div>
        </Preview>
    ),
};
