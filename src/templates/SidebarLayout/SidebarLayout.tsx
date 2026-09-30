import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface SidebarLayoutProps {
    /** Usually a `Sidebar`. It sits on the `side` edge. */
    sidebar: ReactNode;
    /** Default `'left'`. Pass the same side to the `Sidebar` so its resize handle faces the main area. */
    side?: 'left' | 'right';
    /** The main area. Scrolls on its own; the sidebar stays put. */
    children: ReactNode;
    /** Extra classes merged onto the layout's root element (it is `h-full w-full`; size its parent). */
    className?: string;
}

/**
 * The page skeleton for a sidebar next to a main area, filling the height and
 * width of its container (give the parent a height). Nothing more: no header,
 * no padding, no chrome, those belong to what goes inside. Pass a `Sidebar` as
 * `sidebar` and the page content as children; the main area scrolls on its own. For
 * a list page with a toolbar use `GridPage`; for a messaging page `ChatPage`.
 *
 * @summary Layout with a sidebar on one side and a scrolling main area, filling its container.
 */
export function SidebarLayout({ sidebar, side = 'left', children, className }: SidebarLayoutProps) {
    const main = <main className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>;
    // DOM order follows the visual order, so reading and Tab order match what is seen.
    return (
        <div className={cn('flex h-full min-h-0 w-full', className)}>
            {side === 'left' && sidebar}
            {main}
            {side === 'right' && sidebar}
        </div>
    );
}
