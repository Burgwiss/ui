import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown } from 'lucide-react';

import { Button } from '../../atoms/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './Collapsible';

const meta = {
    title: 'Molecules/Collapsible',
    component: Collapsible,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The standard disclosure: collapsed at first, opened by a full-width ghost button. */
export const Default: Story = {
    render: () => (
        <Collapsible className="w-80 rounded-lg border border-border p-3">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                    Erweiterte Einstellungen
                    <ChevronDown aria-hidden="true" />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
                Warteliste, Teilnehmerlimit und Anmeldefrist.
            </CollapsibleContent>
        </Collapsible>
    ),
};

/** Use `defaultOpen` when the content should be visible on first render, e.g. help text. */
export const InitiallyOpen: Story = {
    render: () => (
        <Collapsible defaultOpen className="w-80 rounded-lg border border-border p-3">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                    Hilfe
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
                Schreib uns, wenn etwas unklar ist.
            </CollapsibleContent>
        </Collapsible>
    ),
};
