import * as React from 'react';
import { Separator as SeparatorPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

/**
 * A thin rule that divides groups of content, horizontally (default) or
 * vertically. It is `decorative` by default (hidden from assistive tech); pass
 * `decorative={false}` to expose it as a `separator` role when the division carries
 * meaning. A vertical separator needs a parent with a height (e.g. a flex row).
 *
 * @summary Thin horizontal or vertical divider line between groups of content.
 */
const Separator = React.forwardRef<
    React.ElementRef<typeof SeparatorPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(function Separator({ className, orientation = 'horizontal', decorative = true, ...props }, ref) {
    return (
        <SeparatorPrimitive.Root
            ref={ref}
            data-slot="separator"
            decorative={decorative}
            orientation={orientation}
            className={cn(
                'shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
                className,
            )}
            {...props}
        />
    );
});
Separator.displayName = 'Separator';

export { Separator };
