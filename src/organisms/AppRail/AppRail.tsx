import {
    forwardRef,
    type ComponentPropsWithoutRef,
    type ComponentType,
    type ElementType,
    type ReactNode,
    type Ref,
} from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../atoms/Tooltip';
import { cn } from '../../lib/cn';

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
export function AppRail({ label, logo, children, className }: AppRailProps) {
    return (
        <TooltipProvider delayDuration={200}>
            <nav
                aria-label={label}
                className={cn(
                    'flex h-full w-[68px] shrink-0 flex-col items-center gap-1 bg-rail px-1.5 py-3 text-rail-foreground',
                    className,
                )}
            >
                {logo && <div className="mb-2 flex justify-center">{logo}</div>}
                {children}
            </nav>
        </TooltipProvider>
    );
}

/** Flexible gap inside `AppRail`: pushes the items after it to the bottom of the rail. */
export function AppRailSpacer() {
    return <div aria-hidden="true" className="flex-1" />;
}

export interface AppRailItemProps
    extends Omit<ComponentPropsWithoutRef<'button'>, 'children' | 'onClick' | 'type'> {
    /** Icon component (e.g. a lucide icon); it is rendered decorative (`aria-hidden`), the `label` names the item. */
    icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
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
export const AppRailItem = forwardRef<HTMLElement, AppRailItemProps>(function AppRailItem(
    { icon: Icon, label, active, href, as, onClick, className: extra, ...rest },
    ref,
) {
    const className = cn(
        'flex w-full flex-col items-center gap-1 rounded-lg py-2 text-[10.5px] leading-none font-medium transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-rail-foreground',
        extra,
        active
            ? 'bg-rail-accent text-rail-foreground'
            : 'text-rail-muted-foreground hover:bg-rail-accent hover:text-rail-foreground',
    );
    const content = (
        <>
            <Icon className="size-5" aria-hidden="true" />
            <span className="max-w-full truncate px-0.5">{label}</span>
        </>
    );
    const Link = as ?? 'a';
    const control =
        href !== undefined ? (
            <Link
                {...rest}
                ref={ref}
                href={href}
                onClick={onClick}
                aria-current={active ? 'page' : undefined}
                className={className}
            >
                {content}
            </Link>
        ) : (
            <button
                {...rest}
                ref={ref as Ref<HTMLButtonElement>}
                type="button"
                onClick={onClick}
                aria-pressed={active}
                className={className}
            >
                {content}
            </button>
        );
    return (
        <Tooltip>
            <TooltipTrigger asChild>{control}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
    );
});
