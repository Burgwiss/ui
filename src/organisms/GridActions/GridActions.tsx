import { Fragment, type ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import {
    formatShortcut,
    gridSelectionState,
    isGridActionDisabled,
    isMacPlatform,
    visibleGridActions,
    type GridActionItem,
    type RowId,
    type ShortcutLabels,
} from '../../hooks';
import { cn } from '../../lib/cn';
import {
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
} from '../../molecules/ContextMenu';

/** `aria-keyshortcuts` wants `Control`/`Meta`, not our `Mod`. */
function ariaShortcut(shortcut: string | undefined): string | undefined {
    if (!shortcut) return undefined;
    return shortcut.replace(/\bMod\b/g, isMacPlatform() ? 'Meta' : 'Control');
}

/**
 * A grid's action toolbar. Flat, like a desktop app's: no frame, one height,
 * icon buttons only — each with a tooltip naming it and its shortcut — thin
 * separators between groups, and at most one filled primary action
 * (`tone: 'primary'`).
 *
 * It shows only the actions whose `when` fits the selection: nothing, one row,
 * or many rows. `children` come first (GridPage puts "✕ 3 ausgewählt" there).
 *
 * Use it above a data grid where one list of actions (`GridActionItem`) also
 * drives the right-click menu (`GridActionMenuItems`); for a one-off button
 * row just use `Button`s.
 *
 * @summary Selection-aware icon toolbar for a grid: shows only the actions that fit no, one or many selected rows.
 */
export function GridActions({
    label,
    items = [],
    selectedIds = [],
    shortcutLabels,
    children,
}: {
    /** The toolbar's accessible name. */
    label: string;
    /**
     * The actions. Each one's `when` decides in which selection state (none, one, many) it shows;
     * `group` sets the separators. Default: none.
     */
    items?: GridActionItem[];
    /** Ids of the selected rows. The count picks the state; the ids are passed to each action's `onSelect`. */
    selectedIds?: RowId[];
    /** How key names in shortcut hints are written in the app's language, e.g. `{ Mod: 'Strg', Delete: 'Entf' }`. */
    shortcutLabels?: ShortcutLabels;
    /** Content placed before the actions, e.g. a "3 selected" chip with a clear button. */
    children?: ReactNode;
}) {
    const groups = visibleGridActions(items, gridSelectionState(selectedIds.length));
    return (
        <div role="toolbar" aria-label={label} className="flex min-w-0 items-center gap-1">
            {children}
            {groups.map((group, index) => (
                <Fragment key={group[0]?.id}>
                    {(index > 0 || children) && <GridActionsSeparator />}
                    {group.map((item) => (
                        <GridActionButton
                            key={item.id}
                            item={item}
                            ids={selectedIds}
                            shortcutLabels={shortcutLabels}
                        />
                    ))}
                </Fragment>
            ))}
        </div>
    );
}

/** The thin vertical divider between groups of actions in `GridActions`. */
export function GridActionsSeparator() {
    return <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

function GridActionButton({
    item,
    ids,
    shortcutLabels,
}: {
    item: GridActionItem;
    ids: RowId[];
    shortcutLabels?: ShortcutLabels;
}) {
    const disabled = isGridActionDisabled(item, ids);
    const reason = disabled ? item.disabledReason : undefined;
    const tooltip = (
        <span className="flex flex-col gap-0.5">
            <span className="flex items-center gap-3">
                <span className="font-medium">{item.label}</span>
                {item.shortcut && (
                    <kbd className="ml-auto font-sans text-muted-foreground">
                        {formatShortcut(item.shortcut, shortcutLabels)}
                    </kbd>
                )}
            </span>
            {reason && <span className="text-muted-foreground">{reason}</span>}
        </span>
    );
    return (
        <Button
            variant={item.tone === 'primary' ? 'default' : 'ghost'}
            size="icon"
            aria-label={item.label}
            aria-keyshortcuts={ariaShortcut(item.shortcut)}
            tooltip={tooltip}
            disabled={disabled}
            onClick={() => item.onSelect(ids)}
            className={cn(
                item.tone !== 'primary' && 'text-muted-foreground',
                item.tone === 'destructive' &&
                    'hover:bg-destructive hover:text-destructive-foreground',
            )}
        >
            {item.icon}
        </Button>
    );
}

/**
 * The same actions as menu items, for the grid's right-click menu. Render
 * inside a ContextMenuContent.
 */
export function GridActionMenuItems({
    items,
    ids,
    shortcutLabels,
}: {
    /** The actions already split into groups (as `visibleGridActions` returns); a separator is drawn between groups. */
    items: GridActionItem[][];
    /** The ids the actions apply to; passed to each `onSelect` and to `disabled` predicates. */
    ids: RowId[];
    /** How key names in shortcut hints are written in the app's language. */
    shortcutLabels?: ShortcutLabels;
}) {
    return (
        <>
            {items.map((group, index) => (
                <Fragment key={group[0]?.id}>
                    {index > 0 && <ContextMenuSeparator />}
                    {group.map((item) => {
                        const disabled = isGridActionDisabled(item, ids);
                        return (
                            <ContextMenuItem
                                key={item.id}
                                tone={item.tone === 'destructive' ? 'destructive' : 'default'}
                                disabled={disabled}
                                aria-keyshortcuts={ariaShortcut(item.shortcut)}
                                onSelect={() => item.onSelect(ids)}
                            >
                                {item.icon}
                                <span className="flex flex-col">
                                    <span className={cn(item.isDefault && 'font-semibold')}>
                                        {item.label}
                                    </span>
                                    {disabled && item.disabledReason && (
                                        <span className="text-xs text-muted-foreground">
                                            {item.disabledReason}
                                        </span>
                                    )}
                                </span>
                                {item.shortcut && (
                                    <ContextMenuShortcut>
                                        {formatShortcut(item.shortcut, shortcutLabels)}
                                    </ContextMenuShortcut>
                                )}
                            </ContextMenuItem>
                        );
                    })}
                </Fragment>
            ))}
        </>
    );
}
