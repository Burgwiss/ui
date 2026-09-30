import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import type { GridView } from '../../hooks/useGridPreferences';
import { GridViewsMenu, type GridViewsMenuProps } from './GridViewsMenu';

const LABELS: GridViewsMenuProps['labels'] = {
    trigger: 'Ansichten',
    save: 'Aktuelle Ansicht speichern …',
    saveTitle: 'Ansicht speichern',
    name: 'Name der Ansicht',
    confirm: 'Speichern',
    update: 'Aktive Ansicht aktualisieren',
    rename: 'Ansicht umbenennen …',
    renameTitle: 'Ansicht umbenennen',
    delete: 'Ansicht löschen …',
    deleteConfirm: 'Löschen',
    confirmDelete: (name) =>
        `Die Ansicht „${name}“ wird gelöscht. Das lässt sich nicht rückgängig machen.`,
    cancel: 'Abbrechen',
    empty: 'Noch keine Ansichten gespeichert.',
    modified: 'geändert',
    nameRequired: 'Bitte einen Namen eingeben.',
    closeLabel: 'Schließen',
};

const VIEWS: GridView[] = [
    { id: 'unpaid', name: 'Unbezahlt diesen Monat', state: {} },
    { id: 'arabic', name: 'Nur Arabisch', state: {} },
    { id: 'drafts', name: 'Entwürfe', state: {} },
];

/** Keeps the views in state so that saving, renaming and deleting actually happen. */
function Demo(args: GridViewsMenuProps) {
    const [views, setViews] = useState(args.views);
    const [activeViewId, setActive] = useState(args.activeViewId);
    const [isModified, setModified] = useState(args.isModified);
    return (
        <div className="flex flex-col items-start gap-3">
            <GridViewsMenu
                {...args}
                views={views}
                activeViewId={activeViewId}
                isModified={isModified}
                onApply={(id) => {
                    setActive(id);
                    setModified(false);
                }}
                onSave={(name) => {
                    const id = `view-${views.length + 1}`;
                    setViews([...views, { id, name, state: {} }]);
                    setActive(id);
                    setModified(false);
                }}
                onUpdate={() => setModified(false)}
                onRename={(id, name) =>
                    setViews(views.map((view) => (view.id === id ? { ...view, name } : view)))
                }
                onDelete={(id) => {
                    setViews(views.filter((view) => view.id !== id));
                    setActive(null);
                    setModified(false);
                }}
            />
            <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => setModified(true)}
            >
                Spalten ändern (simuliert)
            </button>
        </div>
    );
}

const meta = {
    title: 'Molecules/GridViewsMenu',
    component: GridViewsMenu,
    parameters: { layout: 'centered' },
    render: (args) => <Demo {...args} />,
    args: {
        views: VIEWS,
        activeViewId: null,
        isModified: false,
        labels: LABELS,
        onApply: () => {},
        onSave: () => {},
        onRename: () => {},
        onDelete: () => {},
    },
} satisfies Meta<typeof GridViewsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No view applied: the trigger shows the generic label. */
export const OhneAktiveAnsicht: Story = {};

/** A view is applied: the trigger carries its name and the menu offers rename and delete. */
export const AktiveAnsicht: Story = { args: { activeViewId: 'arabic' } };

/** The setup has drifted from the active view: a dot on the trigger, and "Aktive Ansicht aktualisieren" in the menu. */
export const Geaendert: Story = {
    name: 'Geändert',
    args: { activeViewId: 'arabic', isModified: true },
};

/** Nothing saved yet: the menu says so and only offers to save. */
export const Leer: Story = { args: { views: [] } };
