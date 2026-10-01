import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { SidebarLayout } from '../SidebarLayout';

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
export function AdminLayout({ rail, sidebar, children, className }: AdminLayoutProps) {
    return (
        <div className={cn('flex h-svh min-h-0 w-full bg-background text-foreground', className)}>
            {rail}
            <div className="min-w-0 flex-1">
                {sidebar ? (
                    <SidebarLayout sidebar={sidebar}>{children}</SidebarLayout>
                ) : (
                    <main className="relative h-full min-h-0 overflow-auto">{children}</main>
                )}
            </div>
        </div>
    );
}
