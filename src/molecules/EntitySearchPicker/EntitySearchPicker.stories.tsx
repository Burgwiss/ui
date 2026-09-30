import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { EntitySearchPicker } from './EntitySearchPicker';

const meta = {
    title: 'Molecules/EntitySearchPicker',
    component: EntitySearchPicker,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof EntitySearchPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

type Person = { id: number; name: string; email: string };

const PEOPLE: Person[] = [
    { id: 1, name: 'Amira Haddad', email: 'amira@example.org' },
    { id: 2, name: 'Jonas Schneider', email: 'jonas@example.org' },
    { id: 3, name: 'Lena Brandt', email: 'lena@example.org' },
];

function PersonPicker() {
    const [chosen, setChosen] = useState<Person | null>(null);
    return (
        <EntitySearchPicker<Person>
            onSearch={async (query) => {
                const q = query.trim().toLowerCase();
                return PEOPLE.filter((p) => p.name.toLowerCase().includes(q));
            }}
            onSelect={setChosen}
            getKey={(p) => p.id}
            renderRow={(p) => (
                <>
                    <span>{p.name}</span>
                    <span className="text-xs text-muted-foreground">{p.email}</span>
                </>
            )}
            triggerLabel={chosen ? chosen.name : 'Person auswählen'}
            placeholder="Nach Namen suchen…"
            labels={{
                searching: 'Suche läuft…',
                empty: 'Keine Treffer',
                refine: 'Weitere Treffer – Suche verfeinern',
            }}
            triggerClassName="w-64 justify-between"
        />
    );
}

/** An in-memory people lookup: `onSearch` returns matches, the trigger shows the chosen name. */
export const Default: Story = {
    args: {} as never,
    render: () => <PersonPicker />,
};
