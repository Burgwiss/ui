import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    BookOpen,
    CreditCard,
    Folder,
    House,
    Inbox,
    Palette,
    Settings2,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { AppRail, AppRailItem, AppRailSpacer } from '../../organisms/AppRail';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '../../organisms/Sidebar';
import { AdminLayout } from './AdminLayout';

const APPS = [
    {
        id: 'kurse',
        label: 'Kurse',
        icon: BookOpen,
        menu: ['Alle Kurse', 'Lernpfade', 'Veranstaltungsorte', 'Zertifikate'],
    },
    {
        id: 'nutzer',
        label: 'Nutzer',
        icon: Users,
        menu: ['Alle Nutzer', 'Lehrkräfte', 'Sponsoren'],
    },
    {
        id: 'zahlungen',
        label: 'Zahlungen',
        icon: CreditCard,
        menu: ['Bestellungen', 'Gutscheine', 'Berichte'],
    },
    { id: 'design', label: 'Design', icon: Palette, menu: ['Übersicht', 'Stil', 'Seiten'] },
];

function Shell({ withSidebar = true }: { withSidebar?: boolean }) {
    const [app, setApp] = useState('kurse');
    const [entry, setEntry] = useState(0);
    const current = APPS.find((a) => a.id === app) ?? APPS[0]!;
    return (
        <AdminLayout
            className="h-[640px]"
            rail={
                <AppRail
                    label="Apps"
                    logo={
                        <span className="flex size-9 items-center justify-center rounded-lg bg-background text-sm font-bold text-foreground">
                            B
                        </span>
                    }
                >
                    <AppRailItem icon={House} label="Start" href="#start" />
                    {APPS.map((a) => (
                        <AppRailItem
                            key={a.id}
                            icon={a.icon}
                            label={a.label}
                            active={app === a.id}
                            onClick={() => {
                                setApp(a.id);
                                setEntry(0);
                            }}
                        />
                    ))}
                    <AppRailSpacer />
                    <AppRailItem icon={Settings2} label="Betrieb" onClick={() => {}} />
                </AppRail>
            }
            sidebar={
                withSidebar ? (
                    <Sidebar
                        label={current.label}
                        resize={{
                            label: 'Menü verbreitern oder verschmälern',
                            storageKey: 'storybook.adminlayout',
                        }}
                    >
                        <SidebarHeader>
                            <div className="px-2 text-lg font-semibold tracking-tight">
                                {current.label}
                            </div>
                        </SidebarHeader>
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarMenu>
                                    {current.menu.map((label, i) => (
                                        <SidebarMenuItem key={label}>
                                            <SidebarMenuButton
                                                active={entry === i}
                                                onClick={() => setEntry(i)}
                                            >
                                                {i === 0 ? (
                                                    <Inbox aria-hidden="true" />
                                                ) : (
                                                    <Folder aria-hidden="true" />
                                                )}
                                                {label}
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                ) : undefined
            }
        >
            <div className="p-8">
                <h1 className="text-2xl font-semibold">{current.menu[entry]}</h1>
                <p className="mt-2 text-muted-foreground">
                    Hier steht die Seite — zum Beispiel eine GridPage.
                </p>
            </div>
        </AdminLayout>
    );
}

/**
 * The admin shell: AppRail on the far left, the chosen app's resizable
 * Sidebar, then the page. Click an app on the rail to switch its menu.
 */
const meta: Meta<typeof AdminLayout> = {
    title: 'Templates/AdminLayout',
    component: AdminLayout,
    parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof AdminLayout>;

/** The usual admin page: rail, app menu, page. */
export const MitMenue: Story = { name: 'Mit Menü', render: () => <Shell /> };

/** A page that needs the full width (a canvas, an editor): rail only. */
export const OhneMenue: Story = { name: 'Ohne Menü', render: () => <Shell withSidebar={false} /> };
