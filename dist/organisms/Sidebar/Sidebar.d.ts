import { type ComponentProps, type ReactNode } from 'react';
/** Which edge of the layout a `Sidebar` is docked to. */
export type SidebarSide = 'left' | 'right';
export interface SidebarProps {
    /** The panel's accessible name. */
    label: string;
    /** Which edge of the layout the panel sits on: `left` is the start edge, so it is the right under `dir="rtl"`. The resize handle goes on the other edge. */
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
export declare function Sidebar({ label, side, resize, defaultWidth, className, children, }: SidebarProps): import("react").JSX.Element;
/** Fixed top block of a `Sidebar`, e.g. a title and search field. Does not scroll. */
export declare function SidebarHeader({ className, ...props }: ComponentProps<'div'>): import("react").JSX.Element;
/** The scrolling middle of a `Sidebar`: fills the space between header and footer. */
export declare function SidebarContent({ className, ...props }: ComponentProps<'div'>): import("react").JSX.Element;
/** Fixed bottom block of a `Sidebar` with a top border, e.g. a count or account line. */
export declare function SidebarFooter({ className, ...props }: ComponentProps<'div'>): import("react").JSX.Element;
/** A labelled block of menu items. */
export declare function SidebarGroup({ label, children, className, }: {
    /** Heading above the group; also its accessible name. Omit for an unlabelled group. */
    label?: string;
    /** Usually one `SidebarMenu`. */
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
/** The `<ul>` of menu entries inside a `SidebarGroup`; its children are `SidebarMenuItem`s. */
export declare function SidebarMenu({ className, ...props }: ComponentProps<'ul'>): import("react").JSX.Element;
/** The `<li>` wrapper for one `SidebarMenuButton`. */
export declare function SidebarMenuItem(props: ComponentProps<'li'>): import("react").JSX.Element;
/**
 * A menu entry. Pass `asChild` to render your router's link; `active` marks
 * the current page (and sets `aria-current="page"`).
 */
export declare function SidebarMenuButton({ asChild, active, className, ...props }: ComponentProps<'button'> & {
    /** Render the child element (e.g. your router's link) instead of a `<button>`. */
    asChild?: boolean;
    /** Marks the current page: highlighted, and sets `aria-current="page"`. */
    active?: boolean;
}): import("react").JSX.Element;
