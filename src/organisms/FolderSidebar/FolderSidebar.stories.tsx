import type { Meta, StoryObj } from '@storybook/react-vite';
import { Settings, Tags } from 'lucide-react';
import { useState } from 'react';

import { inFolderScope, subtreeCounts, type FolderScope, type TreeNode } from '../../lib/tree';
import { CATEGORY_TREE_LABELS, COURSE_CATEGORIES } from '../CategoryTree/CategoryTree.fixtures';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../Sidebar';
import { FolderSidebar, type FolderSidebarProps } from './FolderSidebar';

type Item = { title: string; folderId: string | null };

const COURSES: Item[] = [
    { title: 'Arabisch für Anfänger', folderId: 'arabisch-grundstufe' },
    { title: 'Arabisch Konversation', folderId: 'arabisch-aufbaustufe' },
    { title: 'Nahw und Sarf', folderId: 'arabisch-grammatik' },
    { title: 'Tajwid-Grundkurs', folderId: 'koran-tajwid' },
    { title: 'Hifz-Begleitung', folderId: 'koran-hifz' },
    { title: 'Einführung in das Fiqh', folderId: 'fiqh' },
    { title: 'Die Sira in zwölf Abenden', folderId: 'sira' },
    { title: 'Kalligrafie', folderId: 'kunst' },
    { title: 'Offene Sprechstunde', folderId: null },
];

const MEDIA_FOLDERS: TreeNode[] = [
    { id: 'meinung', label: 'Meinung' },
    { id: 'bericht', label: 'Berichte' },
    { id: 'interview', label: 'Interviews' },
];

const ARTICLES: Item[] = [
    { title: 'Warum wir Arabisch lehren', folderId: 'meinung' },
    { title: 'Ein Jahr im Hifz-Kurs', folderId: 'bericht' },
    { title: 'Gespräch mit unserer Lehrerin', folderId: 'interview' },
    { title: 'Neue Räume', folderId: 'bericht' },
    { title: 'Ohne Ordner', folderId: null },
];

function Demo({
    initial,
    items,
    allLabel,
    noneLabel,
    title,
    tree,
}: {
    initial: TreeNode[];
    items: Item[];
    title: string;
    allLabel: string;
    noneLabel: string;
    tree?: Partial<FolderSidebarProps['tree']>;
}) {
    const [nodes, setNodes] = useState(initial);
    const [scope, setScope] = useState<FolderScope | null>({ kind: 'all' });
    const counts = subtreeCounts(
        nodes,
        items.map((i) => i.folderId),
    );
    const shown = items.filter((i) => inFolderScope(nodes, scope ?? { kind: 'all' }, i.folderId));
    return (
        <div className="flex h-[520px] border border-border">
            <FolderSidebar
                title={title}
                resize={{
                    label: 'Seitenleiste verbreitern oder verschmälern',
                    storageKey: `storybook.folder-sidebar.${title}`,
                }}
                all={{ label: allLabel, count: items.length }}
                none={{
                    label: noneLabel,
                    count: items.filter((i) => i.folderId === null).length,
                }}
                scope={scope}
                onScopeChange={setScope}
                tree={{
                    nodes,
                    onNodesChange: setNodes,
                    counts,
                    labels: CATEGORY_TREE_LABELS,
                    ...tree,
                }}
            >
                <SidebarGroup label="Einrichtung">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setScope(null)}>
                                <Tags aria-hidden="true" />
                                Schlagwörter
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={() => setScope(null)}>
                                <Settings aria-hidden="true" />
                                Einstellungen
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </FolderSidebar>
            <ul className="flex-1 space-y-1 p-4 text-sm" aria-label="Ergebnis">
                {shown.map((i) => (
                    <li key={i.title}>{i.title}</li>
                ))}
            </ul>
        </div>
    );
}

const meta: Meta<typeof FolderSidebar> = {
    title: 'Organisms/FolderSidebar',
    component: FolderSidebar,
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        for (const k of Object.keys(localStorage))
            if (k.startsWith('burgwiss-ui:tree:')) localStorage.removeItem(k);
    },
};
export default meta;

type Story = StoryObj<typeof FolderSidebar>;

/**
 * The course list's sidebar: "Alle Kurse", "Ohne Kategorie", the nested category tree
 * with counts that include subcategories, then two setup links. The list on the right
 * is filtered by the picked scope.
 */
export const KurseMitKategorien: Story = {
    name: 'Kurse mit Kategorien',
    render: () => (
        <Demo
            initial={COURSE_CATEGORIES}
            items={COURSES}
            title="Kurse"
            allLabel="Alle Kurse"
            noneLabel="Ohne Kategorie"
            tree={{ defaultExpandedIds: ['arabisch'] }}
        />
    ),
};

/** Flat folders (`tree.maxDepth` 1), as for media articles: reorderable, no subfolders. */
export const FlacheOrdner: Story = {
    render: () => (
        <Demo
            initial={MEDIA_FOLDERS}
            items={ARTICLES}
            title="Artikel"
            allLabel="Alle Artikel"
            noneLabel="Ohne Ordner"
            tree={{ maxDepth: 1 }}
        />
    ),
};
