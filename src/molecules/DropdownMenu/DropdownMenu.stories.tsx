import type { Meta, StoryObj } from '@storybook/react-vite';
import { EllipsisVertical } from 'lucide-react';
import * as React from 'react';

import { Button } from '../../atoms/Button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './DropdownMenu';

const meta = {
    title: 'Molecules/DropdownMenu',
    component: DropdownMenu,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The standard "more actions" menu: an icon trigger opening label, items and a destructive item.
 *
 * Proven render adapted from design-system/registry.tsx (entry id: 'dropdown-menu').
 * The trigger renders inline; the menu surface is a portal opened on click.
 */
export const Default: Story = {
    render: () => (
        <div className="p-6">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Open menu">
                        <EllipsisVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
};

/**
 * Review the whole open menu without clicking: `defaultOpen` shows label, items, separator and destructive item.
 *
 * `modal={false}`: an always-open modal menu hides the rest of the page from
 * screen readers while it still holds focusable elements — real-browser axe
 * (aria-hidden-focus) flags that. Non-modal shows the same surface honestly.
 */
export const Open: Story = {
    render: () => (
        <div className="p-6">
            <DropdownMenu defaultOpen modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Open menu">
                        <EllipsisVertical className="size-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
};

// Checkbox items track their own state — a small stateful wrapper drives the
// `checked` props so the menu behaves like a real column-visibility toggle.
function CheckboxMenu() {
    const [showStatus, setShowStatus] = React.useState(true);
    const [showRole, setShowRole] = React.useState(false);

    return (
        <DropdownMenu defaultOpen modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={showStatus} onCheckedChange={setShowStatus}>
                    Status
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={showRole} onCheckedChange={setShowRole}>
                    Role
                </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

/** Use checkbox items for toggles such as table column visibility; the parent owns each `checked` value. */
export const WithCheckboxItems: Story = {
    render: () => (
        <div className="p-6">
            <CheckboxMenu />
        </div>
    ),
};
