import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '../../lib/cn';

/**
 * Pill-shaped tabs that switch a panel of content on phone-style surfaces. They are the web
 * counterpart of the native app's sub-tab
 * control (`mobile/screens/tabs/LiveHomeScreen.tsx`): a muted rounded track
 * with the active segment raised on a card background. Built on Radix Tabs, so
 * it inherits roving focus, arrow-key navigation, and `role="tablist"/"tab"` +
 * `aria-selected` for free. Use on phone surfaces that mirror the app; desktop
 * surfaces can keep their own layout.
 *
 * `SegmentedTabs` (Root) and `SegmentedTabsContent` are thin pass-throughs of
 * the Radix primitives so a page imports one family. Use it to swap a panel of content; to
 * pick a value you submit use `SegmentedChoice`, and for underlined tabs use `Tabs`.
 * Compose it from `SegmentedTabsList`, `SegmentedTab`s and matching `SegmentedTabsContent`s
 * (linked by `value`); give the list an `aria-label`.
 *
 * @summary Pill-shaped tabs that switch a panel of content, built on Radix Tabs.
 */
const SegmentedTabs = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(function SegmentedTabs({ className, ...props }, ref) {
    return (
        <TabsPrimitive.Root
            ref={ref}
            data-slot="segmented-tabs"
            className={cn('flex flex-col gap-4', className)}
            {...props}
        />
    );
});
SegmentedTabs.displayName = 'SegmentedTabs';

/** The raised track that holds the segments; it needs an accessible name (`aria-label`). */
const SegmentedTabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function SegmentedTabsList({ className, ...props }, ref) {
    return (
        <TabsPrimitive.List
            ref={ref}
            data-slot="segmented-tabs-list"
            className={cn(
                // Raised card track + border so the control reads as a
                // segmented control even on a muted page background.
                'flex w-full gap-1 rounded-lg border border-border bg-card p-1 shadow-sm',
                className,
            )}
            {...props}
        />
    );
});
SegmentedTabsList.displayName = 'SegmentedTabsList';

/** One segment; its `value` matches a `SegmentedTabsContent`. The active one is filled with the primary colour. */
const SegmentedTab = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function SegmentedTab({ className, ...props }, ref) {
    return (
        <TabsPrimitive.Trigger
            ref={ref}
            data-slot="segmented-tab"
            className={cn(
                // ≥44px touch target, like the app's SegmentButton.
                'inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm',
                'disabled:pointer-events-none disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
});
SegmentedTab.displayName = 'SegmentedTab';

/** The panel shown while the tab with the same `value` is active; inactive panels are not rendered. */
const SegmentedTabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function SegmentedTabsContent({ className, ...props }, ref) {
    return (
        <TabsPrimitive.Content
            ref={ref}
            data-slot="segmented-tabs-content"
            className={cn('focus-visible:outline-none', className)}
            {...props}
        />
    );
});
SegmentedTabsContent.displayName = 'SegmentedTabsContent';

export { SegmentedTabs, SegmentedTabsList, SegmentedTab, SegmentedTabsContent };
