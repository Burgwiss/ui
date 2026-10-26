import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { useStoryText } from '../../../.storybook/locale';
import { REACTIONS } from '../../lib/meeting.fixtures';
import { ReactionPicker } from './ReactionPicker';

/** The six meeting reactions, each a large button named by what it means. */
const meta: Meta<typeof ReactionPicker> = {
    title: 'Molecules/ReactionPicker',
    component: ReactionPicker,
    parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof ReactionPicker>;

/** Pick one; the app sends it and closes the popover. */
export const Reaktionen: Story = {
    render: function Render() {
        const t = useStoryText();
        const [sent, setSent] = useState('');
        const reactions = t(REACTIONS);
        return (
            <div className="space-y-2">
                <ReactionPicker
                    label="Reaktionen"
                    reactions={reactions}
                    onPick={(id) => setSent(reactions.find((r) => r.id === id)?.label ?? '')}
                />
                <p className="text-sm text-muted-foreground" role="status">
                    {sent && `Gesendet: ${sent}`}
                </p>
            </div>
        );
    },
};

/** Waiting out the rate limit: every reaction is disabled for a moment. */
export const Gesperrt: Story = {
    render: function Render() {
        const t = useStoryText();
        return (
            <ReactionPicker
                label="Reaktionen"
                reactions={t(REACTIONS)}
                onPick={() => {}}
                disabled
            />
        );
    },
};
