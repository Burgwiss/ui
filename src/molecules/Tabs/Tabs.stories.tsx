import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

const meta = {
    title: 'Molecules/Tabs',
    component: Tabs,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three underlined tabs switching three panels, with the first active at start. */
export const Default: Story = {
    render: () => (
        <Tabs defaultValue="uebersicht" className="w-96">
            <TabsList aria-label="Kursbereiche">
                <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
                <TabsTrigger value="lektionen">Lektionen</TabsTrigger>
                <TabsTrigger value="teilnehmende">Teilnehmende</TabsTrigger>
            </TabsList>
            <TabsContent value="uebersicht">Alles Wichtige auf einen Blick.</TabsContent>
            <TabsContent value="lektionen">Zwölf Lektionen in vier Modulen.</TabsContent>
            <TabsContent value="teilnehmende">Achtzehn Personen sind angemeldet.</TabsContent>
        </Tabs>
    ),
};
