import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

/**
 * Underlined tabs for switching between panels of content on one page; the row wraps rather
 * than scrolling sideways, so no tab is hidden off-screen. For a pill-shaped control use
 * `SegmentedTabs`; for a single show/hide region use `Collapsible`. Compose it from
 * `TabsList`, `TabsTrigger`s and matching `TabsContent`s (linked by `value`). Uncontrolled
 * with `defaultValue`, or controlled with `value` and `onValueChange`; give the list an
 * `aria-label`.
 *
 * @summary Underlined tabs that switch a panel of content, built on Radix Tabs.
 */
const Tabs = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(function Tabs({ className, ...props }, ref) {
    return (
        <TabsPrimitive.Root
            ref={ref}
            data-slot="tabs"
            className={cn('flex flex-col gap-4', className)}
            {...props}
        />
    );
});
Tabs.displayName = 'Tabs';

/** The row of triggers; wraps onto several lines when narrow. It needs an accessible name (`aria-label`). */
const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
    return (
        <TabsPrimitive.List
            ref={ref}
            data-slot="tabs-list"
            className={cn(
                // `flex-wrap`: the row neither wrapped nor scrolled, and
                // `TabsTrigger` is `whitespace-nowrap` with `min-width: auto`,
                // so nothing could shrink and the overflow went to the
                // DOCUMENT. Measured inside the admin category form's card at
                // 375px (375 − 32 page padding − 48 section padding = 295px of
                // content box): two German locale tabs fit at ~181px, a third
                // short name at ~272px, a third LONG one ("Französisch") is
                // ~298px — over — and four is ~385px, which spills past the
                // card's right edge and puts a horizontal scrollbar on the
                // whole admin page. Wrapping rather than `overflow-x-auto`
                // because these are labels, not a carousel: a tab a thumb has
                // to discover by scrolling sideways is a tab nobody finds.
                'inline-flex w-full flex-wrap items-center gap-1 rounded-md border-b border-border bg-transparent p-0',
                className,
            )}
            {...props}
        />
    );
});
TabsList.displayName = 'TabsList';

/** One tab button; its `value` matches a `TabsContent`. The active one gets a primary underline; on touch it is at least 44px high. */
const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
    return (
        <TabsPrimitive.Trigger
            ref={ref}
            data-slot="tabs-trigger"
            className={cn(
                'inline-flex items-center justify-center rounded-t-md border-b-2 border-transparent px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors',
                // `py-2` + a `text-sm` line box is 8 + 20 + 8 = 36px, eight
                // pixels under the 44×44 floor the architecture doc states and
                // the rest of this repo honours with exactly this variant (66
                // occurrences across 20 files, including the public footer
                // links). Width is fine (~85–92px), so the miss is height-only
                // — which is why it reads as "the button is unresponsive"
                // rather than "I hit the wrong button": the tap lands in the
                // 8px dead band and nothing happens. `pointer-coarse` so the
                // mouse/keyboard density of all 47 call sites is unchanged.
                'pointer-coarse:min-h-11',
                'hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                'data-[state=active]:border-primary data-[state=active]:text-foreground',
                // NOT fixed here, deliberately: an unselected `TabsContent` has
                // no children in the DOM (Radix renders `present && children`),
                // so an `InputError` inside one never mounts and a 422 on a
                // hidden locale panel shows the admin nothing. `forceMount` is
                // not the answer — it keeps the panel mounted under `hidden`,
                // where a `role="alert"` is neither announced nor visible, so
                // the error would still be invisible and now also untabbable.
                // The only element that is ALWAYS rendered is the trigger, and
                // marking the right trigger needs the error bag, which lives in
                // the consumer (`LocaleTabs`). This primitive stays unopinionated.
                'disabled:pointer-events-none disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
});
TabsTrigger.displayName = 'TabsTrigger';

/** The panel shown while the trigger with the same `value` is active; inactive panels are not rendered. */
const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
    return (
        <TabsPrimitive.Content
            ref={ref}
            data-slot="tabs-content"
            className={cn(
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                className,
            )}
            {...props}
        />
    );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
