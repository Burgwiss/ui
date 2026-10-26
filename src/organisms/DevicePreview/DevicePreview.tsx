import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import type { ReactNode } from 'react';

import { AudioLevelMeter } from '../../atoms/AudioLevelMeter';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import { cn } from '../../lib/cn';
import { MeetingControl, type MeetingControlOptions } from '../../molecules/MeetingControl';

export interface DevicePreviewLabels {
    /** Heading over the preview, e.g. "Deine Vorschau". */
    title?: string;
    /** On the picture while the camera is off: "Deine Kamera ist aus". */
    cameraOff: string;
    /** The camera button: say what a click does ("Kamera einschalten" / "Kamera ausschalten"). */
    camera: string;
    microphone: string;
    /** Name of the level meter: "Mikrofonpegel". */
    level: string;
}

export interface DevicePreviewProps {
    /** Your camera picture, a `<video>` the app owns. Leave out while it is off. */
    video?: ReactNode;
    /** Mirror the picture, as people expect of their own camera. Default true. */
    mirror?: boolean;
    /** Your name, for the initials while the camera is off. */
    name?: string;
    cameraOn: boolean;
    microphoneOn: boolean;
    onToggleCamera: () => void;
    onToggleMicrophone: () => void;
    /** While permission is being asked: the toggles wait. */
    busy?: boolean;
    /** Why the camera cannot be switched on (permission denied, no device). Disables its toggle. */
    cameraBlocked?: string;
    microphoneBlocked?: string;
    /** Device choices behind each toggle's chevron (`MeetingControlOptions`). */
    cameraOptions?: MeetingControlOptions;
    microphoneOptions?: MeetingControlOptions;
    /** Microphone level 0–1 while it is on; shows the meter. */
    level?: number;
    /** The verdict beside the meter, e.g. "Mikrofon funktioniert." or "Kein Ton erkannt." */
    levelStatus?: ReactNode;
    /** Status lines under the picture (camera and microphone checks, errors). */
    status?: ReactNode;
    /** Device selects and the speaker test, under everything. */
    children?: ReactNode;
    labels: DevicePreviewLabels;
    className?: string;
}

/**
 * The self-check before joining a meeting: your own picture, large, with the camera and
 * microphone toggles on it (each with a chevron for choosing the device), a level meter
 * that moves when you speak, and room below for the device selects and a speaker test.
 * With the camera off, your initials stand in, so the box never looks broken.
 *
 * Nothing here is sent anywhere — the app asks for camera and microphone only when the
 * person clicks a toggle. Use it in `MeetingLobby`'s `preview`.
 *
 * @summary Pre-join self-check: own picture with camera/mic toggles, level meter and device choices.
 */
export function DevicePreview({
    video,
    mirror = true,
    name,
    cameraOn,
    microphoneOn,
    onToggleCamera,
    onToggleMicrophone,
    busy = false,
    cameraBlocked,
    microphoneBlocked,
    cameraOptions,
    microphoneOptions,
    level,
    levelStatus,
    status,
    children,
    labels,
    className,
}: DevicePreviewProps) {
    return (
        <section className={cn('space-y-3', className)} aria-label={labels.title}>
            {labels.title && <h2 className="text-sm font-semibold">{labels.title}</h2>}
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-video-surface shadow-sm">
                {cameraOn && video ? (
                    <div
                        className={cn(
                            'absolute inset-0 [&>*]:size-full [&>*]:object-cover',
                            mirror && '[&>*]:-scale-x-100',
                        )}
                    >
                        {video}
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-b from-muted to-secondary">
                        {name && (
                            <InitialsAvatar
                                name={name}
                                colored
                                size="lg"
                                className="size-20 text-2xl"
                            />
                        )}
                        <p className="text-sm font-medium text-muted-foreground">
                            {labels.cameraOff}
                        </p>
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-linear-to-t from-video-scrim/60 to-transparent p-3 pt-8">
                    <MeetingControl
                        label={labels.microphone}
                        icon={
                            microphoneOn ? (
                                <Mic aria-hidden="true" />
                            ) : (
                                <MicOff aria-hidden="true" />
                            )
                        }
                        tone={microphoneOn ? 'default' : 'off'}
                        pressed={microphoneOn}
                        disabled={busy}
                        disabledReason={microphoneBlocked}
                        onClick={onToggleMicrophone}
                        options={microphoneOptions}
                        className="shadow-md"
                    />
                    <MeetingControl
                        label={labels.camera}
                        icon={
                            cameraOn ? (
                                <Camera aria-hidden="true" />
                            ) : (
                                <CameraOff aria-hidden="true" />
                            )
                        }
                        tone={cameraOn ? 'default' : 'off'}
                        pressed={cameraOn}
                        disabled={busy}
                        disabledReason={cameraBlocked}
                        onClick={onToggleCamera}
                        options={cameraOptions}
                        className="shadow-md"
                    />
                </div>
            </div>
            {microphoneOn && level !== undefined && (
                <div className="flex items-center gap-3">
                    <Mic aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    <AudioLevelMeter level={level} label={labels.level} className="flex-1" />
                    {levelStatus && (
                        <span className="shrink-0 text-sm text-muted-foreground" role="status">
                            {levelStatus}
                        </span>
                    )}
                </div>
            )}
            {status && <div className="space-y-1 text-sm text-muted-foreground">{status}</div>}
            {children && <div className="space-y-3">{children}</div>}
        </section>
    );
}
