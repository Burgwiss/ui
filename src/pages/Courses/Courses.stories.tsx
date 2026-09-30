import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    BookOpen,
    CircleSlash,
    CreditCard,
    House,
    Inbox,
    Palette,
    Settings2,
    Users,
} from 'lucide-react';
import { linkTo } from '@storybook/addon-links';
import { useMemo, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { descendantIds, type TreeNode } from '../../lib/tree';

import { AppRail, AppRailItem, AppRailSpacer } from '../../organisms/AppRail';
import { CategoryTree } from '../../organisms/CategoryTree';
import {
    CATEGORY_TREE_LABELS,
    COURSE_CATEGORIES,
} from '../../organisms/CategoryTree/CategoryTree.fixtures';
import { makeCourses } from '../../organisms/DataGrid/DataGrid.fixtures';
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
 * app rail, the Kurse app's category tree, and the full grid. Non-functional:
 * example content, no server.
 */
const COUNT = 40;
/** "Alle Kurse" and "Ohne Kategorie" sit above the tree; a category id is one of its folders. */
type Scope = { kind: 'all' } | { kind: 'none' } | { kind: 'category'; id: string };

function CoursesPage() {
    const [categories, setCategories] = useState<TreeNode[]>(COURSE_CATEGORIES);
    const [scope, setScope] = useState<Scope>({ kind: 'all' });
    const courses = useMemo(() => makeCourses(COUNT), []);

    // Courses per category, including everything under it.
    const counts = useMemo(() => {
        const out: Record<string, number> = {};
        const walk = (n: TreeNode) => {
            const ids = descendantIds(categories, n.id);
            out[n.id] = courses.filter((c) => c.categoryId && ids.includes(c.categoryId)).length;
            n.children?.forEach(walk);
        };
        categories.forEach(walk);
        return out;
    }, [categories, courses]);
    const known = new Set(categories.flatMap((n) => descendantIds(categories, n.id)));
    const uncategorised = courses.filter((c) => !c.categoryId || !known.has(c.categoryId)).length;

    const categoryIds =
        scope.kind === 'all'
            ? null
            : scope.kind === 'none'
              ? [null]
              : descendantIds(categories, scope.id);
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
                                        active={scope.kind === 'all'}
                                        onClick={() => setScope({ kind: 'all' })}
                                    >
                                        <Inbox aria-hidden="true" />
                                        <span className="flex-1">Alle Kurse</span>
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {COUNT}
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        active={scope.kind === 'none'}
                                        onClick={() => setScope({ kind: 'none' })}
                                    >
                                        <CircleSlash aria-hidden="true" />
                                        <span className="flex-1">Ohne Kategorie</span>
                                        <span className="text-xs text-muted-foreground tabular-nums">
                                            {uncategorised}
                                        </span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroup>
                        <CategoryTree
                            nodes={categories}
                            onNodesChange={setCategories}
                            selectedId={scope.kind === 'category' ? scope.id : null}
                            onEdit={linkTo('Pages/Kategorie', 'Kategorieseite')}
                            onSelect={(id) =>
                                setScope(id ? { kind: 'category', id } : { kind: 'all' })
                            }
                            counts={counts}
                            storageKey="storybook.page.courses"
                            shortcutLabels={{ Delete: 'Entf' }}
                            labels={CATEGORY_TREE_LABELS}
                        />
                    </SidebarContent>
                </Sidebar>
            }
        >
            <CourseList
                gridId="storybook.page.courses.grid"
                count={COUNT}
                categories={categories}
                categoryIds={categoryIds}
            />
        </AdminLayout>
    );
}

/**
 * The admin course list as it could look: rail, the Kurse app's category tree
 * (add, rename, drag to move, delete), and the grid with sorting, filters,
 * saved views, grouping and inline price editing. Click around — it responds,
 * but saves nothing.
 */
const meta: Meta<typeof CoursesPage> = {
    title: 'Pages/Kursverwaltung',
    component: CoursesPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.includes('storybook.page.courses')) localStorage.removeItem(k);
    },
};
export default meta;

export const Kursliste: StoryObj<typeof CoursesPage> = {
    render: () => <CoursesPage />,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const rows = () => canvasElement.querySelectorAll('tr[data-grid-row-id]').length;

        await step('A category narrows the list to it and everything under it', async () => {
            const all = rows();
            await userEvent.click(canvas.getByRole('treeitem', { name: /^Koran, / }));
            await waitFor(() => expect(rows()).toBeLessThan(all));
            for (const cell of canvas.getAllByText(/^Koran › /, {
                selector: '[data-cell-content]',
            }))
                await expect(cell).toBeVisible();
        });

        await step('A rename shows up in the grid at once', async () => {
            await userEvent.keyboard('{F2}Quran{Enter}');
            await waitFor(() =>
                expect(
                    canvas.getAllByText(/^Quran › /, { selector: '[data-cell-content]' })[0],
                ).toBeVisible(),
            );
        });
    },
};
