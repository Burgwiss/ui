import { Slot } from 'radix-ui';
import {
    useRef,
    type ComponentProps,
    type KeyboardEvent,
    type PointerEvent,
    type ReactNode,
} from 'react';

import { useResizableWidth } from '../../hooks/useResizableWidth';
import { cn } from '../../lib/cn';

/** Which edge of the layout a `Sidebar` is docked to. */
export type SidebarSide = 'left' | 'right';

export interface SidebarProps {
    /** The panel's accessible name. */
    label: string;
    /** Which edge of the layout the panel sits on. The resize handle goes on the other edge. */
    side?: SidebarSide;
    /**
     * Makes the panel resizable. `label` names the handle for screen readers,
     * e.g. "Seitenleiste verbreitern oder verschmälern".
     */
    resize?: {
        /** Accessible name of the drag handle (a `separator`); visible to screen readers only. */
        label: string;
        /** Remember the width under this name, e.g. `'admin.courses'`. */
        storageKey?: string;
        /** Narrowest width in px. Default 200. */
        minWidth?: number;
        /** Widest width in px. Default 560. */
        maxWidth?: number;
    };
    /** Width in px — the starting width when resizable. Default 280. */
    defaultWidth?: number;
    /** Extra classes on the `<aside>`; its width is set inline, so size it with `defaultWidth` and `resize`. */
    className?: string;
    /** Compose with `SidebarHeader`, `SidebarContent`, `SidebarFooter` and the menu parts. */
    children: ReactNode;
}

const STEP = 16;
const BIG_STEP = 64;

/**
 * A docked side panel — left or right — for navigation or a form. Resizable
 * by dragging its inner edge or by keyboard (focus the handle: ← → step, Shift
 * for bigger steps, Home/End for the limits, Enter or double-click to reset),
 * and it remembers the width per `resize.storageKey`.
 *
 * The right width depends on the language and the screen, which no default
 * can know; a width that resets every visit is one nobody sets twice.
 *
 * Use it for a persistent panel beside the page (navigation, filters, an
 * inspector); for a temporary slide-over on mobile use `Sheet`, and for the
 * strip of app icons use `AppRail`. Compose it from `SidebarHeader`,
 * `SidebarContent`, `SidebarGroup`, `SidebarMenu` > `SidebarMenuItem` >
 * `SidebarMenuButton` and `SidebarFooter`.
 *
 * @summary Docked, optionally resizable left or right side panel with a menu building kit.
 */
export function Sidebar({
    label,
    side = 'left',
    resize,
    defaultWidth = 280,
    className,
    children,
}: SidebarProps) {
    const size = useResizableWidth({
        storageKey: resize?.storageKey,
        defaultWidth,
        minWidth: resize?.minWidth ?? 200,
        maxWidth: resize?.maxWidth ?? 560,
    });
    const width = resize ? size.width : defaultWidth;

    return (
        <aside
            aria-label={label}
            data-side={side}
            style={{ width }}
            className={cn(
                'relative flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground',
                side === 'left'
                    ? 'border-r border-sidebar-border'
                    : 'border-l border-sidebar-border',
                className,
            )}
        >
            {children}
            {resize && <SidebarResizeHandle side={side} label={resize.label} size={size} />}
        </aside>
    );
}

