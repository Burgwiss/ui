import type { Meta, StoryObj } from '@storybook/react-vite';

import { Sidebar, SidebarContent, SidebarHeader } from '../../organisms/Sidebar';
import { SidebarLayout } from './SidebarLayout';

function Panel({ side }: { side: 'left' | 'right' }) {
    return (
        <Sidebar
            label="Seitenleiste"
            side={side}
            resize={{
                label: 'Seitenleiste verbreitern oder verschmälern',
                storageKey: `storybook.layout.${side}`,
            }}
        >
            <SidebarHeader>
                <div className="px-2 font-semibold">Seitenleiste</div>
            </SidebarHeader>
            <SidebarContent>
                <p className="px-2 text-sm text-muted-foreground">Navigation oder Formular.</p>
            </SidebarContent>
        </Sidebar>
    );
}

function Main() {
    return (
        <div className="p-8">
            <h1 className="text-xl font-semibold">Hauptbereich</h1>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                Scrollt für sich; die Seitenleiste bleibt stehen.
            </p>
        </div>
    );
}

const meta: Meta<typeof SidebarLayout> = {
    title: 'Templates/SidebarLayout',
    component: SidebarLayout,
    parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof SidebarLayout>;

/** The default: sidebar on the left, main area scrolls beside it. */
export const Links: Story = {
    render: () => (
        <div className="h-[520px]">
            <SidebarLayout sidebar={<Panel side="left" />}>
                <Main />
            </SidebarLayout>
        </div>
    ),
};

/** Sidebar on the right: pass `side="right"` here and to the Sidebar so its resize handle faces the main area. */
export const Rechts: Story = {
    render: () => (
        <div className="h-[520px]">
            <SidebarLayout side="right" sidebar={<Panel side="right" />}>
                <Main />
            </SidebarLayout>
        </div>
    ),
};
