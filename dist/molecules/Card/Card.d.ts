import * as React from 'react';
/**
 * The panel surface: a rounded, ringed container for a self-contained group of content.
 * Compose it from `CardHeader` (with `CardTitle`, `CardDescription`, `CardAction`),
 * `CardContent` and `CardFooter`, using only the parts you need. For a single number with a
 * label use `StatCard`; for a "nothing here yet" panel use `EmptyState`.
 *
 * @summary Panel surface composed from header, content and footer parts.
 */
declare function Card({ className, size, ...props }: React.ComponentProps<'div'> & {
    /** `default` uses normal padding; `sm` tightens padding and gaps for dense lists and dashboards. */
    size?: 'default' | 'sm';
}): React.JSX.Element;
/** The top section: holds `CardTitle`, `CardDescription` and an optional `CardAction`. */
declare function CardHeader({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
/** The card's heading. It renders a `div`, not a heading element; add a role or heading tag yourself if the page outline needs one. */
declare function CardTitle({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
/** Muted supporting text under the title. */
declare function CardDescription({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
/** A control (button, menu) pinned to the top-right of the header, beside the title. */
declare function CardAction({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
/** The main body of the card, with horizontal padding matching the header. */
declare function CardContent({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
/** The bottom strip with a top border and a muted background; typically holds the card's buttons. */
declare function CardFooter({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
