import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
/**
 * Shows or hides one region on demand: a `CollapsibleTrigger` (which carries `aria-expanded`)
 * toggles a `CollapsibleContent`. Use it for a single disclosure, such as advanced settings
 * or a mobile nav section; for a set of mutually exclusive views use `Tabs`, and for a
 * floating panel use `Popover`. Uncontrolled by default; pass `open` and `onOpenChange` to
 * control it, or `defaultOpen` to start expanded. It ships with no animation on purpose.
 *
 * Design note (why it is not animated):
 *
 * #1632 named this primitive in the motion dial's bounded scope, and it was
 * deliberately left OUT of that rework — a judgement call worth recording
 * rather than a silent gap.
 *
 * This component ships with NO animation at all today: no `animate-in` /
 * `animate-out`, no duration, nothing — `CollapsibleContent` toggles purely
 * via Radix's own mount/unmount. Wiring it to `--motion-duration` would mean
 * ADDING `tw-animate-css`'s `animate-collapsible-down` / `-up` keyframes
 * (they exist in the installed package, unused here), which changes more
 * than a number: Radix's `Presence` primitive detects a CSS animation on an
 * element and, once one is present, DEFERS removing it from the DOM until
 * `animationend` fires — today (no animation) it removes SYNCHRONOUSLY. Two
 * of this repo's own usages (`PublicNav.tsx`'s mobile disclosure,
 * `AdminSidebar.tsx`'s nav groups) have SYNCHRONOUS
 * `expect(...).not.toBeInTheDocument()` assertions immediately after a
 * collapse click (`tests/js/components/PublicNav.test.tsx`), which would
 * start failing in jsdom the moment a real CSS animation — even a `0ms` one
 * gated to preserve "today's render" — is attached, because jsdom does not
 * fire `animationend` the way a real browser does. That is the "unbounded
 * change" the epic's own scoping note warned about, discovered rather than
 * assumed. Left unconsumed; a future pass that also updates the affected
 * Presence-timing assertions can pick this back up.
 *
 * @summary Single show/hide disclosure: a trigger toggles a content region, with no animation.
 */
declare const Collapsible: React.ForwardRefExoticComponent<Omit<CollapsiblePrimitive.CollapsibleProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The control that toggles the region; use `asChild` to make your own `Button` the trigger. */
declare const CollapsibleTrigger: React.ForwardRefExoticComponent<Omit<CollapsiblePrimitive.CollapsibleTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** The region that is shown or hidden; it is removed from the DOM while collapsed. */
declare const CollapsibleContent: React.ForwardRefExoticComponent<Omit<CollapsiblePrimitive.CollapsibleContentProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Collapsible, CollapsibleContent, CollapsibleTrigger };
