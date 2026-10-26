import type { ReactNode } from 'react';
import { type MeetingControlOptions } from '../../molecules/MeetingControl';
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
export declare function DevicePreview({ video, mirror, name, cameraOn, microphoneOn, onToggleCamera, onToggleMicrophone, busy, cameraBlocked, microphoneBlocked, cameraOptions, microphoneOptions, level, levelStatus, status, children, labels, className, }: DevicePreviewProps): import("react").JSX.Element;
