import type { Meta, StoryObj } from '@storybook/react-vite';
import { Info } from 'lucide-react';

import { Button } from '../../atoms/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

const meta = {
    title: 'Molecules/Tooltip',
    component: Tooltip,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// Proven render copied from design-system/registry.tsx (entry id: 'tooltip').
// The Storybook env already wraps everything in a TooltipProvider; the local
// provider here mirrors the registry sample and is harmless (nesting is fine).
export const Default: Story = {
    render: () => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                        Hover me
                    </Button>
                </TooltipTrigger>
                <TooltipContent>More detail here</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ),
};

// `defaultOpen` forces the floating bubble visible so the content style is
// reviewable in Storybook without hover/focus interaction.
export const Open: Story = {
    render: () => (
        <TooltipProvider>
            <Tooltip defaultOpen>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="sm">
                        Always-open tooltip
                    </Button>
                </TooltipTrigger>
                <TooltipContent>This bubble is shown via defaultOpen</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ),
};

// Icon-only trigger — the tooltip supplies the visual hint; in real app code
// the button still needs an aria-label (tooltip text is not always announced).
export const IconOnly: Story = {
    name: 'Icon-only trigger',
    render: () => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="More information">
                        <Info className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>More information</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ),
};