function SidebarResizeHandle({
    side,
    label,
    size,
}: {
    side: SidebarSide;
    label: string;
    size: ReturnType<typeof useResizableWidth>;
}) {
    const drag = useRef<{ x: number; width: number } | null>(null);
    // Dragging toward the page grows the panel: right for a left panel, left for a right one.
    const grow = side === 'left' ? 1 : -1;

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture?.(event.pointerId);
        drag.current = { x: event.clientX, width: size.width };
        document.body.style.setProperty('cursor', 'col-resize');
        document.body.style.setProperty('user-select', 'none');
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!drag.current) return;
        size.setWidth(drag.current.width + (event.clientX - drag.current.x) * grow);
    };
    const onPointerUp = () => {
        drag.current = null;
        document.body.style.removeProperty('cursor');
        document.body.style.removeProperty('user-select');
    };
    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? BIG_STEP : STEP;
        const keys: Record<string, () => void> = {
            ArrowRight: () => size.setWidth(size.width + step * grow),
            ArrowLeft: () => size.setWidth(size.width - step * grow),
            Home: () => size.setWidth(size.minWidth),
            End: () => size.setWidth(size.maxWidth),
            Enter: () => size.reset(),
        };
        const run = keys[event.key];
        if (!run) return;
        event.preventDefault();
        run();
    };

    return (
        // The WAI-ARIA window-splitter pattern: a focusable separator with a
        // value. ARIA counts it as a widget; the lint rule's role table does not.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
            role="separator"
            aria-label={label}
            aria-orientation="vertical"
            aria-valuenow={size.width}
            aria-valuemin={size.minWidth}
            aria-valuemax={size.maxWidth}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- window splitter, see above
            tabIndex={0}
            data-slot="sidebar-resize-handle"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={size.reset}
            onKeyDown={onKeyDown}
            className={cn(
                'group absolute inset-y-0 z-20 w-2 cursor-col-resize outline-none',
                side === 'left' ? '-right-1' : '-left-1',
            )}
        >
            <span
                aria-hidden="true"
                className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-transparent transition-colors group-hover:bg-ring group-focus-visible:bg-ring group-active:bg-ring"
            />
        </div>
    );
}

/** Fixed top block of a `Sidebar`, e.g. a title and search field. Does not scroll. */
export function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn('flex shrink-0 flex-col gap-2 p-3', className)} {...props} />;
}

/** The scrolling middle of a `Sidebar`: fills the space between header and footer. */
export function SidebarContent({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-2',
                className,
            )}
            {...props}
        />
    );
}

/** Fixed bottom block of a `Sidebar` with a top border, e.g. a count or account line. */
export function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-3',
                className,
            )}
            {...props}
        />
    );
}

/** A labelled block of menu items. */
export function SidebarGroup({
    label,
    children,
    className,
}: {
    /** Heading above the group; also its accessible name. Omit for an unlabelled group. */
    label?: string;
    /** Usually one `SidebarMenu`. */
    children: ReactNode;
    className?: string;
}) {
    return (
        <div role="group" aria-label={label} className={cn('flex flex-col gap-0.5', className)}>
            {label && (
                <div
                    aria-hidden="true"
                    className="px-2 pb-1 text-xs font-medium text-muted-foreground"
                >
                    {label}
                </div>
            )}
            {children}
        </div>
    );
}

/** The `<ul>` of menu entries inside a `SidebarGroup`; its children are `SidebarMenuItem`s. */
export function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
    return <ul className={cn('flex flex-col gap-0.5', className)} {...props} />;
}

/** The `<li>` wrapper for one `SidebarMenuButton`. */
export function SidebarMenuItem(props: ComponentProps<'li'>) {
    return <li {...props} />;
}

/**
 * A menu entry. Pass `asChild` to render your router's link; `active` marks
 * the current page (and sets `aria-current="page"`).
 */
export function SidebarMenuButton({
    asChild = false,
    active = false,
    className,
    ...props
}: ComponentProps<'button'> & {
    /** Render the child element (e.g. your router's link) instead of a `<button>`. */
    asChild?: boolean;
    /** Marks the current page: highlighted, and sets `aria-current="page"`. */
    active?: boolean;
}) {
    const Comp = asChild ? Slot.Root : 'button';
    return (
        <Comp
            data-active={active}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors outline-none',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                'focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                'data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground',
                '[&_svg]:size-4 [&_svg]:shrink-0',
                className,
            )}
            {...(asChild ? {} : { type: 'button' as const })}
            {...props}
        />
    );
}
