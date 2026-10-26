import * as React from 'react';
import { Separator as SeparatorPrimitive } from 'radix-ui';
/**
 * A thin rule that divides groups of content, horizontally (default) or
 * vertically. It is `decorative` by default (hidden from assistive tech); pass
 * `decorative={false}` to expose it as a `separator` role when the division carries
 * meaning. A vertical separator needs a parent with a height (e.g. a flex row).
 *
 * @summary Thin horizontal or vertical divider line between groups of content.
 */
declare const Separator: React.ForwardRefExoticComponent<Omit<SeparatorPrimitive.SeparatorProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Separator };
