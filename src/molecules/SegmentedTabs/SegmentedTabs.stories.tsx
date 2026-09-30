import type { Meta, StoryObj } from '@storybook/react-vite';

import {
    SegmentedTab,
    SegmentedTabs,
    SegmentedTabsContent,
    SegmentedTabsList,
} from './SegmentedTabs';

const meta = {
    title: 'Molecules/SegmentedTabs',
    component: SegmentedTabs,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof SegmentedTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two segments switching two panels, the standard use on a phone-style surface. */
export const Default: Story = {
    render: () => (
        <SegmentedTabs defaultValue="anstehend" className="w-96">
            <SegmentedTabsList aria-label="Live-Sitzungen">
                <SegmentedTab value="anstehend">Anstehend</SegmentedTab>
                <SegmentedTab value="vergangen">Vergangen</SegmentedTab>
            </SegmentedTabsList>
            <SegmentedTabsContent value="anstehend">
                Nächste Sitzung: Montag, 18:00 Uhr.
            </SegmentedTabsContent>
            <SegmentedTabsContent value="vergangen">
                Vier Aufzeichnungen verfügbar.
            </SegmentedTabsContent>
        </SegmentedTabs>
    ),
};
