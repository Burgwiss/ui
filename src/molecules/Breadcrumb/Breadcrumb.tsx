import { cn } from '../../lib/cn';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';

/**
 * The navigation trail to the current page (`<nav>`). Use it on pages nested two or more
 * levels deep; for switching between sibling views use `Tabs` or `SegmentedTabs`.
 * It has NO default `aria-label`: the app must pass a localised one (e.g. `aria-label="Brotkrumen"`).
 * Compose it as `Breadcrumb` > `BreadcrumbList` > `BreadcrumbItem`s holding a `BreadcrumbLink`
 * (ancestors) or a `BreadcrumbPage` (the current page), with `BreadcrumbSeparator` between them.
 *
 * @summary Navigation trail to the current page; the app must supply a localised aria-label.
 */
function Breadcrumb({ ...props }: React.ComponentPropsWithoutRef<'nav'>) {
    // No default aria-label — the caller (AdminBreadcrumbs) MUST pass a
    // localized one. If we baked in `aria-label="Breadcrumb"` here the
    // English label would silently win in non-EN locales whenever the
    // caller forgot to override.
    return <nav data-slot="breadcrumb" {...props} />;
}

/** The ordered list (`<ol>`) that wraps the items; wraps onto several lines on narrow screens. */
function BreadcrumbList({ className, ...props }: React.ComponentPropsWithoutRef<'ol'>) {
    return (
        <ol
            data-slot="breadcrumb-list"
            className={cn(
                'flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5',
                className,
            )}
            {...props}
        />
    );
}

/** One entry (`<li>`) of the trail; holds a link, the current page or an ellipsis. */
function BreadcrumbItem({ className, ...props }: React.ComponentPropsWithoutRef<'li'>) {
    return (
        <li
            data-slot="breadcrumb-item"
            className={cn('inline-flex items-center gap-1.5', className)}
            {...props}
        />
    );
}

type BreadcrumbLinkProps = React.ComponentPropsWithoutRef<'a'> & {
    /** Style your own link element (the single child, e.g. a router `Link`) instead of rendering an `<a>`. */
    asChild?: boolean;
};

/** A link to an ancestor page. Use `asChild` to render your router's link component. */
function BreadcrumbLink({ className, asChild, children, ...props }: BreadcrumbLinkProps) {
    if (asChild) {
        const child = React.Children.only(children) as React.ReactElement<{ className?: string }>;
        return React.cloneElement(child, {
            className: cn(
                'rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center',
                child.props.className,
                className,
            ),
        });
    }
    return (
        <a
            data-slot="breadcrumb-link"
            className={cn(
                'rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:min-w-11 pointer-coarse:items-center pointer-coarse:justify-center',
                className,
            )}
            {...props}
        >
            {children}
        </a>
    );
}

/** The current page: plain text marked `aria-current="page"`, not a link. Put it last. */
function BreadcrumbPage({ className, ...props }: React.ComponentPropsWithoutRef<'span'>) {
    // Plain text + aria-current="page" — shadcn's default carries
    // `role="link" aria-disabled="true"`, but NVDA / JAWS / VoiceOver
    // announce that as "disabled link, current page" which is confusing
    // for the current-page anchor. WCAG 4.1.2: name/role/value must be
    // the simplest accurate combination. See audits/2026-05-25
    // /ACCESSIBILITY_AUDIT.md (HIGH H1).
    return (
        <span
            data-slot="breadcrumb-page"
            aria-current="page"
            className={cn('font-medium text-foreground', className)}
            {...props}
        />
    );
}

/** The divider between two items (decorative, hidden from assistive tech); defaults to a chevron, pass children to replace it. */
function BreadcrumbSeparator({
    children,
    className,
    ...props
}: React.ComponentPropsWithoutRef<'li'>) {
    return (
        <li
            data-slot="breadcrumb-separator"
            role="presentation"
            aria-hidden="true"
            className={cn('[&>svg]:size-3.5', className)}
            {...props}
        >
            {children ?? <ChevronRight />}
        </li>
    );
}

/** A "…" placeholder standing in for collapsed middle levels of a long trail. */
function BreadcrumbEllipsis({
    className,
    srLabel,
    ...props
}: React.ComponentPropsWithoutRef<'span'> & {
    /** Screen-reader text for the collapsed levels, e.g. `Weitere Ebenen`; required and localised by the app. */
    srLabel: string;
}) {
    // `srLabel` is REQUIRED so the caller (AdminBreadcrumbs) provides a
    // localized announcement. The outer wrapper drops `aria-hidden` —
    // an aria-hidden parent swallows the sr-only child on every AT.
    // Decorative state on the icon only.
    return (
        <span
            data-slot="breadcrumb-ellipsis"
            role="presentation"
            className={cn('flex h-9 w-9 items-center justify-center', className)}
            {...props}
        >
            <MoreHorizontal aria-hidden="true" className="size-4" />
            <span className="sr-only">{srLabel}</span>
        </span>
    );
}

export {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
};
