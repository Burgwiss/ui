import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './Badge';

const meta = {
    title: 'Atoms/Badge',
    component: Badge,
    tags: ['autodocs'],
    args: { children: 'Neu' },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Try a badge alone; change `variant`, `tone` and the text from the controls panel. */
export const Playground: Story = {};

/** Solid variants for counts and tags: `default` for emphasis, `muted`/`outline` for quiet labels. */
export const Variants: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-2">
            <Badge>Standard</Badge>
            <Badge variant="secondary">Sekundär</Badge>
            <Badge variant="outline">Umriss</Badge>
            <Badge variant="muted">Gedämpft</Badge>
            <Badge variant="accent">Akzent</Badge>
            <Badge variant="warning">Warnung</Badge>
            <Badge variant="destructive">Gelöscht</Badge>
        </div>
    ),
};

/** Tonal status pills (with optional `dot`) for states like paid, pending, failed; AA-safe on their tint. */
export const StatusTones: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success" dot>
                Bezahlt
            </Badge>
            <Badge tone="warning" dot>
                Ausstehend
            </Badge>
            <Badge tone="destructive" dot>
                Fehlgeschlagen
            </Badge>
            <Badge tone="neutral">Entwurf</Badge>
            <Badge tone="muted">Archiviert</Badge>
            <Badge tone="faint">Inaktiv</Badge>
        </div>
    ),
};
