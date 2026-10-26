import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DevicePreview, type DevicePreviewLabels, type DevicePreviewProps } from './DevicePreview';

const labels: DevicePreviewLabels = {
    title: 'Dein Bild',
    cameraOff: 'Kamera aus',
    camera: 'Kamera',
    microphone: 'Mikrofon',
    level: 'Mikrofonpegel',
};

const setup = (props: Partial<DevicePreviewProps> = {}) => {
    const onToggleCamera = vi.fn();
    const onToggleMicrophone = vi.fn();
    render(
        <DevicePreview
            cameraOn
            microphoneOn
            onToggleCamera={onToggleCamera}
            onToggleMicrophone={onToggleMicrophone}
            labels={labels}
            {...props}
        />,
    );
    return { onToggleCamera, onToggleMicrophone };
};

describe('DevicePreview', () => {
    it('is a section named by the title, with the title as heading', () => {
        setup();
        expect(screen.getByRole('region', { name: 'Dein Bild' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Dein Bild' })).toBeInTheDocument();
    });

    it('has no heading without a title', () => {
        setup({ labels: { ...labels, title: undefined } });
        expect(screen.queryByRole('heading')).toBeNull();
    });

    describe('toggles', () => {
        it('calls onToggleMicrophone when the microphone is used', async () => {
            const { onToggleCamera, onToggleMicrophone } = setup();
            await userEvent.click(screen.getByRole('button', { name: 'Mikrofon' }));
            expect(onToggleMicrophone).toHaveBeenCalledTimes(1);
            expect(onToggleCamera).not.toHaveBeenCalled();
        });

        it('calls onToggleCamera when the camera is used', async () => {
            const { onToggleCamera, onToggleMicrophone } = setup();
            await userEvent.click(screen.getByRole('button', { name: 'Kamera' }));
            expect(onToggleCamera).toHaveBeenCalledTimes(1);
            expect(onToggleMicrophone).not.toHaveBeenCalled();
        });

        it('exposes the on/off state as aria-pressed', () => {
            setup({ cameraOn: false, microphoneOn: true });
            expect(screen.getByRole('button', { name: 'Mikrofon' })).toHaveAttribute(
                'aria-pressed',
                'true',
            );
            expect(screen.getByRole('button', { name: 'Kamera' })).toHaveAttribute(
                'aria-pressed',
                'false',
            );
        });

        it('shows an off device in the off tone', () => {
            setup({ cameraOn: false, microphoneOn: false });
            expect(screen.getByRole('button', { name: 'Kamera' })).toHaveAttribute(
                'data-tone',
                'off',
            );
            expect(screen.getByRole('button', { name: 'Mikrofon' })).toHaveAttribute(
                'data-tone',
                'off',
            );
        });

        it('blocks both toggles while busy', async () => {
            const { onToggleCamera, onToggleMicrophone } = setup({ busy: true });
            await userEvent.click(screen.getByRole('button', { name: 'Kamera' }));
            await userEvent.click(screen.getByRole('button', { name: 'Mikrofon' }));
            expect(onToggleCamera).not.toHaveBeenCalled();
            expect(onToggleMicrophone).not.toHaveBeenCalled();
        });
    });

    describe('blocked devices', () => {
        it('disables the camera toggle when the camera is blocked', async () => {
            const { onToggleCamera, onToggleMicrophone } = setup({
                cameraBlocked: 'Kamerazugriff blockiert',
            });
            const camera = screen.getByRole('button', { name: 'Kamera' });
            expect(camera).toHaveAttribute('aria-disabled', 'true');
            await userEvent.click(camera);
            expect(onToggleCamera).not.toHaveBeenCalled();
            await userEvent.click(screen.getByRole('button', { name: 'Mikrofon' }));
            expect(onToggleMicrophone).toHaveBeenCalledTimes(1);
        });

        it('explains why the camera is blocked on focus', async () => {
            const user = userEvent.setup();
            setup({ cameraBlocked: 'Kamerazugriff blockiert' });
            await user.tab(); // microphone
            await user.tab(); // camera
            expect(screen.getByRole('button', { name: 'Kamera' })).toHaveFocus();
            expect(await screen.findByRole('tooltip')).toHaveTextContent('Kamerazugriff blockiert');
        });

        it('disables the microphone toggle when the microphone is blocked', async () => {
            const { onToggleMicrophone } = setup({ microphoneBlocked: 'Zugriff blockiert' });
            const mic = screen.getByRole('button', { name: 'Mikrofon' });
            expect(mic).toHaveAttribute('aria-disabled', 'true');
            await userEvent.click(mic);
            expect(onToggleMicrophone).not.toHaveBeenCalled();
        });
    });

    describe('camera picture', () => {
        it('shows the video while the camera is on', () => {
            setup({ video: <div data-testid="cam" /> });
            expect(screen.getByTestId('cam')).toBeInTheDocument();
            expect(screen.queryByText('Kamera aus')).toBeNull();
        });

        it('shows labels.cameraOff when the camera is off, and hides the video', () => {
            setup({ cameraOn: false, video: <div data-testid="cam" /> });
            expect(screen.getByText('Kamera aus')).toBeInTheDocument();
            expect(screen.queryByTestId('cam')).toBeNull();
        });

        it('shows labels.cameraOff when the camera is on but no video arrived yet', () => {
            setup({ cameraOn: true });
            expect(screen.getByText('Kamera aus')).toBeInTheDocument();
        });

        it('shows the initials of the name while the camera is off', () => {
            setup({ cameraOn: false, name: 'Amira Haddad' });
            expect(screen.getByText('AH')).toBeInTheDocument();
        });
    });

    describe('level meter', () => {
        it('is shown when the microphone is on and a level is given', () => {
            setup({ level: 0.5 });
            expect(screen.getByRole('meter', { name: 'Mikrofonpegel' })).toHaveAttribute(
                'aria-valuenow',
                '50',
            );
        });

        it('is hidden when the microphone is off', () => {
            setup({ microphoneOn: false, level: 0.5 });
            expect(screen.queryByRole('meter')).toBeNull();
        });

        it('is hidden without a level', () => {
            setup({ microphoneOn: true });
            expect(screen.queryByRole('meter')).toBeNull();
        });

        it('is shown at level 0 (silence is a level)', () => {
            setup({ level: 0 });
            expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
        });

        it('shows the verdict next to it as a status', () => {
            setup({ level: 0.5, levelStatus: 'Mikrofon funktioniert' });
            expect(screen.getByRole('status')).toHaveTextContent('Mikrofon funktioniert');
        });
    });

    it('renders status and children', () => {
        setup({ status: <p>Verbunden</p>, children: <button type="button">Beitreten</button> });
        expect(screen.getByText('Verbunden')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Beitreten' })).toBeInTheDocument();
    });

    it('opens the camera options next to the camera toggle', async () => {
        setup({ cameraOptions: { label: 'Kameraoptionen', content: <p>Kamera wählen</p> } });
        await userEvent.click(screen.getByRole('button', { name: 'Kameraoptionen' }));
        expect(await screen.findByText('Kamera wählen')).toBeInTheDocument();
    });

    it('opens the microphone options next to the microphone toggle', async () => {
        setup({
            microphoneOptions: { label: 'Mikrofonoptionen', content: <p>Mikrofon wählen</p> },
        });
        await userEvent.click(screen.getByRole('button', { name: 'Mikrofonoptionen' }));
        expect(await screen.findByText('Mikrofon wählen')).toBeInTheDocument();
    });
});
