import { type ComponentPropsWithoutRef, type ComponentType, type ElementType, type ReactNode } from 'react';
export interface AppRailProps {
    /** The nav's accessible name, e.g. "Apps". */
    label: string;
    /** Brand mark at the top — usually a link home. */
    logo?: ReactNode;
    /** `AppRailItem`s, plus an optional `AppRailSpacer` to push the following items to the bottom. */
    children: ReactNode;
    /** Extra classes on the `<nav>`; the rail is a fixed 68px wide, full-height column. */
    className?: string;
}
/**
 * The narrow dark strip of app switches at the far left of an app shell: a
 * logo, then one icon-over-word button per app, a flexible gap, and the apps
 * that belong at the bottom (settings, operations). Use it for switching
 * between top-level apps; for the menu of the current app use `Sidebar`.
 *
 *   <AppRail label="Apps" logo={…}>
 *     <AppRailItem icon={House} label="Start" href="/" active />
 *     <AppRailItem icon={BookOpen} label="Kurse" onClick={…} />
 *     <AppRailSpacer />
 *     <AppRailItem icon={Settings2} label="Betrieb" onClick={…} />
 *   </AppRail>
 *
 * Colours come from the `--rail*` tokens, dark in both modes.
 *
 * @summary Dark left-hand rail of icon-over-word app switches (`AppRailItem`) for an app shell.
 */
export declare function AppRail({ label, logo, children, className }: AppRailProps): import("react").JSX.Element;
/** Flexible gap inside `AppRail`: pushes the items after it to the bottom of the rail. */
export declare function AppRailSpacer(): import("react").JSX.Element;
export interface AppRailItemProps extends Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'onClick' | 'type'> {
    /** Icon component (e.g. a lucide icon); it is rendered decorative (`aria-hidden`), the `label` names the item. */
    icon: ComponentType<{
        className?: string;
        'aria-hidden'?: boolean | 'true';
    }>;
    /** Shown under the icon and in the tooltip. Short: the rail is 68px wide. */
    label: string;
    /**
     * The current app. A link gets `aria-current="page"`, a button `aria-pressed`.
     * Leave it out for a button that opens something (e.g. an account menu as a
     * `DropdownMenuTrigger asChild`): then it is a plain button, not a toggle.
     */
    active?: boolean;
    /** Renders a link. Pass `as` for a router link (e.g. Inertia's `Link`). */
    href?: string;
    /** The element for `href` — default `'a'`. */
    as?: ElementType;
    /** Click handler. With `href` it runs on the link click; without `href` it is the button's action. */
    onClick?: () => void;
}
/**
 * One app on the rail: icon over a short word, with the label repeated as a
 * tooltip on the right. A link when it navigates, a button when it only
 * switches the menu beside the rail. It forwards its ref and extra props to
 * the control, so it can be a menu trigger (`DropdownMenuTrigger asChild`).
 */
export declare const AppRailItem: import("react").ForwardRefExoticComponent<AppRailItemProps & import("react").RefAttributes<HTMLElement>>;
