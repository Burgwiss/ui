import { Columns3, Rows3, Rows4 } from 'lucide-react';
import type { ReactNode } from 'react';

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../DropdownMenu';
import { IconButton } from '../../molecules/IconButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../molecules/Tooltip';

/**
 * A grid's action toolbar: one bordered strip of icon buttons, each with a
 * tooltip and an aria-label. Sits at the left of a GridPage toolbar.
 */
export function GridActions({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div
            role="toolbar"
            aria-label={label}
            className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-background p-0.5"
        >
            {children}
        </div>
    );
}

export function GridActionsSeparator() {
    return <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-border" />;
}

/** The one "create" action, filled so it stands out from the tools around it. */
export function GridCreateAction({
    label,
    icon,
    onClick,
}: {
    label: string;
    icon: ReactNode;
    onClick: () => void;
}) {
    return (
        <IconButton
            label={label}
            icon={icon}
            onClick={onClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
        />
    );
}

/** Row density as a single toggle. The label names what a click switches TO. */
export function GridDensityAction({
    compact,
    onChange,
    labels,
}: {
    compact: boolean;
    onChange: (compact: boolean) => void;
    labels: { compact: string; comfortable: string };
}) {
    return (
        <IconButton
            label={compact ? labels.comfortable : labels.compact}
            aria-pressed={compact}
            icon={
                compact ? (
                    <Rows3 className="size-4" aria-hidden="true" />
                ) : (
                    <Rows4 className="size-4" aria-hidden="true" />
                )
            }
            onClick={() => onChange(!compact)}
        />
    );
}

/** Column visibility picker behind an icon. */
export function GridColumnsAction({
    columns,
    visibility,
    onToggle,
    label,
}: {
    columns: { id: string; label: string }[];
    visibility: Record<string, boolean>;
    onToggle: (id: string, visible: boolean) => void;
    label: string;
}) {
    return (
        <DropdownMenu>
            <TooltipProvider delayDuration={200}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label={label}
                                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            >
                                <Columns3 className="size-4" aria-hidden="true" />
                            </button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent align="start">
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((c) => (
                    <DropdownMenuCheckboxItem
                        key={c.id}
                        checked={visibility[c.id] !== false}
                        onCheckedChange={(v) => onToggle(c.id, v === true)}
                        onSelect={(e) => e.preventDefault()}
                    >
                        {c.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
