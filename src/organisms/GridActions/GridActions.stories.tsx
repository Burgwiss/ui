import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { IconButton } from '../../molecules/IconButton';
import {
    GridActions,
    GridActionsSeparator,
    GridColumnsAction,
    GridCreateAction,
    GridDensityAction,
} from './GridActions';

const meta: Meta<typeof GridActions> = {
    title: 'Organisms/GridActions',
    component: GridActions,
    parameters: {
        docs: {
            description: {
                component:
                    'Die Aktionsleiste eines Grids: links in der Toolbar, nur Symbol-Knöpfe, jeder mit Tooltip und aria-label. Genau eine Aktion ist gefüllt: „Neu“.',
            },
        },
    },
};
export default meta;

export const Standard: StoryObj<typeof GridActions> = {
    render: () => {
        const [compact, setCompact] = useState(false);
        const [visibility, setVisibility] = useState<Record<string, boolean>>({});
        return (
            <GridActions label="Kurse">
                <GridCreateAction
                    label="Neuer Kurs"
                    icon={<Plus className="size-4" aria-hidden="true" />}
                    onClick={() => {}}
                />
                <GridActionsSeparator />
                <GridDensityAction
                    compact={compact}
                    onChange={setCompact}
                    labels={{ compact: 'Kompakt', comfortable: 'Bequem' }}
                />
                <GridColumnsAction
                    label="Spalten"
                    columns={[
                        { id: 'code', label: 'Kürzel' },
                        { id: 'status', label: 'Status' },
                        { id: 'enrolled', label: 'Angemeldet' },
                    ]}
                    visibility={visibility}
                    onToggle={(id, v) => setVisibility((s) => ({ ...s, [id]: v }))}
                />
                <GridActionsSeparator />
                <IconButton
                    label="Exportieren"
                    icon={<Download className="size-4" aria-hidden="true" />}
                />
                <IconButton
                    label="Neu laden"
                    icon={<RefreshCw className="size-4" aria-hidden="true" />}
                />
            </GridActions>
        );
    },
};

export const Selection: StoryObj<typeof GridActions> = {
    render: () => (
        <GridActions label="3 ausgewählt">
            <span className="px-2 text-sm font-semibold">3 ausgewählt</span>
            <GridActionsSeparator />
            <IconButton
                label="Löschen"
                destructive
                icon={<Trash2 className="size-4" aria-hidden="true" />}
            />
        </GridActions>
    ),
};
