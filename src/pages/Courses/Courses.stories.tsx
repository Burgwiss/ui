import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    BookOpen,
    CreditCard,
    Folder,
    FolderOpen,
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
import { AdminLayout } from '../../templates/AdminLayout';
import { CourseList } from '../../templates/GridPage/GridPage.fixtures';

/**
 * PAGE PROTOTYPE — the admin course list (`/admin/courses` in Burgwiss): the
 * app rail, the Kurse app's folder menu, and the full grid. Non-functional:
 * example content, no server.
 */
const FOLDERS = ['Sprachen', 'Religion', 'Geschichte', 'Kunst'];

function CoursesPage() {
    const [folder, setFolder] = useState<string | null>(null);
    return (
        <AdminLayout
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
                    <AppRailItem icon={BookOpen} label="Kurse" active onClick={() => {}} />
                    <AppRailItem icon={Users} label="Nutzer" onClick={() => {}} />
                    <AppRailItem icon={CreditCard} label="Zahlungen" onClick={() => {}} />
                    <AppRailItem icon={Palette} label="Design" onClick={() => {}} />
                    <AppRailSpacer />
                    <AppRailItem icon={Settings2} label="Betrieb" onClick={() => {}} />
                </AppRail>
            }
            sidebar={
                <Sidebar
                    label="Kurse"
                    resize={{
                        label: 'Menü verbreitern oder verschmälern',
                        storageKey: 'storybook.page.courses',
                    }}
                >
                    <SidebarHeader>
                        <div className="px-2 text-lg font-semibold tracking-tight">Kurse</div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        active={folder === null}
                                        onClick={() => setFolder(null)}
                                    >
                                        <Inbox aria-hidden="true" />
                                        Alle Kurse
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                        <SidebarGroup label="Ordner">
                            <SidebarMenu>
                                {FOLDERS.map((f) => (
                                    <SidebarMenuItem key={f}>
                                        <SidebarMenuButton
                                            active={folder === f}
                                            onClick={() => setFolder(f)}
                                        >
                                            {folder === f ? (
                                                <FolderOpen aria-hidden="true" />
                                            ) : (
                                                <Folder aria-hidden="true" />
                                            )}
                                            {f}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            }
        >
            <CourseList gridId="storybook.page.courses.grid" count={40} />
        </AdminLayout>
    );
}

/**
 * The admin course list as it could look: rail, the Kurse app's folders, and
 * the grid with sorting, filters, saved views, offerings, grouping and inline
 * price editing. Click around — it responds, but saves nothing.
 */
const meta: Meta<typeof CoursesPage> = {
    title: 'Pages/Kursverwaltung',
    component: CoursesPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
};
export default meta;

export const Kursliste: StoryObj<typeof CoursesPage> = { render: () => <CoursesPage /> };
