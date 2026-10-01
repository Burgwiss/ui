import { EllipsisVertical } from 'lucide-react';
import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '../../molecules/DropdownMenu';

/** `aria-keyshortcuts` wants `Control`/`Meta`, not our `Mod`. */
function ariaShortcut(shortcut: string | undefined): string | undefined {
    if (!shortcut) return undefined;
    return shortcut.replace(/\bMod\b/g, isMacPlatform() ? 'Meta' : 'Control');
}

/** Space between two buttons: the toolbar's `gap-1`. */
const GAP = 4;

/**
 * A grid's action toolbar. Flat, like a desktop app's: no frame, one height,
 * one plain line of icon buttons — each with a tooltip naming it and its
 * shortcut — and at most one filled primary action (`tone: 'primary'`).
 *
 * It shows only the actions whose `when` fits the selection: nothing, one row,
 * or many rows. `children` come first (GridPage puts "✕ 3 ausgewählt" there).
 * It takes the room it is given (put it in a flex row); with `moreLabel`, the
 * icons that do not fit go behind a "…" menu, in order, and come back when
 * there is room again. Their keyboard shortcuts keep working either way.
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
    moreLabel,
    children,
}: {
    /** The toolbar's accessible name. */
    label: string;
    /** Name and tooltip of the "…" menu for the actions that do not fit, e.g. "Weitere Aktionen". Without it nothing overflows. */
    moreLabel?: string;
    /**
     * The actions. Each one's `when` decides in which selection state (none, one, many) it shows;
     * `group` orders them and separates them in the menus. Default: none.
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
    const flat = groups.flat();
    const barRef = useRef<HTMLDivElement>(null);
    const leadRef = useRef<HTMLDivElement>(null);
    const [room, setRoom] = useState<{ bar: number; lead: number; button: number } | null>(null);

    useLayoutEffect(() => {
        const bar = barRef.current;
        if (!bar || !moreLabel) return;
        const measure = () => {
            const width = bar.getBoundingClientRect().width;
            const button = bar.querySelector('button')?.getBoundingClientRect().width;
            // No layout (jsdom, display: none): show everything rather than guess.
            if (!width) return setRoom(null);
            setRoom((prev) => ({
                bar: width,
                lead: leadRef.current?.getBoundingClientRect().width ?? 0,
                button: button || prev?.button || 32,
            }));
        };
        const observer = new ResizeObserver(measure);
        observer.observe(bar);
        if (leadRef.current) observer.observe(leadRef.current);
        return () => observer.disconnect();
    }, [moreLabel]);

    let fit = flat.length;
    if (room && moreLabel) {
        const available = room.bar - (room.lead ? room.lead + GAP : 0);
        const slot = room.button + GAP;
        if (flat.length * slot - GAP > available)
            fit = Math.max(0, Math.floor((available + GAP) / slot) - 1);
    }
    // While the "…" menu is open the split holds still: opening it can free room
    // (an empty search closes on blur), and the menu must not vanish under the pointer.
    const [frozen, setFrozen] = useState<number | null>(null);
    if (frozen !== null) fit = frozen;
    const shown = new Set(flat.slice(0, fit).map((i) => i.id));
    const hidden = groups
        .map((group) => group.filter((i) => !shown.has(i.id)))
        .filter((group) => group.length > 0);

    return (
        <div
            ref={barRef}
            role="toolbar"
            aria-label={label}
            className="flex min-w-0 flex-1 items-center gap-1"
        >
            <div ref={leadRef} className="flex shrink-0 items-center gap-1 empty:hidden">
                {children}
            </div>
            {flat
                .filter((item) => shown.has(item.id))
                .map((item) => (
                    <GridActionButton
                        key={item.id}
                        item={item}
                        ids={selectedIds}
                        shortcutLabels={shortcutLabels}
                    />
                ))}
            {moreLabel && hidden.length > 0 && (
                <DropdownMenu onOpenChange={(open) => setFrozen(open ? fit : null)}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={moreLabel}
                            tooltip={moreLabel}
                            className="shrink-0 text-muted-foreground"
                        >
                            <EllipsisVertical aria-hidden="true" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-60">
                        {hidden.map((group, index) => (
                            <Fragment key={group[0]!.id}>
                                {index > 0 && <DropdownMenuSeparator />}
                                {group.map((item) => (
                                    <DropdownMenuItem
                                        key={item.id}
                                        disabled={isGridActionDisabled(item, selectedIds)}
                                        aria-keyshortcuts={ariaShortcut(item.shortcut)}
                                        onSelect={() => item.onSelect(selectedIds)}
                                        className={cn(
                                            item.tone === 'destructive' &&
                                                'data-[highlighted]:bg-destructive data-[highlighted]:text-destructive-foreground data-[highlighted]:[&_svg]:text-destructive-foreground',
                                        )}
                                    >
                                        <span className="text-muted-foreground [&_svg]:size-4">
                                            {item.icon}
                                        </span>
                                        {item.label}
                                        {item.shortcut && (
                                            <DropdownMenuShortcut>
                                                {formatShortcut(item.shortcut, shortcutLabels)}
                                            </DropdownMenuShortcut>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </Fragment>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
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
                    <kbd className="ms-auto font-sans text-muted-foreground">
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
