import type { Meta, StoryObj } from '@storybook/react-vite';
import { Users } from 'lucide-react';

import { StatCard } from './StatCard';

const meta = {
    title: 'Molecules/StatCard',
    component: StatCard,
    tags: ['autodocs'],
    args: { label: 'Teilnehmende', value: 1284, hint: '12 neu diese Woche' },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start here: label, value and hint; edit them in the controls. */
export const Playground: Story = {};

/** A grid of three tiles, to check they line up with and without icon and hint. */
export const Row: Story = {
    render: () => (
        <div className="grid w-[40rem] grid-cols-3 gap-3">
            <StatCard
                label="Teilnehmende"
                value={1284}
                hint="12 neu diese Woche"
                icon={<Users className="size-4" />}
            />
            <StatCard label="Aktive Kurse" value={48} />
            <StatCard label="Offene Rechnungen" value="3" hint="2 überfällig" />
        </div>
    ),
};
