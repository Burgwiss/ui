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
        children: 'Button',
        variant: 'default',
        size: 'default',
    },
    argTypes: {
        variant: { control: 'select', options: VARIANTS },
        size: {
            control: 'select',
            options: ['default', 'xs', 'sm', 'lg', 'icon', 'icon-xs', 'icon-sm', 'icon-lg'],
        },
        disabled: { control: 'boolean' },
        asChild: { table: { disable: true } },
    },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

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
