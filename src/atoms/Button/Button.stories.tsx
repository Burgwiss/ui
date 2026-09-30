import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';

const VARIANTS = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const;
const SIZES = ['default', 'xs', 'sm', 'lg'] as const;

function PlusIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
    );
}

const meta = {
    title: 'Atoms/Button',
    component: Button,
    tags: ['autodocs'],
    args: {
        children: 'Speichern',
        variant: 'default',
        size: 'default',
        tooltip: 'Änderungen speichern und veröffentlichen',
    },
    argTypes: {
        variant: { control: 'select', options: VARIANTS },
        size: {
            control: 'select',
            options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
        },
        disabled: { control: 'boolean' },
        tooltip: { control: 'text' },
        tooltipSide: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
        asChild: { table: { disable: true } },
    },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Try any variant, size, disabled state and tooltip from the controls panel. */
export const Playground: Story = {};

/** Pick the emphasis: `default` for the one primary action, `destructive` for deletions, the rest for secondary actions. */
export const Variants: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            {VARIANTS.map((variant) => (
                <Button key={variant} variant={variant}>
                    {variant}
                </Button>
            ))}
        </div>
    ),
};

/** Pick the density: text sizes `xs` to `lg`, and the square icon sizes for icon-only buttons. */
export const Sizes: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            {SIZES.map((size) => (
                <Button key={size} size={size}>
                    {size}
                </Button>
            ))}
            <Button size="icon" aria-label="Add">
                <PlusIcon />
            </Button>
            <Button size="icon-sm" variant="outline" aria-label="Add">
                <PlusIcon />
            </Button>
        </div>
    ),
};

/** Default, disabled and destructive side by side, to compare how blocked actions look. */
export const States: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="destructive" disabled>
                Delete
            </Button>
        </div>
    ),
};

/** A text button explains its consequence — not its own label again. */
export const WithTooltip: Story = {
    name: 'Mit Tooltip',
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <Button tooltip="Kurs für alle Teilnehmenden sichtbar machen">Veröffentlichen</Button>
            <Button variant="outline" tooltip="Legt eine Kopie mit allen Lektionen an">
                Duplizieren
            </Button>
            <Button variant="destructive" tooltip="Kann 30 Tage lang wiederhergestellt werden">
                Löschen
            </Button>
        </div>
    ),
};

/** Icon-only: the `aria-label` is the tooltip. One string, two jobs, no drift. */
export const IconOnly: Story = {
    name: 'Nur Icon',
    render: () => (
        <div className="flex flex-wrap items-center gap-2">
            <Button size="icon" aria-label="Neuer Kurs">
                <PlusIcon />
            </Button>
            <Button size="icon-sm" variant="outline" tooltip="Neuer Ordner">
                <PlusIcon />
            </Button>
        </div>
    ),
};

/**
 * A disabled button still answers "why can't I click this?". The tooltip opens
 * on hover and on Tab focus, through a focusable wrapper.
 */
export const DisabledWithReason: Story = {
    name: 'Deaktiviert mit Grund',
    render: () => (
        <Button disabled tooltip="Erst eine Lektion anlegen, dann veröffentlichen">
            Veröffentlichen
        </Button>
    ),
};

/** Move the tooltip with `tooltipSide` when the default `top` would be clipped or cover content. */
export const Sides: Story = {
    name: 'Seiten',
    render: () => (
        <div className="grid grid-cols-2 gap-3">
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
                <Button key={side} variant="outline" tooltip={`Öffnet ${side}`} tooltipSide={side}>
                    {side}
                </Button>
            ))}
        </div>
    ),
};
