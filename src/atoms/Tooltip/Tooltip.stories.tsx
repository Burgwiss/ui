import type { Meta, StoryObj } from '@storybook/react-vite';
import { Info } from 'lucide-react';

import { Button } from '../../atoms/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

const meta = {
    title: 'Atoms/Tooltip',
    component: Tooltip,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A hint on a text button: the basic Provider, Trigger and Content composition.
 *
 * The Storybook env already wraps everything in a TooltipProvider; the local
 * provider here mirrors the registry sample and is harmless (nesting is fine).
 */
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

/** Bubble forced open with `defaultOpen`, to review its style without hovering. */
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

/**
 * A hint on an icon-only trigger; the button still needs an `aria-label`
 * (tooltip text is not always announced). Prefer `IconButton` in app code.
 */
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
