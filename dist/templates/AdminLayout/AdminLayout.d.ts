import type { ReactNode } from 'react';
export interface AdminLayoutProps {
    /** The app switcher at the far left — an `AppRail`. */
    rail: ReactNode;
    /** The chosen app's own menu — a `Sidebar` (left, usually resizable). Omit for a full-width page. */
    sidebar?: ReactNode;
    /** The page. Scrolls on its own; rail and sidebar stay put. */
    children: ReactNode;
    className?: string;
}
/**
 * The admin shell: app rail, the app's sidebar, then the page. Fills the
 * viewport. A template with slots only — the app decides which apps, menu
 * entries and page go in.
 *
 * @summary Admin page shell: AppRail + Sidebar + main area.
 */
export declare function AdminLayout({ rail, sidebar, children, className }: AdminLayoutProps): import("react").JSX.Element;
