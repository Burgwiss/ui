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
declare function Breadcrumb({ ...props }: React.ComponentPropsWithoutRef<'nav'>): React.JSX.Element;
/** The ordered list (`<ol>`) that wraps the items; wraps onto several lines on narrow screens. */
declare function BreadcrumbList({ className, ...props }: React.ComponentPropsWithoutRef<'ol'>): React.JSX.Element;
/** One entry (`<li>`) of the trail; holds a link, the current page or an ellipsis. */
declare function BreadcrumbItem({ className, ...props }: React.ComponentPropsWithoutRef<'li'>): React.JSX.Element;
type BreadcrumbLinkProps = React.ComponentPropsWithoutRef<'a'> & {
    /** Style your own link element (the single child, e.g. a router `Link`) instead of rendering an `<a>`. */
    asChild?: boolean;
};
/** A link to an ancestor page. Use `asChild` to render your router's link component. */
declare function BreadcrumbLink({ className, asChild, children, ...props }: BreadcrumbLinkProps): React.JSX.Element;
/** The current page: plain text marked `aria-current="page"`, not a link. Put it last. */
declare function BreadcrumbPage({ className, ...props }: React.ComponentPropsWithoutRef<'span'>): React.JSX.Element;
/** The divider between two items (decorative, hidden from assistive tech); defaults to a chevron, pass children to replace it. */
declare function BreadcrumbSeparator({ children, className, ...props }: React.ComponentPropsWithoutRef<'li'>): React.JSX.Element;
/** A "…" placeholder standing in for collapsed middle levels of a long trail. */
declare function BreadcrumbEllipsis({ className, srLabel, ...props }: React.ComponentPropsWithoutRef<'span'> & {
    /** Screen-reader text for the collapsed levels, e.g. `Weitere Ebenen`; required and localised by the app. */
    srLabel: string;
}): React.JSX.Element;
export { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, };
