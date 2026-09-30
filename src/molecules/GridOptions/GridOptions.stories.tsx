import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { useGridPreferences } from '../../hooks';
import type { GridView } from '../../hooks/useGridPreferences';
import { GridOptions } from './GridOptions';
import type { GridOptionsViews, GridViewsLabels } from './GridViews';

const COLUMNS = [
    { id: 'title', label: 'Kurs', hideable: false },
    { id: 'code', label: 'Kürzel' },
    { id: 'status', label: 'Status' },
    { id: 'enrolled', label: 'Angemeldet' },
];

const LABELS = {
    trigger: 'Tabellenoptionen',
    columns: 'Spalten',
    density: 'Zeilenhöhe',
    comfortable: 'Bequem',
    compact: 'Kompakt',
    selection: 'Zeilen auswählen',
    reset: 'Zurücksetzen',
};

const VIEWS_LABELS: GridViewsLabels = {
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

function Demo() {
    const prefs = useGridPreferences('storybook.gridoptions');
    return (
        <div className="flex items-center gap-4">
            <GridOptions preferences={prefs} canSelect columns={COLUMNS} labels={LABELS} />
            <code className="text-xs text-muted-foreground">{JSON.stringify(prefs.values)}</code>
        </div>
    );
}

/** Keeps the views in state so that saving, renaming and deleting actually happen. */
function ViewsDemo({
    initialViews = VIEWS,
    initialActive = null,
    initialModified = false,
}: {
    initialViews?: GridView[];
    initialActive?: string | null;
    initialModified?: boolean;
}) {
    const prefs = useGridPreferences('storybook.gridoptions.views');
    const [views, setViews] = useState(initialViews);
    const [activeViewId, setActive] = useState(initialActive);
    const [isModified, setModified] = useState(initialModified);

    const options: GridOptionsViews = {
        views,
        activeViewId,
        isModified,
        labels: VIEWS_LABELS,
        onApply: (id) => {
            setActive(id);
            setModified(false);
        },
        onSave: (name) => {
            const id = `view-${views.length + 1}`;
            setViews([...views, { id, name, state: {} }]);
            setActive(id);
            setModified(false);
        },
        onUpdate: () => setModified(false),
        onRename: (id, name) =>
            setViews(views.map((view) => (view.id === id ? { ...view, name } : view))),
        onDelete: (id) => {
            setViews(views.filter((view) => view.id !== id));
            setActive(null);
            setModified(false);
        },
    };

    return (
        <div className="flex items-center gap-4">
            <GridOptions
                preferences={prefs}
                canSelect
                columns={COLUMNS}
                labels={LABELS}
                views={options}
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

const meta: Meta = {
    title: 'Molecules/GridOptions',
    component: GridOptions,
    render: () => <Demo />,
};
export default meta;

/** The full menu: a name column that cannot be hidden, row selection on, and the stored values printed beside it. */
export const Standard: StoryObj = {};

/** With saved views: "Ansichten" tops the menu. Save the current setup, then rename, update or delete it there — every choice really happens. */
export const MitAnsichten: StoryObj = { render: () => <ViewsDemo /> };

/** A view is applied: the "Ansichten" entry carries its name, and the submenu offers rename and delete. */
export const AktiveAnsicht: StoryObj = {
    render: () => <ViewsDemo initialActive="arabic" />,
};

/** The setup has drifted from the active view: a dot on the ⋮ button, "geändert" on the entry, and "Aktive Ansicht aktualisieren" in the submenu. */
export const Geaendert: StoryObj = {
    name: 'Geändert',
    render: () => <ViewsDemo initialActive="arabic" initialModified />,
};

/** Nothing saved yet: the submenu says so and only offers to save. */
export const OhneGespeicherteAnsichten: StoryObj = {
    render: () => <ViewsDemo initialViews={[]} />,
};
