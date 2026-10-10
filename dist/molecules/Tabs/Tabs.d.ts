import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
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
declare const Tabs: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The row of triggers; wraps onto several lines when narrow. It needs an accessible name (`aria-label`). */
declare const TabsList: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsListProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** One tab button; its `value` matches a `TabsContent`. The active one gets a primary underline; on touch it is at least 44px high. */
declare const TabsTrigger: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** The panel shown while the trigger with the same `value` is active; inactive panels are not rendered. */
declare const TabsContent: React.ForwardRefExoticComponent<Omit<TabsPrimitive.TabsContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Tabs, TabsList, TabsTrigger, TabsContent };
