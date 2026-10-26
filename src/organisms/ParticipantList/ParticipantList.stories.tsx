import type { Meta, StoryObj } from '@storybook/react-vite';
import { MicOff, Shield } from 'lucide-react';
import { useState } from 'react';

import { useStoryText } from '../../../.storybook/locale';
import { Button } from '../../atoms/Button';
import { DEMO_PEOPLE, LIST_LABELS, ROLE_LABELS } from '../../lib/meeting.fixtures';
import { DropdownMenuItem } from '../../molecules/DropdownMenu';
import { ParticipantList, type ParticipantListPerson } from './ParticipantList';

/** Who is in the meeting, for the side panel. */
const meta: Meta<typeof ParticipantList> = {
    title: 'Organisms/ParticipantList',
    component: ParticipantList,
    parameters: { layout: 'padded' },
    decorators: [(Story) => <div className="max-w-sm">{<Story />}</div>],
};
export default meta;
type Story = StoryObj<typeof ParticipantList>;

function usePeople(host: boolean): ParticipantListPerson[] {
    const t = useStoryText();
    const roles = t(ROLE_LABELS);
    return [
        { id: 'me', name: 'Selma Yilmaz', self: true, role: roles.participant, muted: true },
        ...DEMO_PEOPLE.slice(0, 9).map((p, i) => ({
            id: p.id,
            name: p.name,
            role: roles[p.role],
            leader: p.role === 'host' || p.role === 'cohost',
            muted: p.muted,
            handPosition: i === 3 ? 1 : i === 7 ? 2 : undefined,
            actions:
                host && p.role !== 'host' ? (
                    <>
                        <DropdownMenuItem>
                            <MicOff aria-hidden="true" />
                            Stummschalten
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Shield aria-hidden="true" />
                            Moderation …
                        </DropdownMenuItem>
                    </>
                ) : undefined,
        })),
    ];
}

/** A student's view: raised hands first, in order, then everyone else. */
export const AlsTeilnehmende: Story = {
    render: function Render() {
        const t = useStoryText();
        return <ParticipantList people={usePeople(false)} labels={t(LIST_LABELS)} />;
    },
};

/** A host's view: guests knocking on top, "mute everyone", a ⋮ menu on every row, and search. */
export const AlsHost: Story = {
    render: function Render() {
        const t = useStoryText();
        const people = usePeople(true);
        const [query, setQuery] = useState('');
        const [waiting, setWaiting] = useState([
            { id: 'g1', name: 'Jonas Weber', detail: 'wartet seit 2 Min.' },
            { id: 'g2', name: 'Familie Rahman', detail: 'gerade eben' },
        ]);
        const drop = (id: string) => setWaiting((w) => w.filter((x) => x.id !== id));
        return (
            <ParticipantList
                people={people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))}
                waiting={waiting}
                onAdmit={drop}
                onDeny={drop}
                query={query}
                onQueryChange={setQuery}
                actions={
                    <Button variant="outline" size="sm">
                        <MicOff aria-hidden="true" />
                        Alle stummschalten
                    </Button>
                }
                labels={t(LIST_LABELS)}
            />
        );
    },
};
