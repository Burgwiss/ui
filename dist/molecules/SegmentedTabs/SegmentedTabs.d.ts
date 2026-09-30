import { Tabs as TabsPrimitive } from 'radix-ui';
import * as React from 'react';
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
declare const SegmentedTabs: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The raised track that holds the segments; it needs an accessible name (`aria-label`). */
declare const SegmentedTabsList: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** One segment; its `value` matches a `SegmentedTabsContent`. The active one is filled with the primary colour. */
declare const SegmentedTab: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** The panel shown while the tab with the same `value` is active; inactive panels are not rendered. */
declare const SegmentedTabsContent: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { SegmentedTabs, SegmentedTabsList, SegmentedTab, SegmentedTabsContent };
