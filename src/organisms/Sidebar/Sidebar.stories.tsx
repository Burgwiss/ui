import type { Meta, StoryObj } from '@storybook/react-vite';
import { Folder, FolderOpen, Inbox, Search } from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    type SidebarSide,
} from './Sidebar';

function Menu() {
    return (
        <>
            <SidebarHeader>
                <div className="px-2 text-lg font-semibold tracking-tight">Kurse</div>
                <label className="relative">
                    <span className="sr-only">Kurse suchen</span>
                    <Search
                        className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        placeholder="Suchen …"
                        className="h-8 w-full rounded-md border border-input bg-background pr-2 pl-8 text-sm"
                    />
                </label>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton active>
                                <Inbox aria-hidden="true" />
                                Alle Kurse
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup label="Ordner">
                    <SidebarMenu>
                        {['Sprachen', 'Religion', 'Geschichte', 'Kunst'].map((name, i) => (
                            <SidebarMenuItem key={name}>
                                <SidebarMenuButton asChild>
                                    <a href={`#${name}`}>
                                        {i === 0 ? (
                                            <FolderOpen aria-hidden="true" />
                                        ) : (
                                            <Folder aria-hidden="true" />
                                        )}
                                        {name}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <p className="text-xs text-muted-foreground">12 Kurse</p>
            </SidebarFooter>
        </>
    );
}

function Demo({ side }: { side: SidebarSide }) {
    return (
        <div
            className={`flex h-[520px] border border-border ${side === 'right' ? 'justify-end' : ''}`}
        >
            <Sidebar
                label="Kurse"
                side={side}
                resize={{
                    label: 'Seitenleiste verbreitern oder verschmälern',
                    storageKey: `storybook.sidebar.${side}`,
                }}
            >
                <Menu />
            </Sidebar>
        </div>
    );
}

const meta: Meta<typeof Sidebar> = {
    title: 'Organisms/Sidebar',
    component: Sidebar,
    parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof Sidebar>;

/** Left-docked navigation panel with header, grouped menu and footer; resizable and remembered per `storageKey`. */
export const Links: Story = { render: () => <Demo side="left" /> };
/** Right-docked panel (inspector or properties): same parts, resize handle on its inner (left) edge. */
export const Rechts: Story = { render: () => <Demo side="right" /> };
/** Fixed-width panel: omit `resize` and set `defaultWidth` when the width should not change. */
export const OhneResize: Story = {
    name: 'Feste Breite',
    render: () => (
        <div className="flex h-[520px] border border-border">
            <Sidebar label="Kurse" defaultWidth={240}>
                <Menu />
            </Sidebar>
        </div>
    ),
};
