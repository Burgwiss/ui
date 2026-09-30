import type { Meta, StoryObj } from '@storybook/react-vite';

import { useGridPreferences } from '../../hooks';
import { GridOptions } from './GridOptions';

function Demo() {
    const prefs = useGridPreferences('storybook.gridoptions');
    return (
        <div className="flex items-center gap-4">
            <GridOptions
                preferences={prefs}
                canSelect
                columns={[
                    { id: 'title', label: 'Kurs', hideable: false },
                    { id: 'code', label: 'Kürzel' },
                    { id: 'status', label: 'Status' },
                    { id: 'enrolled', label: 'Angemeldet' },
                ]}
                labels={{
                    trigger: 'Tabellenoptionen',
                    columns: 'Spalten',
                    density: 'Zeilenhöhe',
                    comfortable: 'Bequem',
                    compact: 'Kompakt',
                    selection: 'Zeilen auswählen',
                    reset: 'Zurücksetzen',
                }}
            />
            <code className="text-xs text-muted-foreground">{JSON.stringify(prefs.values)}</code>
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
