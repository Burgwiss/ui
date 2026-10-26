import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircleAlert } from 'lucide-react';

import { useStoryText } from '../../../.storybook/locale';
import { SUPPORT_LABELS } from '../../lib/meeting.fixtures';
import { Alert, AlertDescription, AlertTitle } from '../Alert';
import { SupportReference } from './SupportReference';

/** The id under an error that support can look the case up by. */
const meta: Meta<typeof SupportReference> = {
    title: 'Molecules/SupportReference',
    component: SupportReference,
    parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj<typeof SupportReference>;

/** Inside an error alert, where it belongs. */
export const ImFehlerhinweis: Story = {
    render: function Render() {
        const t = useStoryText();
        return (
            <Alert variant="destructive" className="max-w-lg">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>Das Gerät ist nicht verfügbar</AlertTitle>
                <AlertDescription>
                    Deine bisherige Kamera bleibt aktiv. Prüfe, ob eine andere App sie gerade nutzt.
                    <SupportReference
                        id="7f3c9a2e-41b8-4d0e-9a51-0c2f6e1d8b44"
                        labels={t(SUPPORT_LABELS)}
                    />
                </AlertDescription>
            </Alert>
        );
    },
};
